import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader, CheckCircle } from 'lucide-react';
import { getStripe } from '../lib/stripe';
import { getDoctorPrice, createCheckoutSession } from '../lib/stripe-api';
import { createRealStripeCheckout } from '../lib/stripe-checkout';

interface StripeCheckoutProps {
  doctorId: string;
  doctorName: string;
  parentName: string;
  parentEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  concerns: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  language: 'gr' | 'en';
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  doctorId,
  doctorName,
  parentName,
  parentEmail,
  appointmentDate,
  appointmentTime,
  concerns,
  onSuccess,
  onError,
  language
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const content = {
    gr: {
      title: '💳 Πληρωμή με Stripe',
      subtitle: 'Ασφαλής πληρωμή με κάρτα',
      button: 'Πληρωμή με Stripe',
      processing: 'Επεξεργασία...',
      success: 'Πληρωμή Επιτυχής!',
      error: 'Σφάλμα πληρωμής',
      secure: 'Ασφαλής πληρωμή με 256-bit SSL encryption',
      poweredBy: 'Powered by Stripe'
    },
    en: {
      title: '💳 Pay with Stripe',
      subtitle: 'Secure card payment',
      button: 'Pay with Stripe',
      processing: 'Processing...',
      success: 'Payment Successful!',
      error: 'Payment Error',
      secure: 'Secure payment with 256-bit SSL encryption',
      poweredBy: 'Powered by Stripe'
    }
  };

  // Fetch doctor price on component mount
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const priceCents = await getDoctorPrice(doctorId);
        setPrice(priceCents);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch price');
        onError?.(err.message || 'Failed to fetch price');
      }
    };
    fetchPrice();
  }, [doctorId, onError]);

  const handleStripeCheckout = async () => {
    if (!price) {
      setError('Price not available');
      onError?.('Price not available');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create REAL Stripe Checkout Session
      console.log('🚀 [INFO] Creating REAL Stripe Checkout...');
      
      const { sessionId, paymentId } = await createRealStripeCheckout({
        doctorId,
        doctorName,
        parentName,
        parentEmail,
        appointmentDate,
        appointmentTime,
        concerns,
        amountCents: price
      });

      // If we reach here, the redirect to Stripe should have happened
      console.log('✅ [SUCCESS] Redirecting to Stripe Checkout:', { sessionId, paymentId });
      
      // The user will be redirected to Stripe, so we don't need to show success here
      // Stripe will handle the payment and redirect back to our success page

    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      setError(error.message || 'Payment failed');
      onError?.(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800 mb-2">
          {content[language].success}
        </h3>
        <p className="text-green-700">
          Η πληρωμή δημιουργήθηκε επιτυχώς! Το ραντεβού σας έχει καταχωρηθεί.
        </p>
        <p className="text-green-600 text-sm mt-2">
          Σε λίγα δευτερόλεπτα θα μεταφερθείτε στην αρχική σελίδα...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">
          {content[language].title}
        </h3>
        <p className="text-gray-600 font-nunito">
          {content[language].subtitle}
        </p>
      </div>

      {/* Doctor and Appointment Info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Γιατρός:</span>
            <p className="text-gray-800">{doctorName}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Ημερομηνία:</span>
            <p className="text-gray-800">{appointmentDate}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Ώρα:</span>
            <p className="text-gray-800">{appointmentTime}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Email:</span>
            <p className="text-gray-800">{parentEmail}</p>
          </div>
        </div>
      </div>

      {/* Price Display */}
      {price && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">Συνολικό Ποσό:</span>
            <span className="text-2xl font-bold text-blue-600">€{(price / 100).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Payment Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStripeCheckout}
        disabled={loading || !price || error}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>{content[language].processing}</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>{content[language].button}</span>
          </>
        )}
      </motion.button>

      {/* Security Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-2">
          {content[language].secure}
        </p>
        <p className="text-xs text-gray-400">
          {content[language].poweredBy}
        </p>
      </div>
    </motion.div>
  );
};

export default StripeCheckout;
