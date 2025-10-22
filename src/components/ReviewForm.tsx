import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ReviewSubmission } from '../types/reviews';

interface ReviewFormProps {
  language: 'gr' | 'en';
}

const ReviewForm: React.FC<ReviewFormProps> = ({ language }) => {
  const [formData, setFormData] = useState<ReviewSubmission>({
    name: '',
    rating: 0,
    text: '',
    session_topic: ''
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const content = {
    gr: {
      title: 'Αφήστε την Αξιολόγηση σας',
      subtitle: 'Η γνώμη σας είναι σημαντική για εμάς',
      nameLabel: 'Όνομα',
      namePlaceholder: 'Το όνομά σας',
      sessionTopicLabel: 'Θέμα Συνεδρίας',
      sessionTopicPlaceholder: 'π.χ. Άγχος, Διαπροσωπικές Σχέσεις, Σχολικές Δυσκολίες',
      ratingLabel: 'Αξιολόγηση',
      textLabel: 'Η Αξιολόγησή σας',
      textPlaceholder: 'Περιγράψτε την εμπειρία σας...',
      submitButton: 'Υποβολή Αξιολόγησης',
      submitting: 'Υποβολή...',
      successTitle: 'Ευχαριστούμε!',
      successMessage: 'Η αξιολόγησή σας υποβλήθηκε επιτυχώς και θα ελεγχθεί σύντομα.',
      errorMessage: 'Υπήρξε σφάλμα κατά την υποβολή. Παρακαλώ δοκιμάστε ξανά.',
      required: 'Απαιτείται',
      ratingRequired: 'Παρακαλώ επιλέξτε αξιολόγηση'
    },
    en: {
      title: 'Leave Your Review',
      subtitle: 'Your opinion matters to us',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      sessionTopicLabel: 'Session Topic',
      sessionTopicPlaceholder: 'e.g. Anxiety, Interpersonal Relationships, School Difficulties',
      ratingLabel: 'Rating',
      textLabel: 'Your Review',
      textPlaceholder: 'Describe your experience...',
      submitButton: 'Submit Review',
      submitting: 'Submitting...',
      successTitle: 'Thank you!',
      successMessage: 'Your review has been submitted successfully and will be reviewed shortly.',
      errorMessage: 'There was an error submitting. Please try again.',
      required: 'Required',
      ratingRequired: 'Please select a rating'
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.rating === 0) {
      setError(content[language].ratingRequired);
      return;
    }

    if (!formData.name.trim() || !formData.text.trim() || !formData.session_topic.trim()) {
      setError(content[language].required);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          name: formData.name.trim(),
          rating: formData.rating,
          text: formData.text.trim(),
          session_topic: formData.session_topic.trim(),
          status: 'pending'
        }]);

      if (error) throw error;

      setIsSubmitted(true);
      setFormData({
        name: '',
        rating: 0,
        text: '',
        session_topic: ''
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(content[language].errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-4xl shadow-xl border border-green-200 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="bg-green-500 p-4 rounded-full w-fit mx-auto mb-6"
        >
          <CheckCircle className="h-8 w-8 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-green-800 mb-4 font-poppins">
          {content[language].successTitle}
        </h3>
        <p className="text-green-700 font-nunito leading-relaxed">
          {content[language].successMessage}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSubmitted(false)}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-700 transition-colors"
        >
          {language === 'gr' ? 'Νέα Αξιολόγηση' : 'New Review'}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-pastel-pink to-baby-blue p-8 rounded-4xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-4 font-poppins">
          {content[language].title}
        </h3>
        <p className="text-gray-600 font-nunito">
          {content[language].subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
            {content[language].nameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={content[language].namePlaceholder}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
            {content[language].sessionTopicLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="session_topic"
            value={formData.session_topic}
            onChange={handleInputChange}
            placeholder={content[language].sessionTopicPlaceholder}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
            {content[language].ratingLabel} <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleStarClick(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredStar || formData.rating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
            {content[language].textLabel} <span className="text-red-500">*</span>
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder={content[language].textPlaceholder}
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito resize-none"
            required
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-nunito"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-rose-soft to-purple-soft text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>{content[language].submitting}</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>{content[language].submitButton}</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
