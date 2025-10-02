import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Calendar, Shield, Heart, Send, Instagram, Facebook } from 'lucide-react';
import profile2 from '../assets/profile2.png';

interface ContactProps {
  language: 'gr' | 'en';
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
    recordingPolicyAccepted: false
  });
  const [messageLength, setMessageLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if privacy is accepted
    if (!formData.privacyAccepted) {
      alert(language === 'gr' 
        ? 'Παρακαλώ αποδεχτείτε τους όρους ιδιωτικότητας για να συνεχίσετε.'
        : 'Please accept the privacy terms to continue.'
      );
      return;
    }
    
    // Check if recording policy is accepted
    if (!formData.recordingPolicyAccepted) {
      alert(language === 'gr' 
        ? 'Παρακαλώ αποδεχτείτε την πολιτική ηχογράφησης για να συνεχίσετε.'
        : 'Please accept the recording policy to continue.'
      );
      return;
    }
    
    // Check if message is within character limit
    if (formData.message.length > 200) {
      alert(language === 'gr' 
        ? 'Το μήνυμά σας υπερβαίνει το όριο των 200 χαρακτήρων.'
        : 'Your message exceeds the 200 character limit.'
      );
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      alert(language === 'gr' 
        ? 'Το μήνυμά σας στάλθηκε επιτυχώς! Θα επικοινωνήσουμε μαζί σας σύντομα.'
        : 'Your message has been sent successfully! We will contact you soon.'
      );
    }, 2000);
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
      appointmentDatePlaceholder: 'Επιλέξτε την ημερομηνία που σας ενδιαφέρει',
      privacy: 'Κατανοώ ότι αυτή η φόρμα δεν είναι για επείγουσες καταστάσεις. Για άμεση βοήθεια, παρακαλώ επικοινωνήστε με τις υπηρεσίες έκτακτης ανάγκης ή πηγαίνετε στο πλησιέστερο τμήμα επειγόντων περιστατικών.',
      sendMessage: 'Αποστολή Μηνύματος',
      privacyGuaranteed: 'Εγγυημένη Ιδιωτικότητα',
      privacyDesc: 'Όλες οι επικοινωνίες είναι εμπιστευτικές και προστατεύονται από το ιατρικό απόρρητο.'
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
      appointmentDatePlaceholder: 'Select your preferred date',
      privacy: 'I understand that this form is not for emergency situations. For immediate help, please contact emergency services or go to your nearest emergency room.',
      sendMessage: 'Send Message',
      privacyGuaranteed: 'Privacy Guaranteed',
      privacyDesc: 'All communications are confidential and protected by patient-doctor privilege.'
    }
  };

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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
                {content[language].title}
              </span>
            </h2>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft text-center block text-xl font-poppins">
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
                alt={language === 'gr' ? 'Φωτογραφία ιατρού' : 'Doctor profile'} 
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
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
                      {language === 'gr' ? 'Λωζάνη, Ελβετία' : 'Lausanne, Switzerland'}
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
                      <p>{language === 'gr' ? 'Ραντεβού κατόπιν διαθεσιμότητας' : 'Appointments upon availability'}</p>
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
                  {content[language].formTitle}
                </span>
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
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
                    placeholder={language === 'gr' ? 'Το πλήρες όνομά σας' : 'Your full name'}
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
                    placeholder={language === 'gr' ? 'Ηλικία' : 'Age'}
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
                  <option value="">{language === 'gr' ? 'Επιλέξτε επίπεδο επείγοντος' : 'Select urgency level'}</option>
                  <option value="routine">{content[language].urgencyOptions.routine}</option>
                  <option value="urgent">{content[language].urgencyOptions.urgent}</option>
                  <option value="emergency">{content[language].urgencyOptions.emergency}</option>
                </motion.select>
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
                />
              </div>

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
                    {messageLength}/200 χαρακτήρες
                  </div>
                  {messageLength > 180 && (
                    <div className="text-xs text-red-500 font-quicksand">
                      Σχεδόν στο όριο!
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
                  <strong>Κατανοώ ότι αυτή η φόρμα δεν είναι για επείγουσες καταστάσεις.</strong> Για άμεση βοήθεια, παρακαλώ επικοινωνήστε με τις υπηρεσίες έκτακτης ανάγκης ή πηγαίνετε στο πλησιέστερο τμήμα επειγόντων περιστατικών.
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
                  <strong>Πολιτική ηχογράφησης & καταγραφής:</strong> Για λόγους προστασίας της ιδιωτικής ζωής και δεοντολογίας, απαγορεύεται αυστηρά η ηχογράφηση ή/και μαγνητοσκόπηση των συνεδριών. Σε περίπτωση παραβίασης αυτής της πολιτικής θα επιβάλλονται κυρώσεις.
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting || !formData.privacyAccepted || !formData.recordingPolicyAccepted || messageLength > 200}
                className={`w-full font-semibold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 font-poppins ${
                  isSubmitting || !formData.privacyAccepted || !formData.recordingPolicyAccepted || messageLength > 200
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-soft to-purple-soft text-white hover:shadow-2xl'
                }`}
              >
                <Calendar className="inline-block h-5 w-5 mr-2" />
                {isSubmitting 
                  ? (language === 'gr' ? 'Αποστολή...' : 'Sending...')
                  : content[language].sendMessage
                }
              </motion.button>
            </form>

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
      </div>
    </section>
  );
};

export default Contact;