import { Article } from '../data/articles';

const API_BASE = '/api';

export interface PostParams {
  category?: string;
  subcategory?: string;
  tag?: string;
  q?: string;
  featured?: boolean;
  sort?: 'latest' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  subcategories: string[];
  articleCount?: number;
  createdAt?: string;
}

export interface StatsResponse {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalSubscribers: number;
  totalInquiries: number;
  newInquiries: number;
  categories: { category: string; count: number }[];
  topArticles: any[];
}

export interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'link';
  pageId?: string;
  url: string;
  hasDropdown?: boolean;
  enabled: boolean;
  isExternal?: boolean;
}

export interface FooterValueProp {
  icon: string;
  title: string;
  desc: string;
}

export interface LegalLink {
  label: string;
  url: string;
}

export type PageBlockType = 
  | 'hero'
  | 'rich_text'
  | 'split_feature'
  | 'cards_grid'
  | 'faq_accordion'
  | 'cta_banner'
  | 'quote'
  | 'gallery'
  | 'post_grid'
  | 'embed'
  | 'affiliate_box';

export interface PageBlock {
  id: string;
  type: PageBlockType;
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'background';
  backgroundColor?: string;
  textColor?: string;
  badge?: string;
  merchant?: string;
  price?: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
  affiliateSlug?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  items?: Array<{
    id?: string;
    title: string;
    description?: string;
    icon?: string;
    link?: string;
    badge?: string;
    image?: string;
  }>;
  galleryImages?: Array<{
    url: string;
    caption?: string;
    alt?: string;
  }>;
  postCategory?: string;
  postLimit?: number;
  embedCode?: string;
  customCss?: string;
  padding?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  visible?: boolean;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: 'published' | 'draft';
  featured_image?: string;
  template: 'standard' | 'fullwidth' | 'minimal' | 'landing';
  blocks_json: PageBlock[];
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  no_index: boolean;
  seo_score: number;
  is_system: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface PagesOverviewStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  totalViews: number;
}

export interface PagesListResponse {
  success: boolean;
  pages: CustomPage[];
  total: number;
  stats: PagesOverviewStats;
}

export interface AffiliateLink {
  id: string;
  title: string;
  slug: string;
  target_url: string;
  merchant: string;
  category: string;
  price?: string;
  rating?: number;
  badge?: string;
  image_url?: string;
  description?: string;
  pros: string[];
  cons: string[];
  button_text?: string;
  secondary_url?: string;
  secondary_button_text?: string;
  clicks_count: number;
  last_clicked_at?: string;
  is_active: boolean;
  rel_tags?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AffiliateClick {
  id: string;
  link_id: string;
  slug: string;
  merchant?: string;
  product_title?: string;
  referer?: string;
  user_agent?: string;
  ip?: string;
  created_at: string;
}

export interface AffiliateOverview {
  success: boolean;
  metrics: {
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    clicksToday: number;
  };
  merchants: Array<{
    merchant: string;
    linksCount: number;
    clicks: number;
  }>;
  topProducts: Array<{
    id: string;
    title: string;
    slug: string;
    merchant: string;
    category: string;
    price: string;
    rating: number;
    badge: string;
    image_url: string;
    clicks_count: number;
    last_clicked_at: string;
  }>;
  recentClicks: AffiliateClick[];
}

export interface AffiliateSettings {
  disclosure: string;
  position: 'top' | 'inline' | 'bottom';
  autoNofollow: boolean;
}

export interface SiteSettings {
  home_variant?: 'design1' | 'design2' | 'design3';
  logo_type?: 'text' | 'image';
  logo_url?: string;
  logo_height?: number | string;
  favicon_url?: string;
  site_title?: string;
  site_tagline?: string;
  admin_name?: string;
  admin_email?: string;
  admin_role?: string;
  admin_avatar?: string;
  admin_role_title?: string;
  header_sticky?: boolean;
  announcement_enabled?: boolean;
  announcement_text?: string;
  announcement_link?: string;
  header_cta_enabled?: boolean;
  header_cta_text?: string;
  header_cta_link?: string;
  menu_items_json?: MenuItem[];
  footer_newsletter_enabled?: boolean;
  footer_newsletter_title?: string;
  footer_newsletter_subtitle?: string;
  footer_newsletter_tagline?: string;
  footer_bio_text?: string;
  footer_values_json?: FooterValueProp[];
  footer_socials_json?: Record<string, string>;
  footer_copyright_text?: string;
  footer_made_with?: string;
  footer_back_to_top_enabled?: boolean;
  footer_legal_links_json?: LegalLink[];
}

export type UserRole = 'admin' | 'editor' | 'author' | 'contributor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  created_at?: string;
  articlesCount?: number;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  mimetype: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt_text?: string;
  title?: string;
  caption?: string;
  is_optimized?: boolean | number;
  original_size?: number;
  created_at: string;
  updated_at?: string;
}

