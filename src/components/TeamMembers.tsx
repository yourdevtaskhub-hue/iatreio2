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
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Συνεργάτες
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Οι συνεργάτες μας είναι ψυχολόγοι και ψυχοθεραπευτές, εξειδικευμένοι στην παιδική ψυχοπαθολογία και εποπτεύονται εβδομαδιαίως από την Δρ. Φύτρου για τα περιστατικά του ιατρείου.
          </p>
        </motion.div>

        <div className="space-y-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl shadow-sm p-4 md:p-6 overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">
                {/* Φωτογραφία */}
                <div className="w-full lg:w-56 flex-shrink-0">
                  <div className="relative">
                    <div className="w-48 h-48 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Βιογραφικό */}
                <div className="flex-1">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                    viewport={{ once: true }}
                    className="text-xl md:text-2xl font-bold text-gray-800 mb-3"
                  >
                    {member.name}
                  </motion.h3>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.2 }}
                    viewport={{ once: true }}
                    className="space-y-3"
                  >
                    {member.bio.split('\n\n').map((paragraph, pIndex) => (
                      <p
                        key={pIndex}
                        className="text-gray-700 leading-relaxed text-sm"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </motion.div>

                  {/* Διακοσμητική γραμμή */}
                  <div className="mt-4 w-12 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TeamMembers;
