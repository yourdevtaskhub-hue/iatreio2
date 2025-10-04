import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';
import { Review } from '../types/reviews';

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
