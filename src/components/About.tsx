import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Users, Clock, Star, X } from 'lucide-react';
// import drProfile from '../assets/profile.png';
import happyTeen from '../assets/happyteen.jpg';
import specialtyTitleImg from '../assets/ΤΙΤΛΟΣ ΕΙΔΙΚΟΤΗΤΑΣ.png';
import specialtyTitlePrimaryImg from '../assets/ΤΙΤΛΟΣ1ΗΣ ΕΙΔΙΚΟΤΗΤΑΣ.png';
import recognitionImg from '../assets/Αναγνωριση.png';
import psychotherapyImg from '../assets/Ψυχοθεραπεία.png';

interface AboutProps {
  language: 'gr' | 'en' | 'fr';
}

const About: React.FC<AboutProps> = ({ language }) => {
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const content = {
    gr: {
      title: 'Σχετικά με την Δρ. Φύτρου',
      subtitle: 'Αφοσιωμένη με την Ψυχική Ευεξία του Παιδιού σας και τη δική σας,',
      description1: 'η πλούσια και διεθνής εμπειρία της Ψυχίατρου έχει στηρίξει εκατοντάδες ελληνικές και ελβετικές οικογένειες.',
      description2: 'Η προσέγγιση της συνδυάζει την ασφάλεια της εμπεριστατωμένης ιατρικής κατάρτισης, την κατανόηση και τρυφερή ματιά της ψυχοδυναμικής ψυχοθεραπείας.',
      description3: 'Έχει δημιουργήσει το Πρώτο Διαδικτυακό Παιδοψυχιατρικό Ιατρείο Γονέων και Εφήβων προκειμένου γονείς και έφηβοι να βρίσκουν άμεσα στήριξη και φροντίδα στις δυσκολίες της σύγχρονη εποχής. Εξάλλου τα σύγχρονα προβλήματα πρέπει να αντιμετωπίζονται με σύγχρονους μεθόδους.',
      description4: 'Οι γονείς στη πλατφόρμα μας βρίσκουν έναν άμεσο τρόπο να επικοινωνήσουν με την Ειδικό από οπουδήποτε. Από το σπίτι, από το εξοχικό, από ένα ξενοδοχείο, από το αμάξι ακόμα και από ένα παγκάκι στο πάρκο μπορούν να βρεθούν στο διαδικτυακό μας ιατρείο με το πάτημα ενός κουμπιού του κινητού τους.',
      quote: 'Ο D.W.Winnicott είχε πει "Είναι χαρά να κρύβεσαι μα συμφορά να μην σε βρίσκουν" και μέσα σε αυτή τη φράση κρύβεται όλο το νόημα της παιδοψυχιατρικής. Το ασυνείδητο συχνά κρύβει τα τραύματα μας, χρησιμοποιεί τις άμυνες μας και δοκιμάζει την δική μας αντοχή όπως και του περιβάλλοντος μας. Ως παιδοψυχίατρος έχω τον ρόλο του ειδικού που σημειώνει το προφανές και ως ψυχοθεραπεύτρια συγχρόνως ερευνώ το καλά κρυμμένο που προκαλεί τη δυσκολία. Έπειτα με αγάπη προς το παιδί και τον θεσμό της οικογένειας δουλεύουμε μαζί για να ξεπεραστεί η όποια δυσκολία έχει μπει εμπόδιο στην εξέλιξη του.',
                  qualifications: [
                    {
                      title: 'Ψυχιατρική Παιδιού και Εφήβου',
                      description: 'Η ειδικός εκπαιδεύτηκε για την απόκτηση της ειδικότητας της σε κορυφαία Πανεπιστημιακά Ευρωπαϊκά και μη Νοσοκομεία όπως:',
                      details: [
                        'Πανεπιστημιακό Νοσοκομείο Λοζάνης (CHUV)',
                        'Πανεπιστημιακό Γενικό Νοσοκομείο Αττικόν',
                        'Γενικό Νοσοκομείο Παίδων Πεντέλης',
                        'Γενικό Νοσοκομείο Κωνσταντοπούλειο',
                        'Fondation de Nant, Secteur psychiatrique (FDN)',
                        'Les Toises – Centre de psychiatrie et psychothérapie'
                      ]
                    },
                    {
                      title: 'Πιστοποιήσεις',
                      description: 'Η ειδικός έχει αναγνωρισμένο Πτυχίο Ιατρικής και έχει Άδεια Ασκήσεως Επαγγέλματος ως Ειδικός Ψυχίατρος Παιδιού και Εφήβου και Ψυχοθεραπευτής στην Ελλάδα και την Ελβετία.'
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
                      description: 'Η ειδικός μιλάει άψογα τις παρακάτω γλώσσες:',
                      details: [
                        'Ελληνικά',
                        'Αγγλικά', 
                        'Γαλλικά'
                      ]
                    }
                  ],
      viewSpecialtyButton: 'Τίτλος Ειδικότητας/Τίτλος Ψυχοθεραπευτή (Ελλάδα & Ελβετία)',
      closeButton: 'Κλείσιμο',
      memberships: 'Επαγγελματικές Συμμετοχές',
      membershipsList: [
        'Συμμετοχή στο 11ο Πανελλήνιο Παιδοψυχιατρικό Συνέδριο με τίτλο «Θεωρία και κλινική στην Ψυχιατρική Παιδιού και Εφήβου: Ανιχνεύοντας τις νέες ψυχοπαθολογίες» (Αθήνα, Ιούνιος 2019)',
        'Συμμετοχή στο 12ο Πανελλήνιο Παιδοψυχιατρικό Συνέδριο με θέμα το ψυχικό τραύμα (Αθήνα, Νοέμβρης 2021)',
        'Συμμετοχή στο 21ο Διεθνές Συνέδριο Παιδοψυχιατρικής (Στρασβούργο, Ιούνιος 2025)'
      ]
    },
    fr: {
      title: 'À propos du Dr Fytrou',
      subtitle: 'Dédiée au Bien-être Mental de votre Enfant et au vôtre,',
      description1: 'la riche et internationale expérience de la Psychiatre a soutenu des centaines de familles grecques et suisses.',
      description2: 'Son approche combine la sécurité de la formation médicale sophistiquée, la compréhension et le regard tendre de la psychothérapie psychodynamique.',
      description3: 'Elle a créé la Première Clinique Psychiatrique en ligne pour Parents et Adolescents afin que les parents et adolescents puissent trouver un soutien et des soins immédiats pour les difficultés de l\'ère moderne. Après tout, les problèmes modernes doivent être abordés avec des méthodes modernes.',
      description4: 'Les parents sur notre plateforme trouvent un moyen direct de communiquer avec le spécialiste de n\'importe où. De la maison, du chalet, d\'un hôtel, de la voiture même d\'un banc de parc, ils peuvent accéder à notre clinique en ligne en appuyant sur un bouton de leur mobile.',
      quote: 'D.W.Winnicott avait dit "C\'est une joie d\'être caché mais un désastre de ne pas être trouvé" et dans cette phrase se cache tout le sens de la psychiatrie de l\'enfant. L\'inconscient cache souvent nos traumatismes, utilise nos défenses et teste notre propre endurance ainsi que celle de notre environnement. En tant que psychiatre pour enfants, j\'ai le rôle du spécialiste qui note l\'évident et en tant que psychothérapeute, j\'explore simultanément le bien caché qui cause la difficulté. Puis avec amour pour l\'enfant et l\'institution de la famille, nous travaillons ensemble pour surmonter toute difficulté qui est devenue un obstacle à leur développement.',
      qualifications: [
        {
          title: 'Psychiatrie de l\'Enfant et de l\'Adolescent',
          description: 'La spécialiste s\'est formée pour l\'acquisition de sa spécialité dans les meilleurs Hôpitaux Universitaires Européens et non-européens tels que:',
          details: [
            'Hôpital Universitaire de Lausanne (CHUV)',
            'Hôpital Général Universitaire Attikon',
            'Hôpital Général des Enfants de Penteli',
            'Hôpital Général Konstantopoulio',
            'Fondation de Nant, Secteur psychiatrique (FDN)',
            'Les Toises – Centre de psychiatrie et psychothérapie'
          ]
        },
        {
          title: 'Certifications',
          description: 'La spécialiste a un Diplôme de Médecine reconnu et a une Licence d\'Exercice Professionnel en tant que Psychiatre Spécialiste pour Enfants et Adolescents et Psychothérapeute en Grèce et en Suisse.'
        },
        {
          title: 'Formation Psychothérapeutique',
          description: 'La spécialiste s\'est formée:',
          details: [
            'en Thérapie Psychodynamique Familiale du FDN de Suisse',
            'Formation pour la période périnatale (Fantasme, formation de la période périnatale) Lausanne, Hôpital Nestlé du Centre Hospitalier Universitaire (Hôpital Nestlé du CHUV)',
            'Programme Éducatif de Deux Ans "Introduction à la Théorie et Technique Psychanalytique" (Département de Psychothérapie Psychanalytique de la 1ère Clinique Psychiatrique de l\'Université Nationale et Kapodistrienne d\'Athènes - Hôpital Aeginiteio)',
            'Programme Éducatif de Deux Ans "Avaton" Clinique Psychodynamique de la Maladie Psychosomatique (Institut de Santé Mentale: "GALINOS")',
            'Programme Éducatif de 5 mois (156 heures) "Psychopathologie des nourrissons, enfants et adolescents" (Université Nationale et Kapodistrienne d\'Athènes)',
            'Programme de Formation Complémentaire à Distance de 5 mois "Gestion de la Séparation Parentale - Divorce" (Université Nationale et Kapodistrienne d\'Athènes)'
          ]
        },
        {
          title: 'Langues',
          description: 'La spécialiste parle couramment les langues suivantes:',
          details: [
            'Grec',
            'Anglais',
            'Français'
          ]
        }
      ],
      viewSpecialtyButton: 'Titre de Spécialité/Titre de Psychothérapeute (Grèce & Suisse)',
      closeButton: 'Fermer',
      memberships: 'Participations Professionnelles',
      membershipsList: [
        'Participation au 11ème Congrès Panhellénique de Psychiatrie de l\'Enfant avec le titre "Théorie et clinique en Psychiatrie de l\'Enfant et de l\'Adolescent: Explorer les nouvelles psychopathologies" (Athènes, Juin 2019)',
        'Participation au 12ème Congrès Panhellénique de Psychiatrie de l\'Enfant sur le thème du traumatisme psychologique (Athènes, Novembre 2021)',
        'Participation au 21ème Congrès International de Psychiatrie de l\'Enfant (Strasbourg, Juin 2025)'
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
          description: 'The specialist speaks the following languages fluently:',
          details: [
            'Greek',
            'English',
            'French'
          ]
        }
      ],
      viewSpecialtyButton: 'Specialty Title/Psychotherapist Title (Greece & Switzerland)',
      closeButton: 'Close',
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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="mb-8">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 font-semibold text-lg font-quicksand"
              >
{content[language].title}
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold mt-2 mb-6 font-poppins"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
                  {content[language].subtitle}
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 font-nunito"
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

            {/* Ψυχοθεραπευτική Εκπαίδευση */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-4xl shadow-xl border border-gray-100 mt-6"
            >
              <div className="flex items-center mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-purple-soft to-blue-soft p-3 rounded-2xl mr-4 shadow-md"
                >
                  <Users className="h-5 w-5 text-white" />
                </motion.div>
                <h3 className="font-bold text-lg text-gray-800 font-poppins">{content[language].qualifications[2].title}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed font-nunito mb-4">{content[language].qualifications[2].description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(content[language].qualifications[2].details || []).map((detail: string, index: number) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start text-gray-700 font-nunito text-sm"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 bg-gradient-to-r from-purple-soft to-blue-soft rounded-full mr-3 mt-1 flex-shrink-0"
                    />
                    <span className="leading-relaxed">{detail}</span>
                  </motion.li>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            {/* Εικόνα με χαρούμενα, υγιή παιδιά */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="mb-8 overflow-hidden rounded-4xl shadow-2xl border border-gray-100 mt-8"
            >
              <img
                src={happyTeen}
                alt="Χαρούμενα και υγιή παιδιά παίζουν σε εξωτερικό χώρο"
                className="w-full h-64 object-cover"
              />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {content[language].qualifications.filter((_, index) => index !== 2).map((qual, index) => {
                const originalIndex = content[language].qualifications.indexOf(qual);
                const IconComponent = qualificationIcons[originalIndex] || GraduationCap;
                return (
                  <motion.div 
                    key={originalIndex}
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
              {/* Extra card: Specialty Titles button to occupy the empty spot */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowSpecialtyModal(true)}
                  className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 text-gray-700 px-6 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 font-quicksand border border-white/50 text-center"
                >
                  {content[language].viewSpecialtyButton}
                </motion.button>
              </motion.div>
            </div>

            {/* Modal για προβολή PDFs Ειδικότητας/Τίτλων */}
            {showSpecialtyModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSpecialtyModal(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                  onClick={(e)=> e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-rose-soft to-purple-soft text-white p-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold font-poppins">{content[language].viewSpecialtyButton}</h3>
                    <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={()=> setShowSpecialtyModal(false)} className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/20 transition-colors">
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="space-y-4">
                      {[specialtyTitlePrimaryImg, specialtyTitleImg, recognitionImg, psychotherapyImg].map((image, idx)=> (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <img
                            src={image}
                            alt={`Certificate ${idx + 1}`}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Επαγγελματικές Συμμετοχές */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-4xl shadow-xl border border-gray-100 mt-6"
            >
              <div className="flex items-center mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-yellow-soft to-warm-cream p-3 rounded-2xl mr-4 shadow-md"
                >
                  <Star className="h-5 w-5 text-gray-700" />
                </motion.div>
                <h3 className="font-bold text-lg text-gray-800 font-poppins">{content[language].memberships || 'Επαγγελματικές Συμμετοχές'}</h3>
              </div>
              <ul className="space-y-2">
                {(content[language].membershipsList || []).map((membership: string, index: number) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start text-gray-700 font-nunito text-sm"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 bg-gradient-to-r from-rose-soft to-purple-soft rounded-full mr-3 mt-1 flex-shrink-0"
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