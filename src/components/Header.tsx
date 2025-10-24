import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import logoIatrio from '../assets/logoiatrio.png';

interface HeaderProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

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
    },
    fr: {
      home: 'Accueil',
      services: 'Services',
      about: 'À propos',
      team: 'Notre équipe',
      testimonials: 'Témoignages',
      faq: 'FAQ',
      contact: 'Contact',
      appointment: 'Prendre rendez-vous'
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-dropdown')) {
        setIsLanguageDropdownOpen(false);
      }
    };
    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

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
              className="h-16 w-16 sm:h-20 sm:w-20 lg:h-16 lg:w-16 xl:h-20 xl:w-20 flex-shrink-0"
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
              <h1 className="font-bold text-base sm:text-lg lg:text-xl text-white font-dancing-script leading-tight">
                Dr. Anna-Maria Fytrou
              </h1>
              <div className="text-xs sm:text-sm lg:text-sm text-white/90 font-quicksand leading-tight">
                <div>
                  {language === 'gr' ? 'Ψυχίατρος Παιδιού και Εφήβου' : 
                   language === 'en' ? 'Child and Adolescent Psychiatrist' : 
                   'Psychiatre pour enfants et adolescents'}
                </div>
                <div>
                  {language === 'gr' ? 'Ψυχοθεραπεύτρια' : 
                   language === 'en' ? 'Psychotherapist' : 
                   'Psychothérapeute'}
                </div>
              </div>
            </div>
          </motion.div>


          {/* Desktop Navigation */}
          <div className="hidden lg:block flex-shrink-0 overflow-x-auto">
            <div className="flex items-center space-x-0.5 lg:space-x-1 xl:space-x-2 h-full min-w-fit pr-2 lg:pr-4 xl:pr-6">
              {Object.entries(content[language as keyof typeof content]).map(([key, value], index) => {
                return key !== 'appointment' ? (
                  <motion.button
                    key={`nav-${key}-${index}`}
                    whileHover={{ y: -2 }}
                    onClick={() => scrollToSection(key)}
                    className="text-white hover:text-white/80 px-0.5 lg:px-1 xl:px-2 py-2 text-[10px] lg:text-xs xl:text-sm font-medium transition-colors font-quicksand text-center flex items-center justify-center min-h-[40px]"
                  >
                    <div className="flex flex-col justify-center">
                      <span>{value}</span>
                    </div>
                  </motion.button>
                ) : (
                  <React.Fragment key={`fragment-${key}-${index}`}>
                    <div className="language-dropdown relative">
                      <motion.button
                        key={`lang-${key}-${index}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                        className="flex items-center space-x-0.5 lg:space-x-1 xl:space-x-2 px-1.5 lg:px-2 xl:px-3 py-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 hover:shadow-xl transition-all duration-300 min-h-[40px] border border-white/30"
                      >
                        <Globe className="h-3 w-3 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
                        <span className="text-[10px] lg:text-xs xl:text-sm font-semibold">
                          {language === 'gr' ? '🇬🇷 GR' : language === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
                        </span>
                        <motion.div
                          animate={{ rotate: isLanguageDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="h-2.5 w-2.5 lg:h-3 lg:w-3 xl:h-3.5 xl:w-3.5" />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {isLanguageDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 backdrop-blur-xl"
                          >
                            <div className="bg-gradient-to-r from-pink-300/20 via-purple-300/20 to-blue-300/20 px-4 py-2 border-b border-gray-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Language</p>
                            </div>
                            <div className="py-1">
                              <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setLanguage('gr');
                                  setIsLanguageDropdownOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left transition-all duration-200 ${
                                  language === 'gr' 
                                    ? 'bg-gradient-to-r from-pink-300/20 to-purple-300/20 border-l-4 border-rose-soft font-semibold' 
                                    : 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                                }`}
                              >
                                <span className="text-3xl filter drop-shadow-sm">🇬🇷</span>
                                <div className="flex-1">
                                  <span className={`block ${language === 'gr' ? 'text-gray-800' : 'text-gray-700'}`}>Ελληνικά</span>
                                  <span className="text-xs text-gray-500">Greek</span>
                                </div>
                                {language === 'gr' && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-rose-soft rounded-full"
                                  />
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setLanguage('en');
                                  setIsLanguageDropdownOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left transition-all duration-200 ${
                                  language === 'en' 
                                    ? 'bg-gradient-to-r from-blue-300/20 to-purple-300/20 border-l-4 border-blue-500 font-semibold' 
                                    : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                                }`}
                              >
                                <span className="text-3xl filter drop-shadow-sm">🇬🇧</span>
                                <div className="flex-1">
                                  <span className={`block ${language === 'en' ? 'text-gray-800' : 'text-gray-700'}`}>English</span>
                                  <span className="text-xs text-gray-500">Αγγλικά</span>
                                </div>
                                {language === 'en' && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-blue-500 rounded-full"
                                  />
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setLanguage('fr');
                                  setIsLanguageDropdownOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left transition-all duration-200 ${
                                  language === 'fr' 
                                    ? 'bg-gradient-to-r from-blue-300/20 to-pink-300/20 border-l-4 border-blue-600 font-semibold' 
                                    : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-pink-50'
                                }`}
                              >
                                <span className="text-3xl filter drop-shadow-sm">🇫🇷</span>
                                <div className="flex-1">
                                  <span className={`block ${language === 'fr' ? 'text-gray-800' : 'text-gray-700'}`}>Français</span>
                                  <span className="text-xs text-gray-500">French</span>
                                </div>
                                {language === 'fr' && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-blue-600 rounded-full"
                                  />
                                )}
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.button
                      key={`appointment-${key}-${index}`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollToSection('contact')}
                      className="bg-white text-rose-soft px-2 lg:px-3 xl:px-5 py-2 rounded-full text-[10px] lg:text-xs xl:text-sm font-medium shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 font-poppins min-h-[40px] flex items-center justify-center whitespace-nowrap flex-shrink-0 min-w-fit max-w-full"
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
              <div className="language-dropdown">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-blue-300/30 text-gray-700 shadow-md border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <div className="text-left">
                      <span className="text-base font-semibold block">
                        {language === 'gr' ? '🇬🇷 Ελληνικά' : language === 'en' ? '🇬🇧 English' : '🇫🇷 Français'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {language === 'gr' ? 'Change Language' : language === 'en' ? 'Αλλαγή Γλώσσας' : 'Changer de Langue'}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isLanguageDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {isLanguageDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-pink-300/10 via-purple-300/10 to-blue-300/10 px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Language</p>
                      </div>
                      <div className="py-1">
                        <motion.button
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setLanguage('gr');
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left transition-all duration-200 ${
                            language === 'gr' 
                              ? 'bg-gradient-to-r from-pink-300/20 to-purple-300/20 border-l-4 border-rose-soft font-semibold' 
                              : 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                          }`}
                        >
                          <span className="text-3xl filter drop-shadow-sm">🇬🇷</span>
                          <div className="flex-1">
                            <span className={`block ${language === 'gr' ? 'text-gray-800' : 'text-gray-700'}`}>Ελληνικά</span>
                            <span className="text-xs text-gray-500">Greek</span>
                          </div>
                          {language === 'gr' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-rose-soft rounded-full"
                            />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setLanguage('en');
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left transition-all duration-200 ${
                            language === 'en' 
                              ? 'bg-gradient-to-r from-blue-300/20 to-purple-300/20 border-l-4 border-blue-500 font-semibold' 
                              : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                          }`}
                        >
                          <span className="text-3xl filter drop-shadow-sm">🇬🇧</span>
                          <div className="flex-1">
                            <span className={`block ${language === 'en' ? 'text-gray-800' : 'text-gray-700'}`}>English</span>
                            <span className="text-xs text-gray-500">Αγγλικά</span>
                          </div>
                          {language === 'en' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-blue-500 rounded-full"
                            />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setLanguage('fr');
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left transition-all duration-200 ${
                            language === 'fr' 
                              ? 'bg-gradient-to-r from-blue-300/20 to-pink-300/20 border-l-4 border-blue-600 font-semibold' 
                              : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-pink-50'
                          }`}
                        >
                          <span className="text-3xl filter drop-shadow-sm">🇫🇷</span>
                          <div className="flex-1">
                            <span className={`block ${language === 'fr' ? 'text-gray-800' : 'text-gray-700'}`}>Français</span>
                            <span className="text-xs text-gray-500">French</span>
                          </div>
                          {language === 'fr' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-blue-600 rounded-full"
                            />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
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