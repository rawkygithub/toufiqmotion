import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArticleCard } from '../ArticleCard';
import { ArrowRight, Sparkles, Compass, Coffee, Heart } from 'lucide-react';

export const HomeDesign2: React.FC = () => {
  const { setActivePage, openArticle, articles } = useTheme();

  const featuredArticle = articles.find((a) => a.featured) || articles[0] || null;
  const latestArticles = articles.slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. Immersive Hero Card (Page 1, Design 2 - Clean Editorial Style) */}
      <section className="relative pt-2">
        <div className="relative rounded-[32px] overflow-hidden min-h-[500px] sm:min-h-[580px] flex items-center shadow-2xl">
          {/* Panoramic Background Image */}
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80"
            alt="Scenic mountain lake with traveler"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Subtle Ambient Lighting Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

          {/* Content Over Hero */}
          <div className="relative z-10 p-8 sm:p-14 lg:p-20 max-w-2xl text-white space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/25">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB599]" /> Travel &bull; Lifestyle &bull; Wellbeing
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12]">
              Discover Amazing Places, <br />
              Inspiring Experiences <br />
              <span className="italic font-normal text-[#FFB599] font-serif">&amp; Ways to Live Well</span>
            </h1>

            <p className="text-white/85 text-base sm:text-lg font-light leading-relaxed">
              Discover inspiring destinations, practical travel guides, local food and coffee discoveries, lifestyle ideas and simple ways to live well.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (featuredArticle) {
                    openArticle(featuredArticle);
                  } else {
                    setActivePage('travel');
                  }
                }}
                className="px-8 py-3.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
              >
                Discover Stories <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "Explore by Category" 3 Visual Cards */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block mb-1">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Explore by Category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Category Card 1: Travel */}
          <div
            onClick={() => setActivePage('travel')}
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer shadow-md hover:shadow-xl transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
              alt="Travel category"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#FFCEBA] font-semibold uppercase tracking-wider mb-1">
                  <Compass className="w-3.5 h-3.5" /> Destinations
                </div>
                <h3 className="font-serif text-2xl font-bold">Travel</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#E8734A] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Category Card 2: Lifestyle */}
          <div
            onClick={() => setActivePage('lifestyle')}
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer shadow-md hover:shadow-xl transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"
              alt="Lifestyle category"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#FFCEBA] font-semibold uppercase tracking-wider mb-1">
                  <Coffee className="w-3.5 h-3.5" /> Slow Living
                </div>
                <h3 className="font-serif text-2xl font-bold">Lifestyle</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#E8734A] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Category Card 3: Health & Wellbeing */}
          <div
            onClick={() => setActivePage('health')}
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer shadow-md hover:shadow-xl transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
              alt="Health & Wellbeing category"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#FFCEBA] font-semibold uppercase tracking-wider mb-1">
                  <Heart className="w-3.5 h-3.5" /> Vitality &amp; Mindfulness
                </div>
                <h3 className="font-serif text-2xl font-bold">Health &amp; Wellbeing</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#E8734A] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. "Latest Articles" Grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block mb-1">
              Fresh Off The Press
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Latest Articles
            </h2>
          </div>
          <button
            onClick={() => setActivePage('travel')}
            className="text-xs font-bold text-[#E8734A] hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            Browse Archive <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white/70 backdrop-blur-xs rounded-3xl border border-[#EDE8E0] space-y-2">
            <p className="font-serif text-lg font-bold text-[#1E1B18]">No published articles yet</p>
            <p className="text-xs text-[#8C8477]">Check back soon as we curate our newest editorial dispatches.</p>
          </div>
        )}
      </section>

    </div>
  );
};
