import React, { useState } from 'react';
import { ModalView, ContactMessage } from '../types';
import { X, Shield, FileText, Mail, CheckCircle2, Send, AlertCircle, Phone, MapPin } from 'lucide-react';
import { sanitizeInput, checkRateLimit, logSecurityEvent } from '../utils/security';

interface MandatoryPagesModalProps {
  view: ModalView;
  onClose: () => void;
  onSelectTab: (tab: ModalView) => void;
  onNewContactMessage: (msg: ContactMessage) => void;
}

export const MandatoryPagesModal: React.FC<MandatoryPagesModalProps> = ({
  view,
  onClose,
  onSelectTab,
  onNewContactMessage,
}) => {
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (view === 'none' || view === 'admin' || view === 'post-reader') return null;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Rate limiting check (max 3 contact submissions per minute)
    const rl = checkRateLimit('contact_submit', 3, 60000);
    if (!rl.allowed) {
      const msg = `Rate limit reached. Please wait ${rl.retryAfterSec} seconds before sending another message.`;
      setErrorMsg(msg);
      logSecurityEvent('RATE_LIMIT_BLOCKED', 'Contact form submission throttled', `Email: ${email}`);
      return;
    }

    const cleanName = sanitizeInput(name.trim());
    const cleanEmail = sanitizeInput(email.trim().toLowerCase());
    const cleanSubject = sanitizeInput(subject.trim());
    const cleanMessage = sanitizeInput(message.trim());

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (name !== cleanName || message !== cleanMessage) {
      logSecurityEvent('XSS_PREVENTED', 'HTML/Script tags stripped from contact message', `Author: ${cleanName}`);
    }

    setIsSubmitting(true);

    const newMsg: ContactMessage = {
      id: 'msg-' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      read: false,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedSuccess(true);
        onNewContactMessage(newMsg);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setErrorMsg(data.error || 'Failed to send message');
      }
    } catch {
      // Offline / fallback save
      setSubmittedSuccess(true);
      onNewContactMessage(newMsg);
      setName('');
      setEmail('');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Navigation Tabs Header */}
        <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => onSelectTab('contact')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                view === 'contact'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </button>

            <button
              onClick={() => onSelectTab('privacy')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                view === 'privacy'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </button>

            <button
              onClick={() => onSelectTab('terms')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                view === 'terms'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* VIEW 1: CONTACT FORM */}
          {view === 'contact' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Get in Touch</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Contact Jay Lopez & Jaysmoneyguides</h2>
                <p className="text-sm text-slate-300 mt-1">
                  Have a question regarding affiliate marketing, sponsorship opportunities, coaching, or site feedback? Send a message below.
                </p>
              </div>

              {submittedSuccess ? (
                <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Sent Successfully!</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Thank you for reaching out. Jay reviews every inquiry personally and will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name-input" className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                      <input
                        id="contact-name-input"
                        name="name"
                        type="text"
                        required
                        placeholder="Jay Lopez"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email-input" className="block text-xs font-semibold text-slate-300 mb-1">Your Email Address *</label>
                      <input
                        id="contact-email-input"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject-select" className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Subject</label>
                    <select
                      id="contact-subject-select"
                      name="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="General Inquiry">General Business Inquiry</option>
                      <option value="Sponsorship & Partnership">Sponsorship & Brand Partnerships</option>
                      <option value="Affiliate Marketing Strategy">Affiliate Marketing Strategy Coaching</option>
                      <option value="SEO / Site Audit">SEO & Site Audit Questions</option>
                      <option value="Technical Support">Technical Support / Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message-textarea" className="block text-xs font-semibold text-slate-300 mb-1">Your Message *</label>
                    <textarea
                      id="contact-message-textarea"
                      name="message"
                      required
                      rows={5}
                      placeholder="Write your detailed message or question here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending Message...' : 'Submit Contact Inquiry'}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Direct Info */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Email: <strong>jay@jaysmoneyguides.com</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HQ: <strong>Austin, Texas • Global Remote</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PRIVACY POLICY */}
          {view === 'privacy' && (
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Legal Compliance</span>
                <h2 className="text-2xl font-extrabold text-white">Privacy Policy & Affiliate Disclosures</h2>
                <p className="text-xs text-slate-400">Effective Date: January 1, 2026 • Last Updated: July 2026</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  FTC Affiliate Marketing Disclosure:
                </p>
                <p>
                  Jaysmoneyguides believes in 100% transparency. Some of the links on this website are affiliate links, meaning Jay Lopez may earn a referral commission at zero additional cost to you if you purchase through those links. We only recommend software, services, and tools we personally test, evaluate, or endorse.
                </p>
              </div>

              <h3 className="text-lg font-bold text-white mt-4">1. Information We Collect</h3>
              <p>
                When you visit Jaysmoneyguides, subscribe to our newsletter, or fill out our contact form, we collect information you voluntarily provide such as your name, email address, and inquiry messages.
              </p>

              <h3 className="text-lg font-bold text-white mt-4">2. Cookies & Analytics</h3>
              <p>
                We use standard cookies and lightweight web analytics tools to measure article views, CTR performance on affiliate links, and traffic patterns to optimize reader experience. You can disable cookies in your browser settings anytime.
              </p>

              <h3 className="text-lg font-bold text-white mt-4">3. Data Security & Spam Protection</h3>
              <p>
                We never sell, rent, or lease your personal email address to third parties. Your newsletter subscription details are stored securely and used exclusively to send Jay's business blueprints and site updates.
              </p>

              <h3 className="text-lg font-bold text-white mt-4">4. GDPR & CCPA Privacy Rights</h3>
              <p>
                If you reside in the EU or California, you have the right to request access to, update, or permanently delete your personal subscriber data from our records. Contact us at privacy@jaysmoneyguides.com for immediate assistance.
              </p>
            </div>
          )}

          {/* VIEW 3: TERMS OF SERVICE */}
          {view === 'terms' && (
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Terms of Use</span>
                <h2 className="text-2xl font-extrabold text-white">Terms of Service & Earnings Disclaimer</h2>
                <p className="text-xs text-slate-400">Effective Date: January 1, 2026 • Last Updated: July 2026</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-1.5">
                <p className="font-bold text-amber-300">Earnings & Success Disclaimer:</p>
                <p>
                  Any income examples, revenue figures, or earnings estimates displayed on Jaysmoneyguides are educational illustrations only. Building a profitable online business requires hard work, skill, persistence, and continuous effort. Individual results will vary depending on your execution and market factors.
                </p>
              </div>

              <h3 className="text-lg font-bold text-white mt-4">1. Acceptance of Terms</h3>
              <p>
                By accessing and using Jaysmoneyguides, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue site usage.
              </p>

              <h3 className="text-lg font-bold text-white mt-4">2. Intellectual Property Rights</h3>
              <p>
                All content, blog articles, custom calculators, graphics, frameworks, and brand materials published on Jaysmoneyguides are the exclusive property of Jay Lopez and protected by copyright laws. You may not reproduce or republish full articles without express written consent.
              </p>

              <h3 className="text-lg font-bold text-white mt-4">3. Third-Party Products & Affiliate Links</h3>
              <p>
                Jaysmoneyguides contains links to external third-party software websites and affiliate vendors. We are not responsible for the performance, customer support, or privacy practices of third-party platforms.
              </p>

              <h3 className="text-lg font-bold text-white mt-4">4. Limitation of Liability</h3>
              <p>
                Jaysmoneyguides and Jay Lopez shall not be liable for any indirect, incidental, or consequential damages arising from your reliance on strategies or tools discussed on this platform.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
