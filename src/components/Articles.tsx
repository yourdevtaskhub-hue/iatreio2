import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

interface ArticlesProps {
  language: 'gr' | 'en' | 'fr';
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
          title: 'Παιδιά αντιμετωπίζουν δυσκολίες στην ευεξία μετά την πανδημία',
          excerpt: 'Η Ελλάδα βρίσκεται εκτός των top 20 χωρών για την ευτυχία των παιδιών σύμφωνα με την έκθεση UNICEF 2025.',
          readTime: '5 λεπτά ανάγνωσης',
          category: 'Ψυχική Υγεία',
          image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://neoskosmos.com/en/2025/08/08/news/greece/greek-children-struggle-with-wellbeing-post-pandemic-unicef-report-says/?utm_source'
        },
        {
          title: 'Γιατί οι μαμάδες δεν νιώθουν ποτέ αρκετές; Η ψυχολογική πίεση να είσαι "η τέλεια μαμά"',
          excerpt: 'Η ψυχολογική πίεση που αντιμετωπίζουν οι μητέρες για να είναι "τέλειες" κάθε μέρα και πώς να την αντιμετωπίσουν.',
          readTime: '7 λεπτά ανάγνωσης',
          category: 'Γονεϊκότητα',
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://www.themamagers.gr/family/500293/giati-oi-mamades-den-niothoun-pote-arketes-i-psuxologiki-piesi-na-eisai-i-teleia-mama-kathe-mera?utm_source=chatgpt.com'
        },
        {
          title: 'Επιστημονική έρευνα για την ψυχική υγεία των παιδιών',
          excerpt: 'Νεότερες επιστημονικές μελέτες και ευρήματα σχετικά με την ψυχική υγεία και την ευεξία των παιδιών.',
          readTime: '6 λεπτά ανάγνωσης',
          category: 'Έρευνα',
          image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://pubmed.ncbi.nlm.nih.gov/38748300/?utm_source='
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
          title: 'Children struggle with wellbeing post-pandemic',
          excerpt: 'Greece has fallen behind in global rankings for children happiness, finding itself outside the top 20 according to UNICEF\'s 2025 report.',
          readTime: '5 min read',
          category: 'Mental Health',
          image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://neoskosmos.com/en/2025/08/08/news/greece/greek-children-struggle-with-wellbeing-post-pandemic-unicef-report-says/?utm_source'
        },
        {
          title: 'Why mothers never feel enough: The psychological pressure to be "the perfect mom"',
          excerpt: 'The psychological pressure mothers face to be "perfect" every day and how to cope with it.',
          readTime: '7 min read',
          category: 'Parenting',
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://www.themamagers.gr/family/500293/giati-oi-mamades-den-niothoun-pote-arketes-i-psuxologiki-piesi-na-eisai-i-teleia-mama-kathe-mera?utm_source=chatgpt.com'
        },
        {
          title: 'Scientific research on children\'s mental health',
          excerpt: 'Latest scientific studies and findings regarding children\'s mental health and wellbeing.',
          readTime: '6 min read',
          category: 'Research',
          image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://pubmed.ncbi.nlm.nih.gov/38748300/?utm_source='
        }
      ]
    },
    fr: {
      title: 'Articles & Conseils',
      subtitle: 'Informations Utiles pour les Parents',
      description: 'Découvrez des conseils utiles et des informations pour soutenir la santé mentale de votre enfant.',
      readMore: 'Lire Plus',
      articles: [
        {
          title: 'Les enfants éprouvent des difficultés de bien-être après la pandémie',
          excerpt: 'La Grèce se trouve en dehors du top 20 des pays pour le bonheur des enfants selon le rapport UNICEF 2025.',
          readTime: '5 min de lecture',
          category: 'Santé Mentale',
          image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://neoskosmos.com/en/2025/08/08/news/greece/greek-children-struggle-with-wellbeing-post-pandemic-unicef-report-says/?utm_source'
        },
        {
          title: 'Pourquoi les mamans ne se sentent jamais assez: La pression psychologique d\'être "la maman parfaite"',
          excerpt: 'La pression psychologique que subissent les mères pour être "parfaites" chaque jour et comment y faire face.',
          readTime: '7 min de lecture',
          category: 'Parentalité',
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://www.themamagers.gr/family/500293/giati-oi-mamades-den-niothoun-pote-arketes-i-psuxologiki-piesi-na-eisai-i-teleia-mama-kathe-mera?utm_source=chatgpt.com'
        },
        {
          title: 'Recherche scientifique sur la santé mentale des enfants',
          excerpt: 'Dernières études scientifiques et découvertes concernant la santé mentale et le bien-être des enfants.',
          readTime: '6 min de lecture',
          category: 'Recherche',
          image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          url: 'https://pubmed.ncbi.nlm.nih.gov/38748300/?utm_source='
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
          <h2 className="text-4xl font-bold mb-6 font-poppins">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300">
              {content[language].title}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-nunito">
            {content[language].description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {content[language].articles.map((article, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
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
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium font-quicksand">
                    {article.category}
                  </span>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-4 right-4 bg-purple-600 p-2 rounded-lg shadow-lg"
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
                    onClick={() => window.open(article.url, '_blank')}
                    className="inline-flex items-center text-red-500 hover:text-red-600 font-medium text-sm transition-colors font-poppins cursor-pointer"
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