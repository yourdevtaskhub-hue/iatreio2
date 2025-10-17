import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

interface HeroProps {
  language: 'gr' | 'en';
  setLanguage: (lang: 'gr' | 'en') => void;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const content = {
    gr: {
      title: 'Διαδικτυακό Ιατρείο Γονέων και Εφήβων',
      subtitle: 'Υποστήριξη της Ψυχικής Υγείας των εφήβων και των γονέων τους με επαγγελματισμό, κατανόηση και πλήρη εχεμύθεια.',
      cta: 'Κλείστε Ραντεβού',
      learnMore: 'Μάθετε Περισσότερα',
      experience: 'Χρόνια Εμπειρίας',
      families: 'Οικογένειες',
      location: 'Λωζάνη, Ελβετία'
    },
    en: {
      title: 'Online Parent Teen Clinic',
      subtitle: 'Support for the Mental Health of adolescents and their parents with professionalism, understanding and complete confidentiality.',
      cta: 'Book Appointment',
      learnMore: 'Learn More',
      experience: 'Years Experience',
      families: 'Families',
      location: 'Lausanne, Switzerland'
    }
  } as const;

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-20 pb-8 bg-white relative overflow-hidden">
      
      {/* Καμία διακόσμηση background: καθαρό λευκό */}
      
      {/* Badge text with stars positioned left of title */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -5 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-[35%] left-48 z-10"
      >
        <div className="bg-blue-50/90 rounded-2xl px-4 py-3 shadow-xl border border-blue-200">
          <div className="text-gray-800 text-xs font-bold font-nunito leading-tight">
            1ο Διαδικτυακό Ιατρείο<br />
            Γονέων και Εφήβων στην<br />
            Ευρώπη
          </div>
          <div className="mt-2 flex justify-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" stroke="none" />
            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" stroke="none" />
            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" stroke="none" />
            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" stroke="none" />
            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" stroke="none" />
          </div>
        </div>
      </motion.div>

      {/* Centered Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-7 leading-tight font-poppins"
        >
          {language === 'gr' ? (
            <>
              <span className="text-gray-900">
                Διαδικτυακό Ιατρείο
              </span>
              <br />
              <span className="bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft bg-clip-text text-transparent">
                Γονέων και Εφήβων
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center w-full">
              <span className="text-gray-900 block" style={{ marginLeft: '10%' }}>
                Online
              </span>
              <span className="text-gray-900 block" style={{ marginLeft: '3%', whiteSpace: 'nowrap' }}>
                Parent Teen
              </span>
              <span className="bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft bg-clip-text text-transparent block" style={{ marginLeft: '10%' }}>
                Clinic
              </span>
            </div>
          )}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-gray-900 mb-8 max-w-2xl mx-auto font-nunito font-medium italic text-center"
        >
          {content[language].subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToContact}
            className="bg-gradient-to-r from-rose-soft to-purple-soft text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-poppins"
          >
            <span>{content[language].cta}</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToServices}
            className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:border-rose-soft hover:text-rose-soft transition-all duration-300 font-poppins"
          >
            {content[language].learnMore}
          </motion.button>
        </motion.div>

      </div>

      {/* Καμία επιπλέον διακόσμηση στο φόντο */}
    </section>
  );
};

export default Hero;