import React, { useState } from 'react';
import doctorsImg from '../assets/doctors.JPG';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ioannaCertificate from '../assets/ioanna_certificate.png';
import wolverhampton from '../assets/WOLVERHAMPTON.png';
import sofiaCertificate from '../assets/sofia_certificate.png';
import sofiaMaster from '../assets/sofia_master.png';
import certificatSystemique from '../assets/Certificat Systemique.png';
import analytikiVeveosiStergiou from '../assets/Αναλυτική Βεβαίωση Στεργίου ΣΥΣΤΗΜΙΚΗ.png';
import metaptychiakoEkseliktikisSxolikis from '../assets/ΜΕΤΑΠΤΥΧΙΑΚΟ ΕΞΕΛΙΚΤΙΚΗΣ ΣΧΟΛΙΚΗΣ ΨΥΧΟΛΟΓΙΑΣ.png';
import metaptychiakoEfarmoges from '../assets/ΜΕΤΑΠΤΥΧΙΑΚΟ ΕΦΑΡΜΟΓΕΣ ΤΗΣ ΨΥΧΟΛΟΓΙΑΣ ΣΤΗΝ ΥΓΕΙΑ.png';
import ptychioPsychologias from '../assets/ΠΤΥΧΙΟ ΨΥΧΟΛΟΓΙΑΣ.png';

