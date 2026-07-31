import React from 'react';
import { BlogPost } from '../types';
import { Clock, Eye, Heart, Bookmark, ExternalLink, ArrowUpRight, CheckCircle2, Star } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface PostCardProps {
  post: BlogPost;
  onOpenPost: (post: BlogPost) => void;
  isBookmarked: boolean;
  onToggleBookmark: (postId: string, e: React.MouseEvent) => void;
  onLikePost: (postId: string, e: React.MouseEvent) => void;
  isLiked: boolean;
}

export const PostCard: React.FC<PostCardProps> = React.memo(({
  post,
  onOpenPost,
  isBookmarked,
  onToggleBookmark,
  onLikePost,
  isLiked,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Affiliate Marketing': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SEO': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Blogging': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Tech': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Entrepreneurship': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'Intermediate': return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'Advanced': return 'bg-rose-950/80 text-rose-400 border-rose-800';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenPost(post);
  };

  return (
    <article
      className="group relative bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col transform hover:-translate-y-1"
    >
      {/* Full-card link: gives the card a real, crawlable URL and native
          keyboard/focus support, while the bookmark/like buttons sit above
          it (z-20) so they remain independently clickable. */}
      <a
        href={`/guide/${post.slug}`}
        onClick={handleCardClick}
        aria-label={`Read guide: ${post.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      />
      {/* Cover Image Header */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
        <SafeImage
          src={post.coverImage || '/images/affiliate-marketing-guide-cover.webp'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Category Pill & Difficulty */}
        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
          {post.rating && (
            <span className="bg-slate-950/80 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {post.rating.toFixed(1)} {post.ratingCount ? `(${post.ratingCount})` : ''}
            </span>
          )}
          {post.featured && (
            <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
              FEATURED
            </span>
          )}
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => onToggleBookmark(post.id, e)}
          className={`absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all ${
            isBookmarked
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-900/80 border border-slate-700/60'
          }`}
          title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark post'}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Bottom Metadata Bar over Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
          <span className={`font-semibold px-2 py-0.5 rounded-md border text-[11px] ${getDifficultyColor(post.difficulty)}`}>
            {post.difficulty}
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            {post.readTimeMinutes} min read
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Post Title */}
          <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2.5">
            {post.title}
          </h2>

          {/* Post Excerpt */}
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4">
            {post.excerpt}
          </p>

          {/* Key Takeaways Preview */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 mb-4">
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Actionable Takeaway
              </p>
              <p className="text-xs text-slate-300 line-clamp-1 italic">
                "{post.keyTakeaways[0]}"
              </p>
            </div>
          )}

          {/* Recommended Affiliate Deal Badge if present */}
          {post.affiliateProduct && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-lg text-xs font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Includes Recommended Tool: <strong>{post.affiliateProduct.name}</strong></span>
            </div>
          )}
        </div>

        {/* Author & Footer Engagement Stats */}
        <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <SafeImage
              src={post.author.avatar || '/images/jaysmoneyguides-logo.webp'}
              alt={post.author.name}
              className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
              loading="lazy"
              decoding="async"
              width="28"
              height="28"
            />
            <div>
              <p className="font-bold text-slate-200 text-xs">{post.author.name}</p>
              <p className="text-[10px] text-slate-400">{post.publishedAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3.5 h-3.5" /> {post.views}
            </span>
            <button
              onClick={(e) => onLikePost(post.id, e)}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
              className={`relative z-20 flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                isLiked
                  ? 'text-rose-400 bg-rose-500/10 font-bold'
                  : 'hover:text-rose-400 hover:bg-slate-700/50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
              {post.likes}
            </button>
            <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});
