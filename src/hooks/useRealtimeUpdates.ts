import { useEffect, useState } from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { Appointment } from '../types/appointments';

interface UseRealtimeUpdatesProps {
  doctorName?: string;
  onAppointmentChange?: (appointments: Appointment[]) => void;
}

export const useRealtimeUpdates = ({ doctorName, onAppointmentChange }: UseRealtimeUpdatesProps = {}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    try {
      let query = supabaseAdmin
        .from('appointments')
        .select(`
          id, date, time, email, phone, parent_name, child_age, 
          concerns, specialty, thematology, urgency, is_first_session,
          doctors(name, specialty)
        `)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      // Αν δόθηκε doctorName, φιλτράρουμε για συγκεκριμένο γιατρό
      if (doctorName) {
        const { data: doctorData } = await supabaseAdmin
          .from('doctors')
          .select('id')
          .eq('name', doctorName)
          .single();

        if (doctorData) {
          query = query.eq('doctor_id', doctorData.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      const appointmentsData = data || [];
      setAppointments(appointmentsData);
      onAppointmentChange?.(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAppointments();

    // Set up real-time subscription
    const channel = supabaseAdmin
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Appointment change detected:', payload);
          // Refetch appointments when any change occurs
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, [doctorName]);

  return {
    appointments,
    refetch: fetchAppointments
  };
};
