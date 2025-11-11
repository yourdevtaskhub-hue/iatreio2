import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { Eye, EyeOff, Mail, CheckCircle, Phone, KeyRound, ClipboardCopy, ClipboardCheck } from 'lucide-react';

interface AuthProps {
  language?: 'gr' | 'en' | 'fr';
}

const Auth: React.FC<AuthProps> = ({ language = 'gr' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      forgotCta: 'Ξεχάσατε τον κωδικό;',
      forgotTitle: 'Επαναφορά Κωδικού Πρόσβασης',
      forgotIntro: 'Συμπληρώστε το email και το τηλέφωνο που έχετε δηλώσει για να δημιουργήσουμε έναν προσωρινό κωδικό σύνδεσης.',
      forgotEmailLabel: 'Email λογαριασμού',
      forgotPhoneLabel: 'Τηλέφωνο που έχετε καταχωρήσει',
      forgotSubmit: 'Λήψη προσωρινού κωδικού',
      forgotStepsTitle: 'Πώς θα χρησιμοποιήσετε τον προσωρινό κωδικό;',
      forgotStep1: '1. Αντιγράψτε τον κωδικό και επιστρέψτε στην φόρμα σύνδεσης.',
      forgotStep2: '2. Συνδεθείτε με το email σας και τον προσωρινό κωδικό.',
      forgotStep3: '3. Μέσα από τον λογαριασμό σας αλλάξτε τον κωδικό σε έναν νέο, προσωπικό κωδικό.',
      forgotSuccess: 'Παρακάτω θα βρείτε τον προσωρινό κωδικό σύνδεσης μίας χρήσης. Είναι έγκυρος μέχρι να τον χρησιμοποιήσετε ή να ζητήσετε νέο.',
      copy: 'Αντιγραφή',
      copied: 'Αντιγράφηκε!',
      backToLogin: 'Επιστροφή στη σύνδεση',
      forgotNoMatch: 'Τα στοιχεία δεν ταιριάζουν με κάποιον λογαριασμό.',
      forgotPhoneMissing: 'Δεν έχει καταχωρηθεί τηλέφωνο για αυτόν τον λογαριασμό. Επικοινωνήστε με την υποστήριξη.',
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
      forgotCta: 'Forgot password?',
      forgotTitle: 'Reset Password',
      forgotIntro: 'Enter the email and phone number linked to your account to generate a one-time sign-in code.',
      forgotEmailLabel: 'Account email',
      forgotPhoneLabel: 'Registered phone number',
      forgotSubmit: 'Get one-time code',
      forgotStepsTitle: 'How to use the temporary code:',
      forgotStep1: '1. Copy the code and return to the login form.',
      forgotStep2: '2. Sign in with your email and the temporary code.',
      forgotStep3: '3. Inside your account set a brand-new password immediately.',
      forgotSuccess: 'Here is your one-time sign-in code. It stays valid until you use it or request a new one.',
      copy: 'Copy',
      copied: 'Copied!',
      backToLogin: 'Back to login',
      forgotNoMatch: 'No account matches the details provided.',
      forgotPhoneMissing: 'No phone number is saved for this account. Please contact support.',
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
      forgotCta: 'Mot de passe oublié ?',
      forgotTitle: 'Réinitialiser le mot de passe',
      forgotIntro: 'Saisissez l’e-mail et le téléphone associés à votre compte pour générer un code de connexion unique.',
      forgotEmailLabel: 'Email du compte',
      forgotPhoneLabel: 'Téléphone enregistré',
      forgotSubmit: 'Obtenir le code unique',
      forgotStepsTitle: 'Comment utiliser le code temporaire :',
      forgotStep1: '1. Copiez le code puis retournez au formulaire de connexion.',
      forgotStep2: '2. Connectez-vous avec votre email et ce code temporaire.',
      forgotStep3: '3. Depuis votre compte définissez immédiatement un nouveau mot de passe.',
      forgotSuccess: 'Voici votre code de connexion à usage unique. Il reste valide jusqu’à son utilisation ou jusqu’à ce que vous en demandiez un nouveau.',
      copy: 'Copier',
      copied: 'Copié !',
      backToLogin: 'Retour à la connexion',
      forgotNoMatch: 'Aucun compte ne correspond aux informations fournies.',
      forgotPhoneMissing: 'Aucun numéro de téléphone n’est enregistré pour ce compte. Veuillez contacter le support.',
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

  const normalizePhone = (value: string) =>
    value.replace(/[^0-9+]/g, '').replace(/^00/, '+');

  const generateOneTimePassword = () => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += charset[Math.floor(Math.random() * charset.length)];
    }
    return code;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setForgotOtp(null);
    setCopied(false);
    try {
      const normalizedEmail = forgotEmail.trim().toLowerCase();
      const { data: userList, error: adminError } = await supabaseAdmin.auth.admin.listUsers({
        email: normalizedEmail,
        perPage: 1
      });
      if (adminError) throw adminError;
      const user = userList?.users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
      if (!user) {
        throw new Error(t.forgotNoMatch);
      }
      const storedPhone = user.user_metadata?.phone || user.user_metadata?.phoneNumber || user.user_metadata?.telephone;
      if (!storedPhone) {
        throw new Error(t.forgotPhoneMissing);
      }
      if (normalizePhone(storedPhone) !== normalizePhone(forgotPhone)) {
        throw new Error(t.forgotNoMatch);
      }
      const otp = generateOneTimePassword();
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: otp });
      if (updateError) throw updateError;
      setForgotOtp(otp);
      setMessage(t.forgotSuccess);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = async () => {
    if (!forgotOtp) return;
    try {
      await navigator.clipboard.writeText(forgotOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleModeChange = (nextMode: 'login' | 'register' | 'forgot') => {
    setMode(nextMode);
    setLoading(false);
    setMessage(null);
    setError(null);
    if (nextMode !== 'forgot') {
      setForgotOtp(null);
      setForgotEmail('');
      setForgotPhone('');
      setCopied(false);
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
              {mode === 'login' ? t.titleLogin : mode === 'register' ? t.titleRegister : t.forgotTitle}
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
              <div className="flex justify-between text-sm font-nunito">
                <button
                  type="button"
                  onClick={() => {
                    handleModeChange('forgot');
                    setForgotEmail(email);
                    setForgotPhone('');
                  }}
                  className="text-purple-600 hover:underline"
                >
                  {t.forgotCta}
                </button>
              </div>
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
          ) : mode === 'register' ? (
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
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600 font-nunito leading-relaxed">
                {t.forgotIntro}
              </p>
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.forgotEmailLabel}</label>
                <div className="relative">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 font-nunito">{t.forgotPhoneLabel}</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    required
                    className="w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
              {message && forgotOtp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 via-white to-rose-50 border-2 border-purple-200 text-purple-900 px-5 py-4 rounded-2xl shadow-lg space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-6 w-6 text-purple-600" />
                    <p className="text-sm font-nunito leading-relaxed">{message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={forgotOtp}
                      className="flex-1 border border-purple-300 bg-white/80 rounded-xl px-3 py-2 font-mono text-lg tracking-widest text-purple-800"
                    />
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      {copied ? <ClipboardCheck className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                      {copied ? t.copied : t.copy}
                    </button>
                  </div>
                  <div className="bg-white border border-purple-100 rounded-xl px-4 py-3 text-sm text-purple-700 space-y-1">
                    <p className="font-semibold">{t.forgotStepsTitle}</p>
                    <p>{t.forgotStep1}</p>
                    <p>{t.forgotStep2}</p>
                    <p>{t.forgotStep3}</p>
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
                {loading ? '...' : t.forgotSubmit}
              </motion.button>
            </form>
          )}

          <div className="mt-6 text-sm">
            {mode === 'login' ? (
              <div className="font-nunito flex items-center justify-center gap-2">
                <span className="text-gray-600">{t.noAccount}</span>
                <button onClick={() => handleModeChange('register')} className="text-purple-600 hover:underline font-medium">
                  {t.goRegister}
                </button>
              </div>
            ) : mode === 'register' ? (
              <div className="font-nunito flex items-center justify-center gap-2">
                <span className="text-gray-600">{t.haveAccount}</span>
                <button onClick={() => handleModeChange('login')} className="text-purple-600 hover:underline font-medium">
                  {t.goLogin}
                </button>
              </div>
            ) : (
              <div className="font-nunito flex items-center justify-center gap-2">
                <button onClick={() => handleModeChange('login')} className="text-purple-600 hover:underline font-medium">
                  {t.backToLogin}
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


