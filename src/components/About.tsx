import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Users, Clock, Star } from 'lucide-react';
import drProfile from '../assets/dr_profile.jpeg';

interface AboutProps {
  language: 'gr' | 'en';
}

const About: React.FC<AboutProps> = ({ language }) => {
  const content = {
    gr: {
      title: 'Σχετικά με την Δρ. Φύτρου',
      subtitle: 'Αφοσιωμένη με την Ψυχική Ευεξία του Παιδιού σας και τη δική σας,',
      description1: 'η πλούσια και διεθνής εμπειρία της Ψυχίατρου έχει στηρίξει εκατοντάδες ελληνικές και ελβετικές οικογένειες.',
      description2: 'Η προσέγγιση της συνδυάζει την ασφάλεια της εμπεριστατωμένης ιατρικής κατάρτισης, την κατανόηση και τρυφερή ματιά της ψυχοδυναμικής ψυχοθεραπείας.',
      description3: 'Έχει δημιουργήσει το Πρώτο Διαδικτυακό Παιδοψυχιατρικό Ιατρείο Γονέων και Εφήβων προκειμένου γονείς και έφηβοι να βρίσκουν άμεσα στήριξη και φροντίδα στις δυσκολίες της σύγχρονη εποχής. Εξάλλου τα σύγχρονα προβλήματα πρέπει να αντιμετωπίζονται με σύγχρονους μεθόδους.',
      description4: 'Οι γονείς στη πλατφόρμα μας βρίσκουν έναν άμεσο τρόπο να επικοινωνήσουν με την Ειδικό από οπουδήποτε. Από το σπίτι, από το εξοχικό, από ένα ξενοδοχείο, από το αμάξι ακόμα και από ένα παγκάκι στο πάρκο μπορούν να βρεθούν στο διαδικτυακό μας ιατρείο με το πάτημα ενός κουμπιού του κινητού τους.',
      quote: 'Ο D.W.Winnicott είχε πει "Είναι χαρά να κρύβεσαι μα συμφορά να μην σε βρίσκουν" και μέσα σε αυτή τη φράση κρύβεται όλο το νόημα της παιδοψυχιατρικής. Το ασυνείδητο συχνά κρύβει τα τραύματα μας, χρησιμοποιεί τις άμυνες μας και δοκιμάζει την δική μας αντοχή όπως και του περιβάλλοντος μας. Ως παιδοψυχίατρος έχω τον ρόλο του ειδικού που σημειώνει το προφανές και ως ψυχοθεραπεύτρια συγχρόνως ερευνά το καλά κρυμμένο που προκαλεί τη δυσκολία. Έπειτα με αγάπη προς το παιδί και τον θεσμό της οικογένειας δουλεύουμε μαζί για να ξεπεραστεί η όποια δυσκολία έχει μπει εμπόδιο στην εξέλιξη του.',
                  qualifications: [
                    {
                      title: 'Ψυχιατρική Παιδιού και Εφήβου',
                      description: 'Η ειδικός εκπαιδεύτηκε για την απόκτηση της ειδικότητας της σε κορυφαία Πανεπιστημιακά Ευρωπαϊκά και μη Νοσοκομεία όπως:',
                      details: [
                        'Το Πανεπιστημιακό Νοσοκομείο Λοζάνης (CHUV)',
                        'Το Πανεπιστημιακό Γενικό Νοσοκομείο Αττικόν',
                        'Γενικό Νοσοκομείο Παίδων Πεντέλης',
                        'Γενικό Νοσοκομείο Κωνσταντοπούλειο',
                        'Fondation de Nant, Secteur psychiatrique (FDN)',
                        'Les Toises – Centre de psychiatrie et psychothérapie'
                      ]
                    },
                    {
                      title: 'Πιστοποιήσεις',
                      description: 'Η ειδικός έχει αναγνωριστεί και έχει άδεια ασκήσεως επαγγέλματος ως Ειδικός Ψυχίατρος και Ψυχοθεραπευτής στην Ελλάδα και την Ελβετία.'
                    },
                    {
                      title: 'Ψυχοθεραπευτική Εκπαίδευση',
                      description: 'Η ειδικός εκπαιδεύτηκε:',
                      details: [
                        'στην Ψυχοδυναμική Θεραπεία Οικογένειας από το FDN της Ελβετίας',
                        'Εκπαίδευση για την περιγεννητική περίοδο (Fantasme, formation de la période périnatale) Λοζάνη, Νοσοκομείο Νεστλέ του Κεντρικού Πανεπιστημιακού Νοσοκομείου (Hôpital Nestlé du CHUV)',
                        'Διετές Εκπαιδευτικό Πρόγραμμα «Εισαγωγή στην Ψυχαναλυτική θεωρία και Τεχνική» (Τμήμα Ψυχαναλυτικής Ψυχοθεραπείας της Α΄ Ψυχιατρικής Κλινικής του Εθνικού και Καποδιστριακού Πανεπιστημίου Αθηνών - Αιγινήτειο Νοσοκομείο)',
                        'Διετές Εκπαιδευτικό Πρόγραμμα «"Άβατον" Ψυχοδυναμική Κλινική της Ψυχοσωματικής Νόσου» (Ινστιτούτο Ψυχικής Υγείας: "ΓΑΛΗΝΟΣ")',
                        'Εκπαιδευτικό Πρόγραμμα 5 μηνών (156 ωρών) «Ψυχοπαθολογία βρέφους, παιδιού και εφήβου» (Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών)',
                        'Πρόγραμμα Συμπληρωματικής εξ Αποστάσεως Εκπαίδευσης 5μηνών «Διαχείριση Χωρισμού - Διαζυγίου Γονέων» (Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών)'
                      ]
                    },
                    {
                      title: 'Γλώσσες',
                      description: 'Η ειδικός μιλάει άψογα την ελληνική, την αγγλική και την γαλλική γλώσσα.'
                    }
                  ],
      memberships: 'Επαγγελματικές Συμμετοχές',
      membershipsList: [
        'Συμμετοχή στο 11ο Πανελλήνιο Παιδοψυχιατρικό Συνέδριο με τίτλο «Θεωρία και κλινική στην Ψυχιατρική Παιδιού και Εφήβου: Ανιχνεύοντας τις νέες ψυχοπαθολογίες» (Αθήνα, Ιούνιος 2019)',
        'Συμμετοχή στο 12ο Πανελλήνιο Παιδοψυχιατρικό Συνέδριο με θέμα το ψυχικό τραύμα (Αθήνα, Νοέμβρης 2021)',
        'Συμμετοχή στο 21ο Διεθνές Συνέδριο Παιδοψυχιατρικής (Στρασβούργο, Ιούνιος 2025)'
      ]
    },
    en: {
      title: 'About Dr. Fytrou',
      subtitle: 'Dedicated to Your Child\'s Mental Wellness',
      description1: 'Dr. Anna-Maria Fytrou is a highly experienced Child & Adolescent Psychiatrist and Psychotherapist based in Lausanne, Switzerland. With over 15 years of dedicated practice, she has helped hundreds of families navigate the complexities of mental health challenges in young people.',
      description2: 'Her approach combines evidence-based psychiatric treatment with compassionate psychotherapy, creating a safe and supportive environment where children, adolescents, and their families can heal and thrive together.',
      description3: 'She has created the First Online Child & Adolescent Psychiatric Clinic for Parents and Adolescents so that parents and adolescents can find immediate support and care for the difficulties of the modern era. After all, modern problems must be addressed with modern methods.',
      description4: 'Parents on our platform find a direct way to communicate with the specialist from anywhere. From home, from the cottage, from a hotel, from the car even from a park bench they can reach our online clinic with the press of a button on their mobile.',
      quote: 'Every child deserves to be heard, understood, and supported in their unique journey. My role is to provide that safe space where healing can begin and resilience can grow.',
      qualifications: [
        {
          title: 'Child and Adolescent Psychiatry',
          description: 'The specialist trained for the acquisition of her specialty in top European and non-European University Hospitals such as:',
          details: [
            'University Hospital of Lausanne (CHUV)',
            'Attikon University General Hospital',
            'Penteli Children\'s General Hospital',
            'Konstantopoulio General Hospital',
            'Fondation de Nant, Psychiatric Sector (FDN)',
            'Les Toises – Center for Psychiatry and Psychotherapy'
          ]
        },
        {
          title: 'Certifications',
          description: 'The specialist has been recognized and licensed to practice as a Specialist Psychiatrist and Psychotherapist in Greece and Switzerland.'
        },
        {
          title: 'Psychotherapeutic Training',
          description: 'The specialist trained:',
          details: [
            'in Family Psychodynamic Therapy from FDN of Switzerland',
            'Training for the perinatal period (Fantasme, formation de la période périnatale) Lausanne, Nestlé Hospital of the Central University Hospital (Hôpital Nestlé du CHUV)',
            'Two-year Educational Program "Introduction to Psychoanalytic Theory and Technique" (Department of Psychoanalytic Psychotherapy of the 1st Psychiatric Clinic of the National and Kapodistrian University of Athens - Aeginiteio Hospital)',
            'Two-year Educational Program "Avaton" Psychodynamic Clinic of Psychosomatic Disease (Mental Health Institute: "GALINOS")',
            '5-month Educational Program (156 hours) "Psychopathology of infants, children and adolescents" (National and Kapodistrian University of Athens)',
            '5-month Supplementary Distance Learning Program "Managing Parent Separation - Divorce" (National and Kapodistrian University of Athens)'
          ]
        },
        {
          title: 'Languages',
          description: 'The specialist speaks Greek, English and French fluently.'
        }
      ],
      memberships: 'Professional Memberships',
      membershipsList: [
        'Participation in the 11th Panhellenic Child Psychiatry Conference titled "Theory and Clinical Practice in Child and Adolescent Psychiatry: Exploring New Psychopathologies" (Athens, June 2019)',
        'Participation in the 12th Panhellenic Child Psychiatry Conference on the topic of psychological trauma (Athens, November 2021)',
        'Participation in the 21st International Child Psychiatry Conference (Strasbourg, June 2025)'
      ]
    }
  };

  const qualificationIcons = [GraduationCap, Award, Users, Clock];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-purple-soft font-semibold text-lg font-quicksand"
              >
                {content[language].title}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-gray-800 mt-2 mb-6 font-poppins"
              >
                {content[language].subtitle.split(' ').slice(0, 3).join(' ')}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
                  {' ' + content[language].subtitle.split(' ').slice(3).join(' ')}
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-lg text-gray-600 leading-relaxed mb-6 font-nunito"
              >
                {content[language].description1}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="text-lg text-gray-600 leading-relaxed mb-6 font-nunito"
              >
                {content[language].description2}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-lg text-gray-600 leading-relaxed mb-6 font-nunito"
              >
                {content[language].description3}
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                viewport={{ once: true }}
                className="text-lg text-gray-600 leading-relaxed mb-8 font-nunito"
              >
                {content[language].description4}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100"
            >
              <blockquote className="text-gray-700 italic text-lg mb-6 leading-relaxed font-nunito">
                "{content[language].quote}"
              </blockquote>
              <div className="flex items-center">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-full overflow-hidden mr-4 shadow-lg border-2 border-rose-soft"
                >
                  <img 
                    src={drProfile} 
                    alt="Dr. Anna-Maria Fytrou" 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg font-poppins">Dr. Anna-Maria Fytrou</p>
                  <p className="text-sm text-gray-600 font-quicksand">
                    {language === 'gr' ? 'Παιδοψυχίατρος' : 'Child & Adolescent Psychiatrist'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Εικόνα με χαρούμενα, υγιή παιδιά */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="mb-8 overflow-hidden rounded-4xl shadow-2xl border border-gray-100"
            >
              <img
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80"
                alt="Χαρούμενα και υγιή παιδιά παίζουν σε εξωτερικό χώρο"
                className="w-full h-64 object-cover"
              />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {content[language].qualifications.map((qual, index) => {
                const IconComponent = qualificationIcons[index] || GraduationCap;
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-r from-blue-soft to-green-soft p-3 rounded-2xl w-fit mb-4 shadow-md"
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2 font-poppins">{qual.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-nunito mb-3">{qual.description}</p>
                    {qual.details && (
                      <ul className="space-y-2">
                        {qual.details.map((detail: string, detailIndex: number) => (
                          <li key={detailIndex} className="flex items-start text-sm text-gray-600 font-nunito">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-yellow-soft to-warm-cream p-3 rounded-2xl mr-4 shadow-md"
                >
                  <Star className="h-6 w-6 text-gray-700" />
                </motion.div>
                <h3 className="font-bold text-xl text-gray-800 font-poppins">{content[language].memberships || 'Επαγγελματικές Συμμετοχές'}</h3>
              </div>
              <ul className="space-y-3">
                {(content[language].membershipsList || []).map((membership: string, index: number) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start text-gray-700 font-nunito"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-3 h-3 bg-gradient-to-r from-rose-soft to-purple-soft rounded-full mr-4 mt-1 flex-shrink-0"
                    />
                    <span className="leading-relaxed">{membership}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;