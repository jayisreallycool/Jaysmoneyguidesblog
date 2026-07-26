import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Bookmark, 
  Heart, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  Edit3, 
  Check, 
  Clock,
  KeyRound
} from 'lucide-react';
import { User, BlogPost } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
  bookmarkedPosts: BlogPost[];
  likedPosts: BlogPost[];
  onOpenReader: (post: BlogPost) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  bookmarkedPosts,
  likedPosts,
  onOpenReader,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookmarks' | 'likes'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || 'Passionate creator & digital business builder.');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name,
      bio,
      avatar: avatar || user.avatar,
    };
    onUpdateUser(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-y-auto flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full text-[10px] font-black border-2 border-slate-900">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{user.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {user.role || 'VIP Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user.email}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Member since {user.createdAt || '2026'}
                {user.provider === 'google' && (
                  <span className="text-slate-400 ml-2 border-l border-slate-700 pl-2">
                    Signed in via Google
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mt-5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Account Info
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved ({bookmarkedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'likes'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Liked ({likedPosts.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {savedSuccess && (
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400" />
              Profile updated successfully!
            </div>
          )}

          {/* TAB 1: Profile Edit */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                    <div>
                      <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Bio / Description</p>
                      <p className="text-sm text-slate-300 mt-1">{user.bio || 'No bio added yet.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
                      <div>
                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Account Method</p>
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5 capitalize">
                          {user.provider} Login
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Status</p>
                        <p className="text-xs text-white font-semibold mt-0.5">
                          Active Member
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Edit3 className="w-4 h-4 text-emerald-400" />
                      Edit Profile Info
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label htmlFor="profile-name-input" className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                    <input
                      id="profile-name-input"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-avatar-input" className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL</label>
                    <input
                      id="profile-avatar-input"
                      name="avatar"
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-bio-input" className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
                    <textarea
                      id="profile-bio-input"
                      name="bio"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {bookmarkedPosts.length === 0 ? (
                <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 p-6">
                  <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No saved guides yet</p>
                  <p className="text-xs text-slate-500 mt-1">Bookmark any blueprint while reading to save it here.</p>
                </div>
              ) : (
                bookmarkedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onOpenReader(post);
                      onClose();
                    }}
                    className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {post.category}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                          {post.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">{post.readTimeMinutes} min read</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Likes */}
          {activeTab === 'likes' && (
            <div className="space-y-3">
              {likedPosts.length === 0 ? (
                <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 p-6">
                  <Heart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No liked guides yet</p>
                  <p className="text-xs text-slate-500 mt-1">Click the heart button on any article to keep track here.</p>
                </div>
              ) : (
                likedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      onOpenReader(post);
                      onClose();
                    }}
                    className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {post.category}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                          {post.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">{post.likes} Likes</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
