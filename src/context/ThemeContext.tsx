import React, { createContext, useContext, useState, useEffect } from 'react';
import { Article, ARTICLES } from '../data/articles';

export type PageId = 'home' | 'travel' | 'lifestyle' | 'health' | 'work' | 'about' | 'contact';
export type HomeDesignVariant = 'design1' | 'design2' | 'design3';
export type AmbientLightingMode = 'golden-hour' | 'morning-dew' | 'sunset-ember' | 'candlelight' | 'clean-studio';

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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [homeVariant, setHomeVariant] = useState<HomeDesignVariant>('design1');
  const [ambientLight, setAmbientLight] = useState<AmbientLightingMode>('golden-hour');
  const [lightIntensity, setLightIntensity] = useState<number>(75);
  const [isLightControlOpen, setIsLightControlOpen] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBookmarksDrawerOpen, setIsBookmarksDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('noyon_blog_bookmarks');
      return saved ? JSON.parse(saved) : ['amalfi-coast-guide', 'best-coffee-shops-2024'];
    } catch {
      return ['amalfi-coast-guide'];
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  // Scroll to top on page change
  const handlePageChange = (page: PageId) => {
    setSelectedArticle(null);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
