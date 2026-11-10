import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api, StatsResponse, Category } from '../../api/client';
import { Article } from '../../data/articles';
import { RichTextEditor } from '../admin/RichTextEditor';
import { YoastSeoPanel, SeoData } from '../admin/YoastSeoPanel';
import { YoastSeoCommandCenter } from '../admin/YoastSeoCommandCenter';
import { SiteAppearanceManager } from '../admin/SiteAppearanceManager';
import { MediaLibrary } from '../admin/MediaLibrary';
import { PagesManager } from '../admin/PagesManager';
import { AffiliateManager } from '../admin/AffiliateManager';
import {
  Lock,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Heart,
  Users,
  Mail,
  FileText,
  Upload,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Search,
  ExternalLink,
  Tag,
  Compass,
  FolderPlus,
  CheckCircle2,
  Check,
  LayoutTemplate,
  Globe,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  ShoppingBag,
  X,
  PenTool,
  ArrowLeft
} from 'lucide-react';

export const AdminStudio: React.FC = () => {
  const { setActivePage } = useTheme();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('toufiq_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@toufiqmotion.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<'articles' | 'pages' | 'categories' | 'media' | 'appearance' | 'affiliate' | 'seo_center' | 'subscribers' | 'inquiries'>('articles');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Article creation/editing modal state
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'Travel',
    subcategory: 'Island Escapes',
    excerpt: '',
    image: '',
    quote: '',
    tags: 'Travel, Adventure, Photography',
    featured: false,
    hasAffiliateLinks: false
  });
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [seoData, setSeoData] = useState<SeoData>({
    focusKeyword: '',
    metaTitle: '',
    slug: '',
    metaDescription: '',
    canonicalUrl: '',
    noIndex: false,
    ogImage: '',
    ogTitle: '',
    ogDescription: ''
  });
  const [formSaving, setFormSaving] = useState(false);

  // Category creation modal state (Requirement 1)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Compass',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    subcategories: 'Island Escapes, Road Trips, Weekend Getaways'
  });
  const [categorySaving, setCategorySaving] = useState(false);

  // Upload image state
  const [uploading, setUploading] = useState(false);

  // Validate token on mount and reload dashboard data
  useEffect(() => {
    if (token) {
      api.getMe(token)
        .then((res) => {
          setAdminUser(res.user);
          loadDashboardData();
        })
        .catch(() => {
          // Token is expired or invalid, reset cleanly to login screen
          localStorage.removeItem('toufiq_admin_token');
          setToken(null);
          setAdminUser(null);
          setLoginError('Your session has expired. Please sign in again.');
        });
    }
  }, [token]);

  // Listen for global auth:expired and auth:renewed events from API client
  useEffect(() => {
    const onAuthExpired = (e: any) => {
      localStorage.removeItem('toufiq_admin_token');
      setToken(null);
      setAdminUser(null);
      setLoginError(e.detail?.message || 'Your session has expired. Please sign in again to continue.');
    };
    const onAuthRenewed = (e: any) => {
      if (e.detail?.token) {
        setToken(e.detail.token);
      }
    };
    window.addEventListener('auth:expired', onAuthExpired);
    window.addEventListener('auth:renewed', onAuthRenewed);
    return () => {
      window.removeEventListener('auth:expired', onAuthExpired);
      window.removeEventListener('auth:renewed', onAuthRenewed);
    };
  }, []);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMediaPickerOpen) {
          setIsMediaPickerOpen(false);
        } else if (isArticleModalOpen) {
          setIsArticleModalOpen(false);
        } else if (isCategoryModalOpen) {
          setIsCategoryModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isArticleModalOpen, isCategoryModalOpen, isMediaPickerOpen]);

  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsData, articlesData, catData, subsData, inqData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getArticles({ limit: 100 }),
        api.getCategories().catch(() => ({ categories: [], total: 0 })),
        api.getSubscribers(token).catch(() => ({ subscribers: [] })),
        api.getInquiries(token).catch(() => ({ inquiries: [] })),
      ]);

      if (statsData) setStats(statsData);
      setArticles(articlesData.articles);
      setCategories(catData.categories || []);
      setSubscribers(subsData.subscribers || []);
      setInquiries(inqData.inquiries || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      localStorage.setItem('toufiq_admin_token', res.token);
      setToken(res.token);
      setAdminUser(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('toufiq_admin_token');
    setToken(null);
    setAdminUser(null);
  };

  // --- ARTICLE HANDLERS ---
  const openNewArticleModal = () => {
    setEditingArticleId(null);
    const initialCategory = categories.length > 0 ? categories[0].name : 'Travel';
    const initialSubcategory = categories.length > 0 && categories[0].subcategories?.length > 0
      ? categories[0].subcategories[0]
      : 'Island Escapes';

    setArticleForm({
      title: '',
      category: initialCategory,
      subcategory: initialSubcategory,
      excerpt: '',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      quote: '',
      tags: 'Travel, Summer, Escape',
      featured: false,
      hasAffiliateLinks: false
    });
    setHtmlContent('<p>Begin writing your inspiring story here. You can use headings, bold text, blockquotes, callout note boxes, bullet lists, and embedded photography...</p>');
    setSeoData({
      focusKeyword: '',
      metaTitle: '',
      slug: '',
      metaDescription: '',
      canonicalUrl: '',
      noIndex: false,
      ogImage: '',
      ogTitle: '',
      ogDescription: ''
    });
    setIsArticleModalOpen(true);
  };

  const openEditArticleModal = (article: Article) => {
    setEditingArticleId(article.id);
    setArticleForm({
      title: article.title,
      category: article.category,
      subcategory: article.subcategory,
      excerpt: article.excerpt,
      image: article.image,
      quote: article.quote || '',
      tags: article.tags.join(', '),
      featured: Boolean(article.featured),
      hasAffiliateLinks: Boolean(article.hasAffiliateLinks || article.htmlContent?.includes('/go/') || article.htmlContent?.includes('affiliate-product-card'))
    });
    setHtmlContent(article.htmlContent || article.content.map(p => `<p>${p}</p>`).join(''));
    setSeoData({
      focusKeyword: article.focusKeyword || '',
      metaTitle: article.metaTitle || article.title,
      slug: article.slug,
      metaDescription: article.metaDescription || article.excerpt,
      canonicalUrl: article.canonicalUrl || '',
      noIndex: Boolean(article.noIndex),
      ogImage: article.ogImage || article.image,
      ogTitle: article.metaTitle || article.title,
      ogDescription: article.metaDescription || article.excerpt
    });
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormSaving(true);
    try {
      // Split html paragraphs for backward-compatible fallback
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const paragraphs = Array.from(tempDiv.querySelectorAll('p, h2, h3, blockquote'))
        .map(el => el.textContent?.trim() || '')
        .filter(Boolean);

      const payload = {
        title: articleForm.title,
        category: articleForm.category,
        subcategory: articleForm.subcategory,
        excerpt: articleForm.excerpt,
        image: articleForm.image,
        quote: articleForm.quote || undefined,
        featured: articleForm.featured,
        hasAffiliateLinks: Boolean(articleForm.hasAffiliateLinks || htmlContent.includes('/go/') || htmlContent.includes('affiliate-product-card')),
        tags: articleForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        content: paragraphs.length > 0 ? paragraphs : [articleForm.excerpt],
        htmlContent,
        focusKeyword: seoData.focusKeyword,
        metaTitle: seoData.metaTitle || articleForm.title,
        metaDescription: seoData.metaDescription || articleForm.excerpt,
        canonicalUrl: seoData.canonicalUrl,
        noIndex: seoData.noIndex,
        ogImage: seoData.ogImage || articleForm.image,
        seoScore: 92,
        readabilityScore: 95
      };

      if (editingArticleId) {
        await api.updatePost(token, editingArticleId, payload);
      } else {
        await api.createPost(token, payload);
      }

      setIsArticleModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to save article');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await api.deletePost(token, id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  // --- CATEGORY HANDLERS (Requirement 1) ---
  const openNewCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      description: '',
      icon: 'Compass',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      subcategories: 'Island Escapes, Road Trips, Travel Tips'
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Compass',
      image: cat.image || '',
      subcategories: cat.subcategories.join(', ')
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCategorySaving(true);
    try {
      const subcats = categoryForm.subcategories.split(',').map((s) => s.trim()).filter(Boolean);
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        icon: categoryForm.icon,
        image: categoryForm.image,
        subcategories: subcats
      };

      if (editingCategoryId) {
        await api.updateCategory(token, editingCategoryId, payload);
      } else {
        await api.createCategory(token, payload);
      }

      setIsCategoryModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(token, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const res = await api.uploadMedia(token, file);
      setArticleForm((prev) => ({ ...prev, image: res.url }));
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    if (!token) return;
    try {
      await api.updateInquiryStatus(token, inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleExportSubscribers = () => {
    const csv = 'Email,Name,Source,SubscribedAt\n' + subscribers.map((s) => `${s.email},${s.name || ''},${s.source},${s.subscribed_at}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${Date.now()}.csv`;
    a.click();
  };

  // If not logged in, show dedicated Studio Login screen with Return to Live Blog
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] flex flex-col justify-between py-8 px-4 font-sans">
        {/* Top Minimal Navigation */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pb-4">
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6A6356] hover:text-[#E8734A] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>&larr; Back to Live Blog</span>
          </button>
          <span className="text-[11px] font-mono font-bold text-[#8C8477]">Toufiq Studio</span>
        </div>

        {/* Center Studio Login Card */}
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#EDE7DF] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1E1B18]">Editorial Studio</h2>
            <p className="text-xs text-[#8C8477]">
              Sign in to manage categories, rich stories, and Yoast SEO
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#4A453E] block mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@toufiqmotion.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#4A453E] block mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? 'Authenticating...' : <>Enter Studio <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#F0ECE6]">
            <p className="text-[11px] text-[#8C8477]">
              Default Demo Credentials: <br />
              <span className="font-mono text-[#E8734A]">admin@toufiqmotion.com</span> &bull; <span className="font-mono text-[#E8734A]">admin123</span>
            </p>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="text-center py-4 text-[11px] text-[#A09A8F]">
          Toufiq Motion &bull; Secure Editorial CMS &bull; Node.js &amp; SQLite
        </div>
      </div>
    );
  }

  // Active Category object for subcategory auto-population
  const currentSelectedCategory = categories.find(c => c.name === articleForm.category);

  return (
    <div className="min-h-screen bg-[#F6F4EE] flex flex-col font-sans">
      
      {/* 1. DEDICATED BACKEND STUDIO TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE5DF] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFF2EB] to-[#FFE5D6] text-[#E8734A] flex items-center justify-center font-bold text-lg shadow-2xs border border-[#FFCEBA]/60">
              ✨
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#1E1B18] tracking-tight">
                Toufiq Studio
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold text-[#8C8477] ml-2 px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EDE7DF]">
                CMS 2026
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-[#EAE5DF] hidden sm:block" />

          {/* Switch to Live Blog */}
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#FFF2EB] text-[#5A5348] hover:text-[#E8734A] border border-[#EDE7DF] hover:border-[#E8734A]/40 text-xs font-semibold transition-all cursor-pointer group"
            title="View public live blog"
          >
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <span>View Live Blog</span>
          </button>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={openNewArticleModal}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write Story</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EDE7DF] text-xs text-[#5A5348]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium font-mono text-[11px] text-[#2D2A26]">{loginEmail || 'admin@toufiqmotion.com'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-rose-50 text-[#8C8477] hover:text-rose-600 border border-[#E0DCD4] hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
            title="Sign out of Studio"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN STUDIO WORKSPACE */}
      <div className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Selector for < lg screens */}
        <div className="lg:hidden mb-6 bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold text-sm">
              ✨
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#1E1B18]">Studio Menu</div>
              <div className="text-[10px] text-[#8C8477]">Switch panel section</div>
            </div>
          </div>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
          >
            <option value="articles">Articles ({articles.length})</option>
            <option value="pages">Pages &amp; Builder</option>
            <option value="categories">Categories &amp; Tags ({categories.length})</option>
            <option value="media">Media Library &amp; WebP Tool</option>
            <option value="appearance">Homepage Layout &amp; Identity (Appearance)</option>
            <option value="affiliate">Affiliate Marketing Hub (/go/)</option>
            <option value="seo_center">SEO Command Center (Yoast Pro)</option>
            <option value="subscribers">Newsletter ({subscribers.length})</option>
            <option value="inquiries">Inquiries &amp; Leads ({inquiries.length})</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Left Sidebar Navigation */}
          <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-20 space-y-4">
          
          {/* Studio Brand & Quick Action Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF2EB] to-[#FFE5D6] text-[#E8734A] flex items-center justify-center text-xl shadow-2xs font-bold border border-[#FFCEBA]/60">
                ✨
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-base text-[#1E1B18] truncate">
                    Toufiq Studio
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Online" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                    Yoast Active
                  </span>
                  <span className="text-[10px] text-[#8C8477]">&bull; Node.js</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2 pt-1 border-t border-[#F0ECE6]">
              <button
                onClick={openNewArticleModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>Write Story</span>
              </button>

              <button
                onClick={openNewCategoryModal}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] hover:border-[#E8734A] hover:bg-white text-[#2D2A26] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FolderPlus className="w-3.5 h-3.5 text-[#E8734A]" />
                <span>New Category</span>
              </button>
            </div>
          </div>

          {/* Clean Grouped Menu */}
          <div className="bg-white rounded-3xl p-3.5 border border-[#EDE7DF] shadow-xs space-y-4">
            
            {/* Group 1: Editorial Content */}
            <div>
              <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A39B8E]">
                Editorial Content
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'articles'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className={`w-4 h-4 ${activeTab === 'articles' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Articles</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'articles'
                      ? 'bg-white text-[#C85228] border border-[#FFCEBA]'
                      : 'bg-[#FAF8F5] text-[#8C8477] border border-[#EAE5DF]'
                  }`}>
                    {articles.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('pages')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'pages'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${activeTab === 'pages' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Pages &amp; Builder</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'pages'
                      ? 'bg-white text-[#C85228] border border-[#FFCEBA]'
                      : 'bg-[#FAF8F5] text-[#8C8477] border border-[#EAE5DF]'
                  }`}>
                    Builder
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'categories'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className={`w-4 h-4 ${activeTab === 'categories' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Categories &amp; Tags</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'categories'
                      ? 'bg-white text-[#C85228] border border-[#FFCEBA]'
                      : 'bg-[#FAF8F5] text-[#8C8477] border border-[#EAE5DF]'
                  }`}>
                    {categories.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('media')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'media'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className={`w-4 h-4 ${activeTab === 'media' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Media &amp; WebP Tool</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                    &le;250KB
                  </span>
                </button>
              </nav>
            </div>

            {/* Group 2: Site & Identity Customizer */}
            <div className="pt-2 border-t border-[#F5F2EB]">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A39B8E]">
                Design &amp; Identity
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'appearance'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutTemplate className={`w-4 h-4 ${activeTab === 'appearance' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Homepage Layout &amp; Identity</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA]">
                    Appearance
                  </span>
                </button>
              </nav>
            </div>

            {/* Group 3: Monetization & Growth */}
            <div className="pt-2 border-t border-[#F5F2EB]">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A39B8E]">
                Monetization &amp; SEO
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('affiliate')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'affiliate'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className={`w-4 h-4 ${activeTab === 'affiliate' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Affiliate Hub</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                    /go/ Links
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('seo_center')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'seo_center'
                      ? 'bg-[#ECFDF5] text-[#065F46] font-bold shadow-2xs border-l-3 border-emerald-500'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Search className={`w-4 h-4 ${activeTab === 'seo_center' ? 'text-emerald-600' : 'text-[#8C8477]'}`} />
                    <span>SEO Command Center</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Yoast Pro
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('subscribers')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'subscribers'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className={`w-4 h-4 ${activeTab === 'subscribers' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Newsletter</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'subscribers'
                      ? 'bg-white text-[#C85228] border border-[#FFCEBA]'
                      : 'bg-[#FAF8F5] text-[#8C8477] border border-[#EAE5DF]'
                  }`}>
                    {subscribers.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    activeTab === 'inquiries'
                      ? 'bg-[#FFF2EB] text-[#C85228] font-bold shadow-2xs border-l-3 border-[#E8734A]'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18] font-medium border-l-3 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${activeTab === 'inquiries' ? 'text-[#E8734A]' : 'text-[#8C8477]'}`} />
                    <span>Inquiries &amp; Leads</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    stats?.newInquiries
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-[#FAF8F5] text-[#8C8477] border border-[#EAE5DF]'
                  }`}>
                    {inquiries.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Group 4: Quick Links / System */}
            <div className="pt-2 border-t border-[#F5F2EB] space-y-1">
              <button
                onClick={() => setActivePage('home')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs text-[#6A6357] hover:bg-[#FAF8F5] hover:text-[#E8734A] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-[#8C8477] group-hover:text-[#E8734A]" />
                  <span>View Public Site</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#B5AFA4] group-hover:text-[#E8734A]" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Admin User Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EDE7DF] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1E1B18] text-[#FFF2EB] flex items-center justify-center font-bold text-xs">
                TM
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#1E1B18] leading-tight truncate">Toufiq Motion</div>
                <div className="text-[10px] text-[#8C8477] truncate">admin@toufiqmotion.com</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#FAF8F5] text-[#8C8477] border border-[#EAE5DF]">
              Admin
            </span>
          </div>

        </aside>

        {/* Right Workspace Column */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          
          {/* Workspace Top Header Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDE7DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8734A]">
                  {activeTab === 'articles' && 'Editorial Post Archive'}
                  {activeTab === 'categories' && 'Taxonomy Structure'}
                  {activeTab === 'media' && 'Digital Assets & Optimization'}
                  {activeTab === 'appearance' && 'Homepage Layout & Brand Identity'}
                  {activeTab === 'seo_center' && 'Google SERP & Optimization'}
                  {activeTab === 'subscribers' && 'Newsletter Audience'}
                  {activeTab === 'inquiries' && 'Partnership Inquiries'}
                </span>
                <span className="text-[#C5BEB3]">&bull;</span>
                <span className="text-[11px] text-[#8C8477]">
                  Toufiq Motion Studio
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                {activeTab === 'articles' && 'All Blog Articles'}
                {activeTab === 'categories' && 'Categories & Taxonomies'}
                {activeTab === 'media' && 'Media Library & WebP Optimizer'}
                {activeTab === 'appearance' && 'Homepage Layout & Identity Studio'}
                {activeTab === 'seo_center' && 'Yoast SEO Command Center'}
                {activeTab === 'subscribers' && 'Newsletter Subscribers'}
                {activeTab === 'inquiries' && 'Contact Inquiries & Leads'}
              </h1>
              <p className="text-xs text-[#8C8477] mt-1 max-w-2xl">
                {activeTab === 'articles' && 'Manage drafts, edit stories with the complete Rich Text Editor, inspect SEO scores, and publish new articles.'}
                {activeTab === 'categories' && 'Create and organize blog categories, subcategory tags, and icons dynamically stored in SQLite.'}
                {activeTab === 'media' && 'Manage photos, inspect SEO image alt texts, and compress images to WebP under 250 KB.'}
                {activeTab === 'appearance' && 'Select the active homepage design (Minimal Magazine, Clean Editorial, or Modern Card), customize brand logo, announcement banner, and footer.'}
                {activeTab === 'seo_center' && 'Real-time on-page SEO algorithms, Google SERP previews, JSON-LD schema graphs, and 301 redirects.'}
                {activeTab === 'subscribers' && 'Export and monitor email subscribers collected from editorial banners across the blog.'}
                {activeTab === 'inquiries' && 'Manage incoming collaboration pitches, sponsorship proposals, and reader messages.'}
              </p>
            </div>

            {/* Contextual Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              {activeTab === 'articles' && (
                <button
                  onClick={openNewArticleModal}
                  className="px-5 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Write Story
                </button>
              )}
              {activeTab === 'categories' && (
                <button
                  onClick={openNewCategoryModal}
                  className="px-5 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              )}
              {activeTab === 'subscribers' && (
                <button
                  onClick={handleExportSubscribers}
                  className="px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-bold text-[#4A453E] hover:border-[#E8734A] transition-all cursor-pointer shadow-2xs"
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Compact 5-Metric Quick Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Articles</span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">{stats.totalArticles}</div>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> Published
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Total Views</span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">{stats.totalViews.toLocaleString()}</div>
                <span className="text-[10px] text-[#8C8477] mt-0.5 block">Global Readers</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Categories</span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">{categories.length}</div>
                <span className="text-[10px] text-[#E8734A] font-semibold mt-0.5 block">Custom Topics</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Subscribers</span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">{stats.totalSubscribers.toLocaleString()}</div>
                <span className="text-[10px] text-[#E8734A] font-semibold mt-0.5 block">Newsletter</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Inquiries</span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">{stats.totalInquiries}</div>
                <span className="text-[10px] text-sky-600 font-semibold mt-0.5 block">{stats.newInquiries} new leads</span>
              </div>
            </div>
          )}

      {/* Tab 1: Articles Table */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#F0ECE6] flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Manage Blog Posts</h3>
            <span className="text-xs text-[#8C8477]">{articles.length} total entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#8C8477] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                  <th className="py-3 px-5">Story &amp; URL</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Yoast SEO Score</th>
                  <th className="py-3 px-4">Views &bull; Likes</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-2xs"
                        />
                        <div className="max-w-md">
                          <h4 className="font-bold text-[#1E1B18] line-clamp-1 text-sm">{article.title}</h4>
                          <span className="text-[11px] text-[#8C8477] font-mono">/{article.slug}</span>
                          {article.focusKeyword && (
                            <div className="text-[10px] text-[#E8734A] font-semibold mt-0.5">
                              Keyword: <em>{article.focusKeyword}</em>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF6EE] text-[#A06235] border border-[#EAE2D8]">
                        {article.category} &bull; {article.subcategory}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {article.seoScore || 90}/100 Good
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6A6357]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#8C8477]" /> {article.viewsCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" /> {article.likesCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#8C8477] whitespace-nowrap">{article.date}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditArticleModal(article)}
                          className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#E8734A] hover:text-white text-[#4A453E] transition-all"
                          title="Edit in Rich Editor & Yoast SEO"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-rose-600 hover:text-white text-[#4A453E] transition-all"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Category Management (Requirement 1) */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#1E1B18]">Categories &amp; Taxonomies</h3>
              <p className="text-xs text-[#8C8477]">
                Manage blog topics, subcategory tags, and icons dynamically from the database
              </p>
            </div>
            <button
              onClick={openNewCategoryModal}
              className="px-5 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold">
                      <Tag className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF6EE] text-[#A06235] border border-[#EAE2D8]">
                      {cat.articleCount || 0} Articles
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-xl text-[#1E1B18]">{cat.name}</h4>
                  <p className="text-xs text-[#8C8477] font-mono mt-0.5">slug: /{cat.slug}</p>
                  
                  {cat.description && (
                    <p className="text-xs text-[#6A6357] leading-relaxed mt-2.5">
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategories list */}
                  <div className="mt-4 pt-3 border-t border-[#F5F2EB]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C8477] block mb-2">
                      Subcategories:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories.map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#FAF8F5] text-[#4A453E] border border-[#E2DDD5]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F5F2EB] flex items-center justify-between text-xs">
                  <button
                    onClick={() => openEditCategoryModal(cat)}
                    className="text-[#E8734A] font-bold hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Category
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-[#8C8477] hover:text-rose-600 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Newsletter Subscribers */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#F0ECE6] flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Newsletter Subscribers</h3>
            <button
              onClick={() => {
                const csv = 'Email,Name,Source,SubscribedAt\n' + subscribers.map((s) => `${s.email},${s.name || ''},${s.source},${s.subscribed_at}`).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `newsletter-subscribers-${Date.now()}.csv`;
                a.click();
              }}
              className="px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-bold text-[#4A453E] hover:border-[#E8734A] transition-all"
            >
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#8C8477] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                  <th className="py-3 px-5">Subscriber</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-5">
                      <div className="font-bold text-[#1E1B18]">{sub.email}</div>
                      {sub.name && <div className="text-[11px] text-[#8C8477]">{sub.name}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#6A6357]">{sub.source}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A]">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8C8477]">{sub.subscribed_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Inquiries & Messages */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#F0ECE6]">
            <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Partnership &amp; Contact Inquiries</h3>
          </div>

          <div className="divide-y divide-[#F0ECE6]">
            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-[#8C8477] text-xs">No inquiries yet</div>
            ) : (
              inquiries.map((inq) => (
                <div key={inq.id} className="p-6 space-y-3 hover:bg-[#FAF8F5] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inq.type === 'partnership' ? 'bg-[#FFF2EB] text-[#E8734A]' : 'bg-[#F2ECE4] text-[#4A453E]'
                      }`}>
                        {inq.type}
                      </span>
                      <h4 className="font-bold text-sm text-[#1E1B18]">{inq.subject || 'Inquiry'}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg text-xs border border-[#E0DCD4] bg-white text-[#4A453E]"
                      >
                        <option value="new">New</option>
                        <option value="in_review">In Review</option>
                        <option value="resolved">Resolved</option>
                      </select>

                      <a
                        href={`mailto:${inq.email}?subject=Re: ${inq.subject || 'Toufiq Motion Inquiry'}`}
                        className="px-3 py-1 rounded-lg bg-[#E8734A] text-white text-xs font-bold hover:bg-[#D56237] transition-colors flex items-center gap-1"
                      >
                        Reply <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EDE7DF]">
                    {inq.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#8C8477]">
                    <span>From: <strong className="text-[#1E1B18]">{inq.name}</strong> ({inq.email})</span>
                    {inq.company && <span>&bull; Company: <strong>{inq.company}</strong></span>}
                    {inq.project_type && <span>&bull; Project: <strong>{inq.project_type}</strong></span>}
                    <span>&bull; Received: {inq.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Yoast-Grade SEO Command Center */}
      {activeTab === 'seo_center' && (
        <YoastSeoCommandCenter
          token={token}
          onNavigateToPost={(postId) => {
            const art = articles.find((a) => a.id === postId);
            if (art) openEditArticleModal(art);
          }}
        />
      )}

      {/* Tab: Pages Builder & Maintenance */}
      {activeTab === 'pages' && (
        <PagesManager token={token} />
      )}

      {/* Tab 6: Site Appearance (Logo, Header, Menu, Footer & Credits) */}
      {activeTab === 'appearance' && (
        <SiteAppearanceManager token={token} />
      )}

      {/* Tab 7: Media Library & WebP Optimizer (< 250 KB) */}
      {activeTab === 'media' && (
        <MediaLibrary token={token} />
      )}

      {/* Tab: Affiliate Marketing Command Center */}
      {activeTab === 'affiliate' && (
        <AffiliateManager token={token} />
      )}

        </div>
      </div>
    </div>

      {/* --- MODAL 1: WRITE / EDIT ARTICLE WITH RICH TEXT EDITOR & YOAST SEO PREMIUM --- */}
      {isArticleModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsArticleModalOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[94vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] flex flex-col overflow-hidden relative">
            
            {/* Pinned Top Bar: Article Context & Prominent Close Button */}
            <div className="px-5 sm:px-8 py-3.5 sm:py-4 bg-white/95 backdrop-blur-md border-b border-[#EAE5DF] flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold shrink-0">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1E1B18] leading-tight">
                    {editingArticleId ? 'Edit Article' : 'Write Complete Editorial Story'}
                  </h3>
                  <p className="text-xs text-[#8C8477] hidden sm:block">
                    Complete Rich Text Editor + Yoast SEO Premium Analysis Suite
                  </p>
                </div>
              </div>

              {/* Prominent High-Contrast Close Button */}
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="group flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all shadow-xs cursor-pointer"
                title="Close editor (Esc)"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#4A453E] group-hover:text-white transition-colors">
                  Close
                </span>
                <div className="w-5 h-5 rounded-full bg-white group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-[#6A6356] group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>

            {/* Scrollable Form Body with Pinned Bottom Action Bar */}
            <form onSubmit={handleSaveArticle} className="flex flex-col grow overflow-hidden">
              <div className="overflow-y-auto p-5 sm:p-8 md:p-10 space-y-8 grow">
              
              {/* Basic Article Meta */}
              <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1E1B18] block mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setArticleForm({ ...articleForm, title: newTitle });
                      if (!editingArticleId) {
                        setSeoData((prev) => ({
                          ...prev,
                          metaTitle: newTitle,
                          slug: newTitle.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-')
                        }));
                      }
                    }}
                    placeholder="e.g. The Ultimate Amalfi Coast Travel Guide"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-base font-serif text-[#1E1B18] font-bold focus:outline-hidden focus:border-[#E8734A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Dropdown (Dynamically populated from Requirement 1!) */}
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Category *</label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => {
                        const newCatName = e.target.value;
                        const catObj = categories.find(c => c.name === newCatName);
                        const firstSub = catObj && catObj.subcategories.length > 0 ? catObj.subcategories[0] : 'General';
                        setArticleForm({
                          ...articleForm,
                          category: newCatName,
                          subcategory: firstSub
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-medium focus:outline-hidden focus:border-[#E8734A]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Subcategory *</label>
                    {currentSelectedCategory && currentSelectedCategory.subcategories.length > 0 ? (
                      <select
                        value={articleForm.subcategory}
                        onChange={(e) => setArticleForm({ ...articleForm, subcategory: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-medium focus:outline-hidden focus:border-[#E8734A]"
                      >
                        {currentSelectedCategory.subcategories.map((sub, i) => (
                          <option key={i} value={sub}>{sub}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={articleForm.subcategory}
                        onChange={(e) => setArticleForm({ ...articleForm, subcategory: e.target.value })}
                        placeholder="e.g. Island Escapes"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Cover Image & Upload */}
                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Cover Image *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={articleForm.image}
                      onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-[#FFF2EB] border border-[#FFCEBA] text-xs font-bold text-[#E8734A] hover:bg-[#FFE5D6] flex items-center gap-1.5 shrink-0 shadow-2xs transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Media Library</span>
                    </button>
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-semibold text-[#4A453E] hover:border-[#E8734A] flex items-center gap-1.5 shrink-0 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? '...' : 'Upload'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {articleForm.image && (
                    <div className="mt-2.5 h-36 rounded-2xl overflow-hidden aspect-[16/9] border border-[#E0DCD4]">
                      <img src={articleForm.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Short Excerpt *</label>
                  <textarea
                    rows={2}
                    required
                    value={articleForm.excerpt}
                    onChange={(e) => {
                      const newExcerpt = e.target.value;
                      setArticleForm({ ...articleForm, excerpt: newExcerpt });
                      if (!editingArticleId && !seoData.metaDescription) {
                        setSeoData((prev) => ({ ...prev, metaDescription: newExcerpt }));
                      }
                    }}
                    placeholder="Short engaging excerpt for cards and previews..."
                    className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A] resize-none"
                  />
                </div>

                {/* Editorial Quote Callout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Quote Callout (Optional)</label>
                    <input
                      type="text"
                      value={articleForm.quote}
                      onChange={(e) => setArticleForm({ ...articleForm, quote: e.target.value })}
                      placeholder="A memorable phrase highlighted in italic..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={articleForm.tags}
                      onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                      placeholder="Italy, Coast, Summer, Photography"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured-check"
                      checked={articleForm.featured}
                      onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                      className="w-4 h-4 accent-[#E8734A]"
                    />
                    <label htmlFor="featured-check" className="text-xs font-semibold text-[#4A453E] cursor-pointer">
                      Highlight as Featured Story on Homepage
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="affiliate-check"
                      checked={articleForm.hasAffiliateLinks}
                      onChange={(e) => setArticleForm({ ...articleForm, hasAffiliateLinks: e.target.checked })}
                      className="w-4 h-4 accent-[#E8734A]"
                    />
                    <label htmlFor="affiliate-check" className="text-xs font-semibold text-[#4A453E] cursor-pointer flex items-center gap-1.5">
                      <span>🛍️ Contains Affiliate Links</span>
                      <span className="text-[10px] text-[#8C8477]">(Auto-renders FTC disclosure &amp; sponsored tags)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Requirement 2: COMPLETE RICH TEXT EDITOR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#E8734A]" /> Complete Rich Text Editor
                  </label>
                  <span className="text-xs text-[#8C8477]">
                    Headings, Formatting, Lists, Links, Tables, Image Embeds &amp; Split Preview
                  </span>
                </div>
                <RichTextEditor
                  value={htmlContent}
                  onChange={setHtmlContent}
                  token={token || undefined}
                />
              </div>

              {/* Requirement 3: HIGH-CLASS YOAST SEO PREMIUM PANEL */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#E8734A]" /> Yoast SEO Premium Analysis Suite
                  </label>
                </div>
                <YoastSeoPanel
                  seoData={seoData}
                  onChange={setSeoData}
                  articleTitle={articleForm.title}
                  articleContent={htmlContent}
                  articleImage={articleForm.image}
                  category={articleForm.category}
                />
              </div>
            </div>

            {/* Pinned Bottom Action Bar */}
            <div className="px-5 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-t border-[#EAE5DF] flex items-center justify-between shrink-0 z-20">
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6A6357] hover:text-[#1E1B18] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E0DCD4] transition-all cursor-pointer"
              >
                Cancel & Close
              </button>
              <button
                type="submit"
                disabled={formSaving}
                className="px-7 py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {formSaving ? 'Saving...' : (editingArticleId ? 'Update Article & SEO' : 'Publish Story')}
              </button>
            </div>

          </form>
        </div>
      </div>
    )}

      {/* --- MODAL 2: CREATE / EDIT CATEGORY (Requirement 1) --- */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCategoryModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#EAE5DF] flex items-center justify-between shrink-0">
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1E1B18]">
                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all cursor-pointer shadow-xs"
                title="Close"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A453E] group-hover:text-white">Close</span>
                <X className="w-3.5 h-3.5 text-[#6A6356] group-hover:text-white" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Culinary Journeys, Eco Stays"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short tagline or summary of this category..."
                  className="w-full p-3 rounded-xl bg-white border border-[#E0DCD4] text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Category Icon Name</label>
                <select
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs"
                >
                  <option value="Compass">Compass (Travel &amp; Exploration)</option>
                  <option value="Coffee">Coffee (Cafes &amp; Food)</option>
                  <option value="Heart">Heart (Wellbeing &amp; Mind)</option>
                  <option value="Sparkles">Sparkles (Inspiration &amp; Culture)</option>
                  <option value="Globe">Globe (Global Destinations)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                  Subcategories (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.subcategories}
                  onChange={(e) => setCategoryForm({ ...categoryForm, subcategories: e.target.value })}
                  placeholder="Street Food, Coffee Roasters, Fine Dining"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE5DF]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-bold text-[#6A6357] hover:text-[#1E1B18] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySaving}
                  className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  {categorySaving ? 'Saving...' : (editingCategoryId ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: MEDIA LIBRARY PICKER (Select WebP optimized asset directly into article) --- */}
      {isMediaPickerOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMediaPickerOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#EAE5DF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#1E1B18]">Select from Media Library</h3>
                  <p className="text-xs text-[#8C8477]">Click any WebP image to select as cover, or upload and auto-compress new files.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#4A453E] shadow-xs cursor-pointer"
                title="Close"
              >
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white">Close</span>
                <div className="w-5 h-5 rounded-full bg-[#FAF8F5] group-hover:bg-white/20 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 group-hover:text-white" />
                </div>
              </button>
            </div>

            <div className="overflow-y-auto p-6 grow">
              <MediaLibrary
                token={token}
                selectionMode={true}
                onSelectImage={(url) => {
                  setArticleForm((prev) => ({ ...prev, image: url }));
                  setIsMediaPickerOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
