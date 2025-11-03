import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review } from '../types/reviews';
import ReviewForm from './ReviewForm';

interface TestimonialsProps {
  language: 'gr' | 'en' | 'fr';
}

const Testimonials: React.FC<TestimonialsProps> = ({ language }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  const content = {
    gr: {
      title: 'Αξιολογήσεις Γονέων και Εφήβων',
      subtitle: 'Ιστορίες Ελπίδας και Θεραπείας',
      description: 'Ακούστε από οικογένειες που βρήκαν υποστήριξη, κατανόηση και θεραπεία μέσω της φροντίδας μας.',
      testimonials: [
        {
          name: 'Μαρία Κ.',
          role: 'Μητέρα 12χρονου',
          text: 'Η Δρ. Φύτρου άλλαξε τη ζωή της οικογένειας μας. Η κόρη μου που αντιμετώπιζε άγχος, τώρα είναι πιο ήρεμη και χαρούμενη. Η προσέγγισή της είναι τόσο ζεστή και κατανοητή.',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Μητέρα 12χρονου'
        },
        {
          name: 'Γιάννης Π.',
          role: 'Πατέρας 15χρονου',
          text: 'Ο γιος μου ήταν κλειστός και θυμωμένος. Μετά από μήνες θεραπείας με τη Δρ. Φύτρου, επικοινωνεί ανοιχτά και έχει βρει τρόπους να διαχειρίζεται τα συναισθήματά του.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Πατέρας 15χρονου'
        },
        {
          name: 'Ελένη Μ.',
          role: 'Μητέρα 13χρονης',
          text: 'Η διαδικτυακή θεραπεία ήταν σωτήρια για εμάς. Η έφηβη μας ηταν αρκετά στεναχωρεμένη αλλα η κυρία Δρ. Φύτρου κατάφερε να δημιουργήσει μια καλή σχέση μαζί της και να της δείξει τον δρομο για να βρει νεους τροπους να ειναι πιο χαρουμενη και πιο ηρεμη',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Μητέρα 13χρονης'
        }
      ]
    },
    en: {
      title: 'Parent Testimonials',
      subtitle: 'Stories of Hope and Healing',
      description: 'Hear from families who found support, understanding, and healing through our care.',
      testimonials: [
        {
          name: 'Maria K.',
          role: 'Mother of 12-year-old',
          text: 'Dr. Fytrou changed our family\'s life. My daughter who was struggling with anxiety is now more confident and happy. Her approach is so warm and understanding.',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Mother of 12-year-old'
        },
        {
          name: 'John P.',
          role: 'Father of teenager',
          text: 'My son was withdrawn and angry. After months of therapy with Dr. Fytrou, he communicates openly and has found ways to manage his emotions.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Father of teenager'
        },
        {
          name: 'Helen M.',
          role: 'Mother of 13-year-old',
          text: 'Online therapy was a lifesaver for us. Our teenager was quite sad but Dr. Fytrou managed to create a good relationship with her and show her the way to find new ways to be happier and more calm.',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Mother of 13-year-old'
        }
      ]
    },
    fr: {
      title: 'Témoignages de Parents et Adolescents',
      subtitle: 'Histoires d\'Espoir et de Guérison',
      description: 'Écoutez les familles qui ont trouvé soutien, compréhension et guérison grâce à nos soins.',
      testimonials: [
        {
          name: 'Marie K.',
          role: 'Mère d\'un enfant de 12 ans',
          text: 'Dr Fytrou a changé la vie de notre famille. Ma fille qui luttait contre l\'anxiété est maintenant plus confiante et heureuse. Son approche est si chaleureuse et compréhensive.',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Mère d\'un enfant de 12 ans'
        },
        {
          name: 'Jean P.',
          role: 'Père d\'un adolescent',
          text: 'Mon fils était renfermé et en colère. Après des mois de thérapie avec Dr Fytrou, il communique ouvertement et a trouvé des moyens de gérer ses émotions.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Père d\'un adolescent'
        },
        {
          name: 'Hélène M.',
          role: 'Mère d\'une adolescente de 13 ans',
          text: 'La thérapie en ligne a été un sauvetage pour nous. Notre adolescente était assez triste mais Dr Fytrou a réussi à créer une bonne relation avec elle et lui montrer le chemin pour trouver de nouvelles façons d\'être plus heureuse et plus calme.',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          rating: 5,
          session_topic: 'Mère d\'une adolescente de 13 ans'
        }
      ]
    }
  };

  // Fetch approved reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
        setCurrentPage(1); // Reset to first page when reviews change
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to mock data if database fails
        setReviews([]);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Use database reviews if available, otherwise fallback to mock data
  const allReviews = reviews.length > 0 ? reviews : content[language].testimonials;
  
  // Calculate pagination
  const totalPages = Math.ceil(allReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const displayReviews = allReviews.slice(startIndex, endIndex);

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mt-2 mb-6 font-poppins">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
              {content[language].title}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-nunito">
            {content[language].description}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-soft mx-auto mb-4"></div>
            <p className="text-gray-600 font-nunito">
              {language === 'gr' ? 'Φόρτωση αξιολογήσεων...' : 
               language === 'en' ? 'Loading reviews...' : 
               'Chargement des avis...'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayReviews.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-pastel-pink to-baby-blue p-8 rounded-4xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-white p-3 rounded-2xl w-fit mb-6 shadow-lg"
              >
                <Quote className="h-6 w-6 text-rose-soft" />
              </motion.div>
              
              <p className="text-gray-700 mb-6 leading-relaxed italic font-nunito">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="relative"
                >
                  <img 
                    src={testimonial.image || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 shadow-lg"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 bg-gradient-to-r from-rose-soft to-purple-soft p-1 rounded-full"
                  >
                    <Heart className="h-3 w-3 text-white" />
                  </motion.div>
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-800 font-poppins">{testimonial.name}</p>
                  <p className="text-sm text-gray-600 font-quicksand">
                    {testimonial.session_topic || testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex mt-4">
                {[...Array(5)].map((_, starIndex) => (
                  <motion.div
                    key={starIndex}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: starIndex * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        starIndex < (testimonial.rating || 5)
                          ? 'text-yellow-soft fill-current'
                          : 'text-gray-300'
                      }`} 
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && allReviews.length > reviewsPerPage && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex justify-center items-center mt-12 space-x-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-poppins ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-soft to-purple-soft text-white hover:shadow-lg'
              }`}
            >
              <ChevronLeft className="h-5 w-5 inline-block" />
              <span className="ml-1">
                {language === 'gr' ? 'Προηγούμενη' : 
                 language === 'en' ? 'Previous' : 
                 'Précédent'}
              </span>
            </motion.button>

            {/* Page Numbers */}
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Show ellipsis for large page counts
                if (totalPages > 7) {
                  if (pageNum === 1 || pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 font-poppins font-semibold ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-rose-soft to-purple-soft text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                } else {
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-all duration-300 font-poppins font-semibold ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-rose-soft to-purple-soft text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                }
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-poppins ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-soft to-purple-soft text-white hover:shadow-lg'
              }`}
            >
              <span className="mr-1">
                {language === 'gr' ? 'Επόμενη' : 
                 language === 'en' ? 'Next' : 
                 'Suivant'}
              </span>
              <ChevronRight className="h-5 w-5 inline-block" />
            </motion.button>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-warm-cream to-yellow-soft p-8 rounded-4xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-4 rounded-full w-fit mx-auto mb-4 shadow-lg"
            >
              <Heart className="h-8 w-8 text-rose-soft" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">
              {language === 'gr' ? 'Η Οικογένεια σας Αξίζει Υποστήριξη' : 
                language === 'en' ? 'Your Family Deserves Support' : 
                'Votre Famille Mérite du Soutien'}
            </h3>
            <p className="text-gray-600 font-nunito leading-relaxed">
              {language === 'gr' 
                ? 'Κάθε ιστορία επιτυχίας ξεκινά με το πρώτο βήμα. Ας δημιουργήσουμε μαζί μια θετική αλλαγή για το παιδί σας και εσας.'
                : 'Every success story starts with the first step. Let\'s create positive change for your child together.'
              }
            </p>
          </div>
        </motion.div>

        {/* Review Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <ReviewForm language={language} />
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;