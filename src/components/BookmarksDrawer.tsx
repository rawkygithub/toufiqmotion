import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ARTICLES } from '../data/articles';
import { X, Bookmark, Trash2, ArrowRight, BookOpen } from 'lucide-react';

export const BookmarksDrawer: React.FC = () => {
  const {
    isBookmarksDrawerOpen,
    setIsBookmarksDrawerOpen,
    bookmarks,
    toggleBookmark,
    openArticle
  } = useTheme();

  if (!isBookmarksDrawerOpen) return null;

  const bookmarkedArticles = ARTICLES.filter((a) => bookmarks.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#EBE6DE] shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-white border-b border-[#EAE5DF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center">
                <Bookmark className="w-4 h-4 fill-[#E8734A]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Saved Stories</h3>
                <p className="text-xs text-[#8C8477]">{bookmarkedArticles.length} items in your reading list</p>
              </div>
            </div>
            <button
              onClick={() => setIsBookmarksDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-black/5 text-[#6B6355]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stories List */}
          <div className="p-6 overflow-y-auto space-y-4 grow">
            {bookmarkedArticles.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-[#D2CBC1] mx-auto mb-3" />
                <h4 className="font-serif text-lg text-[#38332B] font-bold">Your reading list is empty</h4>
                <p className="text-xs text-[#8C8477] mt-1 max-w-xs mx-auto">
                  Click the bookmark icon on any story to save it for quiet evening reading.
                </p>
              </div>
            ) : (
              bookmarkedArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 bg-white rounded-2xl border border-[#EDE8E0] hover:border-[#E8734A]/50 shadow-2xs transition-all flex gap-3.5 group"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                    onClick={() => {
                      openArticle(article);
                      setIsBookmarksDrawerOpen(false);
                    }}
                  />
                  <div className="grow min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#E8734A] tracking-wider">
                        {article.subcategory || article.category}
                      </span>
                      <h5
                        onClick={() => {
                          openArticle(article);
                          setIsBookmarksDrawerOpen(false);
                        }}
                        className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors line-clamp-2 cursor-pointer mt-0.5"
                      >
                        {article.title}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB] text-xs">
                      <span className="text-[11px] text-[#8C8477]">{article.readTime}</span>
                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className="text-[#9E978C] hover:text-rose-500 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-6 bg-white border-t border-[#EAE5DF]">
            <p className="text-xs text-[#8C8477] text-center mb-3">
              Saved offline in your browser session &bull; Syncs instantly
            </p>
            <button
              onClick={() => setIsBookmarksDrawerOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-bold text-[#4A453E] hover:border-[#E8734A] hover:text-[#E8734A] transition-all"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

