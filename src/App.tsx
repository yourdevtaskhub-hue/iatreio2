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
import Footer from './components/Footer';
import Admin from './pages/Admin';

function App() {
  const [language, setLanguage] = useState('gr');
  const [currentPage, setCurrentPage] = useState('home');

  // Check URL for admin access
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setCurrentPage('admin');
    }
  }, []);

  // Simple routing
  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <Admin />;
      default:
        return (
          <>
            <Header language={language} setLanguage={setLanguage} />
            <Hero language={language} setLanguage={setLanguage} />
            <TrustSection language={language} />
            <About language={language} />
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
      
      {/* Admin Panel Access Button - Only show on home page */}
      {currentPage === 'home' && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
          onClick={() => setCurrentPage('admin')}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          title="Admin Panel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      )}
      
    </div>
  );
}

export default App;