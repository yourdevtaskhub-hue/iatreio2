import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award } from 'lucide-react';

interface HeroProps {
  language: 'gr' | 'en';
  setLanguage: (lang: 'gr' | 'en') => void;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const content = {
    gr: {
      title: 'Διαδικτυακό Ιατρείο Γονέων και Εφήβων',
      subtitle: 'Υποστήριξη της Ψυχικής Υγείας εφήβων και των γονέων τους με επαγγελματισμό, κατανόηση και πλήρη εχεμύθεια.',
      cta: 'Κλείστε Ραντεβού',
      learnMore: 'Μάθετε Περισσότερα',
      experience: 'Χρόνια Εμπειρίας',
      families: 'Οικογένειες',
      location: 'Λωζάνη, Ελβετία'
    },
    en: {
      title: 'Parents and Adolescents Online Clinic',
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
    <section id="home" className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, 0, -60, 0],
            y: [0, 30, 0, -30, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-8 left-8 w-40 h-40 bg-pastel-pink/40 rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0, 80, 0],
            y: [0, -40, 0, 40, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-8 right-8 w-48 h-48 bg-baby-blue/40 rounded-full"
        />
        <motion.div
          animate={{
            x: [0, 50, 0, -50, 0],
            y: [0, -60, 0, 60, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 right-16 w-32 h-32 bg-mint-green/40 rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -70, 0, 70, 0],
            y: [0, 50, 0, -50, 0]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-16 left-16 w-44 h-44 bg-rose-soft/35 rounded-full"
        />
      </div>
      
      {/* Certified Badge */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: -5 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-32 left-8 z-10"
      >
        <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl p-4 shadow-xl border-2 border-green-300">
          <div className="flex items-center space-x-3">
            <Award className="h-8 w-8 text-white" />
            <div className="text-white">
              <div className="text-xs font-bold font-quicksand">CERTIFIED</div>
              <div className="text-xs font-medium font-nunito leading-tight">
                1ο Διαδικτυακό Ιατρείο<br />
                Γονέων και Εφήβων στην<br />
                Ευρώπη και την Ελβετία
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Centered Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight font-poppins"
        >
          <span className="text-gray-900">
            Διαδικτυακό Ιατρείο
          </span>
          <br />
          <span className="bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft bg-clip-text text-transparent">
            Γονέων και Εφήβων
          </span>
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
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
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

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-soft/20 to-purple-soft/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.1, 1, 1.1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-soft/20 to-mint-green/20 rounded-full blur-3xl"
        />
      </div>
    </section>
  );
};

export default Hero;