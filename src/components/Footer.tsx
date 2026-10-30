import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ARTICLES } from '../data/articles';
import {
  Compass,
  Coffee,
  Heart,
  Home as HomeIcon,
  Sparkles,
  ArrowUp,
  ArrowRight,
  Send,
  CheckCircle2,
  Check
} from 'lucide-react';
import { InstagramIcon, YoutubeIcon, PinterestIcon, FacebookIcon } from './SocialIcons';

export const Footer: React.FC = () => {
  const { setActivePage, openArticle } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const santoriniArticle = ARTICLES.find((a) => a.id === 'santorini-things-to-do') || ARTICLES[0];

  return (
    <footer className="mt-20 border-t border-[#EAE5DF] bg-[#FAF8F5] relative overflow-hidden z-10">
      
      {/* 1. Newsletter Banner (Top of Page 7) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 mb-16 relative z-20">
        <div className="bg-gradient-to-br from-[#FFFDFC] to-[#FBF8F3] border border-[#EDE7DF] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Newsletter Content */}
          <div className="max-w-xl text-left">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E8734A] mb-2 block font-sans">
              Join The Journey
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1E1B18] tracking-tight mb-3">
              Get Travel Inspiration in Your Inbox
            </h2>
            <p className="text-[#686257] text-sm sm:text-base leading-relaxed mb-6 font-light">
              Join our weekly newsletter for the latest travel guides, lifestyle ideas, wellbeing tips and exclusive content from Toufiq Motion.
            </p>

            {/* Email Form */}
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="grow px-5 py-3 rounded-full bg-white border border-[#E0DCD4] focus:outline-hidden focus:border-[#E8734A] text-sm text-[#2D2A26] placeholder-[#9E978C] shadow-2xs"
              />
              <button
                type="submit"
                className="px-7 py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4" /> Welcome Aboard!
                  </>
                ) : (
                  <>
                    Subscribe <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 3 Value Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 text-xs text-[#7A7468]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A]" /> Exclusive content
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A]" /> Travel inspiration
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A]" /> Lifestyle & wellbeing tips
              </span>
            </div>
          </div>

          {/* Newsletter Photo on Right */}
          <div className="w-full lg:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden relative shadow-md shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
              alt="Travel inspiration beach view"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFCEBA]">Curated Weekly</span>
              <p className="font-serif text-sm font-semibold">Slow travel memories & intentional living</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 5-Column Navigation Grid (Page 7) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Socials (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="font-serif text-2xl font-bold text-[#1E1B18] tracking-tight mb-3">
              Toufiq Motion
            </h3>
            <p className="text-[#6A6357] text-sm leading-relaxed mb-6 font-light">
              A travel and lifestyle editorial blog sharing inspiring destinations, practical travel guides, local food and coffee discoveries, lifestyle ideas and simple ways to live well.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 text-[#4A453E]">
              <a
                href="#instagram"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E0D8] hover:border-[#E8734A] hover:text-[#E8734A] flex items-center justify-center transition-all"
                title="Instagram @toufiqmotion"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E0D8] hover:border-[#E8734A] hover:text-[#E8734A] flex items-center justify-center transition-all"
                title="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="#pinterest"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E0D8] hover:border-[#E8734A] hover:text-[#E8734A] flex items-center justify-center transition-all"
                title="Pinterest"
              >
                <PinterestIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="#facebook"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E0D8] hover:border-[#E8734A] hover:text-[#E8734A] flex items-center justify-center transition-all"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif font-bold text-base text-[#1E1B18] mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs text-[#6A6357]">
              <li>
                <button onClick={() => setActivePage('home')} className="hover:text-[#E8734A] transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('travel')} className="hover:text-[#E8734A] transition-colors">
                  Travel
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('lifestyle')} className="hover:text-[#E8734A] transition-colors">
                  Lifestyle
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('health')} className="hover:text-[#E8734A] transition-colors">
                  Health & Wellbeing
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('about')} className="hover:text-[#E8734A] transition-colors">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('work')} className="hover:text-[#E8734A] transition-colors">
                  Work With Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif font-bold text-base text-[#1E1B18] mb-4">Popular Links</h4>
            <ul className="space-y-2.5 text-xs text-[#6A6357]">
              <li>
                <button onClick={() => setActivePage('travel')} className="hover:text-[#E8734A] transition-colors">
                  Travel Guides
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('travel')} className="hover:text-[#E8734A] transition-colors">
                  Destination Inspiration
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('lifestyle')} className="hover:text-[#E8734A] transition-colors">
                  Food & Coffee
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('lifestyle')} className="hover:text-[#E8734A] transition-colors">
                  Lifestyle Tips
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('health')} className="hover:text-[#E8734A] transition-colors">
                  Wellbeing
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('home')} className="hover:text-[#E8734A] transition-colors">
                  Latest Articles
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif font-bold text-base text-[#1E1B18] mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-[#6A6357]">
              <li>
                <span className="hover:text-[#E8734A] cursor-pointer">Travel Planning Tools</span>
              </li>
              <li>
                <span className="hover:text-[#E8734A] cursor-pointer">Packing Guides</span>
              </li>
              <li>
                <span className="hover:text-[#E8734A] cursor-pointer">Recommended Gear</span>
              </li>
              <li>
                <span className="hover:text-[#E8734A] cursor-pointer">Helpful Apps</span>
              </li>
              <li>
                <span className="hover:text-[#E8734A] cursor-pointer">Tips & Advice</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Featured Destination Card (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif font-bold text-base text-[#1E1B18] mb-4">Featured Destination</h4>
            <div
              onClick={() => openArticle(santoriniArticle)}
              className="group bg-white rounded-2xl overflow-hidden border border-[#EDE7DF] hover:border-[#E8734A]/50 shadow-2xs hover:shadow-md cursor-pointer transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={santoriniArticle.image}
                  alt={santoriniArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <h5 className="font-serif font-bold text-xs text-[#1E1B18] group-hover:text-[#E8734A] transition-colors truncate">
                  Santorini Travel Guide
                </h5>
                <span className="text-[11px] text-[#E8734A] font-semibold flex items-center gap-1 mt-1 group-hover:translate-x-1 transition-transform">
                  Read the Guide <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Value Proposition Strip (Page 7) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-[#EAE5DF]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mb-2 shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <h5 className="font-serif font-bold text-sm text-[#1E1B18]">Inspiring Destinations</h5>
            <p className="text-[11px] text-[#8C8477] mt-0.5">Guides, tips and ideas</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mb-2 shadow-2xs">
              <Coffee className="w-5 h-5" />
            </div>
            <h5 className="font-serif font-bold text-sm text-[#1E1B18]">Local Food & Coffee</h5>
            <p className="text-[11px] text-[#8C8477] mt-0.5">Great places to eat and drink</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mb-2 shadow-2xs">
              <HomeIcon className="w-5 h-5" />
            </div>
            <h5 className="font-serif font-bold text-sm text-[#1E1B18]">Lifestyle Inspiration</h5>
            <p className="text-[11px] text-[#8C8477] mt-0.5">For a richer everyday life</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mb-2 shadow-2xs">
              <Heart className="w-5 h-5" />
            </div>
            <h5 className="font-serif font-bold text-sm text-[#1E1B18]">Health & Wellbeing</h5>
            <p className="text-[11px] text-[#8C8477] mt-0.5">Simple ways to live well</p>
          </div>

        </div>
      </div>

      {/* 4. Copyright & Legal Bar with Back to Top */}
      <div className="bg-[#F3EFEA] border-t border-[#EAE5DF] py-6 text-xs text-[#8C8477]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} Toufiq Motion. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a href="#terms" className="hover:text-[#1E1B18] transition-colors">Terms of Use</a>
            <span>&bull;</span>
            <a href="#privacy" className="hover:text-[#1E1B18] transition-colors">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#cookies" className="hover:text-[#1E1B18] transition-colors">Cookie Preferences</a>
            <span>&bull;</span>
            <a href="#affiliate" className="hover:text-[#1E1B18] transition-colors">Affiliate Disclosure</a>
            <span>&bull;</span>
            <a href="#editorial" className="hover:text-[#1E1B18] transition-colors">Editorial Policy</a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 p-2 rounded-full bg-white border border-[#E2DDD5] text-[#4A453E] hover:text-[#E8734A] hover:border-[#E8734A] shadow-2xs transition-all"
            title="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
