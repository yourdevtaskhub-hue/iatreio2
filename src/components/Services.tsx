import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, Shield, Smile, BookOpen, Pill, Home, X } from 'lucide-react';
import happyImg from '../assets/happy.jpg';

interface ServicesProps {
  language: 'gr' | 'en';
}

const Services: React.FC<ServicesProps> = ({ language }) => {
  const [selectedCondition, setSelectedCondition] = useState<{name: string, details: string[]} | null>(null);

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
          title: 'Προγράμματα Πρόληψης',
          description: 'Εκπαιδευτικές και προληπτικές παρεμβάσεις για προώθηση της ψυχικής υγείας και ανθεκτικότητας.',
          features: ['Σε παιδικούς σταθμούς, νηπιαγωγεία, σχολεία', 'Σε Σχολές Γονέων', 'Σε Συλλόγους Γονέων και Κηδεμόνων']
        },
        {
          title: 'Επιστημονική Επιμέλεια Βιβλίων και Παραμυθιών',
          description: 'Συμβουλευτική και επιστημονική επιμέλεια σε παιδικά βιβλία και παραμύθια με θέματα ψυχικής υγείας.',
          features: ['Ακρίβεια περιεχομένου', 'Κατάλληλη γλώσσα για ηλικίες', 'Εκπαιδευτική αξία', 'Επαγγελματική αξιολόγηση']
        }
      ],
      conditionsTitle: 'Διαγνώσεις που Χρήζουν Θεραπείας',
      conditions: [
        {
          name: 'Διαταραχές Άγχους',
          details: [
            'Αξιολόγηση και θεραπεία γενικευμένου άγχους, κοινωνικού άγχους και φοβιών',
            'Θεραπευτικές τεχνικές για διαχείριση συμπτωμάτων άγχους',
            'Συνεργασία με οικογένεια για δημιουργία ασφαλούς περιβάλλοντος'
          ]
        },
        {
          name: 'Κατάθλιψη',
          details: [
            'Διάγνωση και θεραπεία καταθλιπτικών διαταραχών σε παιδιά και εφήβους',
            'Θεραπευτικές προσεγγίσεις βασισμένες σε αποδείξεις',
            'Παρακολούθηση και υποστήριξη κατά τη διάρκεια της ανάκαμψης'
          ]
        },
        {
          name: 'ΔΕΠΥ',
          details: [
            'Ολοκληρωμένη αξιολόγηση για Διαταραχή Ελλειμματικής Προσοχής και Υπερκινητικότητας',
            'Συνεργασία με σχολικό περιβάλλον για ακαδημαϊκή υποστήριξη',
            'Θεραπευτικές στρατηγικές για βελτίωση συγκέντρωσης και συμπεριφοράς'
          ]
        },
        {
          name: 'Διαταραχές Φάσματος Αυτισμού',
          details: [
            'Ειδικευμένη αξιολόγηση και θεραπεία για παιδιά με αυτισμό',
            'Αναπτυξιακές θεραπευτικές προσεγγίσεις',
            'Οικογενειακή υποστήριξη και εκπαίδευση'
          ]
        },
        {
          name: 'Διατροφικές Διαταραχές',
          details: [
            'Θεραπεία ανορεξίας, βουλιμίας και άλλων διατροφικών διαταραχών',
            'Συνεργασία με διατροφολόγο και άλλους ειδικούς',
            'Ψυχολογική υποστήριξη για την ανάκαμψη'
          ]
        },
        {
          name: 'Συμπεριφορικά Προβλήματα',
          details: [
            'Αξιολόγηση και θεραπεία προβληματικής συμπεριφοράς',
            'Θεραπευτικές τεχνικές για βελτίωση αυτορρύθμισης',
            'Οικογενειακές στρατηγικές για διαχείριση συμπεριφοράς'
          ]
        },
        {
          name: 'Τραύμα & PTSD',
          details: [
            'Ειδικευμένη θεραπεία για ψυχολογικό τραύμα και PTSD',
            'Θεραπευτικές προσεγγίσεις ενημερωμένες για τραύμα',
            'Ασφαλής και υποστηρικτική θεραπευτική σχέση'
          ]
        },
        {
          name: 'Διαταραχές Διάθεσης',
          details: [
            'Διάγνωση και θεραπεία διπολικών και άλλων διαταραχών διάθεσης',
            'Φαρμακολογική και ψυχοθεραπευτική φροντίδα',
            'Παρακολούθηση και πρόληψη υποτροπών'
          ]
        },
        {
          name: 'Μαθησιακές Δυσκολίες',
          details: [
            'Αξιολόγηση μαθησιακών δυσκολιών και διαταραχών μάθησης',
            'Συνεργασία με εκπαιδευτικούς για ακαδημαϊκή υποστήριξη',
            'Θεραπευτικές στρατηγικές για βελτίωση μαθησιακών δεξιοτήτων'
          ]
        },
        {
          name: 'Κοινωνικές Δυσκολίες',
          details: [
            'Θεραπεία κοινωνικού άγχους και δυσκολιών κοινωνικοποίησης',
            'Ανάπτυξη κοινωνικών δεξιοτήτων και αυτοπεποίθησης',
            'Ομαδικές θεραπευτικές δραστηριότητες'
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
          title: 'Scientific Editing of Children’s Books & Stories',
          description: 'Consultation and scientific editing for children’s books and stories addressing mental health topics.',
          features: ['Content accuracy', 'Age-appropriate language', 'Educational value', 'Collaboration with publishers/authors']
        },
        {
          title: 'Prevention Programs',
          description: 'Educational and preventive interventions to promote mental health and resilience.',
          features: ['School consultations', 'Parent education', 'Resilience building', 'Early intervention']
        }
      ],
      conditionsTitle: 'Diagnoses We Handle',
      conditionsDesc: 'Our expertise spans a wide range of mental health conditions affecting children and adolescents.',
      conditions: [
        {
          name: 'Anxiety Disorders',
          details: [
            'Assessment and treatment of generalized anxiety, social anxiety, and phobias',
            'Therapeutic techniques for anxiety symptom management',
            'Family collaboration to create a safe environment'
          ]
        },
        {
          name: 'Depression',
          details: [
            'Diagnosis and treatment of depressive disorders in children and adolescents',
            'Evidence-based therapeutic approaches',
            'Monitoring and support during recovery'
          ]
        },
        {
          name: 'ADHD',
          details: [
            'Comprehensive assessment for Attention Deficit Hyperactivity Disorder',
            'Collaboration with school environment for academic support',
            'Therapeutic strategies to improve focus and behavior'
          ]
        },
        {
          name: 'Autism Spectrum Disorders',
          details: [
            'Specialized assessment and treatment for children with autism',
            'Developmental therapeutic approaches',
            'Family support and education'
          ]
        },
        {
          name: 'Eating Disorders',
          details: [
            'Treatment of anorexia, bulimia, and other eating disorders',
            'Collaboration with nutritionists and other specialists',
            'Psychological support for recovery'
          ]
        },
        {
          name: 'Behavioral Issues',
          details: [
            'Assessment and treatment of problematic behavior',
            'Therapeutic techniques for improving self-regulation',
            'Family strategies for behavior management'
          ]
        },
        {
          name: 'Trauma & PTSD',
          details: [
            'Specialized treatment for psychological trauma and PTSD',
            'Trauma-informed therapeutic approaches',
            'Safe and supportive therapeutic relationship'
          ]
        },
        {
          name: 'Mood Disorders',
          details: [
            'Diagnosis and treatment of bipolar and other mood disorders',
            'Pharmacological and psychotherapeutic care',
            'Monitoring and relapse prevention'
          ]
        },
        {
          name: 'Learning Difficulties',
          details: [
            'Assessment of learning difficulties and learning disorders',
            'Collaboration with educators for academic support',
            'Therapeutic strategies to improve learning skills'
          ]
        },
        {
          name: 'Social Difficulties',
          details: [
            'Treatment of social anxiety and socialization difficulties',
            'Development of social skills and self-confidence',
            'Group therapeutic activities'
          ]
        }
      ],
      notListed: 'Don\'t see your specific concern listed? Please reach out - we\'re here to help with any mental health challenges your child may be facing.'
    }
  } as const;

  type Lang = keyof typeof content;
  const lang: Lang = language;
  type Service = typeof content[Lang extends never ? 'gr' : Lang]['services'][number];

  const icons = [Brain, MessageSquare, Home, Pill, Shield, BookOpen];

  // Detailed information for each condition
  const conditionDetails = {
    gr: {
      'Διαταραχές Άγχους': {
        title: 'Διαταραχές Άγχους',
        description: 'Οι διαταραχές άγχους είναι από τις πιο συχνές ψυχικές διαταραχές στην παιδική ηλικία.',
        symptoms: ['Επίμονη ανησυχία', 'Σωματικές εκδηλώσεις (πονοκέφαλος, στομαχόπονος)', 'Αποφυγή δραστηριοτήτων'],
        treatment: 'Κοgnitive Behavioral Therapy (CBT), χαλαρωτικές τεχνικές, και σε ορισμένες περιπτώσεις φαρμακευτική αγωγή.'
      },
      'Κατάθλιψη': {
        title: 'Κατάθλιψη',
        description: 'Η κατάθλιψη στην παιδική ηλικία μπορεί να εκδηλώνεται διαφορετικά από τους ενήλικες.',
        symptoms: ['Θλίψη ή ευερεθιστότητα', 'Απώλεια ενδιαφέροντος', 'Αλλαγές στη διατροφή και τον ύπνο'],
        treatment: 'Ψυχοθεραπεία, οικογενειακή υποστήριξη και σε σοβαρές περιπτώσεις φαρμακευτική αγωγή.'
      },
      'ΔΕΠΥ': {
        title: 'ΔΕΠΥ (Διαταραχή Ελλειμματικής Προσοχής και Υπερκινητικότητας)',
        description: 'Η ΔΕΠΥ επηρεάζει την ικανότητα συγκέντρωσης και αυτοελέγχου.',
        symptoms: ['Δυσκολία συγκέντρωσης', 'Υπερκινητικότητα', 'Αυθόρμητη συμπεριφορά'],
        treatment: 'Συνδυασμός φαρμακευτικής αγωγής, συμπεριφορικής θεραπείας και εκπαιδευτικής υποστήριξης.'
      },
      'Διαταραχές Φάσματος Αυτισμού': {
        title: 'Διαταραχές Φάσματος Αυτισμού',
        description: 'Οι διαταραχές φάσματος αυτισμού επηρεάζουν την κοινωνική αλληλεπίδραση και επικοινωνία.',
        symptoms: ['Δυσκολίες κοινωνικής αλληλεπίδρασης', 'Επαναλαμβανόμενα μοτίβα συμπεριφοράς', 'Ευαισθησίες στις αισθήσεις'],
        treatment: 'Εξειδικευμένα προγράμματα παρέμβασης, οικογενειακή υποστήριξη και εκπαιδευτικά μέτρα.'
      },
      'Διατροφικές Διαταραχές': {
        title: 'Διατροφικές Διαταραχές',
        description: 'Οι διατροφικές διαταραχές στην εφηβική ηλικία απαιτούν άμεση επαγγελματική παρέμβαση.',
        symptoms: ['Επιμονή σε περιορισμένη διατροφή', 'Εξαιρετική ανησυχία για το σωματικό βάρος', 'Σωματικές επιπλοκές'],
        treatment: 'Ολοκληρωμένη θεραπευτική ομάδα, διατροφική συμβουλευτική και οικογενειακή υποστήριξη.'
      },
      'Συμπεριφορικά Προβλήματα': {
        title: 'Συμπεριφορικά Προβλήματα',
        description: 'Τα συμπεριφορικά προβλήματα μπορεί να επηρεάσουν σημαντικά την καθημερινή λειτουργία.',
        symptoms: ['Ανυπακοή', 'Εκρηκτική συμπεριφορά', 'Δυσκολίες στον έλεγχο των παρορμήσεων'],
        treatment: 'Συμπεριφορικές στρατηγικές, οικογενειακή εκπαίδευση και θεραπευτική παρέμβαση.'
      },
      'Τραύμα & PTSD': {
        title: 'Τραύμα & PTSD',
        description: 'Το Post-Traumatic Stress Disorder μπορεί να αναπτυχθεί μετά από τραυματικές εμπειρίες.',
        symptoms: ['Επαναλαμβανόμενα όνειρα', 'Αποφυγή αναμνήσεων', 'Υπερβολική εγρήγορση'],
        treatment: 'Trauma-focused therapy, EMDR, και τεχνικές διαχείρισης άγχους.'
      },
      'Διαταραχές Διάθεσης': {
        title: 'Διαταραχές Διάθεσης',
        description: 'Οι διαταραχές διάθεσης περιλαμβάνουν την κατάθλιψη και την διπολική διαταραχή.',
        symptoms: ['Ακραίες διακυμάνσεις στη διάθεση', 'Ενεργειακές αλλαγές', 'Δυσκολίες στη συγκέντρωση'],
        treatment: 'Ψυχοθεραπεία, φαρμακευτική αγωγή και οικογενειακή υποστήριξη.'
      },
      'Μαθησιακές Δυσκολίες': {
        title: 'Μαθησιακές Δυσκολίες',
        description: 'Οι μαθησιακές δυσκολίες μπορούν να επηρεάσουν την ακαδημαϊκή απόδοση.',
        symptoms: ['Δυσκολίες στην ανάγνωση ή γραφή', 'Προβλήματα με τα μαθηματικά', 'Αδυναμία συγκέντρωσης'],
        treatment: 'Εκπαιδευτική αξιολόγηση, εξειδικευμένη διδασκαλία και θεραπευτική υποστήριξη.'
      },
      'Κοινωνικές Δυσκολίες': {
        title: 'Κοινωνικές Δυσκολίες',
        description: 'Οι κοινωνικές δυσκολίες μπορούν να επηρεάσουν τις σχέσεις και την αυτοπεποίθηση.',
        symptoms: ['Δυσκολία στην δημιουργία φιλιών', 'Κοινωνικό άγχος', 'Αποφυγή κοινωνικών καταστάσεων'],
        treatment: 'Κοινωνικές δεξιότητες, ομαδική θεραπεία και βήμα προς βήμα έκθεση.'
      }
    },
    en: {
      'Anxiety Disorders': {
        title: 'Anxiety Disorders',
        description: 'Anxiety disorders are among the most common mental health conditions in childhood.',
        symptoms: ['Persistent worry', 'Physical symptoms (headaches, stomach aches)', 'Avoidance of activities'],
        treatment: 'Cognitive Behavioral Therapy (CBT), relaxation techniques, and in some cases medication.'
      },
      'Depression': {
        title: 'Depression',
        description: 'Depression in childhood can manifest differently than in adults.',
        symptoms: ['Sadness or irritability', 'Loss of interest', 'Changes in appetite and sleep'],
        treatment: 'Psychotherapy, family support, and in severe cases medication.'
      },
      'ADHD': {
        title: 'ADHD (Attention Deficit Hyperactivity Disorder)',
        description: 'ADHD affects the ability to concentrate and self-control.',
        symptoms: ['Difficulty concentrating', 'Hyperactivity', 'Impulsive behavior'],
        treatment: 'Combination of medication, behavioral therapy, and educational support.'
      },
      'Autism Spectrum Disorders': {
        title: 'Autism Spectrum Disorders',
        description: 'Autism spectrum disorders affect social interaction and communication.',
        symptoms: ['Difficulties in social interaction', 'Repetitive behavioral patterns', 'Sensory sensitivities'],
        treatment: 'Specialized intervention programs, family support, and educational measures.'
      },
      'Eating Disorders': {
        title: 'Eating Disorders',
        description: 'Eating disorders in adolescence require immediate professional intervention.',
        symptoms: ['Persistent dietary restrictions', 'Excessive concern about body weight', 'Physical complications'],
        treatment: 'Comprehensive treatment team, nutritional counseling, and family support.'
      },
      'Behavioral Issues': {
        title: 'Behavioral Issues',
        description: 'Behavioral problems can significantly affect daily functioning.',
        symptoms: ['Disobedience', 'Explosive behavior', 'Difficulty controlling impulses'],
        treatment: 'Behavioral strategies, family education, and therapeutic intervention.'
      },
      'Trauma & PTSD': {
        title: 'Trauma & PTSD',
        description: 'Post-Traumatic Stress Disorder can develop after traumatic experiences.',
        symptoms: ['Recurring nightmares', 'Avoidance of memories', 'Hypervigilance'],
        treatment: 'Trauma-focused therapy, EMDR, and anxiety management techniques.'
      },
      'Mood Disorders': {
        title: 'Mood Disorders',
        description: 'Mood disorders include depression and bipolar disorder.',
        symptoms: ['Extreme mood swings', 'Energy changes', 'Concentration difficulties'],
        treatment: 'Psychotherapy, medication, and family support.'
      },
      'Learning Difficulties': {
        title: 'Learning Difficulties',
        description: 'Learning difficulties can affect academic performance.',
        symptoms: ['Difficulties in reading or writing', 'Math problems', 'Inability to concentrate'],
        treatment: 'Educational assessment, specialized instruction, and therapeutic support.'
      },
      'Social Difficulties': {
        title: 'Social Difficulties',
        description: 'Social difficulties can affect relationships and self-confidence.',
        symptoms: ['Difficulty making friends', 'Social anxiety', 'Avoidance of social situations'],
        treatment: 'Social skills, group therapy, and gradual exposure.'
      }
    }
  };

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
          <span className="text-black font-semibold text-lg font-quicksand">{content[lang].title}</span>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
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
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-r from-rose-soft to-purple-soft p-4 rounded-2xl w-fit mb-6 shadow-lg"
                >
                  <IconComponent className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed font-nunito">{service.description}</p>
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
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {content[lang].conditions.map((condition: {name: string, details: string[]}, index: number) => (
              <motion.button 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCondition({name: condition.name, details: [...condition.details]})}
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
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-700 font-quicksand mb-3">
                    {language === 'gr' ? 'Πληροφορίες Θεραπείας:' : 'Treatment Information:'}
                  </h4>
                  <ul className="space-y-3">
                    {selectedCondition.details.map((detail: string, index: number) => (
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
                        <span className="text-gray-600 font-nunito leading-relaxed">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
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

      {/* Condition Details Popup */}
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
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-800 font-poppins">
                  {conditionDetails[lang][selectedCondition.name]?.title || selectedCondition.name}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCondition(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {conditionDetails[lang][selectedCondition.name] && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 font-quicksand">Περιγραφή</h4>
                    <p className="text-gray-600 leading-relaxed font-nunito">
                      {conditionDetails[lang][selectedCondition.name].description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 font-quicksand">Συμπτώματα</h4>
                    <ul className="space-y-2">
                      {conditionDetails[lang][selectedCondition.name].symptoms.map((symptom: string, index: number) => (
                        <li key={index} className="flex items-start text-gray-600 font-nunito">
                          <span className="text-rose-soft mr-3 mt-1">•</span>
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 font-quicksand">Θεραπευτική Προσέγγιση</h4>
                    <p className="text-gray-600 leading-relaxed font-nunito">
                      {conditionDetails[lang][selectedCondition.name].treatment}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;