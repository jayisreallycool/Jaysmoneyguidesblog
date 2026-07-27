import React, { useMemo } from 'react';
import { BlogPost } from '../types';

interface DashboardProps {
  posts: BlogPost[];
}

export const Dashboard = React.memo(({ posts }: DashboardProps) => {
  const categories = ['Affiliate Marketing', 'SEO', 'Blogging', 'Tech', 'Entrepreneurship'];

  const postsByCategory = useMemo(() => {
    return categories.reduce((acc, cat) => {
      // Show only top 3 posts to keep it compact
      acc[cat] = posts.filter((p) => p.category === cat).slice(0, 3);
      return acc;
    }, {} as Record<string, BlogPost[]>);
  }, [posts]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 my-6">
      <h2 className="text-xl font-black text-white mb-5 tracking-tight">Quick Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <div key={category} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
            <h3 className="font-black text-emerald-400 text-xs uppercase tracking-wider mb-3">{category}</h3>
            <ul className="space-y-1.5">
              {postsByCategory[category].map((post) => (
                  <li key={post.id} className="text-sm font-semibold text-slate-300 hover:text-white cursor-pointer truncate">
                    {post.title}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
});
