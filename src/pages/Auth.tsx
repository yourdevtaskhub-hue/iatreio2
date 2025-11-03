import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Mail, CheckCircle } from 'lucide-react';

interface AuthProps {
  language?: 'gr' | 'en' | 'fr';
}

const Auth: React.FC<AuthProps> = ({ language = 'gr' }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);

  const labels = {
    gr: {
      titleLogin: 'Σύνδεση',
      titleRegister: 'Δημιουργία Λογαριασμού',
      email: 'Email',
      password: 'Κωδικός',
      fullName: 'Ονοματεπώνυμο',
      phone: 'Τηλέφωνο',
      submitLogin: 'Σύνδεση',
      submitRegister: 'Εγγραφή',
      noAccount: 'Δεν έχετε λογαριασμό;',
      haveAccount: 'Έχετε ήδη λογαριασμό;',
      goRegister: 'Δημιουργήστε λογαριασμό',
      goLogin: 'Συνδεθείτε εδώ',
      backHome: 'Επιστροφή στην Αρχική',
    },
    en: {
      titleLogin: 'Login',
      titleRegister: 'Create Account',
      email: 'Email',
      password: 'Password',
      fullName: 'Full name',
      phone: 'Phone',
      submitLogin: 'Login',
      submitRegister: 'Register',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      goRegister: 'Create one',
      goLogin: 'Login here',
      backHome: 'Back to Home',
    },
    fr: {
      titleLogin: 'Connexion',
      titleRegister: 'Créer un compte',
      email: 'Email',
      password: 'Mot de passe',
      fullName: 'Nom complet',
      phone: 'Téléphone',
      submitLogin: 'Connexion',
      submitRegister: 'Créer',
      noAccount: "Pas de compte ?",
      haveAccount: 'Vous avez déjà un compte ?',
      goRegister: 'Créez-en un',
      goLogin: 'Connectez-vous ici',
      backHome: "Retour à l'accueil",
    },
  } as const;

  const t = labels[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      setMessage('✅');
      window.location.href = '/panel';
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/auth`
        },
      });
      if (signUpError) throw signUpError;
      // Αν απαιτείται επιβεβαίωση email, ο χρήστης θα χρειαστεί να επιβεβαιώσει πρώτα
      if (data.session) {
        window.location.href = '/panel';
      } else {
        setMessage(language === 'gr' ? 'Ελέγξτε το email σας για επιβεβαίωση.' : language === 'fr' ? 'Vérifiez votre e-mail pour confirmation.' : 'Check your email to confirm.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl p-8"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold font-poppins">
              {mode === 'login' ? t.titleLogin : t.titleRegister}
            </h1>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.password}</label>
                <div className="relative">
                  <input
                    type={showPasswordLogin ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <button
                    type="button"
                    aria-label={showPasswordLogin ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPasswordLogin(v => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPasswordLogin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
                >
                  <span className="text-red-600">⚠</span>
                  <span className="text-sm font-nunito">{error}</span>
                </motion.div>
              )}
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-nunito font-medium">{message}</span>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full bg-gradient-to-r from-rose-soft to-purple-soft text-white px-4 py-2 rounded-xl shadow-lg"
              >
                {loading ? '...' : t.submitLogin}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.phone}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.password}</label>
                <div className="relative">
                  <input
                    type={showPasswordRegister ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <button
                    type="button"
                    aria-label={showPasswordRegister ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPasswordRegister(v => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPasswordRegister ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
                >
                  <span className="text-red-600">⚠</span>
                  <span className="text-sm font-nunito">{error}</span>
                </motion.div>
              )}
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-300 text-blue-900 px-5 py-4 rounded-xl shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg font-poppins mb-1 text-blue-800">Ελέγξτε το email σας!</p>
                      <p className="text-sm font-nunito leading-relaxed text-blue-700">{message}</p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full bg-gradient-to-r from-rose-soft to-purple-soft text-white px-4 py-2 rounded-xl shadow-lg"
              >
                {loading ? '...' : t.submitRegister}
              </motion.button>
            </form>
          )}

          <div className="mt-6 text-sm">
            {mode === 'login' ? (
              <div className="font-nunito flex items-center justify-center gap-2">
                <span className="text-gray-600">{t.noAccount}</span>
                <button onClick={() => setMode('register')} className="text-purple-600 hover:underline font-medium">
                  {t.goRegister}
                </button>
              </div>
            ) : (
              <div className="font-nunito flex items-center justify-center gap-2">
                <span className="text-gray-600">{t.haveAccount}</span>
                <button onClick={() => setMode('login')} className="text-purple-600 hover:underline font-medium">
                  {t.goLogin}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <button onClick={() => { window.location.href = '/'; }} className="text-gray-500 hover:text-gray-700 text-sm font-nunito">
              ← {t.backHome}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;


