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
}

