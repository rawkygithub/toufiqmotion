import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ARTICLES } from '../../data/articles';
import { ArticleCard } from '../ArticleCard';
import {
  Compass,
  Coffee,
  Heart,
  Home as HomeIcon,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

export const HomeDesign1: React.FC = () => {
  const { setActivePage, openArticle, isBookmarked, toggleBookmark } = useTheme();

  // Pick articles matching Design 1
  const lakeArticle = ARTICLES.find((a) => a.id === 'swiss-alps-weekend') || ARTICLES[1];
  const coffeeArticle = ARTICLES.find((a) => a.id === 'best-coffee-shops-2024') || ARTICLES[4];
  const habitsArticle = ARTICLES.find((a) => a.id === 'ten-simple-habits-healthier-life') || ARTICLES[7];
  const alpsArticle = ARTICLES.find((a) => a.id === 'swiss-alps-weekend') || ARTICLES[1];

  const popularReads = [
    {
      ...lakeArticle,
      title: '10 Beautiful Lake Destinations You Need to Visit',
      excerpt: 'From pristine alpine reflections in Switzerland to secluded glacial shores, find your quiet waterside haven.'
    },
    coffeeArticle,
    habitsArticle,
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. Split Hero Section (Page 1, Design 1) */}
      <section className="relative pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Text & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EB] border border-[#FBD8C8] text-[#D86237] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#E8734A]" /> Editorial Travel &bull; Lifestyle &bull; Wellbeing
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[62px] font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
              Discover Amazing Places, <br className="hidden sm:inline" />
              Inspiring Experiences <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#E8734A] font-serif">&amp; Ways to Live Well</span>
            </h1>

            <p className="text-[#655E52] text-base sm:text-lg leading-relaxed max-w-xl font-light">
              Discover inspiring destinations, practical travel guides, local food and coffee discoveries, lifestyle ideas and simple ways to live well.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActivePage('travel')}
                className="px-8 py-3.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Explore Stories <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => openArticle(coffeeArticle)}
                className="px-8 py-3.5 rounded-full bg-white hover:bg-[#FAF8F5] text-[#2D2A26] border border-[#DED7CE] hover:border-[#E8734A] text-xs font-bold uppercase tracking-wider shadow-2xs hover:-translate-y-0.5 transition-all"
              >
                Start Reading
              </button>
            </div>
          </div>

          {/* Right Arched Hero Image with Soft Lighting Halo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-t-[140px] rounded-b-3xl overflow-hidden aspect-[4/5] shadow-2xl border-4 border-white/80">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80"
                alt="Traveler exploring scenic mountains"
                className="w-full h-full object-cover scale-102 hover:scale-106 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                <span className="font-serif italic text-lg sm:text-xl text-white/95">
                  "Live with curiosity, travel with intention."
                </span>
              </div>
            </div>

            {/* Floating Soft Badge */}
            <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#EDE7DF] rounded-2xl p-4 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold">
                ✨
              </div>
              <div>
                <p className="text-xs font-bold text-[#1E1B18] font-serif">Curated with Heart</p>
                <p className="text-[11px] text-[#8C8477]">100% Authentic Experiences</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "Popular Reads" 3-Card Grid (Page 1) */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block mb-1">
              Handpicked
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Popular Reads
            </h2>
          </div>
          <button
            onClick={() => setActivePage('travel')}
            className="text-xs font-bold text-[#E8734A] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {popularReads.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* 3. Category Feature Bar (Page 1, Design 1) */}
      <section className="bg-white/80 backdrop-blur-xs border border-[#EDE8E0] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <button
            onClick={() => setActivePage('travel')}
            className="group flex flex-col items-center p-3 rounded-2xl hover:bg-[#FFF3EC] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF2EB] text-[#E8734A] group-hover:scale-110 flex items-center justify-center mb-3 transition-transform shadow-2xs">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
              Inspiring Destinations
            </h4>
            <p className="text-[11px] text-[#8C8477] mt-1">Guides, itineraries & tips</p>
          </button>

          <button
            onClick={() => setActivePage('lifestyle')}
            className="group flex flex-col items-center p-3 rounded-2xl hover:bg-[#FFF3EC] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF2EB] text-[#E8734A] group-hover:scale-110 flex items-center justify-center mb-3 transition-transform shadow-2xs">
              <Coffee className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
              Local Food & Coffee
            </h4>
            <p className="text-[11px] text-[#8C8477] mt-1">Artisan cafes & dining</p>
          </button>

          <button
            onClick={() => setActivePage('lifestyle')}
            className="group flex flex-col items-center p-3 rounded-2xl hover:bg-[#FFF3EC] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF2EB] text-[#E8734A] group-hover:scale-110 flex items-center justify-center mb-3 transition-transform shadow-2xs">
              <HomeIcon className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
              Lifestyle Inspiration
            </h4>
            <p className="text-[11px] text-[#8C8477] mt-1">Simple ways to live well</p>
          </button>

          <button
            onClick={() => setActivePage('health')}
            className="group flex flex-col items-center p-3 rounded-2xl hover:bg-[#FFF3EC] transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#FFF2EB] text-[#E8734A] group-hover:scale-110 flex items-center justify-center mb-3 transition-transform shadow-2xs">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
              Health & Wellbeing
            </h4>
            <p className="text-[11px] text-[#8C8477] mt-1">Mindful habits & vitality</p>
          </button>

        </div>
      </section>

      {/* 4. Large Editorial Card: "A Perfect Weekend in the Swiss Alps" (Page 1) */}
      <section>
        <div
          onClick={() => openArticle(alpsArticle)}
          className="group bg-white rounded-3xl border border-[#EDE7DF] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left Large Photo */}
          <div className="lg:col-span-7 h-72 sm:h-96 lg:h-auto overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80"
              alt="Swiss Alps weekend landscape"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/90 backdrop-blur-md text-[#D86237] border border-[#FBD8C8]">
              Featured Story
            </span>
          </div>

          {/* Right Editorial Info */}
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#8C8477]">
                <span>{alpsArticle.date}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {alpsArticle.readTime}
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-tight">
                A Perfect Weekend in the Swiss Alps
              </h3>

              <p className="text-[#686256] text-sm sm:text-base leading-relaxed font-light">
                Escape to dramatic snow-dusted peaks, crystal-clear alpine lakes and cozy chalets for a restorative weekend surrounded by pristine European wilderness.
              </p>
            </div>

            <div className="pt-8 border-t border-[#F2ECE4] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={alpsArticle.author.avatar}
                  alt={alpsArticle.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h5 className="font-bold text-xs text-[#1E1B18]">{alpsArticle.author.name}</h5>
                  <p className="text-[11px] text-[#8C8477]">Switzerland &bull; Alpine Guide</p>
                </div>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-[#E8734A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Story <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
