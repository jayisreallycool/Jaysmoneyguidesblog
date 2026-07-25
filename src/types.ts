export type Category = 'Affiliate Marketing' | 'SEO' | 'Blogging' | 'Tech' | 'Entrepreneurship';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface AffiliateProduct {
  name: string;
  description: string;
  link: string;
  discountCode?: string;
  badge?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown / formatted HTML
  category: Category;
  tags: string[];
  coverImage: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  difficulty: DifficultyLevel;
  featured?: boolean;
  views: number;
  likes: number;
  rating?: number;
  ratingCount?: number;
  seoKeywords?: string[];
  metaDescription?: string;
  keyTakeaways: string[];
  affiliateProduct?: AffiliateProduct;
  isDraft?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
}

export interface CategoryTab {
  id: Category | 'All';
  label: string;
  iconName: string;
}

export type ModalView = 'none' | 'privacy' | 'terms' | 'contact' | 'admin' | 'post-reader' | 'auth' | 'profile' | 'media-database';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt: string;
  bio?: string;
  role?: string;
}

export interface AnalyticsStats {
  totalViews: number;
  totalLikes: number;
  affiliateClicks: number;
  totalSubscribers: number;
}
