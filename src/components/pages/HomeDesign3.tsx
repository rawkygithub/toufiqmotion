import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ARTICLES } from '../../data/articles';
import { ArticleCard } from '../ArticleCard';
import { ArrowRight, Sparkles, Clock, Bookmark, Send } from 'lucide-react';

export const HomeDesign3: React.FC = () => {
  const { setActivePage, openArticle, isBookmarked, toggleBookmark } = useTheme();

  const amalfiArticle = ARTICLES.find((a) => a.id === 'amalfi-coast-guide') || ARTICLES[0];
  const coffeeArticle = ARTICLES.find((a) => a.id === 'best-coffee-shops-2024') || ARTICLES[4];
  const calmerArticle = ARTICLES.find((a) => a.id === 'calmer-mind-brighter-tomorrow') || ARTICLES[8];

  const islandsArticle = ARTICLES.find((a) => a.id === 'thailand-islands') || ARTICLES[2];
  const cityArticle = ARTICLES.find((a) => a.id === 'florence-guide') || ARTICLES[3];
  const routineArticle = ARTICLES.find((a) => a.id === 'daily-habits-productive') || ARTICLES[6];

  const blogArticles = [
    {
      ...islandsArticle,
      title: '10 Tropical Islands for Your Next Holiday'
    },
    {
      ...cityArticle,
      title: 'How to Experience a City Like a Local'
    },
    {
      ...routineArticle,
      title: 'Morning Routines for a More Productive Day'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. Asymmetric Hero with Script Badge (Page 1, Design 3) */}
      <section className="relative pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E8734A] block">
              Modern Card Editorial
            </span>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
              Discover Amazing Places, <br />
              Inspiring Experiences <br />
              <span className="italic font-normal text-[#E8734A] font-serif">&amp; Ways to Live Well</span>
            </h1>

            <p className="text-[#655E52] text-base sm:text-lg leading-relaxed max-w-lg font-light">
              Discover inspiring destinations, practical travel guides, local food and coffee discoveries, lifestyle ideas and simple ways to live well.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => openArticle(amalfiArticle)}
                className="px-8 py-3.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Explore Stories <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Author Attribution */}
            <div className="pt-4 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="Toufiq Motion"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E8734A]/30"
              />
              <div className="text-xs">
                <p className="font-bold text-[#1E1B18]">Curated by Toufiq Motion</p>
                <p className="text-[#8C8477]">Photographer &amp; Lifestyle Writer</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image with Script Badge "Explore, Discover, Live Well" */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
                alt="Explore coastal serenity"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Cursive Script Stamp (Designer detail from Page 1, Design 3) */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md border border-[#EDE7DF] rounded-2xl p-5 shadow-2xl text-center transform -rotate-3 hover:rotate-0 transition-transform">
              <span className="font-script text-2xl sm:text-3xl text-[#E8734A] block leading-tight font-bold">
                Explore, Discover, <br /> Live Well
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C8477] mt-1 block">
                Official Journal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "Featured Stories" Split Card Section (Page 1, Design 3) */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block mb-1">
              Top Picks
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Featured Stories
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Big Dark Card on Left (Amalfi Coast) */}
          <div className="lg:col-span-7">
            <div
              onClick={() => openArticle(amalfiArticle)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 h-full min-h-[460px] flex flex-col justify-end p-8 sm:p-12"
            >
              <img
                src={amalfiArticle.image}
                alt={amalfiArticle.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

              <div className="relative z-10 text-white space-y-4">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20 inline-block">
                  Travel &bull; Island Escapes
                </span>

                <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight group-hover:text-[#FFB599] transition-colors">
                  {amalfiArticle.title}
                </h3>

                <p className="text-white/85 text-sm sm:text-base font-light line-clamp-2 leading-relaxed">
                  {amalfiArticle.excerpt}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-white/20">
                  <span className="text-xs text-white/80 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {amalfiArticle.readTime}
                  </span>
                  <span className="text-xs font-bold text-[#FFB599] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read the Guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Stacked 2 Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Top Stacked Card: Coffee Shops */}
            <div
              onClick={() => openArticle(coffeeArticle)}
              className="group bg-white rounded-3xl p-6 border border-[#EDE7DF] hover:border-[#E8734A]/50 shadow-xs hover:shadow-lg transition-all cursor-pointer flex gap-5 items-center grow"
            >
              <img
                src={coffeeArticle.image}
                alt={coffeeArticle.title}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A06235] bg-[#FDF5EE] px-2.5 py-0.5 rounded-full border border-[#F3E3D3]">
                  Lifestyle &bull; Cafes
                </span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-snug">
                  The Best Local Coffee Shops to Try in 2024
                </h4>
                <span className="text-xs text-[#8C8477] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {coffeeArticle.readTime}
                </span>
              </div>
            </div>

            {/* Bottom Stacked Card: Calmer Mind */}
            <div
              onClick={() => openArticle(calmerArticle)}
              className="group bg-white rounded-3xl p-6 border border-[#EDE7DF] hover:border-[#E8734A]/50 shadow-xs hover:shadow-lg transition-all cursor-pointer flex gap-5 items-center grow"
            >
              <img
                src={calmerArticle.image}
                alt={calmerArticle.title}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D5A] bg-[#EDF7F1] px-2.5 py-0.5 rounded-full border border-[#C8E9D6]">
                  Health &bull; Mindfulness
                </span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-snug">
                  Simple Habits for a Calmer, Happier You
                </h4>
                <span className="text-xs text-[#8C8477] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {calmerArticle.readTime}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. "Latest from the Blog" 3 Cards (Page 1, Design 3) */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block mb-1">
              Recent Stories
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Latest from the Blog
            </h2>
          </div>
          <button
            onClick={() => setActivePage('travel')}
            className="text-xs font-bold text-[#E8734A] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {blogArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

    </div>
  );
};

