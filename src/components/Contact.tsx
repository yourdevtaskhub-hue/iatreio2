import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Clock, Calendar, Shield, Heart, Send, Instagram, Facebook, X, Clock3 } from 'lucide-react';
import profile2 from '../assets/profile2.JPG';
import { supabase } from '../lib/supabase';
import { AdminSettings, Doctor, SlotInfo } from '../types/appointments';
import { getUserTimezone, toDateString, getCurrentDateInTimezone } from '../lib/timezone';
import StripeCheckout from './StripeCheckout';

interface ContactProps {
  language: 'gr' | 'en' | 'fr';
}

const Contact: React.FC<ContactProps> = ({ language }) => {
  const [formData, setFormData] = useState({
    parentName: '',
    childAge: '',
    email: '',
    phone: '',
    urgency: '',
    message: '',
    appointmentDate: '',
    privacyAccepted: false,
    recordingPolicyAccepted: false,
    parentalConsentAccepted: false,
    isFirstSession: ''
  });
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedThematology, setSelectedThematology] = useState<string>('');
  const [messageLength, setMessageLength] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  
  // Φιλτραρισμένες θεματολογίες βάσει επιλεγμένης ειδικότητας
  const getAvailableThematologies = () => {
    if (!selectedSpecialty) return [];
    
    if (selectedSpecialty === 'psychiatrist') {
      // Για Ψυχίατρο Παιδιού και Εφήβου & Ψυχοθεραπεύτρια: εποπτεία ειδικών, φαρμακευτική ρύθμιση, επιστημονική επιμέλεια, εξέταση παιδιού από ψυχίατρο, ψυχοθεραπεία παιδιού με ψυχίατρο
      return [
        'supervision',
        'medicationAdjustment', 
        'scientificSupervision',
        'childExamPsychiatrist',
        'childTherapyPsychiatrist'
      ];
    } else if (selectedSpecialty === 'psychologist') {
      // Για Παιδοψυχολόγο & Ψυχοθεραπεύτρια: όλες οι υπόλοιπες
      return [
        'firstSession',
        'parentCounseling',
        'childExamPsychologist',
        'childTherapyPsychologist'
      ];
    } else if (selectedSpecialty === 'clinicalPsychologist') {
      // Για Κλινική Παιδοψυχολόγο & Ψυχοθεραπεύτρια: όλες οι υπόλοιπες
      return [
        'firstSession',
        'parentCounseling',
        'childExamPsychologist',
        'childTherapyPsychologist'
      ];
    }
    
    return [];
  };

  // Φιλτραρισμένοι γιατροί βάσει επιλεγμένης ειδικότητας
  const filteredDoctors = doctors.filter(doctor => {
    if (!selectedSpecialty) return true;
    const specialtyMap: { [key: string]: string } = {
      'psychiatrist': 'Ψυχίατρος Παιδιού και Εφήβου & Ψυχοθεραπεύτρια',
      'psychologist': 'Παιδοψυχολόγος & Ψυχοθεραπεύτρια',
      'clinicalPsychologist': 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια'
    };
    return doctor.specialty === specialtyMap[selectedSpecialty];
  });
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [calendarMonth] = useState(() => {
    const d = getCurrentDateInTimezone(getUserTimezone());
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  // const [availableDays] = useState<Record<string, boolean>>({}); // Not used for now
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [waitlistFormData, setWaitlistFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    doctorId: ''
  });
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Function to translate doctor names for display only (UI)
  const getDoctorDisplayName = (doctor: Doctor) => {
    if (language === 'en') {
      // Map Greek names to English display names
      const nameMap: { [key: string]: string } = {
        'Δρ. Άννα Μαρία Φύτρου': 'Dr. Anna-Maria Fytrou',
        'Dr. Άννα Μαρία Φύτρου': 'Dr. Anna-Maria Fytrou', // Alternative format
        'Σοφία Σπυριάδου': 'Sofia Spyriadou',
        'Ιωάννα Πισσάρη': 'Ioanna Pissari',
        'Ειρήνη Στεργίου': 'Eirini Stergiou'
      };
      
      const specialtyMap: { [key: string]: string } = {
        'Ψυχίατρος Παιδιού και Εφήβου & Ψυχοθεραπεύτρια': 'Child and Adolescent Psychiatrist & Psychotherapist',
        'Παιδοψυχολόγος & Ψυχοθεραπεύτρια': 'Child Psychologist & Psychotherapist',
        'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια': 'Clinical Child Psychologist & Psychotherapist'
      };
      
      const displayName = nameMap[doctor.name] || doctor.name;
      const displaySpecialty = specialtyMap[doctor.specialty] || doctor.specialty;
      
      return `${displayName} — ${displaySpecialty}`;
    } else if (language === 'fr') {
      // Map Greek names to French display names
      const nameMap: { [key: string]: string } = {
        'Δρ. Άννα Μαρία Φύτρου': 'Dr. Anna-Maria Fytrou',
        'Dr. Άννα Μαρία Φύτρου': 'Dr. Anna-Maria Fytrou', // Alternative format
        'Σοφία Σπυριάδου': 'Sofia Spyriadou',
        'Ιωάννα Πισσάρη': 'Ioanna Pissari',
        'Ειρήνη Στεργίου': 'Eirini Stergiou'
      };
      
      const specialtyMap: { [key: string]: string } = {
        'Ψυχίατρος Παιδιού και Εφήβου & Ψυχοθεραπεύτρια': 'Psychiatre pour Enfants et Adolescents & Psychothérapeute',
        'Παιδοψυχολόγος & Ψυχοθεραπεύτρια': 'Psychologue pour Enfants & Psychothérapeute',
        'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια': 'Psychologue Clinique pour Enfants & Psychothérapeute'
      };
      
      const displayName = nameMap[doctor.name] || doctor.name;
      const displaySpecialty = specialtyMap[doctor.specialty] || doctor.specialty;
      
      return `${displayName} — ${displaySpecialty}`;
    }
    
    // For Greek, return original
    return `${doctor.name} — ${doctor.specialty}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Update character count for message field
      if (name === 'message') {
        setMessageLength(value.length);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if privacy is accepted
    if (!formData.privacyAccepted) {
      alert(language === 'gr' 
        ? 'Παρακαλώ αποδεχτείτε τους όρους ιδιωτικότητας για να συνεχίσετε.'
        : language === 'en' 
        ? 'Please accept the privacy terms to continue.'
        : 'Veuillez accepter les conditions de confidentialité pour continuer.'
      );
      return;
    }
    
    // Check if recording policy is accepted
    if (!formData.recordingPolicyAccepted) {
      alert(language === 'gr' 
        ? 'Παρακαλώ αποδεχτείτε την πολιτική ηχογράφησης για να συνεχίσετε.'
        : language === 'en' 
        ? 'Please accept the recording policy to continue.'
        : 'Veuillez accepter la politique d\'enregistrement pour continuer.'
      );
      return;
    }
    
    // Check if parental consent is accepted
    if (!formData.parentalConsentAccepted) {
      alert(language === 'gr' 
        ? 'Παρακαλώ αποδεχτείτε τη γονεϊκή συναίνεση για να συνεχίσετε.'
        : language === 'en' 
        ? 'Please accept the parental consent to continue.'
        : 'Veuillez accepter le consentement parental pour continuer.'
      );
      return;
    }
    
    // Check if message is within character limit
    if (formData.message.length > 200) {
      alert(language === 'gr' 
        ? 'Το μήνυμά σας υπερβαίνει το όριο των 200 χαρακτήρων.'
        : language === 'en' 
        ? 'Your message exceeds the 200 character limit.'
        : 'Votre message dépasse la limite de 200 caractères.'
      );
      return;
    }
    
    if (!selectedSpecialty || !selectedDoctorId || !formData.appointmentDate || !selectedTime) {
      alert(language==='gr' ? 'Επιλέξτε ειδικότητα, γιατρό, ημερομηνία και ώρα.' : 
            language==='en' ? 'Select specialty, doctor, date and time.' : 
            'Sélectionnez spécialité, médecin, date et heure.');
      return;
    }
    
    // Show Stripe Checkout instead of simulation
    setShowStripeCheckout(true);
    setStripeError(null);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waitlistFormData.name || !waitlistFormData.email || !waitlistFormData.doctorId) {
      alert(language === 'gr' ? 'Παρακαλώ συμπληρώστε το όνομά σας, το email σας και επιλέξτε γιατρό.' : 
        language === 'en' ? 'Please fill in your name, email and select a doctor.' :
        'Veuillez remplir votre nom, email et sélectionner un médecin.');
      return;
    }

    setIsSubmittingWaitlist(true);

    try {
      // Αποθήκευση στη βάση δεδομένων
      const { error } = await supabase
        .from('waiting_list')
        .insert({
          name: waitlistFormData.name,
          email: waitlistFormData.email,
          phone: waitlistFormData.phone || null,
          preferred_date: waitlistFormData.preferredDate || null,
          preferred_time: waitlistFormData.preferredTime || null,
          message: waitlistFormData.message || null,
          doctor_id: waitlistFormData.doctorId
        });

      if (error) throw error;

      // Επιτυχής εγγραφή
      alert(language === 'gr' 
        ? 'Εγγραφήτε επιτυχώς στη λίστα αναμονής! Θα σας ειδοποιήσουμε όταν υπάρχει διαθέσιμη ώρα.'
        : language === 'en'
        ? 'Successfully added to the waitlist! We will notify you when a time slot becomes available.'
        : 'Ajouté avec succès à la liste d\'attente! Nous vous informerons lorsqu\'un créneau se libère.'
      );
      
      // Επαναφορά φόρμας
      setWaitlistFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredDate: '',
        preferredTime: '',
        doctorId: ''
      });
      setShowWaitlistPopup(false);
      
    } catch (error) {
      console.error('Error saving to waitlist:', error);
      alert(language === 'gr' 
        ? 'Υπήρξε πρόβλημα με την εγγραφή στη λίστα αναμονής. Παρακαλώ δοκιμάστε ξανά ή επικοινωνήστε μαζί μας στο iatreiodrfytrou@gmail.com'
        : language === 'en'
        ? 'There was a problem adding you to the waitlist. Please try again or contact us at iatreiodrfytrou@gmail.com'
        : 'Il y a eu un problème pour vous ajouter à la liste d\'attente. Veuillez réessayer ou nous contacter à iatreiodrfytrou@gmail.com'
      );
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  const handleWaitlistInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWaitlistFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWaitlistSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWaitlistFormData(prev => ({ ...prev, [name]: value }));
  };
  const content = {
    gr: {
      title: 'Επικοινωνία',
      subtitle: 'Έτοιμοι να Ξεκινήσετε το Ταξίδι σας;',
      description: 'Το πρώτο βήμα προς την υποστήριξη ψυχικής υγείας μπορεί να είναι καθοριστικό. Είμαστε εδώ για να το κάνουμε όσο πιο άνετο και απλό γίνεται.',
      contactInfo: 'Στοιχεία Επικοινωνίας',
      email: 'Email',
      emailDesc: '',
      location: 'Τοποθεσία',
      locationDesc: 'Διαδικτυακές συμβουλές διαθέσιμες παγκοσμίως',
      hours: 'Ώρες Λειτουργίας',
      hoursDesc: '',
      expectTitle: 'Στόχοι',
      expectations: [
        'Ολοκληρωμένη αξιολόγηση και σχεδιασμός θεραπείας',
        'Ευέλικτες επιλογές προγραμματισμού συμπεριλαμβανομένων διαδικτυακών συνεδριών',
        'Πλήρης εμπιστευτικότητα και προστασία ιδιωτικότητας'
      ],
      formTitle: 'Στείλτε ένα Μήνυμα',
      parentName: 'Όνομα Γονέα/Κηδεμόνα *',
      childAge: 'Ηλικία Παιδιού',
      emailAddress: 'Διεύθυνση Email *',
      phoneNumber: 'Αριθμός Τηλεφώνου',
      urgency: 'Επίπεδο Επείγοντος',
      urgencyOptions: {
        routine: 'Συνήθης συμβουλή',
        urgent: 'Επείγον (εντός 1 εβδομάδας)',
        emergency: 'Επείγουσα ανάγκη (άμεση προσοχή)'
      },
      concerns: 'Σύντομη Περιγραφή Ανησυχιών',
      concernsPlaceholder: 'Παρακαλώ περιγράψτε συνοπτικά τις ανησυχίες σας ή τι θα θέλατε να συζητήσετε κατά τη διάρκεια της συμβουλής...',
      appointmentDate: 'Ημερομηνία Ραντεβού',
      isFirstSession: 'Είναι η πρώτη σας συνεδρία;',
      isFirstSessionOptions: {
        yes: 'Είναι η πρώτη μου συνεδρία.',
        no: 'Είμαι ήδη ασθενής του ιατρείου.'
      },
      specialty: 'Ειδικότητα',
      selectSpecialty: 'Επιλέξτε ειδικότητα',
      specialtyOptions: {
        psychiatrist: 'Ψυχίατρος Παιδιού και Εφήβου & Ψυχοθεραπεύτρια',
        psychologist: 'Παιδοψυχολόγος & Ψυχοθεραπεύτρια',
        clinicalPsychologist: 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια'
      },
      thematologies: 'Θεματολογίες',
      selectThematology: 'Επιλέξτε θεματολογία',
      thematologyOptions: {
        firstSession: 'Πρώτη συνεδρία (Συζήτηση παραπομπής & ιστορικού ασθενούς)',
        parentCounseling: 'Συμβουλευτική γονέων',
        childExamPsychologist: 'Εξέταση παιδιού από ψυχολόγο',
        childExamPsychiatrist: 'Εξέταση παιδιού από ψυχίατρο',
        childTherapyPsychiatrist: 'Ψυχοθεραπεία παιδιού με ψυχίατρο',
        childTherapyPsychologist: 'Ψυχοθεραπεία παιδιού με ψυχολόγο',
        supervision: 'Εποπτεία ειδικών',
        medicationAdjustment: 'Φαρμακευτική ρύθμιση',
        scientificSupervision: 'Επιστημονική επιμέλεια βιβλίου/site/παιχνιδιού'
      },
      doctor: 'Γιατρός',
      selectDoctor: 'Επιλέξτε γιατρό',
      slotLegend: 'Διαθεσιμότητα: Πράσινο διαθέσιμο, Κόκκινο μη διαθέσιμο',
      appointmentDatePlaceholder: 'Επιλέξτε την ημερομηνία που σας ενδιαφέρει',
      privacy: 'Κατανοώ ότι αυτή η φόρμα δεν είναι για επείγουσες καταστάσεις. Για άμεση βοήθεια, παρακαλώ επικοινωνήστε με τις υπηρεσίες έκτακτης ανάγκης ή πηγαίνετε στο πλησιέστερο τμήμα επειγόντων περιστατικών.',
      recordingPolicy: 'Πολιτική ηχογράφησης & καταγραφής: Για λόγους προστασίας της ιδιωτικής ζωής και δεοντολογίας, απαγορεύεται αυστηρά η ηχογράφηση ή/και μαγνητοσκόπηση των συνεδριών. Σε περίπτωση παραβίασης αυτής της πολιτικής θα επιβάλλονται κυρώσεις.',
      parentalConsent: 'Ως γονεϊκό ζευγάρι αποδεχόμαστε ο/η ιατρός και η ομάδα του/της να εξετάσουν και να πραγματοποιήσουν συνεδρίες με το παιδί μας.',
      sendMessage: 'Αποστολή Μηνύματος',
      privacyGuaranteed: 'Εγγυημένη Ιδιωτικότητα',
      privacyDesc: 'Όλες οι επικοινωνίες είναι εμπιστευτικές και προστατεύονται από το ιατρικό απόρρητο.',
      waitlistButton: 'Λίστα Αναμονής',
      waitlistTitle: 'Εγγραφή στη Λίστα Αναμονής',
      waitlistDateTimeLabel: 'Ημερομηνία και Ώρα που ήθελα να κλείσω ραντεβού',
      scheduleInfo: 'Οι πρωινές ώρες προορίζονται για γονείς (πρώτα ραντεβού, συμβουλευτική και εποπτείες) ενώ τα απογευματινά για την ψυχοθεραπεία των παιδιών. Παρακαλώ σεβαστείτε τις αρχές του ιατρείου.',
      waitlistDescription: 'Σε περίπτωση που δεν βρήκατε ώρα συνεδρίας με τη γιατρό ή τους κλινικούς παιδοψυχολόγους μας, παρακαλώ αφήστε μας σύντομο μήνυμα για να μπείτε στη λίστα αναμονής των περιστατικών τους.',
      waitlistName: 'Όνομα Γονέα/Κηδεμόνα',
      waitlistEmail: 'Email',
      waitlistPhone: 'Τηλέφωνο',
      waitlistMessage: 'Σύντομο Μήνυμα (προαιρετικό)',
      waitlistSubmit: 'Αποστολή Αιτήματος',
      waitlistCancel: 'Ακύρωση'
    },
    en: {
      title: 'Contact',
      subtitle: 'Ready to Start Your Journey?',
      description: 'Taking the first step towards mental health support can feel overwhelming. We\'re here to make it as comfortable and straightforward as possible.',
      contactInfo: 'Contact Information',
      email: 'Email',
      emailDesc: 'We typically respond within 24 hours',
      location: 'Location',
      locationDesc: 'Online consultations available worldwide',
      hours: 'Consultation Hours',
      hoursDesc: 'Emergency consultations available',
      expectTitle: 'What to Expect',
      expectations: [
        'Initial consultation within 1-2 weeks',
        'Comprehensive assessment and treatment planning',
        'Flexible scheduling options including online sessions',
        'Complete confidentiality and privacy protection'
      ],
      formTitle: 'Send a Message',
      parentName: 'Parent/Guardian Name *',
      childAge: 'Child\'s Age',
      emailAddress: 'Email Address *',
      phoneNumber: 'Phone Number',
      urgency: 'Urgency Level',
      urgencyOptions: {
        routine: 'Routine consultation',
        urgent: 'Urgent (within 1 week)',
        emergency: 'Emergency (immediate attention)'
      },
      concerns: 'Brief Description of Concerns',
      concernsPlaceholder: 'Please briefly describe your concerns or what you\'d like to discuss during the consultation...',
      appointmentDate: 'Appointment Date',
      isFirstSession: 'Is this your first session?',
      isFirstSessionOptions: {
        yes: 'This is my first session.',
        no: 'I am already a patient of the clinic.'
      },
      specialty: 'Specialty',
      selectSpecialty: 'Select specialty',
      specialtyOptions: {
        psychiatrist: 'Child and Adolescent Psychiatrist & Psychotherapist',
        psychologist: 'Child Psychologist & Psychotherapist',
        clinicalPsychologist: 'Clinical Child Psychologist & Psychotherapist'
      },
      thematologies: 'Thematologies',
      selectThematology: 'Select thematology',
      thematologyOptions: {
        firstSession: 'First session',
        parentCounseling: 'Parent counseling',
        childExamPsychologist: 'Child examination by psychologist',
        childExamPsychiatrist: 'Child examination by psychiatrist',
        childTherapyPsychiatrist: 'Child therapy with psychiatrist',
        childTherapyPsychologist: 'Child therapy with psychologist',
        supervision: 'Specialist supervision',
        medicationAdjustment: 'Medication adjustment',
        scientificSupervision: 'Scientific supervision of book/site/game'
      },
      doctor: 'Doctor',
      selectDoctor: 'Select doctor',
      slotLegend: 'Availability: Green available, Red unavailable',
      appointmentDatePlaceholder: 'Select your preferred date',
      privacy: 'I understand that this form is not for emergency situations. For immediate help, please contact emergency services or go to your nearest emergency room.',
      recordingPolicy: 'Recording & Archiving Policy: For reasons of privacy and ethics, recording and/or videotaping of sessions is strictly prohibited. In case of violation of this policy, penalties will be imposed.',
      parentalConsent: 'As a parental couple, we accept that the doctor and their team examine and conduct sessions with our child.',
      sendMessage: 'Send Message',
      privacyGuaranteed: 'Privacy Guaranteed',
      privacyDesc: 'All communications are confidential and protected by patient-doctor privilege.',
      waitlistButton: 'Waitlist',
      waitlistTitle: 'Join Waitlist',
      waitlistDateTimeLabel: 'Date and Time I would like to book an appointment',
      scheduleInfo: 'Morning hours are reserved for parents (first appointments, counseling and supervision) while afternoon hours are for children\'s psychotherapy. Please respect the clinic\'s principles.',
      waitlistDescription: 'In case you did not find an appointment time with the doctor or our clinical child psychologists, please leave us a short message to be added to their patient waiting list.',
      waitlistName: 'Parent/Guardian Name',
      waitlistEmail: 'Email',
      waitlistPhone: 'Phone',
      waitlistMessage: 'Brief Message (optional)',
      waitlistSubmit: 'Submit Request',
      waitlistCancel: 'Cancel'
    },
    fr: {
      title: 'Contact',
      subtitle: 'Prêt à Commencer Votre Voyage?',
      description: 'Faire le premier pas vers le soutien en santé mentale peut sembler accablant. Nous sommes là pour le rendre aussi confortable et simple que possible.',
      contactInfo: 'Informations de Contact',
      email: 'Email',
      emailDesc: 'Nous répondons généralement dans les 24 heures',
      location: 'Localisation',
      locationDesc: 'Consultations en ligne disponibles dans le monde entier',
      hours: 'Heures de Consultation',
      hoursDesc: 'Consultations d\'urgence disponibles',
      expectTitle: 'À Quoi S\'attendre',
      expectations: [
        'Évaluation complète et planification thérapeutique',
        'Options de planification flexibles incluant les sessions en ligne',
        'Confidentialité complète et protection de la vie privée'
      ],
      formTitle: 'Envoyer un Message',
      parentName: 'Nom du Parent/Tuteur *',
      childAge: 'Âge de l\'Enfant',
      emailAddress: 'Adresse Email *',
      phoneNumber: 'Numéro de Téléphone',
      urgency: 'Niveau d\'Urgence',
      urgencyOptions: {
        routine: 'Conseil de routine',
        urgent: 'Urgent (dans la semaine)',
        emergency: 'Urgence (attention immédiate)'
      },
      concerns: 'Brève Description des Préoccupations',
      concernsPlaceholder: 'Veuillez décrire brièvement vos préoccupations ou ce que vous aimeriez discuter pendant la consultation...',
      appointmentDate: 'Date de Rendez-vous',
      isFirstSession: 'Est-ce votre première session?',
      isFirstSessionOptions: {
        yes: 'C\'est ma première session.',
        no: 'Je suis déjà patient de la clinique.'
      },
      specialty: 'Spécialité',
      selectSpecialty: 'Sélectionnez une spécialité',
      specialtyOptions: {
        psychiatrist: 'Psychiatre pour Enfants et Adolescents & Psychothérapeute',
        psychologist: 'Psychologue pour Enfants & Psychothérapeute',
        clinicalPsychologist: 'Psychologue Clinique pour Enfants & Psychothérapeute'
      },
      thematologies: 'Thématiques',
      selectThematology: 'Sélectionnez une thématique',
      thematologyOptions: {
        firstSession: 'Première session (Discussion de référence & historique du patient)',
        parentCounseling: 'Conseil parental',
        childExamPsychologist: 'Examen de l\'enfant par psychologue',
        childExamPsychiatrist: 'Examen de l\'enfant par psychiatre',
        childTherapyPsychiatrist: 'Psychothérapie de l\'enfant avec psychiatre',
        childTherapyPsychologist: 'Psychothérapie de l\'enfant avec psychologue',
        supervision: 'Supervision de spécialistes',
        medicationAdjustment: 'Ajustement médicamenteux',
        scientificSupervision: 'Édition scientifique de livre/site/jeu'
      },
      doctor: 'Médecin',
      selectDoctor: 'Sélectionnez un médecin',
      slotLegend: 'Disponibilité: Vert disponible, Rouge non disponible',
      appointmentDatePlaceholder: 'Sélectionnez la date qui vous intéresse',
      privacy: 'Je comprends que ce formulaire n\'est pas pour les situations d\'urgence. Pour une aide immédiate, veuillez contacter les services d\'urgence ou aller au service d\'urgence le plus proche.',
      recordingPolicy: 'Politique d\'enregistrement & d\'archivage: Pour des raisons de confidentialité et d\'éthique, l\'enregistrement et/ou la vidéosurveillance des sessions est strictement interdite. En cas de violation de cette politique, des sanctions seront imposées.',
      parentalConsent: 'En tant que couple parental, nous acceptons que le médecin et son équipe examinent et mènent des sessions avec notre enfant.',
      sendMessage: 'Envoyer le Message',
      privacyGuaranteed: 'Confidentialité Garantie',
      privacyDesc: 'Toutes les communications sont confidentielles et protégées par le secret médical.',
      waitlistButton: 'Liste d\'Attente',
      waitlistTitle: 'Rejoindre la Liste d\'Attente',
      waitlistDateTimeLabel: 'Date et Heure où j\'aimerais prendre rendez-vous',
      scheduleInfo: 'Les heures du matin sont réservées aux parents (premiers rendez-vous, conseil et supervision) tandis que les heures de l\'après-midi sont pour la psychothérapie des enfants. Veuillez respecter les principes de la clinique.',
      waitlistDescription: 'Au cas où vous n\'auriez pas trouvé d\'heure de rendez-vous avec le médecin ou nos psychologues cliniques pour enfants, veuillez nous laisser un bref message pour être ajouté à leur liste d\'attente des patients.',
      waitlistName: 'Nom du Parent/Tuteur',
      waitlistEmail: 'Email',
      waitlistPhone: 'Téléphone',
      waitlistMessage: 'Message Bref (optionnel)',
      waitlistSubmit: 'Soumettre la Demande',
      waitlistCancel: 'Annuler'
    }
  };

  // Φόρτωση γιατρών και ρύθμισης
  useEffect(() => {
    const load = async () => {
      console.log('[Contact] load(): fetching doctors & settings');
      const [{ data: doctorsData }, { data: settingsData }] = await Promise.all([
        supabase.from('doctors').select('*').eq('active', true).order('name'),
        supabase.from('admin_settings').select('*').eq('id',1).single()
      ]);
      console.log('[Contact] doctors:', doctorsData);
      console.log('[Contact] settings:', settingsData);
      setDoctors(doctorsData || []);
      if (doctorsData && doctorsData.length>0) setSelectedDoctorId(doctorsData[0].id);
      setSettings(settingsData as any);
    };
    load();
  }, []);

  // Επαναφορά επιλογής θεματολογίας όταν αλλάζει η ειδικότητα
  useEffect(() => {
    setSelectedThematology('');
  }, [selectedSpecialty]);

  // Επαναφορά επιλογής γιατρού όταν αλλάζει η ειδικότητα
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      // Ελέγχουμε αν ο τρέχων γιατρός είναι στα φιλτραρισμένα
      const currentDoctorExists = filteredDoctors.some(d => d.id === selectedDoctorId);
      if (!currentDoctorExists) {
        setSelectedDoctorId(filteredDoctors[0].id);
      }
    } else {
      setSelectedDoctorId('');
    }
  }, [selectedSpecialty, filteredDoctors, selectedDoctorId]);

  // Φόρτωση διαθέσιμων ημερών για τον τρέχοντα μήνα (για έγχρωμο ημερολόγιο)
  useEffect(() => {
    const fetchMonth = async () => {
      if (!selectedDoctorId) return;
      console.log('[Contact] fetchMonth for', calendarMonth, 'doctor:', selectedDoctorId);
      const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
      const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth()+1, 0);
      const s = toDateString(start, getUserTimezone());
      const e = toDateString(end, getUserTimezone());
      const { data } = await supabase
        .from('availability')
        .select('date')
        .eq('doctor_id', selectedDoctorId)
        .gte('date', s)
        .lte('date', e);
      console.log('[Contact] month availability rows:', data);
      const map: Record<string, boolean> = {};
      (data||[]).forEach((row: any) => { map[row.date] = true; });
      // setAvailableDays(map); // Commented out as availableDays is not used
    };
    fetchMonth();
  }, [calendarMonth, selectedDoctorId]);

  // Υπολογισμός slots για επιλεγμένη ημερομηνία/γιατρό
  useEffect(() => {
    const compute = async () => {
      if (!formData.appointmentDate || !selectedDoctorId) { setSlots([]); return; }
      console.log('[Contact] compute slots for', formData.appointmentDate, 'doctor:', selectedDoctorId);
      // Φέρνουμε μόνο availability ακριβώς για τη μέρα και τον γιατρό
      const { data: av } = await supabase
        .from('availability')
        .select('start_time,end_time,increment_minutes')
        .eq('doctor_id', selectedDoctorId)
        .eq('date', formData.appointmentDate)
        .order('start_time');

      console.log('[Contact] day availability rows:', av);
      const { data: booked } = await supabase
        .from('appointments')
        .select('time')
        .eq('doctor_id', selectedDoctorId)
        .eq('date', formData.appointmentDate);

      console.log('[Contact] booked rows:', booked);
      const toHHMM = (t: string) => (t || '').slice(0,5);
      const bookedSet = new Set<string>((booked||[]).map((b: { time: string })=> toHHMM(b.time)));

      const slotMap = new Map<string, SlotInfo>();
      (av||[]).forEach((a: any) => {
        // Αν μια availability δεν έχει valid εύρος, αγνόησέ την
        if (!a || !a.start_time || !a.end_time || !a.increment_minutes) return;
        const [sh, sm] = a.start_time.split(':').map(Number);
        const [eh, em] = a.end_time.split(':').map(Number);
        let cur = sh*60+sm;
        const end = eh*60+em;
        const step = a.increment_minutes as 30|60;
        if (step !== 30 && step !== 60) return;
        while (cur < end) {
          const hh = Math.floor(cur/60).toString().padStart(2,'0');
          const mm = (cur%60).toString().padStart(2,'0');
          const t = `${hh}:${mm}`;
          let available = !bookedSet.has(t);
          let reason: SlotInfo['reason'] | undefined = bookedSet.has(t)? 'booked': undefined;
          if (settings?.lock_half_hour) {
            const hourStart = `${hh}:00`;
            const half = `${hh}:30`;
            if (bookedSet.has(hourStart) || bookedSet.has(half)) { available = false; reason = 'locked'; }
          }
          const existing = slotMap.get(t);
          if (existing) {
            slotMap.set(t, { time: t, available: existing.available || available, reason: existing.reason || reason });
          } else {
            slotMap.set(t, { time: t, available, reason });
          }
          cur += step;
        }
      });
      const list = Array.from(slotMap.values()).sort((a,b)=> a.time.localeCompare(b.time));
      console.log('[Contact] computed slots:', list);
      setSlots(list);
      setSelectedTime('');
    };
    compute();
  }, [formData.appointmentDate, selectedDoctorId, settings]);

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 mt-2"
        >
          {/* Title Section */}
          <div className="mb-6">
            <h2 className="text-4xl font-bold mb-4 font-poppins">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
                {content[language].title}
              </span>
            </h2>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 text-center block text-xl font-poppins">
              {content[language].subtitle}
            </span>
            <p className="text-sm text-gray-500 mt-2 font-nunito">
              Το πρώτο βήμα προς την υποστήριξη…
            </p>
          </div>

          {/* Image and Description Section */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 overflow-hidden shadow-xl"
            >
              <img 
                src={profile2} 
                alt={language === 'gr' ? 'Φωτογραφία ιατρού' : 
                  language === 'en' ? 'Doctor profile' : 
                  'Photo du médecin'} 
                className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <p className="text-xl text-gray-600 leading-relaxed font-nunito text-left lg:text-left">
                {content[language].description}
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100">
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-rose-soft to-purple-soft p-3 rounded-2xl mr-4 shadow-lg"
                >
                  <Heart className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold font-poppins">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
                    {content[language].contactInfo}
                  </span>
                </h3>
              </div>
              
              <div className="space-y-6">
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="bg-gradient-to-r from-blue-soft to-green-soft p-3 rounded-2xl shadow-md">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 font-poppins">{content[language].email}</h4>
                    <a href="mailto:iatreiodrfytrou@gmail.com" className="text-blue-soft hover:text-purple-soft transition-colors font-nunito">
                      iatreiodrfytrou@gmail.com
                    </a>
                    <p className="text-sm text-gray-600 mt-1 font-quicksand">{content[language].emailDesc}</p>
                  </div>
                </motion.div>

                {/* Social Media Links */}
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="bg-gradient-to-r from-rose-soft to-purple-soft p-3 rounded-2xl shadow-md">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 font-poppins">Social Media</h4>
                    <div className="flex space-x-3">
                      <motion.a
                        href="https://www.instagram.com/drfytrouannamaria/"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
                      >
                        <Instagram className="h-4 w-4" />
                      </motion.a>
                      <motion.a
                        href="https://www.tiktok.com/@drfytrouannamaria"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-black text-white hover:shadow-lg transition-all duration-300"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </motion.a>
                      <motion.a
                        href="https://www.facebook.com/p/Dr-Fytrou-Anna-Maria-61568951687995/"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-blue-600 text-white hover:shadow-lg transition-all duration-300"
                      >
                        <Facebook className="h-4 w-4" />
                      </motion.a>
                      
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="bg-gradient-to-r from-yellow-soft to-warm-cream p-3 rounded-2xl shadow-md">
                    <MapPin className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 font-poppins">{content[language].location}</h4>
                    <p className="text-gray-700 font-nunito">
                      {language === 'gr' ? 'Λωζάνη, Ελβετία' : 
                        language === 'en' ? 'Lausanne, Switzerland' : 
                        'Lausanne, Suisse'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 font-quicksand">{content[language].locationDesc}</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 5 }}
                  className="flex items-start space-x-4"
                >
                  <div className="bg-gradient-to-r from-rose-soft to-purple-soft p-3 rounded-2xl shadow-md">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1 font-poppins">{content[language].hours}</h4>
                    <div className="space-y-1 text-gray-700 font-nunito">
                      <p>{language === 'gr' ? 'Ραντεβού κατόπιν διαθεσιμότητας' : 
                        language === 'en' ? 'Appointments upon availability' : 
                        'Rendez-vous selon disponibilité'}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4 font-poppins">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
                  {content[language].expectTitle}
                </span>
              </h3>
              <ul className="space-y-3">
                {content[language].expectations.map((expectation, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start text-gray-600 font-nunito"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 bg-gradient-to-r from-rose-soft to-purple-soft rounded-full mt-2 mr-3 flex-shrink-0"
                    />
                    {expectation}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-blue-soft to-green-soft p-3 rounded-2xl mr-4 shadow-lg"
              >
                <Send className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold font-poppins">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
                  {content[language].formTitle}
                </span>
              </h3>
            </div>
            
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                    {content[language].parentName}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                    placeholder={language === 'gr' ? 'Το πλήρες όνομά σας' : 
                      language === 'en' ? 'Your full name' : 
                      'Votre nom complet'}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                    {content[language].childAge}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="number"
                    id="childAge"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                    placeholder={language === 'gr' ? 'Ηλικία' : 
                      language === 'en' ? 'Age' : 
                      'Âge'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].emailAddress}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].phoneNumber}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                  placeholder="+41 XX XXX XX XX"
                />
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].urgency}
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                >
                  <option value="">{language === 'gr' ? 'Επιλέξτε επίπεδο επείγοντος' : 
                    language === 'en' ? 'Select urgency level' : 
                    'Sélectionnez le niveau d\'urgence'}</option>
                  <option value="routine">{content[language].urgencyOptions.routine}</option>
                  <option value="urgent">{content[language].urgencyOptions.urgent}</option>
                  <option value="emergency">{content[language].urgencyOptions.emergency}</option>
                </motion.select>
              </div>

              <div>
                <label htmlFor="isFirstSession" className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].isFirstSession}
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  id="isFirstSession"
                  name="isFirstSession"
                  value={formData.isFirstSession}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                >
                  <option value="">{language === 'gr' ? 'Επιλέξτε επιλογή' : 
                    language === 'en' ? 'Select option' : 
                    'Sélectionnez une option'}</option>
                  <option value="yes">{content[language].isFirstSessionOptions.yes}</option>
                  <option value="no">{content[language].isFirstSessionOptions.no}</option>
                </motion.select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].specialty}
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">{content[language].selectSpecialty}</option>
                  <option value="psychiatrist">{content[language].specialtyOptions.psychiatrist}</option>
                  <option value="psychologist">{content[language].specialtyOptions.psychologist}</option>
                  <option value="clinicalPsychologist">{content[language].specialtyOptions.clinicalPsychologist}</option>
                </motion.select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].thematologies}
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                  value={selectedThematology}
                  onChange={e => setSelectedThematology(e.target.value)}
                  disabled={!selectedSpecialty}
                >
                  <option value="">
                    {selectedSpecialty 
                      ? content[language].selectThematology 
                      : (language === 'gr' ? 'Πρώτα επιλέξτε ειδικότητα' : 
                        language === 'en' ? 'First select specialty' : 
                        'Sélectionnez d\'abord une spécialité')
                    }
                  </option>
                  {getAvailableThematologies().map(thematologyKey => (
                    <option key={thematologyKey} value={thematologyKey}>
                      {content[language].thematologyOptions[thematologyKey as keyof typeof content[typeof language]['thematologyOptions']]}
                    </option>
                  ))}
                </motion.select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].doctor}
                </label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito" 
                  value={selectedDoctorId} 
                  onChange={e=> setSelectedDoctorId(e.target.value)}
                  disabled={!selectedSpecialty}
                >
                  <option value="">
                    {selectedSpecialty 
                      ? content[language].selectDoctor 
                      : (language === 'gr' ? 'Πρώτα επιλέξτε ειδικότητα' : 
                        language === 'en' ? 'First select specialty' : 
                        'Sélectionnez d\'abord une spécialité')
                    }
                  </option>
                  {filteredDoctors.map(d=> (
                    <option key={d.id} value={d.id}>{getDoctorDisplayName(d)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2 font-quicksand">
                  {content[language].appointmentDate}
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 font-nunito"
                  placeholder={content[language].appointmentDatePlaceholder}
                  min={toDateString(getCurrentDateInTimezone(getUserTimezone()), getUserTimezone())}
                  style={{ direction: 'ltr' }}
                />
                {/* Display appointment guidelines */}
                {formData.appointmentDate && (
                  <div className="mt-2 text-xs text-gray-600 font-nunito bg-blue-50 rounded-lg p-2 border-l-4 border-blue-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-500 text-sm">ℹ️</span>
                      <span>
                        {content[language].scheduleInfo}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slots visualization */}
              {formData.appointmentDate && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 mb-2 font-quicksand">{content[language].slotLegend}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {slots.length===0 ? (
                      <div className="text-gray-500 col-span-full">{language==='gr'? 'Δεν υπάρχουν διαθέσιμα για την ημέρα.': 'No availability for the day.'}</div>
                    ) : (
                      slots.map(s=> (
                        <button type="button" disabled={!s.available} onClick={()=> s.available && setSelectedTime(s.time)} key={s.time} className={`px-3 py-2 rounded-xl text-center text-sm font-semibold border transition ${s.available? 'bg-green-100 text-green-800 hover:ring-2 hover:ring-green-400':'bg-red-100 text-red-700 cursor-not-allowed'} ${selectedTime===s.time? 'ring-2 ring-purple-soft':''}`}>
                          {s.time}
                        </button>
                      ))
                    )}
                  </div>
                  
                  {/* Waitlist Description και Button - εμφανίζονται μόνο όταν έχει επιλεγεί ημερομηνία */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-2xl">
                    <p className="text-sm text-gray-700 mb-3 font-nunito leading-relaxed">
                      {content[language].waitlistDescription}
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => setShowWaitlistPopup(true)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-poppins flex items-center justify-center space-x-2"
                    >
                      <Clock3 className="h-5 w-5" />
                      <span>{content[language].waitlistButton}</span>
                    </motion.button>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 font-quicksand">
                    {content[language].concerns}
                  </label>
                  <span className={`text-sm font-medium ${messageLength > 200 ? 'text-red-500' : 'text-gray-500'} font-quicksand`}>
                    {messageLength}/200
                  </span>
                </div>
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  id="message"
                  name="message"
                  rows={4}
                  maxLength={200}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    setMessageLength(e.target.value.length);
                  }}
                  className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-rose-soft focus:border-transparent transition-all duration-300 resize-none font-nunito ${
                    messageLength > 200 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={content[language].concernsPlaceholder}
                ></motion.textarea>
                <div className="flex justify-between items-center mt-2">
                  <div className={`text-xs font-quicksand ${messageLength > 160 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {messageLength}/200 {language === 'gr' ? 'χαρακτήρες' : 
                      language === 'en' ? 'characters' : 
                      'caractères'}
                  </div>
                  {messageLength > 180 && (
                    <div className="text-xs text-red-500 font-quicksand">
                      {language === 'gr' ? 'Σχεδόν στο όριο!' : 
                        language === 'en' ? 'Almost at limit!' : 
                        'Presque à la limite!'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-rose-soft focus:ring-rose-soft border-gray-300 rounded"
                  required
                />
                <label htmlFor="privacy" className="text-sm text-red-600 font-nunito">
                  <strong>{content[language].privacy}</strong>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="recordingPolicy"
                  name="recordingPolicyAccepted"
                  checked={formData.recordingPolicyAccepted}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-rose-soft focus:ring-rose-soft border-gray-300 rounded"
                  required
                />
                <label htmlFor="recordingPolicy" className="text-sm text-red-600 font-nunito">
                  <strong>{content[language].recordingPolicy}</strong>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="parentalConsent"
                  name="parentalConsentAccepted"
                  checked={formData.parentalConsentAccepted}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-rose-soft focus:ring-rose-soft border-gray-300 rounded"
                  required
                />
                <label htmlFor="parentalConsent" className="text-sm text-red-600 font-nunito">
                  <strong>{content[language].parentalConsent}</strong>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!selectedSpecialty || !formData.privacyAccepted || !formData.recordingPolicyAccepted || !formData.parentalConsentAccepted || messageLength > 200}
                className={`w-full font-semibold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 font-poppins ${
                  !selectedSpecialty || !formData.privacyAccepted || !formData.recordingPolicyAccepted || !formData.parentalConsentAccepted || messageLength > 200
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-soft to-purple-soft text-white hover:shadow-2xl'
                }`}
              >
                <Calendar className="inline-block h-5 w-5 mr-2" />
                {content[language].sendMessage}
              </motion.button>
            </form>

            {/* Stripe Checkout Modal */}
            <AnimatePresence>
              {showStripeCheckout && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowStripeCheckout(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 font-poppins">
                          💳 Πληρωμή Ραντεβού
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowStripeCheckout(false)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-6 w-6 text-gray-500" />
                        </motion.button>
                      </div>

                      {/* Stripe Checkout Component */}
                      <StripeCheckout
                        doctorId={selectedDoctorId}
                        doctorName={doctors.find(d => d.id === selectedDoctorId)?.name || ''}
                        parentName={formData.parentName}
                        parentEmail={formData.email}
                        appointmentDate={formData.appointmentDate}
                        appointmentTime={selectedTime}
                        concerns={formData.message}
                        onSuccess={() => {
                          setShowStripeCheckout(false);
                          // Reset form
                          setFormData({
                            parentName: '',
                            childAge: '',
                            email: '',
                            phone: '',
                            urgency: '',
                            message: '',
                            appointmentDate: '',
                            privacyAccepted: false,
                            recordingPolicyAccepted: false,
                            parentalConsentAccepted: false,
                            isFirstSession: ''
                          });
                          setSelectedSpecialty('');
                          setSelectedThematology('');
                          setSelectedDoctorId('');
                          setSelectedTime('');
                          setMessageLength(0);
                        }}
                        onError={(error) => {
                          setStripeError(error);
                        }}
                        language={language}
                      />

                      {/* Error Display */}
                      {stripeError && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <p className="text-red-700 font-medium">
                            Σφάλμα: {stripeError}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="mt-6 p-4 bg-gradient-to-r from-warm-cream to-yellow-soft border border-yellow-300 rounded-2xl"
            >
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800 font-medium font-poppins">{content[language].privacyGuaranteed}</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1 font-nunito">
                {content[language].privacyDesc}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Beautiful Waitlist Popup */}
        <AnimatePresence>
          {showWaitlistPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowWaitlistPopup(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Beautiful Header */}
                <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-8 text-white relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg"
                        >
                          <Clock3 className="h-8 w-8 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-2xl font-bold font-poppins">
                            {content[language].waitlistTitle}
                          </h3>
                          <p className="text-orange-100 text-sm font-nunito">
                            Εγγραφή στη λίστα αναμονής
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowWaitlistPopup(false)}
                        className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300"
                      >
                        <X className="h-5 w-5 text-white" />
                      </motion.button>
                    </div>
                    
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8 pb-12">
                  <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                    {/* Name Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="waitlistName" className="block text-sm font-semibold text-gray-700 mb-3 font-quicksand">
                        {content[language].waitlistName} *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="text"
                        id="waitlistName"
                        name="name"
                        value={waitlistFormData.name}
                        onChange={handleWaitlistInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 font-nunito text-gray-800 placeholder-gray-400"
                        placeholder={language === 'gr' ? 'Το πλήρες όνομά σας' : 
                      language === 'en' ? 'Your full name' : 
                      'Votre nom complet'}
                        required
                      />
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="waitlistEmail" className="block text-sm font-semibold text-gray-700 mb-3 font-quicksand">
                        {content[language].waitlistEmail} *
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="email"
                        id="waitlistEmail"
                        name="email"
                        value={waitlistFormData.email}
                        onChange={handleWaitlistInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 font-nunito text-gray-800 placeholder-gray-400"
                        placeholder="your.email@example.com"
                        required
                      />
                    </motion.div>

                    {/* Phone Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label htmlFor="waitlistPhone" className="block text-sm font-semibold text-gray-700 mb-3 font-quicksand">
                        {content[language].waitlistPhone}
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="tel"
                        id="waitlistPhone"
                        name="phone"
                        value={waitlistFormData.phone}
                        onChange={handleWaitlistInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 font-nunito text-gray-800 placeholder-gray-400"
                        placeholder="+41 XX XXX XX XX"
                      />
                    </motion.div>

                    {/* Doctor Selection Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <label htmlFor="waitlistDoctor" className="block text-sm font-semibold text-gray-700 mb-3 font-quicksand">
                        Γιατρός *
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.02 }}
                        id="waitlistDoctor"
                        name="doctorId"
                        value={waitlistFormData.doctorId}
                        onChange={handleWaitlistSelectChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 font-nunito text-gray-800"
                        required
                      >
                        <option value="">Επιλέξτε γιατρό</option>
                        {doctors.map(doctor => (
                          <option key={doctor.id} value={doctor.id}>
                            {getDoctorDisplayName(doctor)}
                          </option>
                        ))}
                      </motion.select>
                    </motion.div>

                    {/* Date & Time Fields */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.75 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-3 font-quicksand">
                        {content[language].waitlistDateTimeLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="date"
                          id="waitlistPreferredDate"
                          name="preferredDate"
                          value={waitlistFormData.preferredDate}
                          onChange={handleWaitlistInputChange}
                          className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 font-nunito text-gray-800"
                          min={toDateString(getCurrentDateInTimezone(getUserTimezone()), getUserTimezone())}
                          style={{ direction: 'ltr' }}
                        />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="time"
                          id="waitlistPreferredTime"
                          name="preferredTime"
                          value={waitlistFormData.preferredTime}
                          onChange={handleWaitlistInputChange}
                          className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 font-nunito text-gray-800"
                          style={{ direction: 'ltr' }}
                        />
                      </div>
                    </motion.div>

                    {/* Message Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.85 }}
                    >
                      <label htmlFor="waitlistMessage" className="block text-sm font-semibold text-gray-700 mb-3 font-quicksand">
                        {content[language].waitlistMessage}
                      </label>
                      <motion.textarea
                        whileFocus={{ scale: 1.02 }}
                        id="waitlistMessage"
                        name="message"
                        rows={4}
                        value={waitlistFormData.message}
                        onChange={handleWaitlistInputChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-300 resize-none font-nunito text-gray-800 placeholder-gray-400"
                        placeholder={language === 'gr' ? 'Επιπλέον πληροφορίες ή προτιμήσεις...' : 
                          language === 'en' ? 'Additional information or preferences...' : 
                          'Informations supplémentaires ou préférences...'}
                      />
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex space-x-4 pt-8 mt-6"
                    >
                      <motion.button
                        type="button"
                        onClick={() => setShowWaitlistPopup(false)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-poppins"
                      >
                        {content[language].waitlistCancel}
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={isSubmittingWaitlist || !waitlistFormData.name || !waitlistFormData.email || !waitlistFormData.doctorId}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-4 px-6 font-semibold rounded-2xl transition-all duration-300 font-poppins flex items-center justify-center space-x-2 ${
                          isSubmittingWaitlist || !waitlistFormData.name || !waitlistFormData.email || !waitlistFormData.doctorId
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:shadow-xl hover:shadow-orange-200'
                        }`}
                      >
                        {isSubmittingWaitlist ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                        <span>
                          {isSubmittingWaitlist 
                            ? (language === 'gr' ? 'Αποστολή...' : 
                              language === 'en' ? 'Sending...' : 
                              'Envoi...')
                            : content[language].waitlistSubmit
                          }
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Contact;