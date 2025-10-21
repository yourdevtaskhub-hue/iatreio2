import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review } from '../types/reviews';
import ReviewForm from './ReviewForm';

interface TestimonialsProps {
  language: 'gr' | 'en';
}

const Testimonials: React.FC<TestimonialsProps> = ({ language }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    gr: {
      title: 'Αξιολογήσεις Γονέων και Εφήβων',
      subtitle: 'Ιστορίες Ελπίδας και Θεραπείας',
      description: 'Ακούστε από οικογένειες που βρήκαν υποστήριξη, κατανόηση και θεραπεία μέσω της φροντίδας μας.',
      testimonials: [
        {
          name: 'Μαρία Κ.',
          role: 'Μητέρα 12χρονου',
          text: 'Η Δρ. Φύτρου άλλαξε τη ζωή της οικογένειάς μας. Η κόρη μου που αντιμετώπιζε άγχος, τώρα είναι πιο ήρεμη και χαρούμενη. Η προσέγγισή της είναι τόσο ζεστή και κατανοητή.',
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
          name: 'Γιάννης Π.',
          role: 'Πατέρας 15χρονου',
          text: 'Ο γιος μου ήταν κλειστός και θυμωμένος. Μετά από μήνες θεραπείας με τη Δρ. Φύτρου, επικοινωνεί ανοιχτά και έχει βρει τρόπους να διαχειρίζεται τα συναισθήματά του.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
          name: 'Ελένη Μ.',
          role: 'Μητέρα 13χρονης',
          text: 'Η διαδικτυακή θεραπεία ήταν σωτήρια για εμάς. Η έφηβη μας ηταν αρκετά στεναχωρεμένη αλλα η κυρία Δρ. Φύτρου κατάφερε να δημιουργήσει μια καλή σχέση μαζί της και να της δείξει τον δρομο για να βρει νεους τροπους να ειναι πιο χαρουμενη και πιο ηρεμη',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
          image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
          name: 'John P.',
          role: 'Father of teenager',
          text: 'My son was withdrawn and angry. After months of therapy with Dr. Fytrou, he communicates openly and has found ways to manage his emotions.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
          name: 'Helen M.',
          role: 'Mother of 13-year-old',
          text: 'Online therapy was a lifesaver for us. Our teenager was quite sad but Dr. Fytrou managed to create a good relationship with her and show her the way to find new ways to be happier and more calm.',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to mock data if database fails
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Use database reviews if available, otherwise fallback to mock data
  const displayReviews = reviews.length > 0 ? reviews : content[language].testimonials;

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
              {language === 'gr' ? 'Φόρτωση αξιολογήσεων...' : 'Loading reviews...'}
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
              {language === 'gr' ? 'Η Οικογένειά σας Αξίζει Υποστήριξη' : 'Your Family Deserves Support'}
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