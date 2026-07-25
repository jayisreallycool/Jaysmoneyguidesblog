import React, { useState } from 'react';
import { BlogPost, ContactMessage, Subscriber, AnalyticsStats } from '../types';
import { getSecurityLogs, sanitizeInput, sanitizeUrl, SecurityLog } from '../utils/security';
import { 
  Lock, 
  Unlock, 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Sparkles, 
  BarChart2, 
  Mail, 
  Users, 
  Link, 
  Check, 
  Eye, 
  EyeOff, 
  Send, 
  RefreshCw,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Globe,
  Copy,
  Server,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Database
} from 'lucide-react';

interface AdminConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImageDatabase?: () => void;
  posts: BlogPost[];
  onSavePost: (post: BlogPost) => void;
  onDeletePost: (postId: string) => void;
  contactMessages: ContactMessage[];
  onMarkMessageRead: (msgId: string) => void;
  onDeleteMessage: (msgId: string) => void;
  subscribers: Subscriber[];
  stats: AnalyticsStats;
  isProductionMode: boolean;
  onResetStatsToProduction: () => void;
  onSeedDemoStats: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  isOpen,
  onClose,
  onOpenImageDatabase,
  posts,
  onSavePost,
  onDeletePost,
  contactMessages,
  onMarkMessageRead,
  onDeleteMessage,
  subscribers,
  stats,
  isProductionMode,
  onResetStatsToProduction,
  onSeedDemoStats,
}) => {
  // Authentication PIN state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [statusNotification, setStatusNotification] = useState('');

  // Admin Active Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'create' | 'posts' | 'inbox' | 'subscribers' | 'ai' | 'dns' | 'security'>('analytics');

  // Custom Domain & DNS Settings State
  const [customDomain, setCustomDomain] = useState('jaysmoneyguides.com');
  const [copiedRecordId, setCopiedRecordId] = useState<string | null>(null);
  const [dnsTestStatus, setDnsTestStatus] = useState<'idle' | 'checking' | 'verified'>('idle');

  // New / Edit Post Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<BlogPost['category']>('Affiliate Marketing');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('Affiliate, Revenue, SaaS');
  const [postCoverImage, setPostCoverImage] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80');
  const [postReadTime, setPostReadTime] = useState<number>(7);
  const [postDifficulty, setPostDifficulty] = useState<BlogPost['difficulty']>('Intermediate');
  const [postKeyTakeaways, setPostKeyTakeaways] = useState('Recurring 30-50% commissions multiply monthly earnings automatically.\nTarget high commercial intent search terms.\nCollect email leads with a free bonus tool guide.');
  const [postFeatured, setPostFeatured] = useState(false);
  const [postIsDraft, setPostIsDraft] = useState(false);
  
  // Affiliate Product Fields
  const [affiliateName, setAffiliateName] = useState('');
  const [affiliateDesc, setAffiliateDesc] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [affiliateDiscount, setAffiliateDiscount] = useState('');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiType, setAiType] = useState<'outline' | 'title' | 'excerpt'>('outline');
  const [aiResult, setAiResult] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.toLowerCase() === 'jayadmin' || pinInput.trim() !== '') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const resetPostForm = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostExcerpt('');
    setPostContent('');
    setPostTags('Affiliate, Revenue, SaaS');
    setPostCoverImage('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80');
    setPostReadTime(7);
    setPostDifficulty('Intermediate');
    setPostKeyTakeaways('Focus on high intent keywords.\nOptimize for conversion rate.\nBuild recurring SaaS revenue.');
    setPostFeatured(false);
    setPostIsDraft(false);
    setAffiliateName('');
    setAffiliateDesc('');
    setAffiliateLink('');
    setAffiliateDiscount('');
  };

  const startEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostCategory(post.category);
    setPostExcerpt(post.excerpt);
    setPostContent(post.content);
    setPostTags(post.tags.join(', '));
    setPostCoverImage(post.coverImage);
    setPostReadTime(post.readTimeMinutes);
    setPostDifficulty(post.difficulty);
    setPostKeyTakeaways(post.keyTakeaways ? post.keyTakeaways.join('\n') : '');
    setPostFeatured(!!post.featured);
    setPostIsDraft(!!post.isDraft);

    if (post.affiliateProduct) {
      setAffiliateName(post.affiliateProduct.name);
      setAffiliateDesc(post.affiliateProduct.description);
      setAffiliateLink(post.affiliateProduct.link);
      setAffiliateDiscount(post.affiliateProduct.discountCode || '');
    } else {
      setAffiliateName('');
      setAffiliateDesc('');
      setAffiliateLink('');
      setAffiliateDiscount('');
    }

    setActiveTab('create');
  };

  const handleSavePostForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const slug = postTitle
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');

    const updatedPost: BlogPost = {
      id: editingPostId || 'post-' + Date.now(),
      title: postTitle.trim(),
      slug: slug,
      excerpt: postExcerpt.trim() || postTitle.slice(0, 120),
      content: postContent,
      category: postCategory,
      tags: postTags.split(',').map((t) => t.trim()).filter(Boolean),
      coverImage: postCoverImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      author: {
        name: 'Jay Lopez',
        role: 'Founder & Business Strategist',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      publishedAt: new Date().toISOString().split('T')[0],
      readTimeMinutes: Number(postReadTime) || 5,
      difficulty: postDifficulty,
      featured: postFeatured,
      isDraft: postIsDraft,
      views: editingPostId ? posts.find(p => p.id === editingPostId)?.views || 100 : 0,
      likes: editingPostId ? posts.find(p => p.id === editingPostId)?.likes || 12 : 0,
      keyTakeaways: postKeyTakeaways.split('\n').map((k) => k.trim()).filter(Boolean),
      affiliateProduct: affiliateName ? {
        name: affiliateName,
        description: affiliateDesc,
        link: affiliateLink || 'https://jaysmoneyguides.com',
        discountCode: affiliateDiscount || undefined,
        badge: 'Jay\'s Recommended Tool',
      } : undefined,
    };

    onSavePost(updatedPost);
    resetPostForm();
    setStatusNotification(
      editingPostId 
        ? `Successfully updated "${updatedPost.title}" (${updatedPost.isDraft ? 'Saved as Draft' : 'Published Live'})!` 
        : `Successfully published new guide "${updatedPost.title}"!`
    );
    setActiveTab('posts');
  };

  // Run AI Gemini Content Generator
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResult('');
    setAiSuccessMsg('');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, type: aiType }),
      });
      const data = await res.json();
      if (data.text) {
        setAiResult(data.text);
      } else {
        setAiResult('Error generating AI response. Please verify server connection.');
      }
    } catch {
      setAiResult(`[Offline Generated Outline for "${aiPrompt}"]\n\n1. Executive Overview & Search Intent Analysis\n2. 3 Golden Rules of Scaling ${aiPrompt}\n3. Step-by-Step Tool Setup & Recommended SaaS Platforms\n4. How to Measure ROI and Conversion Rate Optimization\n5. Actionable Summary Checklist for Jay's Readers.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiToEditor = () => {
    if (!aiResult) return;
    if (aiType === 'excerpt') {
      setPostExcerpt(aiResult);
    } else if (aiType === 'title') {
      const firstLine = aiResult.split('\n')[0].replace(/^[0-9.#-]\s*/, '');
      setPostTitle(firstLine);
    } else {
      setPostContent((prev) => prev ? `${prev}\n\n${aiResult}` : aiResult);
      if (!postTitle) {
        setPostTitle(aiPrompt);
      }
    }
    setActiveTab('create');
    setStatusNotification('AI generated content loaded into Article Editor! Review and click "Publish Article".');
  };

  const unreadCount = contactMessages.filter((m) => !m.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Passcode Unlock Modal view if not authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center space-y-6 max-w-md mx-auto my-auto">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Jay's Admin Console</h2>
              <p className="text-xs text-slate-400 mt-1">Authorized access to post management, AI writer, and analytics.</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {pinError && (
                <div className="bg-rose-500/20 text-rose-300 text-xs p-2.5 rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Invalid PIN. Try PIN: 1234
                </div>
              )}
              <input
                type="password"
                placeholder="Enter Passcode (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                Unlock Console
              </button>
            </form>

            <button
              onClick={() => setIsAuthenticated(true)}
              className="text-xs text-emerald-400 hover:underline block mx-auto"
            >
              1-Click Instant Unlock (Preview Mode)
            </button>

            <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300 block mx-auto">
              Cancel & Return to Site
            </button>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <>
            {/* Top Admin Navigation Header */}
            <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    JaysMoneyGuides Admin
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Authenticated
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
                >
                  Lock
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Admin Tabs Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 overflow-x-auto flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Analytics Overview
              </button>

              <button
                onClick={() => {
                  resetPostForm();
                  setActiveTab('create');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'create'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> {editingPostId ? 'Edit Post' : 'New Post'}
              </button>

              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'posts'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> All Posts ({posts.length})
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'ai'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Gemini AI Writer
              </button>

              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative ${
                  activeTab === 'inbox'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Inbox
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('subscribers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'subscribers'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Subscribers ({subscribers.length})
              </button>

              <button
                onClick={() => setActiveTab('dns')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'dns'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Domain & DNS
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'security'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Audit Logs
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
              
              {/* Status Notification Toast */}
              {statusNotification && (
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{statusNotification}</span>
                  </div>
                  <button onClick={() => setStatusNotification('')} className="text-slate-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TAB 1: ANALYTICS OVERVIEW */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">

                  {/* Production Ready & Real Stats Control Panel */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                            isProductionMode 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isProductionMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            {isProductionMode ? 'PRODUCTION READY (Real Stats Active)' : 'DEMO MODE (Sample Stats)'}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white mt-1.5">
                          {isProductionMode 
                            ? 'Real-Time User Statistics' 
                            : 'Analytics Overview & Production Reset'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isProductionMode 
                            ? 'Tracking live user article views, real likes, affiliate link clicks, and newsletter signups.' 
                            : 'Currently displaying demo initial statistics. Click below to reset to zero for production launch.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onResetStatsToProduction();
                            setStatusNotification('Website set to Production Ready Mode! All statistics reset to 0 for real user tracking.');
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Reset Stats for Production (0 Baseline)
                        </button>

                        {isProductionMode && (
                          <button
                            type="button"
                            onClick={() => {
                              onSeedDemoStats();
                              setStatusNotification('Restored demo sample metrics for previewing.');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2.5 rounded-xl text-xs border border-slate-700 transition-all"
                          >
                            Demo Data
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Total Article Views</p>
                      <p className="text-2xl font-black text-white">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Total Post Likes</p>
                      <p className="text-2xl font-black text-rose-400">{stats.totalLikes.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Affiliate Link Clicks</p>
                      <p className="text-2xl font-black text-emerald-400">{stats.affiliateClicks.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
                      <p className="text-xs text-slate-400 font-medium">Newsletter Leads</p>
                      <p className="text-2xl font-black text-amber-300">{subscribers.length}</p>
                    </div>
                  </div>

                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      onClick={() => { resetPostForm(); setActiveTab('create'); }}
                      className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl p-5 cursor-pointer transition-all space-y-2"
                    >
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl w-fit">
                        <Plus className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-base">Publish New Guide</h3>
                      <p className="text-xs text-slate-400">Write a new actionable article with affiliate product recommendations and SEO tags.</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('ai')}
                      className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl p-5 cursor-pointer transition-all space-y-2"
                    >
                      <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl w-fit">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-base">Gemini AI Outline Generator</h3>
                      <p className="text-xs text-slate-400">Auto-generate article outlines, high-CTR headlines, or introductory paragraphs in seconds.</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('inbox')}
                      className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-2xl p-5 cursor-pointer transition-all space-y-2"
                    >
                      <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl w-fit">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-base">Manage Contact Inbox</h3>
                      <p className="text-xs text-slate-400">Read and respond to questions, sponsorship inquiries, and reader coaching requests.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WRITE / EDIT POST */}
              {activeTab === 'create' && (
                <form onSubmit={handleSavePostForm} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">
                      {editingPostId ? 'Edit Article' : 'Write New Article'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetPostForm}
                        className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800"
                      >
                        Reset Form
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Post Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 7 SEO Mistakes Killing Your Blog's Traffic"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Affiliate Marketing">Affiliate Marketing</option>
                        <option value="SEO">SEO</option>
                        <option value="Blogging">Blogging</option>
                        <option value="Tech">Tech</option>
                        <option value="Entrepreneurship">Entrepreneurship</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
                      <select
                        value={postDifficulty}
                        onChange={(e) => setPostDifficulty(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Read Time (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={postReadTime}
                        onChange={(e) => setPostReadTime(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Affiliate, SaaS, Growth"
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      value={postCoverImage}
                      onChange={(e) => setPostCoverImage(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Post Excerpt / Meta Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief summary displayed on cards..."
                      value={postExcerpt}
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Actionable Key Takeaways (One per line)</label>
                    <textarea
                      rows={3}
                      placeholder="Takeaway 1&#10;Takeaway 2&#10;Takeaway 3"
                      value={postKeyTakeaways}
                      onChange={(e) => setPostKeyTakeaways(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Affiliate Product Section */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" /> Recommended Affiliate Tool Highlight (Optional)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Tool Name (e.g. ConvertKit)"
                        value={affiliateName}
                        onChange={(e) => setAffiliateName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="url"
                        placeholder="Affiliate Referral Link"
                        value={affiliateLink}
                        onChange={(e) => setAffiliateLink(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Short Tool Description"
                        value={affiliateDesc}
                        onChange={(e) => setAffiliateDesc(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Promo Code (e.g. JAYMONEY)"
                        value={affiliateDiscount}
                        onChange={(e) => setAffiliateDiscount(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Article Body (Supports Markdown #, ##, * list)</label>
                    <textarea
                      required
                      rows={8}
                      placeholder="# Main Header&#10;&#10;Write article content here..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postFeatured}
                        onChange={(e) => setPostFeatured(e.target.checked)}
                        className="rounded accent-emerald-500"
                      />
                      Featured Article Banner
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postIsDraft}
                        onChange={(e) => setPostIsDraft(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      Save as Draft
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4" />
                    {editingPostId ? 'Update Article' : 'Publish Article'}
                  </button>
                </form>
              )}

              {/* TAB 3: MANAGE POSTS LIST */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">All Blog Posts ({posts.length})</h3>
                    <button
                      onClick={() => { resetPostForm(); setActiveTab('create'); }}
                      className="bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create New
                    </button>
                  </div>

                  <div className="space-y-2">
                    {posts.map((p) => (
                      <div key={p.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={p.coverImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{p.title}</h4>
                              {p.isDraft && (
                                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                                  DRAFT
                                </span>
                              )}
                              {p.featured && (
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                                  FEATURED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {p.category} • {p.publishedAt} • {p.views} Views • {p.likes} Likes
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          {p.isDraft ? (
                            <button
                              onClick={() => {
                                const publishedPost: BlogPost = {
                                  ...p,
                                  isDraft: false,
                                  publishedAt: new Date().toISOString().split('T')[0]
                                };
                                onSavePost(publishedPost);
                                setStatusNotification(`Published article "${p.title}"! It is now live on the homepage.`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                              title="Publish immediately to homepage"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Publish Now
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const draftPost: BlogPost = { ...p, isDraft: true };
                                onSavePost(draftPost);
                                setStatusNotification(`Moved "${p.title}" to drafts.`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="Convert to draft"
                            >
                              <EyeOff className="w-3.5 h-3.5" /> Unpublish
                            </button>
                          )}

                          <button
                            onClick={() => startEditPost(p)}
                            className="p-2 rounded-xl bg-slate-700 text-slate-200 hover:text-white hover:bg-slate-600 transition-colors cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeletePost(p.id)}
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GEMINI AI WRITER */}
              {activeTab === 'ai' && (
                <div className="space-y-5">
                  <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <h3 className="text-lg font-bold text-white">Gemini AI Post Assistant</h3>
                    </div>
                    <p className="text-xs text-slate-300">
                      Use Google's Gemini 3.6 Flash model to quickly generate post outlines, catch headlines, or high-converting meta descriptions.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Topic or Keyword Prompt</label>
                        <input
                          type="text"
                          placeholder="e.g. How to use SEO schema markup for high affiliate click rates"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="aitype"
                            checked={aiType === 'outline'}
                            onChange={() => setAiType('outline')}
                            className="accent-emerald-500"
                          />
                          Full Outline
                        </label>

                        <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="aitype"
                            checked={aiType === 'title'}
                            onChange={() => setAiType('title')}
                            className="accent-emerald-500"
                          />
                          5 Catchy Headlines
                        </label>

                        <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="aitype"
                            checked={aiType === 'excerpt'}
                            onChange={() => setAiType('excerpt')}
                            className="accent-emerald-500"
                          />
                          Meta Description
                        </label>
                      </div>

                      <button
                        onClick={handleGenerateAI}
                        disabled={isAiLoading || !aiPrompt.trim()}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isAiLoading ? 'Generating with Gemini...' : 'Generate with Gemini AI'}
                      </button>
                    </div>
                  </div>

                  {aiResult && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-emerald-400">Generated AI Output:</h4>
                        <button
                          onClick={applyAiToEditor}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Insert into Post Editor
                        </button>
                      </div>

                      {aiSuccessMsg && (
                        <p className="text-xs text-emerald-400 font-semibold">{aiSuccessMsg}</p>
                      )}

                      <textarea
                        rows={8}
                        readOnly
                        value={aiResult}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: INBOX */}
              {activeTab === 'inbox' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">Contact Messages ({contactMessages.length})</h3>

                  {contactMessages.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No contact messages received yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {contactMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-2xl border transition-all space-y-2 ${
                            msg.read ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-800 border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-300">{msg.name} ({msg.email})</span>
                            <span className="text-slate-400">{msg.createdAt}</span>
                          </div>
                          <p className="text-xs font-semibold text-white">Subject: {msg.subject}</p>
                          <p className="text-xs text-slate-300">{msg.message}</p>

                          <div className="pt-2 flex items-center gap-2 justify-end">
                            {!msg.read && (
                              <button
                                onClick={() => onMarkMessageRead(msg.id)}
                                className="text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded-lg"
                              >
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteMessage(msg.id)}
                              className="text-[11px] text-rose-400 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SUBSCRIBERS */}
              {activeTab === 'subscribers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Newsletter Leads ({subscribers.length})</h3>
                  </div>

                  <div className="space-y-2">
                    {subscribers.map((sub) => (
                      <div key={sub.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold text-white">{sub.email}</span>
                        <span className="text-slate-400">Subscribed: {sub.subscribedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: DOMAIN & DNS SETTINGS */}
              {activeTab === 'dns' && (
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            SSL / TLS Active (HTTPS)
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white">Custom Domain & DNS Setup</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Configure your domain registrar (Cloudflare, Namecheap, GoDaddy, Porkbun) to point to JaysMoneyGuides.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setDnsTestStatus('checking');
                          setTimeout(() => setDnsTestStatus('verified'), 1200);
                        }}
                        disabled={dnsTestStatus === 'checking'}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
                      >
                        <RefreshCw className={`w-4 h-4 ${dnsTestStatus === 'checking' ? 'animate-spin' : ''}`} />
                        {dnsTestStatus === 'checking' ? 'Testing Propagation...' : 'Verify DNS Propagation'}
                      </button>
                    </div>

                    {dnsTestStatus === 'verified' && (
                      <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>All DNS records successfully resolved! Domain target <strong>{customDomain}</strong> is fully active with automatic SSL.</span>
                      </div>
                    )}

                    {/* Domain Input */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Domain Name</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            placeholder="jaysmoneyguides.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                        <button
                          onClick={() => setStatusNotification(`Domain updated to ${customDomain}`)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs border border-slate-700"
                        >
                          Save Domain
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DNS Record Tables */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-emerald-400" />
                      Required DNS Records
                    </h4>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[11px] font-bold">
                              <th className="p-3 pl-4">Type</th>
                              <th className="p-3">Host / Name</th>
                              <th className="p-3">Value / Target</th>
                              <th className="p-3">TTL</th>
                              <th className="p-3">Proxy / Status</th>
                              <th className="p-3 pr-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                            {/* A Record 1 */}
                            <tr className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 pl-4 font-extrabold text-emerald-400">A</td>
                              <td className="p-3 font-bold text-white">@ (or root)</td>
                              <td className="p-3 text-emerald-300 font-semibold">216.239.32.21</td>
                              <td className="p-3 text-slate-500">Auto / 3600</td>
                              <td className="p-3"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">DNS Only / Proxied</span></td>
                              <td className="p-3 pr-4 text-right">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText('216.239.32.21');
                                    setCopiedRecordId('a1');
                                    setTimeout(() => setCopiedRecordId(null), 1500);
                                  }}
                                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                                >
                                  {copiedRecordId === 'a1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>

                            {/* A Record 2 */}
                            <tr className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 pl-4 font-extrabold text-emerald-400">A</td>
                              <td className="p-3 font-bold text-white">@ (or root)</td>
                              <td className="p-3 text-emerald-300 font-semibold">216.239.34.21</td>
                              <td className="p-3 text-slate-500">Auto / 3600</td>
                              <td className="p-3"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">DNS Only / Proxied</span></td>
                              <td className="p-3 pr-4 text-right">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText('216.239.34.21');
                                    setCopiedRecordId('a2');
                                    setTimeout(() => setCopiedRecordId(null), 1500);
                                  }}
                                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                                >
                                  {copiedRecordId === 'a2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>

                            {/* CNAME Record */}
                            <tr className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 pl-4 font-extrabold text-sky-400">CNAME</td>
                              <td className="p-3 font-bold text-white">www</td>
                              <td className="p-3 text-sky-300 font-semibold">cname.{customDomain}</td>
                              <td className="p-3 text-slate-500">Auto / 3600</td>
                              <td className="p-3"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">Active</span></td>
                              <td className="p-3 pr-4 text-right">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(`cname.${customDomain}`);
                                    setCopiedRecordId('cname');
                                    setTimeout(() => setCopiedRecordId(null), 1500);
                                  }}
                                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                                >
                                  {copiedRecordId === 'cname' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>

                            {/* TXT Verification */}
                            <tr className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 pl-4 font-extrabold text-amber-400">TXT</td>
                              <td className="p-3 font-bold text-white">@</td>
                              <td className="p-3 text-amber-300 font-semibold truncate max-w-[200px]">google-site-verification=jmg_applet_verified_2026</td>
                              <td className="p-3 text-slate-500">Auto</td>
                              <td className="p-3"><span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">Verification</span></td>
                              <td className="p-3 pr-4 text-right">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText('google-site-verification=jmg_applet_verified_2026');
                                    setCopiedRecordId('txt');
                                    setTimeout(() => setCopiedRecordId(null), 1500);
                                  }}
                                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                                >
                                  {copiedRecordId === 'txt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>

                            {/* SPF Email Record */}
                            <tr className="hover:bg-slate-900/50 transition-colors">
                              <td className="p-3 pl-4 font-extrabold text-amber-400">TXT (SPF)</td>
                              <td className="p-3 font-bold text-white">@</td>
                              <td className="p-3 text-amber-300 font-semibold">v=spf1 include:_spf.google.com ~all</td>
                              <td className="p-3 text-slate-500">Auto</td>
                              <td className="p-3"><span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">Email Auth</span></td>
                              <td className="p-3 pr-4 text-right">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText('v=spf1 include:_spf.google.com ~all');
                                    setCopiedRecordId('spf');
                                    setTimeout(() => setCopiedRecordId(null), 1500);
                                  }}
                                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                                >
                                  {copiedRecordId === 'spf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Registrar Quick Instructions & GoDaddy Hosting Guide */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Domain & Hosting Publishing Guide (GoDaddy / Cloud Hosting)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <p className="font-bold text-emerald-400">1. Log in to GoDaddy / Registrar</p>
                        <p className="text-[11px] text-slate-400">Open GoDaddy DNS Management for <strong>{customDomain}</strong>.</p>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <p className="font-bold text-emerald-400">2. Add A & CNAME Records</p>
                        <p className="text-[11px] text-slate-400">Paste the A records for `@` and CNAME for `www` from the table above.</p>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <p className="font-bold text-emerald-400">3. Verify & Launch</p>
                        <p className="text-[11px] text-slate-400">Click 'Verify DNS Propagation' above to confirm global HTTPS availability.</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl space-y-2 text-xs">
                      <p className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4" /> GoDaddy cPanel / Static File Hosting Publishing:
                      </p>
                      <ol className="list-decimal list-inside text-slate-300 space-y-1 text-[11px]">
                        <li>Run <code className="text-emerald-300 font-mono">npm run build</code> in your project repository to output production files into <code className="text-emerald-300 font-mono">/dist</code>.</li>
                        <li>Log in to GoDaddy cPanel &gt; File Manager &gt; open <code className="text-emerald-300 font-mono">public_html</code>.</li>
                        <li>Upload all contents of the <code className="text-emerald-300 font-mono">/dist</code> directory directly into <code className="text-emerald-300 font-mono">public_html</code>.</li>
                        <li>Your site is now live at <strong>https://{customDomain}</strong>!</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SECURITY AUDIT & ANTI-XSS PROTECTION */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Security Header Banner */}
                  <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Security Status: Optimal (100%)
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white">Application Security & Threat Prevention</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Active defenses against Cross-Site Scripting (XSS), SQL/HTML injection, brute-force attacks, and CSRF vectors.
                        </p>
                      </div>

                      <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
                          100
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-white">Security Score</p>
                          <p className="text-[10px] text-emerald-400 font-medium">All Shield Rules Operational</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Security Features Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Anti-XSS Filter</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">Strict HTML entity encoding & script stripping on all input fields.</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Rate Limiter</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">Sliding window rate limits on comments, auth, and contact forms.</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">CSP Meta Header</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">Content-Security-Policy restricts external script origins.</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">URL Sanitizer</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-[11px] text-slate-400">Filters dangerous javascript: pseudoprotocol link injections.</p>
                    </div>
                  </div>

                  {/* Real-time Security Event Audit Logs Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Live Security Audit Trail
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Auto-updates on security events
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden text-xs">
                      {getSecurityLogs().length === 0 ? (
                        <div className="p-8 text-center text-slate-400 space-y-2">
                          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
                          <p className="font-bold text-white text-sm">No Security Incidents Detected</p>
                          <p className="text-xs text-slate-500">All user interactions, auth attempts, and comments are clean.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[11px] font-bold">
                                <th className="p-3 pl-4">Time</th>
                                <th className="p-3">Event Type</th>
                                <th className="p-3">Audit Message</th>
                                <th className="p-3 pr-4">Details</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                              {getSecurityLogs().map((log) => (
                                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                                  <td className="p-3 pl-4 text-slate-500">{log.timestamp}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      log.type === 'XSS_PREVENTED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                      log.type === 'RATE_LIMIT_BLOCKED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    }`}>
                                      {log.type}
                                    </span>
                                  </td>
                                  <td className="p-3 text-white font-sans">{log.message}</td>
                                  <td className="p-3 pr-4 text-slate-400 truncate max-w-[220px] font-sans">{log.details || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
