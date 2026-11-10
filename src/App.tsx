import React, { useEffect, Suspense, lazy } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { InsideLightEffect } from './components/InsideLightEffect';
import { HeadTagsInjector } from './components/HeadTagsInjector';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { HomePage } from './components/pages/HomePage';
import { TravelPage } from './components/pages/TravelPage';
import { LifestylePage } from './components/pages/LifestylePage';
import { HealthPage } from './components/pages/HealthPage';
import { WorkWithUsPage } from './components/pages/WorkWithUsPage';
import { AboutContactPage } from './components/pages/AboutContactPage';
import { ArticlePage } from './components/pages/ArticlePage';

// Lazy load heavy admin studio and dynamic custom pages on-demand
const AdminStudio = lazy(() => import('./components/pages/AdminStudio').then(m => ({ default: m.AdminStudio })));
const DynamicCustomPage = lazy(() => import('./components/pages/DynamicCustomPage').then(m => ({ default: m.DynamicCustomPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-200">
    <div className="w-9 h-9 rounded-full border-2 border-[#E8734A] border-t-transparent animate-spin mx-auto shadow-xs" />
    <p className="font-serif text-xs text-[#8C8477] italic tracking-wide">
      Opening editorial story...
    </p>
  </div>
);

const MainLayout: React.FC = () => {
  const { activePage } = useTheme();

  // Instant scroll to top upon page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  const isAdmin = activePage === 'admin' || activePage?.startsWith('admin');

  // =========================================================================
  // 1. DEDICATED BACKEND STUDIO LAYOUT
  // Completely isolated from the public magazine layout for maximum speed,
  // zero visual conflicts, clean sidebar navigation, and organized workflows.
  // =========================================================================
  if (isAdmin) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminStudio />
      </Suspense>
    );
  }

  // =========================================================================
  // 2. DEDICATED PUBLIC FRONTEND MAGAZINE LAYOUT
  // Ultra-smooth, fast, responsive editorial layout with Inside Light,
  // sticky navigation, reader drawers, and footer.
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#E8734A]/20 selection:text-[#C85228] relative bg-[#FAF8F5]">
      {/* Eye-Smooth Ambient "Inside Light" Background Engine */}
      <InsideLightEffect />

      {/* Editorial Navigation Bar */}
      <Navbar />

      {/* Main Public Container */}
      <main className="grow mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-7xl">
        {activePage === 'home' && <HomePage />}
        {activePage === 'travel' && <TravelPage />}
        {activePage === 'lifestyle' && <LifestylePage />}
        {activePage === 'health' && <HealthPage />}
        {activePage === 'work' && <WorkWithUsPage />}
        {activePage === 'about' && <AboutContactPage initialView="about" />}
        {activePage === 'contact' && <AboutContactPage initialView="contact" />}
        {(activePage === 'article' || activePage.startsWith('article/')) && <ArticlePage />}
        {!['home', 'travel', 'lifestyle', 'health', 'work', 'about', 'contact', 'admin', 'article'].includes(activePage) && !activePage.startsWith('article/') && (
          <Suspense fallback={<PageLoader />}>
            <DynamicCustomPage slug={activePage} />
          </Suspense>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <SearchModal />
      <BookmarksDrawer />

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <HeadTagsInjector />
      <MainLayout />
    </ThemeProvider>
  );
}
