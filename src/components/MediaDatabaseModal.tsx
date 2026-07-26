import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  Plus, 
  Image as ImageIcon, 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink, 
  Tag, 
  Trash2, 
  Layers, 
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  MediaAsset, 
  getMediaAssetsFromDB, 
  saveMediaAssetToDB, 
  deleteMediaAssetFromDB, 
  seedInitialMediaAssets 
} from '../lib/firebase';

interface MediaDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImageForPost?: (url: string) => void;
}

export const MediaDatabaseModal: React.FC<MediaDatabaseModalProps> = ({ 
  isOpen, 
  onClose,
  onSelectImageForPost 
}) => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  
  // New Asset Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<MediaAsset['category']>('Infographics');
  const [newAltText, setNewAltText] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await getMediaAssetsFromDB();
      setAssets(data);
    } catch (e) {
      console.error('Failed loading media assets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    const filename = newUrl.split('/').pop() || 'image.webp';
    const newAsset: MediaAsset = {
      id: `img-${Date.now()}`,
      title: newTitle,
      filename,
      url: newUrl,
      category: newCategory,
      altText: newAltText || newTitle,
      description: newDescription || 'Website database image asset.',
      createdAt: new Date().toISOString()
    };

    await saveMediaAssetToDB(newAsset);
    setAssets(prev => [newAsset, ...prev]);
    setShowAddForm(false);
    setNewTitle('');
    setNewUrl('');
    setNewAltText('');
    setNewDescription('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this image record from Firestore?')) {
      await deleteMediaAssetFromDB(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const categories = ['All', 'Infographics', 'eBook & Master Guides', 'Brand Assets', 'Other'];

  const filteredAssets = assets.filter(a => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.altText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Firestore Image & Asset Database</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Firebase Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                All uploaded website infographics, banners, and logos stored in Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAssets}
              title="Refresh Database"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <label htmlFor="media-search-input" className="sr-only">Search media assets</label>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              id="media-search-input"
              name="searchQuery"
              type="text"
              placeholder="Search stored images by title, alt text, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Add Image Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Image Record'}
          </button>
        </div>

        {/* Add Asset Form Dropdown */}
        {showAddForm && (
          <form onSubmit={handleAddAsset} className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 shrink-0">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Add New Image Record to Firestore Database
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="media-new-title" className="block text-[11px] font-medium text-slate-400 mb-1">Image Title *</label>
                <input 
                  id="media-new-title"
                  name="title"
                  type="text" 
                  required
                  placeholder="e.g., High-Ticket Funnel Diagram" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="media-new-url" className="block text-[11px] font-medium text-slate-400 mb-1">Image URL / Local Path *</label>
                <input 
                  id="media-new-url"
                  name="url"
                  type="text" 
                  required
                  placeholder="e.g., /images/my-infographic.webp or https://..." 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="media-new-category" className="block text-[11px] font-medium text-slate-400 mb-1">Category</label>
                <select 
                  id="media-new-category"
                  name="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Infographics">Infographics</option>
                  <option value="eBook & Master Guides">eBook & Master Guides</option>
                  <option value="Brand Assets">Brand Assets</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="media-new-alt" className="block text-[11px] font-medium text-slate-400 mb-1">Alt Text</label>
                <input 
                  id="media-new-alt"
                  name="altText"
                  type="text" 
                  placeholder="SEO descriptive alt text" 
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="media-new-desc" className="block text-[11px] font-medium text-slate-400 mb-1">Description / Notes</label>
              <input 
                id="media-new-desc"
                name="description"
                type="text" 
                placeholder="Where or how to use this image..." 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-emerald-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-emerald-400"
              >
                Save to Database
              </button>
            </div>
          </form>
        )}

        {/* Media Asset List / Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              Loading stored images from Firestore database...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No image assets found matching search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map(asset => {
                const markdownSnippet = `![${asset.altText}](${asset.url})`;
                const htmlSnippet = `<img src="${asset.url}" alt="${asset.altText}" />`;

                return (
                  <div 
                    key={asset.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    {/* Thumbnail Preview Header */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center p-2 border-b border-slate-800/80">
                      <img 
                        src={asset.url} 
                        alt={asset.altText} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 backdrop-blur-sm">
                        {asset.category}
                      </span>
                      <button
                        onClick={() => setActivePreviewUrl(asset.url)}
                        className="absolute bottom-2 right-2 p-1.5 rounded bg-slate-900/80 text-slate-300 hover:text-white text-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Expand Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content & Metadata */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                          {asset.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {asset.description}
                        </p>
                      </div>

                      {/* Code Snippets & Copy Actions */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        
                        {/* URL Copy Row */}
                        <div className="flex items-center justify-between text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          <span className="text-slate-400 truncate max-w-[180px] font-mono">{asset.url}</span>
                          <button
                            onClick={() => handleCopy(asset.url, `url-${asset.id}`)}
                            className="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer shrink-0 ml-1"
                          >
                            {copiedId === `url-${asset.id}` ? (
                              <span className="text-emerald-300 flex items-center gap-0.5"><Check className="w-3 h-3" /> Copied</span>
                            ) : (
                              <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy URL</span>
                            )}
                          </button>
                        </div>

                        {/* Markdown Tag Copy Row */}
                        <div className="flex items-center justify-between text-[11px] bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          <span className="text-slate-400 truncate max-w-[180px] font-mono">Markdown Tag</span>
                          <button
                            onClick={() => handleCopy(markdownSnippet, `md-${asset.id}`)}
                            className="text-teal-400 hover:text-teal-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer shrink-0 ml-1"
                          >
                            {copiedId === `md-${asset.id}` ? (
                              <span className="text-emerald-300 flex items-center gap-0.5"><Check className="w-3 h-3" /> Copied</span>
                            ) : (
                              <span className="flex items-center gap-0.5"><Copy className="w-3 h-3" /> Copy MD</span>
                            )}
                          </button>
                        </div>

                      </div>

                      {/* Footer actions */}
                      <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>ID: {asset.id.slice(0, 14)}</span>
                        
                        <div className="flex items-center gap-2">
                          {onSelectImageForPost && (
                            <button
                              onClick={() => {
                                onSelectImageForPost(asset.url);
                                onClose();
                              }}
                              className="text-emerald-400 hover:underline font-bold"
                            >
                              Insert in Post
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Info Banner */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Database synchronized with Firebase Cloud Firestore instance: <code className="text-emerald-300 font-mono">studio-3212742993-166ad</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Database Manager
          </button>
        </div>

      </div>

      {/* Expanded Lightbox Image Preview Modal */}
      {activePreviewUrl && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4" onClick={() => setActivePreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={activePreviewUrl} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" referrerPolicy="no-referrer" />
            <button 
              onClick={() => setActivePreviewUrl(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/90 text-white rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
