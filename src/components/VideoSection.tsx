import React from 'react';
import { motion } from 'framer-motion';

interface VideoSectionProps {
  language: 'gr' | 'en' | 'fr';
}

const VideoSection: React.FC<VideoSectionProps> = ({ language }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6 font-poppins">
            {language === 'gr' ? 'Η Θεραπεία Ενώνει Οικογένειες' : 
             language === 'en' ? 'Healing Unites Families' : 
             'La Thérapie Unit les Familles'}
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto font-nunito">
            {language === 'gr' 
              ? 'Παιδιά, εφήβοι και γονείς - όλοι μαζί στο ταξίδι προς την ψυχική ευεξία. Η ολοκληρωμένη ψυχολογική φροντίδα ενδυναμώνει κάθε μέλος της οικογένειας, δημιουργώντας ένα περιβάλλον αγάπης, κατανόησης και αμοιβαίας υποστήριξης όπου όλοι μπορούν να ευδοκιμήσουν.'
              : language === 'en'
              ? 'Children, adolescents, and parents - all together on the journey to mental wellness. Comprehensive psychological care empowers every family member, creating an environment of love, understanding, and mutual support where everyone can thrive.'
              : 'Enfants, adolescents et parents - tous ensemble dans le voyage vers le bien-être mental. Les soins psychologiques complets autonomisent chaque membre de la famille, créant un environnement d\'amour, de compréhension et de soutien mutuel où chacun peut s\'épanouir.'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          {/* Πρώτο βίντεο - Kids */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto rounded-xl"
            >
              <source src="/kids.mp4" type="video/mp4" />
              {language === 'gr' 
                ? 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει τη λειτουργία αναπαραγωγής βίντεο.'
                : 'Your browser does not support the video tag.'
              }
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none" />
          </div>

          {/* Δεύτερο βίντεο - Kids2 */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto rounded-xl"
            >
              <source src="/kids2.mp4" type="video/mp4" />
              {language === 'gr' 
                ? 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει τη λειτουργία αναπαραγωγής βίντεο.'
                : 'Your browser does not support the video tag.'
              }
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none" />
          </div>

          {/* Τρίτο βίντεο - Adult */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto rounded-xl"
            >
              <source src="/adult.mp4" type="video/mp4" />
              {language === 'gr' 
                ? 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει τη λειτουργία αναπαραγωγής βίντεο.'
                : 'Your browser does not support the video tag.'
              }
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none" />
          </div>

          {/* Τέταρτο βίντεο - Adult2 */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto rounded-xl"
            >
              <source src="/adult2.mp4" type="video/mp4" />
              {language === 'gr' 
                ? 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει τη λειτουργία αναπαραγωγής βίντεο.'
                : 'Your browser does not support the video tag.'
              }
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none" />
          </div>
        </motion.div>

        {/* Δεκορατιβ στοιχεία */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-30"
          />
          <motion.div 
            animate={{ 
              x: [0, -25, 0],
              y: [0, 15, 0],
              rotate: [0, -3, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-r from-blue-300 to-green-300 rounded-full opacity-30"
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
