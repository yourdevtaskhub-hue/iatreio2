import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, Clock, MapPin, Phone, Mail, X } from 'lucide-react';

interface PaymentSuccessPopupProps {
  isVisible: boolean;
  onClose: () => void;
  sessionId?: string;
  paymentId?: string;
}

const PaymentSuccessPopup: React.FC<PaymentSuccessPopupProps> = ({
  isVisible,
  onClose,
  sessionId,
  paymentId
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  // Auto close after 10 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50,
              transition: { duration: 0.3 }
            }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header with success icon */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Πληρωμή Επιτυχής!
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-lg"
                >
                  Σας περιμένουμε στο ιατρείο μας!
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  {/* Success message */}
                  <div className="text-center">
                    <p className="text-gray-700 text-lg font-medium mb-4">
                      Η πληρωμή σας ολοκληρώθηκε με επιτυχία! 
                    </p>
                    <p className="text-gray-600">
                      Θα λάβετε email επιβεβαίωσης με όλες τις λεπτομέρειες του ραντεβού σας.
                    </p>
                  </div>

                  {/* Appointment details */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <h3 className="font-semibold text-gray-800 text-center mb-3">
                      Λεπτομέρειες Ραντεβού
                    </h3>
                    
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">Ημερομηνία: Θα επιβεβαιωθεί με email</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="text-sm">Ώρα: Θα επιβεβαιωθεί με email</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <span className="text-sm">Τοποθεσία: Online (Διαδικτυακό Ιατρείο)</span>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 text-center">
                      Επικοινωνία
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 text-blue-700">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">+41 21 123 4567</span>
                      </div>
                      <div className="flex items-center space-x-3 text-blue-700">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">info@onlineparentteenclinic.com</span>
                      </div>
                    </div>
                  </div>

                  {/* Session info (if available) */}
                  {(sessionId || paymentId) && (
                    <div className="bg-gray-100 rounded-xl p-3">
                      <p className="text-xs text-gray-500 text-center">
                        {sessionId && `Session ID: ${sessionId.substring(0, 20)}...`}
                        {paymentId && `Payment ID: ${paymentId.substring(0, 20)}...`}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex space-x-3 mt-6"
                >
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Κατάλαβα
                  </button>
                  
                  <button
                    onClick={() => {
                      // Scroll to contact section
                      const contactElement = document.getElementById('contact');
                      if (contactElement) {
                        contactElement.scrollIntoView({ behavior: 'smooth' });
                      }
                      handleClose();
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Επικοινωνία
                  </button>
                </motion.div>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaymentSuccessPopup;
