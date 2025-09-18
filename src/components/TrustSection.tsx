import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import drProfile from '../assets/dr_profile.jpeg';

interface TrustSectionProps {
  language: 'gr' | 'en';
}

const TrustSection: React.FC<TrustSectionProps> = ({ language }) => {
  const content = {
    gr: {
      experience: 'Χρόνια Εμπειρίας',
      families: 'Οικογένειες',
      location: 'Λωζάνη, Ελβετία'
    },
    en: {
      experience: 'Years Experience',
      families: 'Families',
      location: 'Lausanne, Switzerland'
    }
  } as const;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Doctor Photo */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="relative max-w-md">
            {/* Main Image - Centered */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-4xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="aspect-square bg-gradient-to-br from-pastel-pink via-baby-blue to-mint-green rounded-3xl overflow-hidden">
                <img 
                  src={drProfile}
                  alt="Dr. Anna-Maria Fytrou"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center mt-6">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-r from-rose-soft to-purple-soft p-3 rounded-full w-fit mx-auto mb-4"
                >
                  <Heart className="h-5 w-5 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-quicksand">Δρ. Φύτρου Άννα Μαρία</h3>
                <p className="text-base text-gray-600 mb-2 font-quicksand">
                  {language === 'gr' ? 'Παιδοψυχίατρος' : 'Child Psychiatrist'}
                </p>
                <p className="text-base text-gray-600 mb-4 font-quicksand">
                  {language === 'gr' ? '& Ψυχοθεραπεύτρια' : '& Psychotherapist'}
                </p>
                <div className="bg-gradient-to-r from-warm-cream to-yellow-soft p-3 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1 font-quicksand">
                    {language === 'gr' ? 'ειδ. στην Ελλάδα και την Ελβετία' : 'Specialized in Greece and Switzerland'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Floating elements */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
            >
              <div className="text-center">
                <div className="text-xl font-bold text-green-soft font-poppins">500+</div>
                <div className="text-xs text-gray-600 font-quicksand">{content[language].families}</div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
