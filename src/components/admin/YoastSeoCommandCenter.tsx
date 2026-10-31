import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Code2,
  Bot,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Copy,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Check,
  X,
  FileText,
  Sparkles,
  Send,
  Network,
  CornerDownRight,
  Filter,
  Eye,
  ArrowUpRight,
  Sliders,
  Calendar,
  Smartphone,
  Monitor
} from 'lucide-react';
import { api } from '../../api/client';

interface YoastSeoCommandCenterProps {
  token: string | null;
  onNavigateToPost?: (postId: string) => void;
}

export const YoastSeoCommandCenter: React.FC<YoastSeoCommandCenterProps> = ({
  token,
  onNavigateToPost
}) => {
  // Navigation tabs (Matches User Screenshot: 6 Tabs)
  const [activeTab, setActiveTab] = useState<
    'audit' | 'redirects' | 'global_serp' | 'schema' | 'robots_sitemap' | 'search_console'
  >('audit');

  // Overview stats (4 KPI Cards in Screenshot)
  const [overview, setOverview] = useState<{
    siteSeoHealth: number;
    grade: string;
    totalIndexedUrls: number;
    breakdown: { articles: number; categories: number; staticPages: number };
    activeRedirectsCount: number;
    crawlErrorsCount: number;
    sitemapUrl: string;
    lastPingedAt: string;
  }>({
    siteSeoHealth: 88,
    grade: 'Grade A+',
    totalIndexedUrls: 24,
    breakdown: { articles: 15, categories: 4, staticPages: 5 },
    activeRedirectsCount: 11,
    crawlErrorsCount: 8,
    sitemapUrl: 'http://localhost:3000/sitemap.xml',
    lastPingedAt: new Date().toISOString()
  });

  // Notification Banner (Matches User Screenshot: Green Notification)
  const [notification, setNotification] = useState<string | null>(
    'Search engines notified! Dynamic sitemap: http://localhost:3000/sitemap.xml'
  );
  const [isPinging, setIsPinging] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tab 1: Audit state
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'good' | 'improvements' | 'poor' | 'noindex'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Quick Edit SEO Modal
  const [editingAuditItem, setEditingAuditItem] = useState<any | null>(null);
  const [quickSeoForm, setQuickSeoForm] = useState({
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    noIndex: false
  });
  const [isSavingQuickSeo, setIsSavingQuickSeo] = useState(false);

  // Tab 2: Redirects & 404 Monitor state
  const [redirectSubTab, setRedirectSubTab] = useState<'redirects' | 'crawl_errors'>('redirects');
  const [redirects, setRedirects] = useState<any[]>([]);
  const [crawlErrors, setCrawlErrors] = useState<any[]>([]);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [editingRedirectId, setEditingRedirectId] = useState<string | null>(null);
  const [redirectForm, setRedirectForm] = useState({
    sourcePath: '',
    targetPath: '',
    redirectCode: 301,
    notes: ''
  });

  // Tab 3: Global SERP state
  const [serpPreviewMode, setSerpPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [serpSettings, setSerpSettings] = useState({
    site_title_format: '%title% — Toufiq Motion Editorial',
    meta_description:
      'Toufiq Motion is an editorial lifestyle, mindful wellbeing and world travel journal with luminous photography and thoughtful stories.',
    canonical_domain: 'https://toufiqmotion.com',
    og_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    twitter_card: 'summary_large_image',
    google_site_verification: 'google-site-verification=toufiqmotion2026seo',
    bing_site_verification: 'bing-verification-toufiq2026'
  });
  const [isSavingSerp, setIsSavingSerp] = useState(false);

  // Tab 4: Schema Knowledge Graph state
  const [schemaSettings, setSchemaSettings] = useState({
    knowledge_type: 'Organization',
    knowledge_name: 'Toufiq Motion',
    knowledge_logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    knowledge_founder: 'Toufiq Motion',
    knowledge_email: 'hello@toufiqmotion.com',
    socials: [
      'https://instagram.com/toufiqmotion',
      'https://youtube.com/@toufiqmotion',
      'https://twitter.com/toufiqmotion',
      'https://pinterest.com/toufiqmotion'
    ]
  });
  const [isCopiedJsonLd, setIsCopiedJsonLd] = useState(false);
  const [isSavingSchema, setIsSavingSchema] = useState(false);

  // Tab 5: Robots.txt & XML Sitemap state
  const [robotsTxt, setRobotsTxt] = useState(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: http://localhost:3000/sitemap.xml`
  );
  const [isSavingRobots, setIsSavingRobots] = useState(false);
  const [isXmlPreviewOpen, setIsXmlPreviewOpen] = useState(false);

  // Tab 6: Search Console & Indexing state
  const [indexingUrl, setIndexingUrl] = useState('');
  const [indexingEngine, setIndexingEngine] = useState('Google Indexing API');
  const [indexingAction, setIndexingAction] = useState('URL_UPDATED');
  const [indexingLogs, setIndexingLogs] = useState<any[]>([]);
  const [searchQueries, setSearchQueries] = useState<any[]>([]);
  const [isSubmittingIndex, setIsSubmittingIndex] = useState(false);

  // Initial Load
  useEffect(() => {
    loadAllSeoData();
  }, []);

  const loadAllSeoData = async () => {
    setLoading(true);
    try {
      // 1. Overview
      try {
        const ov = await api.getSeoOverview();
        setOverview(ov);
      } catch (err) {
        console.warn('Overview err:', err);
      }

      // 2. Audit
      try {
        const audit = await api.getSeoAudit();
        setAuditItems(audit.auditItems || []);
      } catch (err) {
        console.warn('Audit err:', err);
      }

      // 3. Redirects & 404s
      try {
        const [redRes, errRes] = await Promise.all([api.getSeoRedirects(), api.getSeoCrawlErrors()]);
        setRedirects(redRes.redirects || []);
        setCrawlErrors(errRes.errors || []);
      } catch (err) {
        console.warn('Redirects err:', err);
      }

      // 4. Settings
      try {
        const sett = await api.getSeoSettings();
        if (sett.settings) {
          setSerpSettings((prev) => ({
            ...prev,
            site_title_format: sett.settings.site_title_format || prev.site_title_format,
            meta_description: sett.settings.meta_description || prev.meta_description,
            canonical_domain: sett.settings.canonical_domain || prev.canonical_domain,
            og_image: sett.settings.og_image || prev.og_image,
            twitter_card: sett.settings.twitter_card || prev.twitter_card,
            google_site_verification: sett.settings.google_site_verification || prev.google_site_verification,
            bing_site_verification: sett.settings.bing_site_verification || prev.bing_site_verification
          }));

          if (sett.settings.robots_txt) {
            setRobotsTxt(sett.settings.robots_txt);
          }

          let parsedSocials = schemaSettings.socials;
          if (sett.settings.knowledge_socials_json) {
            try {
              parsedSocials = JSON.parse(sett.settings.knowledge_socials_json);
            } catch {}
          }

          setSchemaSettings((prev) => ({
            ...prev,
            knowledge_type: sett.settings.knowledge_type || prev.knowledge_type,
            knowledge_name: sett.settings.knowledge_name || prev.knowledge_name,
            knowledge_logo: sett.settings.knowledge_logo || prev.knowledge_logo,
            knowledge_founder: sett.settings.knowledge_founder || prev.knowledge_founder,
            knowledge_email: sett.settings.knowledge_email || prev.knowledge_email,
            socials: parsedSocials
          }));
        }
      } catch (err) {
        console.warn('Settings err:', err);
      }

      // 5. Search Console Queries & Indexing Logs
      try {
        const [logsRes, queriesRes] = await Promise.all([
          api.getSeoIndexingLogs(),
          api.getSeoSearchQueries()
        ]);
        setIndexingLogs(logsRes.logs || []);
        setSearchQueries(queriesRes.queries || []);
      } catch (err) {
        console.warn('Console err:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Top action: Ping Google / Bing
  const handlePingSearchEngines = async () => {
    setIsPinging(true);
    try {
      const res = await api.pingSearchEngines();
      setNotification(`Search engines notified! Dynamic sitemap: ${res.sitemapUrl}`);
      setOverview((prev) => ({
        ...prev,
        lastPingedAt: res.timestamp,
        sitemapUrl: res.sitemapUrl
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to ping search engines');
    } finally {
      setIsPinging(false);
    }
  };

  // Tab 1: Re-analyze SEO
  const handleReanalyzeAll = async () => {
    if (!token) return alert('Admin authentication required');
    setIsReanalyzing(true);
    try {
      const res = await api.reanalyzeSeo(token);
      alert(res.message);
      loadAllSeoData();
    } catch (err: any) {
      alert(err.message || 'Failed to re-analyze');
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Tab 1: Quick Edit SEO Modal
  const openQuickSeoModal = (item: any) => {
    setEditingAuditItem(item);
    setQuickSeoForm({
      focusKeyword: item.focusKeyword || '',
      metaTitle: item.metaTitle || item.title,
      metaDescription: item.metaDescription || '',
      canonicalUrl: item.canonicalUrl || `https://toufiqmotion.com/${item.slug}`,
      noIndex: Boolean(item.noIndex)
    });
  };

  const handleSaveQuickSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingAuditItem) return;
    setIsSavingQuickSeo(true);
    try {
      await api.updateArticleSeo(token, editingAuditItem.id, quickSeoForm);
      setEditingAuditItem(null);
      loadAllSeoData();
    } catch (err: any) {
      alert(err.message || 'Failed to update article SEO');
    } finally {
      setIsSavingQuickSeo(false);
    }
  };

  // Tab 2: Redirects Manager
  const openNewRedirectModal = (initialSource: string = '') => {
    setEditingRedirectId(null);
    setRedirectForm({
      sourcePath: initialSource,
      targetPath: '',
      redirectCode: 301,
      notes: initialSource ? 'Resolved from 404 crawl error log' : ''
    });
    setIsRedirectModalOpen(true);
  };

  const openEditRedirectModal = (r: any) => {
    setEditingRedirectId(r.id);
    setRedirectForm({
      sourcePath: r.source_path,
      targetPath: r.target_path,
      redirectCode: r.redirect_code || 301,
      notes: r.notes || ''
    });
    setIsRedirectModalOpen(true);
  };

  const handleSaveRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Admin authentication required');
    try {
      if (editingRedirectId) {
        await api.updateSeoRedirect(token, editingRedirectId, redirectForm);
      } else {
        await api.createSeoRedirect(token, redirectForm);
      }
      setIsRedirectModalOpen(false);
      loadAllSeoData();
    } catch (err: any) {
      alert(err.message || 'Failed to save redirect');
    }
  };

  const handleDeleteRedirect = async (id: string, path: string) => {
    if (!token) return;
    if (!confirm(`Delete 301 redirect for ${path}?`)) return;
    try {
      await api.deleteSeoRedirect(token, id);
      loadAllSeoData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete redirect');
    }
  };

  const handleResolveCrawlError = async (id: string) => {
    if (!token) return;
    try {
      await api.resolveSeoCrawlError(token, id);
      setCrawlErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e)));
    } catch (err: any) {
      alert(err.message || 'Failed to resolve error');
    }
  };

  const handleClearCrawlErrors = async () => {
    if (!token) return;
    try {
      await api.clearSeoCrawlErrors(token);
      loadAllSeoData();
    } catch (err: any) {
      alert(err.message || 'Failed to clear');
    }
  };

  // Tab 3: Save Global SERP
  const handleSaveSerp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Admin authentication required');
    setIsSavingSerp(true);
    try {
      await api.saveSeoSettings(token, serpSettings);
      alert('Global SERP & Canonical configurations saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save SERP settings');
    } finally {
      setIsSavingSerp(false);
    }
  };

  // Tab 4: Save Schema Knowledge Graph
  const handleSaveSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Admin authentication required');
    setIsSavingSchema(true);
    try {
      await api.saveSeoSettings(token, {
        knowledge_type: schemaSettings.knowledge_type,
        knowledge_name: schemaSettings.knowledge_name,
        knowledge_logo: schemaSettings.knowledge_logo,
        knowledge_founder: schemaSettings.knowledge_founder,
        knowledge_email: schemaSettings.knowledge_email,
        knowledge_socials_json: JSON.stringify(schemaSettings.socials)
      });
      alert('Schema.org Knowledge Graph saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save schema');
    } finally {
      setIsSavingSchema(false);
    }
  };

  // Tab 5: Save Robots.txt
  const handleSaveRobots = async () => {
    if (!token) return alert('Admin authentication required');
    setIsSavingRobots(true);
    try {
      await api.saveSeoSettings(token, { robots_txt: robotsTxt });
      alert('Robots.txt deployed live to /robots.txt!');
    } catch (err: any) {
      alert(err.message || 'Failed to save robots.txt');
    } finally {
      setIsSavingRobots(false);
    }
  };

  // Tab 6: Submit Instant Indexing
  const handleSubmitIndexing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Admin authentication required');
    if (!indexingUrl) return alert('Please enter a valid URL');
    setIsSubmittingIndex(true);
    try {
      const res = await api.submitIndexingUrl(token, {
        url: indexingUrl,
        engine: indexingEngine,
        action: indexingAction
      });
      setIndexingLogs([res.log, ...indexingLogs]);
      setIndexingUrl('');
      alert(`URL queued for instant crawl by ${indexingEngine}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit indexing');
    } finally {
      setIsSubmittingIndex(false);
    }
  };

  // Filtered Audit Items
  const filteredAuditItems = auditItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(auditSearch.toLowerCase()) ||
      item.slug.toLowerCase().includes(auditSearch.toLowerCase()) ||
      item.focusKeyword.toLowerCase().includes(auditSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (auditFilter === 'good') return item.seoScore >= 80;
    if (auditFilter === 'improvements') return item.seoScore >= 50 && item.seoScore < 80;
    if (auditFilter === 'poor') return item.seoScore < 50;
    if (auditFilter === 'noindex') return item.noIndex;
    return true;
  });

  // Dynamic Schema.org JSON-LD string
  const generatedJsonLd = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': schemaSettings.knowledge_type,
          '@id': `${serpSettings.canonical_domain}/#organization`,
          name: schemaSettings.knowledge_name,
          url: serpSettings.canonical_domain,
          logo: {
            '@type': 'ImageObject',
            url: schemaSettings.knowledge_logo
          },
          sameAs: schemaSettings.socials
        },
        {
          '@type': 'WebSite',
          '@id': `${serpSettings.canonical_domain}/#website`,
          url: serpSettings.canonical_domain,
          name: schemaSettings.knowledge_name,
          publisher: {
            '@id': `${serpSettings.canonical_domain}/#organization`
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${serpSettings.canonical_domain}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'Blog',
          '@id': `${serpSettings.canonical_domain}/#blog`,
          name: `${schemaSettings.knowledge_name} Editorial Journal`,
          description: serpSettings.meta_description,
          publisher: {
            '@id': `${serpSettings.canonical_domain}/#organization`
          }
        }
      ]
    },
    null,
    2
  );

  return (
    <div className="bg-[#070D18] text-slate-100 rounded-3xl p-6 sm:p-8 border border-[#162338] shadow-2xl space-y-6">
      
      {/* 1. TOP HEADER & QUICK ACTION PILLS (Matches User Screenshot) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#16243A] pb-6">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Search className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Yoast-Grade SEO Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-relaxed">
              Real-time on-page SEO algorithms, Google SERP previews, rich JSON-LD schema graphs, 301 redirect manager, and crawl error monitoring.
            </p>
          </div>
        </div>

        {/* Action Buttons in Screenshot */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={handlePingSearchEngines}
            disabled={isPinging}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
            title="Send dynamic sitemap to Google & Bing indexing crawlers"
          >
            <Send className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging...' : 'Ping Google / Bing'}</span>
          </button>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Network className="w-3.5 h-3.5" />
            <span>View Live Sitemap.xml</span>
          </a>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>View Robots.txt</span>
          </a>
        </div>
      </div>

      {/* 2. NOTIFICATION BANNER (Matches User Screenshot: Green Notification Banner) */}
      {notification && (
        <div className="bg-[#0A261C] border border-emerald-500/40 text-emerald-300 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-950/40 text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. 4 KPI SUMMARY CARDS (Matches User Screenshot: Green, Yellow, Blue, Red borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Green Border - Site SEO Health */}
        <div className="bg-[#0B1522] border-2 border-emerald-500/50 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Site SEO Health</span>
            <ShieldCheck className="w-7 h-7 text-emerald-500/50" />
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
              {overview.siteSeoHealth}%
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {overview.grade}
            </span>
          </div>
        </div>

        {/* Card 2: Yellow Border - Indexed URLs in Sitemap */}
        <div className="bg-[#0B1522] border-2 border-amber-500/50 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-amber-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Indexed URLs in Sitemap</span>
            <Network className="w-7 h-7 text-amber-500/50" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
              {overview.totalIndexedUrls}
            </span>
            <span className="text-xs text-amber-300/80 font-medium">
              ({overview.breakdown.articles} Articles, {overview.breakdown.categories} Categories)
            </span>
          </div>
        </div>

        {/* Card 3: Blue/Cyan Border - Active 301 Redirects */}
        <div className="bg-[#0B1522] border-2 border-cyan-500/50 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-cyan-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Active 301 Redirects</span>
            <CornerDownRight className="w-7 h-7 text-cyan-500/50" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 tracking-tight">
              {overview.activeRedirectsCount}
            </span>
            <span className="text-xs text-cyan-300/80 font-medium">Link Juice Saved</span>
          </div>
        </div>

        {/* Card 4: Red/Rose Border - 404 Crawl Error Logs */}
        <div className="bg-[#0B1522] border-2 border-rose-500/50 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-rose-950/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">404 Crawl Error Logs</span>
            <AlertTriangle className="w-7 h-7 text-rose-500/50" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-rose-400 tracking-tight">
              {overview.crawlErrorsCount}
            </span>
            <span className="text-xs text-rose-300/80 font-medium">Monitored</span>
          </div>
        </div>
      </div>

      {/* 4. THE 6 NAVIGATION TABS (Matches User Screenshot) */}
      <div className="flex border-b border-[#1A2840] gap-2 overflow-x-auto no-scrollbar pt-2">
        
        {/* Tab 1 */}
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Site SEO Content Audit ({auditItems.length})</span>
        </button>

        {/* Tab 2 */}
        <button
          onClick={() => setActiveTab('redirects')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'redirects'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CornerDownRight className="w-4 h-4 text-cyan-400" />
          <span>301 Redirects &amp; 404 Monitor</span>
          {crawlErrors.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
              {crawlErrors.length}
            </span>
          )}
        </button>

        {/* Tab 3 */}
        <button
          onClick={() => setActiveTab('global_serp')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'global_serp'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Global SERP &amp; Canonical</span>
        </button>

        {/* Tab 4 */}
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'schema'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span>&lt;/&gt; Schema.org Knowledge Graph</span>
        </button>

        {/* Tab 5 */}
        <button
          onClick={() => setActiveTab('robots_sitemap')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'robots_sitemap'
              ? 'border-sky-500 text-sky-400 bg-sky-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4 text-sky-400" />
          <span>Robots.txt &amp; XML Sitemap</span>
        </button>

        {/* Tab 6 */}
        <button
          onClick={() => setActiveTab('search_console')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'search_console'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Search Console &amp; Analytics</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SITE SEO CONTENT AUDIT
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A1322] p-4 rounded-2xl border border-[#162338]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit by title, slug, or focus keyphrase..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#070D18] border border-[#1E2E48] rounded-xl p-1 text-xs">
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    auditFilter === 'all' ? 'bg-[#16253C] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({auditItems.length})
                </button>
                <button
                  onClick={() => setAuditFilter('good')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    auditFilter === 'good' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Good SEO (80+)
                </button>
                <button
                  onClick={() => setAuditFilter('improvements')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    auditFilter === 'improvements' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Needs Work (50-79)
                </button>
              </div>

              <button
                onClick={handleReanalyzeAll}
                disabled={isReanalyzing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>Re-Audit All</span>
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-[#0A1322] rounded-2xl border border-[#162338] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#070D18] text-slate-400 uppercase tracking-wider text-[11px] border-b border-[#162338]">
                    <th className="py-3 px-5">Story &amp; URL</th>
                    <th className="py-3 px-4">Focus Keyphrase</th>
                    <th className="py-3 px-4">SEO Score</th>
                    <th className="py-3 px-4">Readability</th>
                    <th className="py-3 px-4">Snippet Status</th>
                    <th className="py-3 px-4">Index Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#131F33]">
                  {filteredAuditItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#0E1B2E] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#1E2E48]"
                          />
                          <div className="max-w-xs">
                            <h4 className="font-bold text-white line-clamp-1">{item.title}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">/{item.slug}</span>
                            <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-[#16253C] text-slate-300">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {item.focusKeyword ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#16263F] text-amber-300 border border-amber-500/20">
                            {item.focusKeyword}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No keyword set</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                            item.seoScore >= 80
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.seoScore >= 50
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.seoScore}/100
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            item.readabilityScore >= 80
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {item.readabilityScore}% Good
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.metaDescStatus === 'good'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : item.metaDescStatus === 'missing'
                                ? 'bg-rose-500/15 text-rose-300'
                                : 'bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            {item.metaDescStatus === 'good' && 'Optimal (120-160 chars)'}
                            {item.metaDescStatus === 'short' && `${item.metaDescLength} chars (Too short)`}
                            {item.metaDescStatus === 'long' && `${item.metaDescLength} chars (Too long)`}
                            {item.metaDescStatus === 'missing' && 'Missing Description'}
                          </span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            {item.keyphraseInTitle ? (
                              <span className="text-emerald-400">✓ In title</span>
                            ) : (
                              <span className="text-slate-500">✗ Title miss</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.noIndex ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {item.indexStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openQuickSeoModal(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#142338] hover:bg-[#1B2F4C] text-emerald-400 hover:text-emerald-300 border border-[#213554] transition-all"
                        >
                          Quick Edit SEO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 301 REDIRECTS & 404 MONITOR
          ========================================================================= */}
      {activeTab === 'redirects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#162338] pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRedirectSubTab('redirects')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  redirectSubTab === 'redirects'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Active 301 Redirects ({redirects.length})
              </button>
              <button
                onClick={() => setRedirectSubTab('crawl_errors')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  redirectSubTab === 'crawl_errors'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>404 Crawl Error Logs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                  {crawlErrors.length}
                </span>
              </button>
            </div>

            {redirectSubTab === 'redirects' ? (
              <button
                onClick={() => openNewRedirectModal()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create 301 Redirect</span>
              </button>
            ) : (
              <button
                onClick={handleClearCrawlErrors}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
              >
                Clear Resolved Logs
              </button>
            )}
          </div>

          {/* Sub-view 1: Active 301 Redirects */}
          {redirectSubTab === 'redirects' && (
            <div className="bg-[#0A1322] rounded-2xl border border-[#162338] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#070D18] text-slate-400 uppercase tracking-wider text-[11px] border-b border-[#162338]">
                    <th className="py-3 px-5">Source URL Path</th>
                    <th className="py-3 px-4">Target Destination URL</th>
                    <th className="py-3 px-4">Redirect Code</th>
                    <th className="py-3 px-4">Hits Saved</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#131F33]">
                  {redirects.map((r) => (
                    <tr key={r.id} className="hover:bg-[#0E1B2E] transition-colors">
                      <td className="py-3.5 px-5 font-mono text-cyan-300">{r.source_path}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-300 flex items-center gap-1.5">
                        <CornerDownRight className="w-3 h-3 text-emerald-400" />
                        <span>{r.target_path}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {r.redirect_code} Permanent
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {r.hits_count.toLocaleString()} clicks
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">{r.notes || '—'}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <a
                          href={r.source_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#142338] text-cyan-400 hover:text-white transition-colors inline-block"
                          title="Test live redirect"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openEditRedirectModal(r)}
                          className="p-1.5 rounded-lg bg-[#142338] text-slate-300 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRedirect(r.id, r.source_path)}
                          className="p-1.5 rounded-lg bg-[#142338] text-rose-400 hover:text-rose-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub-view 2: 404 Crawl Error Logs */}
          {redirectSubTab === 'crawl_errors' && (
            <div className="space-y-3">
              <div className="bg-[#1F141A] border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  The 404 Crawl Monitor tracks every broken link or dead URL accessed by Googlebot, Bingbot, or external backlinks. Click <strong>"Fix with 301 Redirect"</strong> to immediately preserve SEO link juice.
                </span>
              </div>

              <div className="bg-[#0A1322] rounded-2xl border border-[#162338] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#070D18] text-slate-400 uppercase tracking-wider text-[11px] border-b border-[#162338]">
                      <th className="py-3 px-5">Dead / Missing URL Path</th>
                      <th className="py-3 px-4">Hits Count</th>
                      <th className="py-3 px-4">Detected Referer &amp; Crawler</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131F33]">
                    {crawlErrors.map((err) => (
                      <tr key={err.id} className="hover:bg-[#0E1B2E] transition-colors">
                        <td className="py-3.5 px-5 font-mono text-rose-300">{err.path}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{err.hits_count} misses</td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                          {err.user_agent || err.referer || 'Search Crawler'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              err.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {err.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => openNewRedirectModal(err.path)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
                          >
                            Fix with 301 Redirect
                          </button>
                          {err.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveCrawlError(err.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#142338] text-slate-300 hover:text-white"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: GLOBAL SERP & CANONICAL
          ========================================================================= */}
      {activeTab === 'global_serp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Form */}
          <form onSubmit={handleSaveSerp} className="lg:col-span-7 space-y-4">
            <div className="bg-[#0A1322] rounded-2xl p-6 border border-[#162338] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Global Site Metadata &amp; Search Identity
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Site Title Format Template
                </label>
                <input
                  type="text"
                  value={serpSettings.site_title_format}
                  onChange={(e) => setSerpSettings({ ...serpSettings, site_title_format: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400">
                  Variables available: <code>%title%</code>, <code>%sitename%</code>, <code>%category%</code>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">Global Default Meta Description</label>
                  <span
                    className={`text-[11px] font-bold ${
                      serpSettings.meta_description.length >= 120 && serpSettings.meta_description.length <= 160
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {serpSettings.meta_description.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={serpSettings.meta_description}
                  onChange={(e) => setSerpSettings({ ...serpSettings, meta_description: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Primary Canonical Domain</label>
                <input
                  type="text"
                  value={serpSettings.canonical_domain}
                  onChange={(e) => setSerpSettings({ ...serpSettings, canonical_domain: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Default Social Share Image (Open Graph)</label>
                <input
                  type="text"
                  value={serpSettings.og_image}
                  onChange={(e) => setSerpSettings({ ...serpSettings, og_image: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Google Site Verification Tag</label>
                  <input
                    type="text"
                    value={serpSettings.google_site_verification}
                    onChange={(e) => setSerpSettings({ ...serpSettings, google_site_verification: e.target.value })}
                    className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Bing Webmaster Verification Tag</label>
                  <input
                    type="text"
                    value={serpSettings.bing_site_verification}
                    onChange={(e) => setSerpSettings({ ...serpSettings, bing_site_verification: e.target.value })}
                    className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSerp}
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                {isSavingSerp ? 'Saving...' : 'Save Global SERP Settings'}
              </button>
            </div>
          </form>

          {/* Live Google SERP Snippet Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0A1322] rounded-2xl p-6 border border-[#162338] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Google SERP Preview
                </h4>
                <div className="flex items-center bg-[#070D18] rounded-lg p-1 border border-[#1E2E48] text-xs">
                  <button
                    onClick={() => setSerpPreviewMode('desktop')}
                    className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold ${
                      serpPreviewMode === 'desktop' ? 'bg-[#16253C] text-white' : 'text-slate-400'
                    }`}
                  >
                    <Monitor className="w-3 h-3" /> Desktop
                  </button>
                  <button
                    onClick={() => setSerpPreviewMode('mobile')}
                    className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold ${
                      serpPreviewMode === 'mobile' ? 'bg-[#16253C] text-white' : 'text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> Mobile
                  </button>
                </div>
              </div>

              {/* SERP Card */}
              <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center">
                    TM
                  </div>
                  <div className="leading-tight">
                    <span className="text-[12px] font-semibold text-slate-900 block">Toufiq Motion</span>
                    <span className="text-[10px] text-slate-500 font-mono">{serpSettings.canonical_domain}</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                  {serpSettings.site_title_format.replace('%title%', 'Stories of Movement & Light')}
                </h3>

                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                  {serpSettings.meta_description}
                </p>
              </div>

              {/* Open Graph Card */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-400 block">Social Share (Open Graph) Preview</span>
                <div className="bg-[#070D18] border border-[#1E2E48] rounded-xl overflow-hidden shadow-md">
                  <img src={serpSettings.og_image} alt="OG" className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">TOUFIQMOTION.COM</span>
                    <h5 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                      {serpSettings.site_title_format.replace('%title%', 'Stories of Movement & Light')}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{serpSettings.meta_description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SCHEMA.ORG KNOWLEDGE GRAPH
          ========================================================================= */}
      {activeTab === 'schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveSchema} className="lg:col-span-6 space-y-4">
            <div className="bg-[#0A1322] rounded-2xl p-6 border border-[#162338] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Entity &amp; Knowledge Graph Configuration
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Schema Entity Type</label>
                <select
                  value={schemaSettings.knowledge_type}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_type: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Organization">Organization (Publishing Media House)</option>
                  <option value="Person">Person (Independent Visual Journalist)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Entity Legal Brand Name</label>
                <input
                  type="text"
                  value={schemaSettings.knowledge_name}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_name: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Official Brand Logo URL</label>
                <input
                  type="text"
                  value={schemaSettings.knowledge_logo}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_logo: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Founder &amp; Chief Editor</label>
                <input
                  type="text"
                  value={schemaSettings.knowledge_founder}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_founder: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Connected Social Profiles (SameAs Graph)
                </label>
                {schemaSettings.socials.map((social, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={social}
                      onChange={(e) => {
                        const next = [...schemaSettings.socials];
                        next[idx] = e.target.value;
                        setSchemaSettings({ ...schemaSettings, socials: next });
                      }}
                      className="flex-1 bg-[#070D18] border border-[#1E2E48] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = schemaSettings.socials.filter((_, i) => i !== idx);
                        setSchemaSettings({ ...schemaSettings, socials: next });
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setSchemaSettings({
                      ...schemaSettings,
                      socials: [...schemaSettings.socials, 'https://linkedin.com/in/toufiqmotion']
                    })
                  }
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Social Profile
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingSchema}
                className="w-full py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                {isSavingSchema ? 'Saving...' : 'Deploy Knowledge Graph'}
              </button>
            </div>
          </form>

          {/* JSON-LD Live Viewer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#0A1322] rounded-2xl p-6 border border-[#162338] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live JSON-LD Graph Payload
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedJsonLd);
                      setIsCopiedJsonLd(true);
                      setTimeout(() => setIsCopiedJsonLd(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#16253C] text-indigo-300 hover:text-white flex items-center gap-1"
                  >
                    {isCopiedJsonLd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedJsonLd ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 flex items-center gap-1"
                  >
                    <span>Test on Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="bg-[#050912] rounded-xl p-4 border border-[#162338] font-mono text-[11px] text-indigo-200 overflow-x-auto max-h-[460px] leading-relaxed">
                <pre>{generatedJsonLd}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ROBOTS.TXT & XML SITEMAP
          ========================================================================= */}
      {activeTab === 'robots_sitemap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Robots.txt Editor */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#0A1322] rounded-2xl p-6 border border-[#162338] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Live Robots.txt Deployment
                </h3>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Open live</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setRobotsTxt(
                      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: http://localhost:3000/sitemap.xml`
                    )
                  }
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] text-slate-300 text-[10px] font-semibold"
                >
                  Standard Production
                </button>
                <button
                  type="button"
                  onClick={() => setRobotsTxt(`User-agent: *\nDisallow: /`)}
                  className="px-2.5 py-1 rounded bg-[#16253C] hover:bg-[#1E3250] text-slate-300 text-[10px] font-semibold"
                >
                  Staging / No-Index
                </button>
              </div>

              <textarea
                rows={10}
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="w-full bg-[#050912] border border-[#162338] rounded-xl p-4 font-mono text-xs text-sky-200 focus:outline-none focus:border-sky-500 leading-relaxed"
              />

              <button
                onClick={handleSaveRobots}
                disabled={isSavingRobots}
                className="w-full py-3 rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                {isSavingRobots ? 'Deploying...' : 'Save & Deploy robots.txt'}
              </button>
            </div>
          </div>

          {/* XML Sitemap Inspector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#0A1322] rounded-2xl p-6 border border-[#162338] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Network className="w-4 h-4" /> Dynamic XML Sitemap Protocol
                </h3>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>View live /sitemap.xml</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-[#0B1B18] border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Engine Status: Live &amp; Real-Time</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">XML 0.9 Protocol</span>
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  The sitemap is computed dynamically on request from SQLite, automatically including all published stories, categories, and core landing pages without caching delays.
                </p>
              </div>

              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Included Slices</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#070D18] p-3 rounded-xl border border-[#162338] flex items-center justify-between">
                    <span className="text-slate-400">Articles / Posts:</span>
                    <span className="font-bold text-white">{overview.breakdown.articles} (Priority 0.90)</span>
                  </div>
                  <div className="bg-[#070D18] p-3 rounded-xl border border-[#162338] flex items-center justify-between">
                    <span className="text-slate-400">Categories:</span>
                    <span className="font-bold text-white">{overview.breakdown.categories} (Priority 0.85)</span>
                  </div>
                  <div className="bg-[#070D18] p-3 rounded-xl border border-[#162338] flex items-center justify-between">
                    <span className="text-slate-400">Static Pages:</span>
                    <span className="font-bold text-white">{overview.breakdown.staticPages} (Priority 1.0)</span>
                  </div>
                  <div className="bg-[#070D18] p-3 rounded-xl border border-[#162338] flex items-center justify-between">
                    <span className="text-slate-400">Total URLs:</span>
                    <span className="font-bold text-emerald-400">{overview.totalIndexedUrls} URLs</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePingSearchEngines}
                disabled={isPinging}
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Sitemap to Google &amp; Bing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SEARCH CONSOLE & ANALYTICS
          ========================================================================= */}
      {activeTab === 'search_console' && (
        <div className="space-y-6">
          {/* Performance Overview Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0A1322] border border-[#162338] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Clicks</span>
              <div className="text-2xl font-bold text-emerald-400">12,480</div>
              <span className="text-[11px] text-emerald-300 font-semibold">+18.4% last 28 days</span>
            </div>
            <div className="bg-[#0A1322] border border-[#162338] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Impressions</span>
              <div className="text-2xl font-bold text-amber-400">184,200</div>
              <span className="text-[11px] text-amber-300 font-semibold">+24.1% last 28 days</span>
            </div>
            <div className="bg-[#0A1322] border border-[#162338] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average CTR</span>
              <div className="text-2xl font-bold text-cyan-400">6.78%</div>
              <span className="text-[11px] text-cyan-300 font-semibold">High Engagement</span>
            </div>
            <div className="bg-[#0A1322] border border-[#162338] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Position</span>
              <div className="text-2xl font-bold text-indigo-400">3.8</div>
              <span className="text-[11px] text-indigo-300 font-semibold">Top 5 on Google</span>
            </div>
          </div>

          {/* Instant Indexing API Ping Tool */}
          <div className="bg-[#0A1322] rounded-2xl p-6 border border-[#162338] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Send className="w-4 h-4" /> Google Instant Indexing API Ping
              </h3>
              <span className="text-xs text-slate-400">IndexNow &amp; Google Cloud Indexing</span>
            </div>

            <form onSubmit={handleSubmitIndexing} className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="https://toufiqmotion.com/travel/amalfi-coast-guide"
                value={indexingUrl}
                onChange={(e) => setIndexingUrl(e.target.value)}
                className="flex-1 bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={indexingEngine}
                onChange={(e) => setIndexingEngine(e.target.value)}
                className="bg-[#070D18] border border-[#1E2E48] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Google Indexing API">Google Indexing API</option>
                <option value="Bing IndexNow">Bing IndexNow</option>
              </select>
              <button
                type="submit"
                disabled={isSubmittingIndex}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {isSubmittingIndex ? 'Submitting...' : 'Submit URL'}
              </button>
            </form>

            {indexingLogs.length > 0 && (
              <div className="bg-[#070D18] rounded-xl p-3 border border-[#162338] max-h-40 overflow-y-auto space-y-2">
                {indexingLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 truncate max-w-sm">{log.url}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">200 OK</span>
                      <span className="text-slate-500 text-[10px]">{log.created_at?.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Search Queries Table */}
          <div className="bg-[#0A1322] rounded-2xl border border-[#162338] overflow-hidden">
            <div className="p-4 border-b border-[#162338] flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Top Performing Google Search Queries (Last 28 Days)
              </h4>
              <span className="text-xs text-slate-400">Search Console Verified</span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#070D18] text-slate-400 uppercase tracking-wider text-[11px] border-b border-[#162338]">
                  <th className="py-3 px-5">Search Query</th>
                  <th className="py-3 px-4">Clicks</th>
                  <th className="py-3 px-4">Impressions</th>
                  <th className="py-3 px-4">CTR</th>
                  <th className="py-3 px-4">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131F33]">
                {searchQueries.map((q) => (
                  <tr key={q.id} className="hover:bg-[#0E1B2E] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">{q.query}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{q.clicks.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-300">{q.impressions.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-cyan-400 font-semibold">{q.ctr}%</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        #{q.position}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: QUICK EDIT SEO
          ========================================================================= */}
      {editingAuditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0B1524] border border-[#1E2E48] text-slate-100 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1A2840] pb-4">
              <h3 className="font-bold text-lg text-white">Quick Edit SEO &bull; {editingAuditItem.title}</h3>
              <button
                onClick={() => setEditingAuditItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSeo} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Focus Keyphrase</label>
                <input
                  type="text"
                  value={quickSeoForm.focusKeyword}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, focusKeyword: e.target.value })}
                  placeholder="e.g. amalfi coast guide"
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">SEO Meta Title</label>
                <input
                  type="text"
                  value={quickSeoForm.metaTitle}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, metaTitle: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Meta Description</label>
                <textarea
                  rows={3}
                  value={quickSeoForm.metaDescription}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, metaDescription: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Canonical URL</label>
                <input
                  type="text"
                  value={quickSeoForm.canonicalUrl}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, canonicalUrl: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="noIndexToggle"
                  checked={quickSeoForm.noIndex}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, noIndex: e.target.checked })}
                  className="rounded border-[#1E2E48] text-rose-500 focus:ring-0"
                />
                <label htmlFor="noIndexToggle" className="text-xs text-slate-300">
                  Instruct search crawlers not to index this story (noindex)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1A2840]">
                <button
                  type="button"
                  onClick={() => setEditingAuditItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickSeo}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  {isSavingQuickSeo ? 'Saving...' : 'Update SEO Metadata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE / EDIT 301 REDIRECT
          ========================================================================= */}
      {isRedirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0B1524] border border-[#1E2E48] text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1A2840] pb-4">
              <h3 className="font-bold text-lg text-white">
                {editingRedirectId ? 'Edit Redirect' : 'Add 301/302 Redirect Rule'}
              </h3>
              <button
                onClick={() => setIsRedirectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRedirect} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Source Request Path</label>
                <input
                  type="text"
                  required
                  placeholder="/old-travel-guide"
                  value={redirectForm.sourcePath}
                  onChange={(e) => setRedirectForm({ ...redirectForm, sourcePath: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Destination URL</label>
                <input
                  type="text"
                  required
                  placeholder="/travel or https://..."
                  value={redirectForm.targetPath}
                  onChange={(e) => setRedirectForm({ ...redirectForm, targetPath: e.target.value })}
                  className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Redirect Code</label>
                  <select
                    value={redirectForm.redirectCode}
                    onChange={(e) => setRedirectForm({ ...redirectForm, redirectCode: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value={301}>301 Permanent (SEO Recommended)</option>
                    <option value={302}>302 Temporary</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Notes / Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Legacy WordPress URL"
                    value={redirectForm.notes}
                    onChange={(e) => setRedirectForm({ ...redirectForm, notes: e.target.value })}
                    className="w-full bg-[#070D18] border border-[#1E2E48] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1A2840]">
                <button
                  type="button"
                  onClick={() => setIsRedirectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Save Redirect Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

