import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ARTICLES, Article } from '../data/articles';
import { Search, X, Clock, ArrowRight, Compass } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, openArticle } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
      setSelectedTag(null);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const popularTags = ['Amalfi Coast', 'Coffee', 'Habits', 'Italy', 'Breakfast', 'Japan', 'Sleep', 'Sanctuary'];

  const filteredArticles = ARTICLES.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = selectedTag ? article.tags.includes(selectedTag) || article.title.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE8E0] overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#EAE5DF] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#E8734A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stories, destinations, cafes, habits..."
            className="w-full text-base sm:text-lg bg-transparent text-[#1E1B18] placeholder-[#9E978C] focus:outline-hidden font-sans"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-[#9E978C] hover:text-[#1E1B18] p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#F2EDE6] text-[#6B6355] hover:bg-[#EAE4DC]"
          >
            ESC
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="px-5 py-3 border-b border-[#EAE5DF] bg-[#FAF8F5]/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase text-[#8C8477] shrink-0">Popular:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedTag === tag
                  ? 'bg-[#E8734A] text-white shadow-2xs'
                  : 'bg-white border border-[#E2DDD5] text-[#554E42] hover:border-[#E8734A]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 grow">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-10 h-10 text-[#C8C2B8] mx-auto mb-3 stroke-[1.5]" />
              <p className="text-base font-serif text-[#4A453E] font-medium">No stories found matching "{searchTerm}"</p>
              <p className="text-xs text-[#8C8477] mt-1">Try searching for "Amalfi", "Coffee", "Japan" or "Habits"</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => {
                  openArticle(article);
                  setIsSearchOpen(false);
                }}
                className="group p-3 sm:p-3.5 bg-white rounded-2xl border border-[#EDE8E0] hover:border-[#E8734A]/50 hover:shadow-md cursor-pointer transition-all flex items-center gap-4"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8734A]">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-[#8C8477] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1B18] group-hover:text-[#E8734A] transition-colors truncate">
                    {article.title}
                  </h4>
                  <p className="text-xs text-[#665F55] truncate mt-0.5">
                    {article.excerpt}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C8477] group-hover:text-[#E8734A] group-hover:translate-x-1 transition-all shrink-0 mr-2" />
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#F4EFEA] border-t border-[#EAE5DF] text-xs text-[#8C8477] flex items-center justify-between">
          <span>{filteredArticles.length} stories found</span>
          <span className="text-[11px]">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
