import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  KeyRound,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types';
import { sanitizeInput, checkRateLimit, validatePasswordStrength, logSecurityEvent } from '../utils/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Google account picker simulation state
  const [showGooglePicker, setShowGooglePicker] = useState(false);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  };

  // Google Login Handler
  const handleGoogleAuth = (customEmail?: string, customName?: string, customAvatar?: string) => {
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      const gUser: User = {
        id: `usr_g_${Date.now()}`,
        name: customName || 'Jay Lopez',
        email: customEmail || 'jayisreallycool@gmail.com',
        avatar: customAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fm=webp&fit=crop&w=200&q=80',
        provider: 'google',
        createdAt: new Date().toISOString().split('T')[0],
        role: 'VIP Member',
        bio: 'Digital Creator & Solopreneur'
      };

      setIsLoading(false);
      setShowGooglePicker(false);
      onLoginSuccess(gUser);
      onClose();
    }, 600);
  };

  // Email/Password Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Rate Limit Check for Auth Attempts
    const rl = checkRateLimit('auth_attempt', 5, 60000);
    if (!rl.allowed) {
      const msg = `Security lockout: Too many failed auth attempts. Try again in ${rl.retryAfterSec}s.`;
      setError(msg);
      logSecurityEvent('RATE_LIMIT_BLOCKED', 'Brute-force authentication attempt blocked', `Email: ${email}`);
      return;
    }

    const cleanEmail = sanitizeInput(email.trim().toLowerCase());
    const cleanName = sanitizeInput(name.trim());

    if (mode === 'forgot') {
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg(`Password reset instructions have been sent to ${cleanEmail}`);
        logSecurityEvent('AUTH_SUCCESS', 'Password reset requested', `Email: ${cleanEmail}`);
      }, 800);
      return;
    }

    if (mode === 'register') {
      if (!cleanName) {
        setError('Please enter your full name.');
        return;
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      // Password strength check
      const pwdRating = validatePasswordStrength(password);
      if (!pwdRating.isStrong && password.length < 8) {
        setError('Password must be at least 8 characters long with numbers and letters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setError('You must agree to the Terms of Service and Privacy Policy.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
          provider: 'email',
          createdAt: new Date().toISOString().split('T')[0],
          role: 'Member'
        };
        setIsLoading(false);
        logSecurityEvent('AUTH_SUCCESS', 'New user registered securely', `User: ${cleanName} (${cleanEmail})`);
        onLoginSuccess(newUser);
        onClose();
      }, 800);
      return;
    }

    // Mode === 'login'
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Create or log in user
      const loggedInUser: User = {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        provider: 'email',
        createdAt: new Date().toISOString().split('T')[0],
        role: 'Member'
      };
      setIsLoading(false);
      logSecurityEvent('AUTH_SUCCESS', 'User logged in successfully', `Email: ${cleanEmail}`);
      onLoginSuccess(loggedInUser);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Header Bar */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-slate-800/60 to-transparent border-b border-slate-800/80">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Your Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' && 'Sign in to access saved guides, notes, and member perks'}
                {mode === 'register' && 'Join 10,000+ creators building scalable digital income'}
                {mode === 'forgot' && 'Enter your account email to receive a password reset link'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Error / Success Notifications */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Single Sign-On Option */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowGooglePicker(true)}
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-700/80 text-white font-bold py-3 px-4 rounded-xl border border-slate-700/80 transition-all flex items-center justify-center gap-3 shadow-md hover:border-slate-600 group active:scale-98"
              >
                {/* Official Colored Google G Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-sm">
                  {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                </span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-bold shrink-0">
                  Or with Email
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Register: Full Name */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jay Lopez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot')}
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password field for Register */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Checkboxes */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>
            )}

            {mode === 'register' && (
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 w-4 h-4 mt-0.5 shrink-0"
                />
                <span>
                  I agree to the <span className="text-emerald-400 font-semibold">Terms of Service</span> and{' '}
                  <span className="text-emerald-400 font-semibold">Privacy Policy</span>.
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In to Account'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Password Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset button */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setEmail('jayisreallycool@gmail.com');
                  setPassword('demo123456');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-emerald-400 py-1.5 flex items-center justify-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Auto-fill Demo Credentials
              </button>
            </div>
          )}

          {/* Forgot Password back to login */}
          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>

        {/* Google Account Selector Overlay Modal */}
        {showGooglePicker && (
          <div className="absolute inset-0 bg-slate-950/95 z-20 flex flex-col justify-between p-6 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-bold text-sm text-white">Sign in with Google</span>
                </div>
                <button 
                  onClick={() => setShowGooglePicker(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-300 font-medium mb-3">
                  Choose a Google account to continue to <span className="text-emerald-400 font-bold">JaysMoneyGuides</span>:
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleGoogleAuth('jayisreallycool@gmail.com', 'Jay Lopez')}
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl flex items-center justify-between transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fm=webp&fit=crop&w=200&q=80"
                        alt="Jay Lopez"
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
                      />
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          Jay Lopez
                        </p>
                        <p className="text-xs text-slate-400">jayisreallycool@gmail.com</p>
                      </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-400 opacity-80" />
                  </button>

                  <button
                    onClick={() => handleGoogleAuth('alex.creator@gmail.com', 'Alex Rivera', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fm=webp&fit=crop&w=200&q=80')}
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl flex items-center justify-between transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fm=webp&fit=crop&w=200&q=80"
                        alt="Alex Rivera"
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          Alex Rivera
                        </p>
                        <p className="text-xs text-slate-400">alex.creator@gmail.com</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-4">
              To continue, Google will share your name, email address, and profile picture with JaysMoneyGuides.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
