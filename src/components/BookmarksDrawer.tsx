import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Bookmark, Trash2, ArrowRight, BookOpen } from 'lucide-react';

export const BookmarksDrawer: React.FC = () => {
  const {
    isBookmarksDrawerOpen,
    setIsBookmarksDrawerOpen,
    bookmarks,
    toggleBookmark,
    openArticle,
    articles
  } = useTheme();

  if (!isBookmarksDrawerOpen) return null;

  const bookmarkedArticles = articles.filter((a) => bookmarks.includes(a.id));

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsBookmarksDrawerOpen(false);
      }}
    >
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
              type="button"
              onClick={() => setIsBookmarksDrawerOpen(false)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#4A453E] shadow-xs cursor-pointer"
              title="Close"
            >
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white">Close</span>
              <X className="w-3.5 h-3.5 group-hover:text-white" />
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
                  className="group bg-white rounded-2xl p-4 border border-[#EDE7DF] hover:border-[#E8734A]/50 hover:shadow-md transition-all flex gap-3.5 items-center justify-between"
                >
                  <div
                    onClick={() => {
                      openArticle(article);
                      setIsBookmarksDrawerOpen(false);
                    }}
                    className="flex gap-3.5 items-center grow cursor-pointer min-w-0"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="grow min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8734A] block mb-0.5">
                        {article.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors truncate">
                        {article.title}
                      </h4>
                      <span className="text-[11px] text-[#8C8477] mt-0.5 block">
                        {article.readTime}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBookmark(article.id)}
                    className="p-2 text-[#9E978C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Remove from reading list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {bookmarkedArticles.length > 0 && (
            <div className="p-4 bg-white border-t border-[#EAE5DF]">
              <button
                onClick={() => {
                  if (bookmarkedArticles.length > 0) {
                    openArticle(bookmarkedArticles[0]);
                    setIsBookmarksDrawerOpen(false);
                  }
                }}
                className="w-full py-3 rounded-full bg-[#E8734A] hover:bg-[#D4633A] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Read First Saved Story <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
