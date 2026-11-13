import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArticleCard } from '../ArticleCard';
import { ArrowRight, Sparkles, Clock, Compass, BookOpen } from 'lucide-react';

export const HomeDesign3: React.FC = () => {
  const { setActivePage, openArticle, articles, articlesLoaded } = useTheme();

  const featuredArticle = articles.find((a) => a.featured) || articles[0] || null;
  const sideArticles = featuredArticle
    ? articles.filter((a) => a.id !== featuredArticle.id).slice(0, 2)
    : [];
  const latestArticles = articles.slice(0, 6);

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
                onClick={() => {
                  if (featuredArticle) {
                    openArticle(featuredArticle);
                  } else {
                    setActivePage('travel');
                  }
                }}
                className="px-8 py-3.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                Explore Stories <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Author Attribution */}
            <div className="pt-4 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="Toufiq Motion"
                decoding="async"
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
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Cursive Script Stamp */}
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

      {/* When articles exist: render real featured stories & latest grid */}
      {articles.length > 0 && featuredArticle ? (
        <>
          {/* 2. "Featured Stories" Split Card Section */}
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
              {/* Big Dark Card on Left */}
              <div className={sideArticles.length > 0 ? "lg:col-span-7" : "lg:col-span-12"}>
                <div
                  onClick={() => openArticle(featuredArticle)}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 h-full min-h-[460px] flex flex-col justify-end p-8 sm:p-12"
                >
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

                  <div className="relative z-10 text-white space-y-4">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20 inline-block">
                      {featuredArticle.category} &bull; {featuredArticle.subcategory || 'Featured'}
                    </span>

                    <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight group-hover:text-[#FFB599] transition-colors">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-white/85 text-sm sm:text-base font-light line-clamp-2 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-white/20">
                      <span className="text-xs text-white/80 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {featuredArticle.readTime}
                      </span>
                      <span className="text-xs font-bold text-[#FFB599] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Story <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Stacked Cards */}
              {sideArticles.length > 0 && (
                <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                  {sideArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => openArticle(art)}
                      className="group bg-white rounded-3xl p-6 border border-[#EDE7DF] hover:border-[#E8734A]/50 shadow-xs hover:shadow-lg transition-all cursor-pointer flex gap-5 items-center grow"
                    >
                      <img
                        src={art.image}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A06235] bg-[#FDF5EE] px-2.5 py-0.5 rounded-full border border-[#F3E3D3]">
                          {art.category}
                        </span>
                        <h4 className="font-serif font-bold text-base sm:text-lg text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-snug line-clamp-2">
                          {art.title}
                        </h4>
                        <span className="text-xs text-[#8C8477] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {art.readTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 3. "Latest from the Blog" Grid */}
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
                className="text-xs font-bold text-[#E8734A] hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                Explore All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Empty State when 0 articles are in the database */
        <section className="bg-white/80 backdrop-blur-xs border border-[#EDE8E0] rounded-3xl p-10 sm:p-16 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto text-2xl shadow-2xs">
            ✨
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block">
              Editorial Desk
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Stories Are Being Crafted
            </h2>
            <p className="text-sm text-[#736B5E] font-light leading-relaxed">
              Our journal is currently preparing fresh travel dispatches, slow living inspiration, and wellbeing guides. Explore our categories or sign in to write the first story.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActivePage('travel')}
              className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Explore Categories
            </button>
            <button
              onClick={() => setActivePage('about')}
              className="px-6 py-2.5 rounded-full bg-white border border-[#DED7CE] hover:border-[#E8734A] text-[#2D2A26] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              About the Journal
            </button>
          </div>
        </section>
      )}

    </div>
  );
};
