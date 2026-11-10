import { db, initDatabase } from './index.js';
import bcrypt from 'bcryptjs';
import { ARTICLES } from '../../src/data/articles.js';

export function seedDatabase() {
  initDatabase();

  // Check if admin user exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@toufiqmotion.com');
  if (!existingUser) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'admin-toufiq',
      'Toufiq Motion',
      'admin@toufiqmotion.com',
      passwordHash,
      'admin',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    );
    console.log('👤 Seeded Admin User: admin@toufiqmotion.com (password: admin123)');
  }

  // Check if categories exist (Requirement 1)
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, icon, image, subcategories_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertCat.run(
      'cat-travel',
      'Travel',
      'travel',
      'Inspiring destinations, practical travel guides, itineraries and photography.',
      'Compass',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      JSON.stringify(['Island Escapes', 'Road Trips', 'Travel Tips', 'Weekend Getaways', 'Nature & Outdoor', 'City Guides'])
    );

    insertCat.run(
      'cat-lifestyle',
      'Lifestyle',
      'lifestyle',
      'Everyday inspiration, food and coffee, mindful home spaces and intentional living.',
      'Coffee',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      JSON.stringify(['Food & Coffee', 'Home & Living', 'Productivity', 'Experiences', 'Style & Essentials'])
    );

    insertCat.run(
      'cat-health',
      'Health & Wellbeing',
      'health-wellbeing',
      'Practical tips, healthy habits and inspiring ideas for physical and mental vitality.',
      'Heart',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
      JSON.stringify(['Healthy Living', 'Mental Wellbeing', 'Fitness & Movement', 'Nutrition & Food', 'Sleep & Recovery', 'Mindful Travel'])
    );

    insertCat.run(
      'cat-culture',
      'Culture & Stories',
      'culture-stories',
      'Artisan craft traditions, local heritage, and essays on slow creative journeys.',
      'Sparkles',
      'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=600&q=80',
      JSON.stringify(['Artisan Craft', 'Local Traditions', 'Creative Essays', 'Photography Journals'])
    );

    console.log('🏷️ Seeded initial categories into SQLite database.');
  }

  // Check if articles exist
  const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  if (articleCount.count === 0) {
    const insertArticle = db.prepare(`
      INSERT INTO articles (
        id, slug, title, excerpt, category, subcategory, date, read_time,
        image, featured, trending_rank, author_name, author_avatar, author_role,
        quote, tags_json, content_json, views_count, likes_count, published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((articles) => {
      for (const a of articles) {
        insertArticle.run(
          a.id,
          a.slug,
          a.title,
          a.excerpt,
          a.category,
          a.subcategory,
          a.date,
          a.readTime,
          a.image,
          a.featured ? 1 : 0,
          a.trendingRank || null,
          a.author.name,
          a.author.avatar,
          a.author.role,
          a.quote || null,
          JSON.stringify(a.tags),
          JSON.stringify(a.content),
          Math.floor(Math.random() * 800) + 200, // realistic views
          Math.floor(Math.random() * 90) + 25,   // realistic likes
          1
        );
      }
    });

    insertMany(ARTICLES);
    console.log(`📚 Seeded ${ARTICLES.length} designer blog articles into SQLite database.`);
  }

  // Seed sample comments
  const commentCount = db.prepare('SELECT COUNT(*) as count FROM comments').get() as { count: number };
  if (commentCount.count === 0) {
    const insertComment = db.prepare(`
      INSERT INTO comments (id, article_id, author_name, author_email, content, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertComment.run(
      'comm-1',
      'amalfi-coast-guide',
      'Sophia Laurent',
      'sophia@example.com',
      'This guide was exactly what I needed for my upcoming trip! The photography and practical tips are top tier.',
      'approved'
    );
    insertComment.run(
      'comm-2',
      'amalfi-coast-guide',
      'Marcus Vance',
      'marcus@example.com',
      'The recommendation for early morning walks and quiet cafes made all the difference in my itinerary. Thank you!',
      'approved'
    );
    insertComment.run(
      'comm-3',
      'best-coffee-shops-2024',
      'Elena Rostova',
      'elena@design.com',
      'Adored the Japanese kissaten selection. Quiet cafes with warm light are the best places to write.',
      'approved'
    );
    console.log('💬 Seeded initial reader reflections & comments.');
  }

  // Seed sample subscribers
  const subCount = db.prepare('SELECT COUNT(*) as count FROM newsletter_subscribers').get() as { count: number };
  if (subCount.count === 0) {
    const insertSub = db.prepare(`
      INSERT INTO newsletter_subscribers (id, email, name, source)
      VALUES (?, ?, ?, ?)
    `);
    insertSub.run('sub-1', 'elena@traveler.com', 'Elena', 'footer');
    insertSub.run('sub-2', 'clara@lifestyle.co', 'Clara', 'travel_page');
    insertSub.run('sub-3', 'julian@mindful.org', 'Julian', 'health_page');
  }

  // Seed sample inquiries
  const inquiryCount = db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as { count: number };
  if (inquiryCount.count === 0) {
    const insertInquiry = db.prepare(`
      INSERT INTO inquiries (id, type, name, email, company, subject, project_type, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertInquiry.run(
      'inq-1',
      'partnership',
      'Amalfi Tourism Board',
      'press@amalficoast.it',
      'Italian National Tourism Board',
      'Fall 2026 Coastal Photography Campaign',
      'Destination Partnership',
      'We would love to sponsor a 5-day creative photography residency covering the coastal walking paths.',
      'new'
    );
    insertInquiry.run(
      'inq-2',
      'contact',
      'David Miller',
      'david.m@wanderer.com',
      null,
      'Photo Print Licensing Question',
      null,
      'Hello Toufiq! I was captivated by your Swiss Alps sunrise capture. Do you offer archival fine-art prints?',
      'new'
    );
  }

  // Seed SEO 301/302 Redirects (Matches Command Center 11 Active Redirects)
  const redirectCount = db.prepare('SELECT COUNT(*) as count FROM seo_redirects').get() as { count: number };
  if (redirectCount.count === 0) {
    const insertRedirect = db.prepare(`
      INSERT INTO seo_redirects (id, source_path, target_path, redirect_code, hits_count, notes, last_accessed)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))
    `);

    const redirects = [
      ['red-1', '/old-travel-guide', '/travel', 301, 142, 'Migrated legacy travel archive'],
      ['red-2', '/posts/amalfi-coast-2023', '/travel', 301, 310, 'Consolidated Amalfi Coast cornerstone guide'],
      ['red-3', '/lifestyle/coffee-shops-2024', '/lifestyle', 301, 88, 'Redirect old coffee shop listing'],
      ['red-4', '/wellness/10-habits', '/health', 301, 215, 'Updated 10 simple habits URL'],
      ['red-5', '/category/journal', '/', 301, 64, 'Old WordPress category taxonomy'],
      ['red-6', '/contact-us', '/about', 301, 93, 'Combined About & Contact page'],
      ['red-7', '/media-kit', '/work-with-us', 301, 172, 'Partnership & Media kit landing page'],
      ['red-8', '/stories/swiss-alps', '/travel', 301, 55, 'Updated Swiss Alps photography guide'],
      ['red-9', '/tips/packing-light', '/travel', 301, 120, 'Travel essentials guide redirect'],
      ['red-10', '/morning-rituals-guide', '/health', 301, 78, 'Health & wellbeing daily routine redirect'],
      ['red-11', '/gear-talk/cinematography', '/', 301, 41, 'Old lens review archive redirect']
    ];

    for (const r of redirects) {
      insertRedirect.run(...r);
    }
    console.log('🔗 Seeded 11 active SEO 301 redirects.');
  }

  // Seed SEO 404 Crawl Error Logs (Matches Command Center 404 Monitor)
  const crawlErrorCount = db.prepare('SELECT COUNT(*) as count FROM seo_crawl_errors').get() as { count: number };
  if (crawlErrorCount.count === 0) {
    const insertCrawlError = db.prepare(`
      INSERT INTO seo_crawl_errors (id, path, hits_count, referer, user_agent, ip, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const errors = [
      ['err-1', '/wp-login.php', 14, 'Direct Navigation', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', '66.249.66.1', 'active'],
      ['err-2', '/tag/old-camera', 8, 'https://pinterest.com/pin/12345', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)', '172.56.21.8', 'active'],
      ['err-3', '/feed/rss2', 12, 'https://feedly.com', 'Feedly/1.0 (+http://feedly.com/fetcher.html)', '54.210.12.33', 'active'],
      ['err-4', '/category/uncategorized', 5, 'https://bing.com', 'Mozilla/5.0 (compatible; bingbot/2.0)', '157.55.39.42', 'active'],
      ['err-5', '/author/admin', 6, 'Direct Navigation', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '192.168.1.1', 'active'],
      ['err-6', '/wp-content/uploads/2023/photo.jpg', 3, 'https://twitter.com', 'Twitterbot/1.0', '199.16.157.18', 'active'],
      ['err-7', '/archives/2022/11', 2, 'https://yandex.com', 'YandexBot/3.0', '141.8.142.10', 'active']
    ];

    for (const err of errors) {
      insertCrawlError.run(...err);
    }
    console.log('🚨 Seeded SEO 404 crawl error logs.');
  }

  // Seed SEO Global Settings
  const settingCount = db.prepare('SELECT COUNT(*) as count FROM seo_settings').get() as { count: number };
  if (settingCount.count === 0) {
    const insertSetting = db.prepare(`INSERT INTO seo_settings (key, value) VALUES (?, ?)`);

    insertSetting.run('site_title_format', '%title% — Toufiq Motion Editorial');
    insertSetting.run('meta_description', 'Toufiq Motion is an editorial lifestyle, mindful wellbeing and world travel journal with luminous photography and thoughtful stories.');
    insertSetting.run('canonical_domain', 'https://toufiqmotion.com');
    insertSetting.run('og_image', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
    insertSetting.run('twitter_card', 'summary_large_image');
    insertSetting.run('google_site_verification', 'google-site-verification=toufiqmotion2026seo');
    insertSetting.run('bing_site_verification', 'bing-verification-toufiq2026');
    insertSetting.run('knowledge_type', 'Organization');
    insertSetting.run('knowledge_name', 'Toufiq Motion');
    insertSetting.run('knowledge_logo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80');
    insertSetting.run('knowledge_founder', 'Toufiq Motion');
    insertSetting.run('knowledge_socials_json', JSON.stringify([
      'https://instagram.com/toufiqmotion',
      'https://youtube.com/@toufiqmotion',
      'https://twitter.com/toufiqmotion',
      'https://pinterest.com/toufiqmotion'
    ]));
    insertSetting.run('robots_txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: http://localhost:3000/sitemap.xml`);
    insertSetting.run('last_pinged_at', new Date().toISOString());

    console.log('⚙️ Seeded global SEO configuration.');
  }

  // Seed Search Console Analytics Queries
  const queryCount = db.prepare('SELECT COUNT(*) as count FROM seo_search_queries').get() as { count: number };
  if (queryCount.count === 0) {
    const insertQuery = db.prepare(`
      INSERT INTO seo_search_queries (id, query, clicks, impressions, ctr, position)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const queries = [
      ['q-1', 'amalfi coast photography guide', 1420, 18500, 7.68, 2.1],
      ['q-2', 'coffee brewing aesthetics ritual', 980, 14200, 6.90, 3.4],
      ['q-3', '10 simple habits slow living', 860, 12100, 7.11, 2.8],
      ['q-4', 'cinematic travel photography tips', 740, 10900, 6.79, 4.2],
      ['q-5', 'mindful morning routine guide', 620, 9400, 6.60, 3.9],
      ['q-6', 'artisan slow living essays', 510, 8200, 6.22, 5.1],
      ['q-7', 'anamorphic vintage lenses filmmaking', 430, 6900, 6.23, 4.7],
      ['q-8', 'swiss alps sunrise photography spot', 380, 5800, 6.55, 3.1]
    ];

    for (const q of queries) {
      insertQuery.run(...q);
    }
    console.log('📊 Seeded Google Search Console query performance analytics.');
  }

  // Seed Site Appearance, Logo, Header, Menu & Footer Settings
  const siteSettingCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (siteSettingCount.count === 0) {
    const insertSiteSetting = db.prepare(`INSERT INTO site_settings (key, value) VALUES (?, ?)`);

    insertSiteSetting.run('logo_type', 'text');
    insertSiteSetting.run('logo_url', '');
    insertSiteSetting.run('logo_height', '36');
    insertSiteSetting.run('site_title', 'Toufiq Motion');
    insertSiteSetting.run('site_tagline', 'Travel • Lifestyle • Wellbeing');
    insertSiteSetting.run('header_sticky', 'true');
    insertSiteSetting.run('announcement_enabled', 'true');
    insertSiteSetting.run('announcement_text', '✨ Spring 2026 Editorial Issue is live: Discover the Amalfi Coast & Slow Coffee Chronicles');
    insertSiteSetting.run('announcement_link', '/travel');
    insertSiteSetting.run('header_cta_enabled', 'true');
    insertSiteSetting.run('header_cta_text', 'Work with Us');
    insertSiteSetting.run('header_cta_link', '/work');
    insertSiteSetting.run('menu_items_json', JSON.stringify([
      { id: 'm-home', label: 'Home', type: 'page', pageId: 'home', url: '/', hasDropdown: true, enabled: true },
      { id: 'm-travel', label: 'Travel', type: 'page', pageId: 'travel', url: '/travel', hasDropdown: false, enabled: true },
      { id: 'm-lifestyle', label: 'Lifestyle', type: 'page', pageId: 'lifestyle', url: '/lifestyle', hasDropdown: false, enabled: true },
      { id: 'm-health', label: 'Health & Wellbeing', type: 'page', pageId: 'health', url: '/health', hasDropdown: false, enabled: true },
      { id: 'm-work', label: 'Work with Us', type: 'page', pageId: 'work', url: '/work', hasDropdown: false, enabled: true },
      { id: 'm-about', label: 'About', type: 'page', pageId: 'about', url: '/about', hasDropdown: false, enabled: true },
      { id: 'm-contact', label: 'Contact', type: 'page', pageId: 'contact', url: '/contact', hasDropdown: false, enabled: true }
    ]));
    insertSiteSetting.run('footer_newsletter_enabled', 'true');
    insertSiteSetting.run('footer_newsletter_title', 'Get Travel Inspiration in Your Inbox');
    insertSiteSetting.run('footer_newsletter_subtitle', 'Join our weekly newsletter for the latest travel guides, lifestyle ideas, wellbeing tips and exclusive content from Toufiq Motion.');
    insertSiteSetting.run('footer_newsletter_tagline', 'Join The Journey');
    insertSiteSetting.run('footer_bio_text', 'Toufiq Motion is a visual storytelling journal documenting mindful travel, slow living, and conscious wellbeing around the globe with luminous photography.');
    insertSiteSetting.run('footer_values_json', JSON.stringify([
      { icon: 'Compass', title: 'Inspiring Destinations', desc: 'Guides, tips and ideas' },
      { icon: 'Coffee', title: 'Local Food & Coffee', desc: 'Great places to eat and drink' },
      { icon: 'Home', title: 'Lifestyle Inspiration', desc: 'For a richer everyday life' },
      { icon: 'Heart', title: 'Health & Wellbeing', desc: 'Simple ways to live well' }
    ]));
    insertSiteSetting.run('footer_socials_json', JSON.stringify({
      instagram: 'https://instagram.com/toufiqmotion',
      youtube: 'https://youtube.com/@toufiqmotion',
      pinterest: 'https://pinterest.com/toufiqmotion',
      facebook: 'https://facebook.com/toufiqmotion',
      twitter: 'https://twitter.com/toufiqmotion'
    }));
    insertSiteSetting.run('footer_copyright_text', '© 2026 Toufiq Motion. Handcrafted with luminous intention. All rights reserved.');
    insertSiteSetting.run('footer_made_with', 'Designed with Inside Light');
    insertSiteSetting.run('footer_back_to_top_enabled', 'true');
    insertSiteSetting.run('footer_legal_links_json', JSON.stringify([
      { label: 'Terms of Use', url: '#terms' },
      { label: 'Privacy Policy', url: '#privacy' },
      { label: 'Cookie Preferences', url: '#cookies' },
      { label: 'Affiliate Disclosure', url: '#affiliate' },
      { label: 'Editorial Policy', url: '#editorial' }
    ]));

    console.log('🎨 Seeded site appearance, header, logo, menu & footer settings.');
  }

  // Seed Media Library items
  const mediaCount = db.prepare('SELECT COUNT(*) as count FROM media').get() as { count: number };
  if (mediaCount.count === 0) {
    const insertMedia = db.prepare(`
      INSERT INTO media (id, filename, original_name, url, mimetype, size, width, height, alt_text, title, caption, is_optimized, original_size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialMedia = [
      [
        'med-1',
        'amalfi-coast-panoramic.webp',
        'amalfi-coast-cliffside-4k.jpg',
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        'image/webp',
        188420, // 184 KB (< 250 KB)
        1920,
        1080,
        'Pastel cliffside villas overlooking turquoise Amalfi waters',
        'Amalfi Coast Panoramic Vista',
        'Captured during golden hour above Positano village',
        1,
        2845000, // Was 2.8 MB
        "datetime('now', '-3 days')"
      ],
      [
        'med-2',
        'swiss-alps-sunrise.webp',
        'swiss-alps-raw-morning.png',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        'image/webp',
        214800, // 209 KB (< 250 KB)
        1920,
        1280,
        'Alpine mountain peaks reflecting in crystal glacial lake',
        'Swiss Alps Morning Light',
        'First light catching the Matterhorn ridge',
        1,
        4190000, // Was 4.1 MB
        "datetime('now', '-2 days')"
      ],
      [
        'med-3',
        'kyoto-bamboo-grove.webp',
        'kyoto-arashiyama-path.jpg',
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        'image/webp',
        175200, // 171 KB (< 250 KB)
        1600,
        1066,
        'Towering bamboo stalks in Arashiyama quiet morning',
        'Kyoto Bamboo Grove',
        'Mindful walk through Kyoto bamboo forest at dawn',
        1,
        3450000, // Was 3.4 MB
        "datetime('now', '-1 day')"
      ],
      [
        'med-4',
        'santorini-oia-sunset.jpg',
        'santorini-oia-sunset.jpg',
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
        'image/jpeg',
        1420500, // 1.4 MB (Needs optimization to < 250 KB WebP!)
        2400,
        1600,
        'White cave dwellings and blue domes of Oia overlooking caldera',
        'Santorini Caldera Sunset',
        'Cycladic architecture bathed in warm sunset hues',
        0, // Not yet optimized!
        1420500,
        "datetime('now', '-12 hours')"
      ],
      [
        'med-5',
        'pour-over-coffee-ritual.png',
        'pour-over-coffee-ritual.png',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        'image/png',
        2890000, // 2.89 MB (Needs optimization to < 250 KB WebP!)
        2048,
        1365,
        'Artisan slow pour over coffee kettle and hand-crafted ceramic dripper',
        'Artisan Pour Over Ritual',
        'Morning slow living and coffee brewing aesthetics',
        0, // Not yet optimized!
        2890000,
        "datetime('now', '-6 hours')"
      ],
      [
        'med-6',
        'minimalist-workspace-aesthetic.webp',
        'nordic-desk-setup.jpg',
        'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
        'image/webp',
        148900, // 145 KB (< 250 KB)
        1600,
        1067,
        'Minimalist birchwood writing desk with journal and warm tea cup',
        'Mindful Workspace Aesthetics',
        'Curated slow work environment with natural linen and daylight',
        1,
        1980000,
        "datetime('now', '-4 hours')"
      ],
      [
        'med-7',
        'mediterranean-summer-produce.jpg',
        'fresh-figs-and-olives.jpg',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        'image/jpeg',
        985000, // 985 KB (Needs optimization to < 250 KB WebP!)
        1920,
        1280,
        'Fresh Mediterranean harvest of purple figs, green olives, and sourdough',
        'Mediterranean Seasonal Table',
        'Slow culinary journey inspired by Southern European markets',
        0, // Not yet optimized!
        985000,
        "datetime('now', '-1 hour')"
      ]
    ];

    for (const m of initialMedia) {
      insertMedia.run(
        m[0],
        m[1],
        m[2],
        m[3],
        m[4],
        m[5],
        m[6],
        m[7],
        m[8],
        m[9],
        m[10],
        m[11],
        m[12],
        new Date().toISOString()
      );
    }
    console.log('📸 Seeded 7 initial media library assets with WebP and unoptimized examples.');
  }

  // Seed Custom Pages for the Page Builder
  const pagesCount = db.prepare('SELECT COUNT(*) as count FROM pages').get() as { count: number };
  if (pagesCount.count === 0) {
    const insertPage = db.prepare(`
      INSERT INTO pages (
        id, title, slug, excerpt, status, featured_image, template, blocks_json,
        meta_title, meta_description, focus_keyword, canonical_url, no_index, seo_score, is_system, views, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    // Page 1: Destinations 2026 Showcase
    const destinationsBlocks = [
      {
        id: 'blk-hero-1',
        type: 'hero',
        data: {
          title: 'Destinations & Slow Escapes 2026',
          subtitle: 'A curated visual index of mindful travel itineraries, secluded coastal villages, and alpine retreats around the globe.',
          badgeText: 'Curated Editorial Issue',
          bgImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 45,
          align: 'center',
          ctaText: 'Explore Itineraries',
          ctaLink: '#itineraries',
          secondaryCtaText: 'View Gallery',
          secondaryCtaLink: '#gallery'
        }
      },
      {
        id: 'blk-split-1',
        type: 'split_feature',
        data: {
          badge: 'Slow Travel Philosophy',
          heading: 'Intentional journeys over rushed bucket lists',
          description: 'We believe travel should be an exercise in presence rather than consumption. By staying longer in fewer places, you discover the cadence of village mornings, the aroma of neighborhood bakeries, and the warmth of conversations that never happen on a whirlwind tour.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          imagePosition: 'right',
          bullets: [
            'Locally owned boutique stays & heritage guesthouses',
            'Sunrise photography itineraries without the tourist crowds',
            'Farm-to-table culinary notes and slow coffee roasters',
            'Detailed seasonal packing lists and rail travel routes'
          ],
          ctaText: 'Read Our Travel Philosophy',
          ctaLink: '/about'
        }
      },
      {
        id: 'blk-cards-1',
        type: 'cards_grid',
        data: {
          heading: '2026 Destination Focus Areas',
          subtitle: 'Four distinct geographical landscapes chosen for their natural stillness and cultural depth.',
          columns: 4,
          cards: [
            {
              icon: 'Compass',
              title: 'Cycladic Coastlines',
              description: 'Whitewashed archipelagos, hidden swimming coves, and windswept clifftop chapels in Greece.',
              link: '/travel'
            },
            {
              icon: 'Coffee',
              title: 'Nordic Forest Cabins',
              description: 'Warm saunas, crackling birchwood fires, and berry picking under the endless Scandinavian twilight.',
              link: '/travel'
            },
            {
              icon: 'Home',
              title: 'Kyoto Machiya Living',
              description: 'Centuries-old wooden townhouses, private moss gardens, and traditional morning matcha rituals.',
              link: '/travel'
            },
            {
              icon: 'Heart',
              title: 'Alpine Sanctuary Trails',
              description: 'High-elevation glacial lakes, wildflower meadows, and crisp mountain air across Switzerland and Italy.',
              link: '/travel'
            }
          ]
        }
      },
      {
        id: 'blk-faq-1',
        type: 'faq_accordion',
        data: {
          heading: 'Planning Your 2026 Journey',
          subtitle: 'Frequently asked travel questions regarding logistics, seasons, and packing.',
          items: [
            {
              question: 'When is the best time of year to visit the Mediterranean without crowds?',
              answer: 'We recommend the shoulder seasons: mid-May to early June, or mid-September through October. Temperatures remain warm, waters are swimmable, and villages return to their tranquil local rhythm.'
            },
            {
              question: 'How do you choose hotels and accommodations featured on Toufiq Motion?',
              answer: 'Every property featured has been independently vetted for aesthetic intentionality, high architectural standards, mindful hospitality, and respect for local surroundings.'
            },
            {
              question: 'What camera gear is recommended for traveling light?',
              answer: 'A single mirrorless body paired with a fast 35mm or 50mm prime lens offers the highest optical fidelity while remaining unobtrusive and featherweight on long walking days.'
            }
          ]
        }
      },
      {
        id: 'blk-cta-1',
        type: 'cta_banner',
        data: {
          tag: 'Weekly Dispatches',
          heading: 'Receive our unreleased travel notes directly in your inbox',
          description: 'Every Sunday morning, we send one concise dispatch featuring secret routes, hotel discoveries, and contemplative photography.',
          buttonText: 'Join 4,200+ Readers',
          buttonLink: '#newsletter',
          variant: 'warm-terracotta'
        }
      }
    ];

    insertPage.run(
      'page-destinations',
      'Destinations & Slow Escapes 2026',
      'destinations-2026',
      'A curated visual index of mindful travel itineraries, secluded coastal villages, and alpine retreats around the globe.',
      'published',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      'custom',
      JSON.stringify(destinationsBlocks),
      'Destinations & Slow Escapes 2026 — Toufiq Motion Editorial',
      'Discover curated slow travel itineraries, coastal sanctuaries, and alpine mountain retreats for 2026 with high-res photography.',
      'destinations 2026',
      'https://toufiqmotion.com/destinations-2026',
      0,
      94,
      0,
      342
    );

    // Page 2: Brand Partnerships & Media Kit
    const partnershipBlocks = [
      {
        id: 'blk-hero-2',
        type: 'hero',
        data: {
          title: 'Brand Partnerships & Media Kit',
          subtitle: 'Connecting intentional luxury hospitality, sustainable lifestyle brands, and design creators with an engaged global audience of cultural travelers.',
          badgeText: 'Media Kit 2026',
          bgImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 50,
          align: 'center',
          ctaText: 'Download Media Kit (PDF)',
          ctaLink: '#download',
          secondaryCtaText: 'Contact Our Team',
          secondaryCtaLink: '/work'
        }
      },
      {
        id: 'blk-cards-2',
        type: 'cards_grid',
        data: {
          heading: 'Audience Demographics & Reach',
          subtitle: 'Our readers are discerning travelers, architects, creators, and professionals with high appreciation for fine aesthetics.',
          columns: 3,
          cards: [
            {
              icon: 'Compass',
              title: '62,000+ Monthly Readers',
              description: 'Global reach centered across North America (42%), Western Europe (36%), and Asia-Pacific (18%).'
            },
            {
              icon: 'Heart',
              title: '4,200+ Email Subscribers',
              description: 'Industry-leading 54.2% average open rate with high click-through engagement on curated dispatches.'
            },
            {
              icon: 'Sparkles',
              title: 'High Editorial Trust',
              description: '98% of our community states they have visited a destination or purchased an item based on Toufiq Motion features.'
            }
          ]
        }
      },
      {
        id: 'blk-split-2',
        type: 'split_feature',
        data: {
          badge: 'Partnership Formats',
          heading: 'Bespoke storytelling tailored to your brand identity',
          description: 'We do not run generic banner advertisements. Instead, we co-create bespoke editorial stories, cinematography, and atmospheric visual campaigns that highlight your brand heritage with grace and dignity.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          imagePosition: 'left',
          bullets: [
            'Cornerstone destination features with high organic Google SERP ranking',
            'Full commercial licensing for our 4K cinematic footage & RAW photography',
            'Dedicated sponsored newsletter takeovers with zero clutter',
            'Experiential press trips & seasonal launch activations'
          ],
          ctaText: 'Start a Conversation',
          ctaLink: '/work'
        }
      },
      {
        id: 'blk-quote-2',
        type: 'quote',
        data: {
          quote: 'Toufiq Motion captured the understated soul of our boutique property like no one else. The resulting photography and editorial guide drove an immediate surge in direct bookings from high-value international guests.',
          author: 'Elena Vance',
          role: 'Creative Director, Villa Kalon Capri',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        }
      },
      {
        id: 'blk-cta-2',
        type: 'cta_banner',
        data: {
          tag: 'Get in Touch',
          heading: 'Ready to create something memorable together?',
          description: 'Send us a brief overview of your brand or property, and our editorial director will respond within 24 hours.',
          buttonText: 'Submit Partnership Inquiry',
          buttonLink: '/work',
          variant: 'dark-charcoal'
        }
      }
    ];

    insertPage.run(
      'page-partnerships',
      'Brand Partnerships & Media Kit',
      'partnerships',
      'Connecting intentional luxury hospitality and sustainable lifestyle brands with an engaged global audience of cultural travelers.',
      'published',
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
      'custom',
      JSON.stringify(partnershipBlocks),
      'Brand Partnerships & Media Kit 2026 — Toufiq Motion',
      'Work with Toufiq Motion on luxury hospitality storytelling, bespoke photography campaigns, and cultural destination features.',
      'media kit partnerships',
      'https://toufiqmotion.com/partnerships',
      0,
      96,
      0,
      188
    );

    // Page 3: Frequently Asked Questions & Editorial Policy
    const faqBlocks = [
      {
        id: 'blk-hero-3',
        type: 'hero',
        data: {
          title: 'Frequently Asked Questions & Standards',
          subtitle: 'Transparency regarding our editorial standards, gear recommendations, print sales, and community guidelines.',
          badgeText: 'Help & Knowledge Center',
          bgImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 40,
          align: 'center',
          ctaText: 'Browse Topics',
          ctaLink: '#faq-content'
        }
      },
      {
        id: 'blk-faq-3',
        type: 'faq_accordion',
        data: {
          heading: 'Editorial & Photography Questions',
          subtitle: 'Clear answers to common questions about our journal.',
          items: [
            {
              question: 'Do you accept guest contributions or freelance pitches?',
              answer: 'Yes! We periodically accept original essays and photo-essays exploring mindful travel, culinary craft, and slow lifestyle. Writers can submit pitches via our Work With Us contact portal.'
            },
            {
              question: 'How do you disclose sponsored content or affiliate links?',
              answer: 'Full transparency is fundamental to our ethics. Any partnered stay or sponsored feature is explicitly flagged with an editorial badge at the top of the article. We never accept payment in exchange for positive reviews.'
            },
            {
              question: 'Can I purchase prints of photographs featured on the website?',
              answer: 'Archival museum-quality giclée prints are released in limited seasonal editions. Join our newsletter to receive early collector access before public releases.'
            },
            {
              question: 'What cameras, lenses, and drone do you use?',
              answer: 'We primarily shoot on full-frame Sony mirrorless systems paired with G-Master prime lenses (35mm f/1.4 and 50mm f/1.2), along with DJI Mavic 3 Cine for aerial landscapes.'
            }
          ]
        }
      },
      {
        id: 'blk-cta-3',
        type: 'cta_banner',
        data: {
          tag: 'Need Assistance?',
          heading: 'Have a specific inquiry not covered here?',
          description: 'Our team is always happy to hear from fellow travelers, readers, and creatives.',
          buttonText: 'Contact Us Directly',
          buttonLink: '/contact',
          variant: 'warm-terracotta'
        }
      }
    ];

    insertPage.run(
      'page-faq',
      'Frequently Asked Questions',
      'faq',
      'Transparency regarding our editorial standards, gear recommendations, print sales, and community guidelines.',
      'published',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      'custom',
      JSON.stringify(faqBlocks),
      'Frequently Asked Questions — Toufiq Motion',
      'Read answers to common questions regarding Toufiq Motion editorial dispatches, photography gear, and partnership guidelines.',
      'faq editorial standards',
      'https://toufiqmotion.com/faq',
      0,
      91,
      0,
      126
    );

    console.log('📄 Seeded 3 complete custom pages with Page Builder structured blocks.');
  }

  // Seed Affiliate Marketing Links & FTC Settings
  const affCount = db.prepare('SELECT COUNT(*) as count FROM affiliate_links').get() as { count: number };
  if (affCount.count === 0) {
    const insertAffLink = db.prepare(`
      INSERT INTO affiliate_links (
        id, title, slug, target_url, merchant, category, price, rating, badge,
        image_url, description, pros_json, cons_json, button_text, secondary_url,
        secondary_button_text, clicks_count, is_active, rel_tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const affiliateLinks = [
      {
        id: 'aff-sony-a7iv',
        title: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera',
        slug: 'sony-a7iv',
        target_url: 'https://www.amazon.com/dp/B09JZT6YK5?tag=toufiqmotion-20',
        merchant: 'Amazon',
        category: 'Camera & Photography',
        price: '$2,498.00',
        rating: 4.9,
        badge: "Editor's Choice",
        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
        description: 'Our primary camera body for documenting high-contrast alpine expeditions and coastal sunrises with unmatched dynamic range and 33MP clarity.',
        pros: ['Outstanding 33MP BSI sensor with 15 stops dynamic range', 'Class-leading real-time eye autofocus for human & wildlife', 'Robust weather sealing against mountain moisture & dust', '10-bit 4:2:2 internal video recording with S-Cinetone'],
        cons: ['Menu system has a steep learning curve for beginners', 'Slightly heavier than crop-sensor alternatives (658g)'],
        button_text: 'Check Price on Amazon',
        secondary_url: 'https://www.bhphotovideo.com',
        secondary_button_text: 'View on B&H Photo',
        clicks_count: 148
      },
      {
        id: 'aff-aeropress-go',
        title: 'AeroPress Go Portable Travel Coffee Maker',
        slug: 'aeropress-go',
        target_url: 'https://www.amazon.com/dp/B07YVL8SF3?tag=toufiqmotion-20',
        merchant: 'Amazon',
        category: 'Coffee & Kitchen',
        price: '$49.95',
        rating: 4.9,
        badge: 'Best Travel Gear',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        description: 'Compact, durable, and brews rich, smooth espresso-style concentrate anywhere from a hotel terrace to a backcountry trail.',
        pros: ['Self-contained mug and lid packs down ultra compact', 'Brews full-bodied, low-acidity coffee in under 90 seconds', 'Virtually indestructible BPA-free polypropylene build', 'Requires zero electricity or complicated cleanup'],
        cons: ['Makes 1-2 cups per press maximum', 'Requires proprietary micro-filters or reusable metal disk'],
        button_text: 'View on Amazon ($49.95)',
        secondary_url: '',
        secondary_button_text: '',
        clicks_count: 215
      },
      {
        id: 'aff-amalfi-monastero',
        title: 'Monastero Santa Rosa Hotel & Spa',
        slug: 'amalfi-monastero',
        target_url: 'https://www.booking.com/hotel/it/monastero-santa-rosa.html?aid=2026toufiq',
        merchant: 'Booking.com',
        category: 'Hotels & Stays',
        price: '$1,150 / night',
        rating: 5.0,
        badge: 'Luxury Sanctuary',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        description: "A 17th-century clifftop monastery converted into one of the Mediterranean's most exclusive boutique sanctuaries with an infinity pool suspended over the sea.",
        pros: ['Spectacular cantilevered infinity pool overlooking Salerno Gulf', 'Michelin-starred dining on historic monastery terrace', 'Sensory botanical spa with authentic ancient aromatic treatments', 'Impeccable discreet service with only 20 private guest rooms'],
        cons: ['Bookings fill 6-8 months in advance for peak season', 'High premium nightly rates'],
        button_text: 'Check Availability on Booking.com',
        secondary_url: '',
        secondary_button_text: '',
        clicks_count: 312
      },
      {
        id: 'aff-patagonia-mlc-45',
        title: 'Patagonia Black Hole MLC 45L Duffel',
        slug: 'patagonia-mlc-45',
        target_url: 'https://www.patagonia.com/product/black-hole-mlc-convertible-backpack-45l/?ref=toufiqmotion',
        merchant: 'Patagonia',
        category: 'Travel Bags & Packs',
        price: '$239.00',
        rating: 4.8,
        badge: 'Best Carry-On',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
        description: 'The gold standard for one-bag travel. Meets international carry-on requirements while offering dedicated tech compartments and stowable shoulder straps.',
        pros: ['100% recycled weather-resistant ripstop TPU film laminate', 'Converts between backpack, shoulder bag, and duffel', 'TSA-approved lie-flat laptop and document sleeve', "Backed by Patagonia's legendary Ironclad Guarantee"],
        cons: ['Can feel bulky when packed to maximum capacity', 'High initial price tag'],
        button_text: 'Shop at Patagonia ($239)',
        secondary_url: '',
        secondary_button_text: '',
        clicks_count: 94
      },
      {
        id: 'aff-leica-q3',
        title: 'Leica Q3 28mm f/1.7 Compact Camera',
        slug: 'leica-q3',
        target_url: 'https://leica-camera.com/en-US/photography/cameras/q/q3?ref=toufiqmotion',
        merchant: 'Leica',
        category: 'Camera & Photography',
        price: '$5,995.00',
        rating: 5.0,
        badge: 'Ultimate Street Camera',
        image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80',
        description: 'Pure photographic perfection. 60MP full-frame sensor coupled with the legendary Summilux 28mm f/1.7 ASPH prime lens.',
        pros: ['World-class optical micro-contrast and iconic Leica colors', 'Tilting high-resolution OLED touchscreen display', '8K video capability and wireless Qi charging grip', 'Built with aircraft-grade magnesium alloy in Germany'],
        cons: ['Fixed focal length lens cannot be swapped', 'Extremely limited retail availability and premium investment'],
        button_text: 'View at Leica Store',
        secondary_url: '',
        secondary_button_text: '',
        clicks_count: 178
      },
      {
        id: 'aff-nordic-linen-sheets',
        title: 'Dormi Pure French Organic Washed Linen Bedding',
        slug: 'dormi-linen-sheets',
        target_url: 'https://amazon.com/dp/B08XYZ1234?tag=toufiqmotion-20',
        merchant: 'Amazon',
        category: 'Mindful Home',
        price: '$189.00',
        rating: 4.8,
        badge: 'Best for Rest',
        image_url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=600&q=80',
        description: 'Harvested in Normandy, pre-washed for effortless drape and cloud-like softness that improves with every wash.',
        pros: ['Naturally thermoregulating — cool in summer, cozy in winter', 'Certified OEKO-TEX Standard 100 free of harmful chemicals', 'Durable European flax that lasts for decades', 'Breathable texture enhances deep REM sleep cycles'],
        cons: ['Natural relaxed wrinkles require embracing an effortless look', 'Slightly rougher than silk upon first unboxing'],
        button_text: 'Check Price on Amazon',
        secondary_url: '',
        secondary_button_text: '',
        clicks_count: 82
      }
    ];

    for (const item of affiliateLinks) {
      insertAffLink.run(
        item.id,
        item.title,
        item.slug,
        item.target_url,
        item.merchant,
        item.category,
        item.price,
        item.rating,
        item.badge,
        item.image_url,
        item.description,
        JSON.stringify(item.pros),
        JSON.stringify(item.cons),
        item.button_text,
        item.secondary_url,
        item.secondary_button_text,
        item.clicks_count,
        1,
        'nofollow sponsored noopener'
      );
    }

    // Insert sample clicks
    const insertAffClick = db.prepare(`
      INSERT INTO affiliate_clicks (id, link_id, slug, merchant, referer, user_agent, ip, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAffClick.run('clk-1', 'aff-sony-a7iv', 'sony-a7iv', 'Amazon', '/photography-gear-guide', 'Mozilla/5.0 Chrome/126', '127.0.0.1', new Date(Date.now() - 3600000 * 2).toISOString());
    insertAffClick.run('clk-2', 'aff-aeropress-go', 'aeropress-go', 'Amazon', '/the-art-of-slow-coffee', 'Mozilla/5.0 Safari/17', '127.0.0.1', new Date(Date.now() - 3600000 * 5).toISOString());
    insertAffClick.run('clk-3', 'aff-amalfi-monastero', 'amalfi-monastero', 'Booking.com', '/the-ultimate-amalfi-coast-travel-guide', 'Mozilla/5.0 Edge/126', '127.0.0.1', new Date(Date.now() - 3600000 * 8).toISOString());

    // Insert FTC Disclosure & Homepage layout settings into site_settings if not present
    const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
    insertSetting.run('home_variant', 'design1');
    insertSetting.run('affiliate_ftc_disclosure', 'Affiliate Disclosure: Toufiq Motion is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you. We only recommend gear, retreats, and goods we have genuinely tested and believe in.');
    insertSetting.run('affiliate_disclosure_position', 'top');
    insertSetting.run('affiliate_auto_nofollow', 'true');

    // Update existing articles to mark affiliate link presence
    db.prepare("UPDATE articles SET has_affiliate_links = 1 WHERE slug IN ('the-ultimate-amalfi-coast-travel-guide', 'the-art-of-slow-coffee-brewing')").run();

    console.log('🛍️ Seeded 6 high-converting affiliate products, cloaked links, click logs, and FTC compliance settings.');
  }
}

