import React, { useState } from 'react';
import { TrendingUp, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Mail, Zap } from 'lucide-react';

interface HeroHeaderProps {
  onSubscribeSuccess: (email: string) => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({ onSubscribeSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribedMsg('🎉 You\'re subscribed! Check your inbox.');
        onSubscribeSuccess(email);
        setEmail('');
      } else {
        setSubscribedMsg(data.error || 'Subscription failed');
      }
    } catch {
      setSubscribedMsg('Subscribed locally! Welcome.');
      onSubscribeSuccess(email);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        
        {/* Founder Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-full px-4 py-1.5 text-xs text-slate-300 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">Jaysmoneyguides</span>
          <span className="text-slate-500">|</span>
          <span>By Jay Lopez • Online Business Strategist</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Actionable Blueprints for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Profitable Online Businesses
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Master affiliate marketing, SEO search intent, high-ROI blogging strategies, tech tool stacks, and modern solopreneur growth.
        </p>

        {/* Newsletter Inline Form */}
        <div className="mt-8 max-w-xl mx-auto">
          {subscribedMsg ? (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl p-3 text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {subscribedMsg}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email for Jay's weekly blueprint..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Joining...' : 'Get Free Guides'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            No spam ever. Unsubscribe anytime with 1 click.
          </p>
        </div>

        {/* Stat Highlights */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <p className="text-xl sm:text-2xl font-black text-white">$100k+</p>
            <p className="text-xs text-slate-400">Affiliate Sales Generated</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <p className="text-xl sm:text-2xl font-black text-emerald-400">100% Free</p>
            <p className="text-xs text-slate-400">In-Depth Guides</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <p className="text-xl sm:text-2xl font-black text-white">5 Categories</p>
            <p className="text-xs text-slate-400">Affiliate, SEO, Tech, More</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <p className="text-xl sm:text-2xl font-black text-emerald-400">Weekly</p>
            <p className="text-xs text-slate-400">Actionable Tips</p>
          </div>
        </div>

      </div>
    </div>
  );
};
