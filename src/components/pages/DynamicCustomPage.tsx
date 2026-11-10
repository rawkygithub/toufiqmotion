import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api, CustomPage, PageBlock } from '../../api/client';
import { Article } from '../../data/articles';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  HelpCircle,
  Eye,
  Share2,
  Maximize2,
  X,
  Search,
  BookOpen
} from 'lucide-react';

interface DynamicCustomPageProps {
  slug: string;
}

export const DynamicCustomPage: React.FC<DynamicCustomPageProps> = ({ slug }) => {
  const { setActivePage, openArticle } = useTheme();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FAQ accordion active state
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({});

  // Gallery zoom modal
  const [activeZoomImage, setActiveZoomImage] = useState<{ url: string; caption?: string } | null>(null);

  // Dynamic posts feed cache for 'post_grid' blocks
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchPage = async () => {
      try {
        const res = await api.getPageBySlug(slug);
        if (isMounted) {
          setPage(res.page);
          
          // Set dynamic meta title
          const title = res.page.meta_title || res.page.title;
          document.title = `${title} • Toufiq Motion`;

          // If page has a post_grid block, fetch articles
          const hasPostGrid = res.page.blocks_json?.some((b: PageBlock) => b.type === 'post_grid');
          if (hasPostGrid) {
            try {
              const postsRes = await api.getArticles({ limit: 6 });
              if (isMounted && postsRes.articles) {
                setRecentArticles(postsRes.articles);
              }
            } catch {}
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Page not found');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-10 h-10 rounded-full border-2 border-[#E8734A] border-t-transparent animate-spin mx-auto shadow-sm" />
        <p className="font-serif text-sm text-[#8C8477] italic tracking-wide">
          Curating page layout and luminous blocks...
        </p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF2EB] border border-[#FFCEBA] text-[#E8734A] flex items-center justify-center mx-auto shadow-sm">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#E8734A]">
            Page Not Found • 404
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#1E1B18]">
            This Editorial Story is Missing
          </h1>
          <p className="text-sm text-[#8C8477] max-w-md mx-auto">
            The page you are looking for has either been moved, updated, or does not exist. Explore our latest journal entries below.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActivePage('home')}
            className="px-6 py-3 rounded-2xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Return to Journal Home</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActivePage('travel')}
            className="px-5 py-3 rounded-2xl bg-white border border-[#E0DCD4] hover:bg-[#FAF8F5] text-[#2D2A26] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            Explore Travel Stories
          </button>
        </div>
      </div>
    );
  }

  const blocks = Array.isArray(page.blocks_json) ? page.blocks_json : [];

  // Determine container width based on page template
  const getContainerClass = () => {
    switch (page.template) {
      case 'fullwidth':
        return 'w-full space-y-16 sm:space-y-20';
      case 'minimal':
        return 'max-w-3xl mx-auto space-y-12 sm:space-y-16';
      case 'landing':
        return 'max-w-5xl mx-auto space-y-16 sm:space-y-24';
      case 'standard':
      default:
        return 'max-w-5xl mx-auto space-y-16 sm:space-y-20';
    }
  };

  return (
    <div className="animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb Bar */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-[#8C8477]">
        <button
          onClick={() => setActivePage('home')}
          className="hover:text-[#E8734A] transition-colors cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-[#1E1B18] font-medium truncate max-w-xs">{page.title}</span>
      </nav>

      {/* Structured Blocks Canvas */}
      <div className={getContainerClass()}>
        {blocks.map((block, idx) => {
          if (block.visible === false) return null;

          switch (block.type) {
            // --- BLOCK: HERO ---
            case 'hero': {
              const hasBg = Boolean(block.imageUrl);
              return (
                <section
                  key={block.id || `hero-${idx}`}
                  className={`relative rounded-3xl overflow-hidden p-8 sm:p-14 lg:p-16 border border-[#EDE7DF] shadow-xs ${
                    hasBg ? 'text-white min-h-[380px] sm:min-h-[460px] flex items-center' : 'bg-white'
                  }`}
                  style={{
                    backgroundColor: block.backgroundColor || (hasBg ? undefined : '#FFFFFF'),
                    textAlign: block.alignment || 'left'
                  }}
                >
                  {hasBg && (
                    <>
                      <img
                        src={block.imageUrl}
                        alt={block.imageAlt || block.title || 'Page Hero'}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 z-1" />
                    </>
                  )}

                  <div className={`relative z-10 space-y-4 max-w-2xl ${
                    block.alignment === 'center' ? 'mx-auto' : ''
                  }`}>
                    {block.badge && (
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        hasBg
                          ? 'bg-white/20 backdrop-blur-md text-white border border-white/30'
                          : 'bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA]'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{block.badge}</span>
                      </span>
                    )}

                    <h1 className={`font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight ${
                      hasBg ? 'text-white' : 'text-[#1E1B18]'
                    }`}>
                      {block.title}
                    </h1>

                    {block.subtitle && (
                      <p className={`text-base sm:text-lg leading-relaxed ${
                        hasBg ? 'text-white/85' : 'text-[#5A5348]'
                      }`}>
                        {block.subtitle}
                      </p>
                    )}

                    {(block.buttonText || block.secondaryButtonText) && (
                      <div className={`flex flex-wrap items-center gap-3 pt-3 ${
                        block.alignment === 'center' ? 'justify-center' : ''
                      }`}>
                        {block.buttonText && (
                          <a
                            href={block.buttonLink || '#'}
                            onClick={(e) => {
                              if (block.buttonLink?.startsWith('/')) {
                                e.preventDefault();
                                const p = block.buttonLink.replace(/^\//, '');
                                setActivePage(p as any);
                              }
                            }}
                            className="px-6 py-3 rounded-2xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <span>{block.buttonText}</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        )}

                        {block.secondaryButtonText && (
                          <a
                            href={block.secondaryButtonLink || '#'}
                            onClick={(e) => {
                              if (block.secondaryButtonLink?.startsWith('/')) {
                                e.preventDefault();
                                const p = block.secondaryButtonLink.replace(/^\//, '');
                                setActivePage(p as any);
                              }
                            }}
                            className={`px-5 py-3 rounded-2xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                              hasBg
                                ? 'bg-white/15 backdrop-blur-md hover:bg-white/25 text-white border border-white/30'
                                : 'bg-[#FAF8F5] border border-[#E0DCD4] hover:bg-white text-[#2D2A26]'
                            }`}
                          >
                            <span>{block.secondaryButtonText}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            // --- BLOCK: SPLIT FEATURE (2-column layout) ---
            case 'split_feature': {
              const isImageRight = block.imagePosition === 'right';
              return (
                <section
                  key={block.id || `split-${idx}`}
                  className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#EDE7DF] shadow-xs"
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                    isImageRight ? 'lg:flex-row-reverse' : ''
                  }`}>
                    {/* Media Column */}
                    {block.imageUrl && (
                      <div className={`lg:col-span-6 ${isImageRight ? 'lg:order-2' : 'lg:order-1'}`}>
                        <div className="relative rounded-2xl overflow-hidden aspect-4/3 group shadow-md border border-[#EDE7DF]">
                          <img
                            src={block.imageUrl}
                            alt={block.imageAlt || block.title || 'Feature'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}

                    {/* Content Column */}
                    <div className={`space-y-4 ${
                      block.imageUrl ? (isImageRight ? 'lg:col-span-6 lg:order-1' : 'lg:col-span-6 lg:order-2') : 'lg:col-span-12'
                    }`}>
                      {block.badge && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{block.badge}</span>
                        </span>
                      )}

                      <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E1B18] leading-tight">
                        {block.title}
                      </h2>

                      {block.subtitle && (
                        <p className="text-sm sm:text-base text-[#5A5348] leading-relaxed">
                          {block.subtitle}
                        </p>
                      )}

                      {block.content && (
                        <div
                          className="prose prose-sm max-w-none text-[#5A5348] leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      )}

                      {/* Items / Bullets */}
                      {block.items && block.items.length > 0 && (
                        <ul className="space-y-2.5 pt-2">
                          {block.items.map((item, itemIdx) => (
                            <li key={item.id || itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2D2A26]">
                              <CheckCircle2 className="w-4 h-4 text-[#2E7D5A] shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-semibold text-[#1E1B18]">{item.title}</strong>
                                {item.description && (
                                  <span className="text-[#8C8477] ml-1.5">— {item.description}</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {block.buttonText && (
                        <div className="pt-3">
                          <a
                            href={block.buttonLink || '#'}
                            onClick={(e) => {
                              if (block.buttonLink?.startsWith('/')) {
                                e.preventDefault();
                                const p = block.buttonLink.replace(/^\//, '');
                                setActivePage(p as any);
                              }
                            }}
                            className="px-5 py-2.5 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <span>{block.buttonText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            // --- BLOCK: CARDS GRID ---
            case 'cards_grid': {
              return (
                <section key={block.id || `cards-${idx}`} className="space-y-6">
                  {(block.title || block.subtitle || block.badge) && (
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                      {block.badge && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA]">
                          {block.badge}
                        </span>
                      )}
                      {block.title && (
                        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E1B18]">
                          {block.title}
                        </h2>
                      )}
                      {block.subtitle && (
                        <p className="text-sm text-[#8C8477]">
                          {block.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {block.items?.map((item, itemIdx) => (
                      <div
                        key={item.id || itemIdx}
                        className="bg-white rounded-2xl p-6 border border-[#EDE7DF] shadow-xs hover:shadow-md hover:border-[#FFCEBA] transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-3">
                          {item.image && (
                            <div className="w-full h-40 rounded-xl overflow-hidden mb-3 border border-[#F0ECE6]">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2">
                            <span className="w-9 h-9 rounded-xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold text-base shadow-2xs">
                              {item.icon || '✨'}
                            </span>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif font-bold text-lg text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-xs sm:text-sm text-[#5A5348] leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {item.link && (
                          <div className="pt-4 mt-4 border-t border-[#F5F2EB]">
                            <a
                              href={item.link}
                              onClick={(e) => {
                                if (item.link?.startsWith('/')) {
                                  e.preventDefault();
                                  const p = item.link.replace(/^\//, '');
                                  setActivePage(p as any);
                                }
                              }}
                              className="text-xs font-bold text-[#E8734A] hover:text-[#C85228] inline-flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer"
                            >
                              <span>Explore Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // --- BLOCK: FAQ ACCORDION ---
            case 'faq_accordion': {
              return (
                <section
                  key={block.id || `faq-${idx}`}
                  className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#EDE7DF] shadow-xs space-y-6"
                >
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    {block.badge && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA]">
                        {block.badge}
                      </span>
                    )}
                    <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E1B18]">
                      {block.title || 'Frequently Asked Questions'}
                    </h2>
                    {block.subtitle && (
                      <p className="text-sm text-[#8C8477]">
                        {block.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 max-w-3xl mx-auto pt-2">
                    {block.items?.map((item, itemIdx) => {
                      const faqId = item.id || `faq-${idx}-${itemIdx}`;
                      const isOpen = Boolean(openFaqIds[faqId]);

                      return (
                        <div
                          key={faqId}
                          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                            isOpen
                              ? 'border-[#E8734A] bg-[#FFFBF8] shadow-xs'
                              : 'border-[#EDE7DF] bg-[#FAF8F5] hover:border-[#E0DCD4]'
                          }`}
                        >
                          <button
                            onClick={() => toggleFaq(faqId)}
                            className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                          >
                            <span className="font-serif font-bold text-sm sm:text-base text-[#1E1B18]">
                              {item.title}
                            </span>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isOpen ? 'bg-[#E8734A] text-white' : 'bg-white text-[#8C8477] border border-[#E0DCD4]'
                            }`}>
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {isOpen && item.description && (
                            <div className="px-5 pb-5 text-xs sm:text-sm text-[#5A5348] leading-relaxed border-t border-[#F0ECE6] pt-3 animate-in fade-in duration-200">
                              <div dangerouslySetInnerHTML={{ __html: item.description }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            // --- BLOCK: CTA BANNER ---
            case 'cta_banner': {
              return (
                <section
                  key={block.id || `cta-${idx}`}
                  className="rounded-3xl p-8 sm:p-12 text-center border border-[#EDE7DF] shadow-xs relative overflow-hidden"
                  style={{
                    backgroundColor: block.backgroundColor || '#FFF2EB',
                    borderColor: '#FFCEBA'
                  }}
                >
                  <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                    {block.badge && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-[#E8734A] border border-[#FFCEBA] shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{block.badge}</span>
                      </span>
                    )}

                    <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[#1E1B18]">
                      {block.title}
                    </h2>

                    {block.subtitle && (
                      <p className="text-sm sm:text-base text-[#5A5348] max-w-lg mx-auto">
                        {block.subtitle}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                      {block.buttonText && (
                        <a
                          href={block.buttonLink || '#'}
                          onClick={(e) => {
                            if (block.buttonLink?.startsWith('/')) {
                              e.preventDefault();
                              const p = block.buttonLink.replace(/^\//, '');
                              setActivePage(p as any);
                            }
                          }}
                          className="px-6 py-3 rounded-2xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>{block.buttonText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      )}

                      {block.secondaryButtonText && (
                        <a
                          href={block.secondaryButtonLink || '#'}
                          onClick={(e) => {
                            if (block.secondaryButtonLink?.startsWith('/')) {
                              e.preventDefault();
                              const p = block.secondaryButtonLink.replace(/^\//, '');
                              setActivePage(p as any);
                            }
                          }}
                          className="px-5 py-3 rounded-2xl bg-white border border-[#E0DCD4] hover:bg-[#FAF8F5] text-[#2D2A26] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                        >
                          {block.secondaryButtonText}
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            // --- BLOCK: PULL QUOTE ---
            case 'quote': {
              return (
                <section
                  key={block.id || `quote-${idx}`}
                  className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EDE7DF] shadow-xs text-center relative overflow-hidden"
                >
                  <div className="max-w-3xl mx-auto space-y-6">
                    <span className="font-serif text-6xl text-[#E8734A]/30 leading-none select-none block">
                      &ldquo;
                    </span>
                    <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-[#1E1B18] leading-relaxed -mt-4">
                      {block.title || block.content}
                    </blockquote>

                    {(block.authorName || block.authorRole) && (
                      <div className="flex items-center justify-center gap-3 pt-2">
                        {block.authorAvatar && (
                          <img
                            src={block.authorAvatar}
                            alt={block.authorName || 'Author'}
                            className="w-11 h-11 rounded-full object-cover border border-[#E0DCD4] shadow-2xs"
                          />
                        )}
                        <div className="text-left">
                          {block.authorName && (
                            <div className="font-serif font-bold text-sm text-[#1E1B18]">
                              {block.authorName}
                            </div>
                          )}
                          {block.authorRole && (
                            <div className="text-xs text-[#8C8477]">
                              {block.authorRole}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            // --- BLOCK: PHOTO GALLERY ---
            case 'gallery': {
              const images = block.galleryImages || [];
              return (
                <section key={block.id || `gallery-${idx}`} className="space-y-4">
                  {(block.title || block.subtitle) && (
                    <div className="text-center max-w-2xl mx-auto space-y-1">
                      {block.title && (
                        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E1B18]">
                          {block.title}
                        </h2>
                      )}
                      {block.subtitle && (
                        <p className="text-xs sm:text-sm text-[#8C8477]">
                          {block.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        onClick={() => setActiveZoomImage(img)}
                        className="group relative rounded-2xl overflow-hidden aspect-square border border-[#EDE7DF] bg-[#FAF8F5] cursor-pointer shadow-2xs hover:shadow-md transition-all"
                      >
                        <img
                          src={img.url}
                          alt={img.alt || img.caption || `Gallery ${imgIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                          <Maximize2 className="w-5 h-5" />
                        </div>
                        {img.caption && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent p-2.5 text-[11px] text-white truncate">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // --- BLOCK: RICH TEXT ---
            case 'rich_text': {
              return (
                <section
                  key={block.id || `rich-${idx}`}
                  className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#EDE7DF] shadow-xs space-y-4"
                >
                  {block.title && (
                    <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E1B18]">
                      {block.title}
                    </h2>
                  )}
                  {block.content && (
                    <div
                      className="prose prose-neutral max-w-none text-[#3D3833] leading-relaxed text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  )}
                </section>
              );
            }

            // --- BLOCK: POST GRID ---
            case 'post_grid': {
              const displayPosts = recentArticles.slice(0, block.postLimit || 3);
              return (
                <section key={block.id || `posts-${idx}`} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1E1B18]">
                        {block.title || 'Related Stories & Chronicles'}
                      </h2>
                      {block.subtitle && (
                        <p className="text-xs sm:text-sm text-[#8C8477] mt-0.5">
                          {block.subtitle}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setActivePage('travel')}
                      className="text-xs font-bold text-[#E8734A] hover:text-[#C85228] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayPosts.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => openArticle(art)}
                        className="bg-white rounded-2xl overflow-hidden border border-[#EDE7DF] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="aspect-16/10 overflow-hidden relative">
                          <img
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#1E1B18]">
                            {art.category}
                          </span>
                        </div>
                        <div className="p-5 space-y-2 grow flex flex-col justify-between">
                          <h3 className="font-serif font-bold text-base text-[#1E1B18] group-hover:text-[#E8734A] transition-colors line-clamp-2">
                            {art.title}
                          </h3>
                          <p className="text-xs text-[#5A5348] line-clamp-2">
                            {art.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-[#8C8477] pt-2 border-t border-[#F5F2EB]">
                            <span>{art.readTime || '5 min read'}</span>
                            <span className="text-[#E8734A] font-semibold flex items-center gap-1">
                              Read Story &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // --- BLOCK: EMBED ---
            case 'embed': {
              return (
                <section
                  key={block.id || `embed-${idx}`}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs space-y-4"
                >
                  {block.title && (
                    <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1E1B18]">
                      {block.title}
                    </h2>
                  )}
                  {block.embedCode && (
                    <div
                      className="w-full overflow-hidden rounded-2xl"
                      dangerouslySetInnerHTML={{ __html: block.embedCode }}
                    />
                  )}
                </section>
              );
            }

            // --- BLOCK: AFFILIATE PRODUCT REVIEW BOX ---
            case 'affiliate_box': {
              return (
                <section
                  key={block.id || `aff-${idx}`}
                  className="bg-white rounded-3xl border border-[#EDE7DF] shadow-md overflow-hidden my-8"
                >
                  <div className="bg-[#FAF8F5] border-b border-[#F0ECE6] px-6 py-3.5 flex items-center justify-between flex-wrap gap-2">
                    {block.badge && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA]">
                        ★ {block.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1E1B18]">{block.rating || 4.9} / 5.0</span>
                      <span className="text-amber-400 tracking-wider">★★★★★</span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                    {block.imageUrl && (
                      <div className="md:col-span-5 text-center">
                        <div className="h-48 sm:h-56 rounded-2xl bg-[#FAF8F5] p-3 border border-[#EDE7DF] flex items-center justify-center">
                          <img
                            src={block.imageUrl}
                            alt={block.title || 'Product'}
                            className="max-h-full max-w-full object-contain mx-auto"
                          />
                        </div>
                        {block.price && (
                          <div className="font-serif font-bold text-xl sm:text-2xl text-[#1E1B18] mt-3">
                            {block.price} <span className="text-xs font-sans font-normal text-[#8C8477]">({block.merchant || 'Amazon'})</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`${block.imageUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
                      <h3 className="font-serif font-bold text-2xl text-[#1E1B18] leading-tight">
                        {block.title}
                      </h3>

                      {block.subtitle && (
                        <p className="text-sm text-[#5A5348] leading-relaxed">
                          {block.subtitle}
                        </p>
                      )}

                      {((block.pros && block.pros.length > 0) || (block.cons && block.cons.length > 0)) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DF]">
                          {block.pros && block.pros.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
                                Key Advantages
                              </div>
                              <ul className="space-y-1.5 text-xs text-[#2D2A26]">
                                {block.pros.map((p, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-emerald-600 font-bold">✓</span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {block.cons && block.cons.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-2">
                                Considerations
                              </div>
                              <ul className="space-y-1.5 text-xs text-[#2D2A26]">
                                {block.cons.map((c, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold">✕</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {block.buttonText && (
                          <a
                            href={block.buttonLink || '#'}
                            target="_blank"
                            rel="nofollow sponsored noopener"
                            className="px-6 py-3 rounded-2xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <span>{block.buttonText}</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        )}

                        {block.secondaryButtonText && (
                          <a
                            href={block.secondaryButtonLink || '#'}
                            target="_blank"
                            rel="nofollow sponsored noopener"
                            className="px-5 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E0DCD4] hover:bg-white text-[#2D2A26] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                          >
                            <span>{block.secondaryButtonText}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            default:
              return null;
          }
        })}
      </div>

      {/* Gallery Zoom Lightbox Modal */}
      {activeZoomImage && (
        <div
          onClick={() => setActiveZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveZoomImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm flex items-center gap-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
            <img
              src={activeZoomImage.url}
              alt={activeZoomImage.caption || 'Enlarged photo'}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            {activeZoomImage.caption && (
              <p className="text-white/90 text-xs sm:text-sm text-center mt-3 max-w-xl">
                {activeZoomImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
