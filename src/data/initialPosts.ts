import { BlogPost } from '../types';
import { AFFILIATE_POSTS } from './posts/affiliatePosts';
import { SEO_POSTS } from './posts/seoPosts';
import { BLOGGING_POSTS } from './posts/bloggingPosts';
import { TECH_POSTS } from './posts/techPosts';
import { ENTREPRENEURSHIP_POSTS } from './posts/entrepreneurshipPosts';

export const INITIAL_POSTS: BlogPost[] = [
  ...ENTREPRENEURSHIP_POSTS,
  ...SEO_POSTS,
  ...AFFILIATE_POSTS,
  ...BLOGGING_POSTS,
  ...TECH_POSTS
];
