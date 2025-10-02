import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, Smile, BookOpen, Pill, Home, X, Users } from 'lucide-react';
import happyImg from '../assets/happy.jpg';

interface ServicesProps {
  language: 'gr' | 'en';
}

const Services: React.FC<ServicesProps> = ({ language }) => {
  const [selectedCondition, setSelectedCondition] = useState<{name: string, definition?: string, symptoms: readonly string[]} | null>(null);

  const content = {
    gr: {
      title: 'Υπηρεσίες',
      subtitle: 'Ολοκληρωμένη Φροντίδα για την Οικογένεια',
      description: 'Στο Διαδικτυακό Ιατρείο μας προσφέρεται ένα πλήρες φάσμα διαγνωστικών και θεραπευτικών υπηρεσιών σχεδιασμένων να υποστηρίξουν εφήβους και τις οικογένειές τους σε κάθε στάδιο της ψυχικοκοινωνικής τους ανάπτυξης.',
      services: [
        {
          title: 'Ψυχιατρική Αξιολόγηση',
          description: 'Ολοκληρωμένη εκτίμηση και διάγνωση καταστάσεων ψυχικής υγείας σε παιδιά και εφήβους.',
          features: ['Λεπτομερείς κλινικές συνεντεύξεις και εξετάσεις', 'Ψυχολογικές δοκιμασίες', 'Διαγνωστική διατύπωση', 'Σχεδιασμός θεραπείας']
        },
        {
          title: 'Ατομική Ψυχοθεραπεία',
          description: 'Εξατομικευμένη Ψυχοθεραπευτική Προσέγγιση βασισμένη σε κλινικές έρευνες και τις ανάγκες κάθε εφήβου και της οικογένειας του.',
          features: ['Ψυχοδυναμική Ψυχοθεραπεία Εφήβου', 'Ψυχοδυναμική Ψυχοθεραπεία Οικογένειας', 'Τεχνικές Γνωσιακής Συμπεριφορικής θεραπείας', 'Τεχνικές Βελτίωσης Κοινωνικών Δεξιοτήτων', 'Θεραπεία Ενσυναίσθησης (Mentalisation Therapy)', 'Διαχείριση Διαζυγίου']
        },
        {
          title: 'Οικογενειακή Θεραπεία',
          description: 'Εργασία με ολόκληρο το οικογενειακό σύστημα για βελτίωση της επικοινωνίας και ενίσχυση των σχέσεων.',
          features: ['Ψυχοδυναμική Ψυχοθεραπεία Οικογένειας', 'Διαχείριση Διαζυγίου', 'Συμβουλευτική Οικογένειας', 'Παρέμβαση στο Σχολικό Πλαίσιο']
        },
        {
          title: 'Φαρμακευτική Στήριξη',
          description: 'Συμβουλευτική και υποστήριξη για τη φαρμακευτική αγωγή εφήβων με ψυχικές διαταραχές.',
          features: ['Σχεδιασμός Φαρμακευτικής αγωγής', 'Συζήτηση Θεραπευτικών Πρωτοκόλλων με συναδέλφους', 'Αναλυτική Εκπαίδευση Γονέων και Εφήβων στη Φαρμακευτική Αγωγή']
        },
        {
          title: 'Εποπτείες',
          description: 'Επαγγελματική εποπτεία και υποστήριξη για ψυχιάτρους και ψυχολόγους στην παιδική και εφηβική ψυχιατρική.',
          features: ['Ατομική Εποπτεία Ειδικευόμενων Ψυχιάτρων', 'Ατομική Εποπτεία Κλινικών Ψυχολόγων', 'Ομαδική Εποπτεία Ειδικευόμενων Ψυχιάτρων', 'Ομαδική Εποπτεία Ψυχολόγων']
        },
        {
          title: 'Επιστημονική Επιμέλεια Βιβλίων και Παραμυθιών',
          description: 'Συμβουλευτική και επιστημονική επιμέλεια σε παιδικά βιβλία και παραμύθια με θέματα ψυχικής υγείας.',
          features: ['Ακρίβεια περιεχομένου', 'Κατάλληλη γλώσσα για ηλικίες', 'Εκπαιδευτική αξία', 'Επαγγελματική αξιολόγηση']
        }
      ],
      conditionsTitle: 'Διαγνώσεις που Χρήζουν Θεραπείας',
      conditionsDescription: 'Παρακάτω θα βρείτε κάποια από τα συνήθη συμπτώματα των διαταραχών αλλά δεν αναφέρονται αναλυτικά τα κριτήρια τους για λόγους προστασίας των ασθενών.',
      conditions: [
        {
          name: 'ΔΤΧ Άγχους',
          definition: 'Οι διαταραχές άγχους χαρακτηρίζονται από επίμονο άγχος και ανησυχία.',
          symptoms: [
            'Αποφυγή δραστηριοτήτων ή/και σχολείου ή/και προσώπων',
            'Θλίψη ή/και ευερεθιστότητα',
            'Αποφυγή να μείνει μόνος/η',
            'Δυσκολία στον ύπνο',
            'Παρουσία τικ'
          ]
        },
        {
          name: 'Κατάθλιψη',
          definition: 'Η κατάθλιψη εκδηλώνεται διαφορετικά από την κατάθλιψη των ενηλίκων.',
          symptoms: [
            'Εκρήξεις θυμού',
            'Έντονες ενοχές',
            'Δυσκολία στον ύπνο',
            'Αποφυγή δραστηριοτήτων',
            'Απομόνωση',
            'Αυτοτραυματισμός',
            'Σκοτεινές σκέψεις',
            'Απελπισία για το παρόν/το μέλλον'
          ]
        },
        {
          name: 'ΔΕΠΥ',
          definition: 'Η ΔΕΠΥ παρουσιάζει ως πυρηνικά συμπτώματα τη διάσπαση προσοχής, την υπερκινητικότητα και την παρορμητικότητα.',
          symptoms: [
            'Επιπλέον συμπτώματα:',
            'Δυσκολία συγκέντρωσης',
            'Αφηρημάδα',
            'Δυσκολία στον ύπνο',
            'Δυσκολία να περιμένει τη σειρά του',
            'Αγένεια',
            'Επικίνδυνο παιχνίδι'
          ]
        },
        {
          name: 'ΔΑΦ',
          definition: 'Διαταραχές Φάσματος Αυτισμού',
          symptoms: [
            'Επαναλαμβανόμενα μοτίβα συμπεριφοράς',
            'Επαναλαμβανόμενες κινήσεις',
            'Δυσκολία στην εξωλεκτική επικοινωνία',
            'Δυσκολία στην ανάπτυξη και κατανόηση των σχέσεων',
            'Εξαιρετικά περιορισμένα ενδιαφέροντα',
            'Υπέρ/Υπόαντιδραστικότητα στις αισθητηριακές πληροφορίες'
          ]
        },
        {
          name: 'Διαταραχές Διαγωγής',
          definition: 'Αντικατάσταση των Αντισυμπεριφορικών προβλημάτων',
          symptoms: [
            'Θυμωμένη/Ευερέθιστη διάθεση',
            'Προκλητική συμπεριφορά',
            'Εκρηκτική συμπεριφορά',
            'Εκδικητικότητα',
            'Παραβίαση κανόνων',
            'Αδιαφορία στα συναισθήματα του άλλου',
            'Καταστροφή ιδιοκτησίας',
            'Απάτη/Κλοπή'
          ]
        },
        {
          name: 'ΔΤΧ Διατροφής',
          definition: 'Διαταραχές Διατροφής',
          symptoms: [
            'Περιορισμένη ή Αυξημένη λήψη τροφής',
            'Αίσθηση απώλειας ελέγχου',
            'Συχνή και έντονη γυμναστική',
            'Εμέτοι',
            'Ενοχές',
            'Ανησυχία για το σωματικό βάρος/εικόνα σώματος',
            'Επιπλοκές (π.χ. διακοπή περιόδου, απώλεια μαλλιών, δέρμα που ξεφλουδίζει)'
          ]
        },
        {
          name: 'Διαταραχή Μετατραυματικού Στρες',
          definition: 'Η Διαταραχή Μετατραυματικού Στρες μπορεί να αναπτυχθεί μετά από τραυματική/ες εμπειρία/ες.',
          symptoms: [
            'Επαναλαμβανόμενες, ενοχλητικές μνήμες',
            'Επαναλαμβανόμενα, ενοχλητικά όνειρα',
            'Επαναβιώσεις/Flashbacks',
            'Αποφυγή σχετικών υπαινισγμών, καταστάσεων, προσώπων',
            'Υπεραγρύπνηση',
            'Δυσκολία στον ύπνο',
            'Θλίψη',
            'Αδυναμία να θυμηθεί σημαντικές πληροφορίες του τραύματος',
            'Αυτοτραυματισμοί',
            'Ευερεθιστότητα'
          ]
        },
        {
          name: 'ΔΤΧ Διάθεσης',
          definition: 'Οι διαταραχές διάθεσης περιλαμβάνουν την κατάθλιψη, την διπολική διαταραχή και άλλες παρόμοιες διαταραχές.',
          symptoms: [
            'Έντονες διακυμάνσεις στη διάθεση (αβάσταχτη θλίψη ή υπερβολική χαρά)',
            'Έντονες διακυμάνσεις στην ενέργεια (πολλή ή ελάχιστη ενέργεια)',
            'Διογκωμένη αυτοεκτίμηση',
            'Καλμπάζουσες σκέψεις',
            'Μειωμένη σχολική απόδοση',
            'Δυσκολία στη συγκέντρωση',
            'Αποφυγή ή έντονη ενασχόληση με δραστηριότητες',
            'Επικίνδυνη συμπεριφορά',
            'Αγένεια',
            'Δυσκολίες στον ύπνο'
          ]
        },
        {
          name: 'Τικς',
          definition: 'Τα τικς (μυοσπάσματα) είναι αιφνίδιες, ταχείες, επαναλαμβανόμενες, μη ρυθμικές κινητικές κινήσεις ή φωνητικές εκφράσεις.',
          symptoms: [
            'Κινητικά τικ: Βλεφαρίσματα, κούνημα κεφαλιού, ανασήκωμα ώμων',
            'Φωνητικά τικ: Βήχας, καθαρισμός λαιμού, γρυλίσματα, επανάληψη λέξεων'
          ]
        },
        {
          name: 'Ψυχώσεις',
          definition: 'Οι ψυχώσεις είναι σοβαρές ψυχικές διαταραχές που χαρακτηρίζονται από απώλεια επαφής με την πραγματικότητα.',
          symptoms: [
            'Παραληρητικές ιδέες (π.χ. καταδίωξης, μεγαλείου, ελέγχου)',
            'Ψευδαισθήσεις (ακουστικές, οπτικές, απτικές)',
            'Αποδιοργανωμένη σκέψη',
            'Αποδιοργανωμένος λόγος',
            'Αποδιοργανωμένη ή κατατονική συμπεριφορά',
            'Έλλειψη επίγνωσης της διαταραχής'
          ]
        },
        {
          name: 'Ιδεοψυχαναγκαστική Διαταραχή (OCD)',
          definition: 'Ψυχική διαταραχή με επαναλαμβανόμενες, ανεπιθύμητες σκέψεις (ιδεοληψίες) και καταναγκαστικές συμπεριφορές.',
          symptoms: [
            'Επαναλαμβανόμενες σκέψεις που προκαλούν άγχος (π.χ. μικρόβια, συμμετρία)',
            'Τελετουργικές πράξεις για μείωση άγχους (π.χ. πλύσιμο/γλύψιμο/τρίψιμο χεριών, τακτοποίηση χώρου, σκέπασμα, παιχνίδι με πόρτες/παράθυρα)',
            'Ο πάσχων αναγνωρίζει τον παράλογο χαρακτήρα των σκέψεων του'
          ]
        },
        {
          name: 'Διαταραχές Ύπνου - Αφύπνισης',
          definition: 'Ομάδα διαταραχών που επηρεάζουν την ποιότητα, ποσότητα ή χρονοκαθυστέρηση του ύπνου.',
          symptoms: [
            'Αϋπνία: Δυσκολία έναρξης/διατήρησης ύπνου',
            'Υπερυπνία: Υπερβολική υπνηλία κατά τη μέρα',
            'Διαταραχές κιρκάδιου ρυθμού: Ύπνος σε λάθος ώρες',
            'Παραϋπνίες: Εφιάλτες, υπνοβασία, τρόμος ύπνου',
            'Σύνδρομο Απνοιών Ύπνου: Διακοπές της αναπνοής κατά τη διάρκεια του ύπνου'
          ]
        }
      ],
      notListed: 'Δεν βλέπετε την συγκεκριμένη ανησυχία σας στη λίστα; Παρακαλώ επικοινωνήστε - είμαστε εδώ να βοηθήσουμε με οποιεσδήποτε προκλήσεις ψυχικής υγείας αντιμετωπίζει το παιδί σας.'
    },
    en: {
      title: 'Our Services',
      subtitle: 'Comprehensive Care for Every Need',
      description: 'We offer a full range of psychiatric and psychotherapeutic services designed to support children, adolescents, and their families through every stage of mental health treatment.',
      services: [
        {
          title: 'Psychiatric Assessment',
          description: 'Comprehensive evaluation and diagnosis of mental health conditions in children and adolescents.',
          features: ['Detailed clinical interviews', 'Psychological testing', 'Diagnostic formulation', 'Treatment planning']
        },
        {
          title: 'Individual Psychotherapy',
          description: 'Evidence-based therapeutic approaches tailored to each child\'s unique needs and developmental stage.',
          features: ['Cognitive Behavioral Therapy', 'Play therapy', 'Psychodynamic therapy', 'Trauma-informed care']
        },
        {
          title: 'Family Therapy',
          description: 'Working with the entire family system to improve communication and strengthen relationships.',
          features: ['Family system assessment', 'Communication skills', 'Conflict resolution', 'Parenting support']
        },
        {
          title: 'Crisis Intervention',
          description: 'Immediate support and intervention during mental health crises and emergency situations.',
          features: ['24/7 availability', 'Safety planning', 'Emergency assessment', 'Rapid stabilization']
        },
        {
          title: 'Supervision',
          description: 'Professional supervision and support for psychiatrists and psychologists in child and adolescent psychiatry.',
          features: ['Individual Supervision of Psychiatry Residents', 'Individual Supervision of Clinical Psychologists', 'Group Supervision of Psychiatry Residents', 'Group Supervision of Psychologists']
        },
        {
            title: 'Scientific Editing of Children\'s Books and Stories',
            description: 'Consultation and scientific editing for children\'s books and stories addressing mental health topics.',
          features: ['Content accuracy', 'Age-appropriate language', 'Educational value', 'Collaboration with publishers/authors']
        }
      ],
      conditionsTitle: 'Diagnoses We Handle',
      conditionsDescription: 'Below you will find some of the common symptoms of disorders but their criteria are not detailed for patient protection reasons.',
      conditions: [
        {
          name: 'Anxiety Disorders',
          definition: 'Anxiety disorders are characterized by persistent anxiety and worry.',
          symptoms: [
            'Avoidance of activities or school or people',
            'Sadness or irritability',
            'Avoidance of being alone',
            'Sleep difficulties',
            'Presence of tics'
          ]
        },
        {
          name: 'Depression',
          definition: 'Depression manifests differently from adult depression.',
          symptoms: [
            'Anger outbursts',
            'Intense guilt',
            'Sleep difficulties',
            'Avoidance of activities',
            'Isolation',
            'Self-harm',
            'Dark thoughts',
            'Despair about present/future'
          ]
        },
        {
          name: 'ADHD',
          definition: 'ADHD presents with core symptoms of attention deficit, hyperactivity, and impulsivity.',
          symptoms: [
            'Additional symptoms:',
            'Difficulty concentrating',
            'Absentmindedness',
            'Sleep difficulties',
            'Difficulty waiting for turn',
            'Rudeness',
            'Dangerous play'
          ]
        },
        {
          name: 'Autism Spectrum Disorders',
          definition: 'Autism Spectrum Disorders',
          symptoms: [
            'Repetitive behavioral patterns',
            'Repetitive movements',
            'Difficulty in external communication',
            'Difficulty in developing and understanding relationships',
            'Extremely limited interests',
            'Hyper/Hypo-reactivity to sensory information'
          ]
        },
        {
          name: 'Conduct Disorders',
          definition: 'Replacement of Antisocial Behavioral Problems',
          symptoms: [
            'Angry/Irritable mood',
            'Defiant behavior',
            'Explosive behavior',
            'Vindictiveness',
            'Rule violations',
            'Indifference to others\' feelings',
            'Property destruction',
            'Deceit/Theft'
          ]
        },
        {
          name: 'Eating Disorders',
          definition: 'Eating Disorders',
          symptoms: [
            'Restricted or Increased food intake',
            'Feeling of loss of control',
            'Frequent and intense exercise',
            'Vomiting',
            'Guilt',
            'Concern about body weight/image',
            'Complications (e.g., missed periods, hair loss, flaky skin)'
          ]
        },
        {
          name: 'Post-Traumatic Stress Disorder',
          definition: 'Post-Traumatic Stress Disorder can develop after traumatic experience(s).',
          symptoms: [
            'Recurrent, distressing memories',
            'Recurrent, distressing dreams',
            'Flashbacks',
            'Avoidance of related cues, situations, people',
            'Hypervigilance',
            'Sleep difficulties',
            'Sadness',
            'Inability to remember important trauma information',
            'Self-harm',
            'Irritability'
          ]
        },
        {
          name: 'Mood Disorders',
          definition: 'Mood disorders include depression, bipolar disorder and other similar disorders.',
          symptoms: [
            'Intense mood swings (unbearable sadness or excessive joy)',
            'Intense energy fluctuations (much or minimal energy)',
            'Inflated self-esteem',
            'Grandiose thoughts',
            'Reduced school performance',
            'Difficulty concentrating',
            'Avoidance or intense engagement with activities',
            'Dangerous behavior',
            'Rudeness',
            'Sleep difficulties'
          ]
        },
        {
          name: 'Tics',
          definition: 'Tics (muscle spasms) are sudden, rapid, repetitive, non-rhythmic motor movements or vocal expressions.',
          symptoms: [
            'Motor tics: Blinking, head shaking, shoulder shrugging',
            'Vocal tics: Coughing, throat clearing, grunting, word repetition'
          ]
        },
        {
          name: 'Psychoses',
          definition: 'Psychoses are serious mental disorders characterized by loss of contact with reality.',
          symptoms: [
            'Delusional ideas (e.g., persecution, grandeur, control)',
            'Hallucinations (auditory, visual, tactile)',
            'Disorganized thinking',
            'Disorganized speech',
            'Disorganized or catatonic behavior',
            'Lack of awareness of the disorder'
          ]
        },
        {
          name: 'Obsessive-Compulsive Disorder (OCD)',
          definition: 'Mental disorder with recurrent, unwanted thoughts (obsessions) and compulsive behaviors.',
          symptoms: [
            'Recurrent thoughts that cause anxiety (e.g., germs, symmetry)',
            'Ritualistic actions to reduce anxiety (e.g., washing/licking/rubbing hands, organizing space, covering, playing with doors/windows)',
            'The sufferer recognizes the irrational nature of their thoughts'
          ]
        },
        {
          name: 'Sleep-Wake Disorders',
          definition: 'Group of disorders that affect sleep quality, quantity, or timing.',
          symptoms: [
            'Insomnia: Difficulty initiating/maintaining sleep',
            'Hypersomnia: Excessive daytime sleepiness',
            'Circadian rhythm disorders: Sleep at wrong times',
            'Parasomnias: Nightmares, sleepwalking, night terrors',
            'Sleep Apnea Syndrome: Breathing interruptions during sleep'
          ]
        }
      ],
      notListed: 'Don\'t see your specific concern listed? Please reach out - we\'re here to help with any mental health challenges your child may be facing.'
    }
  } as const;

  type Lang = keyof typeof content;
  const lang: Lang = language;
  type Service = typeof content[Lang extends never ? 'gr' : Lang]['services'][number];

  const icons = [Brain, MessageSquare, Home, Pill, Users, BookOpen];


  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-black font-semibold text-2xl font-quicksand">{content[lang].title}</span>
          <h2 className="text-4xl font-bold mt-2 mb-6 font-poppins">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
              {content[lang].subtitle}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-nunito">
            {content[lang].description}
          </p>
        </motion.div>

        {/* Εικόνα με ευτυχισμένα παιδιά πριν τις κάρτες υπηρεσιών */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          className="mb-12 overflow-hidden rounded-4xl shadow-2xl border border-gray-100"
        >
          <img
            src={happyImg}
            alt="Χαρούμενα παιδιά χαμογελούν και διασκεδάζουν μαζί"
            className="w-full h-[500px] object-cover"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {content[lang].services.map((service: Service, index: number) => {
            const IconComponent = icons[index];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-blue-50 rounded-4xl p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-500"
              >
                {/* Icon */}
                    <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-rose-soft to-purple-soft p-4 rounded-2xl w-fit mb-6 shadow-lg"
                >
                  <IconComponent className="h-8 w-8 text-white" />
                  </motion.div>
                  
                <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins">
                    {service.title}
                  </h3>
                  
                <p className="text-gray-600 mb-6 leading-relaxed font-nunito">
                    {service.description}
                  </p>
                  
                    <ul className="space-y-3">
                      {service.features.map((feature: string, featureIndex: number) => (
                        <motion.li 
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-center text-sm text-gray-600 font-quicksand"
                        >
                          <motion.div 
                            whileHover={{ scale: 1.5 }}
                            className="w-2 h-2 bg-gradient-to-r from-rose-soft to-purple-soft rounded-full mr-3"
                          />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-5xl p-8 md:p-12 shadow-2xl border border-gray-100"
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 font-poppins">{content[lang].conditionsTitle}</h3>
            {content[lang].conditionsDescription && (
              <p className="text-gray-600 text-lg font-nunito max-w-4xl mx-auto leading-relaxed">
                {content[lang].conditionsDescription}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {content[lang].conditions.map((condition, index: number) => (
              <motion.button 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCondition({
                  name: condition.name, 
                  definition: condition.definition,
                  symptoms: condition.symptoms
                })}
                className="bg-gradient-to-r from-pastel-pink to-baby-blue border border-rose-soft/20 rounded-2xl p-4 text-center hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <span className="text-gray-700 font-medium text-sm font-quicksand">{condition.name}</span>
              </motion.button>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-warm-cream to-yellow-soft p-6 rounded-3xl"
          >
            <Smile className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <p className="text-gray-600 italic font-nunito leading-relaxed">
              {content[lang].notListed}
            </p>
          </motion.div>
        </motion.div>

        {/* Condition Details Modal */}
        <AnimatePresence>
          {selectedCondition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedCondition(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 font-poppins">
                    {selectedCondition.name}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCondition(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
                
                <div className="space-y-6">
                  {selectedCondition.definition && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700 font-quicksand mb-3">
                        {language === 'gr' ? 'Ορισμός:' : 'Definition:'}
                      </h4>
                      <p className="text-gray-600 font-nunito leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {selectedCondition.definition}
                      </p>
                    </div>
                  )}
                  
                  <div>
                  <h4 className="text-lg font-semibold text-gray-700 font-quicksand mb-3">
                      {language === 'gr' ? 'Συμπτώματα:' : 'Symptoms:'}
                  </h4>
                  <ul className="space-y-3">
                      {selectedCondition.symptoms.map((symptom: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="w-2 h-2 bg-gradient-to-r from-rose-soft to-purple-soft rounded-full mr-3 mt-2 flex-shrink-0"
                        />
                          <span className="text-gray-600 font-nunito leading-relaxed">{symptom}</span>
                      </motion.li>
                    ))}
                  </ul>
                  </div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="mt-8 pt-6 border-t border-gray-200"
                >
                  <p className="text-center text-gray-500 font-quicksand">
                    {language === 'gr' 
                      ? 'Για περισσότερες πληροφορίες ή για να κλείσετε ραντεβού, επικοινωνήστε μαζί μας.'
                      : 'For more information or to book an appointment, please contact us.'
                    }
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
};

export default Services;