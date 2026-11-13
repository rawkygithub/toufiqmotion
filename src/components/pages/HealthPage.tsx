import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { TOPICS, QUICK_WELLBEING_TIPS } from '../../data/articles';
import { api } from '../../api/client';
import { ArticleCard } from '../ArticleCard';
import {
  Heart,
  Sun,
  Droplet,
  Compass,
  Sparkles,
  ArrowRight,
  Search,
  Activity,
  Apple,
  Moon,
  Smile
} from 'lucide-react';

export const HealthPage: React.FC = () => {
  const { openArticle, articles } = useTheme();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subcategories = [
    { name: 'All', icon: Sparkles },
    { name: 'Healthy Living', icon: Smile },
    { name: 'Mental Wellbeing', icon: Heart },
    { name: 'Fitness & Movement', icon: Activity },
    { name: 'Nutrition & Food', icon: Apple },
    { name: 'Sleep & Recovery', icon: Moon },
    { name: 'Mindful Travel', icon: Compass },
  ];

  const healthArticles = articles.filter((a) =>
    a.category?.toLowerCase().includes('health') || a.category?.toLowerCase().includes('wellbeing')
  );
  const habits10Article = healthArticles[0] || null;
  const calmerArticle = healthArticles[1] || null;

  const filteredArticles = healthArticles.filter((a) => {
    const matchesSub = selectedSubcategory === 'All' || a.subcategory === selectedSubcategory;
    const matchesQuery = searchFilter === '' ||
      a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSub && matchesQuery;
  });

  const getTipIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Droplet': return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'Compass': return <Compass className="w-4 h-4 text-emerald-500" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-500" />;
      default: return <Sparkles className="w-4 h-4 text-[#E8734A]" />;
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    try {
      await api.subscribeNewsletter(email, '', 'health_page');
    } catch (e) {
      console.warn('Backend subscription note:', e);
    }
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <div className="space-y-14 sm:space-y-20 pt-2">
      
      {/* 1. Category Header & Hero (Page 4) */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6] inline-block">
            HEALTH &amp; WELLBEING
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
            A Happier, Healthier You <br />
            Everywhere You Go
          </h1>
          <p className="text-[#655E52] text-sm sm:text-base leading-relaxed font-light">
            Discover practical tips, healthy habits and inspiring ideas to help you feel better, live well and enjoy a more balanced life at home and on the go.
          </p>
        </div>

        {/* Hero Panorama Banner */}
        <div className="rounded-[32px] overflow-hidden aspect-[21/9] sm:aspect-[24/9] shadow-xl relative">
          <img
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=2000&q=80"
            alt="Person meditating at sunrise overlooking serene lake"
            decoding="async"
            className="w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 sm:bottom-6 sm:left-8 text-white">
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#FFCEBA]">
              Vitality &bull; Mind &bull; Body
            </span>
            <p className="font-serif text-base sm:text-2xl font-bold">Nourish Your Body, Calm Your Mind</p>
          </div>
        </div>
      </section>

      {/* 2. Subcategory Icon Filter Bar */}
      <section className="bg-white/80 backdrop-blur-md border border-[#EDE7DF] rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {subcategories.map((sub) => {
            const Icon = sub.icon;
            const active = selectedSubcategory === sub.name;
            return (
              <button
                key={sub.name}
                onClick={() => setSelectedSubcategory(sub.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#2E7D5A] text-white shadow-xs'
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

      {/* 3. Featured Health & Wellbeing Story (rendered only when article exists) */}
      {habits10Article && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DF] pb-3">
            <h2 className="font-serif text-2xl font-bold text-[#1E1B18]">
              Featured Health &amp; Wellbeing Story
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8C8477] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search health &amp; wellbeing..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-full border border-[#E0DCD4] focus:outline-hidden focus:border-[#2E7D5A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Card */}
            <div
              onClick={() => openArticle(habits10Article)}
              className={calmerArticle ? "lg:col-span-8 group bg-white rounded-3xl border border-[#EDE7DF] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col sm:flex-row" : "lg:col-span-12 group bg-white rounded-3xl border border-[#EDE7DF] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col sm:flex-row"}
            >
              <div className="sm:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D5A] bg-[#EDF7F1] px-3 py-1 rounded-full border border-[#C8E9D6]">
                    {habits10Article.subcategory || 'Healthy Living'}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] group-hover:text-[#E8734A] transition-colors leading-snug mt-4 mb-3">
                    {habits10Article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#665F55] leading-relaxed font-light line-clamp-3">
                    {habits10Article.excerpt}
                  </p>
                </div>

                <div className="pt-6">
                  <span className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-1.5">
                    Read the Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="sm:w-1/2 h-64 sm:h-auto overflow-hidden relative">
                <img
                  src={habits10Article.image}
                  alt={habits10Article.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                />
              </div>
            </div>

            {/* Right Card (rendered only when 2nd article exists) */}
            {calmerArticle && (
              <div
                onClick={() => openArticle(calmerArticle)}
                className="lg:col-span-4 group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer min-h-[350px] flex flex-col justify-end p-6 sm:p-8"
              >
                <img
                  src={calmerArticle.image}
                  alt={calmerArticle.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 text-white space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCEBA]">
                    {calmerArticle.subcategory || 'Mindful Living'}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug group-hover:text-[#FFB599] transition-colors">
                    {calmerArticle.title}
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-2">
                    {calmerArticle.excerpt}
                  </p>
                  <div className="pt-2 flex items-center text-xs font-semibold text-[#FFCEBA] gap-1">
                    Explore Wellbeing <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Latest Articles + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Left Column (8 cols): Latest Articles */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block">
                Holistic Health
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1E1B18]">
                Latest Health &amp; Wellbeing Articles
              </h3>
            </div>
            <span className="text-xs text-[#8C8477]">
              {filteredArticles.length} guides
            </span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-4 bg-white/70 backdrop-blur-xs rounded-3xl border border-[#EDE8E0] space-y-2">
              <p className="font-serif text-lg font-bold text-[#1E1B18]">No wellbeing articles found</p>
              <p className="text-xs text-[#8C8477]">
                {healthArticles.length === 0
                  ? 'No health & wellbeing guides have been published yet. Check back soon!'
                  : `No stories found matching "${selectedSubcategory}".`}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar (4 cols): Quick Wellbeing Tips + Feel Better Card */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Quick Wellbeing Tips Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-lg text-[#1E1B18] pb-2 border-b border-[#F0ECE6] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E8734A]" /> Quick Wellbeing Tips
            </h4>

            <div className="space-y-4">
              {QUICK_WELLBEING_TIPS.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-[#FAF8F5] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#FAF6EE] flex items-center justify-center shrink-0 border border-[#EBE6DE]">
                    {getTipIcon(tip.icon)}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#1E1B18]">{tip.title}</h5>
                    <p className="text-[11px] text-[#7A756D] leading-relaxed mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "Feel Better. Explore More." Card with Newsletter */}
          <div className="bg-gradient-to-br from-[#FFFDFC] to-[#FAF8F5] rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4 relative overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#EDF7F1] text-[#2E7D5A] flex items-center justify-center font-bold text-sm">
              🌿
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2E7D5A]">
                Wellbeing In Every Journey
              </span>
              <h4 className="font-serif font-bold text-xl text-[#1E1B18] mt-1">
                Feel Better. Explore More.
              </h4>
              <p className="text-xs text-[#6A6357] leading-relaxed mt-1">
                Join our newsletter for the latest health and wellbeing tips, inspiring stories and practical advice to help you live a more balanced and fulfilling life.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#2E7D5A]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#2E7D5A] hover:bg-[#25684A] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                {subscribed ? 'Joined!' : 'Subscribe'}
              </button>
            </form>
          </div>

        </aside>
      </div>

      {/* 5. Explore Health & Wellbeing Topics */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#EAE5DF] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A] block">
              Categories
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Explore Health &amp; Wellbeing Topics
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOPICS.health.map((topic) => (
            <div
              key={topic.name}
              onClick={() => setSelectedSubcategory(topic.name)}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={topic.image}
                alt={topic.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <h5 className="font-serif font-bold text-base leading-tight group-hover:text-[#FFCEBA] transition-colors">
                  {topic.name}
                </h5>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
