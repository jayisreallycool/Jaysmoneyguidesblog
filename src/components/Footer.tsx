import React, { useState } from 'react';
import { Category, ModalView } from '../types';
import { Mail, ArrowUp, Send, CheckCircle2, Github, Twitter, Linkedin } from 'lucide-react';
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
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand & Newsletter */}
        <div className="space-y-4">
          <span className="font-extrabold text-xl text-white">
            Jays<span className="text-emerald-400">Money</span>Guides
          </span>
          <p className="text-sm">Actionable blueprints for digital founders.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
            <input
              id="footer-newsletter-email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
            <button type="submit" aria-label="Subscribe to newsletter" className="bg-emerald-500 text-slate-950 p-2 rounded-lg hover:bg-emerald-400">
              <Send className="w-4 h-4" />
            </button>
          </form>
          {subscribedMsg && <p className="text-xs text-emerald-400">{subscribedMsg}</p>}
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Company</h4>
            <a href="/contact" onClick={(e) => { e.preventDefault(); openModal('contact'); }} className="block text-sm hover:text-emerald-400">Contact</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); openModal('privacy'); }} className="block text-sm hover:text-emerald-400">Privacy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="block text-sm hover:text-emerald-400">Terms</a>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Resources</h4>
            <button onClick={() => onSelectCategory('SEO')} className="block text-sm hover:text-emerald-400">SEO</button>
            <button onClick={() => onSelectCategory('Blogging')} className="block text-sm hover:text-emerald-400">Blogging</button>
          </div>
        </div>

        {/* Social */}
        <div className="flex flex-col items-start md:items-end justify-between">
          <div className="flex gap-4">
            <a href="#" className="hover:text-white"><Github className="w-5 h-5"/></a>
            <a href="#" className="hover:text-white"><Twitter className="w-5 h-5"/></a>
            <a href="#" className="hover:text-white"><Linkedin className="w-5 h-5"/></a>
          </div>
          <button onClick={scrollToTop} className="flex items-center gap-1 text-sm hover:text-white mt-4 md:mt-0">
            Back to top <ArrowUp className="w-4 h-4"/>
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 text-center text-xs">
        © {new Date().getFullYear()} JaysMoneyGuides. All rights reserved.
      </div>
    </footer>
  );
};
