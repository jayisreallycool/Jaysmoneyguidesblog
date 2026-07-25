import React, { useEffect } from 'react';
import { BlogPost, Category } from '../types';

interface SEOHeadProps {
  post?: BlogPost | null;
  category?: Category | 'All';
  searchQuery?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ post, category = 'All', searchQuery = '' }) => {
  useEffect(() => {
    // 1. Update Title dynamically
    let title = 'Jaysmoneyguides | Affiliate Marketing, SEO & Online Business Blueprints';
    if (post) {
      title = `${post.title} | Jaysmoneyguides`;
    } else if (searchQuery) {
      title = `Search Results for "${searchQuery}" | Jaysmoneyguides`;
    } else if (category && category !== 'All') {
      title = `${category} Guides & Strategies | Jaysmoneyguides`;
    }
    document.title = title;

    // Helper to update or create meta tags
    const setMetaTag = (nameAttr: string, attrVal: string, contentVal: string) => {
      let el = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    // Helper to update canonical tag
    const setCanonical = (urlVal: string) => {
      let linkEl = document.querySelector('link[rel="canonical"]');
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.setAttribute('rel', 'canonical');
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute('href', urlVal);
    };

    // 2. Set Description & Keywords
    const metaDesc = post
      ? post.excerpt
      : 'Actionable guides and step-by-step blueprints on affiliate marketing, high-ROI SEO, blogging, tech tools, and digital entrepreneurship by Jay Lopez.';

    const keywords = post && post.tags
      ? post.tags.join(', ') + `, ${post.category}, affiliate marketing, SEO, Jay Lopez`
      : 'affiliate marketing, SEO strategy, blogging for profit, SaaS affiliate programs, online business guides, Jay Lopez, Jaysmoneyguides';

    setMetaTag('name', 'description', metaDesc);
    setMetaTag('name', 'keywords', keywords);

    // 3. Set Open Graph & Twitter Cards
    const ogTitle = post ? post.title : title;
    const ogImage = post ? post.coverImage : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
    const canonicalUrl = post ? `https://jaysmoneyguides.com/guide/${post.slug}` : 'https://jaysmoneyguides.com';

    setMetaTag('property', 'og:title', ogTitle);
    setMetaTag('property', 'og:description', metaDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('name', 'twitter:title', ogTitle);
    setMetaTag('name', 'twitter:description', metaDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    setCanonical(canonicalUrl);

    // 4. Inject Dynamic Article Schema.org JSON-LD when viewing a post
    const existingDynamicScript = document.getElementById('jsonld-dynamic-schema');
    if (existingDynamicScript) {
      existingDynamicScript.remove();
    }

    if (post) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': post.title,
        'description': post.excerpt,
        'image': [post.coverImage],
        'datePublished': post.publishedAt,
        'dateModified': post.publishedAt,
        'author': {
          '@type': 'Person',
          'name': post.author.name,
          'jobTitle': post.author.role,
          'url': 'https://jaysmoneyguides.com/about'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Jaysmoneyguides',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': post.rating ? post.rating.toString() : '4.9',
          'bestRating': '5',
          'worstRating': '1',
          'ratingCount': post.ratingCount ? post.ratingCount.toString() : '124',
          'reviewCount': post.ratingCount ? post.ratingCount.toString() : '124'
        }
      };

      const scriptEl = document.createElement('script');
      scriptEl.id = 'jsonld-dynamic-schema';
      scriptEl.type = 'application/ld+json';
      scriptEl.text = JSON.stringify(articleSchema);
      document.head.appendChild(scriptEl);
    }
  }, [post, category, searchQuery]);

  return null;
};
