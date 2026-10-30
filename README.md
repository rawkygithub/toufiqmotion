# ✨ Toufiq Motion — Modern Editorial Blog & Full-Stack Platform

A 2026 production-grade, eye-smooth, luminous travel, lifestyle, and wellbeing editorial blog built with a **Node.js + Express 5 + SQLite (WAL Mode) Backend** and a **React 19 + TypeScript + Tailwind CSS Frontend**, strictly adhering to the designer's 7-page PDF specification.

---

## 🏛️ 2026 Modern Blog Backend Architecture

In 2026, high-performance publishing platforms (like Ghost, Astro Studio, and PocketBase) avoid over-engineered microservices and external database daemons in favor of a **Modular Monolith with Embedded SQLite in WAL (Write-Ahead Logging) Mode**.

### Key Architectural Pillars:
1. **Modular Monolith**: Clean domain isolation (`auth`, `posts`, `comments`, `newsletter`, `inquiries`, `media`, `stats`).
2. **SQLite with WAL Mode (`better-sqlite3`)**:
   - Sub-millisecond reads (`< 1ms`) and zero external database setup or connection failures.
   - High concurrency through concurrent reads during non-blocking writes.
   - Fully relational with foreign keys, cascading deletes, and indexed query optimizations.
3. **End-to-End Type Safety**: Built in TypeScript with full strict checking and native Node 24 support.
4. **Security & Validation**: JWT token authentication with bcrypt password hashing, request rate protection, sanitized inputs, and centralized error handling.
5. **Direct Media Pipeline**: Local media storage with MIME-type verification and static asset caching.

---

## 📁 Backend Directory Layout

```
server/
├── db/
│   ├── index.ts        # Database connection, WAL mode pragmas & schema tables
│   └── seed.ts         # Seeds initial rich articles, categories, admin user & sample comments
├── middleware/
│   ├── auth.ts         # JWT verification & admin guard
│   ├── errorHandler.ts # Centralized error handler
│   └── upload.ts       # Multer storage configuration for local media uploads
├── routes/
│   ├── auth.ts         # POST /api/auth/login, GET /api/auth/me
│   ├── posts.ts        # GET /api/posts, GET /api/posts/:slug, POST /api/posts, PUT /api/posts/:id, DELETE /api/posts/:id, POST /api/posts/:id/like
│   ├── comments.ts     # GET /api/comments, POST /api/comments/article/:id, DELETE /api/comments/:id
│   ├── newsletter.ts   # POST /api/newsletter, GET /api/newsletter, DELETE /api/newsletter/:id
│   ├── inquiries.ts    # POST /api/inquiries, GET /api/inquiries, PUT /api/inquiries/:id/status
│   ├── media.ts        # POST /api/media/upload
│   └── stats.ts        # GET /api/stats (total articles, views, likes, subscribers, inquiries)
├── app.ts              # Express application, CORS, middlewares, static routes, SPA fallback
└── index.ts            # Application bootstrap & port listener
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check and architecture status |
| `GET` | `/api/posts` | Public | List articles with search (`?q=`), category (`?category=`), subcategory, tag, and sorting (`?sort=latest\|popular\|trending`) |
| `GET` | `/api/posts/:slugOrId` | Public | Get single article (increments view count automatically) and its approved reflections |
| `POST` | `/api/posts/:id/like` | Public | Atomically increments like counter on article |
| `POST` | `/api/posts` | **Admin** | Create new blog post with automatic slug generation |
| `PUT` | `/api/posts/:id` | **Admin** | Update existing article |
| `DELETE` | `/api/posts/:id` | **Admin** | Delete article and cascading comments |
| `POST` | `/api/comments/article/:id` | Public | Post a reader reflection/comment |
| `GET` | `/api/comments` | **Admin** | List all reader comments |
| `DELETE` | `/api/comments/:id` | **Admin** | Delete comment |
| `POST` | `/api/newsletter` | Public | Subscribe email with source tracking |
| `GET` | `/api/newsletter` | **Admin** | List subscribers with CSV export |
| `POST` | `/api/inquiries` | Public | Submit "Work With Us" partnership or Contact message |
| `GET` | `/api/inquiries` | **Admin** | List leads and contact messages with status filter |
| `PUT` | `/api/inquiries/:id/status`| **Admin** | Update inquiry status (`new`, `in_review`, `resolved`) |
| `POST` | `/api/media/upload` | **Admin** | Upload image to `/uploads` with instant URL |
| `GET` | `/api/stats` | Public | Real-time blog statistics (views, likes, subscribers, top posts) |
| `POST` | `/api/auth/login` | Public | Authenticate admin (`admin@toufiqmotion.com` / `admin123`) |

---

## 🔐 Built-in Admin Editorial Studio

You can access the **Admin Studio** by clicking the **Lock icon 🔒** in the top navigation bar or the **"Studio 🔐"** link in the footer:

- **Demo Admin Email**: `admin@toufiqmotion.com`
- **Demo Password**: `admin123`

### Studio Capabilities:
1. **Live Analytics**: Real-time counters for Published Articles, Cumulative Readership Views, Reader Likes, Active Subscribers, and Inquiries.
2. **Article Manager**:
   - Write new stories with a full editorial drawer (Title, Category, Subcategory, Tags, Excerpt, Content paragraphs, Quote callout, and Image Upload).
   - Edit or permanently delete articles.
3. **Newsletter Subscribers**: View email list, subscription dates, and export to CSV.
4. **Inquiries & Brand Partnerships**: Review messages from the "Work With Us" and "Contact" forms, update status (`new` → `in_review` → `resolved`), and click to reply.

---

## 🌟 Frontend Highlights (All 7 PDF Pages)

1. **Page 1: Homepage**:
   - Live layout switcher between all 3 designer styles:
     - *Design 1: Minimal Magazine Style*
     - *Design 2: Clean Editorial Style*
     - *Design 3: Modern Card Style*
2. **Page 2: Travel Page**: Subcategory icon filters, Amalfi Coast featured guide, 6 latest guides, popular destinations pills, and travel resources.
3. **Page 3: Lifestyle Page**: Everyday inspiration hero, split featured story, and 5 visual topic cards.
4. **Page 4: Health & Wellbeing**: 10 simple habits featured story, Quick Wellbeing Tips sidebar, and daily routines.
5. **Page 5: Newsletter & Work With Us**: Media kit with 50K+/100K+/4%/100% stats counters, 4 partnership avenues, 5 guarantee checkmarks, and "Let's Talk" form.
6. **Page 6: About & Contact**: Founder story, portrait, 4 pillars, quote banner, message form, other ways to connect, and FAQ accordion.
7. **Page 7: Footer**: Top newsletter banner, 5-column navigation, 4-item value proposition strip, legal links, and smooth back-to-top.
8. **"Inside Light" Ambient Engine**: 5 soothing light modes (*Golden Hour, Morning Dew, Sunset Ember, Candlelight, Studio Minimal*) with intensity slider.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start the unified production Node.js server (Frontend + Backend + Database)
npm start

# Or start in live-reload watch mode
npm run server:dev

# 3. For frontend development with Vite HMR
npm run dev
```

- **App & Production Server**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Admin Editorial Studio**: [http://localhost:3000](http://localhost:3000) (Click Lock icon in navbar)
