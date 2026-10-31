import React, { useState, useEffect } from 'react';
import { useTheme, PageId, HomeDesignVariant } from '../context/ThemeContext';
import { PRESETS } from './InsideLightEffect';
import { Search, Bookmark, Sparkles, Menu, X, ChevronDown, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    homeVariant,
    setHomeVariant,
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
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultNavItems = [
    { id: 'm-home', label: 'Home', type: 'page', pageId: 'home', url: '/', hasDropdown: true, enabled: true },
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

  const homeStyles: { id: HomeDesignVariant; name: string; subtitle: string; pageNumber: string }[] = [
    { id: 'design1', name: 'Design 1 — Minimal Magazine', subtitle: 'Split editorial hero & featured alpine card', pageNumber: 'Page 1 - Variant 1' },
    { id: 'design2', name: 'Design 2 — Clean Editorial', subtitle: 'Immersive panorama hero & 3-card categories', pageNumber: 'Page 1 - Variant 2' },
    { id: 'design3', name: 'Design 3 — Modern Card Style', subtitle: 'Asymmetric cards & coastal dark hero feature', pageNumber: 'Page 1 - Variant 3' },
  ];

  const handleMenuClick = (item: any) => {
    if (item.type === 'page' && item.pageId) {
      setActivePage(item.pageId as PageId);
    } else if (item.url) {
      if (item.url.startsWith('http')) {
        window.open(item.url, '_blank');
      } else {
        const p = item.url.replace(/^\//, '') as PageId;
        if (['home', 'travel', 'lifestyle', 'health', 'work', 'about', 'contact', 'admin'].includes(p)) {
          setActivePage(p);
        } else {
          setActivePage('home');
        }
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar (Configurable in Backend) */}
      {siteSettings?.announcement_enabled && siteSettings.announcement_text && (
        <div
          className="py-1.5 px-4 text-center text-xs font-semibold tracking-wide border-b transition-colors flex items-center justify-center gap-2 relative z-30 shadow-2xs"
          style={{
            backgroundColor: currentLight.accentBg,
            borderColor: `${currentLight.accentColor}30`,
            color: currentLight.accentColor
          }}
        >
          <span>{siteSettings.announcement_text}</span>
          {siteSettings.announcement_link && (
            <button
              onClick={() => {
                const target = siteSettings.announcement_link?.replace(/^\//, '') as PageId;
                if (['home', 'travel', 'lifestyle', 'health', 'work', 'about', 'contact'].includes(target)) {
                  setActivePage(target);
                } else if (siteSettings.announcement_link) {
                  window.location.href = siteSettings.announcement_link;
                }
              }}
              className="underline hover:opacity-80 font-bold ml-1 inline-flex items-center gap-0.5"
            >
              Explore &rarr;
            </button>
          )}
        </div>
      )}

      <header
        className={`${
          siteSettings?.header_sticky !== false ? 'sticky top-0' : 'relative'
        } z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF8F5]/90 backdrop-blur-md shadow-xs border-b border-[#EAE5DF]/70 py-3.5'
            : 'bg-[#FAF8F5]/60 backdrop-blur-xs py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo & Tagline (Supports Image Logo or Styled Monogram) */}
            <button
              onClick={() => {
                setActivePage('home');
                setHomeDropdownOpen(false);
              }}
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

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {menuItems.map((item) => {
                const isActive = activePage === (item.pageId || item.id);
                
                if (item.hasDropdown) {
                  return (
                    <div key={item.id} className="relative group" onMouseLeave={() => setHomeDropdownOpen(false)}>
                      <button
                        onClick={() => {
                          handleMenuClick(item);
                          setHomeDropdownOpen(!homeDropdownOpen);
                        }}
                        onMouseEnter={() => setHomeDropdownOpen(true)}
                        className={`flex items-center gap-1 text-[13.5px] font-medium tracking-wide uppercase transition-all duration-200 py-1.5 ${
                          isActive ? 'font-bold border-b-2' : 'hover:opacity-80'
                        }`}
                        style={
                          isActive
                            ? { color: currentLight.accentColor, borderColor: currentLight.accentColor }
                            : { color: '#4A453E' }
                        }
                      >
                        <span>{item.label}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8C8477] group-hover:rotate-180 transition-transform duration-200" />
                      </button>

                      {/* Designer Variations Dropdown for Homepage */}
                      {homeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-[#EAE5DF] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9E978C] border-b border-[#F0ECE6] mb-1.5">
                            Homepage Layouts (Page 1)
                          </div>
                          {homeStyles.map((variant) => {
                            const isSelected = activePage === 'home' && homeVariant === variant.id;
                            return (
                              <button
                                key={variant.id}
                                onClick={() => {
                                  setActivePage('home');
                                  setHomeVariant(variant.id);
                                  setHomeDropdownOpen(false);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl transition-all ${
                                  isSelected
                                    ? 'bg-[#FFF3EC] text-[#C85228] font-semibold'
                                    : 'hover:bg-[#FAF8F5] text-[#2D2A26]'
                                }`}
                              >
                                <div className="text-xs font-bold font-serif">{variant.name}</div>
                                <div className="text-[11px] text-[#7A756D] mt-0.5">{variant.subtitle}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`text-[13.5px] font-medium tracking-wide uppercase transition-all duration-200 py-1.5 ${
                      isActive ? 'font-bold border-b-2' : 'hover:opacity-80'
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
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Header CTA Button (Configurable in Backend) */}
              {siteSettings?.header_cta_enabled && siteSettings.header_cta_text && (
                <button
                  onClick={() => {
                    const target = siteSettings.header_cta_link?.replace(/^\//, '') as PageId;
                    if (['home', 'travel', 'lifestyle', 'health', 'work', 'about', 'contact'].includes(target)) {
                      setActivePage(target);
                    } else if (siteSettings.header_cta_link) {
                      window.location.href = siteSettings.header_cta_link;
                    }
                  }}
                  className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:shadow-md transition-all active:scale-95"
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
              className="p-2 rounded-full hover:bg-black/5 text-[#4A453E] hover:text-[#E8734A] transition-colors"
              title="Search Articles (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Admin Studio Trigger */}
            <button
              onClick={() => setActivePage('admin')}
              className={`p-2 rounded-full transition-colors ${
                activePage === 'admin'
                  ? 'bg-[#E8734A] text-white shadow-xs'
                  : 'hover:bg-black/5 text-[#4A453E] hover:text-[#E8734A]'
              }`}
              title="Admin Editorial Studio"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#4A453E] hover:text-[#E8734A] hover:bg-black/5 transition-colors"
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
                className={`text-left text-base font-medium py-2 px-3 rounded-xl transition-all ${
                  (item.type === 'page' && activePage === item.pageId)
                    ? 'bg-[#FFF3EC] text-[#E8734A] font-semibold'
                    : 'text-[#4A453E] hover:bg-[#FAF8F5]'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                setActivePage('admin');
                setMobileMenuOpen(false);
              }}
              className={`text-left text-base font-medium py-2 px-3 rounded-xl flex items-center gap-2 transition-all ${
                activePage === 'admin'
                  ? 'bg-[#FFF3EC] text-[#E8734A] font-semibold'
                  : 'text-[#4A453E] hover:bg-[#FAF8F5]'
              }`}
            >
              <Lock className="w-4 h-4" /> Admin Studio
            </button>

            {/* Homepage Layout Switcher for Mobile */}
            <div className="pt-3 border-t border-[#F0ECE6]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9E978C] mb-2 px-3">
                Homepage Layout Variant
              </div>
              <div className="grid grid-cols-1 gap-1">
                {homeStyles.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setActivePage('home');
                      setHomeVariant(variant.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-xs ${
                      activePage === 'home' && homeVariant === variant.id
                        ? 'bg-[#FFF3EC] text-[#C85228] font-bold'
                        : 'text-[#4A453E]'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
};

