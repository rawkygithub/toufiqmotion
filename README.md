# ✨ Toufiq Motion — Modern Editorial Blog Frontend

A modern, eye-smooth, luminous travel, lifestyle, and wellbeing editorial blog built with **Node.js, React 19, TypeScript, and Tailwind CSS**, meticulously crafted according to the designer's 7-page specification.

---

## 🌟 Highlights & Core Features

### 1. The "Inside Light" & "Eye-Smooth" Experience
As requested, when a user enters the site, they experience an eye-soothing, subtle ambient luminescence ("inside light") that radiates warmly behind editorial cards and typography.
- **5 Atmospheric Lighting Presets**:
  - 🌅 **Golden Hour**: Warm sunset honey & sunlit peach illumination.
  - 🌿 **Morning Dew**: Fresh champagne & ethereal botanic morning mist.
  - 🌄 **Sunset Ember**: Velvet dusk terracotta & romantic rose twilight.
  - 🕯️ **Candlelight**: Intimate bronze hearth & warm cozy flicker.
  - 🏛️ **Studio Minimal**: Crisp neutral gallery lighting.
- **Floating Ambient Controller**: Users can adjust glow intensity and select their mood preset anytime from the floating pill or navigation header.

---

### 2. Complete Coverage of All 7 Design Pages

#### 📄 Page 1: Homepage (All 3 Designer Variants Built-in!)
- **Live Variant Switcher Toolbar**: Easily switch between all 3 designer layouts:
  1. **Design 1 — Minimal Magazine Style**: Split hero with arched photography, "Explore Stories" & "Start Reading" CTAs, "Popular Reads" 3-card grid, 4 category icon pills, and large editorial Swiss Alps feature card.
  2. **Design 2 — Clean Editorial Style**: Immersive full-bleed alpine lake hero card with overlay, "Explore by Category" (Travel, Lifestyle, Health & Wellbeing) visual rounded cards, and "Latest Articles" 3-column grid.
  3. **Design 3 — Modern Card Style**: Asymmetric split hero with hand-lettered *"Explore, Discover, Live Well"* script stamp, large dark Amalfi Coast card, stacked secondary features, and "Latest from the Blog" section.

#### 📄 Page 2: Travel Page
- Wide panoramic alpine landscape banner
- Subcategory icon filter pills (*All, Road Trips, Island Escapes, Travel Tips, Weekend Getaways, Nature & Outdoor, City Guides*)
- Left column: Large Amalfi Coast featured story + 6 latest travel article cards
- Right sidebar: Live search box, Popular Topics list, Travel Resources promo card, Numbered trending articles (*01 to 04*), and newsletter card
- "Popular Destinations" visual grid (*Paris, Santorini, Bali, New York, Swiss Alps, Tokyo*)

#### 📄 Page 3: Lifestyle Page
- Everyday inspiration hero with sunlit morning interior
- Category pills (*Food & Coffee, Home & Living, Productivity, Experiences, Style & Essentials*)
- Featured split story: *The Best Coffee Shops to Try in 2024* + *Simple Habits for a More Fulfilling Life*
- Latest lifestyle articles grid
- 5 visual topic cards
- "Get Fresh Ideas in Your Inbox" newsletter block

#### 📄 Page 4: Health & Wellbeing Page
- Serene sunrise meditation hero
- Categories (*Healthy Living, Mental Wellbeing, Fitness & Movement, Nutrition & Food, Sleep & Recovery, Mindful Travel*)
- Featured story: *10 Simple Habits for a Happier, Healthier Life* with search bar
- Latest articles + Quick Wellbeing Tips sidebar (*Start your day with intention, Stay hydrated, Move your body, Be kind to yourself*)
- "Feel Better. Explore More." newsletter card
- 5 visual topic cards

#### 📄 Page 5: Newsletter & Work With Us
- **Work With Us**:
  - Partnership hero & "Download Media Kit (PDF)"
  - Stats row: **50K+** Monthly Readers, **100K+** Social Followers, **4%+** Avg. Engagement, **100%** Authentic Content
  - 4 Ways to Work Together (*Destination Partnerships, Brand Collaborations, Press Trips, Sponsored Content*)
  - 5 Why Work with Toufiq Motion checkmark guarantees
  - "Let's Talk" inquiry form with instant delivery feedback
- **Newsletter View**:
  - "What You'll Get" 3 preview cards & instant signup

#### 📄 Page 6: About & Contact Page
- **About Toufiq Motion**:
  - Founder bio, photographer portrait with hat, 4 core pillars (*Travel, Lifestyle, Health & Wellbeing, Real Experiences*)
  - "To Inspire a More Curious, Fulfilling Life" quote banner
- **Contact Page**:
  - "Send a Message" interactive form
  - Direct connection cards (*hello@toufiqmotion.com* with one-click copy, Instagram, Kuala Lumpur location)
  - "Work With Me" promo card
  - Frequently Asked Questions interactive accordion

#### 📄 Page 7: Footer Navigation & Value Propositions
- "Get Travel Inspiration in Your Inbox" banner with beach photo & 3 check badges
- 5-Column Navigation: Brand & Socials (*Instagram, YouTube, Pinterest, Facebook*), Explore, Popular Links, Resources, and Featured Santorini card
- 4-item Value Proposition strip (*Inspiring Destinations, Local Food & Coffee, Lifestyle Inspiration, Health & Wellbeing*)
- Legal & copyright bar with smooth Back to Top button

---

### 3. Extra Reader-Centric Features
- **Immersive Article Reader View**: Click any story to open a distraction-free reader modal with real-time reading progress bar, ambient lighting toggle, quote callouts, like/claps counter, and reader reflections/comments.
- **Global Search Modal (`Ctrl+K` or `Cmd+K`)**: Instant search across titles, excerpts, destinations, and tags with popular keyword pills.
- **Bookmarks / Reading List Drawer**: Save any story to read later; persists locally in `localStorage`.

---

## 🚀 Getting Started with Node.js

### 1. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build and Run Production Node.js Server
```bash
npm run build
npm start
```
The Node.js server starts at [http://localhost:3000](http://localhost:3000) and serves both the frontend SPA and API endpoints:
- `GET /api/health` — Health check
- `POST /api/newsletter` — Newsletter subscription handler
- `POST /api/inquiry` — Partnership & collaboration inquiries handler

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Frontend Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + `@tailwindcss/vite`
- **Styling**: Tailwind CSS v4 (Editorial Serif, Plus Jakarta Sans, Caveat script, custom warm glow tokens)
- **Icons**: Lucide React + custom SVG social icons
