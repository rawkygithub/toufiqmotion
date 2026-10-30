import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';
import {
  Briefcase,
  Users,
  Heart,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Download,
  Mail,
  Send,
  CheckCircle2,
  Check,
  Compass,
  Camera,
  Award,
  Globe
} from 'lucide-react';

export const WorkWithUsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'work' | 'newsletter'>('work');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: 'Destination Partnership',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const stats = [
    { value: '50K+', label: 'Monthly Readers', icon: Users },
    { value: '100K+', label: 'Social Followers', icon: Globe },
    { value: '4%+', label: 'Avg. Engagement Rate', icon: TrendingUp },
    { value: '100%', label: 'Authentic Content', icon: Award },
  ];

  const waysToWork = [
    {
      title: 'Destination Partnerships',
      desc: 'Showcasing unique destinations through immersive travel guides, curated itineraries and high-resolution photography.',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      badge: 'Tourism Boards'
    },
    {
      title: 'Brand Collaborations',
      desc: 'Authentic product integration, thoughtful reviews and aesthetic editorial features that resonate with conscious travelers.',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      badge: 'Products & Gear'
    },
    {
      title: 'Press Trips & Stays',
      desc: 'Experiential coverage of boutique hotels, wellness retreats, eco-lodges and culinary adventures worldwide.',
      image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=600&q=80',
      badge: 'Hospitality'
    },
    {
      title: 'Sponsored Content',
      desc: 'Bespoke storytelling, multi-channel social campaigns and licensing of commercial travel photography.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
      badge: 'Campaigns'
    },
  ];

  const whyWorkReasons = [
    'Authentic and trustworthy storytelling that builds real reader affinity',
    'High-quality editorial photography and engaging, shareable content',
    'A global, highly engaged audience interested in travel, lifestyle and wellbeing',
    'A steadfast focus on meaningful, experience-led collaborations',
    'Professional, reliable communication and comprehensive post-campaign reporting'
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    try {
      await api.submitInquiry({
        type: 'partnership',
        name: formData.name,
        email: formData.email,
        company: formData.company,
        projectType: formData.projectType,
        message: formData.message
      });
    } catch (err) {
      console.warn('Backend inquiry note:', err);
    }
    setTimeout(() => {
      setFormData({ name: '', email: '', company: '', projectType: 'Destination Partnership', message: '' });
      setFormSubmitted(false);
    }, 4000);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSubscribed(true);
    try {
      await api.subscribeNewsletter(newsletterEmail, newsletterName, 'newsletter_landing');
    } catch (err) {
      console.warn('Backend newsletter note:', err);
    }
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterName('');
      setNewsletterSubscribed(false);
    }, 3500);
  };

  const downloadMediaKit = () => {
    alert('Toufiq Motion 2026 Media Kit (PDF): Opening download package with audience demographics, case studies, and rate card.');
  };

  return (
    <div className="space-y-16 pt-2">
      
      {/* Sub-navigation Switcher between "Work With Us" and "Join Newsletter" (Page 5) */}
      <div className="flex items-center justify-center">
        <div className="bg-white border border-[#EDE7DF] p-1.5 rounded-full shadow-xs flex items-center gap-1">
          <button
            onClick={() => setActiveTab('work')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'work'
                ? 'bg-[#E8734A] text-white shadow-xs'
                : 'text-[#6A6357] hover:text-[#1E1B18]'
            }`}
          >
            Work With Us
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'newsletter'
                ? 'bg-[#E8734A] text-white shadow-xs'
                : 'text-[#6A6357] hover:text-[#1E1B18]'
            }`}
          >
            Join Newsletter
          </button>
        </div>
      </div>

      {activeTab === 'work' ? (
        /* WORK WITH US VIEW (Page 5, Right Side) */
        <div className="space-y-16 sm:space-y-24">
          
          {/* 1. Hero Section */}
          <section className="relative rounded-[32px] overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
              alt="Traveler with mountain background"
              className="absolute inset-0 w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

            <div className="relative z-10 p-8 sm:p-14 lg:p-20 max-w-2xl text-white space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md text-[#FFCEBA] border border-white/20">
                <Sparkles className="w-3.5 h-3.5" /> Collaborations &amp; Media Kit
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12]">
                Let's Create <br />
                Something Meaningful
              </h1>

              <p className="text-white/85 text-sm sm:text-base font-light leading-relaxed">
                I love collaborating with brands, destinations and organizations that share a passion for travel, lifestyle and wellbeing. Together we can create authentic stories, engaging content and meaningful partnerships that inspire and add value to a global audience.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={downloadMediaKit}
                  className="px-7 py-3.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Media Kit (PDF)
                </button>
                <a
                  href="#contact-form"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </section>

          {/* 2. Stats Row (Page 5: 50K+, 100K+, 4%+, 100%) */}
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EDE7DF] shadow-xs">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[#F0ECE6]">
              {stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className={`text-center space-y-2 ${idx > 0 ? 'pt-6 lg:pt-0 lg:pl-6' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
                      {s.value}
                    </div>
                    <div className="text-xs text-[#8C8477] uppercase tracking-wider font-semibold">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Ways We Can Work Together (4 Cards from Page 5) */}
          <section className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A]">
                Partnership Avenues
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
                Ways We Can Work Together
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {waysToWork.map((way, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#EDE7DF] hover:border-[#E8734A]/50 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={way.image}
                        alt={way.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#E8734A]">
                        {way.badge}
                      </span>
                    </div>

                    <div className="p-6">
                      <h4 className="font-serif font-bold text-lg text-[#1E1B18] group-hover:text-[#E8734A] transition-colors mb-2">
                        {way.title}
                      </h4>
                      <p className="text-xs text-[#6A6357] leading-relaxed">
                        {way.desc}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2">
                    <a
                      href="#contact-form"
                      className="text-xs font-bold text-[#E8734A] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Inquire About This <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Why Work with Toufiq Motion & Inquiry Form (Page 5) */}
          <div id="contact-form" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left (6 cols): Why Work with Toufiq Motion? */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A]">
                The Value Proposition
              </span>
              <h3 className="font-serif text-3xl font-bold text-[#1E1B18]">
                Why Work With Toufiq Motion?
              </h3>
              <p className="text-[#655E52] text-sm leading-relaxed font-light">
                We believe the best marketing does not feel like advertising. It feels like a trusted friend sharing an unforgettable discovery. Every partnership is treated as a bespoke editorial story crafted with genuine passion.
              </p>

              <div className="space-y-4 pt-2">
                {whyWorkReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#3E382E] leading-relaxed font-medium">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>

              {/* Founder Signature Quote */}
              <div className="p-6 bg-[#FAF6EE] rounded-2xl border border-[#EDE7DF] space-y-3 mt-6">
                <p className="font-serif italic text-sm text-[#4A453E]">
                  "Our mission is to inspire people to slow down, explore the wonders of this earth with curiosity, and cultivate vibrant inner peace."
                </p>
                <p className="text-xs font-bold text-[#1E1B18]">
                  — Toufiq Motion, Founder &amp; Creative Lead
                </p>
              </div>
            </div>

            {/* Right (6 cols): "Let's Talk" Form Card (Page 5) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 border border-[#EDE7DF] shadow-lg space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-2xl text-[#1E1B18]">Let's Talk</h4>
                  <p className="text-xs text-[#8C8477]">Tell us about your brand or upcoming campaign</p>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sarah@brand.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Tourism Board, Hotel, Brand..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Partnership Interest</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                    >
                      <option>Destination Partnership</option>
                      <option>Brand Collaboration</option>
                      <option>Press Trip / Hotel Feature</option>
                      <option>Commercial Photography</option>
                      <option>Other / Bespoke</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Your Message &amp; Vision</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the timeline, deliverables, or story you'd like to bring to life..."
                    className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {formSubmitted ? (
                    <>
                      <Check className="w-4 h-4" /> Message Delivered! We'll reply within 24h.
                    </>
                  ) : (
                    <>
                      Send Inquiry <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      ) : (
        /* NEWSLETTER VIEW (Page 5, Left Side) */
        <div className="space-y-16">
          
          {/* Newsletter Hero */}
          <section className="relative rounded-[32px] overflow-hidden min-h-[460px] flex items-center shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
              alt="Travel inspiration beach horizon"
              className="absolute inset-0 w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

            <div className="relative z-10 p-8 sm:p-14 max-w-xl text-white space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md text-[#FFCEBA] border border-white/20">
                <Sparkles className="w-3.5 h-3.5" /> JOIN OUR NEWSLETTER
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-[1.15]">
                Travel Inspiration <br />
                Straight to Your Inbox
              </h1>

              <p className="text-white/85 text-sm sm:text-base font-light leading-relaxed">
                Get the latest travel guides, destination ideas, lifestyle tips and exclusive stories from Toufiq Motion delivered with warmth each Sunday.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                    placeholder="Your first name"
                    className="px-4 py-3 rounded-full bg-white/95 text-xs text-[#2D2A26] placeholder-[#8C8477] focus:outline-hidden w-full sm:w-48 shadow-sm"
                  />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email address"
                    className="px-5 py-3 rounded-full bg-white/95 text-xs text-[#2D2A26] placeholder-[#8C8477] focus:outline-hidden grow shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {newsletterSubscribed ? <><Check className="w-4 h-4" /> You're on the list!</> : <>Sign Up Now <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          </section>

          {/* "What You'll Get" 3 Cards (Page 5) */}
          <section className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-center text-[#1E1B18]">
              What You'll Get Every Week
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto text-xl">
                  🧭
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1E1B18]">Latest Articles</h4>
                <p className="text-xs text-[#6A6357] leading-relaxed">
                  Be the first to read our newest curated travel itineraries, slow living essays and wellbeing advice.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto text-xl">
                  ☕
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1E1B18]">Personal Recommendations</h4>
                <p className="text-xs text-[#6A6357] leading-relaxed">
                  Private cafe recommendations, secret coastal view points and gear essentials not published on the public blog.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto text-xl">
                  🎁
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1E1B18]">Exclusive Updates</h4>
                <p className="text-xs text-[#6A6357] leading-relaxed">
                  Free packing checklists, high-res phone wallpapers, and early invitations to community retreats.
                </p>
              </div>
            </div>
          </section>

        </div>
      )}

    </div>
  );
};

