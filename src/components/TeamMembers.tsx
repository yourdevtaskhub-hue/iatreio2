import React from 'react';
import { motion } from 'framer-motion';

interface TeamMembersProps {
  language: string;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ language }) => {
  if (language !== 'gr') return null;

  const teamMembers = [
    {
      id: 1,
      name: 'Σοφία Σπυριάδου',
      image: '/sofia_spyriadou.png',
      bio: `Η κυρία Σπυριάδου ολοκλήρωσε τις σπουδές της στη Ψυχολογία στο Αριστοτέλειο Πανεπιστήμιο Θεσσαλονίκης και ακολούθησε Μεταπτυχιακό Πρόγραμμα Σπουδών στην Κλινική Ψυχική Υγεία στο ίδιο Πανεπιστήμιο.

Έχει εκπαιδευτεί στην Κλινική Ψυχομετρία και Νευροψυχολογία στη Γ' Πανεπιστημιακή Ψυχιατρική Κλινική του ΑΧΕΠΑ και εμπλουτίζει τις γνώσεις της με την 4ετή εκπαίδευση της στη Γνωσιακή Συμπεριφορική Ψυχοθεραπεία στην Ελληνική Εταιρεία Γνωσιακής και Συμπεριφορικής Ψυχοθεραπείας.

Είναι πιστοποιημένη στη χορήγηση ψυχομετρικών εργαλείων όπως : Τεστ νοημοσύνης ενηλίκων WAIS- V,  Τεστ νοημοσύνης ανηλίκων WISC- III, Κλίμακα κατάθλιψης Hamilton-D, SCI- PANSS, για την σχιζοφρένεια,  Κλίμακα μανίας, διπολικής διαταραχής, Young Mania Rating Scale. Έχει εκπαιδευτεί από το Αμερικανικό Πανεπιστήμιο του Κολοράντο «University of Colorado,USA» στη σχολική ψυχολογία. Έχοντας τεράστια εμπειρία στο ελληνικό και το γερμανικό σύστημα εκπαίδευσης, διαθέτει όλα τα εφόδια να συνοδεύσει τα παιδιά  και τους εφήβους στις δυσκολίες τους κατά τα σχολικά χρόνια.

Είναι η ιδανική ειδικός για Εξέταση και Ψυχοθεραπεία παιδιών και εφήβων και τους γονείς τους σε Συμβουλευτική γονέων. 

Η κλινική παιδοψυχολόγος μιλάει άψογα ελληνικά και γερμανικά.`
    },
    {
      id: 2,
      name: 'Πισσάρη Ιωάννα',
      image: '/ioanna_pissari.png',
      bio: `Η κυρία Πισσάρη ολοκλήρωσε τις σπουδές της στην Ψυχολογία στο Εθνικό Καποδιστριακό Πανεπιστήμιο Αθηνών και ακολούθησε Μεταπτυχιακό Πρόγραμμα Σπουδών στην Κλινική Ψυχική Υγεία στο ίδιο Πανεπιστήμιο «University of Wolverhampton» της Αγγλίας.

Το ενδιαφέρον της στρέφεται γύρω από την 4ετή εκπαίδευση της στην Γνωσιακή Συμπεριφορική Ψυχοθεραπεία από την Εταιρεία Γνωσιακής Συμπεριφορικής Ψυχοθεραπείας, ενώ παράλληλα είναι εξειδικευμένη στο Φάσμα του Αυτισμού και την Διαταραχή Ελλειματικής Προσοχής και Υπερκινητικότητας (ΔΕΠΥ) από το Πανεπιστήμιου «University of Derby» της Αγγλίας. 

Η κυρία Πισσάρη είναι Υπέρμαχος της προστασίας των γυναικών και των ασθενών. Έχει υποστηρίξει με την συμμετοχή της, επιστημονικές έρευνες και ημερίδες, πληθώρα ασθενών της Γενικής Ιδιωτικής Γυναικολογικής Κλινικής ΙΑΣΩ. . Έχει στενή συνεργασία με το Εθνικό Κέντρο Κοινωνικών Ερευνών και την Ευρωπαϊκή Ένωση ΕΚΚΕ όπου διεξάγει έρευνες που αφορούν την κακοποίηση και τη προστασία των κακοποιημένων γυναικών. Επιπλέον ήταν Υπεύθυνη Ομάδας στο πρόγραμμα «Project C Foundation» όπου υποστήριζε ασθενείς μέσα από Πλατφόρμες Κοινωνικής Δικτύωσης. 

Είναι η ιδανική ειδικός για Εξέταση και Ψυχοθεραπεία παιδιών και εφήβων και για Συμβουλευτική γονέων.

Η κλινική παιδοψυχολόγος μιλάει άψογα ελληνικά και αγγλικά.`
    }
  ];

  return (
    <section className="py-6 bg-white" data-section="team">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Η ομάδα της Δρ. Φύτρου
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-bold">
            Οι συνεργάτες μας είναι ψυχολόγοι και ψυχοθεραπευτές, εξειδικευμένοι στην παιδική ψυχοπαθολογία και εποπτεύονται εβδομαδιαίως από την Δρ. Φύτρου για τα περιστατικά του ιατρείου.
          </p>
        </motion.div>

        {/* Ενιαίο μεγάλο πλαίσιο με τα δύο βιογραφικά */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          {/* Μεγάλη εικόνα στο πάνω μέρος */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative w-full h-80 lg:h-96 overflow-hidden bg-gray-50 flex items-center justify-center"
          >
            <img
              src="/womensidebyside.png"
              alt="Συνεργάτες"
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay για καλύτερη αισθητική */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20"></div>
            {/* Διακοσμητικό στοιχείο */}
            <div className="absolute inset-0 border-4 border-white/30 rounded-t-2xl"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {teamMembers.map((member, index) => (
              <div key={member.id} className={`p-8 ${index === 0 ? 'lg:pr-6' : 'lg:pl-6'} relative`}>
                {/* Όνομα */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.3 }}
                  viewport={{ once: true }}
                  className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-6"
                >
                  {member.name}
                </motion.h3>
                
                {/* Βιογραφικό κείμενο */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.3 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  {member.bio.split('\n\n').map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-gray-700 leading-relaxed text-sm text-justify"
                    >
                      {paragraph}
                    </p>
                  ))}
                </motion.div>

                {/* Διακοσμητική γραμμή κάτω */}
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.3 }}
                  viewport={{ once: true }}
                  className="mt-6 flex justify-center"
                >
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                </motion.div>

                {/* Διαχωριστική γραμμή ανάμεσα στα κείμενα (μόνο για το δεύτερο βιογραφικό) */}
                {index === 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="hidden lg:block absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default TeamMembers;
