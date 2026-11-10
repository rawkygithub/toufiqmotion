import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ARTICLES, Article } from '../../data/articles';
import { api } from '../../api/client';
import { AffiliateDisclosure } from '../AffiliateDisclosure';
import {
  Bookmark,
  Share2,
  Heart,
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Check,
  Compass,
  Tag,
  Eye,
  UserCheck
} from 'lucide-react';

export const ArticlePage: React.FC = () => {
  const {
    selectedArticle,
    openArticle,
    setActivePage,
    isBookmarked,
    toggleBookmark,
    ambientLight,
    setAmbientLight
  } = useTheme();

  const [currentArticle, setCurrentArticle] = useState<Article | null>(selectedArticle);
  const [likes, setLikes] = useState<number>(142);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [views, setViews] = useState<number>(1240);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [commentAuthor, setCommentAuthor] = useState<string>('');
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [comments, setComments] = useState<Array<{ name: string; date: string; text: string }>>([
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
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // Synchronize article from context or fallback to URL slug
  useEffect(() => {
    if (selectedArticle) {
      setCurrentArticle(selectedArticle);
      return;
    }

    // Direct landing or refresh on /article/:slug or /post/:slug or /:slug
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
      const slugCandidate = pathParts[pathParts.length - 1];

      if (slugCandidate && slugCandidate !== 'article' && slugCandidate !== 'post') {
        // Try local static list first
        const found = ARTICLES.find(
          (a) => a.slug === slugCandidate || a.id === slugCandidate
        );
        if (found) {
          setCurrentArticle(found);
        }

        // Fetch authoritative latest version from backend API
        api.getArticleBySlug(slugCandidate)
          .then((res) => {
            if (res.article) {
              setCurrentArticle(res.article);
            }
          })
          .catch(() => {});
      }
    }
  }, [selectedArticle]);

  // Window-level reading progress bar
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const maxScroll = docHeight - winHeight;
          if (maxScroll > 0) {
            const pct = Math.round((scrollTop / maxScroll) * 100);
            setReadingProgress(Math.min(100, Math.max(0, pct)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync likes, views and comments when article changes
  useEffect(() => {
    if (!currentArticle) return;

    // Set initial counts
    setLikes(currentArticle.likesCount || 142);
    setViews(currentArticle.viewsCount || 1240);

    // Dynamic document title & meta tags for SEO
    const prevTitle = document.title;
    document.title = `${currentArticle.title} — Toufiq Motion Editorial`;

    // Inject JSON-LD Schema markup for Google Rich Results
    const scriptId = 'article-jsonld-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: currentArticle.title,
      description: currentArticle.metaDescription || currentArticle.excerpt,
      image: [currentArticle.image],
      datePublished: currentArticle.date,
      dateModified: currentArticle.date,
      author: [
        {
          '@type': 'Person',
          name: currentArticle.author.name,
          jobTitle: currentArticle.author.role
        }
      ],
      publisher: {
        '@type': 'Organization',
        name: 'Toufiq Motion',
        logo: {
          '@type': 'ImageObject',
          url: 'http://localhost:3000/favicon.svg'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': typeof window !== 'undefined' ? window.location.href : `http://localhost:3000/article/${currentArticle.slug}`
      }
    };
    scriptTag.textContent = JSON.stringify(schemaData);

    // Fetch comments and stats from API
    api.getArticleBySlug(currentArticle.slug || currentArticle.id)
      .then((res) => {
        if (res.article?.likesCount !== undefined) {
          setLikes(res.article.likesCount);
        }
        if (res.article?.viewsCount !== undefined) {
          setViews(res.article.viewsCount);
        }
        if (res.comments && res.comments.length > 0) {
          setComments(
            res.comments.map((c: any) => ({
              name: c.author_name,
              date: c.created_at,
              text: c.content
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      document.title = prevTitle;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [currentArticle]);

  if (!currentArticle) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#E8734A] border-t-transparent animate-spin mx-auto" />
        <p className="font-serif text-sm text-[#8C8477] italic tracking-wide">
          Loading editorial story...
        </p>
      </div>
    );
  }

  const bookmarked = isBookmarked(currentArticle.id);

  // Related articles (matching category or shared tags)
  const relatedArticles = ARTICLES.filter(
    (a) =>
      a.id !== currentArticle.id &&
      (a.category === currentArticle.category || a.tags.some((t) => currentArticle.tags.includes(t)))
  ).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleLike = async () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      try {
        const res = await api.likeArticle(currentArticle.id);
        if (res.likesCount) setLikes(res.likesCount);
      } catch (e) {
        console.warn('Could not sync like to backend', e);
      }
    } else {
      setLikes((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const authorName = commentAuthor.trim() || 'Fellow Reader';
    const text = commentText.trim();
    setCommentSubmitting(true);

    const newComment = {
      name: authorName,
      date: 'Just now',
      text
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');

    try {
      await api.addComment(currentArticle.id, authorName, text);
    } catch (err) {
      console.warn('Saved comment locally, server sync error:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const navigateToCategory = () => {
    const cat = currentArticle.category.toLowerCase();
    if (cat.includes('travel')) setActivePage('travel');
    else if (cat.includes('lifestyle')) setActivePage('lifestyle');
    else if (cat.includes('health') || cat.includes('wellbeing')) setActivePage('health');
    else setActivePage('home');
  };

  return (
    <div className="relative">
      
      {/* 1. VIEWPORT-PINNED READING PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-[60] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#E8734A] via-[#F59E0B] to-[#E8734A] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
        
        {/* 2. EDITORIAL TOOLBAR & BREADCRUMBS */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#EDE7DF] p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-[#8C8477] flex-wrap font-medium">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-[#E8734A] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5BEB3]" />
            <button
              onClick={navigateToCategory}
              className="hover:text-[#E8734A] transition-colors cursor-pointer font-semibold text-[#4A453E]"
            >
              {currentArticle.category}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5BEB3]" />
            <span className="text-[#8C8477] truncate max-w-[200px] sm:max-w-xs">
              {currentArticle.subcategory}
            </span>
          </nav>

          {/* Reader Tools */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Ambiance Mode Pill */}
            <button
              onClick={() => {
                const nextMode =
                  ambientLight === 'golden-hour'
                    ? 'sunset-ember'
                    : ambientLight === 'sunset-ember'
                    ? 'candlelight'
                    : ambientLight === 'candlelight'
                    ? 'morning-dew'
                    : 'golden-hour';
                setAmbientLight(nextMode);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF3EC] text-[#D86237] hover:bg-[#FFE6DA] transition-colors cursor-pointer"
              title="Toggle reading light ambiance"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E8734A]" />
              <span className="hidden md:inline font-semibold capitalize">{ambientLight.replace('-', ' ')}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => toggleBookmark(currentArticle.id)}
              className={`p-2 rounded-full border transition-all cursor-pointer shadow-2xs ${
                bookmarked
                  ? 'bg-[#E8734A] text-white border-[#E8734A]'
                  : 'bg-white text-[#4A453E] border-[#E0DCD4] hover:border-[#E8734A]'
              }`}
              title={bookmarked ? 'Saved to bookmarks' : 'Bookmark this story'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white text-[#4A453E] border border-[#E0DCD4] hover:border-[#E8734A] transition-colors cursor-pointer relative shadow-2xs"
              title="Share article URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 text-[10px] font-bold uppercase tracking-wider bg-[#1E1B18] text-white px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap animate-in fade-in">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Return to Category Button */}
            <button
              onClick={navigateToCategory}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] hover:text-white text-[#4A453E] text-xs font-semibold transition-all cursor-pointer group shadow-2xs"
              title="Return to category"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to {currentArticle.category}</span>
            </button>
          </div>
        </div>

        {/* 3. EDITORIAL ARTICLE CONTAINER */}
        <article className="bg-white rounded-3xl sm:rounded-[36px] border border-[#EDE7DF] shadow-xs p-6 sm:p-12 lg:p-16 space-y-8 font-sans">
          
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#FFF2EB] text-[#D86237] border border-[#FBD8C8]">
                {currentArticle.category} &bull; {currentArticle.subcategory}
              </span>
              <span className="text-xs text-[#8C8477] flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> {currentArticle.readTime}
              </span>
              <span className="text-xs text-[#8C8477] flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" /> {currentArticle.date}
              </span>
              <span className="text-xs text-[#8C8477] flex items-center gap-1 font-medium">
                <Eye className="w-3.5 h-3.5" /> {views.toLocaleString()} reads
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#1E1B18] leading-[1.16] tracking-tight">
              {currentArticle.title}
            </h1>

            {/* Editorial Lead Excerpt */}
            <p className="text-lg sm:text-2xl text-[#595246] leading-relaxed font-light font-serif italic pt-1">
              {currentArticle.excerpt}
            </p>

            {/* Author Profile Bar */}
            <div className="flex items-center justify-between py-4 border-y border-[#ECE7DF] pt-4 mt-6">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentArticle.author.avatar}
                  alt={currentArticle.author.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E8734A]/40 shadow-xs"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#1E1B18]">{currentArticle.author.name}</h4>
                  <p className="text-xs text-[#8C8477]">{currentArticle.author.role}</p>
                </div>
              </div>

              {/* Interactive Likes Counter */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                  hasLiked
                    ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-sm'
                    : 'bg-[#FAF8F5] text-[#4A453E] border-[#E0DCD4] hover:border-rose-300 hover:text-rose-600'
                }`}
                title={hasLiked ? 'Liked' : 'Like this story'}
              >
                <Heart className={`w-4 h-4 transition-transform active:scale-125 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{likes} Likes</span>
              </button>
            </div>
          </div>

          {/* Hero Feature Photography */}
          <div className="space-y-3">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-md aspect-[16/9] relative">
              <img
                src={currentArticle.image}
                alt={currentArticle.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-xs text-[#8C8477] italic">
              Photography by Toufiq Motion &bull; {currentArticle.title}
            </p>
          </div>

          {/* FTC Affiliate Disclosure Notice (When post includes affiliate links or reviews) */}
          {(currentArticle.hasAffiliateLinks ||
            currentArticle.htmlContent?.includes('/go/') ||
            currentArticle.htmlContent?.includes('affiliate-product-card')) && (
            <AffiliateDisclosure customText={currentArticle.affiliateDisclosure} />
          )}

          {/* Editorial Pull Quote */}
          {currentArticle.quote && (
            <div className="my-8 p-6 sm:p-8 bg-gradient-to-r from-[#FFF5F0] via-[#FFFBF8] to-[#FAF8F5] border-l-4 border-[#E8734A] rounded-r-2xl shadow-2xs">
              <p className="font-serif italic text-xl sm:text-2xl text-[#1E1B18] leading-snug">
                "{currentArticle.quote}"
              </p>
            </div>
          )}

          {/* Rich Body Content */}
          <div className="text-[#38332B] text-base sm:text-lg leading-[1.85] font-normal space-y-6">
            {currentArticle.htmlContent ? (
              <div
                className="editorial-rendered-content space-y-5 [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#1E1B18] [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:font-serif [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-[#1E1B18] [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-[#1E1B18] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-[1.85] [&_p]:mb-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#E8734A] [&_blockquote]:pl-5 [&_blockquote]:py-2 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:font-serif [&_blockquote]:text-xl [&_blockquote]:text-[#1E1B18] [&_blockquote]:bg-[#FFF8F4] [&_blockquote]:rounded-r-xl [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_img]:rounded-2xl [&_img]:my-6 [&_img]:shadow-md [&_a]:text-[#E8734A] [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:border [&_th]:border-[#E5DFD7] [&_th]:bg-[#F7F3EE] [&_th]:p-3 [&_th]:font-bold [&_td]:border [&_td]:border-[#E5DFD7] [&_td]:p-3 [&_code]:bg-[#F3EFEA] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm"
                dangerouslySetInnerHTML={{ __html: currentArticle.htmlContent }}
              />
            ) : (
              currentArticle.content.map((paragraph, index) => (
                <p key={index} className="tracking-wide">
                  {paragraph}
                </p>
              ))
            )}
          </div>

          {/* Tags Section */}
          <div className="pt-8 border-t border-[#ECE7DF]">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#8C8477] mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#E8734A]" /> Tags &amp; Topics
            </h5>
            <div className="flex flex-wrap gap-2">
              {currentArticle.tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => setActivePage('home')}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#E2DDD5] text-[#554E42] hover:border-[#E8734A] hover:text-[#E8734A] cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Deep Bio Card */}
          <div className="p-6 sm:p-8 bg-[#FAF8F5] rounded-3xl border border-[#EDE8E0] shadow-2xs flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <img
              src={currentArticle.author.avatar}
              alt={currentArticle.author.name}
              className="w-20 h-20 rounded-full object-cover shrink-0 ring-4 ring-[#E8734A]/20 shadow-xs"
            />
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#E8734A] font-bold">
                  Story Author
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8734A]" />
                <span className="text-xs text-[#8C8477] font-medium">Toufiq Motion Journal</span>
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#1E1B18]">{currentArticle.author.name}</h4>
              <p className="text-xs sm:text-sm text-[#665F55] leading-relaxed">
                Documenting slow living, cultural treasures and conscious wellbeing across the world with luminous photography and honest recommendations.
              </p>
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => setActivePage('about')}
                  className="text-xs font-bold text-[#E8734A] hover:underline cursor-pointer flex items-center gap-1"
                >
                  Read Full Bio &bull; Ethos &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Reader Reflections / Discussion */}
          <div className="pt-10 border-t border-[#ECE7DF] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] flex items-center gap-2.5">
                <MessageCircle className="w-6 h-6 text-[#E8734A]" /> Reader Reflections ({comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#EDE7DF] space-y-4">
              <div className="font-serif font-bold text-base text-[#1E1B18]">
                Leave a Thoughtful Reflection
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Your Name (e.g. Elena Vance)"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts, tips, or travel memories on this story..."
                rows={3}
                required
                className="w-full p-4 bg-white rounded-2xl border border-[#E0DCD4] focus:outline-hidden focus:border-[#E8734A] text-xs sm:text-sm text-[#2D2A26] resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D4633A] text-white text-xs font-bold tracking-wider uppercase shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {commentSubmitting ? 'Posting...' : 'Post Reflection'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment, i) => (
                <div key={i} className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#EDE8E0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1E1B18]">{comment.name}</span>
                    <span className="text-[11px] text-[#8C8477]">{comment.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#554E42] leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Articles Grid */}
          {relatedArticles.length > 0 && (
            <div className="pt-12 border-t border-[#ECE7DF] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8734A]">Continue Reading</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] mt-0.5">
                    You Might Also Enjoy
                  </h3>
                </div>
                <button
                  onClick={navigateToCategory}
                  className="text-xs font-bold text-[#E8734A] hover:underline cursor-pointer flex items-center gap-1"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => openArticle(article)}
                    className="group bg-[#FAF8F5] rounded-2xl overflow-hidden border border-[#EBE6DE] hover:border-[#E8734A]/50 cursor-pointer shadow-2xs hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#E8734A] tracking-wider">
                          {article.subcategory}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors line-clamp-2 mt-1">
                          {article.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#8C8477] pt-2 border-t border-[#EDE7DF]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.readTime}
                        </span>
                        <span className="font-semibold group-hover:translate-x-0.5 transition-transform text-[#E8734A]">
                          Read &rarr;
                        </span>
                      </div>
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

