// Payment Cancelled Page
import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

const PaymentCancelled: React.FC = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border-2 border-red-200">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto mb-6 flex items-center justify-center rounded-full h-24 w-24 bg-red-100 text-red-500"
        >
          <XCircle className="h-16 w-16" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 font-poppins">
          Πληρωμή Ακυρώθηκε
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 font-nunito">
          Η πληρωμή σας ακυρώθηκε. Μπορείτε να δοκιμάσετε ξανά οποιαδήποτε στιγμή.
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/contact')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          >
            Δοκιμάστε Ξανά
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="w-full bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-gray-600 transition-all duration-300"
          >
            Επιστροφή στην Αρχική Σελίδα
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentCancelled;
