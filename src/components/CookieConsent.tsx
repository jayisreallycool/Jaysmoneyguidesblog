import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Shield, Check, X, Settings, ExternalLink, Info } from 'lucide-react';

interface CookieConsentProps {
  onOpenPrivacy?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference options
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(true);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('jmg_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth initial page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('jmg_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('jmg_cookie_consent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('jmg_cookie_consent', JSON.stringify({
      essential: true,
      analytics: analyticsCookies,
      marketing: marketingCookies,
      updatedAt: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 bg-slate-900/95 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-slate-950/90 backdrop-blur-xl p-5 text-white"
        role="dialog"
        aria-label="Cookie Consent Banner"
      >
        <div className="flex flex-col gap-4">
          
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">We Respect Your Privacy</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    GDPR & CCPA
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  JaysMoneyGuides uses cookies to enhance browsing experience, measure guide analytics, and remember preferences.
                </p>
              </div>
            </div>

            <button
              onClick={handleRejectNonEssential}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Close & Accept Essential Only"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Granular Preference Customization Panel */}
          {showPreferences && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-slate-800/80 space-y-2 text-xs"
            >
              <p className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> Cookie Settings & Categorization
              </p>

              {/* Essential Cookies */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Strictly Necessary</span>
                  <span className="text-[11px] text-slate-400">Required for authentication, security & bookmarks.</span>
                </div>
                <span className="px-2 py-1 bg-slate-800 text-slate-400 font-mono text-[10px] rounded font-bold">
                  Always Active
                </span>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <label htmlFor="cookie-analytics-toggle" className="font-bold text-slate-200 block cursor-pointer">Analytics & Performance</label>
                  <span className="text-[11px] text-slate-400">Anonymized guide view counts and reading stats.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="cookie-analytics-toggle"
                    name="analyticsCookies"
                    type="checkbox"
                    checked={analyticsCookies}
                    onChange={(e) => setAnalyticsCookies(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Marketing & Affiliate Tracking Cookies */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div>
                  <label htmlFor="cookie-marketing-toggle" className="font-bold text-slate-200 block cursor-pointer">Affiliate & Partner Preferences</label>
                  <span className="text-[11px] text-slate-400">Remembers tool discounts and affiliate link attribution.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="cookie-marketing-toggle"
                    name="marketingCookies"
                    type="checkbox"
                    checked={marketingCookies}
                    onChange={(e) => setMarketingCookies(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </motion.div>
          )}

          {/* Actions Row */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                {showPreferences ? 'Hide Options' : 'Customize'}
              </button>
              {onOpenPrivacy && (
                <>
                  <span className="text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    Privacy Policy
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showPreferences ? (
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Choices
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700/80"
                >
                  Essential Only
                </button>
              )}

              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-950/50 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Accept All
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
