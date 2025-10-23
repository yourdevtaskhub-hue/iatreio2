// Payment Success Page
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const router = useRouter();
  const { session_id, payment_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!session_id || !payment_id) {
        setLoading(false);
        return;
      }

      try {
        // Here you would verify the payment with Stripe
        // For now, we'll simulate success
        setPaymentDetails({
          doctor: 'Dr. Anna Maria Fytrou',
          amount: '€130.00',
          date: new Date().toLocaleDateString('el-GR'),
          time: '09:00'
        });
      } catch (error) {
        console.error('Payment verification error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session_id && payment_id) {
      verifyPayment();
    }
  }, [session_id, payment_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Επαλήθευση πληρωμής...</h2>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border-2 border-green-200">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto mb-6 flex items-center justify-center rounded-full h-24 w-24 bg-green-100 text-green-500"
        >
          <CheckCircle className="h-16 w-16" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 font-poppins">
          Πληρωμή Ολοκληρώθηκε!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 font-nunito">
          Η πληρωμή σας ολοκληρώθηκε επιτυχώς και το ραντεβού σας έχει καταχωρηθεί!
        </p>

        {paymentDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-left mb-8"
          >
            <h3 className="text-xl font-bold text-green-800 mb-3">Στοιχεία Ραντεβού</h3>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Γιατρός:</span> {paymentDetails.doctor}</p>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Ημερομηνία:</span> {paymentDetails.date}</p>
            <p className="text-gray-700 mb-2"><span className="font-semibold">Ώρα:</span> {paymentDetails.time}</p>
            <p className="text-2xl font-bold text-green-700 mt-4">
              <span className="font-semibold">Ποσό:</span> {paymentDetails.amount}
            </p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
        >
          Επιστροφή στην Αρχική Σελίδα
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PaymentSuccess;