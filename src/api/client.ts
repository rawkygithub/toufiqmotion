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
    const res = await fetch(`${API_BASE}/newsletter`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
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
    const res = await fetch(`${API_BASE}/inquiries${type ? `?type=${type}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return res.json();
  },

  async updateInquiryStatus(token: string, id: string, status: string) {
    const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
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

  async getMe(token: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Admin Posts Management
  async createPost(token: string, postData: any) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    return data;
  },

  async updatePost(token: string, id: string, postData: any) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update post');
    return data;
  },

  async deletePost(token: string, id: string) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete post');
    return data;
  },

  // Media Upload
  async uploadMedia(token: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  // Categories (Requirement 1)
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(token: string, data: { name: string; description?: string; icon?: string; image?: string; subcategories?: string[] }): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create category');
    return result;
  },

  async updateCategory(token: string, id: string, data: Partial<Category>): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update category');
    return result;
  },

  async deleteCategory(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete category');
    return result;
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
    const res = await fetch(`${API_BASE}/seo/audit/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update article SEO');
    return result;
  },

  async reanalyzeSeo(token: string): Promise<{ success: boolean; updatedCount: number; message: string }> {
    const res = await fetch(`${API_BASE}/seo/reanalyze`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to re-analyze SEO');
    return result;
  },

  async getSeoRedirects(): Promise<{ redirects: any[] }> {
    const res = await fetch(`${API_BASE}/seo/redirects`);
    if (!res.ok) throw new Error('Failed to fetch redirects');
    return res.json();
  },

  async createSeoRedirect(token: string, data: { sourcePath: string; targetPath: string; redirectCode?: number; notes?: string }): Promise<{ redirect: any }> {
    const res = await fetch(`${API_BASE}/seo/redirects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create redirect');
    return result;
  },

  async updateSeoRedirect(token: string, id: string, data: { sourcePath: string; targetPath: string; redirectCode?: number; notes?: string }): Promise<{ redirect: any }> {
    const res = await fetch(`${API_BASE}/seo/redirects/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update redirect');
    return result;
  },

  async deleteSeoRedirect(token: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/seo/redirects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete redirect');
    return result;
  },

  async getSeoCrawlErrors(): Promise<{ errors: any[] }> {
    const res = await fetch(`${API_BASE}/seo/crawl-errors`);
    if (!res.ok) throw new Error('Failed to fetch crawl errors');
    return res.json();
  },

  async resolveSeoCrawlError(token: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/seo/crawl-errors/resolve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to resolve error');
    return result;
  },

  async clearSeoCrawlErrors(token: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/seo/crawl-errors/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to clear crawl errors');
    return result;
  },

  async getSeoSettings(): Promise<{ settings: Record<string, string> }> {
    const res = await fetch(`${API_BASE}/seo/settings`);
    if (!res.ok) throw new Error('Failed to fetch SEO settings');
    return res.json();
  },

  async saveSeoSettings(token: string, settings: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/seo/settings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to save SEO settings');
    return result;
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
    const res = await fetch(`${API_BASE}/seo/indexing-submit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit indexing URL');
    return result;
  },

  async getSeoSearchQueries(): Promise<{ queries: any[] }> {
    const res = await fetch(`${API_BASE}/seo/search-queries`);
    if (!res.ok) throw new Error('Failed to fetch search queries');
    return res.json();
  }
};

