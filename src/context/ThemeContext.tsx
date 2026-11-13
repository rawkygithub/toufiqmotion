import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article } from '../data/articles';
import { api, SiteSettings, MenuItem, FooterValueProp, LegalLink } from '../api/client';

export type PageId = 'home' | 'travel' | 'lifestyle' | 'health' | 'work' | 'about' | 'contact' | 'admin' | (string & {});
export type HomeDesignVariant = 'design1' | 'design2' | 'design3';
export type AmbientLightingMode = 'golden-hour' | 'morning-dew' | 'sunset-ember' | 'candlelight' | 'clean-studio';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  home_variant: 'design1',
  logo_type: 'text',
  logo_url: '',
  logo_height: 36,
  site_title: 'Toufiq Motion',
  site_tagline: 'Travel • Lifestyle • Wellbeing',
  header_sticky: true,
  announcement_enabled: true,
  announcement_text: '✨ Spring 2026 Editorial Issue is live: Discover the Amalfi Coast & Slow Coffee Chronicles',
  announcement_link: '/travel',
  header_cta_enabled: true,
  header_cta_text: 'Work with Us',
  header_cta_link: '/work',
  menu_items_json: [
    { id: 'm-home', label: 'Home', type: 'page', pageId: 'home', url: '/', hasDropdown: false, enabled: true },
    { id: 'm-travel', label: 'Travel', type: 'page', pageId: 'travel', url: '/travel', hasDropdown: false, enabled: true },
    { id: 'm-lifestyle', label: 'Lifestyle', type: 'page', pageId: 'lifestyle', url: '/lifestyle', hasDropdown: false, enabled: true },
    { id: 'm-health', label: 'Health & Wellbeing', type: 'page', pageId: 'health', url: '/health', hasDropdown: false, enabled: true },
    { id: 'm-work', label: 'Work with Us', type: 'page', pageId: 'work', url: '/work', hasDropdown: false, enabled: true },
    { id: 'm-about', label: 'About', type: 'page', pageId: 'about', url: '/about', hasDropdown: false, enabled: true },
    { id: 'm-contact', label: 'Contact', type: 'page', pageId: 'contact', url: '/contact', hasDropdown: false, enabled: true }
  ],
  footer_newsletter_enabled: true,
  footer_newsletter_title: 'Get Travel Inspiration in Your Inbox',
  footer_newsletter_subtitle: 'Join our weekly newsletter for the latest travel guides, lifestyle ideas, wellbeing tips and exclusive content from Toufiq Motion.',
  footer_newsletter_tagline: 'Join The Journey',
  footer_bio_text: 'Toufiq Motion is a visual storytelling journal documenting mindful travel, slow living, and conscious wellbeing around the globe with luminous photography.',
  footer_values_json: [
    { icon: 'Compass', title: 'Inspiring Destinations', desc: 'Guides, tips and ideas' },
    { icon: 'Coffee', title: 'Local Food & Coffee', desc: 'Great places to eat and drink' },
    { icon: 'Home', title: 'Lifestyle Inspiration', desc: 'For a richer everyday life' },
    { icon: 'Heart', title: 'Health & Wellbeing', desc: 'Simple ways to live well' }
  ],
  footer_socials_json: {
    instagram: 'https://instagram.com/toufiqmotion',
    youtube: 'https://youtube.com/@toufiqmotion',
    pinterest: 'https://pinterest.com/toufiqmotion',
    facebook: 'https://facebook.com/toufiqmotion',
    twitter: 'https://twitter.com/toufiqmotion'
  },
  footer_copyright_text: '© 2026 Toufiq Motion. Handcrafted with luminous intention. All rights reserved.',
  footer_made_with: 'Designed with Inside Light',
  footer_back_to_top_enabled: true,
  footer_legal_links_json: [
    { label: 'Terms of Use', url: '#terms' },
    { label: 'Privacy Policy', url: '#privacy' },
    { label: 'Cookie Preferences', url: '#cookies' },
    { label: 'Affiliate Disclosure', url: '#affiliate' },
    { label: 'Editorial Policy', url: '#editorial' }
  ]
};

