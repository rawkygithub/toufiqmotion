import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FAQS } from '../../data/articles';
import { api } from '../../api/client';
import {
  Compass,
  Coffee,
  Heart,
  Globe,
  Mail,
  MapPin,
  Send,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  Copy
} from 'lucide-react';
import { InstagramIcon } from '../SocialIcons';

interface AboutContactProps {
  initialView?: 'about' | 'contact';
}

export const AboutContactPage: React.FC<AboutContactProps> = ({ initialView = 'about' }) => {
  const { setActivePage, articles } = useTheme();
  const [view, setView] = useState<'about' | 'contact'>(initialView);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const pillars = [
    {
      title: 'Travel',
      desc: 'Inspiring destinations, practical guides, authentic itineraries and unforgettable adventures.',
      icon: Compass,
      color: 'bg-[#FFF2EB] text-[#E8734A]'
    },
    {
      title: 'Lifestyle',
      desc: 'Ideas, artisanal coffee discoveries, intentional home spaces, creativity and slow living.',
      icon: Coffee,
      color: 'bg-[#FDF5EE] text-[#A06235]'
    },
    {
      title: 'Health & Wellbeing',
      desc: 'Simple morning habits, mental clarity, wholesome nutrition and mindfulness practices.',
      icon: Heart,
      color: 'bg-[#EDF7F1] text-[#2E7D5A]'
    },
    {
      title: 'Real Experiences',
      desc: 'Authentic reflections, honest reviews, personal stories and unfiltered perspectives.',
      icon: Globe,
      color: 'bg-[#F3EFF8] text-[#7C3AED]'
    },
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hello@toufiqmotion.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    try {
      await api.submitInquiry({
        type: 'contact',
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message
      });
    } catch (err) {
      console.warn('Backend contact inquiry note:', err);
    }
    setTimeout(() => {
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-16 pt-2">
      
      {/* Sub-navigation Switcher between About & Contact (Page 6) */}
      <div className="flex items-center justify-center">
        <div className="bg-white border border-[#EDE7DF] p-1.5 rounded-full shadow-xs flex items-center gap-1">
          <button
            onClick={() => setView('about')}
            className={`px-7 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              view === 'about'
                ? 'bg-[#E8734A] text-white shadow-xs'
                : 'text-[#6A6357] hover:text-[#1E1B18]'
            }`}
          >
            About Toufiq Motion
          </button>
          <button
            onClick={() => setView('contact')}
            className={`px-7 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              view === 'contact'
                ? 'bg-[#E8734A] text-white shadow-xs'
                : 'text-[#6A6357] hover:text-[#1E1B18]'
            }`}
          >
            Contact &amp; Connect
          </button>
        </div>
      </div>

      {view === 'about' ? (
        /* ABOUT TOUFIQ MOTION (Page 6 Left) */
        <div className="space-y-16 sm:space-y-24">
          
          {/* 1. About Hero */}
          <section className="space-y-6">
            <div className="max-w-3xl space-y-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#D86237] border border-[#FBD8C8] inline-block">
                ABOUT TOUFIQ MOTION
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
                A Blog for Brighter Days <br />
                and Bigger Adventures
              </h1>
              <p className="text-[#655E52] text-sm sm:text-base leading-relaxed font-light">
                Toufiq Motion is a travel and lifestyle journal sharing inspiring destinations, practical travel guides, local food and coffee discoveries, lifestyle ideas and simple ways to live well.
              </p>
            </div>

            {/* Panoramic Image Banner */}
            <div className="rounded-[32px] overflow-hidden aspect-[21/9] shadow-xl relative">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
                alt="Traveler with mountain background"
                className="w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          </section>

          {/* 2. "The Story Behind Toufiq Motion" (Page 6) */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#EDE7DF] shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Portrait Photo of Toufiq (With Hat and Camera) */}
              <div className="lg:col-span-5 relative">
                <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                    alt="Toufiq portrait with fedora hat"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-[#FFF2EB] border border-[#FBD8C8] text-[#D86237] px-4 py-2 rounded-2xl shadow-md text-xs font-bold uppercase tracking-wider font-sans">
                  Founder &bull; Photographer
                </div>
              </div>

              {/* Bio Story */}
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A]">
                  Behind The Lens
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18] leading-tight">
                  The Story Behind Toufiq Motion
                </h2>
                
                <div className="space-y-4 text-sm sm:text-base text-[#595246] leading-relaxed font-light">
                  <p>
                    I created Toufiq Motion to document the places I explore, the experiences that inspire me, and the everyday moments that make life richer. This blog is a space to share travel tips, meaningful experiences, good food and coffee, lifestyle ideas and simple ways to support a healthy and balanced life.
                  </p>
                  <p>
                    Over the past decade, my travels have taken me across remote mountain villages, bustling neon-lit metropolises, quiet artisan pottery studios, and sun-drenched coastal trails. Along the way, I realized that true luxury is not excessive consumption—it is presence, intentionality, and taking the time to truly see the world.
                  </p>
                  <p>
                    Whether you are planning your dream sabbatical to the Amalfi Coast or simply looking for ways to infuse warmth and mindfulness into your weekday routine, I am honored to share this journey with you.
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-6">
                  <div>
                    <span className="font-serif text-2xl font-bold text-[#1E1B18]">40+</span>
                    <p className="text-xs text-[#8C8477]">Countries Explored</p>
                  </div>
                  <div className="h-8 w-px bg-[#EAE5DF]" />
                  <div>
                    <span className="font-serif text-2xl font-bold text-[#1E1B18]">
                      {articles.length > 0 ? `${articles.length}+` : '100%'}
                    </span>
                    <p className="text-xs text-[#8C8477]">
                      {articles.length > 0 ? 'Curated Stories' : 'Authentic Stories'}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-[#EAE5DF]" />
                  <div>
                    <span className="font-serif text-2xl font-bold text-[#1E1B18]">Global</span>
                    <p className="text-xs text-[#8C8477]">Mindful Readership</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* 3. "What You'll Find Here" 4 Pillars (Page 6) */}
          <section className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A]">
                Our Four Core Pillars
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
                What You'll Find Here
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs hover:shadow-lg transition-all space-y-4"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${pillar.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#1E1B18]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6A6357] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Quote Banner with Scenic Photo (Page 6) */}
          <section className="relative rounded-3xl overflow-hidden min-h-[380px] flex items-center justify-center text-center p-8 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=2000&q=80"
              alt="Scenic cliffside coast"
              className="absolute inset-0 w-full h-full object-cover scale-102"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs" />
            
            <div className="relative z-10 max-w-2xl text-white space-y-5">
              <span className="text-xs uppercase font-bold tracking-widest text-[#FFCEBA]">
                A Way of Seeing
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-snug">
                "To Inspire a More Curious, <br /> Fulfilling Life"
              </h2>
              <p className="text-white/85 text-xs sm:text-sm font-light leading-relaxed max-w-lg mx-auto">
                I hope Toufiq Motion encourages you to discover new places, try new experiences and find simple ways to live well — wherever in the world you are.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActivePage('travel')}
                  className="px-8 py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 mx-auto"
                >
                  Join the Journey <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

        </div>
      ) : (
        /* CONTACT PAGE (Page 6 Right) */
        <div className="space-y-16 sm:space-y-24">
          
          {/* 1. Contact Hero */}
          <section className="space-y-6">
            <div className="max-w-3xl space-y-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF2EB] text-[#D86237] border border-[#FBD8C8] inline-block">
                GET IN TOUCH
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
                Let's Connect
              </h1>
              <p className="text-[#655E52] text-sm sm:text-base leading-relaxed font-light">
                I'd love to hear from you. Whether you have a question, feedback, a collaboration idea or just want to say hello, feel free to get in touch.
              </p>
            </div>

            {/* Coastal Panorama Banner */}
            <div className="rounded-[32px] overflow-hidden aspect-[21/9] shadow-xl relative">
              <img
                src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2000&q=80"
                alt="Scenic coast"
                className="w-full h-full object-cover scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </section>

          {/* 2. Main Contact Form & Other Ways to Connect (Page 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column (7 cols): Send a Message Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-[#EDE7DF] shadow-xs space-y-6">
              <h3 className="font-serif font-bold text-2xl text-[#1E1B18]">
                Send a Message
              </h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Liam Parker"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="liam@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="General Inquiry, Feedback, Travel Question..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Your Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Write your note here..."
                    className="w-full p-4 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {contactSubmitted ? (
                    <>
                      <Check className="w-4 h-4" /> Message Sent! We'll reply soon.
                    </>
                  ) : (
                    <>
                      Send Message <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column (5 cols): Other Ways to Connect (Page 6) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs space-y-6">
                <h4 className="font-serif font-bold text-xl text-[#1E1B18] pb-3 border-b border-[#F0ECE6]">
                  Other Ways to Connect
                </h4>

                {/* Email Box */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="grow">
                    <h5 className="font-bold text-xs text-[#1E1B18]">Email Inquiries</h5>
                    <p className="text-xs text-[#E8734A] font-medium mt-0.5">hello@toufiqmotion.com</p>
                    <button
                      onClick={handleCopyEmail}
                      className="text-[11px] text-[#8C8477] hover:text-[#1E1B18] flex items-center gap-1 mt-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" /> {copiedEmail ? 'Copied to clipboard!' : 'Copy email'}
                    </button>
                  </div>
                </div>

                {/* Instagram Box */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#1E1B18]">Instagram</h5>
                    <p className="text-xs text-[#6A6357] mt-0.5">@toufiqmotion</p>
                    <p className="text-[11px] text-[#8C8477] mt-0.5">Daily visual travel journal &amp; story dispatch</p>
                  </div>
                </div>

                {/* Location Box */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#1E1B18]">Location</h5>
                    <p className="text-xs text-[#6A6357] mt-0.5">Kuala Lumpur, Malaysia &bull; Traveling Worldwide</p>
                  </div>
                </div>
              </div>

              {/* Work With Me Promo Card (Page 6) */}
              <div className="bg-gradient-to-br from-[#FFFDFC] to-[#FAF6EE] rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8734A]">
                  Brands &amp; Tourism
                </span>
                <h4 className="font-serif font-bold text-lg text-[#1E1B18]">
                  Work With Me
                </h4>
                <p className="text-xs text-[#6A6357] leading-relaxed">
                  I'm open to collaborations, partnerships and creative projects that align with our authentic aesthetic.
                </p>
                <button
                  onClick={() => setActivePage('work')}
                  className="w-full py-2.5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-bold text-[#4A453E] hover:border-[#E8734A] hover:text-[#E8734A] transition-all flex items-center justify-center gap-1.5"
                >
                  Explore Collaborations &bull; Media Kit <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

          {/* 3. Frequently Asked Questions Accordion (Page 6 Bottom) */}
          <section className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8734A]">
                Common Inquiries
              </span>
              <h3 className="font-serif text-3xl font-bold text-[#1E1B18]">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-[#EDE7DF] overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-serif font-bold text-base text-[#1E1B18] hover:text-[#E8734A] transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#E8734A] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8C8477] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#595246] leading-relaxed border-t border-[#F5F2EB] animate-in fade-in duration-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

    </div>
  );
};
