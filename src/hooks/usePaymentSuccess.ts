import { useState, useEffect } from 'react';

interface PaymentSuccessParams {
  sessionId?: string;
  paymentId?: string;
  isSuccess: boolean;
}

export const usePaymentSuccess = (): PaymentSuccessParams => {
  const [params, setParams] = useState<PaymentSuccessParams>({
    isSuccess: false
  });

  useEffect(() => {
    // Check if we're on a payment success page
    const checkPaymentSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;
      
      // Check for various success indicators
      const sessionId = urlParams.get('session_id');
      const paymentId = urlParams.get('payment_id');
      const paymentStatus = urlParams.get('payment_status');
      const success = urlParams.get('success');
      
      // Check if we're on a success page or have success parameters
      const isSuccessPage = pathname.includes('payment-success') || 
                           pathname.includes('success') ||
                           pathname.includes('payment_success');
      
      const hasSuccessParams = sessionId || paymentId || 
                             paymentStatus === 'success' || 
                             success === 'true' ||
                             success === '1';
      
      const isSuccess = isSuccessPage || hasSuccessParams;
      
      setParams({
        sessionId: sessionId || undefined,
        paymentId: paymentId || undefined,
        isSuccess
      });
    };

    // Check immediately
    checkPaymentSuccess();
    
    // Also check when URL changes (for SPA navigation)
    const handleUrlChange = () => {
      checkPaymentSuccess();
    };
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  return params;
};
