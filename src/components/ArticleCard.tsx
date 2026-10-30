import React from 'react';
import { Article } from '../data/articles';
import { useTheme } from '../context/ThemeContext';
import { Bookmark, Clock, ArrowUpRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'compact' | 'horizontal' | 'hero-overlay' | 'editorial-minimal';
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'standard',
  className = ''
}) => {
  const { openArticle, toggleBookmark, isBookmarked } = useTheme();
  const bookmarked = isBookmarked(article.id);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Travel':
        return 'text-[#D86237] bg-[#FFF2EB] border-[#FBD8C8]';
      case 'Lifestyle':
        return 'text-[#A06235] bg-[#FDF5EE] border-[#F3E3D3]';
      case 'Health & Wellbeing':
        return 'text-[#2E7D5A] bg-[#EDF7F1] border-[#C8E9D6]';
      default:
        return 'text-[#6C7278] bg-[#F4F3EF] border-[#E5E2DA]';
    }
  };

  if (variant === 'hero-overlay') {
    return (
      <div
        onClick={() => openArticle(article)}
        className={`group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-10 ${className}`}
      >
        <img
          src={article.image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Soft dark gradient overlay for effortless readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 group-hover:via-black/50 transition-colors" />

        <div className="relative z-10 text-white max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/20">
              {article.category}
            </span>
            <span className="text-white/80 text-xs flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" /> {article.readTime}
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight mb-3 group-hover:text-[#FFB599] transition-colors">
            {article.title}
          </h2>

          <p className="text-white/90 text-sm sm:text-base line-clamp-2 mb-4 font-light leading-relaxed">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <div className="flex items-center gap-2.5">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-8 h-8 rounded-full object-cover border border-white/40"
              />
              <span className="text-xs font-medium text-white/90">{article.author.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(article.id);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-sm text-white transition-colors"
              title={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white text-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div
        onClick={() => openArticle(article)}
        className={`group bg-white/90 hover:bg-white border border-[#EFEAE2] hover:border-[#E8734A]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300 ${className}`}
      >
        <div className="sm:w-56 h-48 sm:h-auto rounded-xl overflow-hidden shrink-0 relative">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(article.id);
            }}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white text-white' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col justify-between grow py-1">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border ${getCategoryColor(article.category)}`}>
                {article.subcategory || article.category}
              </span>
              <span className="text-[#8C8477] text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> {article.readTime}
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-snug mb-2">
              {article.title}
            </h3>
            <p className="text-[#6C665C] text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F2EDE6] text-xs text-[#8C8477]">
            <span>{article.date}</span>
            <span className="font-semibold text-[#E8734A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Read Story <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standard vertical card (Default)
  return (
    <div
      onClick={() => openArticle(article)}
      className={`group bg-white/95 hover:bg-white border border-[#EDE8E0] hover:border-[#E8734A]/40 rounded-2xl overflow-hidden cursor-pointer shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Card Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F0EDE6]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md border ${getCategoryColor(article.category)}`}>
            {article.subcategory || article.category}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(article.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-[#2D2A26] shadow-sm transition-all"
            title={bookmarked ? 'Saved to bookmarks' : 'Bookmark story'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#E8734A] text-[#E8734A]' : 'text-[#4A453E]'}`} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs text-[#8C8477] mb-2.5">
            <span>{article.date}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime}
            </span>
          </div>

          <h3 className="font-serif text-xl sm:text-[22px] font-bold text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-snug mb-3">
            {article.title}
          </h3>

          <p className="text-[#665F55] text-sm leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#F5F2EB] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="font-medium text-[#4A453E]">{article.author.name}</span>
        </div>
        <span className="font-semibold text-[#E8734A] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          Read Story <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
