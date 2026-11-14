import React, { useState, useEffect } from 'react';
import { useTheme, PageId } from '../context/ThemeContext';
import { PRESETS } from './InsideLightEffect';
import { Search, Bookmark, Sparkles, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    setIsSearchOpen,
    bookmarks,
    setIsBookmarksDrawerOpen,
    setIsLightControlOpen,
    isLightControlOpen,
    ambientLight,
    siteSettings
  } = useTheme();

  const currentLight = PRESETS.find((p) => p.id === ambientLight) || PRESETS[0];

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastScrolled = window.scrollY > 20;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const nowScrolled = window.scrollY > 20;
          if (nowScrolled !== lastScrolled) {
            setIsScrolled(nowScrolled);
            lastScrolled = nowScrolled;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultNavItems = [
    { id: 'm-home', label: 'Home', type: 'page', pageId: 'home', url: '/', hasDropdown: false, enabled: true },
    { id: 'm-travel', label: 'Travel', type: 'page', pageId: 'travel', url: '/travel', hasDropdown: false, enabled: true },
    { id: 'm-lifestyle', label: 'Lifestyle', type: 'page', pageId: 'lifestyle', url: '/lifestyle', hasDropdown: false, enabled: true },
    { id: 'm-health', label: 'Health & Wellbeing', type: 'page', pageId: 'health', url: '/health', hasDropdown: false, enabled: true },
    { id: 'm-work', label: 'Work with Us', type: 'page', pageId: 'work', url: '/work', hasDropdown: false, enabled: true },
    { id: 'm-about', label: 'About', type: 'page', pageId: 'about', url: '/about', hasDropdown: false, enabled: true },
    { id: 'm-contact', label: 'Contact', type: 'page', pageId: 'contact', url: '/contact', hasDropdown: false, enabled: true }
  ];

  const menuItems = (siteSettings?.menu_items_json && siteSettings.menu_items_json.length > 0)
    ? siteSettings.menu_items_json.filter((m) => m.enabled !== false)
    : defaultNavItems;

  const handleMenuClick = (item: any) => {
    if (item.type === 'page' && item.pageId) {
      setActivePage(item.pageId as PageId);
    } else if (item.url) {
      if (item.url.startsWith('http')) {
        window.open(item.url, '_blank');
      } else {
        const p = item.url.replace(/^\//, '');
        setActivePage((p || 'home') as PageId);
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`${
          siteSettings?.header_sticky !== false ? 'sticky top-0' : 'relative'
        } z-30 transition-all duration-300 w-full ${
          isScrolled
            ? 'bg-[#FAF8F5]/90 backdrop-blur-md shadow-xs border-b border-[#EAE5DF]/70 py-3'
            : 'bg-[#FAF8F5]/60 backdrop-blur-xs py-4.5'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="flex items-center justify-between gap-4">
            
            {/* Brand Logo & Tagline (Supports Image Logo or Styled Monogram) */}
            <button
              onClick={() => setActivePage('home')}
              className="group flex flex-col text-left transition-transform duration-300 hover:scale-101 shrink-0"
            >
              {siteSettings?.logo_type === 'image' && siteSettings.logo_url ? (
                <img
                  src={siteSettings.logo_url}
                  alt={siteSettings.site_title || 'Toufiq Motion'}
                  style={{ maxHeight: `${siteSettings.logo_height || 36}px` }}
                  className="object-contain"
                />
              ) : (
                <>
                  <span className="font-serif text-2xl sm:text-[27px] font-bold tracking-tight text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
                    {siteSettings?.site_title || 'Toufiq Motion'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C8477] font-medium font-sans">
                    {siteSettings?.site_tagline || 'Travel • Lifestyle • Wellbeing'}
                  </span>
                </>
              )}
            </button>

            {/* Desktop Navigation Links (Full Width Responsive Flow) */}
            <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-6 flex-wrap justify-center min-w-0">
              {menuItems.map((item) => {
                const isActive = activePage === (item.pageId || item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`text-[12px] xl:text-[13px] 2xl:text-[13.5px] font-semibold tracking-wider uppercase transition-all duration-200 py-1.5 whitespace-nowrap cursor-pointer ${
                      isActive ? 'border-b-2' : 'hover:opacity-80'
                    }`}
                    style={
                      isActive
                        ? { color: currentLight.accentColor, borderColor: currentLight.accentColor }
                        : { color: '#4A453E' }
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Header CTA Button (Configurable in Backend) */}
              {siteSettings?.header_cta_enabled && siteSettings.header_cta_text && (
                <button
                  onClick={() => {
                    if (siteSettings.header_cta_link?.startsWith('http')) {
                      window.open(siteSettings.header_cta_link, '_blank');
                    } else {
                      const target = siteSettings.header_cta_link?.replace(/^\//, '') || 'work';
                      setActivePage(target as PageId);
                    }
                  }}
                  className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  style={{ backgroundColor: currentLight.accentColor }}
                >
                  <span>{siteSettings.header_cta_text}</span>
                </button>
              )}
            {/* Ambient Inside Light Toggle Pill */}
            <button
              onClick={() => setIsLightControlOpen(!isLightControlOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full transition-all text-xs font-semibold shadow-2xs"
              style={{
                backgroundColor: currentLight.accentBg,
                color: currentLight.accentColor,
                border: `1px solid ${currentLight.accentColor}40`
              }}
              title="Change Inside Light Mood"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" style={{ color: currentLight.accentColor }} />
              <span className="hidden sm:inline font-sans">{currentLight.name}</span>
            </button>

            {/* Bookmarks Counter */}
            <button
              onClick={() => setIsBookmarksDrawerOpen(true)}
              className="relative p-2 rounded-full hover:bg-black/5 text-[#4A453E] hover:text-[#E8734A] transition-colors"
              title="Saved Stories"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#E8734A] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-black/5 text-[#4A453E] hover:text-[#E8734A] transition-colors cursor-pointer"
              title="Search Articles (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#4A453E] hover:text-[#E8734A] hover:bg-black/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#EAE5DF] px-6 py-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`text-left text-base font-medium py-2 px-3 rounded-xl transition-all cursor-pointer ${
                  (item.type === 'page' && activePage === item.pageId)
                    ? 'bg-[#FFF3EC] text-[#E8734A] font-semibold'
                    : 'text-[#4A453E] hover:bg-[#FAF8F5]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
    </>
  );
};

