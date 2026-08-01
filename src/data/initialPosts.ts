import { BlogPost } from '../types';
import { AFFILIATE_POSTS } from './posts/affiliatePosts';
import { SEO_POSTS } from './posts/seoPosts';
import { BLOGGING_POSTS } from './posts/bloggingPosts';
import { TECH_POSTS } from './posts/techPosts';
import { ENTREPRENEURSHIP_POSTS } from './posts/entrepreneurshipPosts';

const ALL_RAW_POSTS: BlogPost[] = [
  ...AFFILIATE_POSTS,
  ...SEO_POSTS,
  ...ENTREPRENEURSHIP_POSTS,
  ...BLOGGING_POSTS,
  ...TECH_POSTS
];

// Reset all mock data viewed, liked, rating, and votes to 0 baseline
export const INITIAL_POSTS: BlogPost[] = ALL_RAW_POSTS.map(post => ({
  ...post,
  views: 0,
  likes: 0,
  rating: 0,
  ratingCount: 0,
}));
