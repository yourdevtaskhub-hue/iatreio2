import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import logoIatrio from '../assets/logoiatrio.png';

interface HeaderProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const content = {
    gr: {
      home: 'Αρχική',
      services: 'Υπηρεσίες',
      about: 'Βιογραφικό',
      team: 'Η ομάδας μας',
      testimonials: 'Αξιολογήσεις',
      faq: 'Συχνές Ερωτήσεις',
      contact: 'Επικοινωνία',
      appointment: 'Κλείστε Ραντεβού'
    },
    en: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      team: 'Our Team',
      testimonials: 'Testimonials',
      faq: 'FAQ',
      contact: 'Contact',
      appointment: 'Book Appointment'
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    } else if (sectionId === 'team') {
      // Scroll to TeamMembers section
      const teamElement = document.querySelector('[data-section="team"]') || document.querySelector('.team-members-section');
      if (teamElement) {
        teamElement.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-gradient-to-r from-pink-300/95 via-purple-300/95 to-blue-300/95 backdrop-blur-md shadow-xl' : 'bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 min-h-[80px] sm:min-h-[96px]">
          <motion.div 
            className="flex items-center space-x-3 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={logoIatrio} 
              alt="Logo" 
              className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0"
              style={{
                imageOrientation: 'from-image',
                WebkitTransform: 'none',
                transform: 'none',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                WebkitTransformOrigin: 'center center',
                transformOrigin: 'center center'
              }}
            />
            <div className="flex flex-col justify-center min-h-[64px] sm:min-h-[80px]">
              <h1 className="font-bold text-lg sm:text-xl text-white font-dancing-script leading-tight">
                Dr. Anna-Maria Fytrou
              </h1>
              <div className="text-xs sm:text-sm text-white/90 font-quicksand leading-tight">
                <div>Ψυχίατρος Παιδιού και Εφήβου</div>
                <div>Ψυχοθεραπεύτρια</div>
              </div>
            </div>
          </motion.div>


          {/* Desktop Navigation */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 h-full">
              {Object.entries(content[language as keyof typeof content]).map(([key, value], index) => {
                return key !== 'appointment' ? (
                  <motion.button
                    key={`nav-${key}-${index}`}
                    whileHover={{ y: -2 }}
                    onClick={() => scrollToSection(key)}
                    className="text-white hover:text-white/80 px-1 sm:px-2 py-2 text-xs sm:text-sm font-medium transition-colors font-quicksand text-center flex items-center justify-center min-h-[40px]"
                  >
                    <div className="flex flex-col justify-center">
                      <span>{value}</span>
                    </div>
                  </motion.button>
                ) : (
                  <React.Fragment key={`fragment-${key}-${index}`}>
                    <motion.button
                      key={`lang-${key}-${index}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLanguage(language === 'gr' ? 'en' : 'gr')}
                      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 sm:py-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:shadow-lg transition-all duration-300 min-h-[40px]"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-medium">{language === 'gr' ? 'EN' : 'GR'}</span>
                    </motion.button>
                    <motion.button
                      key={`appointment-${key}-${index}`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollToSection('contact')}
                      className="bg-white text-rose-soft px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 font-poppins min-h-[40px] flex items-center justify-center"
                    >
                      {value}
                    </motion.button>
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-white/80 p-2 rounded-xl"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white/95 backdrop-blur-md rounded-3xl mt-4 shadow-xl border border-gray-100"
          >
            <div className="px-4 sm:px-6 py-4 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setLanguage(language === 'gr' ? 'en' : 'gr')}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-baby-blue to-mint-green text-gray-700"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language === 'gr' ? 'English' : 'Ελληνικά'}</span>
              </motion.button>
              
              {Object.entries(content[language as keyof typeof content]).map(([key, value]) => (
                key !== 'appointment' ? (
                  <motion.button
                    key={key}
                    whileHover={{ x: 5 }}
                    onClick={() => scrollToSection(key)}
                    className="block text-gray-700 hover:text-rose-soft px-3 py-2 text-sm sm:text-base font-medium w-full text-left rounded-xl hover:bg-pastel-pink transition-all duration-200"
                  >
                    {value}
                  </motion.button>
                ) : (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToSection('contact')}
                    className="block bg-gradient-to-r from-rose-soft to-purple-soft text-white px-3 py-3 text-sm sm:text-base font-medium rounded-xl mx-3 mt-4 text-center shadow-lg"
                  >
                    {value}
                  </motion.button>
                )
              ))}
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;