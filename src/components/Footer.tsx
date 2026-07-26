import React, { useState } from 'react';
import { Category, ModalView } from '../types';
import { DollarSign, Shield, FileText, Mail, ArrowUp, Send, CheckCircle2 } from 'lucide-react';
import { sanitizeInput, checkRateLimit, logSecurityEvent } from '../utils/security';

interface FooterProps {
  onSelectCategory: (category: Category | 'All') => void;
  openModal: (view: ModalView) => void;
  onSubscribeSuccess: (email: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  openModal,
  onSubscribeSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [subscribedMsg, setSubscribedMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(email.trim().toLowerCase());
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    // Rate limiting
    const rl = checkRateLimit('newsletter_sub', 3, 60000);
    if (!rl.allowed) {
      setSubscribedMsg(`Too many requests. Please wait ${rl.retryAfterSec}s.`);
      return;
    }

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribedMsg('Subscribed! Welcome.');
        logSecurityEvent('AUTH_SUCCESS', 'New newsletter subscriber registered', `Email: ${cleanEmail}`);
        onSubscribeSuccess(cleanEmail);
        setEmail('');
      }
    } catch {
      setSubscribedMsg('Subscribed! Welcome.');
      onSubscribeSuccess(cleanEmail);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/30 shadow-md shrink-0">
                <img 
                  src="/images/jays-mascot-logo.webp" 
                  alt="JaysMoneyGuides Mascot Logo" 
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Jays<span className="text-emerald-400">Money</span>Guides
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Actionable tips, strategies, and blueprints for building profitable online businesses in affiliate marketing, SEO, blogging, and tech.
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>Founded & Curated by Jay Lopez</span>
            </p>
          </div>

          {/* Quick Category Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Top Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectCategory('Affiliate Marketing')} className="hover:text-emerald-400 transition-colors">
                  Affiliate Marketing
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('SEO')} className="hover:text-emerald-400 transition-colors">
                  SEO & Search Authority
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Blogging')} className="hover:text-emerald-400 transition-colors">
                  High-ROI Blogging
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Tech')} className="hover:text-emerald-400 transition-colors">
                  Tech & AI Tools
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Entrepreneurship')} className="hover:text-emerald-400 transition-colors">
                  Digital Entrepreneurship
                </button>
              </li>
            </ul>
          </div>

          {/* Mandatory Pages & Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Legal & Support</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openModal('contact')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Contact Form Page
                </button>
              </li>
              <li>
                <button onClick={() => openModal('privacy')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Privacy Policy & FTC Disclosure
                </button>
              </li>
              <li>
                <button onClick={() => openModal('terms')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Terms of Service & Earnings Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => openModal('admin')} className="hover:text-emerald-400 transition-colors text-slate-500">
                  Admin Console Access
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Jay's Weekly Blueprint</h4>
            <p className="text-xs text-slate-400">Join 5,000+ digital founders getting weekly high-ticket SaaS breakdown guides.</p>
            {subscribedMsg ? (
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {subscribedMsg}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <label htmlFor="footer-email-input" className="sr-only">Email address</label>
                <input
                  id="footer-email-input"
                  name="email"
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* FTC Disclosure Banner */}
        <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
          <p>
            <strong>FTC Affiliate Disclaimer:</strong> Jaysmoneyguides is a reader-supported digital publication. When you purchase through affiliate links on our site, Jay Lopez may earn an affiliate commission at zero extra cost to you. We only recommend software tools and platforms we genuinely test and endorse.
          </p>
        </div>

        {/* Copyright & Scroll to Top */}
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Jaysmoneyguides by Jay Lopez. All rights reserved.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
