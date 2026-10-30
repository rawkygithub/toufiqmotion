import React, { useState, useEffect } from 'react';
import { api, StatsResponse } from '../../api/client';
import { Article } from '../../data/articles';
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
  CheckCircle,
  FileText,
  Upload,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Search,
  ExternalLink
} from 'lucide-react';

export const AdminStudio: React.FC = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('toufiq_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@toufiqmotion.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<'articles' | 'subscribers' | 'inquiries' | 'analytics'>('articles');

  // Data states
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
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
    content: ''
  });
  const [formSaving, setFormSaving] = useState(false);

  // Upload image state
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsData, articlesData, subsData, inqData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getArticles({ limit: 100 }),
        api.getSubscribers(token).catch(() => ({ subscribers: [] })),
        api.getInquiries(token).catch(() => ({ inquiries: [] })),
      ]);

      if (statsData) setStats(statsData);
      setArticles(articlesData.articles);
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

  const openNewArticleModal = () => {
    setEditingArticleId(null);
    setArticleForm({
      title: '',
      category: 'Travel',
      subcategory: 'Island Escapes',
      excerpt: '',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      quote: '',
      tags: 'Travel, Summer, Escape',
      content: 'Write your story paragraphs here...\n\nSecond paragraph exploring rich details and memorable impressions.'
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
      content: article.content.join('\n\n')
    });
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormSaving(true);
    try {
      const payload = {
        title: articleForm.title,
        category: articleForm.category,
        subcategory: articleForm.subcategory,
        excerpt: articleForm.excerpt,
        image: articleForm.image,
        quote: articleForm.quote || undefined,
        tags: articleForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        content: articleForm.content.split('\n\n').map((p) => p.trim()).filter(Boolean)
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

  // If not logged in, show elegant Login Card
  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#EDE7DF] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1E1B18]">Editorial Studio</h2>
            <p className="text-xs text-[#8C8477]">
              Sign in to manage articles, subscribers, and brand partnerships
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
              className="w-full py-3 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
      </div>
    );
  }

  return (
    <div className="space-y-10 pt-2 pb-16">
      
      {/* Studio Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center text-xl shadow-xs">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                Toufiq Motion Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                Node.js Backend Active
              </span>
            </div>
            <p className="text-xs text-[#8C8477] mt-0.5">
              Live SQLite Database &bull; Real-time Content &amp; Leads Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNewArticleModal}
            className="px-5 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> New Article
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-full bg-[#FAF8F5] border border-[#E5E0D8] text-[#6A6357] hover:text-rose-600 hover:border-rose-300 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Total Articles</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">{stats.totalArticles}</div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Published
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Total Views</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              {stats.totalViews.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#8C8477]">Across 40+ countries</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Reader Likes</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              {stats.totalLikes.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-500" /> Active claps
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Subscribers</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              {stats.totalSubscribers.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#E8734A] font-semibold">Weekly Readers</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Inquiries</span>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">{stats.totalInquiries}</div>
            <span className="text-[11px] text-sky-600 font-semibold">
              {stats.newInquiries} new leads
            </span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#EAE5DF] gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'articles'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <FileText className="w-4 h-4" /> Articles ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'subscribers'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Mail className="w-4 h-4" /> Newsletter ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Users className="w-4 h-4" /> Inquiries ({inquiries.length})
        </button>
      </div>

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
                  <th className="py-3 px-5">Story</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stats</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="max-w-md">
                          <h4 className="font-bold text-[#1E1B18] line-clamp-1">{article.title}</h4>
                          <span className="text-[11px] text-[#8C8477] font-mono">/{article.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6EE] text-[#A06235] border border-[#EAE2D8]">
                        {article.category} &bull; {article.subcategory}
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
                          className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#E8734A] hover:text-white text-[#4A453E] transition-all"
                          title="Edit article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-rose-600 hover:text-white text-[#4A453E] transition-all"
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

      {/* Tab 2: Newsletter Subscribers */}
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

      {/* Tab 3: Inquiries & Messages */}
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

      {/* Article Creation / Editing Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
              <h3 className="font-serif font-bold text-2xl text-[#1E1B18]">
                {editingArticleId ? 'Edit Blog Article' : 'Write New Article'}
              </h3>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="text-[#8C8477] hover:text-[#1E1B18] text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. A Scenic Journey Along the Coast of Portugal"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Category *</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Health & Wellbeing">Health &amp; Wellbeing</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Subcategory *</label>
                  <input
                    type="text"
                    required
                    value={articleForm.subcategory}
                    onChange={(e) => setArticleForm({ ...articleForm, subcategory: e.target.value })}
                    placeholder="e.g. Island Escapes, Food & Coffee, Sleep"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Featured Cover Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={articleForm.image}
                    onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs font-semibold text-[#4A453E] hover:border-[#E8734A] flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                {articleForm.image && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden aspect-[16/9] border border-[#E0DCD4]">
                    <img src={articleForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Excerpt / Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Short engaging introduction to appear on cards..."
                  className="w-full p-3 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Editorial Quote Callout (Optional)</label>
                <input
                  type="text"
                  value={articleForm.quote}
                  onChange={(e) => setArticleForm({ ...articleForm, quote: e.target.value })}
                  placeholder="A memorable phrase highlighted in italic..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                  placeholder="Italy, Coast, Summer, Photography"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                  Article Body Content (Separate paragraphs with double Enter)
                </label>
                <textarea
                  rows={6}
                  required
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Paragraph 1...&#10;&#10;Paragraph 2..."
                  className="w-full p-3.5 rounded-xl bg-white border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE5DF]">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6A6357] hover:text-[#1E1B18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-7 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                >
                  {formSaving ? 'Publishing...' : (editingArticleId ? 'Update Article' : 'Publish Story')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

