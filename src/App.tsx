import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustSection from './components/TrustSection';
import Services from './components/Services';
import About from './components/About';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Articles from './components/Articles';
import Contact from './components/Contact';
import TeamMembers from './components/TeamMembers';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import EiriniPanel from './components/EiriniPanel';
import IoannaPanel from './components/IoannaPanel';
import SofiaPanel from './components/SofiaPanel';
import PaymentSuccessPopup from './components/PaymentSuccessPopup';
import { usePaymentSuccess } from './hooks/usePaymentSuccess';

function App() {
  const [language, setLanguage] = useState('gr');
  const [currentPage, setCurrentPage] = useState('home');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  
  // Check for payment success
  const paymentSuccess = usePaymentSuccess();

  // Check URL for admin access and doctor panels
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setCurrentPage('admin');
    } else if (path === '/eirini' || path === '/eirini/') {
      setCurrentPage('eirini');
    } else if (path === '/ioanna' || path === '/ioanna/') {
      setCurrentPage('ioanna');
    } else if (path === '/sofia' || path === '/sofia/') {
      setCurrentPage('sofia');
    }
  }, []);

  // Show payment success popup when payment is successful
  React.useEffect(() => {
    if (paymentSuccess.isSuccess) {
      setShowPaymentSuccess(true);
    }
  }, [paymentSuccess.isSuccess]);

  // Simple routing
  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <Admin />;
      case 'eirini':
        return <EiriniPanel language={language} onLogout={() => setCurrentPage('home')} />;
      case 'ioanna':
        return <IoannaPanel language={language} onLogout={() => setCurrentPage('home')} />;
      case 'sofia':
        return <SofiaPanel language={language} onLogout={() => setCurrentPage('home')} />;
      default:
        return (
          <>
            <Header language={language} setLanguage={setLanguage} />
            <Hero language={language} setLanguage={setLanguage} />
            <TrustSection language={language} />
            <About language={language} />
            <TeamMembers language={language} />
            <Services language={language} />
            <Testimonials language={language} />
            <FAQ language={language} />
            <Articles language={language} />
            <Contact language={language} />
            <Footer language={language} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white font-nunito">
      {renderPage()}
      
      {/* Payment Success Popup */}
      <PaymentSuccessPopup
        isVisible={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        sessionId={paymentSuccess.sessionId}
        paymentId={paymentSuccess.paymentId}
        language={language}
      />
      
      
    </div>
  );
}

export default App;