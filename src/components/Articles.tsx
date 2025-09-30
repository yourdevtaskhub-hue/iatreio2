import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

interface ArticlesProps {
  language: 'gr' | 'en';
}

const Articles: React.FC<ArticlesProps> = ({ language }) => {
  const content = {
    gr: {
      title: 'Άρθρα & Συμβουλές',
      subtitle: 'Χρήσιμες Πληροφορίες για Γονείς',
      description: 'Ανακαλύψτε χρήσιμες συμβουλές και πληροφορίες για την υποστήριξη της ψυχικής υγείας του παιδιού σας.',
      readMore: 'Διαβάστε Περισσότερα',
      articles: [
        {
          title: 'Πώς να Αναγνωρίσετε το Άγχος στα Παιδιά',
          excerpt: 'Μάθετε τα σημάδια του άγχους στα παιδιά και πώς μπορείτε να τα υποστηρίξετε ως γονείς.',
          readTime: '5 λεπτά ανάγνωσης',
          category: 'Άγχος',
          image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Δημιουργώντας Ρουτίνες που Προάγουν την Ψυχική Υγεία',
          excerpt: 'Πρακτικές συμβουλές για τη δημιουργία υγιών ρουτινών που υποστηρίζουν την ευεξία του παιδιού.',
          readTime: '7 λεπτά ανάγνωσης',
          category: 'Ρουτίνες',
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Επικοινωνία με Εφήβους: Στρατηγικές που Λειτουργούν',
          excerpt: 'Αποτελεσματικοί τρόποι επικοινωνίας με εφήβους και οικοδόμηση εμπιστοσύνης.',
          readTime: '6 λεπτά ανάγνωσης',
          category: 'Εφηβεία',
          image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    en: {
      title: 'Articles & Tips',
      subtitle: 'Helpful Information for Parents',
      description: 'Discover useful tips and information to support your child\'s mental health.',
      readMore: 'Read More',
      articles: [
        {
          title: 'How to Recognize Anxiety in Children',
          excerpt: 'Learn the signs of anxiety in children and how you can support them as parents.',
          readTime: '5 min read',
          category: 'Anxiety',
          image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Creating Routines that Promote Mental Health',
          excerpt: 'Practical tips for creating healthy routines that support your child\'s wellbeing.',
          readTime: '7 min read',
          category: 'Routines',
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Communicating with Teenagers: Strategies that Work',
          excerpt: 'Effective ways to communicate with teenagers and build trust.',
          readTime: '6 min read',
          category: 'Adolescence',
          image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
      ]
    }
  };

  return (
    <section id="articles" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-2xl font-semibold mb-4 font-quicksand">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
              {content[language].title}
            </span>
          </h3>
          <h2 className="text-4xl font-bold mt-2 mb-6 font-poppins">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-soft via-purple-soft to-blue-soft">
              {content[language].subtitle}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-nunito">
            {content[language].description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content[language].articles.map((article, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-pastel-pink to-baby-blue rounded-4xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative overflow-hidden">
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 font-quicksand">
                    {article.category}
                  </span>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-4 right-4 bg-gradient-to-r from-rose-soft to-purple-soft p-2 rounded-full shadow-lg"
                >
                  <BookOpen className="h-4 w-4 text-white" />
                </motion.div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 font-poppins leading-tight">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed font-nunito">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 font-quicksand">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center text-rose-soft hover:text-purple-soft font-medium text-sm transition-colors font-poppins"
                  >
                    {content[language].readMore}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Articles;