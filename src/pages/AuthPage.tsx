import React, { useState } from 'react';
import { Recycle, ArrowRight, ShieldCheck, Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, t } from '../i18n';
import { Language, UserRole } from '../types';

export const AuthPage: React.FC<{ mode: 'signin' | 'signup' }> = ({ mode }) => {
  const { signin, signup, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { currentLanguage, setLanguage } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'seller' | 'buyer' | 'both'>('both');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  if (user) {
    window.location.hash = '#/';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === 'signup') {
      if (password.length < 8) {
        showError('That password is too short.', 'Use at least 8 characters.');
        setSubmitting(false);
        return;
      }

      const res = await signup({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim() || undefined,
        role,
        language: currentLanguage
      });

      if (res.success) {
        showSuccess(
          res.isFirstUserAdmin
            ? 'Account created! As the first user, you have been designated Administrator.'
            : 'Welcome to BuildLoop AI! Account created.'
        );
        window.location.hash = '#/';
      } else {
        showError(res.error || 'Sign up failed.', 'Check details and try again.');
      }
    } else {
      const res = await signin(email.trim(), password);
      if (res.success) {
        showSuccess('Signed in successfully.');
        window.location.hash = '#/';
      } else {
        showError(res.error || 'Sign in failed.', 'Verify your email and password.');
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Recycle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
          {mode === 'signup' ? t("Sign Up") : t("Sign In")}
        </h1>
        <p className="text-xs text-stone-500">
          {mode === 'signup'
            ? 'Join the Hyderabad C&D Circular Reuse Network.'
            : 'Access your batches, demands, and escrow orders.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {mode === 'signup' && (
          <>
            <div>
              <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Full Name or Enterprise Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy (Deccan Salvage)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Mobile Number (Hyderabad)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98490 12345"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Primary Participation Role *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition ${
                    role === 'seller'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {t("Seller")}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition ${
                    role === 'buyer'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {t("Buyer")}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('both')}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition ${
                    role === 'both'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {t("Both")}
                </button>
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {mode === 'signup' && (
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Must be at least 8 characters.
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
        >
          {submitting ? 'Please wait…' : mode === 'signup' ? t("Sign Up") : t("Sign In")}
        </button>
      </form>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
        <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-medium">OR CONTINUE WITH</span>
        <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
      </div>

      <button
        type="button"
        onClick={async () => {
          setSubmitting(true);
          const { signInWithGoogle } = useAuth as any;
          // Trigger Google Auth
          try {
            const { googleSignIn } = await import('../lib/firebase');
            const res = await googleSignIn();
            if (res) {
              showSuccess('Google Authentication successful! Workspace services connected.');
              window.location.hash = '#/';
              window.location.reload();
            }
          } catch (err: any) {
            showError('Google sign in error', err.message || 'Could not complete Google authentication.');
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={submitting}
        className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700/60 font-semibold text-xs text-stone-700 dark:text-stone-200 shadow-sm flex items-center justify-center gap-3 transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        </svg>
        <span>Sign in with Google</span>
      </button>

      <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500">
        {mode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <a href="#/signin" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              {t("Sign In")}
            </a>
          </p>
        ) : (
          <p>
            Don't have an account yet?{' '}
            <a href="#/signup" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              {t("Sign Up")}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, signout } = useAuth();
  const { showSuccess, showError } = useToast();
  const { currentLanguage, setLanguage } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [lang, setLang] = useState<Language>(user?.language || currentLanguage);
  const [saving, setSaving] = useState(false);

  if (!user) {
    window.location.hash = '#/signin';
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({ name, phone, language: lang });
    setSaving(false);
    if (res.success) {
      setLanguage(lang);
      showSuccess('Profile updated successfully.');
    } else {
      showError(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {t("My Profile")}
          </h1>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>
        <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-stone-100 dark:bg-stone-800 text-emerald-600">
          {user.role}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
            Contact Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
            Preferred Language
          </label>
          <select
            value={lang}
            onChange={e => setLang(e.target.value as Language)}
            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={signout}
            className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold"
          >
            {t("Sign Out")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
          >
            {saving ? 'Saving…' : t("Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
};
