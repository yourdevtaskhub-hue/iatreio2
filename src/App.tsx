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

function App() {
  const [language, setLanguage] = useState('gr');


  return (
    <div className="min-h-screen bg-white font-nunito">
      <Header language={language} setLanguage={setLanguage} />
      <Hero language={language} setLanguage={setLanguage} />
      <TrustSection language={language} />
      <Services language={language} />
      <About language={language} />
      <Testimonials language={language} />
      <FAQ language={language} />
      <Articles language={language} />
      <Contact language={language} />
      <Footer language={language} />
    </div>
  );
}

export default App;