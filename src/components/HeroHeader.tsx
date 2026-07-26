import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TrendingUp, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Mail, DollarSign, Zap } from 'lucide-react';

interface HeroHeaderProps {
  onSubscribeSuccess: (email: string) => void;
  onSelectPost?: (postId: string) => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({ onSubscribeSuccess, onSelectPost }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Scroll Hooks tied to Hero Container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transformations for background layers
  const bannerY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const bannerScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const bannerOpacity = useTransform(scrollYProgress, [0, 0.8], [0.85, 0.3]);

  const ebookY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const ebookRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const ebookScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.25]);

  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

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
    <div 
      ref={containerRef}
      className="relative w-full min-h-[88vh] lg:min-h-[92vh] flex flex-col justify-center text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20 overflow-hidden bg-slate-950"
    >
      {/* Dynamic Parallax Background Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* eBook Cover Artwork Layer with Parallax & Glow */}
        <motion.div 
          style={{ y: ebookY, rotate: ebookRotate, scale: ebookScale }}
          className="absolute -right-12 md:right-4 lg:right-16 top-1/2 -translate-y-1/2 w-[520px] md:w-[720px] h-auto pointer-events-none z-0"
        >
          <img 
            src="/images/affiliate-marketing-guide-cover.webp" 
            alt="JaysMoneyGuides Affiliate Marketing Guide Artwork" 
            className="w-full h-auto object-cover opacity-60 filter brightness-115 contrast-110 drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            width="720"
            height="1000"
          />
        </motion.div>

        {/* Full-bleed Banner Base Layer with Parallax */}
        <motion.div 
          style={{ y: bannerY, scale: bannerScale, opacity: bannerOpacity }}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        >
          <img 
            src="/images/jays-hero-banner.webp" 
            alt="JaysMoneyGuides Hero Wallpaper" 
            className="w-full h-full object-cover object-center filter brightness-110 contrast-105"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            width="1200"
            height="675"
          />
        </motion.div>
      </div>

      {/* Animated Light Sweeps & Glowing Ambient Orbs */}
      <motion.div 
        style={{ y: glowY }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/40 to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-slate-950/35 to-slate-950/90" />
        
        {/* Pulsing Light Orbs */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/25 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-teal-400/20 rounded-full blur-[140px]"
        />

        {/* Floating Decorative Sparkle Particles */}
        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, 8, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-[12%] text-emerald-400/40 hidden sm:block"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 18, 0], x: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-[15%] text-emerald-300/30 hidden md:block"
        >
          <DollarSign className="w-10 h-10" />
        </motion.div>
      </motion.div>

      {/* Main Interactive Content Container */}
      <motion.div 
        style={{ y: contentY, opacity: contentOpacity }}
        className="max-w-6xl mx-auto text-center relative z-10 my-auto w-full"
      >
        
        {/* Founder Pill Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 bg-slate-900/90 border border-emerald-500/40 rounded-full px-4 py-1.5 text-xs text-slate-200 mb-6 shadow-xl shadow-emerald-950/60 backdrop-blur-md group hover:border-emerald-400 transition-colors"
        >
          <img 
            src="/images/jays-mascot-logo.webp" 
            alt="Jay Mascot" 
            className="w-5 h-5 rounded-full border border-emerald-400 object-cover object-top shrink-0 group-hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
          <span className="font-extrabold text-emerald-400 tracking-wide uppercase text-[11px]">Jaysmoneyguides</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-200 font-medium">By Jay Lopez • Online Business Strategist</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-xl relative"
        >
          Actionable Blueprints for <br className="hidden sm:inline" />
          <motion.span 
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{
              backgroundImage: 'linear-gradient(90deg, #34d399 0%, #a7f3d0 30%, #34d399 60%, #2dd4bf 100%)',
              backgroundSize: '200% 100%',
            }}
            className="bg-clip-text text-transparent drop-shadow-[0_4px_35px_rgba(16,185,129,0.5)] inline-block"
          >
            Profitable Online Businesses
          </motion.span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow"
        >
          Master high-ticket affiliate marketing, organic search intent, high-ROI blogging strategies, and modern online revenue engines.
        </motion.p>

        {/* Hero Spotlight Grid: eBook + Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-8 mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-stretch max-w-5xl mx-auto"
        >
          
          {/* Featured Master Guide Highlight Banner Card */}
          <div 
            onClick={() => onSelectPost?.('post-aff-master-guide')}
            className="lg:col-span-7 bg-slate-900/85 border border-slate-800/90 hover:border-emerald-500/70 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl shadow-slate-950/80 flex flex-col justify-between group transition-all duration-300 cursor-pointer hover:shadow-emerald-950/50 hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden"
          >
            {/* Subtle card glow accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Featured Blueprint
                </span>
                <span className="text-xs text-slate-400 font-medium">10 Min Read</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                Affiliate Marketing For Beginners: Building Passive Income the Smart Way
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                Jay Lopez’s step-by-step framework to launch, structure, and scale a high-ticket affiliate revenue engine with minimal upfront capital.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Over 8,900+ Entrepreneurs Guided</span>
              </div>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Read Full Blueprint <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Ebook Cover WebP Card Spotlight */}
          <div 
            onClick={() => onSelectPost?.('post-aff-master-guide')}
            className="lg:col-span-5 bg-gradient-to-br from-slate-900/90 via-slate-900/85 to-slate-950/95 border border-emerald-500/40 hover:border-emerald-400/80 rounded-2xl p-5 backdrop-blur-xl shadow-2xl shadow-slate-950/80 flex items-center gap-4 group transition-all duration-300 cursor-pointer hover:shadow-emerald-950/60 hover:-translate-y-1 active:scale-[0.99] relative overflow-hidden"
          >
            <div className="w-24 sm:w-28 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-emerald-500/40 group-hover:scale-105 transition-transform duration-300 bg-slate-950">
              <img 
                src="/images/affiliate-marketing-guide-cover.webp" 
                alt="Affiliate Marketing for Beginners eBook Cover" 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                FREE 2026 EBOOK
              </span>
              <h4 className="text-sm font-extrabold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                Affiliate Marketing For Beginners
              </h4>
              <p className="text-xs text-slate-300 line-clamp-3 leading-snug">
                Building Passive Income the Smart Way. Click to read Jay’s complete setup playbook.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 pt-1 group-hover:translate-x-1 transition-transform">
                Read Master Guide <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </motion.div>

        {/* Newsletter Inline Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-6 max-w-xl mx-auto"
        >
          {subscribedMsg ? (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl p-3.5 text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {subscribedMsg}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <label htmlFor="hero-email-input" className="sr-only">Email address</label>
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="hero-email-input"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email for Jay's weekly blueprint..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/90 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 backdrop-blur-xl shadow-xl transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 hover:shadow-emerald-500/40"
              >
                {isSubmitting ? 'Joining...' : 'Get Free Guides'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
          <p className="text-[11px] text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            No spam ever. Unsubscribe anytime with 1 click.
          </p>
        </motion.div>

        {/* Stat Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto"
        >
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
            <p className="text-xl sm:text-2xl font-black text-white">$100k+</p>
            <p className="text-xs text-slate-400 font-medium">Affiliate Sales Generated</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
            <p className="text-xl sm:text-2xl font-black text-emerald-400">100% Free</p>
            <p className="text-xs text-slate-400 font-medium">In-Depth Guides</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
            <p className="text-xl sm:text-2xl font-black text-white">5 Categories</p>
            <p className="text-xs text-slate-400 font-medium">Affiliate, SEO, Tech, More</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
            <p className="text-xl sm:text-2xl font-black text-emerald-400">Weekly</p>
            <p className="text-xs text-slate-400 font-medium">Actionable Blueprints</p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

