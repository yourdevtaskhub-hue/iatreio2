import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Heart } from 'lucide-react';

interface FAQProps {
  language: 'gr' | 'en';
}

const FAQ: React.FC<FAQProps> = ({ language }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const content = {
    gr: {
      title: 'ΣΥΧΝΕΣ ΕΡΩΤΗΣΕΙΣ ΓΟΝΕΩΝ',
      subtitle: '',
      description: 'Βρείτε απαντήσεις στις πιο συχνές ερωτήσεις που έχουν οι γονείς σχετικά με την ψυχική υγεία των παιδιών τους.',
      faqs: [
        {
          question: 'Πότε πρέπει να αναζητήσω βοήθεια για το παιδί μου;',
          answer: 'Αναζητήστε βοήθεια όταν παρατηρείτε σημαντικές αλλαγές στη συμπεριφορά, τη διάθεση ή την απόδοση του παιδιού σας που διαρκούν. Αυτό μπορεί να περιλαμβάνει απομόνωση του παιδιού, έντονο άγχος, θλίψη, αλλαγές στον ύπνο ή την όρεξη, ή δυσκολίες στο σχολείο.'
        },
        {
          question: 'Πώς λειτουργούν οι διαδικτυακές συνεδρίες;',
          answer: 'Οι διαδικτυακές συνεδρίες γίνονται μέσω ασφαλούς πλατφόρμας βιντεοκλήσης. Το παιδί σας μπορεί να συμμετέχει από την άνεση του σπιτιού του, ή από άλλο ασφαλές και ήσυχο μέρος, κάτι που συχνά το βοηθά να αισθάνεται πιο άνετα. Παρέχουμε όλες τις απαραίτητες οδηγίες για τη σύνδεση και τη χρήση της πλατφόρμας.'
        },
        {
          question: 'Πόσο διαρκεί συνήθως η θεραπεία;',
          answer: 'Η διάρκεια της θεραπείας εξαρτάται από τις ατομικές ανάγκες του παιδιού σας. Ορισμένα προβλήματα μπορεί να βελτιωθούν σε λίγες εβδομάδες, ενώ άλλα μπορεί να χρειάζονται μήνες. Αξιολογούμε τακτικά την πρόοδο και προσαρμόζουμε το σχέδιο θεραπείας ανάλογα. Κάθε συνεδρία διαρκεί 45-60 λεπτά.'
        },
        {
          question: 'Τι πρέπει να περιμένω από την πρώτη συνάντηση;',
          answer: 'Η πρώτη συνάντηση γίνεται συνήθως με την γιατρό και τους γονείς, όπου συζητάνε τις ανησυχίες και τους στόχους που έχουν για το παιδί τους. Στο ασφαλές περιβάλλον της συνεδρίας, εξηγούμε τις προϋποθέσεις για την θεραπεία του παιδιού και κανονίζουμε το επόμενο ραντεβού να είναι με το παιδί που θα ακούσουμε και τις δικές του ανησυχίες και τους δικούς του στόχους.'
        },
        {
          question: 'Πώς εμπλέκονται οι γονείς στη θεραπεία;',
          answer: 'Οι γονείς είναι βασικοί συνεργάτες στη θεραπευτική διαδικασία. Παρέχουμε τακτικές ενημερώσεις, καθοδήγηση για το σπίτι και στρατηγικές που μπορείτε να εφαρμόσετε για να υποστηρίξετε το παιδί σας. Προσφέρουμε επίσης συνεδρίες οικογενειακής θεραπείας όταν είναι απαραίτητο.'
        },
        {
          question: 'Είναι εμπιστευτικές οι συνεδρίες;',
          answer: 'Ναι, όλες οι συνεδρίες είναι αυστηρά εμπιστευτικές. Ωστόσο, για παιδιά και εφήβους, υπάρχουν ορισμένες εξαιρέσεις όταν υπάρχει κίνδυνος αυτοτραυματισμού ή ετεροτραυματισμού. Θα συζητήσουμε αυτά τα όρια εμπιστευτικότητας με εσάς και το παιδί σας από την αρχή.'
        }
      ]
    },
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to Common Parent Concerns',
      description: 'Find answers to the most common questions parents have about their children\'s mental health.',
      faqs: [
        {
          question: 'When should I seek help for my child?',
          answer: 'Seek help when you notice significant changes in your child\'s behavior, mood, or performance that last more than 2-3 weeks. This can include withdrawn behavior, excessive anxiety, changes in sleep or appetite, or difficulties at school.'
        },
        {
          question: 'How do online sessions work?',
          answer: 'Online sessions are conducted through a secure video calling platform. Your child can participate from the comfort of home, which often helps them feel more at ease. We provide all necessary instructions for connecting and using the platform.'
        },
        {
          question: 'How long does therapy usually take?',
          answer: 'The duration of therapy depends on your child\'s individual needs. Some issues may improve in a few weeks, while others may require months. We regularly assess progress and adjust the treatment plan accordingly.'
        },
        {
          question: 'What should I expect from the first session?',
          answer: 'The first session is a comprehensive assessment where we\'ll discuss your child\'s history, current concerns, and your goals. We\'ll create a safe environment where your child feels comfortable expressing themselves.'
        },
        {
          question: 'How are parents involved in therapy?',
          answer: 'Parents are essential partners in the therapeutic process. We provide regular updates, home guidance, and strategies you can implement to support your child. We also offer family therapy sessions when needed.'
        },
        {
          question: 'Are sessions confidential?',
          answer: 'Yes, all sessions are strictly confidential. However, for children and adolescents, there are certain exceptions when there\'s risk of harm. We\'ll discuss these confidentiality limits with you and your child from the beginning.'
        }
      ]
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-6 font-poppins">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
              {content[language].title}
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-black max-w-3xl mx-auto leading-relaxed font-nunito">
            <span className="font-bold">Βρείτε απαντήσεις</span> στις πιο συχνές ερωτήσεις που έχουν οι γονείς σχετικά με την ψυχική υγεία των παιδιών τους.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {content[language].faqs.map((faq: { question: string; answer: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <motion.button
                  onClick={() => toggleFAQ(index)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-pastel-pink hover:to-baby-blue transition-all duration-300"
                >
                  <div className="flex items-center">
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="bg-gradient-to-r from-rose-soft to-purple-soft p-3 rounded-2xl mr-4 shadow-lg"
                    >
                      <HelpCircle className="h-5 w-5 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-800 font-poppins">{faq.question}</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-blue-soft to-green-soft p-2 rounded-full shadow-md"
                  >
                    {openIndex === index ? (
                      <Minus className="h-5 w-5 text-white" />
                    ) : (
                      <Plus className="h-5 w-5 text-white" />
                    )}
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="bg-gradient-to-r from-warm-cream to-yellow-soft p-6 rounded-2xl border-l-4 border-rose-soft">
                          <p className="text-gray-700 leading-relaxed font-nunito">{faq.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-white p-8 rounded-4xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-rose-soft to-purple-soft p-4 rounded-full w-fit mx-auto mb-4 shadow-lg"
            >
              <Heart className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">
              {language === 'gr' ? 'Έχετε Άλλες Ερωτήσεις;' : 'Have More Questions?'}
            </h3>
            <p className="text-gray-600 font-nunito leading-relaxed mb-6">
              {language === 'gr' 
                ? 'Μη διστάσετε να επικοινωνήσετε μαζί μας. Είμαστε εδώ για να απαντήσουμε σε όλες τις ερωτήσεις σας και να σας βοηθήσουμε να κάνετε το καλύτερο για το παιδί σας.'
                : 'Don\'t hesitate to reach out to us. We\'re here to answer all your questions and help you do what\'s best for your child.'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-rose-soft to-purple-soft text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 font-poppins"
            >
              {language === 'gr' ? 'Επικοινωνήστε Μαζί Μας' : 'Contact Us'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;