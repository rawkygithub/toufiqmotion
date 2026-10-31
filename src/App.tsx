import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { InsideLightEffect } from './components/InsideLightEffect';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { SearchModal } from './components/SearchModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { HomePage } from './components/pages/HomePage';
import { TravelPage } from './components/pages/TravelPage';
import { LifestylePage } from './components/pages/LifestylePage';
import { HealthPage } from './components/pages/HealthPage';
import { WorkWithUsPage } from './components/pages/WorkWithUsPage';
import { AboutContactPage } from './components/pages/AboutContactPage';
import { AdminStudio } from './components/pages/AdminStudio';

const MainLayout: React.FC = () => {
  const { activePage } = useTheme();

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
        {activePage === 'home' && <HomePage />}
        {activePage === 'travel' && <TravelPage />}
        {activePage === 'lifestyle' && <LifestylePage />}
        {activePage === 'health' && <HealthPage />}
        {activePage === 'work' && <WorkWithUsPage />}
        {activePage === 'about' && <AboutContactPage initialView="about" />}
        {activePage === 'contact' && <AboutContactPage initialView="contact" />}
        {activePage === 'admin' && <AdminStudio />}
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