interface ThemeContextType {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  homeVariant: HomeDesignVariant;
  setHomeVariant: (variant: HomeDesignVariant) => void;
  ambientLight: AmbientLightingMode;
  setAmbientLight: (mode: AmbientLightingMode) => void;
  lightIntensity: number; // 0 to 100
  setLightIntensity: (val: number) => void;
  isLightControlOpen: boolean;
  setIsLightControlOpen: (open: boolean) => void;
  articles: Article[];
  articlesLoaded: boolean;
  refreshArticles: () => Promise<void>;
  selectedArticle: Article | null;
  openArticle: (article: Article) => void;
  closeArticle: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  bookmarks: string[];
  toggleBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
  isBookmarksDrawerOpen: boolean;
  setIsBookmarksDrawerOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  refreshSiteSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      const hash = window.location.hash.replace(/^#\/|^#|\/+$/g, '').toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === 'admin' || hash === 'admin' || search.includes('admin') || path.startsWith('admin')) return 'admin';
      if (path.startsWith('article/') || path.startsWith('post/')) return 'article';
      if (path === 'travel' || hash === 'travel') return 'travel';
      if (path === 'lifestyle' || hash === 'lifestyle') return 'lifestyle';
      if (path === 'health' || hash === 'health') return 'health';
      if (path === 'work' || hash === 'work') return 'work';
      if (path === 'about' || hash === 'about') return 'about';
      if (path === 'contact' || hash === 'contact') return 'contact';
      if (path && path !== 'index.html') return path;
    }
    return 'home';
  });
  const [homeVariant, setHomeVariant] = useState<HomeDesignVariant>('design1');
  const [ambientLight, setAmbientLight] = useState<AmbientLightingMode>(() => {
    try {
      const saved = localStorage.getItem('noyon_blog_ambient_light');
      if (saved && ['golden-hour', 'morning-dew', 'sunset-ember', 'candlelight', 'clean-studio'].includes(saved)) {
        return saved as AmbientLightingMode;
      }
    } catch {}
    return 'golden-hour';
  });
  const [lightIntensity, setLightIntensity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('noyon_blog_light_intensity');
      if (saved) return Number(saved);
    } catch {}
    return 75;
  });
  const [isLightControlOpen, setIsLightControlOpen] = useState<boolean>(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoaded, setArticlesLoaded] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBookmarksDrawerOpen, setIsBookmarksDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const refreshArticles = async () => {
    try {
      const res = await api.getArticles({ limit: 100 });
      setArticles(res.articles || []);
    } catch (err) {
      console.warn('Could not load articles from backend:', err);
      setArticles([]);
    } finally {
      setArticlesLoaded(true);
    }
  };

  const refreshSiteSettings = async () => {
    try {
      const res = await api.getSiteSettings();
      if (res.settings) {
        setSiteSettings((prev) => ({
          ...prev,
          ...res.settings
        }));
        if (res.settings.home_variant) {
          setHomeVariant(res.settings.home_variant as HomeDesignVariant);
        }
      }
    } catch (err) {
      console.warn('Could not load site settings from backend:', err);
    }
  };

  useEffect(() => {
    refreshSiteSettings();
    refreshArticles();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('noyon_blog_ambient_light', ambientLight);
      localStorage.setItem('noyon_blog_light_intensity', String(lightIntensity));
    } catch (e) {
      console.warn('Could not save ambient light to localStorage', e);
    }
  }, [ambientLight, lightIntensity]);

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('noyon_blog_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('noyon_blog_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Could not save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (selectedArticle) setSelectedArticle(null);
        if (isSearchOpen) setIsSearchOpen(false);
        if (isBookmarksDrawerOpen) setIsBookmarksDrawerOpen(false);
        if (isLightControlOpen) setIsLightControlOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle, isSearchOpen, isBookmarksDrawerOpen, isLightControlOpen]);

  const toggleBookmark = (articleId: string) => {
    setBookmarks((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const isBookmarked = (articleId: string) => bookmarks.includes(articleId);

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setActivePage('article');
    if (typeof window !== 'undefined') {
      const slug = article.slug || article.id;
      const newPath = `/article/${slug}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    }
    window.scrollTo(0, 0);
  };

  const closeArticle = () => {
    if (selectedArticle?.category) {
      const cat = selectedArticle.category.toLowerCase();
      if (cat.includes('travel')) handlePageChange('travel');
      else if (cat.includes('lifestyle')) handlePageChange('lifestyle');
      else if (cat.includes('health') || cat.includes('wellbeing')) handlePageChange('health');
      else handlePageChange('home');
    } else {
      handlePageChange('home');
    }
    setSelectedArticle(null);
  };

  // Scroll to top on page change & update browser URL
  const handlePageChange = (page: PageId) => {
    if (page !== 'article') {
      setSelectedArticle(null);
    }
    setActivePage(page);
    if (typeof window !== 'undefined') {
      const newPath = page === 'home' ? '/' : page === 'article' && selectedArticle ? `/article/${selectedArticle.slug || selectedArticle.id}` : `/${page}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (path === 'admin' || path.startsWith('admin')) {
        setActivePage('admin');
      } else if (path.startsWith('article/') || path.startsWith('post/')) {
        setActivePage('article');
      } else if (['travel', 'lifestyle', 'health', 'work', 'about', 'contact'].includes(path)) {
        setSelectedArticle(null);
        setActivePage(path as PageId);
      } else if (path && path !== 'index.html') {
        setSelectedArticle(null);
        setActivePage(path as PageId);
      } else {
        setSelectedArticle(null);
        setActivePage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        activePage,
        setActivePage: handlePageChange,
        homeVariant,
        setHomeVariant,
        ambientLight,
        setAmbientLight,
        lightIntensity,
        setLightIntensity,
        isLightControlOpen,
        setIsLightControlOpen,
        articles,
        articlesLoaded,
        refreshArticles,
        selectedArticle,
        openArticle,
        closeArticle,
        isSearchOpen,
        setIsSearchOpen,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        isBookmarksDrawerOpen,
        setIsBookmarksDrawerOpen,
        searchQuery,
        setSearchQuery,
        siteSettings,
        setSiteSettings,
        refreshSiteSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

