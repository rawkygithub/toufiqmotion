import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ARTICLES, POPULAR_DESTINATIONS, TOPICS } from '../../data/articles';
import { api } from '../../api/client';
import { ArticleCard } from '../ArticleCard';
import {
  Compass,
  MapPin,
  Camera,
  ArrowRight,
  Clock,
  Sparkles,
  Plane,
  Palmtree,
  Car,
  Mountain,
  Building,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';

export const TravelPage: React.FC = () => {
  const { openArticle, isBookmarked, toggleBookmark } = useTheme();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Subcategories from Page 2 design
  const subcategories = [
    { name: 'All', icon: Sparkles },
    { name: 'Road Trips', icon: Car },
    { name: 'Island Escapes', icon: Palmtree },
    { name: 'Travel Tips', icon: Compass },
    { name: 'Weekend Getaways', icon: Plane },
    { name: 'Nature & Outdoor', icon: Mountain },
    { name: 'City Guides', icon: Building },
  ];

  const travelArticles = ARTICLES.filter((a) => a.category === 'Travel');
  const featuredArticle = travelArticles.find((a) => a.featured) || travelArticles[0];
  const trendingArticles = travelArticles.filter((a) => a.trendingRank).sort((a, b) => (a.trendingRank || 0) - (b.trendingRank || 0));

  // Filter latest articles by selected subcategory & search
  const filteredLatest = travelArticles.filter((a) => {
    const matchesSub = selectedSubcategory === 'All' || a.subcategory === selectedSubcategory;
    const matchesQuery = filterQuery === '' ||
      a.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesSub && matchesQuery;
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    try {
      await api.subscribeNewsletter(newsletterEmail, '', 'travel_page');
    } catch (e) {
      console.warn('Backend subscription note:', e);
    }
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 3000);
  };

  return (
    <div className="space-y-14 sm:space-y-20 pt-2">
      
      {/* 1. Category Header & Hero (Page 2) */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#D86237] border border-[#FBD8C8] inline-block">
            TRAVEL
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
            Travel Guides &amp; <br />
            Inspiring Destinations
          </h1>
          <p className="text-[#655E52] text-sm sm:text-base leading-relaxed font-light">
            Discover beautiful places, practical travel guides and unforgettable experiences from around the world. Find inspiration for your next adventure, with tips, itineraries and local recommendations.
          </p>
        </div>

        {/* Wide Panoramic Panorama Banner (Page 2) */}
        <div className="rounded-[32px] overflow-hidden aspect-[21/9] sm:aspect-[24/9] shadow-xl relative">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80"
            alt="Lake and Alpine Mountain Panorama"
            decoding="async"
            className="w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8 text-white">
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#FFCEBA]">
              Wanderlust Unfolded
            </span>
            <p className="font-serif text-base sm:text-2xl font-bold">Lakes, Peaks &amp; Coastal Horizons</p>
          </div>
        </div>
      </section>

      {/* 2. Subcategory Filter Strip (Page 2) */}
      <section className="bg-white/80 backdrop-blur-md border border-[#EDE7DF] rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {subcategories.map((sub) => {
            const Icon = sub.icon;
            const active = selectedSubcategory === sub.name;
            return (
              <button
                key={sub.name}
                onClick={() => setSelectedSubcategory(sub.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#E8734A] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#554E42] hover:bg-[#F2ECE4] border border-[#E5E0D8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Main Content Grid (2 Columns: Articles on Left + Sidebar on Right) (Page 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column (8 cols): Featured Story + Latest Travel Articles */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Featured Travel Story Card */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#1E1B18]">
                Featured Travel Stories
              </h2>
            </div>
            <ArticleCard article={featuredArticle} variant="hero-overlay" />
          </section>

          {/* Latest Travel Articles Grid */}
          <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block">
                  Curated Guides
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1E1B18]">
                  Latest Travel Articles {selectedSubcategory !== 'All' && `(${selectedSubcategory})`}
                </h3>
              </div>
              <span className="text-xs text-[#8C8477]">
                {filteredLatest.length} articles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredLatest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>

        </div>

        {/* Right Sidebar (4 cols): Search, Popular Topics, Travel Resources, Trending, Newsletter */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Quick Filter Search Box */}
          <div className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C8477] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search travel articles..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] text-xs focus:outline-hidden focus:border-[#E8734A]"
              />
            </div>
          </div>

          {/* Popular Topics List (Page 2) */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-lg text-[#1E1B18] pb-2 border-b border-[#F0ECE6]">
              Popular Topics
            </h4>
            <div className="space-y-2">
              {TOPICS.travel.map((topic) => (
                <button
                  key={topic.name}
                  onClick={() => setSelectedSubcategory('All')}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#FAF8F5] text-left transition-colors group"
                >
                  <span className="text-xs font-medium text-[#4A453E] group-hover:text-[#E8734A] transition-colors">
                    {topic.name}
                  </span>
                  <span className="text-[11px] text-[#9E978C] font-mono group-hover:text-[#E8734A]">
                    {topic.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Resources Promo Card (Page 2) */}
          <div className="group relative rounded-3xl overflow-hidden p-6 bg-gradient-to-br from-[#2D2A26] to-[#1E1B18] text-white shadow-lg space-y-4">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"
              alt="Vintage camera and passport"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="relative z-10 space-y-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-[#FFCEBA] border border-white/20 inline-block">
                Traveler Toolkit
              </span>
              <h4 className="font-serif text-2xl font-bold leading-snug">
                Travel Resources
              </h4>
              <p className="text-white/80 text-xs leading-relaxed font-light">
                Useful tools, packing guides, gear recommendations and booking apps to help plan your next dream voyage.
              </p>
              <button
                onClick={() => alert('Opening Toufiq Motion Travel Toolkit & Packing Templates (Free Download)')}
                className="w-full py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                Explore Resources <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Trending Travel Articles (Numbered 01 to 04 from Page 2) */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-lg text-[#1E1B18] pb-2 border-b border-[#F0ECE6]">
              Trending Travel Articles
            </h4>

            <div className="space-y-4">
              {trendingArticles.map((article, index) => (
                <div
                  key={article.id}
                  onClick={() => openArticle(article)}
                  className="group flex gap-3.5 cursor-pointer pb-3 border-b border-[#F5F2EB] last:border-b-0 last:pb-0"
                >
                  <span className="font-serif font-bold text-2xl text-[#E8734A]/40 group-hover:text-[#E8734A] transition-colors shrink-0 w-8">
                    0{index + 1}
                  </span>
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="grow min-w-0">
                    <h5 className="font-serif font-bold text-xs sm:text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h5>
                    <span className="text-[11px] text-[#8C8477] mt-1 block">
                      {article.readTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Newsletter Box (Page 2) */}
          <div className="bg-gradient-to-br from-[#FFFDFC] to-[#FAF6EE] rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold text-sm">
              ✨
            </div>
            <h4 className="font-serif font-bold text-base text-[#1E1B18]">
              Get More Travel Inspiration
            </h4>
            <p className="text-xs text-[#6A6357] leading-relaxed">
              Join our newsletter for the latest travel guides, secret spots and wanderlust stories.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                {newsletterSubscribed ? 'Subscribed!' : 'Sign Up Free'}
              </button>
            </form>
          </div>

        </aside>
      </div>

      {/* 4. Popular Destinations Row (Page 2: Paris, Santorini, Bali, New York, Swiss Alps, Tokyo) */}
      <section className="space-y-6 pt-4">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block">
              Destinations
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Popular Destinations
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              onClick={() => setSelectedSubcategory('All')}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h5 className="font-serif font-bold text-base leading-tight group-hover:text-[#FFCEBA] transition-colors">
                  {dest.name}
                </h5>
                <span className="text-[10px] text-white/80 block uppercase tracking-wider mt-0.5">
                  {dest.country} &bull; {dest.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

