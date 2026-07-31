import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Gift, 
  ArrowRight,
  Clock,
  Zap
} from 'lucide-react';
import { sanitizeInput, checkRateLimit, logSecurityEvent } from '../utils/security';

interface NewsletterModalProps {
  onSubscribeSuccess: (email: string) => void;
}

export const NewsletterModal: React.FC<NewsletterModalProps> = ({ onSubscribeSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'time' | 'exit'>('time');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has already subscribed or dismissed within 7 days
    const isSubscribed = localStorage.getItem('jmg_newsletter_subscribed') === 'true';
    const lastDismissed = localStorage.getItem('jmg_newsletter_dismissed_at');
    
    if (isSubscribed) return;

    if (lastDismissed) {
      const elapsedDays = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (elapsedDays < 7) return; // Don't trigger if dismissed within last 7 days
    }

    let hasTriggered = false;

    // 1. Trigger after 30 seconds of user session / activity
    const timer = setTimeout(() => {
      if (!hasTriggered) {
        hasTriggered = true;
        setTriggerSource('time');
        setIsOpen(true);
      }
    }, 30000);

    // 2. Trigger on Exit Intent (mouse moves out of top viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !hasTriggered) {
        hasTriggered = true;
        setTriggerSource('exit');
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    // Store dismissal timestamp so we don't annoy the user for 7 days
    localStorage.setItem('jmg_newsletter_dismissed_at', Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = sanitizeInput(email.trim().toLowerCase());

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Security & Rate limiting check (max 3 submissions per minute)
    const rl = checkRateLimit('newsletter_modal', 3, 60000);
    if (!rl.allowed) {
      const msg = `Too many attempts. Please wait ${rl.retryAfterSec}s before trying again.`;
      setErrorMessage(msg);
      logSecurityEvent('RATE_LIMIT_BLOCKED', 'Newsletter popup submission throttled', `Email: ${cleanEmail}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (data.success) {
        logSecurityEvent('AUTH_SUCCESS', 'Newsletter subscriber via Popup Modal', `Email: ${cleanEmail}`);
      }
    } catch {
      // Fallback if offline / local mock
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      localStorage.setItem('jmg_newsletter_subscribed', 'true');
      onSubscribeSuccess(cleanEmail);

      // Automatically close modal after 2.5 seconds on success
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fadeIn overflow-y-auto">
      {/* Click backdrop to dismiss */}
      <div className="absolute inset-0" onClick={handleDismiss} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-emerald-950/40 p-5 sm:p-8 overflow-y-auto max-h-[90vh] my-auto z-10 transition-all scale-100 animate-slideUp">
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors border border-slate-700/50 z-20"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div className="space-y-6">
            {/* Header / Badge & Guide Cover */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-24 sm:w-28 shrink-0 rounded-xl overflow-hidden border border-emerald-500/30 shadow-xl shadow-emerald-950/40 hidden sm:block">
                <img 
                  src="/images/affiliate-marketing-guide-cover.webp" 
                  alt="Affiliate Marketing for Beginners Guide Cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/jaysmoneyguides-hero-banner.webp';
                  }}
                  width="112"
                  height="160"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
                  {triggerSource === 'exit' ? (
                    <>
                      <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Before You Go...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Free Affiliate & SEO Playbook</span>
                    </>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Accelerate Your Digital Revenue with VIP Insights
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Join <strong className="text-emerald-400">14,200+ smart marketers</strong> getting Jay’s weekly step-by-step affiliate breakdowns, high-ROI SEO blueprints, and proven monetization guides.
                </p>
              </div>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>High-ROI SEO:</strong> Proven strategies to boost organic traffic.</span>
              </div>
              <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Monetization:</strong> Top SaaS affiliate partner programs.</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-500/20 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <label htmlFor="newsletter-modal-email" className="sr-only">Email address</label>
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="newsletter-modal-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your best email address..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Access...</span>
                ) : (
                  <>
                    <span>Get Free Weekly Blueprints</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Trust & Dismiss Link */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Free. No spam. Unsubscribe anytime.</span>
              </div>

              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-200 underline underline-offset-2 text-left sm:text-right transition-colors"
              >
                No thanks, I'll pass
              </button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">You're On The VIP List!</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you for subscribing. We've registered <strong>{email}</strong> for Jay's next weekly issue. Check your inbox soon for your welcome gift!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl border border-slate-700 transition-colors"
              >
                Back to JaysMoneyGuides
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
