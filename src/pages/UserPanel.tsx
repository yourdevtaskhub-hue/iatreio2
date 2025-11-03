import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { User, Mail, Phone, Calendar, LogOut, Heart, Shield, Camera, Key, Trash2, X, CreditCard, Sparkles, Gift, Clock, CheckCircle2, Wallet, Coins, ArrowRight, Star } from 'lucide-react';
import Contact from '../components/Contact';
import ReviewForm from '../components/ReviewForm';
import { getDoctorPrice } from '../lib/stripe-api';
import { createRealStripeCheckout } from '../lib/stripe-checkout';

const UserPanel: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false); // reserved for future UI state (spinner on avatar)
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPackagesModalOpen, setIsPackagesModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorIdPkg, setSelectedDoctorIdPkg] = useState<string>('');
  const [selectedDoctorNamePkg, setSelectedDoctorNamePkg] = useState<string>('');
  const [pricePerSessionCents, setPricePerSessionCents] = useState<number | null>(null);
  const [sessionsCount, setSessionsCount] = useState<number>(5);
  const [payLoading, setPayLoading] = useState<boolean>(false);
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          window.location.href = '/auth';
          return;
        }

        const currentUser = session.user;
        setUser(currentUser);
        setEmail(currentUser.email || '');
        setFullName(currentUser.user_metadata?.full_name || '');
        setPhone(currentUser.user_metadata?.phone || '');

        // Προσπάθεια να φορτώσουμε ή να δημιουργήσουμε το προφίλ από τον πίνακα customers
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (customerData) {
          if (customerData.full_name) setFullName(customerData.full_name);
          if (customerData.phone) setPhone(customerData.phone);
          if (customerData.avatar_url) setAvatarUrl(customerData.avatar_url);
        } else {
          // Αν δεν υπάρχει προφίλ, δημιούργησε ένα με τα στοιχεία από τα metadata
          const nameFromMeta = currentUser.user_metadata?.full_name || '';
          const phoneFromMeta = currentUser.user_metadata?.phone || '';
          if (nameFromMeta || phoneFromMeta) {
            try {
              await supabase
                .from('customers')
                .upsert({
                  user_id: currentUser.id,
                  full_name: nameFromMeta || null,
                  phone: phoneFromMeta || null,
                });
              if (nameFromMeta) setFullName(nameFromMeta);
              if (phoneFromMeta) setPhone(phoneFromMeta);
            } catch (error) {
              console.error('Error creating customer profile:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        window.location.href = '/auth';
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Φόρτωση γιατρών για προπληρωμένες συνεδρίες
  useEffect(() => {
    const loadDoctors = async () => {
      const { data } = await supabase.from('doctors').select('*').eq('active', true).order('name');
      setDoctors(data || []);
      if (data && data.length > 0) {
        setSelectedDoctorIdPkg(data[0].id);
        setSelectedDoctorNamePkg(data[0].name);
      }
    };
    loadDoctors();
  }, []);

  // Φόρτωση τιμής ανά συνεδρία όταν αλλάζει ο γιατρός
  useEffect(() => {
    const fetchPrice = async () => {
      if (!selectedDoctorIdPkg) { setPricePerSessionCents(null); return; }
      try {
        const price = await getDoctorPrice(selectedDoctorIdPkg);
        setPricePerSessionCents(price);
        const name = doctors.find(d=> d.id===selectedDoctorIdPkg)?.name || '';
        setSelectedDoctorNamePkg(name);
      } catch {
        setPricePerSessionCents(null);
      }
    };
    fetchPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorIdPkg]);

  const totalAmountCents = pricePerSessionCents ? pricePerSessionCents * (sessionsCount || 0) : 0;

  const handlePurchaseDeposits = async () => {
    if (!user || !selectedDoctorIdPkg || !pricePerSessionCents || sessionsCount <= 0) return;
    setPayLoading(true);
    
    console.log('🔍 [DEBUG] === USERPANEL: Purchase Deposits ===');
    console.log('🔍 [DEBUG] sessionsCount:', sessionsCount, 'type:', typeof sessionsCount);
    console.log('🔍 [DEBUG] totalAmountCents:', totalAmountCents);
    console.log('🔍 [DEBUG] pricePerSessionCents:', pricePerSessionCents);
    console.log('🔍 [DEBUG] calculated sessions:', totalAmountCents / pricePerSessionCents);
    
    try {
      const checkoutData = {
        doctorId: selectedDoctorIdPkg,
        doctorName: selectedDoctorNamePkg,
        parentName: fullName || (email ? email.split('@')[0] : ''),
        parentEmail: email,
        appointmentDate: '', // deposit purchase
        appointmentTime: '', // deposit purchase
        concerns: `DEPOSIT_PURCHASE sessions=${sessionsCount}`,
        amountCents: totalAmountCents,
        sessionsCount: sessionsCount // Pass sessions count explicitly
      };
      
      console.log('🔍 [DEBUG] checkoutData.sessionsCount:', checkoutData.sessionsCount, 'type:', typeof checkoutData.sessionsCount);
      console.log('🔍 [DEBUG] Full checkout data:', JSON.stringify(checkoutData, null, 2));
      
      await createRealStripeCheckout(checkoutData);
    } catch (e) {
      console.error(e);
    } finally {
      setPayLoading(false);
    }
  };

  // Φέρνει τα deposits του χρήστη
  useEffect(() => {
    const fetchDeposits = async () => {
      if (!email) return;
      const { data } = await supabase
        .from('session_deposits')
        .select('doctor_id, remaining_sessions, doctors(name)')
        .eq('customer_email', email);
      setDeposits(data || []);
    };
    fetchDeposits();
  }, [email]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!user) return;
    try {
      setUploading(true);
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);
      // Εγγραφή μόνιμα στο προφίλ (upsert με onConflict στον user_id για αποφυγή διπλών σειρών)
      const { error: upsertErr } = await supabase
        .from('customers')
        .upsert({ user_id: user.id, avatar_url: publicUrl }, { onConflict: 'user_id' });
      if (upsertErr) {
        // Fallback σε update αν το upsert δεν υποστηρίζει onConflict στον provider
        await supabase.from('customers').update({ avatar_url: publicUrl }).eq('user_id', user.id);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleChangePassword = async () => {
    setPwError(null);
    setPwSuccess(null);
    if (!newPassword || newPassword.length < 8) {
      setPwError('Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Ο νέος κωδικός και η επιβεβαίωση δεν ταιριάζουν.');
      return;
    }
    try {
      setPwLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwSuccess('Ο κωδικός αλλάχθηκε με επιτυχία.');
      setNewPassword('');
      setConfirmPassword('');
      setIsPwModalOpen(false);
    } catch (e: any) {
      setPwError(e?.message || 'Αποτυχία αλλαγής κωδικού.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (!user?.id) return;
    try {
      setDeleteLoading(true);
      await supabase.from('customers').delete().eq('user_id', user.id);
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e: any) {
      setDeleteError(e?.message || 'Η διαγραφή απέτυχε.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (fullName) return fullName;
    // Προτιμάμε να μην εμφανίζουμε γενική λέξη. Αν δεν υπάρχει όνομα, χρησιμοποιούμε προσωρινά prefix email.
    if (email) return email.split('@')[0];
    return '';
  };

  // Υπολογίζουμε δυναμικά τον χαιρετισμό με βάση το τρέχον όνομα
  const displayName = getUserDisplayName();
  const greeting = displayName
    ? `Καλώς ορίσατε στο ιατρείο μας, ${displayName}!`
    : 'Καλώς ορίσατε στο ιατρείο μας!';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-soft via-purple-soft to-blue-200 py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white p-3 rounded-full shadow-lg"
              >
                <Heart className="h-8 w-8 text-rose-soft" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white font-poppins">
                  {greeting}
                </h1>
                <p className="text-white/90 text-sm font-nunito">
                  Διαδικτυακό Ιατρείο Dr. Anna-Maria Fytrou
                </p>
              </div>
            </div>
  
  {/* Change Password Modal */}
  {isPwModalOpen && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-poppins">Αλλαγή κωδικού</h3>
          <button onClick={() => setIsPwModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1 font-nunito">Νέος κωδικός</label>
            <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-nunito">Επιβεβαίωση νέου κωδικού</label>
            <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
          </div>
          {pwError && <div className="text-red-600 text-sm">{pwError}</div>}
          {pwSuccess && <div className="text-green-600 text-sm">{pwSuccess}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsPwModalOpen(false)} className="px-4 py-2 rounded-xl border">Άκυρο</button>
            <button disabled={pwLoading} onClick={handleChangePassword} className="px-4 py-2 rounded-xl bg-purple-600 text-white">
              {pwLoading ? 'Αποθήκευση…' : 'Αποθήκευση'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Delete Account Modal */}
  {isDeleteModalOpen && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-poppins text-red-600">Διαγραφή λογαριασμού</h3>
          <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-700 font-nunito mb-4">Η ενέργεια είναι μη αναστρέψιμη. Θα διαγραφεί ο λογαριασμός σας και τα στοιχεία προφίλ. Είσαι σίγουρος/η;</p>
        {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-xl border">Άκυρο</button>
          <button disabled={deleteLoading} onClick={handleDeleteAccount} className="px-4 py-2 rounded-xl bg-red-600 text-white">
            {deleteLoading ? 'Διαγραφή…' : 'Διαγραφή'}
          </button>
        </div>
      </div>
    </div>
  )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors font-nunito"
            >
              <LogOut className="h-5 w-5" />
              <span>Αποσύνδεση</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow" />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="h-24 w-24 flex items-center justify-center bg-gradient-to-r from-rose-soft to-purple-soft rounded-full shadow"
                    >
                      <User className="h-12 w-12 text-white" />
                    </motion.div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/60 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-50" title="Ανέβασμα/Λήψη εικόνας">
                    {/* Σε κινητό το capture ανοίγει την κάμερα, σε desktop ανοίγει file picker */}
                    <input type="file" accept="image/*" capture="user" onChange={handleAvatarChange} className="hidden" />
                    <Camera className="h-4 w-4 text-gray-700" />
                  </label>
                </div>
                <h2 className="text-xl font-bold font-poppins mb-2">
                  {fullName || 'Χρήστης'}
                </h2>
                <p className="text-gray-500 text-sm font-nunito">{email}</p>
              </div>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                >
                  <Mail className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-nunito">Email</p>
                    <p className="text-sm font-medium font-nunito">{email}</p>
                  </div>
                </motion.div>

                {phone && (
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-nunito">Τηλέφωνο</p>
                      <p className="text-sm font-medium font-nunito">{phone}</p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                >
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-nunito">Κατάσταση</p>
                    <p className="text-sm font-medium text-green-600 font-nunito">Επαληθευμένος</p>
                  </div>
                </motion.div>

                <div className="pt-2 grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setIsPwModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-soft to-purple-soft text-white px-4 py-2 rounded-xl shadow hover:opacity-95"
                  >
                    <Key className="h-4 w-4" />
                    Αλλαγή κωδικού
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl shadow hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Διαγραφή λογαριασμού
                  </button>
                </div>
              </div>
            </div>

            {/* Deposit Widget (κάθετα κάτω από τα στοιχεία χρήστη) */}
            <div className="mt-4 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl shadow-xl p-5 border border-purple-100/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 text-white shadow-lg">
                  <Gift className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold font-poppins text-gray-800">Deposit Συνεδριών</h3>
              </div>

              {(() => {
                const totalRemaining = (deposits || []).reduce((sum:number, d:any) => sum + (Number(d?.remaining_sessions) || 0), 0);
                return (
                  <>
                    {/* Total pill */}
                    <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl px-4 py-2 mb-3">
                      <div className="flex items-center gap-2 text-gray-700 font-nunito">
                        <Coins className="h-4 w-4 text-purple-600" />
                        <span>Συνολικά διαθέσιμες συνεδρίες</span>
                      </div>
                      <span className="text-purple-700 font-poppins font-extrabold">{totalRemaining}</span>
                    </div>

                    {/* List per doctor or empty state */}
                    {deposits && deposits.length > 0 ? (
                      <div className="space-y-2">
                        {deposits.map((d:any, idx:number) => (
                          <div key={idx} className="flex items-center justify-between bg-white/70 border border-purple-100 rounded-xl px-3 py-2">
                            <span className="text-sm text-gray-700 font-nunito">{d.doctors?.name || 'Γιατρός'}</span>
                            <span className="text-sm font-poppins text-purple-700 font-semibold">{d.remaining_sessions}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 font-nunito bg-white/70 border border-purple-100 rounded-xl px-3 py-3">
                        Δεν έχετε ακόμη προπληρωμένες συνεδρίες. Μπορείτε να τις αγοράσετε από την επιλογή «Προπληρωμένες Συνεδρίες». 
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>

          {/* Dashboard Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-rose-soft to-purple-soft rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4 font-poppins">
                Καλώς ήρθες στο Ιατρείο μας! 🏥
              </h3>
              <p className="text-white/90 leading-relaxed font-nunito mb-4">
                Είμαστε εδώ για να σε υποστηρίξουμε σε κάθε βήμα του ταξιδιού σου προς την καλύτερη ψυχική υγεία. 
                Χρησιμοποίησε το dashboard αυτό για να διαχειριστείς τα ραντεβού σου και να έχεις πρόσβαση στις υπηρεσίες μας.
              </p>
              <div className="flex items-center space-x-2 mt-6">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-nunito">Η ομάδα μας είναι εδώ για εσένα</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsBookingModalOpen(true)}
                className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-lg p-7 text-left hover:shadow-xl transition-all group border-2 border-purple-200/50 hover:border-purple-400 min-h-[220px]"
              >
                {/* Subtle animated background */}
                <motion.div 
                  animate={{ 
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-rose-400/20 rounded-3xl"
                />
                
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-rose-500 text-white shadow-md"
                  >
                    <Calendar className="h-6 w-6" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-bold font-poppins text-xl text-gray-800">Κλείσε Μεμονωμένο Ραντεβού</h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-poppins tracking-wide font-semibold">ΝΕΟ</span>
                    </div>
                    
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                        <p className="text-sm font-nunito">Άμεση κράτηση μιας συνεδρίας</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
                        <p className="text-sm font-nunito">Επιλογή του ειδικού της επιλογής σου</p>
                      </div>
                    </div>
                    
                  <motion.div 
                    whileHover={{ x: 3 }}
                    className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-poppins font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                      <span>Άνοιγμα Φόρμας Κράτησης</span>
                      <motion.svg 
                        animate={{ x: [0, 3, 0] }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="h-3.5 w-3.5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </motion.svg>
                    </motion.div>
                  </div>
                </div>
                
                {/* Subtle shine effect on hover */}
                <motion.div
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsPackagesModalOpen(true)}
                className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-xl p-6 text-left hover:shadow-2xl transition-all group border-2 border-purple-200/50 hover:border-purple-400"
              >
                {/* Animated gradient background */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-rose-400/20 rounded-3xl"
                />
                
                {/* Sparkle effects */}
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute top-4 right-4 text-purple-400/40"
                >
                  <Sparkles className="h-8 w-8" />
                </motion.div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 text-white shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 blur-xl" />
                    <Gift className="h-7 w-7 relative z-10" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 bg-white/30 rounded-2xl"
                    />
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="font-bold font-poppins text-xl text-gray-800">Προπληρωμένες Συνεδρίες</h4>
                      <motion.span 
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-poppins tracking-wide font-bold shadow-md"
                      >
                        ⭐ ΜΟΝΑΔΙΚΟ
                      </motion.span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-nunito font-medium">Αγοράστε συνεδρίες εκ των προτέρων</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <p className="text-sm font-nunito font-medium">Εξαργυρώστε τις όποτε επιθυμείτε</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Gift className="h-4 w-4 text-pink-600 flex-shrink-0" />
                        <p className="text-sm font-nunito font-medium">Μεγιστοποιήστε την ευελιξία σας</p>
                      </div>
                    </div>
                    
                    <motion.div 
                      whileHover={{ x: 4 }}
                      className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-poppins font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                      <span>Αγορά Προπληρωμένων Συνεδριών</span>
                      <motion.svg 
                        animate={{ x: [0, 4, 0] }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="h-4 w-4" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </motion.svg>
                    </motion.div>
                  </div>
                </div>
                
                {/* Shine effect on hover */}
                <motion.div
                  initial={{ x: '-100%', skewX: -15 }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </motion.button>
            </div>

            {/* Information Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 font-poppins">Πληροφορίες Λογαριασμού</h3>
              <div className="space-y-3 font-nunito">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Μέλος από</span>
                  <span className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('el-GR') : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Τελευταία σύνδεση</span>
                  <span className="font-medium">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('el-GR') : 'Τώρα'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">ID Χρήστη</span>
                  <span className="font-medium text-xs text-gray-500">{user?.id?.substring(0, 8)}...</span>
                </div>
              </div>
            </div>

            {/* Deposits Section μετακινήθηκε στην αριστερή στήλη */}

            {/* Review Form (μόνο η φόρμα) */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <ReviewForm language={'gr'} defaultName={fullName || (email ? email.split('@')[0] : '')} />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Booking Modal with Contact Form */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsBookingModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto" onClick={(e)=> e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold font-poppins">Στείλτε ένα Μήνυμα</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 sm:p-4">
              <Contact 
                language={'gr'} 
                onlyForm
                prefill={{
                  parentName: fullName || (email ? email.split('@')[0] : ''),
                  email: email || '',
                  phone: phone || ''
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Packages (Deposits) Modal */}
      {isPackagesModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsPackagesModalOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto border-2 border-purple-200/50" 
            onClick={(e)=> e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-t-3xl p-6 overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"
              />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl"
                  >
                    <Wallet className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold font-poppins text-white">Προπληρωμένες Συνεδρίες</h3>
                    <p className="text-white/90 text-sm font-nunito mt-1">Δημιουργήστε Deposit για Μελλοντική Εξαργύρωση</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPackagesModalOpen(false)} 
                  className="text-white/90 hover:text-white bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Benefits Highlight */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200/50">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl text-white shrink-0"
                  >
                    <Star className="h-5 w-5" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-bold font-poppins text-gray-800 mb-2">Γιατί Προπληρωμένες Συνεδρίες;</h4>
                    <div className="space-y-2 text-sm font-nunito text-gray-700">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>Αγοράστε <strong>όσες συνεδρίες</strong> θέλετε</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-pink-600 flex-shrink-0" />
                        <span>Πιστώνονται <strong>αυτόματα στο deposit</strong> του λογαριασμού σας</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-rose-600 flex-shrink-0" />
                        <span>Εξαργυρώστε τις <strong>όποτε επιθυμείτε</strong> μελλοντικά</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 font-poppins text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    Γιατρός
                  </label>
                  <select 
                    value={selectedDoctorIdPkg} 
                    onChange={(e)=> setSelectedDoctorIdPkg(e.target.value)} 
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-nunito bg-white"
                  >
                    {doctors.map((d:any)=> (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 font-poppins text-gray-700 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-pink-600" />
                    Τιμή ανά συνεδρία
                  </label>
                  <div className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 font-semibold text-gray-800 font-nunito">
                    {pricePerSessionCents? `€${(pricePerSessionCents/100).toFixed(2)}`: '-'}
                  </div>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 font-poppins text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-rose-600" />
                    Πλήθος συνεδριών
                  </label>
                  <input 
                    type="number" 
                    min={1} 
                    value={sessionsCount} 
                    onChange={(e)=> setSessionsCount(Math.max(1, Number(e.target.value)))} 
                    className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-nunito bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 font-poppins text-gray-700 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-purple-600" />
                    Συνολικό Deposit
                  </label>
                  <div className="w-full border-2 border-purple-400 rounded-xl px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg font-poppins shadow-lg">
                    €{(totalAmountCents/100).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-nunito text-gray-700 leading-relaxed">
                    <strong className="text-blue-800">Σημαντικό:</strong> Οι προπληρωμένες συνεδρίες που αγοράζετε <strong>πιστώνονται αυτόματα στο deposit</strong> του λογαριασμού σας και μπορείτε να τις εξαργυρώσετε οποτεδήποτε στο μέλλον, βάσει διαθεσιμότητας, αποκλειστικά με τον επιλεγμένο γιατρό.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button 
                disabled={!selectedDoctorIdPkg || !pricePerSessionCents || payLoading} 
                onClick={handlePurchaseDeposits}
                whileHover={{ scale: payLoading || !selectedDoctorIdPkg || !pricePerSessionCents ? 1 : 1.02, y: payLoading || !selectedDoctorIdPkg || !pricePerSessionCents ? 0 : -2 }}
                whileTap={{ scale: payLoading || !selectedDoctorIdPkg || !pricePerSessionCents ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white py-4 rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed transition-all font-poppins font-bold text-lg relative overflow-hidden group"
              >
                {/* Shine effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"
                />
                {payLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="relative z-10">Μετάβαση στο Stripe…</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-6 w-6 relative z-10" />
                    <span className="relative z-10">Πληρωμή & Δημιουργία Deposit</span>
                    <ArrowRight className="h-5 w-5 relative z-10" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
