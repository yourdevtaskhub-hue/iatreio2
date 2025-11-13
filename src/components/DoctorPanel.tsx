import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';
import { Appointment } from '../types/appointments';
// no timezone utilities needed here
import { usePayments } from '../hooks/usePayments';

interface DoctorPanelProps {
  doctorName: string;
  doctorId: string;
  language: 'gr' | 'en';
  onLogout?: () => void;
}

const DoctorPanel: React.FC<DoctorPanelProps> = ({ doctorName, doctorId, language, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'wallet' | 'manualDeposits'>('appointments');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [doctorRecordId, setDoctorRecordId] = useState<string | null>(null);
  const [manualDeposits, setManualDeposits] = useState<any[]>([]);
  const [manualDepositsLoading, setManualDepositsLoading] = useState(false);
  const [manualDepositsPage, setManualDepositsPage] = useState(1);
  const manualDepositsPerPage = 5;
  
  // Use payments hook for wallet data
  const { payments, stats, refetch: refetchPayments } = usePayments(doctorName);

  const content = {
    gr: {
      title: `Panel ${doctorName}`,
      subtitle: 'Διαχείριση ραντεβού',
      appointments: 'Ραντεβού',
      wallet: 'Το Ταμείο μου',
      noAppointments: 'Δεν υπάρχουν ραντεβού',
      loading: 'Φόρτωση...',
      logout: 'Αποσύνδεση',
      date: 'Ημερομηνία',
      time: 'Ώρα',
      parentName: 'Όνομα Γονέα',
      childAge: 'Ηλικία Παιδιού',
      phone: 'Τηλέφωνο',
      email: 'Email',
      specialty: 'Ειδικότητα',
      thematology: 'Θεματολογία',
      urgency: 'Επείγον',
      firstSession: 'Πρώτη Συνεδρία',
      concerns: 'Ανησυχίες',
      // Wallet content
      totalEarnings: 'Συνολικά Έσοδα',
      thisMonth: 'Αυτόν τον Μήνα',
      lastMonth: 'Προηγούμενος Μήνας',
      totalSessions: 'Συνολικές Συνεδρίες',
      completedSessions: 'Ολοκληρωμένες',
      pendingSessions: 'Εκκρεμείς',
      averageSession: 'Μέσο Εισόδημα/Συνεδρία',
      recentTransactions: 'Πρόσφατες Συναλλαγές',
      sessionFee: 'Αμοιβή Συνεδρίας',
      totalAmount: 'Συνολικό Ποσό',
      status: 'Κατάσταση',
      completed: 'Ολοκληρώθηκε',
      pending: 'Εκκρεμεί',
      actions: 'Ενέργειες',
      noTransactions: 'Δεν υπάρχουν συναλλαγές',
      manualDepositsTab: 'Κατάθεση-Κουμπί',
      manualDepositsTitle: 'Καταθέσεις μέσω κουμπιού',
      manualDepositsSubtitle: 'Καταχωρήσεις από το δημόσιο κουμπί «Κατάθεση».',
      manualDepositsEmpty: 'Δεν υπάρχουν καταθέσεις προς εμφάνιση.',
      manualDepositsRefresh: 'Ανανέωση καταθέσεων',
      manualDepositColumns: {
        createdAt: 'Ημερομηνία',
        parent: 'Γονέας',
        sessions: 'Συνεδρίες',
        amount: 'Ποσό',
        status: 'Κατάσταση',
        notes: 'Σημειώσεις'
      },
      markCompleted: 'Σήμανση ως ολοκληρωμένο',
      statusPendingCheckout: 'Σε εξέλιξη',
      statusCheckoutFailed: 'Απέτυχε',
      statusPending: 'Εκκρεμεί',
      statusCompleted: 'Ολοκληρώθηκε',
      deleteAction: 'Διαγραφή',
      deleteConfirm: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την καταχώρηση;'
    },
    en: {
      title: `${doctorName} Panel`,
      subtitle: 'Manage appointments',
      appointments: 'Appointments',
      wallet: 'My Wallet',
      noAppointments: 'No appointments found',
      loading: 'Loading...',
      logout: 'Logout',
      date: 'Date',
      time: 'Time',
      parentName: 'Parent Name',
      childAge: 'Child Age',
      phone: 'Phone',
      email: 'Email',
      specialty: 'Specialty',
      thematology: 'Thematology',
      urgency: 'Urgency',
      firstSession: 'First Session',
      concerns: 'Concerns',
      // Wallet content
      totalEarnings: 'Total Earnings',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      totalSessions: 'Total Sessions',
      completedSessions: 'Completed',
      pendingSessions: 'Pending',
      averageSession: 'Average per Session',
      recentTransactions: 'Recent Transactions',
      sessionFee: 'Session Fee',
      totalAmount: 'Total Amount',
      status: 'Status',
      completed: 'Completed',
      pending: 'Pending',
      actions: 'Actions',
      noTransactions: 'No transactions found',
      manualDepositsTab: 'Deposit Button',
      manualDepositsTitle: 'Manual Deposits',
      manualDepositsSubtitle: 'Entries submitted via the public “Deposit” button.',
      manualDepositsEmpty: 'No manual deposits to display.',
      manualDepositsRefresh: 'Refresh deposits',
      manualDepositColumns: {
        createdAt: 'Date',
        parent: 'Parent',
        sessions: 'Sessions',
        amount: 'Amount',
        status: 'Status',
        notes: 'Notes'
      },
      markCompleted: 'Mark as completed',
      statusPendingCheckout: 'Processing',
      statusCheckoutFailed: 'Failed',
      statusPending: 'Pending',
      statusCompleted: 'Completed',
      deleteAction: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this entry?'
    }
  };


  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Βρίσκουμε τον γιατρό με βάση το όνομα
      const { data: doctorData, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('name', doctorName)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor:', doctorError);
        setAppointments([]);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      if (!doctorData) {
        console.log('Doctor not found:', doctorName);
        setAppointments([]);
        setLoading(false);
        return;
      }

      setDoctorRecordId(doctorData.id);

      const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(`
          id, date, time, email, phone, parent_name, child_age, 
          concerns, specialty, thematology, urgency, is_first_session,
          doctors(name, specialty)
        `)
        .eq('doctor_id', doctorData.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
        setCurrentPage(1);
      } else {
        setAppointments(data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Set up real-time subscription for appointments
    const channel = supabaseAdmin
      .channel(`doctor_appointments_${doctorName.replace(/\s+/g, '_')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload: any) => {
          console.log(`Doctor ${doctorName}: Appointment change detected:`, payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, [doctorId, doctorName]);

  useEffect(() => {
    if (doctorRecordId) {
      fetchManualDeposits(doctorRecordId);
    }
  }, [doctorRecordId]);


  const handleRefresh = () => {
    fetchAppointments();
    refetchPayments();
    fetchManualDeposits();
  };

  // Format payments for display
  const formatPayments = (payments: any[]) => {
    return payments.map(payment => ({
      id: payment.id,
      date: payment.appointment_date,
      time: payment.appointment_time,
      parentName: payment.parent_name,
      sessionFee: Math.round(payment.amount_cents / 100), // Convert cents to euros
      status: payment.status
    }));
  };

  const parseManualDepositNotes = (notes: string | null | undefined) => {
    if (!notes) {
      return { userNotes: '', sessions: [] as string[] };
    }

    try {
      const parsed = JSON.parse(notes);
      if (parsed && Array.isArray(parsed.schedules)) {
        const sessions = parsed.schedules
          .map((item: any, idx: number) => {
            const date = (item?.date || '').toString().trim();
            const time = (item?.time || '').toString().trim();
            if (!date || !time) return null;
            return `Session ${idx + 1}: ${date} ${time}`;
          })
          .filter(Boolean) as string[];
        const userNotes = typeof parsed.userNotes === 'string' ? parsed.userNotes.trim() : '';
        return { userNotes, sessions };
      }
    } catch {
      // fallback
    }

    const sessionRegex = /Session\s*\d+:[^|\n]+/gi;
    const sessions = (notes.match(sessionRegex) || []).map(s => s.replace(/\s+/g, ' ').trim());
    let userNotes = notes;
    sessions.forEach(session => {
      userNotes = userNotes.replace(session, '');
    });
    userNotes = userNotes.replace(/\|\s*/g, ' ').replace(/\s+/g, ' ').trim();
    return { userNotes, sessions };
  };

  const manualDepositStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_checkout':
        return content[language].statusPendingCheckout;
      case 'completed':
        return content[language].statusCompleted;
      case 'checkout_failed':
        return content[language].statusCheckoutFailed;
      default:
        return content[language].statusPending;
    }
  };

  const manualDepositStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'checkout_failed':
        return 'bg-red-100 text-red-700';
      case 'pending_checkout':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const fetchManualDeposits = async (targetDoctorId?: string) => {
    const resolvedDoctorId = targetDoctorId || doctorRecordId;
    if (!resolvedDoctorId) return;

    try {
      setManualDepositsLoading(true);
      const { data, error } = await supabaseAdmin
        .from('manual_deposit_requests')
        .select('*')
        .eq('doctor_id', resolvedDoctorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enhanced = (data || []).map((entry: any) => ({
        ...entry,
        _parsedNotes: parseManualDepositNotes(entry.notes)
      }));
      setManualDeposits(enhanced);
      setManualDepositsPage(1);
    } catch (error) {
      console.error('Error fetching manual deposits:', error);
    } finally {
      setManualDepositsLoading(false);
    }
  };

  const updateManualDepositStatus = async (id: string, nextStatus: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('manual_deposit_requests')
        .update({ status: nextStatus })
        .eq('id', id);
      if (error) throw error;

      setManualDeposits(prev =>
        prev.map(entry =>
          entry.id === id ? { ...entry, status: nextStatus } : entry
        )
      );
    } catch (error) {
      console.error('Error updating manual deposit status:', error);
    }
  };

  const deleteManualDeposit = async (id: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('manual_deposit_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setManualDeposits(prev => {
        const next = prev.filter(entry => entry.id !== id);
        const totalPages = Math.max(1, Math.ceil(next.length / manualDepositsPerPage));
        setManualDepositsPage(current => Math.min(current, totalPages));
        return next;
      });
    } catch (error) {
      console.error('Error deleting manual deposit:', error);
    }
  };

  const manualDepositsTotalPages = Math.max(1, Math.ceil(manualDeposits.length / manualDepositsPerPage));
  const manualDepositsStart = (manualDepositsPage - 1) * manualDepositsPerPage;
  const manualDepositsEnd = manualDepositsStart + manualDepositsPerPage;
  const paginatedManualDeposits = manualDeposits.slice(manualDepositsStart, manualDepositsEnd);
  const manualDepositPaginationLabels = language === 'gr'
    ? {
        range: (start: number, end: number, total: number) => `Εμφάνιση ${start}-${end} από ${total} καταθέσεις`,
        prev: 'Προηγούμενη',
        next: 'Επόμενη'
      }
    : {
        range: (start: number, end: number, total: number) => `Showing ${start}-${end} of ${total} deposits`,
        prev: 'Previous',
        next: 'Next'
      };

  const totalPages = Math.max(1, Math.ceil(appointments.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = appointments.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    const maxPage = Math.max(1, Math.ceil(appointments.length / itemsPerPage));
    setCurrentPage(prev => Math.min(prev + 1, maxPage));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🏥 Header Section - Βελτιωμένο */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6">
                  <span className="text-white text-2xl">👩‍⚕️</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2 font-poppins">
                    {content[language].title}
                  </h1>
                  <p className="text-xl text-gray-600 font-nunito">
                    {content[language].subtitle}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="font-medium">Real-time ενημερώσεις ενεργές</span>
                  </div>
                </div>
              </div>
              {onLogout && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all flex items-center space-x-2 shadow-lg transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-semibold">{content[language].logout}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* 🔄 Refresh Button & Tabs - Βελτιωμένο */}
        <div className="mb-6 flex justify-between items-center">
          {/* Tabs */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'appointments'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              📅 {content[language].appointments}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              💰 {content[language].wallet}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('manualDeposits')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'manualDeposits'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🧾 {content[language].manualDepositsTab}
            </motion.button>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-lg"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-semibold">🔄 Ανανέωση</span>
          </motion.button>
        </div>

        {/* Conditional Content based on active tab */}
        {activeTab === 'appointments' ? (
          /* 📅 Appointments Section - Πλήρως Ανασχεδιασμένο */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📅</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-poppins">
                    {content[language].appointments}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {appointments.length} {appointments.length === 1 ? 'ραντεβού' : 'ραντεβού'} συνολικά
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <p className="text-gray-600 font-nunito text-lg">{content[language].loading}</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-gray-400 text-3xl">📅</span>
                </div>
                <p className="text-gray-600 font-nunito text-xl mb-2">{content[language].noAppointments}</p>
                <p className="text-gray-500 text-sm">Τα νέα ραντεβού θα εμφανίζονται εδώ αυτόματα</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          📅 {content[language].date}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          🕘 {content[language].time}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          👨‍👩‍👧‍👦 {content[language].parentName}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          👶 {content[language].childAge}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          📞 {content[language].phone}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          ✉️ {content[language].email}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          🏥 {content[language].specialty}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          ⚡ {content[language].urgency}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 font-poppins">
                          🆕 {content[language].firstSession}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentAppointments.map((appointment: any, index: number) => (
                        <motion.tr
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="hover:bg-blue-50 transition-all duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-semibold font-nunito">
                              {appointment.date}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg text-sm font-semibold font-nunito">
                              {appointment.time}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-800 font-poppins text-lg">
                              {appointment.parent_name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-semibold font-nunito">
                              {appointment.child_age || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 font-nunito">
                              {appointment.phone || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 font-nunito">
                              {appointment.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm font-semibold font-nunito">
                              {appointment.specialty || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`px-3 py-2 rounded-lg text-sm font-semibold font-nunito ${
                              appointment.urgency === 'Άμεσο' 
                                ? 'bg-red-100 text-red-800' 
                                : appointment.urgency === 'Κανονικό'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.urgency || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`px-3 py-2 rounded-lg text-sm font-semibold font-nunito ${
                              appointment.is_first_session 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.is_first_session ? 'Ναι' : 'Όχι'}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs sm:text-sm text-gray-500">
                      Εμφάνιση {startIndex + 1}-{Math.min(endIndex, appointments.length)} από {appointments.length} κρατήσεις
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Προηγούμενη
                      </button>
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-md font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Επόμενη
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : activeTab === 'wallet' ? (
          /* 💰 Wallet Section - Εξαιρετικό UI */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* 💰 Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Earnings */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm font-medium">{content[language].totalEarnings}</p>
                    <p className="text-3xl font-bold">€{Math.round(stats.totalEarnings / 100).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              {/* This Month */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">{content[language].thisMonth}</p>
                    <p className="text-3xl font-bold">€{Math.round(stats.thisMonth / 100).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              {/* Total Sessions */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 text-sm font-medium">{content[language].totalSessions}</p>
                    <p className="text-3xl font-bold">{stats.totalSessions}</p>
                  </div>
                </div>
              </motion.div>

              {/* Average per Session */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-100 text-sm font-medium">{content[language].averageSession}</p>
                    <p className="text-3xl font-bold">€{Math.round(stats.averageSession / 100)}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 📈 Session Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-green-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{content[language].completedSessions}</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-yellow-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-yellow-600 text-xl">⏳</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{content[language].pendingSessions}</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingSessions}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 📋 Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white font-poppins">
                      {content[language].recentTransactions}
                    </h2>
                    <p className="text-gray-100 text-sm">
                      {payments.length} {content[language].recentTransactions.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-2xl">📋</span>
                    </div>
                    <p className="text-gray-600 font-nunito text-lg">{content[language].noTransactions}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formatPayments(payments).map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            <span className="text-xl">
                              {transaction.status === 'completed' ? '✅' : '⏳'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{transaction.parentName}</h4>
                            <p className="text-sm text-gray-600">{transaction.date} - {transaction.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">€{transaction.sessionFee}</p>
                          <p className={`text-sm font-medium ${
                            transaction.status === 'completed' 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                          }`}>
                            {transaction.status === 'completed' ? content[language].completed : content[language].pending}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-poppins">
                  {content[language].manualDepositsTitle}
                </h2>
                <p className="text-purple-100 text-sm font-nunito">
                  {content[language].manualDepositsSubtitle}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchManualDeposits()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>{content[language].manualDepositsRefresh}</span>
              </motion.button>
            </div>

            <div className="p-6">
              {manualDepositsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-4" />
                  <p className="text-sm text-gray-500 font-nunito">{content[language].loading}</p>
                </div>
              ) : manualDeposits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🧾</span>
                  </div>
                  <p className="text-gray-700 font-nunito text-lg">{content[language].manualDepositsEmpty}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">{content[language].manualDepositColumns.createdAt}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">{content[language].manualDepositColumns.parent}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">{content[language].manualDepositColumns.sessions}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">{content[language].manualDepositColumns.amount}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">{content[language].manualDepositColumns.status}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">{content[language].manualDepositColumns.notes}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">{content[language].actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedManualDeposits.map((entry: any) => (
                        <tr key={entry.id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-4 py-3 text-gray-700">
                            {entry.created_at
                              ? new Date(entry.created_at).toLocaleString(
                                  language === 'gr' ? 'el-GR' : 'en-GB',
                                  { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                                )
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div className="font-semibold text-gray-900">{entry.parent_name}</div>
                            <div className="text-xs text-gray-500">{entry.parent_email}</div>
                            {entry.parent_phone ? (
                              <div className="text-xs text-gray-500">{entry.parent_phone}</div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{entry.session_count || 0}</td>
                          <td className="px-4 py-3 text-gray-700 font-semibold">€{entry.amount_cents ? (entry.amount_cents / 100).toFixed(2) : '0.00'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${manualDepositStatusBadge(entry.status)}`}>
                              {manualDepositStatusLabel(entry.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {entry._parsedNotes?.userNotes ? (
                              <p className="mb-2 whitespace-pre-line">{entry._parsedNotes.userNotes}</p>
                            ) : null}
                            {entry._parsedNotes?.sessions?.length ? (
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {entry._parsedNotes.sessions.map((session: string) => (
                                  <li key={session}>{session}</li>
                                ))}
                              </ul>
                            ) : null}
                            {!entry._parsedNotes?.userNotes && !(entry._parsedNotes?.sessions?.length) && <span>—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              {entry.status !== 'completed' && (
                                <button
                                  onClick={() => updateManualDepositStatus(entry.id, 'completed')}
                                  className="px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold"
                                >
                                  {content[language].markCompleted}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(content[language].deleteConfirm)) {
                                    deleteManualDeposit(entry.id);
                                  }
                                }}
                                className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold"
                              >
                                {content[language].deleteAction}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {manualDeposits.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-500 font-nunito">
                  {manualDepositPaginationLabels.range(
                    manualDepositsStart + 1,
                    Math.min(manualDepositsEnd, manualDeposits.length),
                    manualDeposits.length
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setManualDepositsPage(prev => Math.max(prev - 1, 1))}
                    disabled={manualDepositsPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {manualDepositPaginationLabels.prev}
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 font-semibold">
                    {manualDepositsPage} / {manualDepositsTotalPages}
                  </span>
                  <button
                    onClick={() => setManualDepositsPage(prev => Math.min(prev + 1, manualDepositsTotalPages))}
                    disabled={manualDepositsPage === manualDepositsTotalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {manualDepositPaginationLabels.next}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default DoctorPanel;
