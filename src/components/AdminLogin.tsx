import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (isAuthenticated: boolean) => void;
  language: 'gr' | 'en';
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, language }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const content = {
    gr: {
      title: 'Ιατρείο Panel - Σύνδεση',
      subtitle: 'Εισάγετε τον κωδικό πρόσβασης για να συνεχίσετε',
      passwordLabel: 'Κωδικός Πρόσβασης',
      passwordPlaceholder: 'Εισάγετε τον κωδικό σας',
      loginButton: 'Σύνδεση',
      loggingIn: 'Σύνδεση...',
      errorMessage: 'Λάθος κωδικός πρόσβασης',
      showPassword: 'Εμφάνιση κωδικού',
      hidePassword: 'Απόκρυψη κωδικού'
    },
    en: {
      title: 'Ιατρείο Panel - Login',
      subtitle: 'Enter your password to continue',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      errorMessage: 'Incorrect password',
      showPassword: 'Show password',
      hidePassword: 'Hide password'
    }
  };

  // Admin και Doctor passwords
  const passwords = {
    admin: [
      'admin123',
      'iatrio2024',
      'psychology2024'
    ],
    doctors: {
      'eirini123@': 'eirini',
      'ioanna22!': 'ioanna', 
      'sofia12%': 'sofia'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if it's an admin password
    if (passwords.admin.includes(password)) {
      onLogin(true);
    } 
    // Check if it's a doctor password
    else if (passwords.doctors[password as keyof typeof passwords.doctors]) {
      const doctorType = passwords.doctors[password as keyof typeof passwords.doctors];
      // Redirect to the specific doctor panel
      window.location.href = `/${doctorType}`;
    } 
    else {
      setError(content[language].errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full w-fit mx-auto mb-6"
          >
            <Lock className="h-8 w-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
            {content[language].title}
          </h1>
          <p className="text-gray-600 font-nunito">
            {content[language].subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-poppins">
              {content[language].passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={content[language].passwordPlaceholder}
                className="w-full px-4 py-4 pr-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-nunito text-lg"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl font-nunito flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading || !password.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>{content[language].loggingIn}</span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                <span>{content[language].loginButton}</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
