import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Bookmark, 
  Shield, 
  FileText, 
  Mail, 
  Lock, 
  Menu, 
  X, 
  Sparkles,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { Category, ModalView, User } from '../types';

interface NavbarProps {
  selectedCategory: Category | 'All';
  onSelectCategory: (category: Category | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  openModal: (view: ModalView) => void;
  bookmarkedCount: number;
  onToggleBookmarksOnly: () => void;
  showBookmarksOnly: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  openModal,
  bookmarkedCount,
  onToggleBookmarksOnly,
  showBookmarksOnly,
  currentUser,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const categories: Category[] = [
    'Affiliate Marketing',
    'SEO',
    'Blogging',
    'Tech',
    'Entrepreneurship',
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                onSelectCategory('All');
                if (showBookmarksOnly) onToggleBookmarksOnly();
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <DollarSign className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  Jays<span className="text-emerald-400">Money</span>Guides
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                  Actionable Business Blueprint
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search affiliate strategies, SEO tips, tech tools..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => {
                onSelectCategory('All');
                if (showBookmarksOnly) onToggleBookmarksOnly();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedCategory === 'All' && !showBookmarksOnly
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Guides
            </button>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory !== 'All' && !showBookmarksOnly
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Categories
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isCategoryDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50"
                  onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onSelectCategory(cat);
                        if (showBookmarksOnly) onToggleBookmarksOnly();
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                        selectedCategory === cat && !showBookmarksOnly
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mandatory Pages Triggers */}
            <button
              onClick={() => openModal('contact')}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              Contact Us
            </button>

            <button
              onClick={() => openModal('privacy')}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Privacy
            </button>

            <button
              onClick={() => openModal('terms')}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Terms
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Bookmarks Toggle Button */}
            <button
              onClick={onToggleBookmarksOnly}
              className={`relative p-2 rounded-xl border transition-all ${
                showBookmarksOnly
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
              }`}
              title="Saved Reading List"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarkedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-400 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {/* Auth / Account Controls */}
            {!currentUser ? (
              <button
                onClick={() => openModal('auth')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all border border-slate-700/80 shadow-sm hover:border-emerald-500/50 group"
              >
                {/* Colored Google G Icon Badge */}
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                </div>
                <span>Sign In / Register</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="bg-slate-800 hover:bg-slate-700/90 text-white font-bold p-1 pr-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-all"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-400"
                  />
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-52 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-700/80 mb-1">
                      <p className="text-xs font-extrabold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        openModal('profile');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                    >
                      My Profile & Saved Guides
                    </button>

                    <button
                      onClick={() => {
                        openModal('admin');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Admin Console
                    </button>

                    <div className="border-t border-slate-700/80 my-1" />

                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Admin Console Direct Button */}
            <button
              onClick={() => openModal('admin')}
              className="hidden sm:flex bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Mobile Auth Button */}
          {!currentUser ? (
            <button
              onClick={() => {
                openModal('auth');
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              Sign In or Register (Google SSO)
            </button>
          ) : (
            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg" />
                <div>
                  <p className="text-xs font-bold text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  openModal('profile');
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg"
              >
                Profile
              </button>
            </div>
          )}
          {/* Mobile Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Categories list */}
          <div>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectCategory('All');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm text-left ${
                  selectedCategory === 'All' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                All Posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm text-left truncate ${
                    selectedCategory === cat ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mandatory pages */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                openModal('contact');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-slate-300 py-1.5"
            >
              <Mail className="w-4 h-4 text-emerald-400" /> Contact Form
            </button>
            <button
              onClick={() => {
                openModal('privacy');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-slate-300 py-1.5"
            >
              <Shield className="w-4 h-4 text-slate-400" /> Privacy Policy
            </button>
            <button
              onClick={() => {
                openModal('terms');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-slate-300 py-1.5"
            >
              <FileText className="w-4 h-4 text-slate-400" /> Terms of Service
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
