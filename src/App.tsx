import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { BlogPost, Category, ModalView, ContactMessage, Subscriber, AnalyticsStats, Comment, User } from './types';
import { INITIAL_POSTS } from './data/initialPosts';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { CategoryTabs } from './components/CategoryTabs';
import { PostCard } from './components/PostCard';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { SEOHead } from './components/SEOHead';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  Bookmark, 
  Loader2, 
  ChevronDown, 
  LayoutGrid, 
  List,
  AlertCircle
} from 'lucide-react';

// Lazy-loaded Modal Components for faster initial page render & optimal bundle size
const PostReaderModal = React.lazy(() => import('./components/PostReaderModal').then(m => ({ default: m.PostReaderModal })));
const MandatoryPagesModal = React.lazy(() => import('./components/MandatoryPagesModal').then(m => ({ default: m.MandatoryPagesModal })));
const AdminConsole = React.lazy(() => import('./components/AdminConsole').then(m => ({ default: m.AdminConsole })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const UserProfileModal = React.lazy(() => import('./components/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const NewsletterModal = React.lazy(() => import('./components/NewsletterModal').then(m => ({ default: m.NewsletterModal })));
const MediaDatabaseModal = React.lazy(() => import('./components/MediaDatabaseModal').then(m => ({ default: m.MediaDatabaseModal })));
const CookieConsent = React.lazy(() => import('./components/CookieConsent').then(m => ({ default: m.CookieConsent })));

export default function App() {
  // State: Posts & Persistent Collections
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    // Force reset mock data to zero baseline once
    const hasResetMockData = localStorage.getItem('jmg_reset_mock_v3') === 'true';
    if (!hasResetMockData) {
      localStorage.setItem('jmg_reset_mock_v3', 'true');
      localStorage.setItem('jmg_posts', JSON.stringify(INITIAL_POSTS));
      localStorage.setItem('jmg_likes', JSON.stringify([]));
      return INITIAL_POSTS;
    }
    const saved = localStorage.getItem('jmg_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initialMap = new Map(INITIAL_POSTS.map(p => [p.id, p]));
          const updated = parsed.map((p: BlogPost) => {
            const fresh = initialMap.get(p.id);
            if (fresh) {
              return {
                ...fresh,
                views: p.views || 0,
                likes: p.likes || 0,
                rating: p.rating || 0,
                ratingCount: p.ratingCount || 0,
              };
            }
            return {
              ...p,
              views: p.views || 0,
              likes: p.likes || 0,
              rating: p.rating || 0,
              ratingCount: p.ratingCount || 0,
            };
          });
          const existingIds = new Set(parsed.map((p: BlogPost) => p.id));
          const missing = INITIAL_POSTS.filter(p => !existingIds.has(p.id));
          const result = [...updated, ...missing];
          localStorage.setItem('jmg_posts', JSON.stringify(result));
          return result;
        }
      } catch {
        return INITIAL_POSTS;
      }
    }
    return INITIAL_POSTS;
  });

  useEffect(() => {
    localStorage.setItem('jmg_posts', JSON.stringify(posts));
  }, [posts]);

  // Seed Firebase Media Assets on startup - dynamically imported so the
  // firebase SDK (~660kb) never blocks first paint / initial bundle.
  useEffect(() => {
    const idle = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1500));
    idle(() => {
      import('./lib/firebase').then(({ seedInitialMediaAssets }) => {
        seedInitialMediaAssets().catch(() => {});
      }).catch(() => {});
    });
  }, []);

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('jmg_bookmarks');
    return saved ? JSON.parse(saved) : ['post-1'];
  });

  useEffect(() => {
    localStorage.setItem('jmg_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Liked Posts
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('jmg_likes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('jmg_likes', JSON.stringify(likedIds));
  }, [likedIds]);

  // Production Mode state
  const [isProductionMode, setIsProductionMode] = useState<boolean>(() => {
    return localStorage.getItem('jmg_prod_mode') === 'true';
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jmg_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('jmg_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('jmg_user');
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateUser = (updated: User) => {
    setCurrentUser(updated);
  };

  // Contact Messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('jmg_contact_msgs');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [
      {
        id: 'msg-1',
        name: 'David Miller',
        email: 'david@solopreneur.io',
        subject: 'Sponsorship & Brand Partnership Inquiry',
        message: 'Hi Jay, love your SaaS affiliate blueprints! We would love to sponsor a featured review guide for our AI copywriting tool.',
        createdAt: '2026-07-22',
        read: false,
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('jmg_contact_msgs', JSON.stringify(contactMessages));
  }, [contactMessages]);

  // Newsletter Subscribers
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const saved = localStorage.getItem('jmg_subscribers');
    return saved ? JSON.parse(saved) : [
      { id: 'sub-1', email: 'alex@startupgrowth.com', subscribedAt: '2026-07-21', source: 'Hero Form' },
      { id: 'sub-2', email: 'sarah.m@seoagency.net', subscribedAt: '2026-07-23', source: 'Footer Form' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('jmg_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  // Article Comments
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('jmg_comments');
    return saved ? JSON.parse(saved) : [
      {
        id: 'c-1',
        postId: 'post-1',
        authorName: 'Marcus Vance',
        content: 'This SaaS affiliate breakdown is pure gold Jay. Applied the review page summary layout and already seeing higher CTR!',
        createdAt: '2026-07-21',
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('jmg_comments', JSON.stringify(comments));
  }, [comments]);

  // Analytics CTR
  const [affiliateClicks, setAffiliateClicks] = useState<number>(() => {
    const saved = localStorage.getItem('jmg_aff_clicks');
    return saved ? parseInt(saved, 10) : 142;
  });

  // Filters & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'likes' | 'readTime'>('latest');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Modals & Reader state
  const [activeModal, setActiveModal] = useState<ModalView>('none');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Infinite Scroll / Pagination State
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Category counts calculation
  const postCounts = useMemo(() => {
    const published = posts.filter(p => !p.isDraft);
    const counts: Record<Category | 'All', number> = {
      'All': published.length,
      'Affiliate Marketing': 0,
      'SEO': 0,
      'Blogging': 0,
      'Tech': 0,
      'Entrepreneurship': 0,
    };
    published.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [posts]);

  // Filter & Sort Posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => !post.isDraft) // exclude drafts from reader view
      .filter((post) => {
        if (showBookmarksOnly && !bookmarkedIds.includes(post.id)) return false;
        if (selectedCategory !== 'All' && post.category !== selectedCategory) return false;
        if (selectedDifficulty !== 'All' && post.difficulty !== selectedDifficulty) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(q);
          const matchExcerpt = post.excerpt.toLowerCase().includes(q);
          const matchCategory = post.category.toLowerCase().includes(q);
          const matchTags = post.tags.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchExcerpt && !matchCategory && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.views - a.views;
        if (sortBy === 'likes') return b.likes - a.likes;
        if (sortBy === 'readTime') return a.readTimeMinutes - b.readTimeMinutes;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [posts, selectedCategory, searchQuery, selectedDifficulty, sortBy, showBookmarksOnly, bookmarkedIds]);

  // Paginated Posts for Infinite Scroll
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const hasMorePosts = visibleCount < filteredPosts.length;

  const handleLoadMore = (showAll = false) => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => showAll ? filteredPosts.length : prev + 9);
      setIsLoadingMore(false);
    }, 300);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  // Toggle Like
  const handleLikePost = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isAlreadyLiked = likedIds.includes(postId);

    setLikedIds((prev) =>
      isAlreadyLiked ? prev.filter(id => id !== postId) : [...prev, postId]
    );

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, likes: isAlreadyLiked ? p.likes - 1 : p.likes + 1 };
        }
        return p;
      })
    );
  };

  // Track Affiliate Clicks
  const handleTrackAffiliateClick = (productName: string) => {
    const updated = affiliateClicks + 1;
    setAffiliateClicks(updated);
    localStorage.setItem('jmg_aff_clicks', updated.toString());
  };

  // Post Open Reader
  const handleOpenPost = (post: BlogPost) => {
    // Increment view count
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p));
    setSelectedPost(post);
    setActiveModal('post-reader');
    const path = `/guide/${post.slug}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ postSlug: post.slug }, '', path);
    }
  };

  // Close Reader - restore the base URL
  const handleClosePost = () => {
    setActiveModal('none');
    if (window.location.pathname.startsWith('/guide/')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Paths with real, crawlable URLs (posts are handled separately above)
  const MODAL_PATHS: Partial<Record<ModalView, string>> = {
    privacy: '/privacy',
    terms: '/terms',
    contact: '/contact',
  };

  const handleOpenModal = (view: ModalView) => {
    setActiveModal(view);
    const path = MODAL_PATHS[view];
    if (path && window.location.pathname !== path) {
      window.history.pushState({ modal: view }, '', path);
    } else if (view === 'none' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/guide/')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Deep-link support: opening https://jaysmoneyguides.com/guide/<slug>
  // directly (or hitting Back/Forward) should show the matching post.
  useEffect(() => {
    const resolveFromPath = () => {
      const path = window.location.pathname;
      const postMatch = path.match(/^\/guide\/([^/]+)\/?$/);
      if (postMatch) {
        const post = posts.find(p => p.slug === postMatch[1] && !p.isDraft);
        if (post) {
          setSelectedPost(post);
          setActiveModal('post-reader');
          return;
        }
      }

      const modalEntry = (Object.entries(MODAL_PATHS) as [ModalView, string][])
        .find(([, p]) => p === path.replace(/\/$/, '') || p === path);
      if (modalEntry) {
        setSelectedPost(null);
        setActiveModal(modalEntry[0]);
        return;
      }

      setSelectedPost(null);
      setActiveModal(prev => (prev === 'post-reader' ? 'none' : prev));
    };

    resolveFromPath();
    window.addEventListener('popstate', resolveFromPath);
    return () => window.removeEventListener('popstate', resolveFromPath);
  }, [posts]);

  // Add Comment
  const handleAddComment = (postId: string, authorName: string, content: string) => {
    const newComment: Comment = {
      id: 'c-' + Date.now(),
      postId,
      authorName,
      content,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setComments(prev => [newComment, ...prev]);
  };

  // Save / Update Post from Admin Console
  const handleSavePost = (updatedPost: BlogPost) => {
    setPosts(prev => {
      const exists = prev.some(p => p.id === updatedPost.id);
      if (exists) {
        return prev.map(p => p.id === updatedPost.id ? updatedPost : p);
      }
      return [updatedPost, ...prev];
    });
  };

  // Delete Post from Admin Console
  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // Add Contact Message
  const handleNewContactMessage = (msg: ContactMessage) => {
    setContactMessages(prev => [msg, ...prev]);
  };

  // Mark Message Read
  const handleMarkMessageRead = (msgId: string) => {
    setContactMessages(prev => prev.map(m => m.id === msgId ? { ...m, read: true } : m));
  };

  // Delete Contact Message
  const handleDeleteMessage = (msgId: string) => {
    setContactMessages(prev => prev.filter(m => m.id !== msgId));
  };

  // Add Subscriber
  const handleSubscribeSuccess = (email: string) => {
    const newSub: Subscriber = {
      id: 'sub-' + Date.now(),
      email,
      subscribedAt: new Date().toISOString().split('T')[0],
      source: 'Newsletter Form',
    };
    setSubscribers(prev => [newSub, ...prev.filter(s => s.email !== email)]);
  };

  // Reset Stats to Production Mode (Real User Tracking Baseline 0)
  const handleResetStatsToProduction = () => {
    setIsProductionMode(true);
    localStorage.setItem('jmg_prod_mode', 'true');

    // Reset Affiliate Clicks
    setAffiliateClicks(0);
    localStorage.setItem('jmg_aff_clicks', '0');

    // Reset views and likes across all posts to 0 baseline
    setPosts(prev => {
      const resetPosts = prev.map(p => ({
        ...p,
        views: 0,
        likes: 0,
      }));
      localStorage.setItem('jmg_posts', JSON.stringify(resetPosts));
      return resetPosts;
    });

    // Clear inbox, subscribers, comments, and user likes/bookmarks
    setSubscribers([]);
    localStorage.setItem('jmg_subscribers', JSON.stringify([]));

    setContactMessages([]);
    localStorage.setItem('jmg_contact_msgs', JSON.stringify([]));

    setComments([]);
    localStorage.setItem('jmg_comments', JSON.stringify([]));

    setLikedIds([]);
    localStorage.setItem('jmg_likes', JSON.stringify([]));

    setBookmarkedIds([]);
    localStorage.setItem('jmg_bookmarks', JSON.stringify([]));
  };

  // Restore Sample Demo Data
  const handleSeedDemoStats = () => {
    setIsProductionMode(false);
    localStorage.setItem('jmg_prod_mode', 'false');

    setAffiliateClicks(142);
    localStorage.setItem('jmg_aff_clicks', '142');

    setPosts(INITIAL_POSTS);
    localStorage.setItem('jmg_posts', JSON.stringify(INITIAL_POSTS));

    setSubscribers([
      { id: 'sub-1', email: 'alex@startupgrowth.com', subscribedAt: '2026-07-21', source: 'Hero Form' },
      { id: 'sub-2', email: 'sarah.m@seoagency.net', subscribedAt: '2026-07-23', source: 'Footer Form' }
    ]);
    localStorage.setItem('jmg_subscribers', JSON.stringify([
      { id: 'sub-1', email: 'alex@startupgrowth.com', subscribedAt: '2026-07-21', source: 'Hero Form' },
      { id: 'sub-2', email: 'sarah.m@seoagency.net', subscribedAt: '2026-07-23', source: 'Footer Form' }
    ]));

    setContactMessages([
      {
        id: 'msg-1',
        name: 'David Miller',
        email: 'david@solopreneur.io',
        subject: 'Sponsorship & Brand Partnership Inquiry',
        message: 'Hi Jay, love your SaaS affiliate blueprints! We would love to sponsor a featured review guide for our AI copywriting tool.',
        createdAt: '2026-07-22',
        read: false,
      }
    ]);
    localStorage.setItem('jmg_contact_msgs', JSON.stringify([
      {
        id: 'msg-1',
        name: 'David Miller',
        email: 'david@solopreneur.io',
        subject: 'Sponsorship & Brand Partnership Inquiry',
        message: 'Hi Jay, love your SaaS affiliate blueprints! We would love to sponsor a featured review guide for our AI copywriting tool.',
        createdAt: '2026-07-22',
        read: false,
      }
    ]));
  };

  // Stats for Admin
  const totalViews = useMemo(() => posts.reduce((sum, p) => sum + p.views, 0), [posts]);
  const totalLikes = useMemo(() => posts.reduce((sum, p) => sum + p.likes, 0), [posts]);

  const stats: AnalyticsStats = {
    totalViews,
    totalLikes,
    affiliateClicks,
    totalSubscribers: subscribers.length,
  };

  const featuredPost = useMemo(() => {
    return posts.find(p => p.featured && !p.isDraft) || posts[0];
  }, [posts]);

  const bookmarkedPostsList = useMemo(() => {
    return posts.filter(p => bookmarkedIds.includes(p.id));
  }, [posts, bookmarkedIds]);

  const likedPostsList = useMemo(() => {
    return posts.filter(p => likedIds.includes(p.id));
  }, [posts, likedIds]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      {/* Dynamic SEO Meta & Schema Manager */}
      <SEOHead
        post={activeModal === 'post-reader' ? selectedPost : null}
        category={selectedCategory}
        searchQuery={searchQuery}
      />
      
      {/* Sleek Minimalist Navbar */}
      <Navbar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setShowBookmarksOnly(false);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        openModal={handleOpenModal}
        bookmarkedCount={bookmarkedIds.length}
        onToggleBookmarksOnly={() => setShowBookmarksOnly(!showBookmarksOnly)}
        showBookmarksOnly={showBookmarksOnly}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Hero Header */}
      {!showBookmarksOnly && searchQuery === '' && selectedCategory === 'All' && (
        <HeroHeader 
          onSubscribeSuccess={handleSubscribeSuccess} 
          onSelectPost={(postId) => {
            const target = posts.find(p => p.id === postId);
            if (target) {
              handleOpenPost(target);
            }
          }}
        />
      )}

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <Dashboard posts={posts} />

        {/* Category Tabs Section */}
        <div className="space-y-4">
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setShowBookmarksOnly(false);
            }}
            postCounts={postCounts}
          />

          {/* Filter, Sort & Search Toolbar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
            
            {/* Active Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300">
                Showing <strong className="text-emerald-400">{filteredPosts.length}</strong> {showBookmarksOnly ? 'saved' : 'actionable'} guides
              </span>

              {showBookmarksOnly && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Bookmark className="w-3 h-3" /> Saved Bookmarks
                  <button onClick={() => setShowBookmarksOnly(false)} className="hover:text-white ml-1">✕</button>
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-white ml-1">✕</button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-200 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-white ml-1">✕</button>
                </span>
              )}
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Difficulty Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <label htmlFor="app-filter-difficulty" className="sr-only">Filter by Difficulty</label>
                <select
                  id="app-filter-difficulty"
                  name="selectedDifficulty"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Sort By Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <label htmlFor="app-sort-by" className="cursor-pointer">Sort:</label>
                <select
                  id="app-sort-by"
                  name="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="latest">Latest Published</option>
                  <option value="popular">Most Views</option>
                  <option value="likes">Most Liked</option>
                  <option value="readTime">Shortest Read</option>
                </select>
              </div>

              {/* Grid / List Layout Toggle */}
              <div className="hidden sm:flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewLayout === 'grid' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewLayout === 'list' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Featured Post Hero Card (Only on All/Home without active search) */}
        {!showBookmarksOnly && searchQuery === '' && selectedCategory === 'All' && featuredPost && (
          <div 
            onClick={() => handleOpenPost(featuredPost)}
            className="group relative bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-2xl transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Featured Master Blueprint
                </span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {featuredPost.category}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                {featuredPost.title}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                <span className="font-bold text-white">{featuredPost.author.name}</span>
                <span>•</span>
                <span>{featuredPost.publishedAt}</span>
                <span>•</span>
                <span className="text-emerald-400">{featuredPost.readTimeMinutes} min read</span>
              </div>
            </div>

            <div className="lg:col-span-5 aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        )}

        {/* Post Grid Section */}
        {filteredPosts.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Guides Found</h3>
            <p className="text-xs text-slate-400">
              We couldn't find any articles matching your search query or filter settings. Try clearing search filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSelectedDifficulty('All');
                setShowBookmarksOnly(false);
              }}
              className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className={`grid gap-6 ${
              viewLayout === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenPost={handleOpenPost}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onLikePost={handleLikePost}
                  isLiked={likedIds.includes(post.id)}
                />
              ))}
            </div>

            {/* Infinite Scroll / Load More Action */}
            {hasMorePosts && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                <button
                  onClick={() => handleLoadMore(false)}
                  disabled={isLoadingMore}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-lg hover:border-emerald-500/50 disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      Loading More Actionable Guides...
                    </>
                  ) : (
                    <>
                      Load More Guides (+9)
                      <ChevronDown className="w-4 h-4 text-emerald-400" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleLoadMore(true)}
                  disabled={isLoadingMore}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Show All {filteredPosts.length} Guides
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      <Suspense fallback={null}>
        {/* Article Reader Modal */}
        {activeModal === 'post-reader' && selectedPost && (
          <PostReaderModal
            post={selectedPost}
            onClose={handleClosePost}
            isBookmarked={bookmarkedIds.includes(selectedPost.id)}
            onToggleBookmark={handleToggleBookmark}
            isLiked={likedIds.includes(selectedPost.id)}
            onLikePost={handleLikePost}
            comments={comments}
            onAddComment={handleAddComment}
            onTrackAffiliateClick={handleTrackAffiliateClick}
          />
        )}

        {/* Mandatory Pages Modal (Privacy, Terms, Contact) */}
        <MandatoryPagesModal
          view={activeModal}
          onClose={() => handleOpenModal('none')}
          onSelectTab={(tab) => handleOpenModal(tab)}
          onNewContactMessage={handleNewContactMessage}
        />

        {/* Admin Console Overlay */}
        <AdminConsole
          isOpen={activeModal === 'admin'}
          onClose={() => setActiveModal('none')}
          currentUser={currentUser}
          posts={posts}
          onSavePost={handleSavePost}
          onDeletePost={handleDeletePost}
          contactMessages={contactMessages}
          onMarkMessageRead={handleMarkMessageRead}
          onDeleteMessage={handleDeleteMessage}
          subscribers={subscribers}
          stats={stats}
          isProductionMode={isProductionMode}
          onResetStatsToProduction={handleResetStatsToProduction}
          onSeedDemoStats={handleSeedDemoStats}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={activeModal === 'auth'}
          onClose={() => setActiveModal('none')}
          onLoginSuccess={(user) => {
            handleLoginSuccess(user);
            setActiveModal('none');
          }}
        />

        {/* Firestore Image & Asset Database Modal */}
        <MediaDatabaseModal
          isOpen={activeModal === 'media-database'}
          onClose={() => setActiveModal('none')}
        />

        {/* User Profile & Saved Guides Modal */}
        <UserProfileModal
          isOpen={activeModal === 'profile'}
          onClose={() => setActiveModal('none')}
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          bookmarkedPosts={bookmarkedPostsList}
          likedPosts={likedPostsList}
          onOpenReader={(post) => handleOpenPost(post)}
        />

        {/* Non-Intrusive Exit-Intent / 30s Activity Newsletter Capture Modal */}
        <NewsletterModal onSubscribeSuccess={handleSubscribeSuccess} />

        {/* Cookie Consent Popup Banner */}
        <CookieConsent onOpenPrivacy={() => setActiveModal('privacy')} />
      </Suspense>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setShowBookmarksOnly(false);
        }}
        openModal={handleOpenModal}
        onSubscribeSuccess={handleSubscribeSuccess}
      />

    </div>
  );
}
