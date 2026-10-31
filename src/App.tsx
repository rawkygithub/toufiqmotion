import React, { useEffect, Suspense, lazy } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { InsideLightEffect } from './components/InsideLightEffect';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { HomePage } from './components/pages/HomePage';

// Code-split pages on-demand for maximum initial page speed
const TravelPage = lazy(() => import('./components/pages/TravelPage').then(m => ({ default: m.TravelPage })));
const LifestylePage = lazy(() => import('./components/pages/LifestylePage').then(m => ({ default: m.LifestylePage })));
const HealthPage = lazy(() => import('./components/pages/HealthPage').then(m => ({ default: m.HealthPage })));
const WorkWithUsPage = lazy(() => import('./components/pages/WorkWithUsPage').then(m => ({ default: m.WorkWithUsPage })));
const AboutContactPage = lazy(() => import('./components/pages/AboutContactPage').then(m => ({ default: m.AboutContactPage })));
const AdminStudio = lazy(() => import('./components/pages/AdminStudio').then(m => ({ default: m.AdminStudio })));

const PageLoader: React.FC = () => (
  <div className="py-24 text-center space-y-4 animate-in fade-in duration-300">
    <div className="w-9 h-9 rounded-full border-2 border-[#E8734A] border-t-transparent animate-spin mx-auto shadow-xs" />
    <p className="font-serif text-xs text-[#8C8477] italic tracking-wide">
      Opening editorial story...
    </p>
  </div>
);

const MainLayout: React.FC = () => {
  const { activePage } = useTheme();

  // Butter-smooth scroll to top upon page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#E8734A]/20 selection:text-[#C85228] relative">
      {/* Eye-Smooth Ambient "Inside Light" Background Engine */}
      <InsideLightEffect />

      {/* Editorial Navigation Bar */}
      <Navbar />

      {/* Main Container */}
      <main className={`grow mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full relative z-10 ${
        activePage === 'admin' ? 'max-w-[1480px]' : 'max-w-7xl'
      }`}>
        <Suspense fallback={<PageLoader />}>
          {activePage === 'home' && <HomePage />}
          {activePage === 'travel' && <TravelPage />}
          {activePage === 'lifestyle' && <LifestylePage />}
          {activePage === 'health' && <HealthPage />}
          {activePage === 'work' && <WorkWithUsPage />}
          {activePage === 'about' && <AboutContactPage initialView="about" />}
          {activePage === 'contact' && <AboutContactPage initialView="contact" />}
          {activePage === 'admin' && <AdminStudio />}
        </Suspense>
      </main>

      {/* Global Modals & Drawers */}
      <ArticleDetailModal />
      <SearchModal />
      <BookmarksDrawer />

      {/* Footer Navigation (Page 7) */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}
