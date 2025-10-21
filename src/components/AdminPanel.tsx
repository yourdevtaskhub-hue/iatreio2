import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';
import { Review } from '../types/reviews';
import { Doctor, Availability, Appointment, AdminSettings } from '../types/appointments';
import { getUserTimezone, toDateString, getCurrentDateInTimezone } from '../lib/timezone';

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
  const [activeTab, setActiveTab] = useState<'reviews' | 'appointments'>('reviews');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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
      logout: 'Αποσύνδεση'
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
      logout: 'Logout'
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
        supabaseAdmin.from('doctors').select('*').order('name'),
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
        (payload) => {
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
        (payload) => {
          console.log('Admin: Availability change detected:', payload);
          fetchAppointmentsMeta();
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

  useEffect(() => {
    fetchReviews();
    fetchAppointmentsMeta();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4 font-poppins">
                {content[language].title}
              </h1>
              <p className="text-xl text-gray-600 font-nunito">
                {content[language].subtitle}
              </p>
            </div>
            {onLogout && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2"
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
            <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 font-semibold ${activeTab==='reviews'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>Κριτικές</button>
            <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 font-semibold ${activeTab==='appointments'?'bg-gradient-to-r from-rose-soft to-purple-soft text-white':'text-gray-700'}`}>{apptContent[language].tabTitle}</button>
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
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
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
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
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
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].name}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].rating}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].topic}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].status}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-poppins">
                      {content[language].createdAt}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-poppins">
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
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 font-poppins">
                          {review.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600 font-nunito">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-nunito max-w-xs truncate">
                          {review.session_topic}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status)}`}>
                          {getStatusText(review.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-nunito">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
            <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
              <label className="flex items-center space-x-3">
                <input type="checkbox" checked={settings.lock_half_hour} onChange={e=> setSettings({ ...settings, lock_half_hour: e.target.checked })} />
                <span className="font-semibold">{apptContent[language].lockLabel}</span>
              </label>
              <button disabled={isSavingSettings} onClick={async ()=>{ setIsSavingSettings(true); await supabaseAdmin.from('admin_settings').upsert({ id: 1, lock_half_hour: settings.lock_half_hour }); setIsSavingSettings(false); alert(apptContent[language].saved); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50">{apptContent[language].save}</button>
            </div>
          </motion.div>
        )}

        {/* Review Detail Modal */}
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
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
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedReview.status)}`}>
                    {getStatusText(selectedReview.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 font-nunito">
                  <div>
                    <span className="font-semibold">{content[language].createdAt}:</span>
                    <br />
                    {new Date(selectedReview.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">{content[language].updatedAt}:</span>
                    <br />
                    {new Date(selectedReview.updated_at).toLocaleString()}
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
      <div className="flex gap-2 mb-4">
        <input className="border rounded-xl px-3 py-2" placeholder="Όνομα" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Ειδικότητα" value={specialty} onChange={e=>setSpecialty(e.target.value)} />
        <button disabled={saving} onClick={add} className="px-3 py-2 bg-green-600 text-white rounded-xl">Προσθήκη</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Όνομα</th><th className="p-2">Ειδικότητα</th><th className="p-2">Ενεργός</th><th className="p-2">Ενέργειες</th></tr></thead>
          <tbody>
            {(doctors||[]).map(d=> (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.specialty}</td>
                <td className="p-2">
                  <input type="checkbox" checked={d.active} onChange={async (e)=>{
                    const { data } = await supabaseAdmin.from('doctors').update({ active: e.target.checked }).eq('id', d.id).select();
                    if (data) onChange(doctors.map(x=> x.id===d.id? data[0]: x));
                  }} />
                </td>
                <td className="p-2">
                  <button
                    className="px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
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
        (payload) => {
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
  const [appointments, setAppointments] = useState<{date: string, time: string}[]>([]);

  useEffect(()=>{
    if (!doctorId && doctors && doctors.length>0) setDoctorId(doctors[0].id);
  },[doctors]);

  // Fetch appointments for the current month
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) return;
      try {
        const { data } = await supabaseAdmin
          .from('appointments')
          .select('date, time')
          .eq('doctor_id', doctorId)
          .gte('date', `${month}-01`)
          .lte('date', `${month}-31`);
        setAppointments(data || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, [doctorId, month]);

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
    const first = new Date(y, m-1, 1);
    const firstW = (first.getDay()+6)%7; // Monday=0
    const total = daysInMonth(yyyyMM);
    const grid: Array<string|null> = [];
    for (let i=0;i<firstW;i++) grid.push(null);
    for (let d=1; d<=total; d++) {
      const date = toDateString(new Date(y, m-1, d), getUserTimezone());
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

  // Check if a specific time slot is booked
  const isTimeSlotBooked = (date: string, startTime: string, endTime: string): boolean => {
    return appointments.some(apt => {
      const aptTime = apt.time.slice(0, 5); // Get HH:MM format
      return apt.date === date && 
             aptTime >= startTime && 
             aptTime < endTime;
    });
  };

  const [cancelTarget, setCancelTarget] = useState<{id:string; date:string; start:string; end:string} | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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
         <div className="grid grid-cols-7 gap-2 text-sm">
          {["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο","Κυριακή"].map(h=> (
            <div key={h} className="text-center font-bold text-gray-700 py-3 bg-gray-50 rounded-lg border border-gray-200">{h}</div>
          ))}
          {monthGrid.map((d,idx)=>{
            if (!d) return <div key={idx} className="h-16 rounded-lg bg-gray-50 border border-gray-200" />;
            const rawRanges = rangesByDate.get(d) || [];
            const ranges = rawRanges.slice().sort((a,b)=> toMinutes(a.start) - toMinutes(b.start));
            const has = ranges.length>0;
            return (
              <div key={d} className={`min-h-[4rem] rounded-lg border-2 p-2 transition-all hover:shadow-md ${has? 'bg-green-50 border-green-300 hover:border-green-400':'bg-red-50 border-red-300 hover:border-red-400'}`} title={d}>
                <div className="text-center text-sm font-bold text-gray-800 mb-2">{d.slice(-2)}</div>
                {has ? (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {ranges.map((r, i)=> {
                      const isBooked = isTimeSlotBooked(d, r.start, r.end);
                      return (
                        <button
                          key={i}
                          onClick={()=> setCancelTarget({ id: r.id, date: d, start: r.start, end: r.end })}
                          className={`px-2 py-1 rounded-lg text-white text-xs font-medium transition-all transform hover:scale-105 shadow-sm ${
                            isBooked 
                              ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg' 
                              : 'bg-green-500 hover:bg-green-600 hover:shadow-lg'
                          }`}
                          title={isBooked ? "Κρατημένη συνεδρία - Κλικ για ακύρωση διαθεσιμότητας" : "Διαθέσιμη συνεδρία - Κλικ για ακύρωση διαθεσιμότητας"}
                        >
                          {formatGreekTime(r.start)}–{formatGreekTime(r.end)}
                        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={()=> !isCancelling && setCancelTarget(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border-2 border-red-200" onClick={(e)=> e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Ακύρωση Διαθεσιμότητας</h3>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-lg font-semibold text-gray-800">{cancelTarget.date}</div>
                <div className="text-sm text-gray-600">{formatGreekTime(cancelTarget.start)} – {formatGreekTime(cancelTarget.end)}</div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ <strong>Προσοχή:</strong> Θα διαγραφούν όλες οι κρατήσεις που υπάρχουν σε αυτή τη διαθεσιμότητα και θα αφαιρεθεί από το ημερολόγιο των χρηστών.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                disabled={isCancelling} 
                onClick={()=> setCancelTarget(null)} 
                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Άκυρο
              </button>
              <button 
                disabled={isCancelling} 
                onClick={handleCancelAvailability} 
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg"
              >
                {isCancelling? '⏳ Ακύρωση...' : '🗑️ Ακύρωση Διαθεσιμότητας'}
              </button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
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
  const itemsPerPage = 6;

  const fetchAppointments = async () => {
    const { data } = await supabaseAdmin
      .from('appointments')
      .select('id, date, time, email, phone, parent_name, child_age, concerns, specialty, thematology, urgency, is_first_session, doctors(name, specialty)')
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
        (payload) => {
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
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ημερομηνία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ώρα</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Γιατρός</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Όνομα</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ηλικία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Τηλέφωνο</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ειδικότητα</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Θεματολογία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Επείγον</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Πρώτη Συνεδρία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ανησυχίες</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((a:any, index)=> (
              <tr key={a.id} className={`border-t hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3 text-sm text-gray-900">{a.date}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.time}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.doctors? `${a.doctors.name} — ${a.doctors.specialty}`: a.doctor_id || 'Δεν έχει οριστεί'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.parent_name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.child_age || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.phone || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.specialty || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.thematology || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.urgency || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.is_first_session ? 'Ναι' : 'Όχι'}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={a.concerns}>{a.concerns || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    title={language === 'gr' ? 'Διαγραφή κράτησης' : 'Delete appointment'}
                  >
                    {deleting === a.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span className="text-sm">
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
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Εμφάνιση {startIndex + 1}-{Math.min(endIndex, items.length)} από {items.length} κρατήσεις
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Προηγούμενη
            </button>
            <span className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  const itemsPerPage = 6;

  const fetchAppointments = async () => {
    const { data } = await supabaseAdmin
      .from('appointments')
      .select('id, date, time, email, phone, parent_name, child_age, concerns, specialty, thematology, urgency, is_first_session, doctors(name, specialty)')
      .eq('doctors.name', 'Dr. Άννα Μαρία Φύτρου')
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    setItems((data || []) as any);
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
        (payload) => {
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
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ημερομηνία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ώρα</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Γιατρός</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Όνομα</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ηλικία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Τηλέφωνο</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ειδικότητα</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Θεματολογία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Επείγον</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Πρώτη Συνεδρία</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ανησυχίες</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((a:any, index)=> (
              <tr key={a.id} className={`border-t hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-4 py-3 text-sm text-gray-900">{a.date}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.time}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.doctors? `${a.doctors.name} — ${a.doctors.specialty}`: a.doctor_id || 'Δεν έχει οριστεί'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.parent_name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.child_age || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.phone || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.specialty || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.thematology || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.urgency || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.is_first_session ? 'Ναι' : 'Όχι'}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={a.concerns}>{a.concerns || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    title={language === 'gr' ? 'Διαγραφή κράτησης' : 'Delete appointment'}
                  >
                    {deleting === a.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    <span className="text-sm">
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
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Εμφάνιση {startIndex + 1}-{Math.min(endIndex, items.length)} από {items.length} κρατήσεις
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Προηγούμενη
            </button>
            <span className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Επόμενη
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
