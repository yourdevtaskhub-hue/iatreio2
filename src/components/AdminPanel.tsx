import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Eye, EyeOff, RefreshCw, CalendarPlus, UserPlus, Settings } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';
import { Review } from '../types/reviews';
import { Doctor, Availability, Appointment, AdminSettings } from '../types/appointments';

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
      saved: 'Οι ρυθμίσεις αποθηκεύτηκαν'
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
      saved: 'Settings saved'
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
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">Κρατήσεις</h3>
              <AppointmentsList />
            </div>
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
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('17:00');
  const [inc, setInc] = useState<30|60>(30);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7)); // YYYY-MM
  const [weekdays, setWeekdays] = useState<{[k:number]: boolean}>({1:true,2:true,3:true,4:true,5:true,6:false,0:false});
  const [singleDate, setSingleDate] = useState<string>('');

  useEffect(()=>{
    if (!doctorId && doctors && doctors.length>0) setDoctorId(doctors[0].id);
  },[doctors]);

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
        results.push(d.toISOString().slice(0,10));
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
      const date = new Date(y, m-1, d).toISOString().slice(0,10);
      grid.push(date);
    }
    while (grid.length % 7) grid.push(null);
    return grid;
  };

  const monthGrid = getMonthGrid(month);
  const formatHM = (t: string) => (t||'').slice(0,5);
  const rangesByDate = new Map<string, {start:string; end:string}[]>();
  (availability||[])
    .filter(a => a.doctor_id===doctorId && a.date.startsWith(month))
    .forEach(a => {
      const list = rangesByDate.get(a.date) || [];
      list.push({ start: formatHM(a.start_time as any), end: formatHM(a.end_time as any) });
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

  return (
    <div>
      {/* Γρήγορη δημιουργία μηνιαίου προγράμματος */}
      <div className="mb-6 p-4 rounded-xl border bg-gray-50">
        <div className="flex flex-wrap gap-3 items-center">
          <select className="border rounded-xl px-3 py-2" value={doctorId} onChange={e=>setDoctorId(e.target.value)}>
            {(doctors||[]).map(d=> <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
          </select>
          <input type="month" className="border rounded-xl px-3 py-2" value={month} onChange={e=> setMonth(e.target.value)} />
          <div className="flex items-center gap-2">
            {[{l:'Δ',v:1},{l:'Τ',v:2},{l:'Τρ',v:3},{l:'Π',v:4},{l:'Πρ',v:5},{l:'Σ',v:6},{l:'Κ',v:0}].map(w=> (
              <label key={w.v} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={!!weekdays[w.v]} onChange={()=>toggleWeekday(w.v)} /> {w.l}
              </label>
            ))}
          </div>
          <input type="time" className="border rounded-xl px-3 py-2" value={from} onChange={e=>setFrom(e.target.value)} />
          <input type="time" className="border rounded-xl px-3 py-2" value={to} onChange={e=>setTo(e.target.value)} />
          <select className="border rounded-xl px-3 py-2" value={inc} onChange={e=> setInc(Number(e.target.value) as 30|60)}>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
          <button disabled={saving} onClick={bulkCreate} className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50">Δημιουργία Προγράμματος Μήνα</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Επιλέξτε μήνα, ημέρες εβδομάδας και ώρες. Θα δημιουργηθούν διαθεσιμότητες για όλες τις αντίστοιχες ημέρες χωρίς να επηρεάσουν ήδη υπάρχουσες εγγραφές.</p>
      </div>

      {/* Ρυθμίσεις μαζικής δημιουργίας + μεμονωμένη καταχώρηση */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select className="border rounded-xl px-3 py-2" value={doctorId} onChange={e=>setDoctorId(e.target.value)}>
          {(doctors||[]).map(d=> <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
        </select>
        <input type="time" className="border rounded-xl px-3 py-2" value={from} onChange={e=>setFrom(e.target.value)} />
        <input type="time" className="border rounded-xl px-3 py-2" value={to} onChange={e=>setTo(e.target.value)} />
        <select className="border rounded-xl px-3 py-2" value={inc} onChange={e=> setInc(Number(e.target.value) as 30|60)}>
          <option value={30}>30</option>
          <option value={60}>60</option>
        </select>
        <input type="date" className="border rounded-xl px-3 py-2" value={singleDate} onChange={e=> setSingleDate(e.target.value)} placeholder="dd/mm/yyyy" />
        <button disabled={saving || !singleDate} onClick={addSingle} className="px-3 py-2 bg-green-600 text-white rounded-xl disabled:opacity-50">Προσθήκη (μεμονωμένη)</button>
      </div>
      {/* Μηνιαίο Ημερολόγιο (compact, red->default, green->available) */}
      <div className="rounded-2xl border p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Πρόγραμμα Μήνα</div>
          <div className="text-xs space-x-3">
            <span className="inline-flex items-center"><span className="w-3 h-3 rounded-sm bg-green-500 mr-1"></span> Διαθέσιμη</span>
            <span className="inline-flex items-center ml-3"><span className="w-3 h-3 rounded-sm bg-red-400 mr-1"></span> Μη διαθέσιμη</span>
          </div>
        </div>
         <div className="grid grid-cols-7 gap-1 text-[11px] md:text-xs">
          {["Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ","Κυρ"].map(h=> (
            <div key={h} className="text-center font-semibold text-gray-600 py-1">{h}</div>
          ))}
          {monthGrid.map((d,idx)=>{
            if (!d) return <div key={idx} className="h-12 rounded-lg bg-gray-50" />;
            const rawRanges = rangesByDate.get(d) || [];
            const ranges = rawRanges.slice().sort((a,b)=> toMinutes(a.start) - toMinutes(b.start));
            const has = ranges.length>0;
            return (
              <div key={d} className={`min-h-[3rem] rounded-lg border p-1 ${has? 'bg-green-50 border-green-500':'bg-red-50 border-red-400'}`} title={d}>
                <div className="text-center text-xs font-semibold text-gray-700 mb-1">{d.slice(-2)}</div>
                {has ? (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {ranges.map((r, i)=> (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-green-500 text-white text-[10px]">{formatGreekTime(r.start)}–{formatGreekTime(r.end)}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-[10px] text-red-500">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AppointmentsList: React.FC = () => {
  const [items, setItems] = useState<Appointment[]>([] as any);
  useEffect(()=>{ (async ()=>{
    const { data } = await supabaseAdmin
      .from('appointments')
      .select('id, date, time, email, phone, parent_name, child_age, concerns, specialty, thematology, urgency, is_first_session, doctors(name, specialty)')
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    setItems(data || []);
  })(); }, []);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left">
          <th className="p-2">Ημερομηνία</th>
          <th className="p-2">Ώρα</th>
          <th className="p-2">Γιατρός</th>
          <th className="p-2">Όνομα</th>
          <th className="p-2">Ηλικία</th>
          <th className="p-2">Τηλέφωνο</th>
          <th className="p-2">Email</th>
          <th className="p-2">Ειδικότητα</th>
          <th className="p-2">Θεματολογία</th>
          <th className="p-2">Επείγον</th>
          <th className="p-2">Πρώτη Συνεδρία</th>
          <th className="p-2">Ανησυχίες</th>
        </tr></thead>
        <tbody>
          {items.map((a:any)=> (
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.date}</td>
              <td className="p-2">{a.time}</td>
              <td className="p-2">{a.doctors? `${a.doctors.name} — ${a.doctors.specialty}`: a.doctor_id || 'Δεν έχει οριστεί'}</td>
              <td className="p-2">{a.parent_name}</td>
              <td className="p-2">{a.child_age || '-'}</td>
              <td className="p-2">{a.phone || '-'}</td>
              <td className="p-2">{a.email}</td>
              <td className="p-2">{a.specialty || '-'}</td>
              <td className="p-2">{a.thematology || '-'}</td>
              <td className="p-2">{a.urgency || '-'}</td>
              <td className="p-2">{a.is_first_session ? 'Ναι' : 'Όχι'}</td>
              <td className="p-2 max-w-xs truncate" title={a.concerns}>{a.concerns || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
