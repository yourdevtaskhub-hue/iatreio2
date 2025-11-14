import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Loader2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminSettings, Doctor, SlotInfo } from '../types/appointments';
import { getCurrentDateInTimezone, getUserTimezone, toDateString } from '../lib/timezone';
import { bookAppointmentUsingDeposit, DepositBookingPayload } from '../lib/deposit-booking';
import { getLocalizedClosureReason } from '../utils/closureReason';

interface DepositEntry {
  doctor_id: string;
  remaining_sessions: number;
  doctors?: {
    name: string;
    specialty?: string;
  };
}

interface DepositSchedulerProps {
  deposits: DepositEntry[];
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  onBookingCompleted?: () => void;
  language?: 'gr' | 'en' | 'fr';
}

interface ClosureNotice {
  from: string;
  to: string;
  reason?: string;
}

const DepositScheduler: React.FC<DepositSchedulerProps> = ({
  deposits,
  parentName,
  parentEmail,
  parentPhone,
  onBookingCompleted,
  language = 'gr'
}) => {
  const translate = useMemo(
    () => (gr: string, en: string, fr: string) => {
      if (language === 'en') return en;
      if (language === 'fr') return fr;
      return gr;
    },
    [language]
  );

  const depositsWithBalance = useMemo(
    () => deposits.filter((d) => Number(d.remaining_sessions) > 0),
    [deposits]
  );
  const hasAvailableDeposits = depositsWithBalance.length > 0;

  const doctorIds = useMemo(
    () => depositsWithBalance.map((d) => d.doctor_id),
    [depositsWithBalance]
  );

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    depositsWithBalance[0]?.doctor_id || ''
  );
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [closureNotice, setClosureNotice] = useState<ClosureNotice | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (depositsWithBalance.length === 0) {
      setSelectedDoctorId('');
    } else if (!doctorIds.includes(selectedDoctorId)) {
      setSelectedDoctorId(depositsWithBalance[0].doctor_id);
    }
  }, [depositsWithBalance, doctorIds, selectedDoctorId]);

  useEffect(() => {
    const loadData = async () => {
      if (doctorIds.length === 0) {
        setDoctors([]);
        return;
      }

      const [{ data: doctorRows }, { data: settingsRow }] = await Promise.all([
        supabase.from('doctors').select('*').in('id', doctorIds),
        supabase.from('admin_settings').select('*').eq('id', 1).single()
      ]);

      setDoctors(doctorRows || []);
      setSettings(settingsRow as AdminSettings | null);
    };

    loadData();
  }, [doctorIds]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !selectedDoctorId) {
        setSlots([]);
        setClosureNotice(null);
        return;
      }

      setIsLoadingSlots(true);
      setError(null);

      try {
        const [{ data: closures }, { data: availability }, { data: booked }] = await Promise.all([
          supabase
            .from('clinic_closures')
            .select('doctor_id,date_from,date_to,reason')
            .or(`doctor_id.eq.${selectedDoctorId},doctor_id.is.null`)
            .lte('date_from', selectedDate)
            .gte('date_to', selectedDate),
          supabase
            .from('availability')
            .select('start_time,end_time,increment_minutes')
            .eq('doctor_id', selectedDoctorId)
            .eq('date', selectedDate)
            .order('start_time'),
          supabase
            .from('appointments')
            .select('time')
            .eq('doctor_id', selectedDoctorId)
            .eq('date', selectedDate)
        ]);

        if (closures && closures.length > 0) {
          const c = closures[0];
          const localizedReason = getLocalizedClosureReason(c.reason, language);
          setClosureNotice({
            from: c.date_from,
            to: c.date_to,
            reason: localizedReason || undefined
          });
          setSlots([]);
          setSelectedTime('');
          return;
        }

        setClosureNotice(null);

        const bookedSet = new Set<string>(
          (booked || []).map((row: { time: string }) => (row.time || '').slice(0, 5))
        );

        const slotMap = new Map<string, SlotInfo>();
        (availability || []).forEach((row: any) => {
          if (!row?.start_time || !row?.end_time || !row?.increment_minutes) return;
          const [startHour, startMinute] = row.start_time.split(':').map(Number);
          const [endHour, endMinute] = row.end_time.split(':').map(Number);
          let current = startHour * 60 + startMinute;
          const end = endHour * 60 + endMinute;
          const step = row.increment_minutes as 30 | 60;
          if (step !== 30 && step !== 60) return;

          while (current < end) {
            const hh = Math.floor(current / 60).toString().padStart(2, '0');
            const mm = (current % 60).toString().padStart(2, '0');
            const time = `${hh}:${mm}`;
            let available = !bookedSet.has(time);
            let reason: SlotInfo['reason'] | undefined = bookedSet.has(time)
              ? 'booked'
              : undefined;

            if (settings?.lock_half_hour) {
              const hourStart = `${hh}:00`;
              const half = `${hh}:30`;
              if (bookedSet.has(hourStart) || bookedSet.has(half)) {
                available = false;
                reason = 'locked';
              }
            }

            const existing = slotMap.get(time);
            if (existing) {
              slotMap.set(time, {
                time,
                available: existing.available || available,
                reason: existing.reason || reason
              });
            } else {
              slotMap.set(time, { time, available, reason });
            }

            current += step;
          }
        });

        const slotList = Array.from(slotMap.values()).sort((a, b) => a.time.localeCompare(b.time));
        setSlots(slotList);
        if (!slotList.some((slot) => slot.available && slot.time === selectedTime)) {
          setSelectedTime('');
        }
      } catch (fetchError: any) {
        console.error('Failed to fetch deposit slots:', fetchError);
        setError(translate('Αποτυχία φόρτωσης διαθεσιμότητας.', 'Failed to load availability.', 'Échec du chargement des disponibilités.'));
        setSlots([]);
        setSelectedTime('');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedDoctorId, selectedTime, settings, language]);

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId);
  const depositInfo = depositsWithBalance.find((d) => d.doctor_id === selectedDoctorId);
  const timezone = getUserTimezone();
  const today = toDateString(getCurrentDateInTimezone(timezone), timezone);

  const handleBooking = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedTime || !selectedDoctor) {
      setError(translate('Παρακαλώ επιλέξτε γιατρό, ημερομηνία και ώρα.', 'Please select doctor, date and time.', 'Veuillez sélectionner un médecin, une date et une heure.'));
      return;
    }

    setIsBooking(true);
    setError(null);
    setSuccess(null);

    const payload: DepositBookingPayload = {
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor.name,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      parentName,
      parentEmail,
      phone: parentPhone
    };

    try {
      const response = await bookAppointmentUsingDeposit(payload);
      setSuccess(response.message || translate('Η κράτηση ολοκληρώθηκε με επιτυχία.', 'Booking completed successfully.', 'Réservation effectuée avec succès.'));
      setSelectedDate('');
      setSelectedTime('');
      if (onBookingCompleted) {
        await onBookingCompleted();
      }
    } catch (bookingError: any) {
      console.error('Deposit booking failed:', bookingError);
      setError(bookingError?.message || translate('Η κράτηση απέτυχε.', 'The booking failed.', 'La réservation a échoué.'));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-white rounded-2xl shadow-xl border border-purple-100 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-soft to-blue-soft text-white shadow-lg">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-800 font-poppins">
            {translate('Κλείστε Ραντεβού με το Deposit σας', 'Book an Appointment with Your Deposit', 'Réservez avec votre dépôt')}
          </h4>
          <p className="text-sm text-gray-600 font-nunito">
            {translate(
              'Χρησιμοποιήστε τις διαθέσιμες συνεδρίες σας για να κλείσετε άμεσα ραντεβού.',
              'Use your available sessions to schedule instantly.',
              'Utilisez vos séances disponibles pour réserver immédiatement.'
            )}
          </p>
        </div>
      </div>

      {!hasAvailableDeposits && (
        <div className="mb-4 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border border-purple-100 rounded-2xl p-4 text-sm text-gray-700 font-nunito">
          {translate(
            'Δεν έχετε διαθέσιμες συνεδρίες προς κράτηση. Αγοράστε προπληρωμένες συνεδρίες και επιστρέψτε εδώ για να κλείσετε το ραντεβού σας.',
            'You do not have sessions available for booking. Purchase prepaid sessions and return here to schedule your appointment.',
            'Vous n’avez pas de séances disponibles pour la réservation. Achetez des séances prépayées puis revenez ici pour planifier votre rendez-vous.'
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-quicksand mb-2">
            {translate('Γιατρός', 'Doctor', 'Médecin')}
          </label>
          <select
            value={selectedDoctorId}
            onChange={(event) => {
              setSelectedDoctorId(event.target.value);
              setSelectedDate('');
              setSelectedTime('');
            }}
            disabled={!hasAvailableDeposits}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 font-nunito disabled:bg-gray-100 disabled:text-gray-500"
          >
            {hasAvailableDeposits ? (
              depositsWithBalance.map((deposit) => (
                <option key={deposit.doctor_id} value={deposit.doctor_id}>
                  {deposit.doctors?.name || translate('Γιατρός', 'Doctor', 'Médecin')} — {deposit.remaining_sessions}{' '}
                  {translate('συνεδρίες', 'sessions', 'séances')}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {translate('Δεν υπάρχουν διαθέσιμες συνεδρίες', 'No sessions available', 'Aucune séance disponible')}
              </option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-quicksand mb-2">
            {translate('Ημερομηνία', 'Date', 'Date')}
          </label>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 font-nunito"
            style={{ direction: 'ltr' }}
            disabled={!hasAvailableDeposits}
          />
        </div>
      </div>

      {closureNotice && (
        <div className="mb-4 bg-gradient-to-r from-yellow-50 to-pink-50 border border-yellow-200 rounded-2xl p-4 text-sm text-gray-800 font-nunito">
          {translate('Το ιατρείο είναι κλειστό από ', 'The clinic is closed from ', 'La clinique est fermée du ')}
          <strong>{closureNotice.from}</strong>
          {translate(' έως ', ' to ', ' au ')}
          <strong>{closureNotice.to}</strong>.
          {closureNotice.reason && <span className="block mt-1">{closureNotice.reason}</span>}
        </div>
      )}

      {selectedDate && !closureNotice && hasAvailableDeposits && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-quicksand">
            {translate('Πράσινο διαθέσιμο, κόκκινο μη διαθέσιμο', 'Green available, red unavailable', 'Vert disponible, rouge indisponible')}
            </span>
            <span className="text-xs text-gray-500 font-quicksand">
            {translate('Υπόλοιπο:', 'Balance:', 'Solde :')} {depositInfo?.remaining_sessions ?? 0}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {isLoadingSlots ? (
              <div className="col-span-full flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="col-span-full text-sm text-gray-500 font-nunito">
                {translate('Δεν υπάρχουν διαθέσιμες ώρες για την ημερομηνία.', 'No time slots available for this date.', 'Aucun créneau disponible pour cette date.')}
              </div>
            ) : (
              slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  className={`px-3 py-2 rounded-xl text-center text-sm font-semibold border transition ${
                    slot.available
                      ? 'bg-green-100 text-green-800 hover:ring-2 hover:ring-green-400'
                      : 'bg-red-100 text-red-700 cursor-not-allowed'
                  } ${selectedTime === slot.time ? 'ring-2 ring-purple-400' : ''}`}
                >
                  {slot.time}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-nunito">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-nunito flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-yellow-700 font-nunito bg-yellow-50 rounded-xl px-3 py-2 border border-yellow-200">
          <Shield className="h-4 w-4" />
          <span>
            {translate('Με την κράτηση αφαιρείται αυτόματα 1 συνεδρία από το deposit σας.', 'Booking will automatically deduct one session from your deposit.', 'La réservation déduit automatiquement une séance de votre dépôt.')}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBooking}
          disabled={
            isBooking ||
            !selectedDoctorId ||
            !selectedDate ||
            !selectedTime ||
            !hasAvailableDeposits ||
            (depositInfo?.remaining_sessions || 0) <= 0
          }
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm shadow-md transition-all font-poppins ${
            isBooking ||
            !selectedDoctorId ||
            !selectedDate ||
            !selectedTime ||
            !hasAvailableDeposits ||
            (depositInfo?.remaining_sessions || 0) <= 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-soft to-blue-soft text-white hover:shadow-lg'
          }`}
        >
          {isBooking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{translate('Κράτηση...', 'Booking...', 'Réservation...')}</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span>{translate('Ολοκλήρωση Κράτησης', 'Complete Booking', 'Finaliser la réservation')}</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DepositScheduler;

