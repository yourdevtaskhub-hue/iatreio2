import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Pin } from 'lucide-react';

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
      
      {/* Post-it Note Effect - Responsive positioning */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: -30 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -6 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-[32%] left-4 sm:left-8 md:left-16 lg:left-32 xl:left-40 z-10"
      >
        {/* Post-it Note with realistic styling - Μικρότερο */}
        <div className="relative">
          {/* Pin icon at the top */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
            <Pin className="h-4 w-4 text-gray-600" fill="currentColor" />
          </div>
          
          {/* Main post-it note */}
          <div className="bg-pink-100 rounded-md px-4 py-3 shadow-xl border-2 border-pink-200 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            {/* Trophy icon */}
            <div className="flex justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-600" fill="currentColor" />
            </div>
            
            {/* Text content */}
            <div className="text-gray-800 text-xs font-bold font-nunito leading-tight text-center">
              Το 1ο Διαδικτυακό Ιατρείο<br />
              Γονέων και Εφήβων στην<br />
              Ευρώπη
            </div>
          </div>
          
          {/* Shadow effect to make it look like it's stuck to wall */}
          <div className="absolute inset-0 bg-black/10 rounded-md transform translate-x-0.5 translate-y-0.5 -z-10"></div>
        </div>
      </motion.div>

      {/* Centered Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold mb-7 leading-tight font-poppins"
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
              <span className="text-gray-900 block">
                Online
              </span>
              <span className="text-gray-900 block">
                Parent Teen
              </span>
              <span className="bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft bg-clip-text text-transparent block">
                Clinic
              </span>
            </div>
          )}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-lg text-gray-900 mb-8 max-w-2xl mx-auto font-nunito font-medium italic text-center"
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
            className="bg-gradient-to-r from-rose-soft to-purple-soft text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-poppins"
          >
            <span>{content[language].cta}</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToServices}
            className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-medium hover:border-rose-soft hover:text-rose-soft transition-all duration-300 font-poppins"
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