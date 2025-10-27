import React from 'react';
import { motion } from 'framer-motion';
import drProfile from '../assets/profile.png';

interface TrustSectionProps {
  language: 'gr' | 'en' | 'fr';
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
    },
    fr: {
      experience: 'Années d\'expérience',
      families: 'Familles',
      location: 'Lausanne, Suisse'
    }
  } as const;

  return (
    <section className="pt-0 pb-4 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Doctor Photo and Quote Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-4 items-center max-w-7xl mx-auto">
          {/* Left: Doctor Photo */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-start"
          >
            <div className="relative max-w-md">
              {/* Main Image */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-4xl shadow-2xl border border-gray-100 overflow-hidden relative"
              >
                {/* Floating elements - moved to top left */}
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-2 -left-2 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 z-10 min-w-[80px]"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-soft font-poppins">{language === 'gr' ? '1000+' : '1000+'}</div>
                    <div className="text-xs text-gray-600 font-quicksand leading-tight">{content[language].families}</div>
                  </div>
                </motion.div>

                <div className="aspect-square bg-gradient-to-br from-pastel-pink via-baby-blue to-mint-green rounded-3xl overflow-hidden">
                  <img 
                    src={drProfile}
                    alt="Dr. Anna-Maria Fytrou"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 font-quicksand">
                    {language === 'gr' ? 'Δρ. Φύτρου Άννα Μαρία' : 
                     language === 'en' ? 'Dr. Anna-Maria Fytrou' : 
                     'Dr. Anna-Maria Fytrou'}
                  </h3>
                  <p className="text-base text-gray-600 mb-2 font-quicksand font-bold">
                    {language === 'gr' ? 'Ψυχίατρος Παιδιού και Εφήβου' : 
                     language === 'en' ? 'Child and Adolescent Psychiatrist' : 
                     'Psychiatre pour enfants et adolescents'}
                  </p>
                  <p className="text-base text-gray-600 mb-4 font-quicksand font-bold">
                    {language === 'gr' ? 'Ψυχοθεραπεύτρια' : 
                     language === 'en' ? 'Psychotherapist' : 
                     'Psychothérapeute'}
                  </p>
                  <div className="bg-gradient-to-r from-warm-cream to-yellow-soft p-3 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1 font-quicksand">
                      {language === 'gr' ? 'ειδικευμένη στην Ελλάδα και στην Ελβετία' : 
                       language === 'en' ? 'Specialized in Greece and Switzerland' : 
                       'Spécialisée en Grèce et en Suisse'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Quote Bubble */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-start"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-4xl shadow-2xl border border-gray-100 max-w-2xl"
            >
              <blockquote className="text-gray-700 italic text-base leading-relaxed font-nunito mb-6">
                "{language === 'gr' 
                  ? <span>Ο <span className="text-black font-bold not-italic">D.W.Winnicott</span> είχε πει "Είναι χαρά να κρύβεσαι μα συμφορά να μην σε βρίσκουν" και μέσα σε αυτή τη φράση κρύβεται όλο το νόημα της παιδοψυχιατρικής. Το ασυνείδητο συχνά κρύβει τα τραύματα μας, χρησιμοποιεί τις άμυνες μας και δοκιμάζει την δική μας αντοχή όπως και του περιβάλλοντος μας. Ως παιδοψυχίατρος έχω τον ρόλο του ειδικού που σημειώνει το προφανές και ως ψυχοθεραπεύτρια συγχρόνως ερευνώ το καλά κρυμμένο που προκαλεί τη δυσκολία. Έπειτα με αγάπη προς το παιδί και τον θεσμό της οικογένειας δουλεύουμε μαζί για να ξεπεραστεί η όποια δυσκολία έχει μπει εμπόδιο στην εξέλιξη του.</span>
                  : language === 'en' 
                  ? <span><span className="text-black font-bold not-italic">D.W. Winnicott</span> said "It is a joy to be hidden, and disaster not to be found" and within this phrase lies the entire meaning of child psychiatry. The unconscious often hides our traumas, uses our defenses and tests our own endurance as well as that of our environment. As a child psychiatrist I have the role of the specialist who notes the obvious and as a psychotherapist I simultaneously investigate the well-hidden that causes the difficulty. Then with love for the child and the institution of the family we work together to overcome any difficulty that has become an obstacle to their development.</span>
                  : <span><span className="text-black font-bold not-italic">D.W. Winnicott</span> a dit "C'est une joie d'être caché, et un désastre de ne pas être trouvé" et dans cette phrase se cache tout le sens de la psychiatrie de l'enfant. L'inconscient cache souvent nos traumatismes, utilise nos défenses et teste notre propre endurance ainsi que celle de notre environnement. En tant que psychiatre pour enfants, j'ai le rôle du spécialiste qui note l'évident et en tant que psychothérapeute, j'explore simultanément le bien caché qui cause la difficulté. Puis avec amour pour l'enfant et l'institution de la famille, nous travaillons ensemble pour surmonter toute difficulté qui est devenue un obstacle à leur développement.</span>
                }"
              </blockquote>
              <div className="flex items-center">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-full overflow-hidden mr-4 shadow-lg border-2 border-rose-soft"
                >
                  <img 
                    src={drProfile} 
                    alt="Dr. Anna-Maria Fytrou" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-800 font-poppins">Dr. Anna-Maria Fytrou</p>
                  <p className="text-sm text-gray-600 font-quicksand">
                    {language === 'gr' ? 'Παιδοψυχίατρος' : 
                     language === 'en' ? 'Child Psychiatrist' : 
                     'Psychiatre pour enfants'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