export interface MediaStats {
  totalItems: number;
  totalStorageBytes: number;
  optimizedCount: number;
  unoptimizedCount: number;
}

export interface MediaListResponse {
  success: boolean;
  media: MediaItem[];
  total: number;
  page: number;
  limit: number;
  stats: MediaStats;
}

export interface OptimizationToolResponse {
  success: boolean;
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  savingsBytes: number;
  savingsPercent: number;
  width: number;
  height: number;
  format: string;
  url: string;
  base64Data: string;
  mediaItem?: MediaItem;
  qualityUsed: number;
}

export function getEffectiveToken(token?: string | null): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('toufiq_admin_token');
    if (saved) return saved;
  }
  return token || '';
}

export function checkAuthResponse(res: Response, data?: any) {
  if (typeof window !== 'undefined') {
    const renewed = res.headers.get('x-renewed-token');
    if (renewed) {
      localStorage.setItem('toufiq_admin_token', renewed);
      window.dispatchEvent(new CustomEvent('auth:renewed', { detail: { token: renewed } }));
    }
    if (res.status === 401) {
      localStorage.removeItem('toufiq_admin_token');
      window.dispatchEvent(new CustomEvent('auth:expired', {
        detail: { message: data?.error || 'Unauthorized: Token has expired or is invalid' }
      }));
    }
  }
}

