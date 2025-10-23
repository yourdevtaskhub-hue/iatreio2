import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../lib/supabase';

export interface Payment {
  id: string;
  stripe_payment_intent_id: string;
  stripe_session_id: string;
  doctor_id: string;
  doctor_name: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  parent_name: string;
  parent_email: string;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
  updated_at: string;
}

export interface WalletStats {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  averageSession: number;
}

export const usePayments = (doctorName: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    averageSession: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get doctor ID first
      const { data: doctorData, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('name', doctorName)
        .single();

      if (doctorError || !doctorData) {
        throw new Error('Doctor not found');
      }

      // Fetch payments for this doctor
      const { data: paymentsData, error: paymentsError } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('doctor_id', doctorData.id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        throw paymentsError;
      }

      setPayments(paymentsData || []);

      // Calculate stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const totalEarnings = paymentsData
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      const thisMonthEarnings = paymentsData
        ?.filter(p => p.status === 'completed' && new Date(p.created_at) >= thisMonth)
        .reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      const lastMonthEarnings = paymentsData
        ?.filter(p => p.status === 'completed' && 
          new Date(p.created_at) >= lastMonth && 
          new Date(p.created_at) <= lastMonthEnd)
        .reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      const totalSessions = paymentsData?.length || 0;
      const completedSessions = paymentsData?.filter(p => p.status === 'completed').length || 0;
      const pendingSessions = paymentsData?.filter(p => p.status === 'pending').length || 0;
      const averageSession = completedSessions > 0 ? totalEarnings / completedSessions : 0;

      setStats({
        totalEarnings,
        thisMonth: thisMonthEarnings,
        lastMonth: lastMonthEarnings,
        totalSessions,
        completedSessions,
        pendingSessions,
        averageSession
      });

    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorName) {
      fetchPayments();
    }
  }, [doctorName]);

  return {
    payments,
    stats,
    loading,
    error,
    refetch: fetchPayments
  };
};
