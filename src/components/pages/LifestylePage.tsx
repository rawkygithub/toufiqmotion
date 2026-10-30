import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ARTICLES, TOPICS } from '../../data/articles';
import { ArticleCard } from '../ArticleCard';
import {
  Coffee,
  Home as HomeIcon,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
  ShoppingBag,
  Heart,
  Send,
  Check
} from 'lucide-react';

export const LifestylePage: React.FC = () => {
  const { openArticle } = useTheme();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subcategories = [
    { name: 'All', icon: Sparkles },
    { name: 'Food & Coffee', icon: Coffee },
    { name: 'Home & Living', icon: HomeIcon },
    { name: 'Productivity', icon: Briefcase },
    { name: 'Experiences', icon: Layers },
    { name: 'Style & Essentials', icon: ShoppingBag },
  ];

  const lifestyleArticles = ARTICLES.filter((a) => a.category === 'Lifestyle');
  const coffeeArticle = ARTICLES.find((a) => a.id === 'best-coffee-shops-2024') || lifestyleArticles[0];
  const habitsArticle = ARTICLES.find((a) => a.id === 'simple-habits-fulfilling-life') || lifestyleArticles[1];

  const filteredArticles = lifestyleArticles.filter((a) => {
    return selectedSubcategory === 'All' || a.subcategory === selectedSubcategory;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <div className="space-y-14 sm:space-y-20 pt-2">
      
      {/* 1. Header & Hero (Page 3) */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#D86237] border border-[#FBD8C8] inline-block">
            LIFESTYLE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
            Everyday Inspiration <br />
            for a Richer Life
          </h1>
          <p className="text-[#655E52] text-sm sm:text-base leading-relaxed font-light">
            Discover ideas, experiences and simple pleasures for everyday life. From food and coffee to home, productivity and mindful living, find inspiration to make the most of every day.
          </p>
        </div>

        {/* Hero Panorama Image */}
        <div className="rounded-[32px] overflow-hidden aspect-[21/9] sm:aspect-[24/9] shadow-xl relative">
          <img
            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80"
            alt="Warm sunlit home interior and coffee"
            className="w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8 text-white">
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#FFCEBA]">
              Intentional Living
            </span>
            <p className="font-serif text-base sm:text-2xl font-bold">Slow Mornings, Crafted Spaces &amp; Cozy Rituals</p>
          </div>
        </div>
      </section>

      {/* 2. Subcategory Icon Filter Bar (Page 3) */}
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

      {/* 3. Featured Lifestyle Story (Split 2-Card Layout from Page 3) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-3">
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18]">
            Featured Lifestyle Story
          </h2>
          <button
            onClick={() => setSelectedSubcategory('All')}
            className="text-xs font-bold text-[#E8734A] hover:underline uppercase tracking-wider flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Card (8 cols): The Best Coffee Shops to Try in 2024 */}
          <div
            onClick={() => openArticle(coffeeArticle)}
            className="lg:col-span-8 group bg-white rounded-3xl border border-[#EDE7DF] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col sm:flex-row"
          >
            <div className="sm:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A06235] bg-[#FDF5EE] px-3 py-1 rounded-full border border-[#F3E3D3]">
                  Food &amp; Coffee
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-snug mt-4 mb-3">
                  {coffeeArticle.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#665F55] leading-relaxed font-light">
                  {coffeeArticle.excerpt}
                </p>
              </div>

              <div className="pt-6">
                <button className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5">
                  Read the Guide <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:w-1/2 h-64 sm:h-auto overflow-hidden relative">
              <img
                src={coffeeArticle.image}
                alt={coffeeArticle.title}
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              />
            </div>
          </div>

          {/* Right Card (4 cols): Simple Habits for a More Fulfilling Life */}
          <div
            onClick={() => openArticle(habitsArticle)}
            className="lg:col-span-4 group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer min-h-[350px] flex flex-col justify-end p-6 sm:p-8"
          >
            <img
              src={habitsArticle.image}
              alt={habitsArticle.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10 text-white space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCEBA]">
                Mindful Living
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug group-hover:text-[#FFB599] transition-colors">
                {habitsArticle.title}
              </h3>
              <p className="text-white/80 text-xs line-clamp-2">
                {habitsArticle.excerpt}
              </p>
              <div className="pt-2 flex items-center text-xs font-semibold text-[#FFCEBA] gap-1">
                Read More <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Latest Lifestyle Articles Grid (Page 3) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block">
              Recent Discoveries
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1E1B18]">
              Latest Lifestyle Articles
            </h3>
          </div>
          <span className="text-xs text-[#8C8477]">
            {filteredArticles.length} stories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* 5. Explore Lifestyle Topics (5 Cards from Page 3: Food & Coffee, Home & Living, Productivity, Experiences, Style & Essentials) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block">
              Topics
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Explore Lifestyle Topics
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOPICS.lifestyle.map((topic) => (
            <div
              key={topic.name}
              onClick={() => setSelectedSubcategory(topic.name)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={topic.image}
                alt={topic.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <h5 className="font-serif font-bold text-base leading-tight group-hover:text-[#FFCEBA] transition-colors">
                  {topic.name}
                </h5>
                <span className="text-[11px] text-white/80 block mt-1 font-mono">
                  {topic.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Newsletter Box (Page 3: "Get Fresh Ideas in Your Inbox") */}
      <section className="bg-gradient-to-r from-[#FFFDFC] via-[#FAF6EE] to-[#FFF2EB] border border-[#EDE7DF] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E8734A] block font-sans">
            Lifestyle Inspiration
          </span>
          <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#1E1B18]">
            Get Fresh Ideas in Your Inbox
          </h3>
          <p className="text-[#686257] text-sm leading-relaxed font-light">
            Join our newsletter for the latest lifestyle tips, inspiring stories and exclusive content to help you live a more balanced and meaningful life.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="px-5 py-3 rounded-full bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A] w-full sm:w-72"
          />
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            {subscribed ? <><Check className="w-4 h-4" /> Subscribed!</> : 'Subscribe'}
          </button>
        </form>
      </section>

    </div>
  );
};