async function authFetchJson<T = any>(
  url: string,
  options: RequestInit = {},
  token?: string | null,
  defaultError = 'Request failed'
): Promise<T> {
  const effectiveToken = getEffectiveToken(token);
  const headers = new Headers(options.headers || {});
  if (effectiveToken) {
    headers.set('Authorization', `Bearer ${effectiveToken}`);
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  checkAuthResponse(res, data);
  if (!res.ok) throw new Error(data.error || defaultError);
  return data;
}

export const api = {
  // Articles
  async getArticles(params: PostParams = {}): Promise<{ articles: Article[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.subcategory) searchParams.set('subcategory', params.subcategory);
    if (params.tag) searchParams.set('tag', params.tag);
    if (params.q) searchParams.set('q', params.q);
    if (params.featured) searchParams.set('featured', '1');
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.page) searchParams.set('page', String(params.page));

    const res = await fetch(`${API_BASE}/posts?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticleBySlug(slugOrId: string): Promise<{ article: Article; comments: any[] }> {
    const res = await fetch(`${API_BASE}/posts/${slugOrId}`);
    if (!res.ok) throw new Error('Failed to fetch article');
    return res.json();
  },

  async likeArticle(id: string): Promise<{ likesCount: number }> {
    const res = await fetch(`${API_BASE}/posts/${id}/like`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to like article');
    return res.json();
  },

  async addComment(articleId: string, authorName: string, content: string, authorEmail?: string) {
    const res = await fetch(`${API_BASE}/comments/article/${articleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, content, authorEmail })
    });
    if (!res.ok) throw new Error('Failed to add reflection');
    return res.json();
  },

  // Newsletter
  async subscribeNewsletter(email: string, name?: string, source = 'footer') {
    const res = await fetch(`${API_BASE}/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, source })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
    return data;
  },

  async getSubscribers(token: string) {
    return authFetchJson(`${API_BASE}/newsletter`, {}, token, 'Failed to fetch subscribers');
  },

  // Inquiries
  async submitInquiry(data: {
    type: 'partnership' | 'contact';
    name: string;
    email: string;
    company?: string;
    subject?: string;
    projectType?: string;
    message: string;
  }) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit inquiry');
    return result;
  },

  async getInquiries(token: string, type?: string) {
    return authFetchJson(
      `${API_BASE}/inquiries${type ? `?type=${type}` : ''}`,
      {},
      token,
      'Failed to fetch inquiries'
    );
  },

  async updateInquiryStatus(token: string, id: string, status: string) {
    return authFetchJson(
      `${API_BASE}/inquiries/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      },
      token,
      'Failed to update status'
    );
  },

  // Stats
  async getStats(): Promise<StatsResponse> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Admin Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe(token?: string | null) {
    return authFetchJson(`${API_BASE}/auth/me`, {}, token, 'Unauthorized');
  },

  // Admin Posts Management
  async createPost(token: string, postData: any) {
    return authFetchJson(
      `${API_BASE}/posts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      },
      token,
      'Failed to create post'
    );
  },

  async updatePost(token: string, id: string, postData: any) {
    return authFetchJson(
      `${API_BASE}/posts/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      },
      token,
      'Failed to update post'
    );
  },

  async deletePost(token: string, id: string) {
    return authFetchJson(`${API_BASE}/posts/${id}`, { method: 'DELETE' }, token, 'Failed to delete post');
  },

  // Media Library & WebP Optimization
  async getMedia(params: { page?: number; limit?: number; q?: string; filter?: string; sort?: string } = {}): Promise<MediaListResponse> {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.q) sp.set('q', params.q);
    if (params.filter) sp.set('filter', params.filter);
    if (params.sort) sp.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/media?${sp.toString()}`);
    if (!res.ok) throw new Error('Failed to load media assets');
    return res.json();
  },

  async uploadMedia(token: string, file: File, autoOptimize = false) {
    const formData = new FormData();
    formData.append('files', file);
    const effectiveToken = getEffectiveToken(token);

    const res = await fetch(`${API_BASE}/media/upload?autoOptimize=${autoOptimize}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${effectiveToken}` },
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    checkAuthResponse(res, data);
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  async uploadMultipleMedia(token: string, files: File[], autoOptimize = false): Promise<{ success: boolean; media: MediaItem[] }> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files[]', file);
    }
    const effectiveToken = getEffectiveToken(token);

    const res = await fetch(`${API_BASE}/media/upload?autoOptimize=${autoOptimize}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${effectiveToken}` },
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    checkAuthResponse(res, data);
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  async optimizeMediaItem(token: string, id: string): Promise<{ success: boolean; message: string; item: MediaItem; report: any }> {
    const effectiveToken = getEffectiveToken(token);
    const res = await fetch(`${API_BASE}/media/${id}/optimize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${effectiveToken}` }
    });
    const data = await res.json().catch(() => ({}));
    checkAuthResponse(res, data);
    if (!res.ok) throw new Error(data.error || 'Optimization failed');
    return data;
  },

  async optimizeImageTool(fileOrUrl: File | string, saveToLibrary = false): Promise<OptimizationToolResponse> {
    const formData = new FormData();
    if (typeof fileOrUrl === 'string') {
      formData.append('imageUrl', fileOrUrl);
    } else {
      formData.append('image', fileOrUrl);
    }
    if (saveToLibrary) {
      formData.append('saveToLibrary', 'true');
    }

    const res = await fetch(`${API_BASE}/media/optimize-tool`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    checkAuthResponse(res, data);
    if (!res.ok) throw new Error(data.error || 'Tool optimization failed');
    return data;
  },

  async batchOptimizeMedia(token: string): Promise<{ success: boolean; processedCount: number; totalSavingsBytes: number; message: string }> {
    const effectiveToken = getEffectiveToken(token);
    const res = await fetch(`${API_BASE}/media/batch-optimize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${effectiveToken}` }
    });
    const data = await res.json().catch(() => ({}));
    checkAuthResponse(res, data);
    if (!res.ok) throw new Error(data.error || 'Batch optimization failed');
    return data;
  },

  async updateMediaItem(token: string, id: string, meta: { alt_text?: string; title?: string; caption?: string }): Promise<{ success: boolean; item: MediaItem }> {
    const effectiveToken = getEffectiveToken(token);
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meta)
    });
    const data = await res.json().catch(() => ({}));
    checkAuthResponse(res, data);
    if (!res.ok) throw new Error(data.error || 'Failed to update media');
    return data;
  },

  async deleteMediaItem(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const effectiveToken = getEffectiveToken(token);
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${effectiveToken}` }
    });
    const data = await res.json().catch(() => ({}));
    checkAuthResponse(res, data);
    if (!res.ok) throw new Error(data.error || 'Failed to delete media asset');
    return data;
  },

  // Categories (Requirement 1)
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(token: string, data: { name: string; description?: string; icon?: string; image?: string; subcategories?: string[] }): Promise<{ category: Category }> {
    return authFetchJson(
      `${API_BASE}/categories`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to create category'
    );
  },

  async updateCategory(token: string, id: string, data: Partial<Category>): Promise<{ category: Category }> {
    return authFetchJson(
      `${API_BASE}/categories/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to update category'
    );
  },

  async deleteCategory(token: string, id: string): Promise<{ success: boolean; message: string }> {
    return authFetchJson(`${API_BASE}/categories/${id}`, { method: 'DELETE' }, token, 'Failed to delete category');
  },

  // SEO Command Center Methods
  async getSeoOverview(): Promise<{
    siteSeoHealth: number;
    grade: string;
    totalIndexedUrls: number;
    breakdown: { articles: number; categories: number; staticPages: number };
    activeRedirectsCount: number;
    crawlErrorsCount: number;
    sitemapUrl: string;
    lastPingedAt: string;
  }> {
    const res = await fetch(`${API_BASE}/seo/overview`);
    if (!res.ok) throw new Error('Failed to fetch SEO overview');
    return res.json();
  },

  async getSeoAudit(): Promise<{ auditItems: any[] }> {
    const res = await fetch(`${API_BASE}/seo/audit`);
    if (!res.ok) throw new Error('Failed to fetch SEO audit');
    return res.json();
  },

  async updateArticleSeo(token: string, id: string, data: any): Promise<{ success: boolean; seoScore: number }> {
    return authFetchJson(
      `${API_BASE}/seo/audit/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to update article SEO'
    );
  },

  async reanalyzeSeo(token: string): Promise<{ success: boolean; updatedCount: number; message: string }> {
    return authFetchJson(`${API_BASE}/seo/reanalyze`, { method: 'POST' }, token, 'Failed to re-analyze SEO');
  },

  async getSeoRedirects(): Promise<{ redirects: any[] }> {
    const res = await fetch(`${API_BASE}/seo/redirects`);
    if (!res.ok) throw new Error('Failed to fetch redirects');
    return res.json();
  },

  async createSeoRedirect(token: string, data: { sourcePath: string; targetPath: string; redirectCode?: number; notes?: string }): Promise<{ redirect: any }> {
    return authFetchJson(
      `${API_BASE}/seo/redirects`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to create redirect'
    );
  },

  async updateSeoRedirect(token: string, id: string, data: { sourcePath: string; targetPath: string; redirectCode?: number; notes?: string }): Promise<{ redirect: any }> {
    return authFetchJson(
      `${API_BASE}/seo/redirects/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to update redirect'
    );
  },

  async deleteSeoRedirect(token: string, id: string): Promise<{ success: boolean }> {
    return authFetchJson(`${API_BASE}/seo/redirects/${id}`, { method: 'DELETE' }, token, 'Failed to delete redirect');
  },

  async getSeoCrawlErrors(): Promise<{ errors: any[] }> {
    const res = await fetch(`${API_BASE}/seo/crawl-errors`);
    if (!res.ok) throw new Error('Failed to fetch crawl errors');
    return res.json();
  },

  async resolveSeoCrawlError(token: string, id: string): Promise<{ success: boolean }> {
    return authFetchJson(
      `${API_BASE}/seo/crawl-errors/resolve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      },
      token,
      'Failed to resolve error'
    );
  },

  async clearSeoCrawlErrors(token: string): Promise<{ success: boolean }> {
    return authFetchJson(`${API_BASE}/seo/crawl-errors/clear`, { method: 'POST' }, token, 'Failed to clear crawl errors');
  },

  async getSeoSettings(): Promise<{ settings: Record<string, string> }> {
    const res = await fetch(`${API_BASE}/seo/settings`);
    if (!res.ok) throw new Error('Failed to fetch SEO settings');
    return res.json();
  },

  async saveSeoSettings(token: string, settings: Record<string, any>): Promise<{ success: boolean; message: string }> {
    return authFetchJson(
      `${API_BASE}/seo/settings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      },
      token,
      'Failed to save SEO settings'
    );
  },

  async pingSearchEngines(): Promise<{ success: boolean; message: string; sitemapUrl: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/seo/ping`, {
      method: 'POST'
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to ping search engines');
    return result;
  },

  async getSeoIndexingLogs(): Promise<{ logs: any[] }> {
    const res = await fetch(`${API_BASE}/seo/indexing-logs`);
    if (!res.ok) throw new Error('Failed to fetch indexing logs');
    return res.json();
  },

  async submitIndexingUrl(token: string, data: { url: string; engine?: string; action?: string }): Promise<{ success: boolean; log: any }> {
    return authFetchJson(
      `${API_BASE}/seo/indexing-submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to submit indexing URL'
    );
  },

  async getSeoSearchQueries(): Promise<{ queries: any[] }> {
    const res = await fetch(`${API_BASE}/seo/search-queries`);
    if (!res.ok) throw new Error('Failed to fetch search queries');
    return res.json();
  },

  async verifySeoHeadTags(): Promise<{
    success: boolean;
    status: string;
    timestamp: string;
    configured: {
      google_site_verification: boolean;
      bing_site_verification: boolean;
      google_analytics_id: boolean;
      google_tag_manager_id: boolean;
      custom_head_tags: boolean;
    };
    values: {
      google_site_verification: string;
      bing_site_verification: string;
      google_analytics_id: string;
      google_tag_manager_id: string;
      custom_head_tags: string;
    };
    injectedPreview: string;
  }> {
    const res = await fetch(`${API_BASE}/seo/verify-head`);
    if (!res.ok) throw new Error('Failed to verify live head tags');
    return res.json();
  },

  // Site Appearance, Header, Menu, Logo & Footer Settings
  async getSiteSettings(): Promise<{ settings: SiteSettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return res.json();
  },

  async getPrimaryAuthor(): Promise<{ author: { name: string; role: string; avatar: string } | null }> {
    const res = await fetch(`${API_BASE}/users/author`);
    if (!res.ok) return { author: null };
    return res.json();
  },

  async saveSiteSettings(token: string, settings: Partial<SiteSettings>): Promise<{ success: boolean; message: string }> {
    return authFetchJson(
      `${API_BASE}/settings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      },
      token,
      'Failed to save site settings'
    );
  },

  // Pages Builder & Maintenance
  async getPages(params?: { q?: string; status?: string }): Promise<PagesListResponse> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    const qs = query.toString();
    const res = await fetch(`${API_BASE}/pages${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch pages');
    return res.json();
  },

  async getPage(id: string): Promise<{ success: boolean; page: CustomPage }> {
    const res = await fetch(`${API_BASE}/pages/${id}`);
    if (!res.ok) throw new Error('Failed to fetch page');
    return res.json();
  },

  async getPageBySlug(slug: string): Promise<{ success: boolean; page: CustomPage }> {
    const res = await fetch(`${API_BASE}/pages/slug/${slug}`);
    if (!res.ok) throw new Error('Page not found');
    return res.json();
  },

  async createPage(token: string, data: Partial<CustomPage>): Promise<{ success: boolean; page: CustomPage; message: string }> {
    return authFetchJson(
      `${API_BASE}/pages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to create page'
    );
  },

  async updatePage(token: string, id: string, data: Partial<CustomPage>): Promise<{ success: boolean; page: CustomPage; message: string }> {
    return authFetchJson(
      `${API_BASE}/pages/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to update page'
    );
  },

  async duplicatePage(token: string, id: string): Promise<{ success: boolean; page: CustomPage; message: string }> {
    return authFetchJson(`${API_BASE}/pages/${id}/duplicate`, { method: 'POST' }, token, 'Failed to duplicate page');
  },

  async addPageToMenu(token: string, id: string, label?: string): Promise<{ success: boolean; message: string; menuItems: MenuItem[] }> {
    return authFetchJson(
      `${API_BASE}/pages/${id}/add-to-menu`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label })
      },
      token,
      'Failed to add page to navigation menu'
    );
  },

  async deletePage(token: string, id: string): Promise<{ success: boolean; message: string }> {
    return authFetchJson(`${API_BASE}/pages/${id}`, { method: 'DELETE' }, token, 'Failed to delete page');
  },

  // Affiliate Marketing Engine
  async getAffiliateOverview(): Promise<AffiliateOverview> {
    const res = await fetch(`${API_BASE}/affiliate/overview`);
    if (!res.ok) throw new Error('Failed to fetch affiliate overview');
    return res.json();
  },

  async getAffiliateLinks(params?: { q?: string; merchant?: string; category?: string }): Promise<{ success: boolean; links: AffiliateLink[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.merchant && params.merchant !== 'all') query.set('merchant', params.merchant);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    const qs = query.toString();
    const res = await fetch(`${API_BASE}/affiliate/links${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch affiliate links');
    return res.json();
  },

  async getAffiliateLink(id: string): Promise<{ success: boolean; link: AffiliateLink }> {
    const res = await fetch(`${API_BASE}/affiliate/links/${id}`);
    if (!res.ok) throw new Error('Affiliate link not found');
    return res.json();
  },

  async createAffiliateLink(token: string, data: Partial<AffiliateLink>): Promise<{ success: boolean; link: AffiliateLink; message: string }> {
    return authFetchJson(
      `${API_BASE}/affiliate/links`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to create affiliate link'
    );
  },

  async updateAffiliateLink(token: string, id: string, data: Partial<AffiliateLink>): Promise<{ success: boolean; link: AffiliateLink; message: string }> {
    return authFetchJson(
      `${API_BASE}/affiliate/links/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      token,
      'Failed to update affiliate link'
    );
  },

  async deleteAffiliateLink(token: string, id: string): Promise<{ success: boolean; message: string }> {
    return authFetchJson(`${API_BASE}/affiliate/links/${id}`, { method: 'DELETE' }, token, 'Failed to delete affiliate link');
  },

  async getAffiliateClicks(token: string): Promise<{ success: boolean; clicks: AffiliateClick[]; total: number }> {
    return authFetchJson(`${API_BASE}/affiliate/clicks`, {}, token, 'Failed to fetch affiliate click log');
  },

  async generateAffiliateBoxHtml(config: any): Promise<{ success: boolean; html: string }> {
    const res = await fetch(`${API_BASE}/affiliate/generate-box-html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to generate review box HTML');
    return result;
  },

  async getAffiliateSettings(): Promise<{ success: boolean; settings: AffiliateSettings }> {
    const res = await fetch(`${API_BASE}/affiliate/settings`);
    if (!res.ok) throw new Error('Failed to fetch affiliate settings');
    return res.json();
  },

  async saveAffiliateSettings(token: string, settings: Partial<AffiliateSettings>): Promise<{ success: boolean; message: string }> {
    return authFetchJson(
      `${API_BASE}/affiliate/settings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      },
      token,
      'Failed to save affiliate settings'
    );
  },

  // =========================================================================
  // USER & ROLE MANAGEMENT
  // =========================================================================
  async getUsers(token: string): Promise<{ users: AdminUser[] }> {
    return authFetchJson(`${API_BASE}/users`, {}, token, 'Failed to fetch team users');
  },

  async getUser(token: string, id: string): Promise<{ user: AdminUser }> {
    return authFetchJson(`${API_BASE}/users/${id}`, {}, token, 'Failed to fetch user');
  },

  async createUser(
    token: string,
    userData: { name: string; email: string; password: string; role: UserRole; avatar?: string }
  ): Promise<{ success: boolean; message: string; user: AdminUser }> {
    return authFetchJson(
      `${API_BASE}/users`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      },
      token,
      'Failed to create user'
    );
  },

  async updateUser(
    token: string,
    id: string,
    userData: { name?: string; email?: string; role?: UserRole; avatar?: string }
  ): Promise<{ success: boolean; message: string; user: AdminUser }> {
    return authFetchJson(
      `${API_BASE}/users/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      },
      token,
      'Failed to update user'
    );
  },

  async changeUserPassword(
    token: string,
    id: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    return authFetchJson(
      `${API_BASE}/users/${id}/password`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      },
      token,
      'Failed to update password'
    );
  },

  async deleteUser(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return authFetchJson(
      `${API_BASE}/users/${id}`,
      {
        method: 'DELETE'
      },
      token,
      'Failed to delete user'
    );
  }
};