interface TeamMembersProps {
  language: string;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ language }) => {
  const lang = language as 'gr' | 'en' | 'fr';
  
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);

  const content = {
    gr: {
      title: 'Η ομάδα της Δρ. Φύτρου',
      subtitle: 'Οι συνεργάτες μας είναι ψυχολόγοι και ψυχοθεραπευτές, εξειδικευμένοι στην παιδική ψυχοπαθολογία και εποπτεύονται εβδομαδιαίως από την Δρ. Φύτρου για τα περιστατικά του ιατρείου.',
      viewButton: 'Προβολή Πτυχίου/Εκπαιδεύσεων',
      closeButton: 'Κλείσιμο'
    },
    en: {
      title: 'Dr. Fytrou\'s Team',
      subtitle: 'Our collaborators are psychologists and psychotherapists, specialized in child psychopathology and supervised weekly by Dr. Fytrou for the clinic\'s cases.',
      viewButton: 'View Degree/Training',
      closeButton: 'Close'
    },
    fr: {
      title: 'L\'équipe du Dr Fytrou',
      subtitle: 'Nos collaborateurs sont des psychologues et psychothérapeutes, spécialisés en psychopathologie de l\'enfant et supervisés hebdomadairement par le Dr Fytrou pour les cas de la clinique.',
      viewButton: 'Voir Diplôme/Formation',
      closeButton: 'Fermer'
    }
  };

  const handleViewCertificates = (memberId: number) => {
    setSelectedMember(memberId);
    if (memberId === 1) {
      // Ioanna Pissari
      setSelectedPDFs([ioannaCertificate, wolverhampton]);
    } else if (memberId === 2) {
      // Sofia Spyriadou
      setSelectedPDFs([sofiaCertificate, sofiaMaster]);
    } else if (memberId === 3) {
      // Eirini Stergiou
      setSelectedPDFs([
        ptychioPsychologias,
        metaptychiakoEkseliktikisSxolikis,
        metaptychiakoEfarmoges,
        certificatSystemique,
        analytikiVeveosiStergiou
      ]);
    }
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setSelectedPDFs([]);
  };

  const teamMembers = {
    gr: [
      {
        id: 1,
        name: 'Ιωάννα Πισσάρη',
        image: '/sofia_spyriadou.png',
        bio: `Η κυρία Πισσάρη ολοκλήρωσε τις σπουδές της στην Ψυχολογία στο Εθνικό Καποδιστριακό Πανεπιστήμιο Αθηνών και ακολούθησε **Μεταπτυχιακό Πρόγραμμα Σπουδών στην Κλινική Ψυχική Υγεία** στο Πανεπιστήμιο «University of Wolverhampton» της Αγγλίας.

Το ενδιαφέρον της στρέφεται γύρω από την **4ετή εκπαίδευση της στην Γνωσιακή Συμπεριφορική Ψυχοθεραπεία** από την Εταιρεία Γνωσιακής Συμπεριφορικής Ψυχοθεραπείας, ενώ παράλληλα είναι εξειδικευμένη στο **Φάσμα του Αυτισμού** και την **Διαταραχή Ελλειματικής Προσοχής και Υπερκινητικότητας (ΔΕΠΥ)** από το Πανεπιστήμιου «University of Derby» της Αγγλίας.

Η κυρία Πισσάρη είναι **Υπέρμαχος της προστασίας των γυναικών και των ασθενών**. Έχει υποστηρίξει με την συμμετοχή της, επιστημονικές έρευνες και ημερίδες, πληθώρα ασθενών της Γενικής Ιδιωτικής Γυναικολογικής Κλινικής ΙΑΣΩ. Έχει στενή συνεργασία με το Εθνικό Κέντρο Κοινωνικών Ερευνών και την Ευρωπαϊκή Ένωση ΕΚΚΕ όπου διεξάγει έρευνες που αφορούν την κακοποίηση και τη προστασία των κακοποιημένων γυναικών. Επιπλέον ήταν Υπεύθυνη Ομάδας στο πρόγραμμα «Project C Foundation» όπου υποστήριζε ασθενείς μέσα από Πλατφόρμες Κοινωνικής Δικτύωσης.

Είναι η ιδανική ειδικός για τη **Πρώτη Συνεδρία των γονέων** με το Ιατρείο μας, την **Εξέταση και Ψυχοθεραπεία παιδιών και εφήβων** και για **Συμβουλευτική γονέων**.

Η κλινική παιδοψυχολόγος μιλάει **άψογα ελληνικά και αγγλικά**.`
      },
      {
        id: 2,
        name: 'Σοφία Σπυριάδου',
        image: '/ioanna_pissari.png',
        bio: `Η κυρία Σπυριάδου ολοκλήρωσε τις σπουδές της στη Ψυχολογία στο Αριστοτέλειο Πανεπιστήμιο Θεσσαλονίκης και ακολούθησε **Μεταπτυχιακό Πρόγραμμα Σπουδών στην Κλινική Ψυχική Υγεία** στο ίδιο Πανεπιστήμιο.

Έχει εκπαιδευτεί στην **Κλινική Ψυχομετρία και Νευροψυχολογία** στη Γ' Πανεπιστημιακή Ψυχιατρική Κλινική του ΑΧΕΠΑ. Εμπλουτίζει τις γνώσεις της με την **4ετή εκπαίδευση της στη Γνωσιακή Συμπεριφορική Ψυχοθεραπεία** στην Ελληνική Εταιρεία Γνωσιακής και Συμπεριφορικής Ψυχοθεραπείας.

Είναι **πιστοποιημένη στη χορήγηση ψυχομετρικών εργαλείων** όπως : Τεστ νοημοσύνης ενηλίκων **WAIS- V**, Τεστ νοημοσύνης ανηλίκων **WISC- III**, Κλίμακα κατάθλιψης **Hamilton-D**, **SCI- PANSS**, για την σχιζοφρένεια, Κλίμακα μανίας, διπολικής διαταραχής, Young Mania Rating Scale. Έχει εκπαιδευτεί από το Αμερικανικό Πανεπιστήμιο του Κολοράντο «University of Colorado,陕西» στη **σχολική ψυχολογία**. Έχοντας τεράστια εμπειρία στο ελληνικό και το γερμανικό σύστημα εκπαίδευσης, διαθέτει όλα τα εφόδια να συνοδεύσει τα παιδιά και τους εφήβους στις δυσκολίες τους κατά τα σχολικά χρόνια.

Είναι η ιδανική ειδικός για τη **Πρώτη Συνεδρία των γονέων** με το Ιατρείο μας, την **Εξέταση και Ψυχοθεραπεία παιδιών και εφήβων** και τους γονείς τους σε **Συμβουλευτική γονέων**.

Η κλινική παιδοψυχολόγος μιλάει **άψογα ελληνικά και γερμανικά**.`
      },
      {
        id: 3,
        name: 'Ειρήνη Στεργίου',
        image: '/Eirini_Stergiou.jpg',
        bio: `Η κυρία Στεργίου ολοκλήρωσε τις σπουδές της στη Ψυχολογία στο Αριστοτέλειο Πανεπιστήμιο Θεσσαλονίκης, ακολούθησε το πρώτο της **Μεταπτυχιακό Πρόγραμμα σπουδών στην Αναπτυξιακή και Σχολική Ψυχολογία** και έπειτα ολοκλήρωσε και δεύτερο της **Μεταπτυχιακό Πρόγραμμα σπουδών στις Εφαρμογές της Ψυχολογίας στην Υγεία**, στο τμήμα ιατρικής στο ίδιο Πανεπιστήμιο.

Έχει ολοκληρώσει την **4ετή εκπαίδευση της στη Συστημική Οικογενειακή Ψυχοθεραπεία** στο Ινστιτούτο Συστημικής Σκέψης και Ψυχοθεραπείας, ενώ είναι **πιστοποιημένη στη χορήγηση και αξιολόγηση ψυχομετρικών εργαλείων** όπως το **WISC-V**.

Έχει έντονη επιστημονική δραστηριότητα, επί του παρόντος, στο Νοσοκομείο **«Hôpital Du Jura»** στο Ντελεμόντ της Ελβετίας και στο Ιδιωτικό Ψυχιατρικό Κέντρο **«Les Toises»** της Λωζάνης. To ενδιαφέρον της αφορά κυρίως τις **νευροαναπτυξιακές διαταραχές (ΔΕΠΥ, αυτισμός)**, την **παιδική κατάθλιψη και το πένθος**. Στην Ελλάδα συμμετείχε σε διεπιστημονικές ομάδες Εθελοντικών Προγραμμάτων της Unicef όπως το **«Solidarity Now»**, του Διεθνή Οργανισμού Μετανάστευσης όπως το **«Helios»** και των **Γιατρών Χωρίς Σύνορα**.

Είναι η ιδανική ειδικός για **Εξέταση και Ψυχοθεραπεία παιδιών και εφήβων και για Συμβουλευτική γονέων**.

Η **αναπτυξιακή παιδοψυχολόγος μιλάει άψογα ελληνικά και γαλλικά**.`
      }
    ],
    en: [
      {
        id: 1,
        name: 'Ioanna Pissari',
        image: '/sofia_spyriadou.png',
        bio: `Ms. Pissari completed her studies in Psychology at the National and Kapodistrian University of Athens and followed a **Master's Program in Clinical Mental Health** at the University "University of Wolverhampton" in England.

Her interest revolves around her **4-year training in Cognitive Behavioral Therapy** from the Cognitive Behavioral Therapy Society, while she is also specialized in **Autism Spectrum** and **Attention Deficit Hyperactivity Disorder (ADHD)** from the University "University of Derby" in England.

Ms. Pissari is a **Champion of women's and patients' protection**. She has supported, through her participation, scientific research and conferences, a multitude of patients from the General Private Gynecological Clinic IASO. She has close collaboration with the National Center for Social Research and the European Union EKKE where she conducts research concerning abuse and protection of abused women. Furthermore, she was Group Leader in the "Project C Foundation" program where she supported patients through Social Networking Platforms.

She is the ideal specialist for the **First Parent Session** with our Clinic, **Examination and Psychotherapy of children and adolescents** and for **Parent Counseling**.

The clinical child psychologist speaks **fluent Greek and English**.`
      },
      {
        id: 2,
        name: 'Sofia Spyriadou',
        image: '/ioanna_pissari.png',
        bio: `Ms. Spyriadou completed her studies in Psychology at Aristotle University of Thessaloniki and followed a **Master's Program in Clinical Mental Health** at the same University.

She has been trained in **Clinical Psychometry and Neuropsychology** at the 3rd University Psychiatric Clinic of AHEPA. She enriches her knowledge with her **4-year training in Cognitive Behavioral Therapy** at the Greek Society of Cognitive and Behavioral Therapy.

She is **certified in administering psychometric tools** such as: Adult Intelligence Test **WAIS-V**, Juvenile Intelligence Test **WISC-III**, Depression Scale **Hamilton-D**, **SCI-PANSS** for schizophrenia, Mania Scale, bipolar disorder, Young Mania Rating Scale. She has been trained by the American University of Colorado "University of Colorado, USA" in **school psychology**. Having extensive experience in the Greek and German education system, she has all the tools to support children and adolescents in their difficulties during school years.

She is the ideal specialist for the **First Parent Session** with our Clinic, **Examination and Psychotherapy of children and adolescents** and their parents in **Parent Counseling**.

The clinical child psychologist speaks **fluent Greek and German**.`
      },
      {
        id: 3,
        name: 'Eirini Stergiou',
        image: '/Eirini_Stergiou.jpg',
        bio: `Ms. Stergiou completed her studies in Psychology at Aristotle University of Thessaloniki, followed her first **Master's Program in Developmental and School Psychology** and then completed her second **Master's Program in Applications of Psychology in Health**, in the medical department of the same University.

She has completed her **4-year training in Systemic Family Psychotherapy** at the Institute of Systemic Thinking and Psychotherapy, while she is **certified in administering and evaluating psychometric tools** such as **WISC-V**.

She has intense scientific activity, currently at the **"Hôpital Du Jura"** Hospital in Delémont, Switzerland and at the Private Psychiatric Center **"Les Toises"** in Lausanne. Her interest mainly concerns **neurodevelopmental disorders (ADHD, autism)**, **childhood depression and grief**. In Greece, she participated in interdisciplinary groups of UNICEF Volunteer Programs such as **"Solidarity Now"**, of the International Organization for Migration such as **"Helios"** and **"Doctors Without Borders"**.

She is the ideal specialist for **Examination and Psychotherapy of children and adolescents and for Parent Counseling**.

The **developmental child psychologist speaks fluent Greek and French**.`
      }
    ],
    fr: [
      {
        id: 1,
        name: 'Ioanna Pissari',
        image: '/sofia_spyriadou.png',
        bio: `Mme Pissari a terminé ses études en Psychologie à l'Université Nationale et Kapodistrienne d'Athènes et a suivi un **Programme de Master en Santé Mentale Clinique** à l'Université "University of Wolverhampton" en Angleterre.

Son intérêt tourne autour de sa **formation de 4 ans en Thérapie Cognitivo-Comportementale** de la Société de Thérapie Cognitivo-Comportementale, tandis qu'elle est également spécialisée dans le **Spectre de l'Autisme** et le **Trouble Déficitaire de l'Attention avec Hyperactivité (TDAH)** de l'Université "University of Derby" en Angleterre.

Mme Pissari est une **Championne de la protection des femmes et des patients**. Elle a soutenu, par sa participation, des recherches scientifiques et des conférences, une multitude de patients de la Clinique Gynécologique Privée Générale IASO. Elle a une collaboration étroite avec le Centre National de Recherche Sociale et l'Union Européenne EKKE où elle mène des recherches concernant l'abus et la protection des femmes maltraitées. De plus, elle était Responsable d'Équipe dans le programme "Project C Foundation" où elle soutenait les patients via des Plateformes de Réseaux Sociaux.

Elle est la spécialiste idéale pour la **Première Session Parentale** avec notre Clinique, l'**Examen et Psychothérapie des enfants et adolescents** et pour le **Conseil Parental**.

La psychologue clinique pour enfants parle **couramment le grec et l'anglais**.`
      },
      {
        id: 2,
        name: 'Sofia Spyriadou',
        image: '/ioanna_pissari.png',
        bio: `Mme Spyriadou a terminé ses études en Psychologie à l'Université Aristote de Thessalonique et a suivi un **Programme de Master en Santé Mentale Clinique** à la même Université.

Elle a été formée en **Psychométrie Clinique et Neuropsychologie** à la 3ème Clinique Psychiatrique Universitaire d'AHEPA. Elle enrichit ses connaissances avec sa **formation de 4 ans en Thérapie Cognitivo-Comportementale** à la Société Grecque de Thérapie Cognitivo-Comportementale.

Elle est **certifiée dans l'administration d'outils psychométriques** tels que : Test d'intelligence adulte **WAIS-V**, Test d'intelligence juvénile **WISC-III**, Échelle de dépression **Hamilton-D**, **SCI-PANSS** pour la schizophrénie, Échelle de manie, trouble bipolaire, Young Mania Rating Scale. Elle a été formée par l'Université Américaine du Colorado "University of Colorado, USA" en **psychologie scolaire**. Ayant une vaste expérience dans le système éducatif grec et allemand, elle dispose de tous les outils pour accompagner les enfants et adolescents dans leurs difficultés pendant les années scolaires.

Elle est la spécialiste idéale pour la **Première Session Parentale** avec notre Clinique, l'**Examen et Psychothérapie des enfants et adolescents** et leurs parents en **Conseil Parental**.

La psychologue clinique pour enfants parle **couramment le grec et l'allemand**.`
      },
      {
        id: 3,
        name: 'Eirini Stergiou',
        image: '/Eirini_Stergiou.jpg',
        bio: `Mme Stergiou a terminé ses études en Psychologie à l'Université Aristote de Thessalonique, a suivi son premier **Programme de Master en Psychologie du Développement et Scolaire** puis a terminé son deuxième **Programme de Master en Applications de la Psychologie dans la Santé**, dans le département médical de la même Université.

Elle a terminé sa **formation de 4 ans en Psychothérapie Familiale Systémique** à l'Institut de Pensée Systémique et Psychothérapie, tandis qu'elle est **certifiée dans l'administration et l'évaluation d'outils psychométriques** tels que **WISC-V**.

Elle a une activité scientifique intense, actuellement à l'Hôpital **"Hôpital Du Jura"** à Delémont, Suisse et au Centre Psychiatrique Privé **"Les Toises"** à Lausanne. Son intérêt concerne principalement les **troubles neurodéveloppementaux (TDAH, autisme)**, la **dépression infantile et le deuil**. En Grèce, elle a participé à des groupes interdisciplinaires de Programmes de Bénévoles UNICEF comme **"Solidarity Now"**, de l'Organisation Internationale pour les Migrations comme **"Helios"** et **"Médecins Sans Frontières"**.

Elle est la spécialiste idéale pour l'**Examen et Psychothérapie des enfants et adolescents et pour le Conseil Parental**.

La **psychologue du développement pour enfants parle couramment le grec et le français**.`
      }
    ]
  };

  return (
    <section id="team" className="py-6 bg-white" data-section="team">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content[lang].title}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-bold" dangerouslySetInnerHTML={{
            __html: content[lang].subtitle.replace('εποπτεύονται εβδομαδιαίως από την Δρ. Φύτρου', '<u>εποπτεύονται εβδομαδιαίως από την Δρ. Φύτρου</u>')
          }}>
          </p>
        </motion.div>

        {/* Ενιαίο μεγάλο πλαίσιο με δύο εικόνες στο πάνω μέρος */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden mb-8"
        >
          {/* Ενιαία εικόνα στο πάνω μέρος */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative w-full h-[20rem] sm:h-[25rem] md:h-[30rem] lg:h-[35rem] overflow-hidden bg-gray-50 flex items-center justify-center"
          >
            {/* Ενιαία εικόνα */}
            <div className="w-full h-full relative overflow-hidden">
              <img
                src={doctorsImg}
                alt="Η ομάδα μας"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20"></div>
            </div>
            
            {/* Διακοσμητικό στοιχείο */}
            <div className="absolute inset-0 border-4 border-white/30 rounded-t-2xl"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0">
            {teamMembers[lang].slice(0, 2).map((member: any, index: number) => (
              <div key={member.id} className={`p-4 sm:p-8 ${index === 0 ? 'lg:pr-6' : 'lg:pl-6'} relative`}>
                {/* Όνομα */}
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.3 }}
                  viewport={{ once: true }}
                  className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-6"
                >
                  <span className="underline">{member.name}</span>
                </motion.h3>
                
                {/* Βιογραφικό κείμενο */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.3 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  {member.bio.split('\n\n').map((paragraph: string, pIndex: number) => (
                    <p
                      key={pIndex}
                      className="text-gray-700 leading-relaxed text-xs sm:text-sm text-justify"
                      dangerouslySetInnerHTML={{
                        __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-black">$1</span>')
                      }}
                    />
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

                {/* Κουμπί Προβολή Πτυχίου/Εκπαιδεύσεων - μόνο για Ιωάννα (id:1) και Σοφία (id:2) */}
                {(member.id === 1 || member.id === 2) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 + index * 0.3 }}
                    viewport={{ once: true }}
                    className="mt-6 flex justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewCertificates(member.id)}
                      className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 font-quicksand border border-white/50"
                    >
                      {content[lang].viewButton}
                    </motion.button>
                  </motion.div>
                )}

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

        {/* Τρίτο βιογραφικό - Ειρήνη Στεργίου - Οριζόντια διάταξη */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Εικόνα στα αριστερά */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/3 h-80 sm:h-96 md:h-[28rem] lg:h-auto overflow-hidden bg-gray-50 flex items-center justify-center"
            >
              <img
                src={teamMembers[lang][2].image}
                alt={teamMembers[lang][2].name}
                className="w-full h-full object-cover object-top sm:object-[center_top] md:object-[center_top] lg:object-[center_top] sm:scale-100 md:scale-110 lg:scale-100"
                style={{ objectPosition: 'center top' }}
              />
            </motion.div>

            {/* Περιεχόμενο στα δεξιά */}
            <div className="w-full lg:w-2/3 p-8">
              {/* Όνομα */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center lg:text-left text-xl md:text-2xl font-bold text-gray-800 mb-6"
              >
                <span className="underline">{teamMembers[lang][2].name}</span>
              </motion.h3>
              
              {/* Βιογραφικό κείμενο */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {teamMembers[lang][2].bio.split('\n\n').map((paragraph: string, pIndex: number) => (
                  <p
                    key={pIndex}
                    className="text-gray-700 leading-relaxed text-sm text-justify"
                    dangerouslySetInnerHTML={{
                      __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-black">$1</span>')
                    }}
                  />
                ))}
              </motion.div>

              {/* Διακοσμητική γραμμή κάτω */}
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="mt-6 flex justify-center lg:justify-start"
              >
                <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
              </motion.div>

              {/* Κουμπί Προβολή Πτυχίου/Εκπαιδεύσεων για Ειρήνη Στεργίου (id: 3) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                viewport={{ once: true }}
                className="mt-6 flex justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewCertificates(3)}
                  className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 font-quicksand border border-white/50"
                >
                  {content[lang].viewButton}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Modal για προβολή PDFs */}
      {selectedMember !== null && selectedPDFs.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-soft to-purple-soft text-white p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold font-poppins">
                {content[lang].viewButton}
              </h3>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Image Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-4">
                {selectedPDFs.map((image, imageIndex) => (
                  <div key={imageIndex} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={image}
                      alt={`Certificate ${imageIndex + 1}`}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default TeamMembers;
