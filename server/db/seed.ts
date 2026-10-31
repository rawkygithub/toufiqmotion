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
}

