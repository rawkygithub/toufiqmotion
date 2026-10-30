import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ARTICLES, Article } from '../data/articles';
import {
  X,
  Bookmark,
  Share2,
  Heart,
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Check
} from 'lucide-react';

export const ArticleDetailModal: React.FC = () => {
  const { selectedArticle, closeArticle, openArticle, isBookmarked, toggleBookmark, ambientLight, setAmbientLight } = useTheme();
  const [likes, setLikes] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ name: string; date: string; text: string }[]>([
    {
      name: 'Sophia Laurent',
      date: 'Yesterday at 3:45 PM',
      text: 'This guide was exactly what I needed for my upcoming trip! The photography and practical tips are top tier.'
    },
    {
      name: 'Marcus Vance',
      date: '2 days ago',
      text: 'The recommendation for early morning walks and quiet cafes made all the difference in my itinerary. Thank you!'
    }
  ]);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const modalContent = document.getElementById('article-content-container');
      if (modalContent) {
        const totalHeight = modalContent.scrollHeight - modalContent.clientHeight;
        if (totalHeight > 0) {
          const progress = (modalContent.scrollTop / totalHeight) * 100;
          setReadingProgress(Math.min(100, Math.max(0, progress)));
        }
      }
    };

    const container = document.getElementById('article-content-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [selectedArticle]);

  if (!selectedArticle) return null;

  const bookmarked = isBookmarked(selectedArticle.id);

  const relatedArticles = ARTICLES.filter(
    (a) => a.id !== selectedArticle.id && (a.category === selectedArticle.category || a.tags.some(t => selectedArticle.tags.includes(t)))
  ).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      {
        name: 'You (Reader)',
        date: 'Just now',
        text: commentText.trim()
      },
      ...comments
    ]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4 md:p-6 overflow-hidden">
      
      {/* Top Floating Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#E8734A] to-[#F59E0B] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div
        id="article-content-container"
        className="w-full max-w-4xl h-full sm:h-[95vh] bg-[#FAF8F5] sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col relative border border-[#EBE6DE]"
      >
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE5DF] px-6 py-4 flex items-center justify-between">
          <button
            onClick={closeArticle}
            className="flex items-center gap-2 text-xs font-semibold text-[#6A6356] hover:text-[#E8734A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Quick lighting mode toggle */}
            <button
              onClick={() => {
                const nextMode = ambientLight === 'golden-hour' ? 'candlelight' : ambientLight === 'candlelight' ? 'morning-dew' : 'golden-hour';
                setAmbientLight(nextMode);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF3EC] text-[#D86237] hover:bg-[#FFE6DA] transition-colors"
              title="Toggle reading ambiance"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ambiance: {ambientLight.replace('-', ' ')}</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => toggleBookmark(selectedArticle.id)}
              className={`p-2 rounded-full border transition-colors ${
                bookmarked
                  ? 'bg-[#E8734A] text-white border-[#E8734A]'
                  : 'bg-white text-[#4A453E] border-[#E5E0D8] hover:border-[#E8734A]'
              }`}
              title={bookmarked ? 'Saved' : 'Save story'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white text-[#4A453E] border border-[#E5E0D8] hover:border-[#E8734A] transition-colors relative"
              title="Share article"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 text-[11px] bg-black text-white px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>

            {/* Close modal */}
            <button
              onClick={closeArticle}
              className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#4A453E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 sm:px-12 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#FFF2EB] text-[#D86237] border border-[#FBD8C8]">
              {selectedArticle.category} &bull; {selectedArticle.subcategory}
            </span>
            <span className="text-xs text-[#8C8477] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {selectedArticle.readTime}
            </span>
            <span className="text-xs text-[#8C8477] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {selectedArticle.date}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E1B18] leading-[1.18] tracking-tight mb-6">
            {selectedArticle.title}
          </h1>

          <p className="text-lg sm:text-xl text-[#595246] leading-relaxed font-light mb-8">
            {selectedArticle.excerpt}
          </p>

          {/* Author info pill */}
          <div className="flex items-center justify-between py-4 border-y border-[#ECE7DF] mb-8">
            <div className="flex items-center gap-3.5">
              <img
                src={selectedArticle.author.avatar}
                alt={selectedArticle.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E8734A]/30"
              />
              <div>
                <h4 className="font-bold text-sm text-[#1E1B18]">{selectedArticle.author.name}</h4>
                <p className="text-xs text-[#8C8477]">{selectedArticle.author.role}</p>
              </div>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                hasLiked
                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                  : 'bg-white text-[#4A453E] border-[#E0DCD4] hover:border-rose-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likes} Likes</span>
            </button>
          </div>
        </div>

        {/* Feature Image */}
        <div className="px-6 sm:px-12 mb-10">
          <div className="rounded-3xl overflow-hidden shadow-lg aspect-[16/9] relative">
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-xs text-[#8C8477] mt-3 italic">
            Photography by Toufiq Motion &bull; {selectedArticle.title}
          </p>
        </div>

        {/* Article Body Content */}
        <article className="px-6 sm:px-16 pb-12 font-sans space-y-6 text-[#38332B] text-base sm:text-lg leading-[1.8] font-normal">
          {selectedArticle.quote && (
            <div className="my-8 p-6 sm:p-8 bg-gradient-to-r from-[#FFF5F0] to-[#FAF8F5] border-l-4 border-[#E8734A] rounded-r-2xl">
              <p className="font-serif italic text-xl sm:text-2xl text-[#1E1B18] leading-snug">
                "{selectedArticle.quote}"
              </p>
            </div>
          )}

          {selectedArticle.content.map((paragraph, index) => (
            <p key={index} className="tracking-wide">
              {paragraph}
            </p>
          ))}

          {/* Tags */}
          <div className="pt-8 border-t border-[#ECE7DF]">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#8C8477] mb-3">Tags & Topics</h5>
            <div className="flex flex-wrap gap-2">
              {selectedArticle.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs bg-white border border-[#E2DDD5] text-[#554E42] hover:border-[#E8734A] cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Note Bio Card */}
          <div className="mt-10 p-6 bg-white rounded-2xl border border-[#EDE8E0] shadow-xs flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            <img
              src={selectedArticle.author.avatar}
              alt={selectedArticle.author.name}
              className="w-16 h-16 rounded-full object-cover shrink-0 ring-2 ring-[#E8734A]"
            />
            <div>
              <div className="text-xs uppercase tracking-wider text-[#E8734A] font-bold">Written by</div>
              <h4 className="font-serif text-lg font-bold text-[#1E1B18]">{selectedArticle.author.name}</h4>
              <p className="text-xs sm:text-sm text-[#665F55] mt-1 leading-relaxed">
                Documenting slow living, cultural treasures and mindful wellbeing across the world. Bringing authentic stories with high visual warmth and genuine reflections.
              </p>
            </div>
          </div>

          {/* Discussion / Comments Section */}
          <div className="mt-12 pt-8 border-t border-[#ECE7DF]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#1E1B18] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#E8734A]" /> Reader Reflections ({comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts or travel memories on this story..."
                rows={3}
                className="w-full p-4 bg-white rounded-2xl border border-[#E0DCD4] focus:outline-hidden focus:border-[#E8734A] text-sm text-[#2D2A26] resize-none shadow-2xs"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D4633A] text-white text-xs font-bold tracking-wide uppercase shadow-md transition-all"
                >
                  Post Reflection
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-[#EDE8E0]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[#1E1B18]">{comment.name}</span>
                    <span className="text-[11px] text-[#8C8477]">{comment.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#554E42] leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Articles Carousel / Grid */}
          {relatedArticles.length > 0 && (
            <div className="mt-14 pt-8 border-t border-[#ECE7DF]">
              <h3 className="font-serif text-2xl font-bold text-[#1E1B18] mb-6">
                You Might Also Enjoy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => openArticle(article)}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#EBE6DE] hover:border-[#E8734A]/50 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase text-[#E8734A] tracking-wider">
                        {article.subcategory}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors line-clamp-2 mt-1 mb-2">
                        {article.title}
                      </h4>
                      <span className="text-[11px] text-[#8C8477] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};
