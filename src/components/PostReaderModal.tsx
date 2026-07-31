import React, { useState } from 'react';
import { BlogPost, Comment } from '../types';
import { AffiliateCalculator } from './AffiliateCalculator';
import { sanitizeInput, sanitizeUrl, checkRateLimit, logSecurityEvent } from '../utils/security';
import { 
  X, 
  Clock, 
  Eye, 
  Heart, 
  Bookmark, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Tag, 
  Sparkles,
  ArrowLeft,
  Star,
  ShieldAlert
} from 'lucide-react';

interface PostReaderModalProps {
  post: BlogPost;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (postId: string) => void;
  isLiked: boolean;
  onLikePost: (postId: string) => void;
  comments: Comment[];
  onAddComment: (postId: string, name: string, text: string) => void;
  onTrackAffiliateClick?: (productName: string) => void;
}

export const PostReaderModal: React.FC<PostReaderModalProps> = ({
  post,
  onClose,
  isBookmarked,
  onToggleBookmark,
  isLiked,
  onLikePost,
  comments,
  onAddComment,
  onTrackAffiliateClick,
}) => {
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const handleRatePost = (stars: number) => {
    setUserRating(stars);
    setHasRated(true);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitError(null);

    // Rate Limit Check (max 3 comments per minute)
    const rl = checkRateLimit('post_comment', 3, 60000);
    if (!rl.allowed) {
      const msg = `Rate limit exceeded. Please wait ${rl.retryAfterSec}s before posting another comment.`;
      setRateLimitError(msg);
      logSecurityEvent('RATE_LIMIT_BLOCKED', 'Comment submission throttled', msg);
      return;
    }

    const cleanName = sanitizeInput(commentName.trim());
    const cleanText = sanitizeInput(commentText.trim());

    if (!cleanName || !cleanText) return;

    // Detect if potential XSS attempt was cleaned
    if (commentName !== cleanName || commentText !== cleanText) {
      logSecurityEvent('XSS_PREVENTED', 'HTML/Script tags stripped from user comment', `Author: ${cleanName}`);
    }

    onAddComment(post.id, cleanName, cleanText);
    setCommentName('');
    setCommentText('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const postComments = comments.filter((c) => c.postId === post.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Sticky Header Controls */}
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs sm:text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(post.id)}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Bookmark Post"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              aria-label="Close article"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-8">
          
          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                {post.category}
              </span>
              <span className="bg-slate-800 text-slate-300 font-medium px-3 py-1 rounded-full border border-slate-700">
                {post.difficulty} Level
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> {post.readTimeMinutes} min read
              </span>
              <div className="bg-amber-950/60 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 ml-auto">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{post.rating ? post.rating.toFixed(1) : '4.9'} / 5.0</span>
                <span className="text-[10px] text-amber-400/80">({(post.ratingCount || 120) + (hasRated ? 1 : 0)} votes)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author Information */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar || '/images/jaysmoneyguides-logo.webp'}
                  alt={post.author.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/jaysmoneyguides-logo.webp';
                  }}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/40"
                />
                <div>
                  <p className="font-bold text-white text-sm">{post.author.name}</p>
                  <p className="text-xs text-slate-400">{post.author.role} • Published {post.publishedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-slate-400" /> {post.views}
                </span>
                <button
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    isLiked
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400' : ''}`} />
                  {post.likes}
                </button>
              </div>
            </div>
          </header>

          {/* Hero Cover Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-[21/9] bg-slate-950">
            <img
              src={post.coverImage || '/images/affiliate-marketing-guide-cover.webp'}
              alt={post.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/affiliate-marketing-guide-cover.webp';
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Takeaways Box */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Actionable Key Takeaways
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-200">
                {post.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Embedded Affiliate Calculator Tool for Affiliate/SEO/Tech Guides */}
          {(post.category === 'Affiliate Marketing' || post.category === 'SEO' || post.category === 'Blogging') && (
            <AffiliateCalculator />
          )}

          {/* Article Main Text */}
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-emerald-300 prose-ul:text-slate-300 text-base space-y-4">
            {post?.content && typeof post.content === 'string' ? post.content.split(/\r?\n\r?\n/).map((paragraph, index) => {
              if (typeof paragraph !== 'string') return null;
              const trimmedParagraph = paragraph.trim();
              if (!trimmedParagraph) return null;
              
              // Handle headers
              if (trimmedParagraph.startsWith('# ')) {
                return <h2 key={index} className="text-2xl font-black text-white mt-8 mb-4 border-b border-slate-800 pb-2">{trimmedParagraph.replace('# ', '')}</h2>;
              }
              if (trimmedParagraph.startsWith('## ')) {
                return <h3 key={index} className="text-xl font-bold text-emerald-400 mt-6 mb-3">{trimmedParagraph.replace('## ', '')}</h3>;
              }
              if (trimmedParagraph.startsWith('### ')) {
                return <h4 key={index} className="text-lg font-bold text-white mt-4 mb-2">{trimmedParagraph.replace('### ', '')}</h4>;
              }

              // Handle images
              if (trimmedParagraph.startsWith('![')) {
                const imgMatch = trimmedParagraph.match(/^!\[(.*?)\]\((.*?)\)/);
                if (imgMatch) {
                  const altText = imgMatch[1];
                  const imgSrc = imgMatch[2];
                  return (
                    <div key={index} className="my-6 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-950">
                      <img
                        src={imgSrc}
                        alt={altText}
                        className="w-full h-auto object-cover max-h-[500px]"
                        loading="lazy"
                        decoding="async"
                      />
                      {altText && (
                        <p className="text-center text-xs text-slate-400 py-2 bg-slate-950/80 border-t border-slate-800 font-medium italic">
                          {altText}
                        </p>
                      )}
                    </div>
                  );
                }
              }
              
              // Handle lists
              if (trimmedParagraph.startsWith('* ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1 text-slate-300 my-3">
                    {trimmedParagraph.split('\n').map((li, lidx) => (
                      <li key={lidx}>{li.replace('* ', '')}</li>
                    ))}
                  </ul>
                );
              }

              return <p key={index} className="text-slate-300 leading-relaxed">{trimmedParagraph}</p>;
            }) : null}
          </div>

          {/* Recommended Affiliate Offer Card */}
          {post.affiliateProduct && (
            <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  {post.affiliateProduct.badge || 'Jay\'s Recommended Tool'}
                </span>
                <h4 className="text-lg font-bold text-white">{post.affiliateProduct.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{post.affiliateProduct.description}</p>
                {post.affiliateProduct.discountCode && (
                  <p className="text-xs text-emerald-300 font-medium">
                    Promo Code: <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 border border-slate-800">{post.affiliateProduct.discountCode}</code>
                  </p>
                )}
              </div>
              <a
                href={post.affiliateProduct.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrackAffiliateClick && onTrackAffiliateClick(post.affiliateProduct!.name)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 shrink-0 w-full sm:w-auto justify-center"
              >
                Claim Exclusive Deal
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Post Tags & Rating Widget */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-slate-400" />
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive Rating Component */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Rate this Guide & Strategy
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Did this blueprint help your online business? Leave a rating for Jay.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatePost(star)}
                    className="p-1.5 hover:scale-125 transition-transform focus:outline-none"
                    title={`Rate ${star} Stars`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (userRating || (post.rating ? Math.round(post.rating) : 5))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                {hasRated && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    Thank you!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <section className="pt-8 border-t border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Discussion & Questions ({postComments.length})
              </h3>
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
              {rateLimitError && (
                <div className="bg-rose-500/20 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{rateLimitError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="comment-author-name" className="sr-only">Your Name or Handle</label>
                  <input
                    id="comment-author-name"
                    name="commentName"
                    type="text"
                    required
                    placeholder="Your Name / Handle"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="comment-content-text" className="sr-only">Comment message</label>
                <textarea
                  id="comment-content-text"
                  name="commentText"
                  required
                  rows={3}
                  placeholder="Ask Jay a question or share your experience with this strategy..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all ml-auto"
              >
                <Send className="w-4 h-4" />
                Post Comment
              </button>
            </form>

            {/* Existing Comments List */}
            <div className="space-y-3">
              {postComments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">
                  No comments yet. Be the first entrepreneur to join the conversation!
                </p>
              ) : (
                postComments.map((comment) => (
                  <div key={comment.id} className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300">{comment.authorName}</span>
                      <span className="text-slate-400">{comment.createdAt}</span>
                    </div>
                    <p className="text-sm text-slate-200">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
