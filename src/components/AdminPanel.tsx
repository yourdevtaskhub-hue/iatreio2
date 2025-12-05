import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Eye, RefreshCw, DollarSign, TrendingUp, Users, Search, ChevronLeft, ChevronRight, X, Mail, Phone, User, Calendar, Info } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';
import { Review } from '../types/reviews';
import { Doctor, Availability, Appointment, AdminSettings, WaitingListEntry } from '../types/appointments';
import { parseClosureReason } from '../utils/closureReason';
import { getUserTimezone, toDateString, getCurrentDateInTimezone, convertTimeToTimezone, getDoctorTimezone, TIMEZONES } from '../lib/timezone';
import { normalizeDoctorOverrideKey } from '../config/stripe-doctor-overrides';
import { getCountryFlagFromTimezone, getCountryFlagTooltip } from '../lib/country-flags';

interface AdminPanelProps {
  language: 'gr' | 'en';
  onLogout?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ language, onLogout }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Appointments state
  const [activeTab, setActiveTab] = useState<'reviews' | 'appointments' | 'waitinglist' | 'wallet' | 'closures' | 'manualDeposits' | 'customers'>('reviews');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Wallet state
  const [payments, setPayments] = useState<any[]>([]);
  const [walletStats, setWalletStats] = useState({
    totalRevenue: 0,
    thisMonth: 0,
    lastMonth: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    averageSession: 0,
    anna: {
      totalRevenue: 0,
      thisMonth: 0,
      lastMonth: 0,
      totalSessions: 0,
      completedSessions: 0,
      pendingSessions: 0,
      averageSession: 0
    }
  });
  const [walletLoading, setWalletLoading] = useState(false);
  
  // Waiting list state
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [waitingListLoading, setWaitingListLoading] = useState(false);
  const [manualDeposits, setManualDeposits] = useState<any[]>([]);
  const [manualDepositsLoading, setManualDepositsLoading] = useState(false);
  const [manualDepositsPage, setManualDepositsPage] = useState(1);
  const manualDepositsPerPage = 5;
  const [fytrouManualDeposits, setFytrouManualDeposits] = useState<any[]>([]);
  const [fytrouDepositsPage, setFytrouDepositsPage] = useState(1);
  const [walletSearch, setWalletSearch] = useState('');
  
  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersSearch, setCustomersSearch] = useState('');
  const [customersPage, setCustomersPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedCustomerUser, setSelectedCustomerUser] = useState<any | null>(null);
  const customersPerPage = 10;

  const content = {
    gr: {
      title: 'Ιατρείο Panel - Διαχείριση Κριτικών',
      subtitle: 'Διαχειριστείτε τις αξιολογήσεις πελατών',
      pending: 'Εκκρεμείς',
      approved: 'Εγκεκριμένες',
      rejected: 'Απορριφθείσες',
      all: 'Όλες',
      name: 'Όνομα',
      rating: 'Αξιολόγηση',
      topic: 'Θέμα',
      text: 'Κείμενο',
      status: 'Κατάσταση',
      actions: 'Ενέργειες',
      approve: 'Έγκριση',
      reject: 'Απόρριψη',
      view: 'Προβολή',
      hide: 'Απόκρυψη',
      noReviews: 'Δεν υπάρχουν κριτικές',
      loading: 'Φόρτωση...',
      updated: 'Ενημερώθηκε επιτυχώς',
      error: 'Σφάλμα κατά την ενημέρωση',
      confirmApprove: 'Επιβεβαιώστε την έγκριση',
      confirmReject: 'Επιβεβαιώστε την απόρριψη',
      confirmApproveText: 'Θέλετε να εγκρίνετε αυτή την αξιολόγηση;',
      confirmRejectText: 'Θέλετε να απορρίψετε αυτή την αξιολόγηση;',
      yes: 'Ναι',
      no: 'Όχι',
      close: 'Κλείσιμο',
      createdAt: 'Δημιουργήθηκε',
      updatedAt: 'Ενημερώθηκε',
      logout: 'Αποσύνδεση',
      // Wallet content
      wallet: 'Το Ταμείο μου',
      totalRevenue: 'Συνολικά Έσοδα',
      thisMonth: 'Αυτόν τον Μήνα',
      lastMonth: 'Προηγούμενος Μήνας',
      totalSessions: 'Συνολικές Συνεδρίες',
      completedSessions: 'Ολοκληρωμένες',
      pendingSessions: 'Εκκρεμείς',
      averageSession: 'Μέσο Εισόδημα/Συνεδρία',
      annaLabel: 'Dr. Άννα Μαρία Φύτρου',
      annaRevenue: 'Έσοδα Δρ. Φύτρου',
      annaThisMonth: 'Μηνιαία έσοδα Δρ. Φύτρου',
      annaSessions: 'Συνεδρίες Δρ. Φύτρου',
      annaAverage: 'Μέσο ανά συνεδρία (Δρ. Φύτρου)',
      annaCompletedShort: 'Ολοκλ.',
      annaPendingShort: 'Εκκρ.',
      recentTransactions: 'Πρόσφατες Συναλλαγές',
      noTransactions: 'Δεν υπάρχουν συναλλαγές',
      // Waiting list content
      waitingList: 'Λίστα Αναμονής',
      waitingListTitle: 'Διαχείριση Λίστας Αναμονής',
      waitingListSubtitle: 'Αιτήματα εγγραφής στη λίστα αναμονής',
      noWaitingListEntries: 'Δεν υπάρχουν αιτήματα στη λίστα αναμονής',
      parentName: 'Όνομα Γονέα',
      email: 'Email',
      phone: 'Τηλέφωνο',
      preferredDate: 'Προτιμώμενη Ημερομηνία',
      preferredTime: 'Προτιμώμενη Ώρα',
      message: 'Μήνυμα',
      submittedAt: 'Υποβλήθηκε',
      refresh: 'Ανανέωση',
      manualDepositsTab: 'Κατάθεση-Κουμπί',
      manualDepositsTitle: 'Καταθέσεις μέσω κουμπιού',
      manualDepositsSubtitle: 'Κρατήσεις που προήλθαν από την επιλογή "Κατάθεση"',
      manualDepositsNoEntries: 'Δεν έχουν καταχωρηθεί καταθέσεις.',
      manualDepositsRefresh: 'Ανανέωση Λίστας',
      manualDepositColumns: {
        createdAt: 'Ημερομηνία',
        parent: 'Γονέας',
        doctor: 'Γιατρός',
        sessions: 'Συνεδρίες',
        amount: 'Ποσό',
        date: 'Ημ. συνεδρίας',
        time: 'Ώρα',
        status: 'Κατάσταση',
        paymentId: 'Payment ID',
        notes: 'Σημειώσεις'
      },
      manualDepositStatus: {
        pending: 'Εκκρεμεί',
        completed: 'Ολοκληρώθηκε',
        checkout_failed: 'Απέτυχε',
        pending_checkout: 'Σε εξέλιξη'
      },
      manualDepositActions: {
        markCompleted: 'Σήμανση ως ολοκληρωμένο',
        markPending: 'Επαναφορά σε εκκρεμότητα'
      }
    },
    en: {
      title: 'Ιατρείο Panel - Reviews Management',
      subtitle: 'Manage customer reviews',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      all: 'All',
      name: 'Name',
      rating: 'Rating',
      topic: 'Topic',
      text: 'Text',
      status: 'Status',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      view: 'View',
      hide: 'Hide',
      noReviews: 'No reviews found',
      loading: 'Loading...',
      updated: 'Updated successfully',
      error: 'Error updating',
      confirmApprove: 'Confirm Approval',
      confirmReject: 'Confirm Rejection',
      confirmApproveText: 'Do you want to approve this review?',
      confirmRejectText: 'Do you want to reject this review?',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      createdAt: 'Created',
      updatedAt: 'Updated',
      logout: 'Logout',
      // Wallet content
      wallet: 'My Wallet',
      totalRevenue: 'Total Revenue',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      totalSessions: 'Total Sessions',
      completedSessions: 'Completed',
      pendingSessions: 'Pending',
      averageSession: 'Average per Session',
      annaLabel: 'Dr. Anna Maria Fytrou',
      annaRevenue: 'Dr. Fytrou revenue',
      annaThisMonth: 'Monthly revenue (Dr. Fytrou)',
      annaSessions: 'Dr. Fytrou sessions',
      annaAverage: 'Average per session (Dr. Fytrou)',
      annaCompletedShort: 'Completed',
      annaPendingShort: 'Pending',
      recentTransactions: 'Recent Transactions',
      noTransactions: 'No transactions found',
      // Waiting list content
      waitingList: 'Waiting List',
      waitingListTitle: 'Waiting List Management',
      waitingListSubtitle: 'Waitlist registration requests',
      noWaitingListEntries: 'No waiting list entries found',
      parentName: 'Parent Name',
      email: 'Email',
      phone: 'Phone',
      preferredDate: 'Preferred Date',
      preferredTime: 'Preferred Time',
      message: 'Message',
      submittedAt: 'Submitted',
      refresh: 'Refresh',
      manualDepositsTab: 'Deposit Button',
      manualDepositsTitle: 'Manual Deposits',
      manualDepositsSubtitle: 'Payments created via the "Deposit" button on the public site',
      manualDepositsNoEntries: 'No manual deposits recorded.',
      manualDepositsRefresh: 'Refresh List',
      manualDepositColumns: {
        createdAt: 'Date',
        parent: 'Parent',
        doctor: 'Doctor',
        sessions: 'Sessions',
        amount: 'Amount',
        date: 'Session date',
        time: 'Session time',
        status: 'Status',
        paymentId: 'Payment ID',
        notes: 'Notes'
      },
      manualDepositStatus: {
        pending: 'Pending',
        completed: 'Completed',
        checkout_failed: 'Checkout failed',
        pending_checkout: 'Processing'
      },
      manualDepositActions: {
        markCompleted: 'Mark as completed',
        markPending: 'Mark as pending'
      }
    }
  };

  const apptContent = {
    gr: {
      tabTitle: 'Ραντεβού',
      doctors: 'Γιατροί',
      availability: 'Διαθεσιμότητες',
      lockLabel: 'Κλείδωμα ολόκληρης ώρας όταν κλείνεται μισάωρο',
      save: 'Αποθήκευση',
      addDoctor: 'Προσθήκη Γιατρού',
      name: 'Όνομα',
      specialty: 'Ειδικότητα',
      active: 'Ενεργός',
      addAvailability: 'Προσθήκη Διαθεσιμότητας',
      date: 'Ημερομηνία',
      from: 'Από',
      to: 'Έως',
      increment: 'Βήμα',
      minutes30: '30 λεπτά',
      minutes60: '60 λεπτά',
      saved: 'Οι ρυθμίσεις αποθηκεύτηκαν',
      appointments: 'Κρατήσεις Ολόκληρου Ιατρείου',
      annaAppointments: 'Κρατήσεις ΜΌΝΟ για Dr. Άννα Μαρία Φύτρου',
      delete: 'Διαγραφή',
      confirmDelete: 'Επιβεβαίωση Διαγραφής',
      confirmDeleteText: 'Θέλετε να διαγράψετε αυτή την κράτηση; Η ημερομηνία και ώρα θα ελευθερωθούν για νέα ραντεβού.',
      deleteSuccess: 'Η κράτηση διαγράφηκε επιτυχώς',
      deleteError: 'Σφάλμα κατά τη διαγραφή της κράτησης',
      actions: 'Ενέργειες'
    },
    en: {
      tabTitle: 'Appointments',
      doctors: 'Doctors',
      availability: 'Availability',
      lockLabel: 'Lock full hour when 30-min slot is booked',
      save: 'Save',
      addDoctor: 'Add Doctor',
      name: 'Name',
      specialty: 'Specialty',
      active: 'Active',
      addAvailability: 'Add Availability',
      date: 'Date',
      from: 'From',
      to: 'To',
      increment: 'Increment',
      minutes30: '30 minutes',
      minutes60: '60 minutes',
      saved: 'Settings saved',
      appointments: 'All Clinic Appointments',
      annaAppointments: 'Dr. Anna Maria Fytrou Appointments',
      delete: 'Delete',
      confirmDelete: 'Confirm Deletion',
      confirmDeleteText: 'Do you want to delete this appointment? The date and time will be freed for new bookings.',
      deleteSuccess: 'Appointment deleted successfully',
      deleteError: 'Error deleting appointment',
      actions: 'Actions'
    }
  } as const;

  const fetchAppointmentsMeta = async () => {
    try {
      const [{ data: doctorsData }, { data: availData }, { data: settingsData }] = await Promise.all([
        supabaseAdmin.from('doctors').select('*').eq('active', true).neq('id', '48b3e29c-496c-421e-8d14-f7a89ded452a').order('name'),
        supabaseAdmin.from('availability').select('*').order('date'),
        supabaseAdmin.from('admin_settings').select('*').eq('id', 1).single()
      ]);
      setDoctors(doctorsData || []);
      setAvailability(availData || []);
      setSettings(settingsData || { id: '1' as unknown as string, lock_half_hour: true, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);

      const [{ data: paymentsData, error: paymentsError }, { data: doctorsData }] = await Promise.all([
        supabaseAdmin
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false }),
        supabaseAdmin
          .from('doctors')
          .select('id, name')
          .eq('active', true)
      ]);

      if (paymentsError) {
        throw paymentsError;
      }

      const paymentsList = paymentsData || [];
      
      // Φέρνουμε manual deposits για να τα συνδέσουμε με payments
      const { data: manualDepositsData } = await supabaseAdmin
        .from('manual_deposit_requests')
        .select('payment_id, id, doctor_id, doctor_name')
        .eq('status', 'completed');
      
      const manualDepositPaymentIds = new Set(
        (manualDepositsData || []).map((md: any) => md.payment_id).filter(Boolean)
      );
      
      // Δημιουργία map για manual deposits με doctor info
      const manualDepositInfoMap = new Map<string, any>();
      (manualDepositsData || []).forEach((md: any) => {
        if (md.payment_id) {
          manualDepositInfoMap.set(md.payment_id, {
            doctor_id: md.doctor_id,
            doctor_name: md.doctor_name
          });
        }
      });
      
      // Ομαδοποίηση manual deposits - ένα payment record ανά manual deposit request
      const manualDepositMap = new Map<string, any>();
      const regularPayments: any[] = [];
      
      paymentsList.forEach((payment: any) => {
        // Έλεγχος αν είναι manual deposit: αν υπάρχει manual_deposit_request με αυτό το payment_id
        const isManualDeposit = manualDepositPaymentIds.has(payment.id);
        
        if (isManualDeposit) {
          // Για manual deposits, προσθέτουμε doctor info από manual_deposit_requests
          const mdInfo = manualDepositInfoMap.get(payment.id);
          if (mdInfo) {
            // Προσθέτουμε/επαναφέρουμε doctor info από manual deposit
            payment.doctor_id = mdInfo.doctor_id || payment.doctor_id;
            payment.doctor_name = mdInfo.doctor_name || payment.doctor_name;
            // Προσθέτουμε concerns marker για manual deposits
            payment.concerns = payment.concerns || 'MANUAL_DEPOSIT';
          }
          // Για manual deposits, χρησιμοποιούμε το payment_id ως unique key
          // αφού κάθε payment αντιπροσωπεύει ένα manual deposit
          const uniqueKey = payment.id || payment.payment_id;
          if (!manualDepositMap.has(uniqueKey)) {
            manualDepositMap.set(uniqueKey, payment);
          }
        } else {
          // Κανονικό payment (όχι manual deposit)
          regularPayments.push(payment);
        }
      });
      
      // Συνδυασμός manual deposits και κανονικών payments (deduplicated)
      const deduplicatedPayments = [...Array.from(manualDepositMap.values()), ...regularPayments];
      
      setPayments(deduplicatedPayments);

      // Helpers to identify Dr. Fytrou
      const normalizeName = (value: string | null | undefined) => {
        if (!value) return '';
        // Μετατροπή ελληνικών χαρακτήρων σε λατινικούς
        const greekToLatin: { [key: string]: string } = {
          'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z',
          'η': 'i', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm',
          'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
          'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
          'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z',
          'Η': 'I', 'Θ': 'Th', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M',
          'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S',
          'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O'
        };
        
        let normalized = value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .toLowerCase();
        
        // Μετατροπή ελληνικών σε λατινικούς
        normalized = normalized.split('').map(char => greekToLatin[char] || char).join('');
        
        // Ειδική μετατροπή για "φυτρου" → "fytrou"
        normalized = normalized.replace(/\bfytroy\b/g, 'fytrou');
        
        return normalized
          .replace(/δρ\./g, 'dr')
          .replace(/[^a-z0-9\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const annaKeywords = [
        'dr anna maria fytrou',
        'anna maria fytrou',
        'fytrou anna maria',
        'dr anna maria fytroy',
        'anna maria fytroy',
        'anna maria fytrou', // Ελληνικό όνομα
        'αννα μαρια φυτρου', // Ελληνικό όνομα (normalized)
        'fytrou' // Μόνο επώνυμο
      ];

      const isAnnaName = (name: string | null | undefined) => {
        if (!name) return false;
        const normalized = normalizeName(name);
        if (!normalized) {
          // Αν το normalize δώσει κενό, ελέγχουμε το original name
          const lowerName = name.toLowerCase();
          return lowerName.includes('φύτρου') || lowerName.includes('φυτρου') || lowerName.includes('fytrou');
        }
        // Ελέγχος αν το normalized όνομα περιέχει κάποιο από τα keywords
        const matches = annaKeywords.some(keyword => normalized.includes(keyword));
        // Επίσης ελέγχος αν το όνομα περιέχει "fytrou" (μετά το normalize)
        const hasFytrou = normalized.includes('fytrou');
        return matches || hasFytrou;
      };

      // Debug: Log all doctors
      console.log('🔍 [WALLET DEBUG] All doctors:', doctorsData);
      (doctorsData || []).forEach((doc: any) => {
        const normalized = normalizeName(doc.name);
        const isAnna = isAnnaName(doc.name);
        console.log('🔍 [WALLET DEBUG] Doctor:', doc.name, '→ normalized:', normalized, '→ isAnna:', isAnna);
      });
      
      const annaDoctorId =
        (doctorsData || []).find((doc: any) => isAnnaName(doc.name))?.id || null;
      
      console.log('🔍 [WALLET] Anna Doctor ID:', annaDoctorId);
      console.log('🔍 [WALLET] Manual deposits count:', manualDepositsData?.length || 0);
      console.log('🔍 [WALLET] Manual deposit payment IDs:', Array.from(manualDepositPaymentIds));
      console.log('🔍 [WALLET] Total payments:', paymentsList.length);
      console.log('🔍 [WALLET] Deduplicated payments:', deduplicatedPayments.length);
      
      // Debug: Check manual deposits doctor info
      (manualDepositsData || []).forEach((md: any) => {
        console.log('🔍 [WALLET DEBUG] Manual deposit:', md.payment_id, '→ doctor_id:', md.doctor_id, '→ doctor_name:', md.doctor_name);
      });

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const parseDate = (value: string | null | undefined) => (value ? new Date(value) : null);

      // Χρήση deduplicated payments για υπολογισμούς
      const completedPayments = deduplicatedPayments.filter((p: any) => p.status === 'completed');
      const thisMonthCompleted = completedPayments.filter((p: any) => {
        const createdAt = parseDate(p.created_at);
        return createdAt ? createdAt >= thisMonth : false;
      });
      const lastMonthCompleted = completedPayments.filter((p: any) => {
        const createdAt = parseDate(p.created_at);
        return createdAt ? createdAt >= lastMonth && createdAt <= lastMonthEnd : false;
      });

      const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
      const thisMonthRevenue = thisMonthCompleted.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
      const lastMonthRevenue = lastMonthCompleted.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
      const totalSessions = deduplicatedPayments.length;
      const completedSessions = completedPayments.length;
      const pendingSessions = deduplicatedPayments.filter((p: any) => p.status === 'pending').length;
      const averageSession = completedSessions > 0 ? totalRevenue / completedSessions : 0;

      const isAnnaPayment = (payment: any) => {
        const paymentId = payment?.id;
        const paymentDoctorId = payment?.doctor_id;
        const paymentDoctorName = payment?.doctor_name;
        const paymentConcerns = payment?.concerns || '';
        const paymentAmount = payment?.amount_cents || 0;
        
        // Ελέγχος doctor_id (πρώτα γιατί είναι πιο αξιόπιστο)
        if (paymentDoctorId && annaDoctorId && paymentDoctorId === annaDoctorId) {
          console.log('✅ [WALLET] Anna payment found by doctor_id:', paymentId, 'Amount:', paymentAmount);
          return true;
        }
        
        // Ελέγχος doctor_name (για κανονικά payments και manual deposits)
        if (isAnnaName(paymentDoctorName)) {
          console.log('✅ [WALLET] Anna payment found by doctor_name:', paymentId, paymentDoctorName, 'Amount:', paymentAmount);
          return true;
        }
        
        // Ελέγχος για manual deposits που αναφέρονται στη Δρ. Φύτρου
        // Τα manual deposits έχουν concerns = 'MANUAL_DEPOSIT' και doctor info
        if (typeof paymentConcerns === 'string' && (paymentConcerns === 'MANUAL_DEPOSIT' || paymentConcerns.startsWith('MANUAL_DEPOSIT'))) {
          // Αν υπάρχει doctor_id και ταιριάζει με την Άννα
          if (paymentDoctorId && annaDoctorId && paymentDoctorId === annaDoctorId) {
            console.log('✅ [WALLET] Anna manual deposit found by doctor_id:', paymentId, 'Amount:', paymentAmount);
            return true;
          }
          // Αν υπάρχει doctor_name και ταιριάζει με την Άννα
          if (isAnnaName(paymentDoctorName)) {
            console.log('✅ [WALLET] Anna manual deposit found by doctor_name:', paymentId, paymentDoctorName, 'Amount:', paymentAmount);
            return true;
          }
        }
        
        return false;
      };

      const annaPayments = deduplicatedPayments.filter(isAnnaPayment);
      const annaCompleted = annaPayments.filter((p: any) => p.status === 'completed');
      const annaThisMonthCompleted = annaCompleted.filter((p: any) => {
        const createdAt = parseDate(p.created_at);
        return createdAt ? createdAt >= thisMonth : false;
      });
      const annaLastMonthCompleted = annaCompleted.filter((p: any) => {
        const createdAt = parseDate(p.created_at);
        return createdAt ? createdAt >= lastMonth && createdAt <= lastMonthEnd : false;
      });

      const annaTotalRevenue = annaCompleted.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
      const annaThisMonthRevenue = annaThisMonthCompleted.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
      const annaLastMonthRevenue = annaLastMonthCompleted.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
      const annaTotalSessions = annaPayments.length;
      const annaCompletedSessions = annaCompleted.length;
      const annaPendingSessions = annaPayments.filter((p: any) => p.status === 'pending').length;
      const annaAverageSession = annaCompletedSessions > 0 ? annaTotalRevenue / annaCompletedSessions : 0;
      
      console.log('💰 [WALLET STATS] Anna payments found:', annaPayments.length);
      console.log('💰 [WALLET STATS] Anna completed:', annaCompleted.length);
      console.log('💰 [WALLET STATS] Anna total revenue:', annaTotalRevenue, 'cents = €', (annaTotalRevenue / 100).toFixed(2));
      console.log('💰 [WALLET STATS] Anna this month revenue:', annaThisMonthRevenue, 'cents = €', (annaThisMonthRevenue / 100).toFixed(2));

      setWalletStats({
        totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        totalSessions,
        completedSessions,
        pendingSessions,
        averageSession,
        anna: {
          totalRevenue: annaTotalRevenue,
          thisMonth: annaThisMonthRevenue,
          lastMonth: annaLastMonthRevenue,
          totalSessions: annaTotalSessions,
          completedSessions: annaCompletedSessions,
          pendingSessions: annaPendingSessions,
          averageSession: annaAverageSession
        }
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  // Set up real-time subscription for all changes
  useEffect(() => {
    const channel = supabaseAdmin
      .channel('admin_all_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload: any) => {
          console.log('Admin: Appointments change detected:', payload);
          fetchAppointmentsMeta();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability'
        },
        (payload: any) => {
          console.log('Admin: Availability change detected:', payload);
          fetchAppointmentsMeta();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload: any) => {
          console.log('Admin: Payments change detected:', payload);
          fetchWalletData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manual_deposit_requests'
        },
        (payload: any) => {
          console.log('Admin: Manual deposit requests change detected:', payload);
          fetchWalletData();
          fetchManualDeposits();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitingList = async () => {
    try {
      setWaitingListLoading(true);
      const { data, error } = await supabaseAdmin
        .from('waiting_list')
        .select(`
          *,
          doctors (
            id,
            name,
            specialty
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWaitingList(data || []);
    } catch (error) {
      console.error('Error fetching waiting list:', error);
    } finally {
      setWaitingListLoading(false);
    }
  };

  const fetchManualDeposits = async () => {
    try {
      setManualDepositsLoading(true);
      // Φέρνει μόνο τα completed manual deposits
      const { data, error } = await supabaseAdmin
        .from('manual_deposit_requests')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const enhanced = (data || []).map((entry: any) => ({
        ...entry,
        _parsedNotes: parseManualDepositNotes(entry.notes)
      }));
      setManualDeposits(enhanced);
      setManualDepositsPage(1);

      const fytrouDoctorId = enhanced.find((entry: any) => normalizeDoctorOverrideKey(entry?.doctor_name) === normalizeDoctorOverrideKey('Dr. Άννα Μαρία Φύτρου'))?.doctor_id
        || (await supabaseAdmin
          .from('doctors')
          .select('id')
          .eq('name', 'Dr. Άννα Μαρία Φύτρου')
          .maybeSingle()
        ).data?.id || null;

      const fytrouDeposits = fytrouDoctorId
        ? enhanced.filter((entry: any) => entry.doctor_id === fytrouDoctorId)
        : enhanced.filter((entry: any) => normalizeDoctorOverrideKey(entry?.doctor_name).includes(normalizeDoctorOverrideKey('Dr. Άννα Μαρία Φύτρου')));
      setFytrouManualDeposits(fytrouDeposits);
      setFytrouDepositsPage(1);
    } catch (error) {
      console.error('Error fetching manual deposits:', error);
    } finally {
      setManualDepositsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const customersData = data || [];
      setCustomers(customersData);
      
      // Fetch emails for all customers in parallel
      const emailPromises = customersData.map(async (c: any) => {
        if (c.user_id) {
          try {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(c.user_id);
            return { customerId: c.id, email: userData?.user?.email || null };
          } catch {
            return { customerId: c.id, email: null };
          }
        }
        return { customerId: c.id, email: null };
      });
      
      const emailResults = await Promise.all(emailPromises);
      setCustomers((prev) => 
        prev.map((c: any) => {
          const emailData = emailResults.find((e: any) => e.customerId === c.id);
          return { ...c, _email: emailData?.email || null };
        })
      );
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchCustomerUser = async (userId: string) => {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (error) throw error;
      setSelectedCustomerUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const deleteWaitingListEntry = async (entryId: string) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το αίτημα από τη λίστα αναμονής;')) {
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('waiting_list')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      // Remove from local state
      setWaitingList(prev => prev.filter(entry => entry.id !== entryId));
      
      alert('Το αίτημα διαγράφηκε επιτυχώς από τη λίστα αναμονής.');
    } catch (error) {
      console.error('Error deleting waiting list entry:', error);
      alert('Υπήρξε σφάλμα κατά τη διαγραφή του αιτήματος.');
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchAppointmentsMeta();
    fetchWalletData();
    fetchWaitingList();
    fetchManualDeposits();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    }
    if (activeTab === 'manualDeposits') {
      fetchManualDeposits();
    }
  }, [activeTab]);

  const handleStatusUpdate = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setIsUpdating(reviewId);
      const { error } = await supabaseAdmin
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, status: newStatus, updated_at: new Date().toISOString() }
            : review
        )
      );
    } catch (error) {
      console.error('Error updating review:', error);
      alert(content[language].error);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredReviews = reviews.filter(review => 
    filter === 'all' || review.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return content[language].pending;
      case 'approved': return content[language].approved;
      case 'rejected': return content[language].rejected;
      default: return status;
    }
  };

  const parseManualDepositNotes = (notes: string | null | undefined) => {
    if (!notes) {
      return { userNotes: '', sessions: [] as string[] };
    }

    // Try JSON payload first
    try {
      const parsed = JSON.parse(notes);
      // New format with dateTime
      if (parsed && typeof parsed.dateTime === 'string') {
        const dateTime = parsed.dateTime.trim();
        const userNotes = typeof parsed.userNotes === 'string' ? parsed.userNotes.trim() : '';
        return { userNotes, sessions: dateTime ? [dateTime] : [] };
      }
      // Old format with schedules array (backward compatibility)
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
      // Non-JSON notes - fall back to regex parsing
    }

    const sessionRegex = /Session\s*\d+:[^|\n]+/gi;
    const sessions = (notes.match(sessionRegex) || []).map(s => s.replace(/\s+/g, ' ').trim());
    let userNotes = notes;
    sessions.forEach(sessionText => {
      userNotes = userNotes.replace(sessionText, '');
    });
    userNotes = userNotes.replace(/\|\s*/g, ' ').replace(/\s+/g, ' ').trim();
    return { userNotes, sessions };
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

      setFytrouManualDeposits(prev => {
        const next = prev.filter(entry => entry.id !== id);
        const totalPages = Math.max(1, Math.ceil(next.length / manualDepositsPerPage));
        setFytrouDepositsPage(current => Math.min(current, totalPages));
        return next;
      });
    } catch (error) {
      console.error('Failed to delete manual deposit:', error);
      alert(content[language].error);
    }
  };

  const filteredPayments = useMemo(() => {
    // Τα payments είναι ήδη deduplicated στο fetchWalletData
    // Εδώ απλά κάνουμε φιλτράρισμα ανά search term
    const term = walletSearch.trim().toLowerCase();
    if (!term) return payments;
    
    return payments.filter((payment: any) => {
      const amountEuros = (payment.amount_cents ?? 0) / 100;
      const searchableFields = [
        payment.parent_name,
        payment.parent_email,
        payment.doctor_name,
        payment.appointment_date,
        payment.appointment_time,
        payment.status,
        amountEuros.toFixed(2),
        amountEuros.toString()
      ];
      return searchableFields.some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(term)
      );
    });
  }, [payments, walletSearch]);
  const transactionsCount = filteredPayments.length;
  const displayedPayments = useMemo(
    () => filteredPayments.slice(0, 10),
    [filteredPayments]
  );

  const manualDepositsTotalPages = Math.max(1, Math.ceil(Math.max(manualDeposits.length, 1) / manualDepositsPerPage));
  const manualDepositsStart = (manualDepositsPage - 1) * manualDepositsPerPage;
  const manualDepositsEnd = manualDepositsStart + manualDepositsPerPage;
  const paginatedManualDeposits = manualDeposits.slice(manualDepositsStart, manualDepositsEnd);
  const depositPaginationLabels = language === 'gr'
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
  const fytrouDepositsTotalPages = Math.max(1, Math.ceil(Math.max(fytrouManualDeposits.length, 1) / manualDepositsPerPage));
  const fytrouDepositsStart = (fytrouDepositsPage - 1) * manualDepositsPerPage;
  const fytrouDepositsEnd = fytrouDepositsStart + manualDepositsPerPage;
  const paginatedFytrouDeposits = fytrouManualDeposits.slice(fytrouDepositsStart, fytrouDepositsEnd);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 font-poppins">
                {content[language].title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 font-nunito">
                {content[language].subtitle}
              </p>
            </div>
            {onLogout && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">{content[language].logout}</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="inline-flex rounded-xl overflow-hidden bg-white shadow">
            <button onClick={() => setActiveTab('reviews')} className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab==='reviews'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>Κριτικές</button>
            <button onClick={() => setActiveTab('appointments')} className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab==='appointments'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>{apptContent[language].tabTitle}</button>
            <button onClick={() => setActiveTab('waitinglist')} className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab==='waitinglist'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>📋 {content[language].waitingList}</button>
            <button onClick={() => setActiveTab('closures')} className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab==='closures'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>🏖️ Διακοπές / Κλείσιμο</button>
            <button onClick={() => setActiveTab('manualDeposits')} className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab==='manualDeposits'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>💳 {content[language].manualDepositsTab}</button>
            <button onClick={() => setActiveTab('wallet')} className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab==='wallet'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>💰 {content[language].wallet}</button>
            <button onClick={() => setActiveTab('customers')} className={`px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base ${activeTab==='customers'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>👥 Χρήστες-Πληροφοριές</button>
          </div>
        </div>

        {activeTab === 'reviews' && (
        <>
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    filter === filterType
                      ? 'bg-gradient-to-r from-rose-soft to-purple-soft text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {content[language][filterType]}
                </button>
              ))}
            </div>
            <button
              onClick={fetchReviews}
              disabled={loading}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-soft mx-auto mb-4"></div>
              <p className="text-gray-600 font-nunito">{content[language].loading}</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 font-nunito text-lg">{content[language].noReviews}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].name}
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].rating}
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].topic}
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].status}
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].createdAt}
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReviews.map((review) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-4">
                        <div className="font-semibold text-gray-800 font-poppins text-sm sm:text-base">
                          {review.name}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-xs sm:text-sm text-gray-600 font-nunito">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-xs sm:text-sm text-gray-600 font-nunito max-w-xs truncate">
                          {review.session_topic}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status ?? 'pending')}`}>
                          {getStatusText(review.status ?? 'pending')}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-xs sm:text-sm text-gray-600 font-nunito">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title={content[language].view}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  if (!review.id) return;
                                  if (confirm(content[language].confirmApproveText)) {
                                    handleStatusUpdate(review.id, 'approved');
                                  }
                                }}
                                disabled={isUpdating === review.id}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                title={content[language].approve}
                              >
                                {isUpdating === review.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (!review.id) return;
                                  if (confirm(content[language].confirmRejectText)) {
                                    handleStatusUpdate(review.id, 'rejected');
                                  }
                                }}
                                disabled={isUpdating === review.id}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                title={content[language].reject}
                              >
                                {isUpdating === review.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
        </>
        )}

        {activeTab === 'manualDeposits' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 font-poppins">
                  {content[language].manualDepositsTitle}
                </h3>
                <p className="text-sm text-gray-600 font-nunito mt-1">
                  {content[language].manualDepositsSubtitle}
                </p>
              </div>
              <button
                onClick={fetchManualDeposits}
                disabled={manualDepositsLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${manualDepositsLoading ? 'animate-spin' : ''}`} />
                <span>{content[language].manualDepositsRefresh}</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
              {manualDepositsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-soft mx-auto mb-4"></div>
                  <p className="text-gray-600 font-nunito">{content[language].loading}</p>
                </div>
              ) : manualDeposits.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 font-nunito text-lg">
                    {content[language].manualDepositsNoEntries}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.createdAt}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.parent}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.doctor}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.sessions}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.amount}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.date}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.time}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.paymentId}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.notes}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedManualDeposits.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            {entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800 font-poppins text-sm">{entry.parent_name}</div>
                            <div className="text-xs text-gray-500 font-nunito">{entry.parent_email}</div>
                            {entry.parent_phone && (
                              <div className="text-xs text-gray-500 font-nunito">{entry.parent_phone}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            {entry.doctor_name || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            {entry.session_count || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            €{entry.amount_cents ? (entry.amount_cents / 100).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            {(() => {
                              // Εξαγωγή μόνο της ημερομηνίας από appointment_date (αν περιέχει ώρα)
                              const dateStr = entry.appointment_date || '';
                              if (dateStr.includes(' ')) {
                                return dateStr.split(' ')[0];
                              }
                              return dateStr || '—';
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            <div className="flex items-center gap-2">
                              {(() => {
                                // Εξαγωγή ώρας από appointment_time ή appointment_date
                                let timeStr = entry.appointment_time;
                                if (!timeStr || timeStr === '—' || timeStr.trim() === '') {
                                  // Αν δεν υπάρχει appointment_time, δοκίμασε να το εξάγεις από appointment_date
                                  const dateStr = entry.appointment_date || '';
                                  if (dateStr.includes(' ')) {
                                    const parts = dateStr.split(' ');
                                    if (parts.length > 1) {
                                      timeStr = parts[1]; // Παίρνουμε το δεύτερο μέρος (ώρα)
                                    }
                                  }
                                }
                                return timeStr || '—';
                              })()}
                              {(() => {
                                // Εξαγωγή ώρας για να ελέγξουμε αν πρέπει να δείξουμε flag
                                let timeStr = entry.appointment_time;
                                if (!timeStr || timeStr === '—' || (typeof timeStr === 'string' && timeStr.trim() === '')) {
                                  const dateStr = entry.appointment_date || '';
                                  if (dateStr.includes(' ')) {
                                    const parts = dateStr.split(' ');
                                    if (parts.length > 1) {
                                      timeStr = parts[1];
                                    }
                                  }
                                }
                                const hasTime = timeStr && timeStr !== '—' && (typeof timeStr === 'string' && timeStr.trim() !== '');
                                return hasTime && entry.user_timezone ? (
                                  <span className="text-lg" title={getCountryFlagTooltip(entry.user_timezone)}>
                                    {getCountryFlagFromTimezone(entry.user_timezone)}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-nunito">
                            {entry.payment_id || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-nunito">
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
                            {!entry._parsedNotes?.userNotes && !(entry._parsedNotes?.sessions?.length) && (
                              <span>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <button
                                onClick={() => {
                                  if (confirm(language === 'gr' ? 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την καταχώρηση;' : 'Are you sure you want to delete this entry?')) {
                                    deleteManualDeposit(entry.id);
                                  }
                                }}
                                className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold"
                              >
                                {language === 'gr' ? 'Διαγραφή' : 'Delete'}
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
                  {depositPaginationLabels.range(
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
                    {depositPaginationLabels.prev}
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 font-semibold">
                    {manualDepositsPage} / {manualDepositsTotalPages}
                  </span>
                  <button
                    onClick={() => setManualDepositsPage(prev => Math.min(prev + 1, manualDepositsTotalPages))}
                    disabled={manualDepositsPage === manualDepositsTotalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {depositPaginationLabels.next}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-purple-50">
                <h4 className="text-lg font-bold text-gray-800 font-poppins">
                  {language === 'gr' ? 'Καταθέσεις μόνο για Dr. Άννα Μαρία Φύτρου' : 'Dr. Fytrou manual deposits'}
                </h4>
              </div>
              {manualDepositsLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-nunito">{content[language].loading}</p>
                </div>
              ) : fytrouManualDeposits.length === 0 ? (
                <div className="p-6 text-center text-gray-600 font-nunito">
                  {language === 'gr' ? 'Δεν υπάρχουν καταθέσεις για τη Δρ. Φύτρου.' : 'No deposits for Dr. Fytrou.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.createdAt}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.parent}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.sessions}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.amount}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.date}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.time}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.paymentId}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].manualDepositColumns.notes}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 font-poppins uppercase tracking-wide">
                          {content[language].actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedFytrouDeposits.map((entry) => (
                        <tr key={entry.id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            {entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            <div className="font-semibold text-gray-800 font-poppins text-sm">{entry.parent_name}</div>
                            <div className="text-xs text-gray-500 font-nunito">{entry.parent_email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            {entry.session_count || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            €{entry.amount_cents ? (entry.amount_cents / 100).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            {(() => {
                              // Εξαγωγή μόνο της ημερομηνίας από appointment_date (αν περιέχει ώρα)
                              const dateStr = entry.appointment_date || '';
                              if (dateStr.includes(' ')) {
                                return dateStr.split(' ')[0];
                              }
                              return dateStr || '—';
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-nunito">
                            <div className="flex items-center gap-2">
                              {(() => {
                                // Εξαγωγή ώρας από appointment_time ή appointment_date
                                let timeStr = entry.appointment_time;
                                if (!timeStr || timeStr === '—' || timeStr.trim() === '') {
                                  // Αν δεν υπάρχει appointment_time, δοκίμασε να το εξάγεις από appointment_date
                                  const dateStr = entry.appointment_date || '';
                                  if (dateStr.includes(' ')) {
                                    const parts = dateStr.split(' ');
                                    if (parts.length > 1) {
                                      timeStr = parts[1]; // Παίρνουμε το δεύτερο μέρος (ώρα)
                                    }
                                  }
                                }
                                return timeStr || '—';
                              })()}
                              {(() => {
                                // Εξαγωγή ώρας για να ελέγξουμε αν πρέπει να δείξουμε flag
                                let timeStr = entry.appointment_time;
                                if (!timeStr || timeStr === '—' || (typeof timeStr === 'string' && timeStr.trim() === '')) {
                                  const dateStr = entry.appointment_date || '';
                                  if (dateStr.includes(' ')) {
                                    const parts = dateStr.split(' ');
                                    if (parts.length > 1) {
                                      timeStr = parts[1];
                                    }
                                  }
                                }
                                const hasTime = timeStr && timeStr !== '—' && (typeof timeStr === 'string' && timeStr.trim() !== '');
                                return hasTime && entry.user_timezone ? (
                                  <span className="text-lg" title={getCountryFlagTooltip(entry.user_timezone)}>
                                    {getCountryFlagFromTimezone(entry.user_timezone)}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-nunito">
                            {entry.payment_id || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 font-nunito">
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
                            {!entry._parsedNotes?.userNotes && !(entry._parsedNotes?.sessions?.length) && (
                              <span>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <button
                                onClick={() => {
                                  if (confirm(language === 'gr' ? 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την καταχώρηση;' : 'Are you sure you want to delete this entry?')) {
                                    deleteManualDeposit(entry.id);
                                  }
                                }}
                                className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold"
                              >
                                {language === 'gr' ? 'Διαγραφή' : 'Delete'}
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

            {fytrouManualDeposits.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-500 font-nunito">
                  {depositPaginationLabels.range(
                    fytrouDepositsStart + 1,
                    Math.min(fytrouDepositsEnd, fytrouManualDeposits.length),
                    fytrouManualDeposits.length
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFytrouDepositsPage(prev => Math.max(prev - 1, 1))}
                    disabled={fytrouDepositsPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {depositPaginationLabels.prev}
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 font-semibold">
                    {fytrouDepositsPage} / {fytrouDepositsTotalPages}
                  </span>
                  <button
                    onClick={() => setFytrouDepositsPage(prev => Math.min(prev + 1, fytrouDepositsTotalPages))}
                    disabled={fytrouDepositsPage === fytrouDepositsTotalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {depositPaginationLabels.next}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'appointments' && settings && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">{apptContent[language].doctors}</h3>
              <DoctorManager doctors={doctors} onChange={setDoctors} />
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">{apptContent[language].availability}</h3>
              <AvailabilityManager doctors={doctors} availability={availability} onChange={setAvailability} />
            </div>
            <AppointmentsList language={language} />
            <AnnaAppointmentsList language={language} />
            <div className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <label className="flex items-center space-x-3">
                <input type="checkbox" checked={settings.lock_half_hour} onChange={e=> setSettings({ ...settings, lock_half_hour: e.target.checked })} />
                <span className="font-semibold text-sm sm:text-base">{apptContent[language].lockLabel}</span>
              </label>
              <button disabled={isSavingSettings} onClick={async ()=>{ setIsSavingSettings(true); await supabaseAdmin.from('admin_settings').upsert({ id: 1, lock_half_hour: settings.lock_half_hour }); setIsSavingSettings(false); alert(apptContent[language].saved); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 text-sm sm:text-base">{apptContent[language].save}</button>
            </div>
          </motion.div>
        )}

        {activeTab === 'wallet' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* 💰 Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm font-medium">{content[language].totalRevenue}</p>
                    <p className="text-3xl font-bold">€{Math.round(walletStats.totalRevenue / 100).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    {content[language].annaLabel}
                  </p>
                  <p className="text-xl font-bold text-white">
                    €{Math.round(walletStats.anna.totalRevenue / 100).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    {content[language].annaRevenue}
                  </p>
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
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">{content[language].thisMonth}</p>
                    <p className="text-3xl font-bold">€{Math.round(walletStats.thisMonth / 100).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    {content[language].annaLabel}
                  </p>
                  <p className="text-xl font-bold text-white">
                    €{Math.round(walletStats.anna.thisMonth / 100).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    {content[language].annaThisMonth}
                  </p>
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
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 text-sm font-medium">{content[language].totalSessions}</p>
                    <p className="text-3xl font-bold">{walletStats.totalSessions}</p>
                  </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    {content[language].annaLabel}
                  </p>
                  <p className="text-xl font-bold text-white">
                    {walletStats.anna.totalSessions}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    {content[language].annaSessions}
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    {content[language].annaCompletedShort}: {walletStats.anna.completedSessions} | {content[language].annaPendingShort}: {walletStats.anna.pendingSessions}
                  </p>
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
                    <p className="text-3xl font-bold">€{Math.round(walletStats.averageSession / 100)}</p>
                  </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    {content[language].annaLabel}
                  </p>
                  <p className="text-xl font-bold text-white">
                    €{Math.round(walletStats.anna.averageSession / 100)}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    {content[language].annaAverage}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* 📋 Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-8 py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-white text-xl">📋</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white font-poppins">
                        {content[language].recentTransactions}
                      </h2>
                      <p className="text-gray-100 text-sm font-nunito">
                        {transactionsCount} {content[language].recentTransactions.toLowerCase()}
                        {walletSearch.trim() ? ' (φιλτραρισμένες)' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="relative w-full md:w-72">
                    <input
                      type="text"
                      value={walletSearch}
                      onChange={(e) => setWalletSearch(e.target.value)}
                      placeholder={language === 'gr' ? 'Αναζήτηση γονέα, γιατρού ή ποσού...' : 'Search parent, doctor or amount...'}
                      className="w-full pl-4 pr-10 py-2 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-white/70">🔍</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {walletLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-soft mx-auto mb-4"></div>
                    <p className="text-gray-600 font-nunito">Φόρτωση...</p>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-2xl">📋</span>
                    </div>
                    <p className="text-gray-600 font-nunito text-lg">{content[language].noTransactions}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedPayments.map((payment: any, index: number) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            <span className="text-xl">
                              {payment.status === 'completed' ? '✅' : '⏳'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{payment.parent_name}</h4>
                            <p className="text-sm text-gray-600">{payment.doctor_name}</p>
                            <p className="text-sm text-gray-600">{payment.appointment_date} - {payment.appointment_time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">€{Math.round(payment.amount_cents / 100)}</p>
                          <p className={`text-sm font-medium ${
                            payment.status === 'completed'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}>
                            {payment.status === 'completed' ? 'Ολοκληρώθηκε' : 'Εκκρεμεί'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'closures' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-start space-x-3 mb-3">
                <div className="text-2xl">🏖️</div>
                <div>
                  <h3 className="text-xl font-bold">Διακοπές / Κλείσιμο Ιατρείου</h3>
                  <p className="text-gray-600">Μερικά κλικ για να ξεκουραστείτε! Συμπληρώστε τα πεδία και πατήστε αποθήκευση. Οι μέρες θα κρυφτούν αυτόματα από το ημερολόγιο κρατήσεων.</p>
                </div>
              </div>
              <ClinicClosuresManager doctors={doctors} />
            </div>
          </motion.div>
        )}

        {activeTab === 'waitinglist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Beautiful Header with Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <span className="text-3xl">📋</span>
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold font-poppins">
                        {content[language].waitingListTitle}
                      </h2>
                      <p className="text-indigo-100 font-nunito text-lg">
                        {content[language].waitingListSubtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">{waitingList.length}</div>
                        <div className="text-sm text-indigo-100">Συνολικά Αιτήματα</div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {waitingList.filter(entry => {
                            const today = new Date();
                            const entryDate = new Date(entry.created_at);
                            return entryDate.toDateString() === today.toDateString();
                          }).length}
                        </div>
                        <div className="text-sm text-indigo-100">Σήμερα</div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {waitingList.filter(entry => entry.preferred_date).length}
                        </div>
                        <div className="text-sm text-indigo-100">Με Προτίμηση</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchWaitingList}
                  disabled={waitingListLoading}
                  className="flex items-center space-x-3 px-6 py-4 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-2xl hover:bg-opacity-30 transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  <RefreshCw className={`h-5 w-5 ${waitingListLoading ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">{content[language].refresh}</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Beautiful Cards Layout */}
            {waitingListLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl p-12 text-center"
              >
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
                <p className="text-gray-600 font-nunito text-xl">{content[language].loading}</p>
              </motion.div>
            ) : waitingList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-4xl">📋</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 font-poppins mb-4">
                  {content[language].noWaitingListEntries}
                </h3>
                <p className="text-gray-600 font-nunito text-lg">
                  Δεν υπάρχουν αιτήματα εγγραφής στη λίστα αναμονής αυτή τη στιγμή.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {waitingList.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                            <span className="text-xl">👤</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg font-poppins">{entry.name}</h3>
                            <p className="text-indigo-100 text-sm">{entry.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-indigo-100">Υποβλήθηκε</div>
                          <div className="text-sm font-semibold">
                            {new Date(entry.created_at).toLocaleDateString('el-GR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      {/* Contact Info */}
                      {entry.phone && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 text-sm">📞</span>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Τηλέφωνο</div>
                            <div className="text-gray-800 font-semibold">{entry.phone}</div>
                          </div>
                        </div>
                      )}

                      {/* Doctor Info */}
                      {(entry as any).doctors && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-sm">👨‍⚕️</span>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Επιλεγμένος Γιατρός</div>
                            <div className="text-gray-800 font-semibold">{(entry as any).doctors.name}</div>
                            {(entry as any).doctors.specialty && (
                              <div className="text-xs text-gray-600">{(entry as any).doctors.specialty}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Preferred Date & Time */}
                      {(entry.preferred_date || entry.preferred_time) && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📅</span>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Ημερομηνία/Ώρα Που Ηθελε ο Πελατης και δεν βρήκε διαθέσιμη</div>
                            <div className="text-gray-800 font-semibold">
                              {entry.preferred_date && entry.preferred_time 
                                ? `${entry.preferred_date} στις ${entry.preferred_time}`
                                : entry.preferred_date || entry.preferred_time || '-'
                              }
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      {entry.message && (
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600 text-sm">💬</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 font-medium mb-2">Μήνυμα</div>
                              <div className="text-gray-700 text-sm leading-relaxed">
                                {entry.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        {/* Call Button */}
                        <motion.a
                          href={`tel:${entry.phone || '+41'}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300"
                        >
                          <span className="text-lg">📞</span>
                          <span>Κλήση {entry.phone || 'Γιατρού'}</span>
                        </motion.a>
                        
                        {/* Delete Button */}
                        <motion.button
                          onClick={() => deleteWaitingListEntry(entry.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300"
                        >
                          <span className="text-lg">🗑️</span>
                          <span>Διαγραφή Αιτήματος Αναμονής</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-poppins mb-2">👥 Χρήστες-Πληροφοριές</h2>
                  <p className="text-blue-100 font-nunito">Διαχείριση όλων των πελατών</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchCustomers}
                  disabled={customersLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${customersLoading ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">Ανανέωση</span>
                </motion.button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Αναζήτηση με όνομα, email ή τηλέφωνο..."
                  value={customersSearch}
                  onChange={(e) => setCustomersSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>

            {/* Customers List */}
            {customersLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Φόρτωση...</p>
              </div>
            ) : (() => {
              const filtered = customers.filter(c => {
                const search = customersSearch.toLowerCase();
                return !search || 
                  (c.full_name?.toLowerCase().includes(search)) ||
                  (c.phone?.includes(search));
              });
              const totalPages = Math.ceil(filtered.length / customersPerPage);
              const startIdx = (customersPage - 1) * customersPerPage;
              const paginated = filtered.slice(startIdx, startIdx + customersPerPage);
              
              return (
                <>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Όνομα</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Τηλέφωνο</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Ημερομηνία Εγγραφής</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Ενέργειες</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginated.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                Δεν βρέθηκαν χρήστες
                              </td>
                            </tr>
                          ) : (
                            paginated.map((customer) => (
                              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium">{customer.full_name || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {(customer as any)._email || '...'}
                                </td>
                                <td className="px-4 py-3 text-sm">{customer.phone || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(customer.created_at).toLocaleDateString('el-GR')}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={async () => {
                                      setSelectedCustomer(customer);
                                      if (customer.user_id) {
                                        await fetchCustomerUser(customer.user_id);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                                  >
                                    Προβολή
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
                      <div className="text-sm text-gray-600">
                        Σελίδα {customersPage} από {totalPages} ({filtered.length} συνολικά)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCustomersPage(p => Math.max(1, p - 1))}
                          disabled={customersPage === 1}
                          className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setCustomersPage(p => Math.min(totalPages, p + 1))}
                          disabled={customersPage === totalPages}
                          className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => {
              setSelectedCustomer(null);
              setSelectedCustomerUser(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold font-poppins">Πληροφορίες Χρήστη</h3>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setSelectedCustomerUser(null);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <User className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-nunito">Ονοματεπώνυμο</p>
                      <p className="font-semibold font-nunito">{selectedCustomer.full_name || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-nunito">Email</p>
                      <p className="font-semibold font-nunito">{selectedCustomerUser?.email || '...'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-nunito">Τηλέφωνο</p>
                      <p className="font-semibold font-nunito">{selectedCustomer.phone || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-nunito">Ημερομηνία Εγγραφής</p>
                      <p className="font-semibold font-nunito">
                        {new Date(selectedCustomer.created_at).toLocaleDateString('el-GR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedCustomer.avatar_url && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 font-nunito mb-2">Avatar</p>
                    <img src={selectedCustomer.avatar_url} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-nunito mb-2">User ID</p>
                  <p className="font-mono text-sm">{selectedCustomer.user_id}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-nunito mb-2">Ενημερώθηκε</p>
                  <p className="font-semibold font-nunito">
                    {new Date(selectedCustomer.updated_at).toLocaleDateString('el-GR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {selectedCustomerUser && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 font-nunito mb-2 font-semibold">Auth Πληροφορίες</p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Email Επαληθευμένο:</span> {selectedCustomerUser.email_confirmed_at ? 'Ναι' : 'Όχι'}</p>
                      <p><span className="font-semibold">Τελευταία Σύνδεση:</span> {
                        selectedCustomerUser.last_sign_in_at 
                          ? new Date(selectedCustomerUser.last_sign_in_at).toLocaleDateString('el-GR')
                          : 'Ποτέ'
                      }</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Review Detail Modal */}
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-800 font-poppins">
                  {content[language].view} {content[language].title.toLowerCase()}
                </h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 font-poppins">
                    {content[language].name}
                  </h4>
                  <p className="text-gray-800 font-nunito">{selectedReview.name}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 font-poppins">
                    {content[language].rating}
                  </h4>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < selectedReview.rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-600 font-nunito">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 font-poppins">
                    {content[language].topic}
                  </h4>
                  <p className="text-gray-800 font-nunito">{selectedReview.session_topic}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 font-poppins">
                    {content[language].text}
                  </h4>
                  <p className="text-gray-800 font-nunito leading-relaxed">
                    "{selectedReview.text}"
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 font-poppins">
                    {content[language].status}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedReview.status ?? 'pending')}`}>
                    {getStatusText(selectedReview.status ?? 'pending')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 font-nunito">
                  <div>
                    <span className="font-semibold">{content[language].createdAt}:</span>
                    <br />
                    {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleString() : '—'}
                  </div>
                  <div>
                    <span className="font-semibold">{content[language].updatedAt}:</span>
                    <br />
                    {selectedReview.updated_at ? new Date(selectedReview.updated_at).toLocaleString() : '—'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface ClinicClosuresManagerProps {
  doctors: Doctor[];
}

const ClinicClosuresManager: React.FC<ClinicClosuresManagerProps> = ({ doctors }) => {
  const [doctorId, setDoctorId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [reasonGr, setReasonGr] = useState<string>('');
  const [reasonEn, setReasonEn] = useState<string>('');
  const [reasonFr, setReasonFr] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchClosures = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin
      .from('clinic_closures')
      .select('id, doctor_id, date_from, date_to, reason')
      .order('date_from', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClosures(); }, []);

  const resetForm = () => {
    setDateFrom('');
    setDateTo('');
    setReasonGr('');
    setReasonEn('');
    setReasonFr('');
    setDoctorId('all');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!dateFrom || !dateTo) { alert('Παρακαλώ ορίστε Ημερομηνία Από/Έως.'); return; }
    setSaving(true);
    try {
      const trimmedReasons = {
        gr: reasonGr.trim(),
        en: reasonEn.trim(),
        fr: reasonFr.trim()
      };
      const hasTranslations = Object.values(trimmedReasons).some(value => value.length > 0);

      const payload: any = {
        date_from: dateFrom,
        date_to: dateTo,
        reason: hasTranslations ? JSON.stringify(trimmedReasons) : null,
      };
      if (doctorId !== 'all') payload.doctor_id = doctorId;

      if (editingId) {
        const { error } = await supabaseAdmin
          .from('clinic_closures')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from('clinic_closures').insert(payload);
        if (error) throw error;
      }

      resetForm();
      await fetchClosures();
      alert('Η αποθήκευση ολοκληρώθηκε.');
    } catch (e) {
      console.error(e);
      alert('Σφάλμα κατά την αποθήκευση.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (it: any) => {
    setEditingId(it.id);
    setDoctorId(it.doctor_id || 'all');
    setDateFrom(it.date_from);
    setDateTo(it.date_to);
    const parsed = parseClosureReason(it.reason);
    setReasonGr(parsed.gr || parsed.fallback || '');
    setReasonEn(parsed.en || '');
    setReasonFr(parsed.fr || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Να διαγραφεί οριστικά το κλείσιμο;')) return;
    try {
      const { error } = await supabaseAdmin
        .from('clinic_closures')
        .delete()
        .eq('id', id);
      if (error) throw error;
      if (editingId === id) resetForm();
      await fetchClosures();
    } catch (e) {
      console.error(e);
      alert('Σφάλμα κατά τη διαγραφή.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-400 text-white flex items-center justify-center shadow">📘</div>
          <div>
            <div className="text-lg font-bold text-gray-900 font-poppins">Οδηγίες Χρήσης</div>
            <div className="text-sm text-gray-600 font-nunito">Ακολουθήστε τα παρακάτω βήματα <strong>1 έως 5</strong> με τη σειρά για να ανακοινώσετε το κλείσιμο του ιατρείου.</div>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Doctor card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2">👨‍⚕️</div>
            <label className="text-sm font-semibold text-gray-800 font-poppins">1) Επιλέξτε Γιατρό</label>
          </div>
          <select value={doctorId} onChange={e=>setDoctorId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition font-nunito">
            <option value="all">Όλοι οι γιατροί</option>
            {(doctors||[]).map(d => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2 font-nunito">Για κλείσιμο όλου του ιατρείου αφήστε «Όλοι οι γιατροί».</p>
        </div>

        {/* From date card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mr-2">📅</div>
            <label className="text-sm font-semibold text-gray-800 font-poppins">2) Από Ημερομηνία</label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3">🗓️</span>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition font-nunito" />
          </div>
          <p className="text-xs text-gray-500 mt-2 font-nunito">Η πρώτη μέρα που είστε κλειστά.</p>
        </div>

        {/* To date card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2">🏁</div>
            <label className="text-sm font-semibold text-gray-800 font-poppins">3) Έως Ημερομηνία</label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3">🗓️</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition font-nunito" />
          </div>
          <p className="text-xs text-gray-500 mt-2 font-nunito">Η τελευταία μέρα που είστε κλειστά.</p>
        </div>

        {/* Right column: Step 4 (message) and Step 5 (save) stacked */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col">
          {/* Step 4 */}
          <div>
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mr-2">📝</div>
              <div className="text-sm font-semibold text-gray-800 font-poppins">4) Μήνυμα / Αιτιολογία</div>
            </div>
            <p className="text-xs text-gray-500 font-nunito mb-3">
              Το μήνυμα προβάλλεται στο πολυγλωσσικό site. Συμπληρώστε τις γλώσσες που χρειάζονται.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-nunito">🇬🇷 Ελληνικά</label>
                <textarea
                  value={reasonGr}
                  onChange={e=>setReasonGr(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition font-nunito"
                  rows={3}
                  placeholder="Π.χ. Κλειστά λόγω Πάσχα – Καλές Γιορτές!"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-nunito">🇬🇧 English</label>
                <textarea
                  value={reasonEn}
                  onChange={e=>setReasonEn(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition font-nunito"
                  rows={3}
                  placeholder="e.g. Closed for the holidays – Warm wishes!"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-nunito">🇫🇷 Français</label>
                <textarea
                  value={reasonFr}
                  onChange={e=>setReasonFr(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition font-nunito"
                  rows={3}
                  placeholder="ex. Fermé pour les fêtes – Joyeuses Fêtes !"
                />
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mr-2">💾</div>
              <div className="text-sm font-semibold text-gray-800 font-poppins">5) Αποθήκευση</div>
            </div>
            <div className="flex items-center space-x-2">
              <button disabled={saving} onClick={handleSave} className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg hover:from-indigo-600 hover:to-purple-600 active:scale-[0.98] transition font-poppins">
                {editingId ? '✨ Ενημέρωση' : '💾 Αποθήκευση'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-3 bg-white border text-gray-800 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition">Ακύρωση</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Removed standalone message card: merged into step 4 above */}

      {/* Live preview */}
      {(dateFrom && dateTo) && (
        <div className="bg-gradient-to-r from-yellow-50 to-pink-50 border border-yellow-200 rounded-3xl p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🎈</div>
            <div>
              <div className="font-semibold mb-1 text-gray-800">Προεπισκόπηση μηνύματος στον επισκέπτη</div>
              <div className="text-sm text-gray-800">Από <strong>{dateFrom}</strong> έως <strong>{dateTo}</strong>.</div>
              {(() => {
                const previewMessages = [
                  { label: '🇬🇷', value: reasonGr.trim() },
                  { label: '🇬🇧', value: reasonEn.trim() },
                  { label: '🇫🇷', value: reasonFr.trim() }
                ].filter(entry => entry.value.length > 0);

                if (previewMessages.length === 0) return null;

                return (
                  <div className="text-sm text-gray-700 mt-1 space-y-1">
                    {previewMessages.map(entry => (
                      <div key={entry.label}>
                        <span className="font-medium mr-1">{entry.label}</span>
                        <span>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 font-poppins">📚 Υπάρχοντα Κλεισίματα</h4>
          <button onClick={fetchClosures} disabled={loading} className="px-3 py-2 bg-white border rounded-xl hover:bg-gray-100 disabled:opacity-50 font-nunito">🔄 Ανανέωση</button>
        </div>
        {loading ? (
          <div className="text-gray-600">Φόρτωση...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600 font-nunito">Δεν υπάρχουν καταχωρήσεις. Ήρθε η ώρα για λίγη ξεκούραση; Προσθέστε την πρώτη! 🌞</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px] font-nunito">
              <thead className="bg-white">
                <tr>
                  <th className="text-left p-2">Γιατρός</th>
                  <th className="text-left p-2">Από</th>
                  <th className="text-left p-2">Έως</th>
                  <th className="text-left p-2">Μήνυμα</th>
                  <th className="text-left p-2">Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it:any)=>{
                  const doc = (doctors||[]).find(d=> d.id === it.doctor_id);
                  const reasonTranslations = parseClosureReason(it.reason);
                  const { gr, en, fr, fallback } = reasonTranslations;
                  const hasAnyReason = gr || en || fr || fallback;
                  return (
                    <tr key={it.id} className="border-t">
                      <td className="p-2">{it.doctor_id ? `${doc?.name || it.doctor_id}` : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">Όλοι οι γιατροί</span>}</td>
                      <td className="p-2">{it.date_from}</td>
                      <td className="p-2">{it.date_to}</td>
                      <td className="p-2">
                        {hasAnyReason ? (
                          <div className="space-y-1">
                            {gr && <div><span className="font-medium mr-1">🇬🇷</span>{gr}</div>}
                            {en && <div><span className="font-medium mr-1">🇬🇧</span>{en}</div>}
                            {fr && <div><span className="font-medium mr-1">🇫🇷</span>{fr}</div>}
                            {!gr && !en && !fr && fallback && <div>{fallback}</div>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-2 space-x-2">
                        <button onClick={()=>handleEdit(it)} className="px-3 py-1 bg-white border rounded-xl hover:bg-gray-50">✏️ Επεξεργασία</button>
                        <button onClick={()=>handleDelete(it.id)} className="px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600">🗑️ Διαγραφή</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
 
// ===== Helper Components (εντός αρχείου για ελαχιστοποίηση αλλαγών) =====

type DoctorManagerProps = {
  doctors: Doctor[];
  onChange: (items: Doctor[]) => void;
};

const DoctorManager: React.FC<DoctorManagerProps> = ({ doctors, onChange }) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Παιδοψυχίατρος');
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data, error } = await supabaseAdmin.from('doctors').insert({ name, specialty, active: true }).select();
    setSaving(false);
    if (!error && data) {
      onChange([...(doctors || []), data[0]]);
      setName('');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input className="border rounded-xl px-3 py-2 text-sm sm:text-base" placeholder="Όνομα" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-xl px-3 py-2 text-sm sm:text-base" placeholder="Ειδικότητα" value={specialty} onChange={e=>setSpecialty(e.target.value)} />
        <button disabled={saving} onClick={add} className="px-3 py-2 bg-green-600 text-white rounded-xl text-sm sm:text-base">Προσθήκη</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead><tr className="text-left"><th className="p-2 text-xs sm:text-sm">Όνομα</th><th className="p-2 text-xs sm:text-sm">Ειδικότητα</th><th className="p-2 text-xs sm:text-sm">Ενεργός</th><th className="p-2 text-xs sm:text-sm">Ενέργειες</th></tr></thead>
          <tbody>
            {(doctors||[]).map(d=> (
              <tr key={d.id} className="border-t">
                <td className="p-2 text-xs sm:text-sm">{d.name}</td>
                <td className="p-2 text-xs sm:text-sm">{d.specialty}</td>
                <td className="p-2">
                  <input type="checkbox" checked={d.active} onChange={async (e)=>{
                    const { data } = await supabaseAdmin.from('doctors').update({ active: e.target.checked }).eq('id', d.id).select();
                    if (data) onChange(doctors.map(x=> x.id===d.id? data[0]: x));
                  }} />
                </td>
                <td className="p-2">
                  <button
                    className="px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs sm:text-sm"
                    onClick={async ()=>{
                      if (!confirm('Διαγραφή γιατρού; Θα διαγραφούν και οι διαθεσιμότητες του.')) return;
                      // Διαγραφή availability του γιατρού για αποφυγή orphan slots
                      await supabaseAdmin.from('availability').delete().eq('doctor_id', d.id);
                      const { error } = await supabaseAdmin.from('doctors').delete().eq('id', d.id);
                      if (!error) {
                        onChange((doctors||[]).filter(x=> x.id!==d.id));
                      }
                    }}
                  >Διαγραφή</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type AvailabilityManagerProps = {
  doctors: Doctor[];
  availability: Availability[];
  onChange: (items: Availability[]) => void;
};

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ doctors, availability, onChange }) => {
  const [doctorId, setDoctorId] = useState<string>('');
  // const [date, setDate] = useState(''); // Unused for now
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('17:00');
  const [inc, setInc] = useState<30|60>(30);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = getCurrentDateInTimezone(getUserTimezone());
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }); // YYYY-MM
  const [weekdays, setWeekdays] = useState<{[k:number]: boolean}>({1:true,2:true,3:true,4:true,5:true,6:false,0:false});
  const [singleDate, setSingleDate] = useState<string>('');

  // Set up real-time subscription for availability changes
  useEffect(() => {
    const channel = supabaseAdmin
      .channel('admin_availability_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability'
        },
        (payload: any) => {
          console.log('Admin: Availability change detected:', payload);
          // Refetch availability data
          fetchAvailabilityData();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  const fetchAvailabilityData = async () => {
    try {
      const { data: availData } = await supabaseAdmin
        .from('availability')
        .select('*')
        .order('date');
      onChange(availData || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(()=>{
    if (!doctorId && doctors && doctors.length>0) setDoctorId(doctors[0].id);
  },[doctors, doctorId]);

  const fetchAppointmentsForMonth = useCallback(async () => {
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr);
    const lastDay = new Date(year, monthNum, 0).getDate();
    const monthStart = `${yearStr}-${monthStr}-01`;
    const monthEnd = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
    try {
      const { data } = await supabaseAdmin
        .from('appointments')
        .select('id, date, time, doctor_id, parent_name, email, phone, child_age, concerns, specialty, thematology, urgency, is_first_session, created_at')
        .gte('date', monthStart)
        .lte('date', monthEnd);
      setAppointments((data || []) as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [month]);

  useEffect(() => {
    fetchAppointmentsForMonth();
  }, [fetchAppointmentsForMonth]);

  useEffect(() => {
    const channel = supabaseAdmin
      .channel('admin_calendar_appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => fetchAppointmentsForMonth()
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, [fetchAppointmentsForMonth]);

  // Μεμονωμένη καταχώρηση για συγκεκριμένη ημερομηνία
  const addSingle = async () => {
    if (!doctorId || !singleDate) return;
    const [sh, sm] = from.split(':').map(Number);
    const [eh, em] = to.split(':').map(Number);
    const startM = sh*60+sm; const endM = eh*60+em;
    console.log('[addSingle] doctorId:', doctorId, 'date:', singleDate, 'from:', from, 'to:', to, 'inc:', inc);
    if (endM <= startM) { alert('Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.'); return; }
    const conflicts = (availability||[]).filter(a => a.doctor_id===doctorId && a.date===singleDate);
    let overlap = false;
    for (const a of conflicts) {
      const aStart = toMinutes(String(a.start_time).slice(0,5));
      const aEnd = toMinutes(String(a.end_time).slice(0,5));
      const noOverlap = endM <= aStart || startM >= aEnd;
      if (!noOverlap) { overlap = true; break; }
    }
    console.log('[addSingle] conflicts:', conflicts, 'overlap:', overlap);
    if (overlap) { alert('Υπάρχει ήδη διαθεσιμότητα που επικαλύπτεται στη συγκεκριμένη ημέρα.'); return; }
    setSaving(true);
    const payload = { doctor_id: doctorId, date: singleDate, start_time: from, end_time: to, increment_minutes: inc };
    const { data, error } = await supabaseAdmin.from('availability').insert(payload).select();
    console.log('[addSingle] insert result:', { payload, error, data });
    setSaving(false);
    if (error) { alert('Σφάλμα καταχώρησης'); return; }
    if (data && data.length) {
      onChange([...(availability||[]), data[0]]);
      setSingleDate('');
    }
  };

  const toggleWeekday = (d:number) => setWeekdays(prev => ({ ...prev, [d]: !prev[d] }));

  const generateMonthDates = (yyyyMM: string, enabled: {[k:number]:boolean}) => {
    const [y,m] = yyyyMM.split('-').map(Number);
    const days = new Date(y, m, 0).getDate();
    const results: string[] = [];
    for (let day=1; day<=days; day++) {
      const d = new Date(y, m-1, day);
      const wd = d.getDay();
      if (enabled[wd]) {
        results.push(toDateString(d, getUserTimezone()));
      }
    }
    return results;
  };

  const toMinutes = (t: string): number => {
    if (!t) return 0;
    const parts = t.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    return h*60 + m;
  };

  const bulkCreate = async () => {
    console.log('[bulkCreate] doctorId:', doctorId, 'month:', month, 'from:', from, 'to:', to, 'inc:', inc, 'weekdays:', weekdays);
    if (!doctorId) { alert('Επιλέξτε γιατρό'); return; }
    const [sh, sm] = from.split(':').map(Number);
    const [eh, em] = to.split(':').map(Number);
    const startM = sh*60+sm; const endM = eh*60+em;
    if (endM <= startM) { alert('Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.'); return; }
    setSaving(true);
    // Δημιουργία για όλες τις επιλεγμένες ημέρες του μήνα (βάσει weekdays)
    let dates: string[] = generateMonthDates(month, weekdays);
    console.log('[bulkCreate] candidate dates:', dates);
    const created: any[] = [];
    for (const d of dates) {
      const conflicts = (availability||[]).filter(a => a.doctor_id===doctorId && a.date===d);
      let overlap = false;
      for (const a of conflicts) {
        const aStart = toMinutes(String(a.start_time).slice(0,5));
        const aEnd = toMinutes(String(a.end_time).slice(0,5));
        const noOverlap = endM <= aStart || startM >= aEnd;
        if (!noOverlap) { overlap = true; break; }
      }
      console.log('[bulkCreate] date:', d, 'overlap:', overlap, 'existing:', conflicts);
      if (overlap) continue;
      const payload = { doctor_id: doctorId, date: d, start_time: from, end_time: to, increment_minutes: inc };
      const { data, error } = await supabaseAdmin.from('availability').insert(payload).select();
      console.log('[bulkCreate] insert result:', { payload, error, data });
      if (!error && data && data.length) {
        created.push(data[0]);
      }
    }
    setSaving(false);
    if (created.length === 0) { alert('Δεν δημιουργήθηκε καμία νέα ημέρα (υπάρχουν επικαλύψεις ή ίδιες εγγραφές).'); return; }
    onChange([...(availability||[]), ...created]);
  };

  const daysInMonth = (yyyyMM: string) => {
    const [y,m] = yyyyMM.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  };

  const getMonthGrid = (yyyyMM: string): Array<string | null> => {
    const [y,m] = yyyyMM.split('-').map(Number);
    const userTimezone = getUserTimezone();
    
    // Create first day of month in the user's timezone
    const first = new Date(y, m-1, 1);
    const firstInTimezone = new Date(first.toLocaleString('en-US', { timeZone: userTimezone }));
    const firstW = (firstInTimezone.getDay()+6)%7; // Monday=0
    const total = daysInMonth(yyyyMM);
    const grid: Array<string|null> = [];
    for (let i=0;i<firstW;i++) grid.push(null);
    for (let d=1; d<=total; d++) {
      // Create date string directly in YYYY-MM-DD format
      const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push(date);
    }
    while (grid.length % 7) grid.push(null);
    return grid;
  };

  const monthGrid = getMonthGrid(month);
  const formatHM = (t: string) => (t||'').slice(0,5);
  const rangesByDate = new Map<string, {id:string; start:string; end:string}[]>();
  (availability||[])
    .filter(a => a.doctor_id===doctorId && a.date.startsWith(month))
    .forEach(a => {
      const list = rangesByDate.get(a.date) || [];
      list.push({ id: a.id, start: formatHM(a.start_time as any), end: formatHM(a.end_time as any) });
      rangesByDate.set(a.date, list);
    });

  const formatGreekTime = (time: string): string => {
    if (!time) return '';
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const suffix = h < 12 ? 'π.μ.' : 'μ.μ.';
    h = h % 12;
    if (h === 0) h = 12;
    const hh = h.toString().padStart(2, '0');
    return `${hh}:${mStr} ${suffix}`;
  };

  const getAppointmentForSlot = (date: string, startTime: string, endTime?: string) => {
    // Βρίσκουμε τον γιατρό για να πάρουμε την timezone του
    const selectedDoctor = doctors.find(d => d.id === doctorId);
    const doctorTimezone = getDoctorTimezone(selectedDoctor?.name);
    // Υποθέτουμε ότι τα appointments αποθηκεύονται στην ώρα Ελλάδας (default)
    // ή στην ώρα που έκλεισε ο πελάτης, οπότε τα μετατρέπουμε στη timezone του γιατρού
    const patientTimezone = TIMEZONES.GREECE; // Default: Ελλάδα
    
    return appointments.find(apt => {
      if (doctorId && apt.doctor_id !== doctorId) return false;
      
      // Μετατρέπουμε το appointment time στη timezone του γιατρού
      const aptTimeInPatientTz = apt.time.slice(0, 5);
      const aptTimeInDoctorTz = convertTimeToTimezone(
        apt.date,
        aptTimeInPatientTz,
        patientTimezone,
        doctorTimezone
      ).slice(0, 5);
      
      if (endTime) {
        return apt.date === date && aptTimeInDoctorTz >= startTime && aptTimeInDoctorTz < endTime;
      }
      return apt.date === date && aptTimeInDoctorTz === startTime;
    }) || null;
  };

  // Check if a specific time slot is booked
  const isTimeSlotBooked = (date: string, startTime: string, endTime: string): boolean => {
    return !!getAppointmentForSlot(date, startTime, endTime);
  };

  const [cancelTarget, setCancelTarget] = useState<{id:string; date:string; start:string; end:string} | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [infoAppointment, setInfoAppointment] = useState<Appointment | null>(null);

  const handleCancelAvailability = async () => {
    if (!cancelTarget) return;
    if (!confirm(`Θέλετε να ακυρώσετε τη διαθεσιμότητα ${cancelTarget.date} ${cancelTarget.start}–${cancelTarget.end};`)) {
      return;
    }
    setIsCancelling(true);
    
    try {
      // ΠΡΩΤΑ: Διαγραφή όλων των κρατήσεων που υπάρχουν σε αυτή τη διαθεσιμότητα
      const { error: appointmentsError } = await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('date', cancelTarget.date)
        .gte('time', cancelTarget.start)
        .lte('time', cancelTarget.end);

      if (appointmentsError) {
        console.error('Error deleting appointments:', appointmentsError);
        alert('Σφάλμα κατά τη διαγραφή των κρατήσεων');
        return;
      }

      // ΔΕΥΤΕΡΑ: Διαγραφή διαθεσιμότητας
      const { error } = await supabaseAdmin.from('availability').delete().eq('id', cancelTarget.id);
      
      if (error) {
        alert('Σφάλμα κατά την ακύρωση διαθεσιμότητας');
        return;
      }

      // Ενημέρωση local state
      onChange((availability||[]).filter(a => a.id !== cancelTarget.id));
      
      console.log('Availability and related appointments cancelled successfully:', cancelTarget);
      alert('Η διαθεσιμότητα και όλες οι σχετικές κρατήσεις ακυρώθηκαν επιτυχώς');
      
    } catch (error) {
      console.error('Error cancelling availability:', error);
      alert('Σφάλμα κατά την ακύρωση διαθεσιμότητας');
    } finally {
      setIsCancelling(false);
      setCancelTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 📅 Μηνιαίο Πρόγραμμα - Καθαρό και Οργανωμένο */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
            <span className="text-white text-lg">📅</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 font-poppins">Δημιουργία Μηνιαίου Προγράμματος</h3>
            <p className="text-sm text-gray-600">Δημιουργήστε διαθεσιμότητες για όλο τον μήνα με μία κίνηση</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Αριστερά - Επιλογές */}
          <div className="space-y-4">
            {/* Γιατρός */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍⚕️ Γιατρός</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                value={doctorId} 
                onChange={e=>setDoctorId(e.target.value)}
              >
                {(doctors||[]).map(d=> <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
            </div>

            {/* Μήνας */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📆 Μήνας</label>
              <input 
                type="month" 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                value={month} 
                onChange={e=> setMonth(e.target.value)} 
              />
            </div>

            {/* Ημέρες Εβδομάδας */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Ημέρες Εβδομάδας</label>
              <div className="flex flex-wrap gap-2">
                {[{l:'Δευτέρα',v:1},{l:'Τρίτη',v:2},{l:'Τετάρτη',v:3},{l:'Πέμπτη',v:4},{l:'Παρασκευή',v:5},{l:'Σάββατο',v:6},{l:'Κυριακή',v:0}].map(w=> (
                  <label key={w.v} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all">
                    <input 
                      type="checkbox" 
                      checked={!!weekdays[w.v]} 
                      onChange={()=>toggleWeekday(w.v)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    /> 
                    <span className="text-sm font-medium">{w.l}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Δεξιά - Ώρες και Διάρκεια */}
          <div className="space-y-4">
            {/* Ώρες */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🕘 Από</label>
                <input 
                  type="time" 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                  value={from} 
                  onChange={e=>setFrom(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🕘 Έως</label>
                <input 
                  type="time" 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                  value={to} 
                  onChange={e=>setTo(e.target.value)} 
                />
              </div>
            </div>

            {/* Διάρκεια */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">⏱️ Διάρκεια Συνεδρίας</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                value={inc} 
                onChange={e=> setInc(Number(e.target.value) as 30|60)}
              >
                <option value={30}>30 λεπτά</option>
                <option value={60}>60 λεπτά</option>
              </select>
            </div>

            {/* Κουμπί Δημιουργίας */}
            <button 
              disabled={saving} 
              onClick={bulkCreate} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {saving ? '⏳ Δημιουργία...' : '🚀 Δημιουργία Προγράμματος Μήνα'}
            </button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Συμβουλή:</strong> Θα δημιουργηθούν διαθεσιμότητες για όλες τις επιλεγμένες ημέρες χωρίς να επηρεάσουν ήδη υπάρχουσες εγγραφές.
          </p>
        </div>
      </div>

      {/* ➕ Μεμονωμένη Προσθήκη - Καθαρό και Απλό */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3">
            <span className="text-white text-lg">➕</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 font-poppins">Προσθήκη Μεμονωμένης Συνεδρίας</h3>
            <p className="text-sm text-gray-600">Προσθέστε διαθεσιμότητα για συγκεκριμένη ημερομηνία</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Γιατρός */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍⚕️ Γιατρός</label>
            <select 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
              value={doctorId} 
              onChange={e=>setDoctorId(e.target.value)}
            >
              {(doctors||[]).map(d=> <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
            </select>
          </div>

          {/* Ώρα Έναρξης */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🕘 Από</label>
            <input 
              type="time" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
              value={from} 
              onChange={e=>setFrom(e.target.value)} 
            />
          </div>

          {/* Ώρα Λήξης */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🕘 Έως</label>
            <input 
              type="time" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
              value={to} 
              onChange={e=>setTo(e.target.value)} 
            />
          </div>

          {/* Διάρκεια */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">⏱️ Διάρκεια</label>
            <select 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
              value={inc} 
              onChange={e=> setInc(Number(e.target.value) as 30|60)}
            >
              <option value={30}>30 λεπτά</option>
              <option value={60}>60 λεπτά</option>
            </select>
          </div>

          {/* Ημερομηνία */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Ημερομηνία</label>
            <input 
              type="date" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
              value={singleDate} 
              onChange={e=> setSingleDate(e.target.value)} 
              min={toDateString(getCurrentDateInTimezone(getUserTimezone()), getUserTimezone())} 
            />
          </div>
        </div>

        {/* Κουμπί Προσθήκης */}
        <div className="mt-4">
          <button 
            disabled={saving || !singleDate} 
            onClick={addSingle} 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {saving ? '⏳ Προσθήκη...' : '✅ Προσθήκη Μεμονωμένης Συνεδρίας'}
          </button>
        </div>
      </div>
      {/* 🗓️ Οδηγός Χρωμάτων - Βελτιωμένος */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">🗓️</span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 font-poppins">Οδηγός Χρωμάτων Ημερολογίου</h4>
          <p className="text-sm text-gray-600 mt-1">Κατανοήστε τι σημαίνει κάθε χρώμα στο ημερολόγιο</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-200 hover:border-green-300 transition-all">
            <div className="flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-green-500 mr-3 flex-shrink-0"></span>
              <span className="font-bold text-gray-800">🟢 Πράσινο</span>
            </div>
            <p className="text-sm text-gray-600">Διαθέσιμες συνεδρίες που μπορούν να κρατηθούν από χρήστες</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-200 hover:border-blue-300 transition-all">
            <div className="flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 mr-3 flex-shrink-0"></span>
              <span className="font-bold text-gray-800">🔵 Μπλε</span>
            </div>
            <p className="text-sm text-gray-600">Κρατημένες συνεδρίες που έχουν ήδη κρατηθεί από χρήστες</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-red-200 hover:border-red-300 transition-all">
            <div className="flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-red-400 mr-3 flex-shrink-0"></span>
              <span className="font-bold text-gray-800">🔴 Κόκκινο</span>
            </div>
            <p className="text-sm text-gray-600">Μη διαθέσιμες συνεδρίες (δεν υπάρχει πρόγραμμα)</p>
          </div>
        </div>
      </div>

      {/* 📅 Μηνιαίο Ημερολόγιο - Βελτιωμένο */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white text-lg">📅</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 font-poppins">Πρόγραμμα Μήνα</h3>
              <p className="text-sm text-gray-600">Κλικ σε συνεδρία για ακύρωση διαθεσιμότητας</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="font-medium text-gray-700">Διαθέσιμη</span>
            </div>
            <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              <span className="font-medium text-gray-700">Κρατημένη</span>
            </div>
            <div className="flex items-center bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
              <span className="font-medium text-gray-700">Μη διαθέσιμη</span>
            </div>
          </div>
        </div>
         <div className="grid grid-cols-7 gap-1 sm:gap-2 text-xs sm:text-sm">
          {["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο","Κυριακή"].map(h=> (
            <div key={h} className="text-center font-bold text-gray-700 py-2 sm:py-3 bg-gray-50 rounded-lg border border-gray-200 text-xs sm:text-sm">{h}</div>
          ))}
          {monthGrid.map((d,idx)=>{
            if (!d) return <div key={idx} className="h-12 sm:h-16 rounded-lg bg-gray-50 border border-gray-200" />;
            const rawRanges = rangesByDate.get(d) || [];
            const ranges = rawRanges.slice().sort((a,b)=> toMinutes(a.start) - toMinutes(b.start));
            const has = ranges.length>0;
            return (
              <div key={d} className={`min-h-[3rem] sm:min-h-[4rem] rounded-lg border-2 p-1 sm:p-2 transition-all hover:shadow-md ${has? 'bg-green-50 border-green-300 hover:border-green-400':'bg-red-50 border-red-300 hover:border-red-400'}`} title={d}>
                <div className="text-center text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">{d.slice(-2)}</div>
                {has ? (
                  <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center">
                    {ranges.map((r, i)=> {
                      const isBooked = isTimeSlotBooked(d, r.start, r.end);
                      const appointmentDetails = isBooked ? getAppointmentForSlot(d, r.start, r.end) : null;
                      return (
                        <div key={i} className="relative inline-flex">
                          <button
                            onClick={()=> setCancelTarget({ id: r.id, date: d, start: r.start, end: r.end })}
                            className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-lg text-white text-xs font-medium transition-all transform hover:scale-105 shadow-sm ${
                              isBooked 
                                ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg' 
                                : 'bg-green-500 hover:bg-green-600 hover:shadow-lg'
                            }`}
                            title={isBooked ? "Κρατημένη συνεδρία - Κλικ για ακύρωση διαθεσιμότητας" : "Διαθέσιμη συνεδρία - Κλικ για ακύρωση διαθεσιμότητας"}
                          >
                            {formatGreekTime(r.start)}–{formatGreekTime(r.end)}
                          </button>
                          {isBooked && appointmentDetails && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                setInfoAppointment(appointmentDetails);
                              }}
                              className="absolute -top-3 -left-3 sm:-top-3 sm:-left-3 transform -translate-x-1/4 -translate-y-1/4 bg-white text-blue-600 border border-blue-200 rounded-full p-1 shadow-md hover:bg-blue-50"
                              title="Πληροφορίες κρατήσης"
                            >
                              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-xs text-red-500 font-medium">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* 🗑️ Μαζική Ακύρωση - Βελτιωμένο */}
      <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl border-2 border-red-200 shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mr-3">
            <span className="text-white text-lg">🗑️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 font-poppins">Μαζική Ακύρωση Συνεδριών</h3>
            <p className="text-sm text-gray-600">Ακυρώστε πολλές συνεδρίες ταυτόχρονα</p>
          </div>
        </div>
        <BulkCancel
          doctorId={doctorId}
          onCancelled={(deletedIds)=>{
            if (!deletedIds || deletedIds.length===0) return;
            onChange((availability||[]).filter(a => !deletedIds.includes(a.id)));
          }}
        />
      </div>
      {/* 🚨 Modal Ακύρωσης - Βελτιωμένο */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={()=> !isCancelling && setCancelTarget(null)}>
          <div className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-lg shadow-2xl border-2 border-red-200" onClick={(e)=> e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Ακύρωση Διαθεσιμότητας</h3>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-base sm:text-lg font-semibold text-gray-800">{cancelTarget.date}</div>
                <div className="text-sm text-gray-600">{formatGreekTime(cancelTarget.start)} – {formatGreekTime(cancelTarget.end)}</div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ <strong>Προσοχή:</strong> Θα διαγραφούν όλες οι κρατήσεις που υπάρχουν σε αυτή τη διαθεσιμότητα και θα αφαιρεθεί από το ημερολόγιο των χρηστών.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button 
                disabled={isCancelling} 
                onClick={()=> setCancelTarget(null)} 
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all text-sm sm:text-base"
              >
                Άκυρο
              </button>
              <button 
                disabled={isCancelling} 
                onClick={handleCancelAvailability} 
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                {isCancelling? '⏳ Ακύρωση...' : '🗑️ Ακύρωση Διαθεσιμότητας'}
              </button>
            </div>
          </div>
        </div>
      )}
      {infoAppointment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={()=> setInfoAppointment(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-blue-200 p-6 relative" onClick={(e)=> e.stopPropagation()}>
            <button
              onClick={()=> setInfoAppointment(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Κλείσιμο"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Λεπτομέρειες Κράτησης</h3>
              <p className="text-sm text-gray-500 mt-1">
                {infoAppointment.date} • {formatGreekTime(infoAppointment.time.slice(0,5))}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Στοιχεία Γονέα</h4>
                <p className="text-sm text-gray-700"><strong>Όνομα:</strong> {infoAppointment.parent_name || '—'}</p>
                <p className="text-sm text-gray-700 break-all"><strong>Email:</strong> {infoAppointment.email || '—'}</p>
                {infoAppointment.phone && (
                  <p className="text-sm text-gray-700"><strong>Τηλέφωνο:</strong> {infoAppointment.phone}</p>
                )}
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Συμπληρωμένες Πληροφορίες</h4>
                {infoAppointment.child_age && (
                  <p className="text-sm text-gray-700"><strong>Ηλικία παιδιού:</strong> {infoAppointment.child_age}</p>
                )}
                {infoAppointment.specialty && (
                  <p className="text-sm text-gray-700"><strong>Ειδικότητα:</strong> {infoAppointment.specialty}</p>
                )}
                {infoAppointment.thematology && (
                  <p className="text-sm text-gray-700"><strong>Θεματολογία:</strong> {infoAppointment.thematology}</p>
                )}
                {infoAppointment.urgency && (
                  <p className="text-sm text-gray-700"><strong>Επείγον:</strong> {infoAppointment.urgency}</p>
                )}
                {infoAppointment.is_first_session !== undefined && (
                  <p className="text-sm text-gray-700"><strong>Πρώτη συνεδρία:</strong> {infoAppointment.is_first_session ? 'Ναι' : 'Όχι'}</p>
                )}
              </div>
            </div>
            {infoAppointment.concerns && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Σχόλια / Ανησυχίες</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{infoAppointment.concerns}</p>
              </div>
            )}
            <div className="mt-4 text-xs text-gray-500 text-right">
              Καταχωρήθηκε στις{' '}
              {new Intl.DateTimeFormat('el-GR', {
                dateStyle: 'medium',
                timeStyle: 'short'
              }).format(new Date(infoAppointment.created_at))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type BulkCancelProps = {
  doctorId: string;
  onCancelled: (deletedIds: string[]) => void;
};

const BulkCancel: React.FC<BulkCancelProps> = ({ doctorId, onCancelled }) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!doctorId) { alert('Επιλέξτε γιατρό.'); return; }
    if (!fromDate || !toDate) { alert('Συμπληρώστε Από και Μέχρι ημερομηνίες.'); return; }
    if (toDate < fromDate) { alert('Η "Μέχρι" ημερομηνία πρέπει να είναι μετά την "Από".'); return; }
    if (!confirm(`Θέλετε να ακυρώσετε όλες τις διαθέσιμες συνεδρίες για τον επιλεγμένο γιατρό από ${fromDate} έως ${toDate};`)) { return; }

    setLoading(true);
    
    try {
      // Βρίσκουμε τα IDs των διαθεσιμοτήτων που θα διαγραφούν
      const { data: idsData } = await supabaseAdmin
        .from('availability')
        .select('id')
        .eq('doctor_id', doctorId)
        .gte('date', fromDate)
        .lte('date', toDate);
      const ids = (idsData||[]).map((r:any)=> r.id);

      // ΠΡΩΤΑ: Διαγραφή όλων των κρατήσεων που επηρεάζονται
      const { error: appointmentsError } = await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('doctor_id', doctorId)
        .gte('date', fromDate)
        .lte('date', toDate);

      if (appointmentsError) {
        console.error('Error deleting appointments:', appointmentsError);
        alert('Σφάλμα κατά τη διαγραφή των κρατήσεων');
        return;
      }

      // ΔΕΥΤΕΡΑ: Διαγραφή διαθεσιμοτήτων
      const { error } = await supabaseAdmin
        .from('availability')
        .delete()
        .eq('doctor_id', doctorId)
        .gte('date', fromDate)
        .lte('date', toDate);

      if (error) { 
        alert('Σφάλμα κατά τη μαζική ακύρωση.'); 
        return; 
      }

      console.log('Bulk availability and appointments cancellation completed:', {
        cancelledAvailabilityIds: ids
      });

      onCancelled(ids);
      alert('Η μαζική ακύρωση διαθεσιμοτήτων και κρατήσεων ολοκληρώθηκε.');
      
    } catch (error) {
      console.error('Error in bulk cancellation:', error);
      alert('Σφάλμα κατά τη μαζική ακύρωση.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-red-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Από Ημερομηνία</label>
          <input 
            type="date" 
            value={fromDate} 
            onChange={e=> setFromDate(e.target.value)} 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all" 
            min={toDateString(getCurrentDateInTimezone(getUserTimezone()), getUserTimezone())} 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Μέχρι Ημερομηνία</label>
          <input 
            type="date" 
            value={toDate} 
            onChange={e=> setToDate(e.target.value)} 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all" 
            min={toDateString(getCurrentDateInTimezone(getUserTimezone()), getUserTimezone())} 
          />
        </div>
        <div>
          <button 
            disabled={loading} 
            onClick={run} 
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-2 sm:py-3 rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            {loading? '⏳ Ακύρωση...' : '🗑️ Μαζική Ακύρωση'}
          </button>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm text-red-700">
          ⚠️ <strong>Προσοχή:</strong> Θα διαγραφούν όλες οι κρατήσεις και διαθεσιμότητες στο επιλεγμένο εύρος ημερομηνιών.
        </p>
      </div>
    </div>
  );
};

interface AppointmentsListProps {
  language: 'gr' | 'en';
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ language }) => {
  const [items, setItems] = useState<Appointment[]>([] as any);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchAppointments = async () => {
    const { data } = await supabaseAdmin
      .from('appointments')
      .select('id, date, time, email, phone, parent_name, child_age, concerns, specialty, thematology, urgency, is_first_session, user_timezone, doctors(name, specialty)')
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    setItems((data || []) as any);
  };

  useEffect(() => {
    fetchAppointments();

    // Set up real-time subscription for appointments
    const channel = supabaseAdmin
      .channel('admin_appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload: any) => {
          console.log('Admin: Appointment change detected:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (appointmentId: string) => {
    const apptContent = {
      gr: {
        confirmDelete: 'Επιβεβαίωση Διαγραφής',
        confirmDeleteText: 'Θέλετε να διαγράψετε αυτή την κράτηση; Η ημερομηνία και ώρα θα ελευθερωθούν για νέα ραντεβού.',
        deleteSuccess: 'Η κράτηση διαγράφηκε επιτυχώς',
        deleteError: 'Σφάλμα κατά τη διαγραφή της κράτησης',
        delete: 'Διαγραφή'
      },
      en: {
        confirmDelete: 'Confirm Deletion',
        confirmDeleteText: 'Do you want to delete this appointment? The date and time will be freed for new bookings.',
        deleteSuccess: 'Appointment deleted successfully',
        deleteError: 'Error deleting appointment',
        delete: 'Delete'
      }
    };

    if (!confirm(apptContent[language].confirmDeleteText)) {
      return;
    }

    setDeleting(appointmentId);
    try {
      const { error } = await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      // Ενημέρωση της λίστας μετά τη διαγραφή
      setItems(prev => prev.filter(item => item.id !== appointmentId));
      alert(apptContent[language].deleteSuccess);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert(apptContent[language].deleteError);
    } finally {
      setDeleting(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Κρατήσεις Ολόκληρου Ιατρείου</h3>
            <p className="text-sm text-gray-600 mt-1">Σύνολο: {items.length} κρατήσεις</p>
          </div>
          {items.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                {totalPages} σελίδα{totalPages !== 1 ? 'ς' : ''}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ημερομηνία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ώρα</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Γιατρός</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Όνομα</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ηλικία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Τηλέφωνο</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ειδικότητα</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Θεματολογία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Επείγον</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Πρώτη Συνεδρία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ανησυχίες</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((a:any, index)=> (
              <tr key={a.id} className={`border-t hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.date}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{a.time}</span>
                    <span className="text-lg" title={getCountryFlagTooltip(a.user_timezone)}>
                      {getCountryFlagFromTimezone(a.user_timezone)}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.doctors? `${a.doctors.name} — ${a.doctors.specialty}`: a.doctor_id || 'Δεν έχει οριστεί'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">{a.parent_name}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.child_age || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.phone || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.email}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.specialty || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.thematology || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.urgency || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.is_first_session ? 'Ναι' : 'Όχι'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 max-w-xs truncate" title={a.concerns}>{a.concerns || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    title={language === 'gr' ? 'Διαγραφή κράτησης' : 'Delete appointment'}
                  >
                    {deleting === a.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span className="text-xs sm:text-sm">
                      {language === 'gr' ? 'Διαγραφή' : 'Delete'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-500">
            Εμφάνιση {startIndex + 1}-{Math.min(endIndex, items.length)} από {items.length} κρατήσεις
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
    </div>
  );
};

interface AnnaAppointmentsListProps {
  language: 'gr' | 'en';
}

const AnnaAppointmentsList: React.FC<AnnaAppointmentsListProps> = ({ language }) => {
  const [items, setItems] = useState<Appointment[]>([] as any);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const TARGET_DOCTOR_NAME = 'Dr. Άννα Μαρία Φύτρου';
  const TARGET_DOCTOR_SPECIALTY = 'Ψυχίατρος Παιδιού και Εφήβου & Ψυχοθεραπεύτρια';

  const fetchAppointments = async () => {
    const { data } = await supabaseAdmin
      .from('appointments')
      .select('id, date, time, email, phone, parent_name, child_age, concerns, specialty, thematology, urgency, is_first_session, user_timezone, doctors(name, specialty)')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    const filtered = (data || []).filter((item: any) => {
      const doctorName = item?.doctors?.name;
      const doctorSpecialty = item?.doctors?.specialty;
      return doctorName === TARGET_DOCTOR_NAME && doctorSpecialty === TARGET_DOCTOR_SPECIALTY;
    });

    setItems(filtered as any);
  };

  useEffect(() => {
    fetchAppointments();

    // Set up real-time subscription for appointments
    const channel = supabaseAdmin
      .channel('admin_anna_appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload: any) => {
          console.log('Admin: Anna appointment change detected:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (appointmentId: string) => {
    const apptContent = {
      gr: {
        confirmDelete: 'Επιβεβαίωση Διαγραφής',
        confirmDeleteText: 'Θέλετε να διαγράψετε αυτή την κράτηση; Η ημερομηνία και ώρα θα ελευθερωθούν για νέα ραντεβού.',
        deleteSuccess: 'Η κράτηση διαγράφηκε επιτυχώς',
        deleteError: 'Σφάλμα κατά τη διαγραφή της κράτησης',
        delete: 'Διαγραφή'
      },
      en: {
        confirmDelete: 'Confirm Deletion',
        confirmDeleteText: 'Do you want to delete this appointment? The date and time will be freed for new bookings.',
        deleteSuccess: 'Appointment deleted successfully',
        deleteError: 'Error deleting appointment',
        delete: 'Delete'
      }
    };

    if (!confirm(apptContent[language].confirmDeleteText)) {
      return;
    }

    setDeleting(appointmentId);
    try {
      const { error } = await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      // Ενημέρωση της λίστας μετά τη διαγραφή
      setItems(prev => prev.filter(item => item.id !== appointmentId));
      alert(apptContent[language].deleteSuccess);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert(apptContent[language].deleteError);
    } finally {
      setDeleting(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Κρατήσεις Dr. Άννα Μαρία Φύτρου</h3>
            <p className="text-sm text-gray-600 mt-1">Σύνολο: {items.length} κρατήσεις</p>
          </div>
          {items.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                {totalPages} σελίδα{totalPages !== 1 ? 'ς' : ''}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ημερομηνία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ώρα</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Γιατρός</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Όνομα</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ηλικία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Τηλέφωνο</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ειδικότητα</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Θεματολογία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Επείγον</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Πρώτη Συνεδρία</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ανησυχίες</th>
              <th className="px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((a:any, index)=> (
              <tr key={a.id} className={`border-t hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.date}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{a.time}</span>
                    <span className="text-lg" title={getCountryFlagTooltip(a.user_timezone)}>
                      {getCountryFlagFromTimezone(a.user_timezone)}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.doctors? `${a.doctors.name} — ${a.doctors.specialty}`: a.doctor_id || 'Δεν έχει οριστεί'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">{a.parent_name}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.child_age || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.phone || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.email}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.specialty || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.thematology || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.urgency || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{a.is_first_session ? 'Ναι' : 'Όχι'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 max-w-xs truncate" title={a.concerns}>{a.concerns || '-'}</td>
                <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    title={language === 'gr' ? 'Διαγραφή κράτησης' : 'Delete appointment'}
                  >
                    {deleting === a.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span className="text-xs sm:text-sm">
                      {language === 'gr' ? 'Διαγραφή' : 'Delete'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-gray-500">
            Εμφάνιση {startIndex + 1}-{Math.min(endIndex, items.length)} από {items.length} κρατήσεις
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
    </div>
  );
};
