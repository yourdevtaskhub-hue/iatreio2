import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, MapPin, Shield, Phone, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  language: string;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const content = {
    gr: {
      description: 'Παρέχοντας συμπονετική, βασισμένη σε αποδείξεις φροντίδα ψυχικής υγείας για παιδιά και εφήβους. Υποστηρίζοντας οικογένειες σε κάθε βήμα του ταξιδιού προς την ευδαιμονία.',
      services: 'Υπηρεσίες',
      servicesList: [
        'Ψυχιατρική & Ψυχολογική Αξιολόγηση',
        'Ατομική Θεραπεία',
        'Οικογενειακή Θεραπεία',
        'Παρέμβαση Κρίσης',
        'Διαδικτυακές Συμβουλές'
      ],
      quickLinks: 'Γρήγοροι Σύνδεσμοι',
      linksList: [
        'Σχετικά με τη Δρ. Φύτρου',
        'Υπηρεσίες',
        'Η Ομάδα μας',
        'Επικοινωνία'
      ],
      emergency: 'Ειδοποίηση Έκτακτης Ανάγκης',
      emergencyText: 'Εάν εσείς ή το παιδί σας αντιμετωπίζετε μια έκτακτη ανάγκη ψυχικής υγείας, παρακαλώ επικοινωνήστε αμέσως με τις υπηρεσίες έκτακτης ανάγκης ή πηγαίνετε στο πλησιέστερο τμήμα επειγόντων περιστατικών. Μην περιμένετε απάντηση σε διαδικτυακές επικοινωνίες.',
      swissEmergency: 'Έκτακτη Ανάγκη Ελβετίας: 144',
      euEmergency: 'Έκτακτη Ανάγκη ΕΕ: 112',
      helplines: [
        'Τηλ. Γραμμή βοήθειας για την Αυτοκτονία Κλίμακα: 1018',
        'Τηλ. Γραμμή SOS για Παιδιά, Εφήβους και Γονείς: 1056',
        'Τηλ. Γραμμή Ψυχοκοινωνικής Υποστήριξης: 10306',
        'Εθνική Τηλ. Γραμμή Παιδικής Προστασίας: 1107',
        'Τηλ. Γραμμή Βοήθειας ΥΠΟΣΤΗΡΙΖΩ: 80011 80015',
        'Τηλ. Γραμμή για εφήβους: 116111',
        'Τηλ. Γραμμή Ψυχολογικής Υποστήριξης ΙΘΑΚΗ: 1145',
        'Τηλ. Γραμμή SOS του ΟΚΑΝΑ: 1031'
      ],
      copyright: '© 2024 Δρ. Άννα-Μαρία Φύτρου. Όλα τα δικαιώματα διατηρούνται.',
      privacyProtected: 'Προστασία Ιδιωτικότητας Ασθενών'
    },
    en: {
      description: 'Providing compassionate, evidence-based mental health care for children and adolescents. Supporting families through every step of the journey towards healing and growth.',
      services: 'Our Services',
      servicesList: [
        'Psychiatric & Psychological Assessment',
        'Individual Therapy',
        'Family Therapy',
        'Crisis Intervention',
        'Online Consultations'
      ],
      quickLinks: 'Quick Links',
      linksList: [
        'About Dr. Fytrou',
        'Services',
        'Our Team',
        'Contact'
      ],
      emergency: 'Emergency Notice',
      emergencyText: 'If you or your child is experiencing a mental health emergency, please contact emergency services immediately or go to your nearest emergency room. Do not wait for a response to online communications.',
      swissEmergency: 'Switzerland Emergency: 144',
      euEmergency: 'EU Emergency: 112',
      helplines: [
        'Suicide Prevention Helpline Klimaka: 1018',
        'SOS Helpline for Children, Teens and Parents: 1056',
        'Psychosocial Support Helpline: 10306',
        'National Child Protection Helpline: 1107',
        'Support Helpline ΥΠΟΣΤΗΡΙΖΩ: 80011 80015',
        'Teen Helpline: 116111',
        'Psychological Support Helpline ITHAKI: 1145',
        'SOS Helpline of OKANA: 1031'
      ],
      copyright: '© 2024 Dr. Anna-Maria Fytrou. All rights reserved.',
      privacyProtected: 'Patient Privacy Protected'
    },
    fr: {
      description: 'Fournissant des soins de santé mentale compatissants et basés sur des preuves pour les enfants et adolescents. Soutenant les familles à chaque étape du voyage vers la guérison et la croissance.',
      services: 'Nos Services',
      servicesList: [
        'Évaluation Psychiatrique & Psychologique',
        'Thérapie Individuelle',
        'Thérapie Familiale',
        'Intervention de Crise',
        'Consultations en Ligne'
      ],
      quickLinks: 'Liens Rapides',
      linksList: [
        'À propos du Dr Fytrou',
        'Services',
        'Notre équipe',
        'Contact'
      ],
      emergency: 'Avis d\'Urgence',
      emergencyText: 'Si vous ou votre enfant faites face à une urgence de santé mentale, veuillez contacter immédiatement les services d\'urgence ou aller au service d\'urgence le plus proche. N\'attendez pas de réponse aux communications en ligne.',
      swissEmergency: 'Urgence Suisse: 144',
      euEmergency: 'Urgence UE: 112',
      helplines: [
        'Ligne d\'aide pour le Suicide Klimaka: 1018',
        'Ligne d\'aide SOS pour Enfants, Adolescents et Parents: 1056',
        'Ligne d\'aide Psychosociale: 10306',
        'Ligne Nationale de Protection de l\'Enfant: 1107',
        'Ligne d\'aide ΥΠΟΣΤΗΡΙΖΩ: 80011 80015',
        'Ligne d\'aide pour adolescents: 116111',
        'Ligne d\'aide Psychologique ITHAKI: 1145',
        'Ligne d\'aide SOS d\'OKANA: 1031'
      ],
      copyright: '© 2024 Dr. Anna-Maria Fytrou. Tous droits réservés.',
      privacyProtected: 'Confidentialité des Patients Protégée'
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-800 via-gray-900 to-purple-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 mb-6"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-r from-rose-soft to-purple-soft p-3 rounded-2xl shadow-lg"
              >
                <Heart className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-xl font-poppins">Dr. Anna-Maria Fytrou</h3>
                <p className="text-gray-300 text-sm font-quicksand">
                  {language === 'gr' ? 'Παιδοψυχίατρος' : 
                   language === 'en' ? 'Child & Adolescent Psychiatrist' : 
                   'Psychiatre pour enfants et adolescents'}
                </p>
              </div>
            </motion.div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md font-nunito">
              {content[language].description}
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 mb-6">
              <motion.a
                href="https://www.instagram.com/drfytrouannamaria/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://www.tiktok.com/@drfytrouannamaria"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-black text-white hover:shadow-lg transition-all duration-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </motion.a>
              <motion.a
                href="https://www.facebook.com/p/Dr-Fytrou-Anna-Maria-61568951687995/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-blue-600 text-white hover:shadow-lg transition-all duration-300"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              
            </div>
            <div className="space-y-3">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center text-gray-300"
              >
                <Mail className="h-4 w-4 mr-3" />
                <a href="mailto:iatreiodrfytrou@gmail.com" className="hover:text-rose-soft transition-colors font-nunito">
                  iatreiodrfytrou@gmail.com
                </a>
              </motion.div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center text-gray-300"
              >
                <MapPin className="h-4 w-4 mr-3" />
                <span className="font-nunito">
                  {language === 'gr' ? 'Λωζάνη, Ελβετία' : 
                   language === 'en' ? 'Lausanne, Switzerland' : 
                   'Lausanne, Suisse'}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4 font-poppins">{content[language].services}</h4>
            <ul className="space-y-2">
              {content[language].servicesList.map((service, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  className="text-gray-300 hover:text-rose-soft transition-colors cursor-pointer font-nunito"
                  onClick={() => scrollToSection('services')}
                >
                  {service}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 font-poppins">{content[language].quickLinks}</h4>
            <ul className="space-y-2">
              {content[language].linksList.map((link, index) => {
                const sectionIds = ['about', 'services', 'team', 'contact'];
                return (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    className="text-gray-300 hover:text-rose-soft transition-colors cursor-pointer font-nunito"
                    onClick={() => scrollToSection(sectionIds[index])}
                  >
                    {link}
                  </motion.li>
                );
              })}
            </ul>

            {/* Auth Button */}
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { window.location.href = '/auth'; }}
                className="w-full bg-gradient-to-r from-purple-soft to-blue-soft text-white px-4 py-2 rounded-xl shadow-lg font-poppins"
              >
                {language === 'gr' ? 'Σύνδεση / Εγγραφή Λογαριασμού' : language === 'fr' ? 'Connexion / Créer un compte' : 'Login / Create Account'}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm font-nunito">
                {content[language].copyright}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center text-gray-400 text-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                <span className="font-quicksand">{content[language].privacyProtected}</span>
              </motion.div>
            </div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6 rounded-3xl border border-red-700/30"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-red-600 p-3 rounded-full mr-3"
                >
                  <Phone className="h-6 w-6 text-white" />
                </motion.div>
                <h4 className="font-semibold text-lg text-red-300 font-poppins">{content[language].emergency}</h4>
              </div>
              <p className="text-red-200 text-sm mb-4 leading-relaxed font-nunito">
                {content[language].emergencyText}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm mb-4">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="text-red-300 font-medium bg-red-800/30 px-4 py-2 rounded-full font-poppins"
                >
                  {content[language].swissEmergency}
                </motion.span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="text-red-300 font-medium bg-red-800/30 px-4 py-2 rounded-full font-poppins"
                >
                  {content[language].euEmergency}
                </motion.span>
              </div>
              
              <div className="text-left">
                <h5 className="text-red-300 font-semibold text-sm mb-3 font-poppins">
                  {language === 'gr' ? 'Τηλεφωνικές Γραμμές Βοήθειας:' : 
                   language === 'en' ? 'Helplines:' : 
                   'Lignes d\'aide:'}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {content[language].helplines.map((helpline, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 5 }}
                      className="text-red-200 text-xs font-nunito hover:text-red-100 transition-colors"
                    >
                      {helpline}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Powered by */}
      <div className="py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-nunito">
            Powered by <a href="https://www.devtaskhub.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">www.devtaskhub.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;