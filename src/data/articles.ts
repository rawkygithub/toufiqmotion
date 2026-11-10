export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Travel' | 'Lifestyle' | 'Health & Wellbeing';
  subcategory: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  trendingRank?: number;
  popularDestination?: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  content: string[];
  quote?: string;
  viewsCount?: number;
  likesCount?: number;
  htmlContent?: string;
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogImage?: string;
  seoScore?: number;
  readabilityScore?: number;
  hasAffiliateLinks?: boolean;
  affiliateDisclosure?: string;
}

export const ARTICLES: Article[] = [
  // TRAVEL ARTICLES
  {
    id: 'amalfi-coast-guide',
    slug: 'the-ultimate-amalfi-coast-travel-guide',
    title: 'The Ultimate Amalfi Coast Travel Guide',
    excerpt: 'Discover the best towns, things to do, where to stay and tips for an unforgettable trip to Italy\'s stunning coastline.',
    category: 'Travel',
    subcategory: 'Island Escapes',
    date: 'May 14, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
    featured: true,
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Italy', 'Coast', 'Europe', 'Summer', 'Photography'],
    quote: 'The Amalfi Coast is not merely a destination; it is an intoxicating feeling of warm stone, salted breezes, and endless lemon groves.',
    content: [
      'Clinging dramatically to the rugged cliffs of southern Italy, the Amalfi Coast has captured the imagination of wanderers, artists, and poets for centuries. With pastel-hued villages tumbling into turquoise waters, fragrant lemon groves perched on terraced hillsides, and winding coastal roads offering breathtaking panoramas at every turn, it is undeniably one of Europe’s most magical destinations.',
      'Whether you are dreaming of wandering the chic vertical alleyways of Positano, savoring fresh seafood overlooking the sea in Amalfi, or finding peaceful solitude amid the aristocratic gardens of Ravello, this comprehensive guide will help you experience the very best of this iconic coastline.',
      'Getting Around: While renting a vintage Vespa might seem romantic, during high season the cliffside roads can be challenging. We recommend utilizing the ferry network connecting Salerno, Amalfi, and Positano for the most picturesque perspectives.',
      'Where to Stay: Base yourself in Amalfi for easy transit hub access, or opt for Praiano if you desire peaceful sunsets away from tourist crowds.'
    ]
  },
  {
    id: 'swiss-alps-weekend',
    slug: 'a-perfect-weekend-in-the-swiss-alps',
    title: 'A Perfect Weekend in the Swiss Alps',
    excerpt: 'Escape to dramatic peaks, crystal-clear alpine lakes and cozy chalets for a restorative weekend surrounded by nature.',
    category: 'Travel',
    subcategory: 'Nature & Outdoor',
    date: 'May 12, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Switzerland', 'Mountains', 'Hiking', 'Weekend'],
    content: [
      'The morning sun spills gold over snow-capped ridges as crisp alpine air fills your lungs. A weekend in the Swiss Alps is an antidote to the bustling modern world.',
      'From scenic cogwheel trains winding past emerald meadows to fondue dinners under starry mountain skies, every hour spent in these highlands feels elevated and deeply grounding.'
    ]
  },
  {
    id: 'thailand-islands',
    slug: '10-beautiful-islands-in-thailand-you-need-to-visit',
    title: '10 Beautiful Islands in Thailand You Need to Visit',
    excerpt: 'From hidden limestone lagoons to white sand paradises, explore Thailand\'s most breathtaking and serene island escapes.',
    category: 'Travel',
    subcategory: 'Island Escapes',
    date: 'May 10, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    trendingRank: 1,
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Thailand', 'Islands', 'Beaches', 'Asia'],
    content: [
      'Beyond the crowded tourist strips lie hidden gems with crystal-clear turquoise waters and dramatic karst limestone cliffs.',
      'Koh Kood offers untouched tranquility, while Koh Lanta provides the quintessential bohemian island pace where time slows down to sunset tides.'
    ]
  },
  {
    id: 'florence-guide',
    slug: 'a-complete-guide-to-florence-art-food-and-views',
    title: 'A Complete Guide to Florence: Art, Food and Unforgettable Views',
    excerpt: 'Immerse yourself in Renaissance splendor, authentic Tuscan tratterias, and panoramic sunset viewpoints over the Arno River.',
    category: 'Travel',
    subcategory: 'City Guides',
    date: 'May 7, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80',
    trendingRank: 2,
    author: {
      name: 'Elena Rossi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'Contributing Cultural Writer'
    },
    tags: ['Florence', 'Italy', 'Art', 'Food', 'Culture'],
    content: [
      'Florence is an open-air museum where every cobblestone whispers centuries of poetic genius and architectural masterwork.',
      'From the terracotta grandeur of the Duomo to the golden warmth illuminating the Ponte Vecchio at dusk, Florence never fails to inspire the senses.'
    ]
  },
  {
    id: 'weekend-getaway-budget',
    slug: 'how-to-plan-a-weekend-getaway-on-a-budget',
    title: 'How to Plan a Weekend Getaway on a Budget',
    excerpt: 'Smart tips, booking hacks, and packing strategies to explore new cities without overspending your hard-earned savings.',
    category: 'Travel',
    subcategory: 'Travel Tips',
    date: 'May 5, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    trendingRank: 3,
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Budget Travel', 'Tips', 'Packing', 'Weekend'],
    content: [
      'Memorable travel is not about lavish hotel stays; it is about meaningful connection, authentic food, and rich sensory immersion.',
      'Learn how off-peak booking windows, local neighborhood stays, and rail passes can halve your travel expenses while doubling your cultural experience.'
    ]
  },
  {
    id: 'japan-itinerary',
    slug: 'a-perfect-7-day-itinerary-for-japan',
    title: 'A Perfect 7-Day Itinerary for Japan',
    excerpt: 'From the neon energy of Tokyo to ancient Kyoto temples and tranquil bamboo groves, experience the soul of Japan in one week.',
    category: 'Travel',
    subcategory: 'Road Trips',
    date: 'April 28, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    trendingRank: 4,
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Japan', 'Tokyo', 'Kyoto', 'Itinerary', 'Asia'],
    content: [
      'Japan is a breathtaking juxtaposition of reverent ancient tranquility and breathtaking futuristic innovation.',
      'Follow our curated week-long journey through sensory Shibuya crosswalks, quiet tea ceremonies in Gion, and misty morning shrines in Nara.'
    ]
  },
  {
    id: 'santorini-things-to-do',
    slug: 'the-best-things-to-do-in-santorini',
    title: 'The Best Things to Do in Santorini',
    excerpt: 'Whitewashed caldera views, secret Aegean swimming coves, volcanic wine tastings and the legendary Oia sunset experience.',
    category: 'Travel',
    subcategory: 'Island Escapes',
    date: 'April 22, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Elena Rossi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'Contributing Cultural Writer'
    },
    tags: ['Santorini', 'Greece', 'Aegean', 'Sunset'],
    content: [
      'Santorini dazzles with its iconic cobalt-blue domes perched above sun-bleached volcanic cliffs.',
      'Venture beyond the crowded sunset spots to explore Akrotiri ruins, black sand beaches in Perissa, and cliffside paths between Fira and Oia.'
    ]
  },
  {
    id: 'essential-travel-tips',
    slug: 'essential-travel-tips-for-first-time-travellers',
    title: 'Essential Travel Tips for First-Time Travellers',
    excerpt: 'Everything you need to know about navigating airports, cultural etiquette, travel insurance and pack-light packing lists.',
    category: 'Travel',
    subcategory: 'Travel Tips',
    date: 'April 15, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Tips', 'Beginners', 'Packing', 'Adventure'],
    content: [
      'Your first international solo journey can feel both thrilling and daunting. Preparation brings peace of mind, leaving room for serendipity.',
      'From digital backups of essential documents to our golden rule of packing half the clothes and twice the curiosity, here is our essential checklist.'
    ]
  },

  // LIFESTYLE ARTICLES
  {
    id: 'best-coffee-shops-2024',
    slug: 'the-best-coffee-shops-to-try-in-2024',
    title: 'The Best Coffee Shops to Try in 2024',
    excerpt: 'Discover world-class coffee shops with great atmospheres, amazing drinks and unique experiences from around the world.',
    category: 'Lifestyle',
    subcategory: 'Food & Coffee',
    date: 'May 16, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Coffee', 'Cafes', 'Food', 'Lifestyle', 'Urban'],
    quote: 'A great cafe is more than good beans; it is an intimate harbor of quiet thoughts, soft conversations, and warm light.',
    content: [
      'Coffee culture has transformed from a mere caffeine pitstop into an artisan sensory ritual. In every great city, specialty roasteries are carving out sanctuaries of light, architectural warmth, and intentional living.',
      'From the minimalist Scandinavian roasters of Copenhagen to intimate wooden kissaten corners of Tokyo and industrial-chic lofts of Melbourne, we spent the past six months visiting dozens of craft coffee houses to bring you this definitive list.'
    ]
  },
  {
    id: 'simple-habits-fulfilling-life',
    slug: 'simple-habits-for-a-more-fulfilling-life',
    title: 'Simple Habits for a More Fulfilling Life',
    excerpt: 'Easy and practical ways to feel happier, healthier and more productive every single day through mindful daily rituals.',
    category: 'Lifestyle',
    subcategory: 'Productivity',
    date: 'May 11, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    author: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Wellness & Mindfulness Editor'
    },
    tags: ['Habits', 'Mindfulness', 'Productivity', 'Slow Living'],
    content: [
      'True fulfillment rarely arrives through monumental shifts; rather, it is gently sculpted through micro-rituals performed with reverence.',
      'Cultivating ten minutes of morning silence before touching digital screens creates an internal calm that persists throughout the most demanding days.'
    ]
  },
  {
    id: 'healthy-breakfast-ideas',
    slug: 'healthy-breakfast-ideas-for-busy-mornings',
    title: 'Healthy Breakfast Ideas for Busy Mornings',
    excerpt: 'Nourishing, quick-to-prepare bowls and smoothies that fuel sustained energy and focus without compromising on flavor.',
    category: 'Lifestyle',
    subcategory: 'Food & Coffee',
    date: 'May 8, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Wellness & Mindfulness Editor'
    },
    tags: ['Breakfast', 'Nutrition', 'Healthy Recipes', 'Energy'],
    content: [
      'Mornings set the emotional and physical tone for the hours ahead. These simple, whole-food recipes require less than ten minutes of prep.',
      'From creamy chia seed puddings soaked in oat milk and vanilla to antioxidant-rich berry bowls with roasted crushed walnuts and raw honey.'
    ]
  },
  {
    id: 'calm-home-space',
    slug: 'how-to-create-a-calm-and-inspiring-home-space',
    title: 'How to Create a Calm and Inspiring Home Space',
    excerpt: 'Decluttering principles, warm natural lighting choices, and tactile materials to turn your living area into a peaceful sanctuary.',
    category: 'Lifestyle',
    subcategory: 'Home & Living',
    date: 'May 4, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Interior', 'Home', 'Design', 'Sanctuary', 'Warm Light'],
    content: [
      'Our physical environment shapes our internal weather. When our living spaces feel chaotic, our nervous systems mirror that tension.',
      'By prioritizing warm 2700K ambient lighting, organic linen textures, living green foliage, and open breath-points, your home becomes a true sanctuary.'
    ]
  },
  {
    id: 'daily-habits-productive',
    slug: '5-daily-habits-for-a-happier-more-productive-you',
    title: '5 Daily Habits for a Happier, More Productive You',
    excerpt: 'Eliminate cognitive fatigue, optimize your deep work blocks, and create space for creative joy in everyday routines.',
    category: 'Lifestyle',
    subcategory: 'Productivity',
    date: 'April 29, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Wellness & Mindfulness Editor'
    },
    tags: ['Productivity', 'Focus', 'Habits', 'Creativity'],
    content: [
      'High performance without joy is merely burnout in disguise. The secret to sustainable focus is intentional pacing and rhythmic restoration.'
    ]
  },

  // HEALTH & WELLBEING ARTICLES
  {
    id: 'ten-simple-habits-healthier-life',
    slug: '10-simple-habits-for-a-happier-healthier-life',
    title: '10 Simple Habits for a Happier, Healthier Life',
    excerpt: 'Small changes can make a big difference. Discover 10 easy habits to help you feel more energetic, positive and balanced every day.',
    category: 'Health & Wellbeing',
    subcategory: 'Healthy Living',
    date: 'May 15, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    author: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Wellness & Mindfulness Editor'
    },
    tags: ['Wellness', 'Health', 'Habits', 'Nutrition', 'Mindfulness'],
    quote: 'True health is not an obsession with perfection; it is a gentle kindness you grant your body and spirit each morning.',
    content: [
      'We often assume wellness requires punishing workout regimes and radical life overhauls. Yet clinical psychology and longevity research reveal that lasting vigor is built on micro-consistency.',
      'Habit 1: Morning Light Exposure. Getting 10-15 minutes of natural sunlight in your eyes within an hour of waking resets your circadian rhythm and boosts daytime dopamine.',
      'Habit 2: Mindful Hydration. Drink 500ml of room temperature water with a pinch of mineral salt before your first cup of coffee.',
      'Habit 3: The 20-Minute Movement Rule. A brisk outdoor walk after meals blunts glucose spikes and stimulates cerebral blood flow.'
    ]
  },
  {
    id: 'calmer-mind-brighter-tomorrow',
    slug: 'a-calmer-mind-a-brighter-tomorrow',
    title: 'A Calmer Mind, a Brighter Tomorrow',
    excerpt: 'Practical tips and inspirations for a healthier, happier and more balanced life, grounding your thoughts in the present moment.',
    category: 'Health & Wellbeing',
    subcategory: 'Mental Wellbeing',
    date: 'May 9, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    author: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Wellness & Mindfulness Editor'
    },
    tags: ['Meditation', 'Mental Health', 'Peace', 'Mindfulness'],
    content: [
      'Anxiety thrives on future anticipation; peace lives in this current inhalation.',
      'Learn simple box-breathing techniques (4 counts in, 4 hold, 4 out, 4 hold) to deactivate your sympathetic fight-or-flight response within 90 seconds.'
    ]
  },
  {
    id: 'easy-workouts-anywhere',
    slug: 'easy-workouts-you-can-do-anywhere',
    title: 'Easy Workouts You Can Do Anywhere',
    excerpt: 'Bodyweight routines that maintain muscle tone, flexibility and joint health whether you are at home or staying in a hotel room.',
    category: 'Health & Wellbeing',
    subcategory: 'Fitness & Movement',
    date: 'May 3, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Toufiq Motion',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Founder & Travel Photographer'
    },
    tags: ['Fitness', 'Workout', 'Mobility', 'Movement'],
    content: [
      'You don\'t need an expensive gym subscription to maintain physical vibrancy on the road.',
      'A simple 15-minute sequence of deep squats, push-ups, mountain climbers, and thoracic bridges keeps your spine healthy and energy elevated.'
    ]
  },
  {
    id: 'healthy-meals-busy-days',
    slug: 'healthy-and-delicious-meals-for-busy-days',
    title: 'Healthy and Delicious Meals for Busy Days',
    excerpt: 'Nutrient-dense recipes rich in color, fiber and wholesome ingredients that come together in 20 minutes or less.',
    category: 'Health & Wellbeing',
    subcategory: 'Nutrition & Food',
    date: 'April 26, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Wellness & Mindfulness Editor'
    },
    tags: ['Nutrition', 'Salad', 'Clean Eating', 'Energy'],
    content: [
      'Food is information for your cells. When we nourish ourselves with vibrant colors, our gut microbiome flourishes and mental fog dissipates.'
    ]
  },
  {
    id: 'improve-your-sleep',
    slug: 'how-to-improve-your-sleep-quality',
    title: 'How to Improve Your Sleep Quality',
    excerpt: 'Circadian rhythm optimization, bedroom temperature adjustments, and evening wind-down rituals for restorative deep slumber.',
    category: 'Health & Wellbeing',
    subcategory: 'Sleep & Recovery',
    date: 'April 20, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Wellness & Mindfulness Editor'
    },
    tags: ['Sleep', 'Recovery', 'Night Routine', 'Rest'],
    content: [
      'Deep sleep is when your brain washes away metabolic waste and consolidates memory.',
      'Dimming blue light two hours before bedtime and keeping your bedroom cool (around 18°C / 65°F) triggers natural melatonin release.'
    ]
  }
];

