import React from 'react';
import { Category, CategoryTab } from '../types';
import { 
  Layers, 
  DollarSign, 
  Search, 
  BookOpen, 
  Cpu, 
  Briefcase,
  ChevronRight
} from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: Category | 'All';
  onSelectCategory: (cat: Category | 'All') => void;
  postCounts: Record<Category | 'All', number>;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  postCounts,
}) => {
  const tabs: CategoryTab[] = [
    { id: 'All', label: 'All Guides', iconName: 'Layers' },
    { id: 'Affiliate Marketing', label: 'Affiliate Marketing', iconName: 'DollarSign' },
    { id: 'SEO', label: 'SEO & Organic', iconName: 'Search' },
    { id: 'Blogging', label: 'Blogging', iconName: 'BookOpen' },
    { id: 'Tech', label: 'Tech & AI Tools', iconName: 'Cpu' },
    { id: 'Entrepreneurship', label: 'Entrepreneurship', iconName: 'Briefcase' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign': return <DollarSign className="w-4 h-4" />;
      case 'Search': return <Search className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative w-full space-y-1.5">
      {/* Subtle Mobile Scroll Hint */}
      <div className="flex items-center justify-between sm:hidden px-1 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Filter by topic
        </span>
        <span className="flex items-center gap-1 text-emerald-400 font-semibold tracking-wide">
          <span>Swipe tabs</span>
          <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
        </span>
      </div>

      <div className="relative w-full">
        <div className="w-full overflow-x-auto pb-2 scrollbar-none after:absolute after:right-0 after:top-0 after:bottom-0 after:w-16 after:bg-gradient-to-l after:from-slate-950 after:to-transparent after:pointer-events-none">
          <div className="flex items-center gap-2 min-w-max py-1 pr-12">
            {tabs.map((tab) => {
              const isActive = selectedCategory === tab.id;
              const count = postCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectCategory(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-slate-950' : 'text-emerald-400'}>
                    {getIcon(tab.iconName)}
                  </span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
