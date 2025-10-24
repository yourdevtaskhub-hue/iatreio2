import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Pin } from 'lucide-react';

interface HeroProps {
  language: 'gr' | 'en' | 'fr';
  setLanguage: (lang: 'gr' | 'en' | 'fr') => void;
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
    },
    fr: {
      title: 'Clinique en ligne Parents et Adolescents',
      subtitle: 'Soutien pour la Santé Mentale des adolescents et de leurs parents avec professionnalisme, compréhension et confidentialité totale.',
      cta: 'Prendre rendez-vous',
      learnMore: 'En savoir plus',
      experience: 'Années d\'expérience',
      families: 'Familles',
      location: 'Lausanne, Suisse'
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
        className="absolute top-[12%] sm:top-[15%] md:top-[20%] lg:top-[26%] xl:top-[30%] left-2 sm:left-4 md:left-8 lg:left-16 xl:left-32 z-10"
        style={{
          WebkitTransform: 'none',
          transform: 'none',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Post-it Note with realistic styling - Μικρότερο για κινητά */}
        <div className="relative">
          {/* Pin icon at the top */}
          <div className="absolute -top-1 sm:-top-2 left-1/2 transform -translate-x-1/2 z-20">
            <Pin className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-600" fill="currentColor" />
          </div>
          
          {/* Main post-it note - Μικρότερο για κινητά */}
          <div className="bg-pink-100 rounded-md px-1.5 py-1.5 sm:px-3 sm:py-2.5 md:px-4 md:py-3 shadow-xl border-2 border-pink-200 transform rotate-1 hover:rotate-0 transition-transform duration-300 w-[90px] sm:w-[110px] md:w-[130px] lg:w-auto">
            {/* Trophy icon */}
            <div className="flex justify-center mb-1 sm:mb-1.5 md:mb-2">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-600" fill="currentColor" />
            </div>
            
            {/* Text content - Μικρότερο για κινητά */}
            <div className="text-gray-800 text-[9px] sm:text-[10px] md:text-xs font-bold font-nunito leading-[1.2] sm:leading-tight text-center">
              {language === 'gr' 
                ? <>Το 1ο Διαδικτυακό Ιατρείο<br />Γονέων και Εφήβων στην<br />Ευρώπη</>
                : language === 'en' 
                ? <>The 1st Online Clinic<br />for Parents and Adolescents<br />in Europe</>
                : <>La 1ère Clinique en ligne<br />pour Parents et Adolescents<br />en Europe</>
              }
            </div>
          </div>
          
          {/* Shadow effect to make it look like it's stuck to wall */}
          <div className="absolute inset-0 bg-black/10 rounded-md transform translate-x-0.5 translate-y-0.5 -z-10"></div>
        </div>
      </motion.div>

      {/* Centered Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[80vh] lg:min-h-[70vh]">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold mb-7 leading-tight font-poppins"
          style={{
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            WebkitTextSizeAdjust: '100%',
            textSizeAdjust: '100%'
          }}
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
          ) : language === 'en' ? (
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
          ) : (
            <div className="flex flex-col items-center w-full">
              <span className="text-gray-900 block">
                Clinique
              </span>
              <span className="text-gray-900 block">
                Parents et
              </span>
              <span className="bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft bg-clip-text text-transparent block">
                Adolescents
              </span>
            </div>
          )}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-sm sm:text-base md:text-lg text-gray-900 mb-6 sm:mb-8 max-w-2xl mx-auto font-nunito font-medium italic text-center px-4 sm:px-0"
        >
          {content[language].subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-2 px-4 sm:px-0"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToContact}
            className="bg-gradient-to-r from-rose-soft to-purple-soft text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-poppins w-full sm:w-auto"
          >
            <span>{content[language].cta}</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToServices}
            className="border-2 border-gray-300 text-gray-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-medium hover:border-rose-soft hover:text-rose-soft transition-all duration-300 font-poppins w-full sm:w-auto"
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