export const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', count: '14 Guides' },
  { name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80', count: '9 Guides' },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', count: '18 Guides' },
  { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80', count: '12 Guides' },
  { name: 'Swiss Alps', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=600&q=80', count: '11 Guides' },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80', count: '16 Guides' },
];

export const TOPICS = {
  travel: [
    { name: 'City Breaks', count: '24 articles' },
    { name: 'Beach Destinations', count: '18 articles' },
    { name: 'Hiking & Nature', count: '31 articles' },
    { name: 'Weekend Getaways', count: '15 articles' },
    { name: 'Cultural Journeys', count: '19 articles' }
  ],
  lifestyle: [
    { name: 'Food & Coffee', count: '32 articles', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Home & Living', count: '21 articles', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Productivity', count: '17 articles', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80' },
    { name: 'Experiences', count: '14 articles', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80' },
    { name: 'Style & Essentials', count: '19 articles', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80' }
  ],
  health: [
    { name: 'Healthy Living', count: '28 articles', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mental Wellbeing', count: '22 articles', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fitness & Movement', count: '19 articles', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Nutrition & Food', count: '25 articles', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mindful Travel', count: '15 articles', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' }
  ]
};

export const QUICK_WELLBEING_TIPS = [
  {
    icon: 'Sun',
    title: 'Start your day with intention',
    desc: '5 minutes of quiet gratitude before any screen time.'
  },
  {
    icon: 'Droplet',
    title: 'Stay hydrated',
    desc: 'Drink room-temp mineral water with fresh lemon.'
  },
  {
    icon: 'Compass',
    title: 'Move your body',
    desc: 'A brisk 15-minute nature walk resets cortisol.'
  },
  {
    icon: 'Heart',
    title: 'Be kind to yourself',
    desc: 'Self-compassion fuels lasting personal vitality.'
  }
];

export const FAQS = [
  {
    q: 'Do you accept collaboration requests?',
    a: 'Yes! We collaborate with travel boards, hospitality properties, lifestyle brands, and mindful wellness products that align with our core aesthetic and values. Please check our Work With Us section to review our media kit.'
  },
  {
    q: 'Can I use your photos for my website or blog?',
    a: 'All photography on Toufiq Motion is copyrighted. For non-commercial editorial sharing with full credit and do-follow backlinks, you may use up to two photos per feature. For commercial licensing, please reach out via our contact form.'
  },
  {
    q: 'How can I suggest a destination or topic?',
    a: 'We adore hearing from our readers! Feel free to drop us a note through our Contact form with your local hidden gems, favorite coffee shops, or wellness practices.'
  },
  {
    q: 'Do you offer custom travel advice or itinerary planning?',
    a: 'We offer quarterly bespoke itinerary curation for private travelers. You can inquire about availability via hello@toufiqmotion.com.'
  }
];

