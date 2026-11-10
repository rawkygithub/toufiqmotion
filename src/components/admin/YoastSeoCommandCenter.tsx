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
  // Navigation tabs (6 Tabs)
  const [activeTab, setActiveTab] = useState<
    'audit' | 'redirects' | 'global_serp' | 'schema' | 'robots_sitemap' | 'search_console'
  >('audit');

  // Overview stats (4 KPI Cards)
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
    sitemapUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml`,
    lastPingedAt: new Date().toISOString()
  });

  // Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>({
    message: `Search engines notified! Dynamic sitemap: ${typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml`,
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };
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
  const [serpSettings, setSerpSettings] = useState({
    site_title_format: '%title% — Toufiq Motion Studio',
    meta_description: 'An editorial visual journal documenting landscape photography, travel narratives, and slow living.',
    canonical_domain: 'https://toufiqmotion.com',
    og_image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80'
  });
  const [serpPreviewMode, setSerpPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSavingSerp, setIsSavingSerp] = useState(false);

  // Tab 4: Schema.org Graph state
  const [schemaSettings, setSchemaSettings] = useState({
    knowledge_type: 'Organization',
    knowledge_name: 'Toufiq Motion Editorial',
    knowledge_logo: 'https://toufiqmotion.com/logo.png',
    knowledge_founder: 'Toufiq Motion',
    knowledge_email: 'hello@toufiqmotion.com',
    socials: [
      'https://instagram.com/toufiqmotion',
      'https://youtube.com/@toufiqmotion',
      'https://twitter.com/toufiqmotion'
    ]
  });
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [isCopiedJsonLd, setIsCopiedJsonLd] = useState(false);

  // Tab 5: Robots.txt & Dynamic Sitemap
  const [robotsTxt, setRobotsTxt] = useState(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml`
  );
  const [isSavingRobots, setIsSavingRobots] = useState(false);

  // Tab 6: Search Console, Analytics, Tracking & Custom <head> Tags
  const [trackingForm, setTrackingForm] = useState({
    google_site_verification: '',
    bing_site_verification: '',
    google_analytics_id: '',
    google_tag_manager_id: '',
    custom_head_tags: ''
  });
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [trackingSaveSuccess, setTrackingSaveSuccess] = useState(false);
  const [headVerification, setHeadVerification] = useState<any | null>(null);
  const [isVerifyingHead, setIsVerifyingHead] = useState(false);

  // Instant Indexing
  const [indexingUrl, setIndexingUrl] = useState('');
  const [indexingEngine, setIndexingEngine] = useState('Google Indexing API');
  const [indexingAction, setIndexingAction] = useState('URL_UPDATED');
  const [isSubmittingIndex, setIsSubmittingIndex] = useState(false);
  const [indexingLogs, setIndexingLogs] = useState<any[]>([]);

  // Initial load
  useEffect(() => {
    loadAllSeoData();
  }, []);

  const loadAllSeoData = async () => {
    setLoading(true);
    try {
      // 1. Fetch overview
      try {
        const ov = await api.getSeoOverview();
        setOverview(ov);
      } catch (err) {
        console.warn('Overview err:', err);
      }

      // 2. Fetch audit
      try {
        const auditRes = await api.getSeoAudit();
        setAuditItems(auditRes.auditItems || []);
      } catch (err) {
        console.warn('Audit err:', err);
      }

      // 3. Fetch redirects & errors
      try {
        const [redRes, errRes] = await Promise.all([
          api.getSeoRedirects(),
          api.getSeoCrawlErrors()
        ]);
        setRedirects(redRes.redirects || []);
        setCrawlErrors(errRes.errors || []);
      } catch (err) {
        console.warn('Redirects err:', err);
      }

      // 4. Fetch settings
      try {
        const settingsRes = await api.getSeoSettings();
        if (settingsRes.settings) {
          const s = settingsRes.settings;
          setSerpSettings({
            site_title_format: s.site_title_format || '%title% — Toufiq Motion Studio',
            meta_description: s.meta_description || 'An editorial visual journal documenting landscape photography, travel narratives, and slow living.',
            canonical_domain: s.canonical_domain || 'https://toufiqmotion.com',
            og_image: s.og_image || 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=1200&q=80'
          });

          if (s.robots_txt) setRobotsTxt(s.robots_txt);

          if (s.knowledge_name) {
            let socials = [
              'https://instagram.com/toufiqmotion',
              'https://youtube.com/@toufiqmotion',
              'https://twitter.com/toufiqmotion'
            ];
            try {
              if (s.knowledge_socials_json) {
                socials = JSON.parse(s.knowledge_socials_json);
              }
            } catch (e) {}

            setSchemaSettings({
              knowledge_type: s.knowledge_type || 'Organization',
              knowledge_name: s.knowledge_name || 'Toufiq Motion Editorial',
              knowledge_logo: s.knowledge_logo || 'https://toufiqmotion.com/logo.png',
              knowledge_founder: s.knowledge_founder || 'Toufiq Motion',
              knowledge_email: s.knowledge_email || 'hello@toufiqmotion.com',
              socials
            });
          }

          setTrackingForm({
            google_site_verification: s.google_site_verification || '',
            bing_site_verification: s.bing_site_verification || '',
            google_analytics_id: s.google_analytics_id || '',
            google_tag_manager_id: s.google_tag_manager_id || '',
            custom_head_tags: s.custom_head_tags || ''
          });
        }
      } catch (err) {
        console.warn('Settings err:', err);
      }

      // 5. Fetch indexing logs
      try {
        const logsRes = await api.getSeoIndexingLogs();
        setIndexingLogs(logsRes.logs || []);
      } catch (err) {
        console.warn('Indexing logs err:', err);
      }

      // 6. Verify live head tags
      try {
        const verRes = await api.verifySeoHeadTags();
        setHeadVerification(verRes);
      } catch (err) {
        console.warn('Verify head tags err:', err);
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
      showToast(`Search engines notified! Dynamic sitemap: ${res.sitemapUrl}`, 'success');
      setOverview((prev) => ({
        ...prev,
        lastPingedAt: res.timestamp,
        sitemapUrl: res.sitemapUrl
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to ping search engines', 'error');
    } finally {
      setIsPinging(false);
    }
  };

  // Tab 1: Re-analyze SEO
  const handleReanalyzeAll = async () => {
    if (!token) {
      showToast('Admin authentication required', 'error');
      return;
    }
    setIsReanalyzing(true);
    try {
      const res = await api.reanalyzeSeo(token);
      showToast(res.message, 'success');
      loadAllSeoData();
    } catch (err: any) {
      showToast(err.message || 'Failed to re-analyze', 'error');
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
      showToast('Article SEO settings updated successfully!', 'success');
      setEditingAuditItem(null);
      loadAllSeoData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update article SEO', 'error');
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
    if (!token) {
      showToast('Admin authentication required', 'error');
      return;
    }
    try {
      if (editingRedirectId) {
        await api.updateSeoRedirect(token, editingRedirectId, redirectForm);
      } else {
        await api.createSeoRedirect(token, redirectForm);
      }
      setIsRedirectModalOpen(false);
      showToast('301 Redirect rule saved successfully!', 'success');
      loadAllSeoData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save redirect', 'error');
    }
  };

  const handleDeleteRedirect = async (id: string, path: string) => {
    if (!token) return;
    if (!confirm(`Delete 301 redirect for ${path}?`)) return;
    try {
      await api.deleteSeoRedirect(token, id);
      showToast('Redirect rule removed', 'success');
      loadAllSeoData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete redirect', 'error');
    }
  };

  const handleResolveCrawlError = async (id: string) => {
    if (!token) return;
    try {
      await api.resolveSeoCrawlError(token, id);
      showToast('Crawl error marked resolved', 'success');
      setCrawlErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e)));
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve error', 'error');
    }
  };

  const handleClearCrawlErrors = async () => {
    if (!token) return;
    try {
      await api.clearSeoCrawlErrors(token);
      showToast('Crawl error log cleared', 'success');
      loadAllSeoData();
    } catch (err: any) {
      showToast(err.message || 'Failed to clear', 'error');
    }
  };

  // Tab 3: Save Global SERP
  const handleSaveSerp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Admin authentication required', 'error');
      return;
    }
    setIsSavingSerp(true);
    try {
      await api.saveSeoSettings(token, {
        site_title_format: serpSettings.site_title_format,
        meta_description: serpSettings.meta_description,
        canonical_domain: serpSettings.canonical_domain,
        og_image: serpSettings.og_image
      });
      showToast('Global SERP & Canonical configurations saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save SERP settings', 'error');
    } finally {
      setIsSavingSerp(false);
    }
  };

  // Tab 4: Save Schema Knowledge Graph
  const handleSaveSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Admin authentication required', 'error');
      return;
    }
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
      showToast('Schema.org Knowledge Graph saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save schema', 'error');
    } finally {
      setIsSavingSchema(false);
    }
  };

  // Tab 5: Save Robots.txt
  const handleSaveRobots = async () => {
    if (!token) {
      showToast('Admin authentication required', 'error');
      return;
    }
    setIsSavingRobots(true);
    try {
      await api.saveSeoSettings(token, { robots_txt: robotsTxt });
      showToast('Robots.txt deployed live to /robots.txt!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save robots.txt', 'error');
    } finally {
      setIsSavingRobots(false);
    }
  };

  // Tab 6: Save Tracking, Analytics & Custom Head Tags
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Admin authentication required', 'error');
      return;
    }
    setIsSavingTracking(true);
    setTrackingSaveSuccess(false);
    try {
      await api.saveSeoSettings(token, trackingForm);
      setTrackingSaveSuccess(true);
      setTimeout(() => setTrackingSaveSuccess(false), 3500);
      showToast('Tracking, Analytics & Custom <head> tags saved and deployed live!', 'success');
      try {
        const verRes = await api.verifySeoHeadTags();
        setHeadVerification(verRes);
      } catch {}
    } catch (err: any) {
      showToast(err.message || 'Failed to save tracking settings', 'error');
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleRunHeadVerification = async () => {
    setIsVerifyingHead(true);
    try {
      const res = await api.verifySeoHeadTags();
      setHeadVerification(res);
      showToast('Live <head> verification completed! Server confirmed tag injection.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Verification check failed', 'error');
    } finally {
      setIsVerifyingHead(false);
    }
  };

  // Tab 6: Submit Instant Indexing
  const handleSubmitIndexing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Admin authentication required', 'error');
      return;
    }
    if (!indexingUrl) {
      showToast('Please enter a valid URL', 'error');
      return;
    }
    setIsSubmittingIndex(true);
    try {
      const res = await api.submitIndexingUrl(token, {
        url: indexingUrl,
        engine: indexingEngine,
        action: indexingAction
      });
      setIndexingLogs([res.log, ...indexingLogs]);
      setIndexingUrl('');
      showToast(`URL queued for instant crawl by ${indexingEngine}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit indexing', 'error');
    } finally {
      setIsSubmittingIndex(false);
    }
  };

  // Filtered Audit Items
  const filteredAuditItems = auditItems.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      item.slug?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      item.focusKeyword?.toLowerCase().includes(auditSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (auditFilter === 'good') return item.seoScore >= 80;
    if (auditFilter === 'improvements') return item.seoScore >= 50 && item.seoScore < 80;
    if (auditFilter === 'poor') return item.seoScore < 50;
    if (auditFilter === 'noindex') return Boolean(item.noIndex);
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
    <div className="bg-[#FAF8F5] text-[#1E1B18] rounded-3xl p-5 sm:p-6 border border-[#EDE7DF] shadow-xs space-y-6">
      
      {/* 1. TOP HEADER & QUICK ACTION PILLS */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#EDE7DF] pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#EDF7F1] border border-[#C8E9D6] flex items-center justify-center shrink-0 shadow-xs">
            <Search className="w-5 h-5 text-[#2E7D5A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#2E7D5A]">
                SEO Engine Suite
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                Yoast-Grade
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">
              Yoast SEO Command Center
            </h2>
            <p className="text-xs text-[#7A7468] mt-0.5 leading-relaxed">
              Real-time on-page SEO algorithms, Google SERP previews, rich JSON-LD schema graphs, 301 redirect manager, and crawl error monitoring.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handlePingSearchEngines}
            disabled={isPinging}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#FAD8B5] bg-[#FEF6EC] text-[#C26B18] hover:bg-[#FCEAD4] active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
            title="Send dynamic sitemap to Google & Bing indexing crawlers"
          >
            <Send className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging...' : 'Ping Google / Bing'}</span>
          </button>

          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#C8E9D6] bg-[#EDF7F1] text-[#2E7D5A] hover:bg-[#DEEFE5] active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Network className="w-3.5 h-3.5" />
            <span>View Live Sitemap.xml</span>
          </a>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#BCE0FD] bg-[#F0F8FF] text-[#1E6091] hover:bg-[#DEEFFF] active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>View Robots.txt</span>
          </a>
        </div>
      </div>

      {/* 2. NOTIFICATION BANNER */}
      {notification && (
        <div className={`border rounded-2xl p-3.5 flex items-center justify-between shadow-2xs text-xs sm:text-sm animate-in fade-in ${
          notification.type === 'error'
            ? 'bg-[#FDF2F2] border-[#F8B4B4] text-[#C93B3B]'
            : 'bg-[#EDF7F1] border-[#C8E9D6] text-[#2E7D5A]'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-[#C93B3B] shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D5A] shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. 4 KPI SUMMARY CARDS (Compact, Clean Light Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Emerald - Site SEO Health */}
        <div className="bg-white border border-[#EDE7DF] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#7A7468] font-bold">Site SEO Health</span>
            <div className="w-7 h-7 rounded-xl bg-[#EDF7F1] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#2E7D5A]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2E7D5A] tracking-tight">
              {overview.siteSeoHealth}%
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
              {overview.grade}
            </span>
          </div>
        </div>

        {/* Card 2: Amber - Indexed URLs in Sitemap */}
        <div className="bg-white border border-[#EDE7DF] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#7A7468] font-bold">Indexed URLs in Sitemap</span>
            <div className="w-7 h-7 rounded-xl bg-[#FEF6EC] flex items-center justify-center">
              <Network className="w-4 h-4 text-[#C26B18]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#C26B18] tracking-tight">
              {overview.totalIndexedUrls}
            </span>
            <span className="text-xs text-[#7A7468] font-medium truncate">
              ({overview.breakdown.articles} Posts, {overview.breakdown.categories} Cats)
            </span>
          </div>
        </div>

        {/* Card 3: Blue - Active 301 Redirects */}
        <div className="bg-white border border-[#EDE7DF] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#7A7468] font-bold">Active 301 Redirects</span>
            <div className="w-7 h-7 rounded-xl bg-[#F0F8FF] flex items-center justify-center">
              <CornerDownRight className="w-4 h-4 text-[#1E6091]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1E6091] tracking-tight">
              {overview.activeRedirectsCount}
            </span>
            <span className="text-xs text-[#7A7468] font-medium">Link Juice Preserved</span>
          </div>
        </div>

        {/* Card 4: Rose - 404 Crawl Error Logs */}
        <div className="bg-white border border-[#EDE7DF] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#7A7468] font-bold">404 Crawl Error Logs</span>
            <div className="w-7 h-7 rounded-xl bg-[#FDF2F2] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#C93B3B]" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#C93B3B] tracking-tight">
              {overview.crawlErrorsCount}
            </span>
            <span className="text-xs text-[#7A7468] font-medium">Auto Monitored</span>
          </div>
        </div>
      </div>

      {/* 4. THE 6 NAVIGATION TABS */}
      <div className="flex border-b border-[#EDE7DF] gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-1">
        
        {/* Tab 1 */}
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[#2E7D5A] text-[#2E7D5A] bg-[#EDF7F1]/60 rounded-t-xl'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#2E7D5A]" />
          <span>Site SEO Content Audit ({auditItems.length})</span>
        </button>

        {/* Tab 2 */}
        <button
          onClick={() => setActiveTab('redirects')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'redirects'
              ? 'border-[#1E6091] text-[#1E6091] bg-[#F0F8FF]/60 rounded-t-xl'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <CornerDownRight className="w-4 h-4 text-[#1E6091]" />
          <span>301 Redirects &amp; 404 Monitor</span>
          {crawlErrors.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#C93B3B] text-white">
              {crawlErrors.length}
            </span>
          )}
        </button>

        {/* Tab 3 */}
        <button
          onClick={() => setActiveTab('global_serp')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'global_serp'
              ? 'border-[#C26B18] text-[#C26B18] bg-[#FEF6EC]/60 rounded-t-xl'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Globe className="w-4 h-4 text-[#C26B18]" />
          <span>Global SERP &amp; Canonical</span>
        </button>

        {/* Tab 4 */}
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'schema'
              ? 'border-[#543884] text-[#543884] bg-[#F3F0FC]/60 rounded-t-xl'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Code2 className="w-4 h-4 text-[#543884]" />
          <span>&lt;/&gt; Schema.org Knowledge Graph</span>
        </button>

        {/* Tab 5 */}
        <button
          onClick={() => setActiveTab('robots_sitemap')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'robots_sitemap'
              ? 'border-[#1E6091] text-[#1E6091] bg-[#F0F8FF]/60 rounded-t-xl'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Bot className="w-4 h-4 text-[#1E6091]" />
          <span>Robots.txt &amp; XML Sitemap</span>
        </button>

        {/* Tab 6 */}
        <button
          onClick={() => setActiveTab('search_console')}
          className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'search_console'
              ? 'border-[#2E7D5A] text-[#2E7D5A] bg-[#EDF7F1]/60 rounded-t-xl'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#2E7D5A]" />
          <span>Search Console &amp; Analytics Integration</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SITE SEO CONTENT AUDIT
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EDE7DF] shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7468]" />
              <input
                type="text"
                placeholder="Search audit by title, slug, or focus keyphrase..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1E1B18] placeholder-[#9E9587] focus:outline-none focus:border-[#2E7D5A] focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl p-1 text-xs">
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    auditFilter === 'all' ? 'bg-white text-[#1E1B18] shadow-2xs' : 'text-[#7A7468] hover:text-[#1E1B18]'
                  }`}
                >
                  All ({auditItems.length})
                </button>
                <button
                  onClick={() => setAuditFilter('good')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    auditFilter === 'good' ? 'bg-[#EDF7F1] text-[#2E7D5A] font-bold shadow-2xs' : 'text-[#7A7468] hover:text-[#1E1B18]'
                  }`}
                >
                  Good SEO (80+)
                </button>
                <button
                  onClick={() => setAuditFilter('improvements')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    auditFilter === 'improvements' ? 'bg-[#FEF6EC] text-[#C26B18] font-bold shadow-2xs' : 'text-[#7A7468] hover:text-[#1E1B18]'
                  }`}
                >
                  Needs Work (50-79)
                </button>
              </div>

              <button
                onClick={handleReanalyzeAll}
                disabled={isReanalyzing}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EDF7F1] border border-[#C8E9D6] text-[#2E7D5A] hover:bg-[#DEEFE5] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>Re-Audit All</span>
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white rounded-2xl border border-[#EDE7DF] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F5F0] text-[#7A7468] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                    <th className="py-3 px-4 font-bold min-w-[220px]">Story &amp; URL</th>
                    <th className="py-3 px-3 font-bold min-w-[140px]">Focus Keyphrase</th>
                    <th className="py-3 px-3 font-bold min-w-[100px]">SEO Score</th>
                    <th className="py-3 px-3 font-bold min-w-[100px]">Readability</th>
                    <th className="py-3 px-3 font-bold min-w-[140px]">Snippet Status</th>
                    <th className="py-3 px-3 font-bold min-w-[90px]">Index</th>
                    <th className="py-3 px-4 font-bold text-right min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE7DF]">
                  {filteredAuditItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#EDE7DF]"
                            />
                          )}
                          <div className="max-w-[200px] sm:max-w-xs">
                            <h4 className="font-bold text-[#1E1B18] line-clamp-1">{item.title}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-[#7A7468] font-mono truncate">/{item.slug}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#FAF8F5] border border-[#EDE7DF] text-[#6A6357] shrink-0">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {item.focusKeyword ? (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#FEF6EC] text-[#C26B18] border border-[#FAD8B5] inline-block">
                            {item.focusKeyword}
                          </span>
                        ) : (
                          <span className="text-[#9E9587] italic">No keyword set</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                            item.seoScore >= 80
                              ? 'bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]'
                              : item.seoScore >= 50
                              ? 'bg-[#FEF6EC] text-[#C26B18] border border-[#FAD8B5]'
                              : 'bg-[#FDF2F2] text-[#C93B3B] border border-[#F8C8C8]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.seoScore}/100
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            item.readabilityScore >= 80
                              ? 'bg-[#EDF7F1] text-[#2E7D5A]'
                              : 'bg-[#FEF6EC] text-[#C26B18]'
                          }`}
                        >
                          {item.readabilityScore}% Good
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-block ${
                              item.metaDescStatus === 'good'
                                ? 'bg-[#EDF7F1] text-[#2E7D5A]'
                                : item.metaDescStatus === 'missing'
                                ? 'bg-[#FDF2F2] text-[#C93B3B]'
                                : 'bg-[#FEF6EC] text-[#C26B18]'
                            }`}
                          >
                            {item.metaDescStatus === 'good' && 'Optimal (120-160)'}
                            {item.metaDescStatus === 'short' && `${item.metaDescLength} chars (Short)`}
                            {item.metaDescStatus === 'long' && `${item.metaDescLength} chars (Long)`}
                            {item.metaDescStatus === 'missing' && 'Missing Desc'}
                          </span>
                          <div className="text-[10px] text-[#7A7468] flex items-center gap-1">
                            {item.keyphraseInTitle ? (
                              <span className="text-[#2E7D5A] font-semibold">✓ In title</span>
                            ) : (
                              <span className="text-[#9E9587]">✗ Title miss</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.noIndex ? 'bg-[#FDF2F2] text-[#C93B3B]' : 'bg-[#EDF7F1] text-[#2E7D5A]'
                          }`}
                        >
                          {item.indexStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openQuickSeoModal(item)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FAF8F5] hover:bg-[#EDF7F1] text-[#2E7D5A] hover:text-[#1E6091] border border-[#EDE7DF] hover:border-[#C8E9D6] transition-all cursor-pointer whitespace-nowrap"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE7DF] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRedirectSubTab('redirects')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  redirectSubTab === 'redirects'
                    ? 'bg-[#F0F8FF] text-[#1E6091] border border-[#BCE0FD]'
                    : 'text-[#6A6357] hover:text-[#1E1B18]'
                }`}
              >
                Active 301 Redirects ({redirects.length})
              </button>
              <button
                onClick={() => setRedirectSubTab('crawl_errors')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  redirectSubTab === 'crawl_errors'
                    ? 'bg-[#FDF2F2] text-[#C93B3B] border border-[#F8C8C8]'
                    : 'text-[#6A6357] hover:text-[#1E1B18]'
                }`}
              >
                <span>404 Crawl Error Logs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C93B3B] text-white">
                  {crawlErrors.length}
                </span>
              </button>
            </div>

            {redirectSubTab === 'redirects' ? (
              <button
                onClick={() => openNewRedirectModal()}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2E7D5A] text-white hover:bg-[#246649] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create 301 Redirect</span>
              </button>
            ) : (
              <button
                onClick={handleClearCrawlErrors}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#DDD5CA] text-[#6A6357] hover:bg-[#FAF8F5] transition-all cursor-pointer self-start sm:self-auto"
              >
                Clear Resolved Logs
              </button>
            )}
          </div>

          {/* Sub-view 1: Active 301 Redirects */}
          {redirectSubTab === 'redirects' && (
            <div className="bg-white rounded-2xl border border-[#EDE7DF] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F5F0] text-[#7A7468] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                      <th className="py-3 px-4 font-bold min-w-[150px]">Source URL Path</th>
                      <th className="py-3 px-4 font-bold min-w-[180px]">Target Destination URL</th>
                      <th className="py-3 px-3 font-bold min-w-[100px]">Code</th>
                      <th className="py-3 px-3 font-bold min-w-[90px]">Hits Saved</th>
                      <th className="py-3 px-4 font-bold min-w-[120px]">Notes</th>
                      <th className="py-3 px-4 font-bold text-right min-w-[110px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE7DF]">
                    {redirects.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-4 font-mono text-[#1E6091] font-semibold">{r.source_path}</td>
                        <td className="py-3 px-4 font-mono text-[#2E7D5A] font-semibold flex items-center gap-1.5">
                          <CornerDownRight className="w-3 h-3 text-[#2E7D5A] shrink-0" />
                          <span className="truncate max-w-xs">{r.target_path}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F8FF] text-[#1E6091] border border-[#BCE0FD]">
                            {r.redirect_code} Permanent
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#1E1B18]">
                          {r.hits_count.toLocaleString()} clicks
                        </td>
                        <td className="py-3 px-4 text-[#7A7468] text-[11px] truncate max-w-xs">{r.notes || '—'}</td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <a
                            href={r.source_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#1E6091] hover:bg-[#F0F8FF] transition-colors inline-block border border-[#EDE7DF]"
                            title="Test live redirect"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openEditRedirectModal(r)}
                            className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#6A6357] hover:text-[#1E1B18] hover:bg-[#EDE7DF] transition-colors border border-[#EDE7DF] cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRedirect(r.id, r.source_path)}
                            className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#C93B3B] hover:bg-[#FDF2F2] transition-colors border border-[#EDE7DF] cursor-pointer"
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
            </div>
          )}

          {/* Sub-view 2: 404 Crawl Error Logs */}
          {redirectSubTab === 'crawl_errors' && (
            <div className="space-y-3">
              <div className="bg-[#FDF2F2] border border-[#F8C8C8] rounded-2xl p-4 text-xs text-[#C93B3B] flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#C93B3B] shrink-0" />
                <span>
                  The 404 Crawl Monitor tracks broken links accessed by Googlebot, Bingbot, or external backlinks. Click <strong>"Fix with 301 Redirect"</strong> to immediately preserve SEO authority.
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-[#EDE7DF] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F7F5F0] text-[#7A7468] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                        <th className="py-3 px-4 font-bold min-w-[150px]">Dead URL Path</th>
                        <th className="py-3 px-3 font-bold min-w-[90px]">Hits Count</th>
                        <th className="py-3 px-4 font-bold min-w-[160px]">Detected Crawler / Referer</th>
                        <th className="py-3 px-3 font-bold min-w-[90px]">Status</th>
                        <th className="py-3 px-4 font-bold text-right min-w-[150px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE7DF]">
                      {crawlErrors.map((err) => (
                        <tr key={err.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3 px-4 font-mono text-[#C93B3B] font-semibold">{err.path}</td>
                          <td className="py-3 px-3 font-bold text-[#1E1B18]">{err.hits_count} misses</td>
                          <td className="py-3 px-4 text-[#7A7468] text-[11px] max-w-xs truncate">
                            {err.user_agent || err.referer || 'Search Crawler'}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                err.status === 'resolved'
                                  ? 'bg-[#EDF7F1] text-[#2E7D5A]'
                                  : 'bg-[#FDF2F2] text-[#C93B3B]'
                              }`}
                            >
                              {err.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => openNewRedirectModal(err.path)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6] hover:bg-[#DEEFE5] transition-all cursor-pointer"
                            >
                              Fix with 301
                            </button>
                            {err.status !== 'resolved' && (
                              <button
                                onClick={() => handleResolveCrawlError(err.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAF8F5] text-[#6A6357] hover:text-[#1E1B18] border border-[#EDE7DF] cursor-pointer"
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
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: GLOBAL SERP & CANONICAL
          ========================================================================= */}
      {activeTab === 'global_serp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Settings Form */}
          <form onSubmit={handleSaveSerp} className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C26B18] flex items-center gap-2">
                <Globe className="w-4 h-4" /> Global Site Metadata &amp; Search Identity
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">
                  Site Title Format Template
                </label>
                <input
                  type="text"
                  value={serpSettings.site_title_format}
                  onChange={(e) => setSerpSettings({ ...serpSettings, site_title_format: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
                <span className="text-[10px] text-[#7A7468]">
                  Variables available: <code>%title%</code>, <code>%sitename%</code>, <code>%category%</code>
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#1E1B18]">Global Default Meta Description</label>
                  <span
                    className={`text-[11px] font-bold ${
                      serpSettings.meta_description.length >= 120 && serpSettings.meta_description.length <= 160
                        ? 'text-[#2E7D5A]'
                        : 'text-[#C26B18]'
                    }`}
                  >
                    {serpSettings.meta_description.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={serpSettings.meta_description}
                  onChange={(e) => setSerpSettings({ ...serpSettings, meta_description: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl p-3 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Primary Canonical Domain</label>
                <input
                  type="text"
                  value={serpSettings.canonical_domain}
                  onChange={(e) => setSerpSettings({ ...serpSettings, canonical_domain: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Default Social Share Image (Open Graph)</label>
                <input
                  type="text"
                  value={serpSettings.og_image}
                  onChange={(e) => setSerpSettings({ ...serpSettings, og_image: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSerp}
                className="w-full py-2.5 rounded-xl bg-[#2E7D5A] text-white hover:bg-[#246649] font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                {isSavingSerp ? 'Saving...' : 'Save Global SERP Settings'}
              </button>
            </div>
          </form>

          {/* Live Google SERP Snippet Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7468]">
                  Live Google SERP Preview
                </h4>
                <div className="flex items-center bg-[#FAF8F5] rounded-lg p-0.5 border border-[#DDD5CA] text-xs">
                  <button
                    onClick={() => setSerpPreviewMode('desktop')}
                    className={`px-2 py-1 rounded flex items-center gap-1 font-semibold cursor-pointer ${
                      serpPreviewMode === 'desktop' ? 'bg-white text-[#1E1B18] shadow-2xs' : 'text-[#7A7468]'
                    }`}
                  >
                    <Monitor className="w-3 h-3" /> Desktop
                  </button>
                  <button
                    onClick={() => setSerpPreviewMode('mobile')}
                    className={`px-2 py-1 rounded flex items-center gap-1 font-semibold cursor-pointer ${
                      serpPreviewMode === 'mobile' ? 'bg-white text-[#1E1B18] shadow-2xs' : 'text-[#7A7468]'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> Mobile
                  </button>
                </div>
              </div>

              {/* SERP Card */}
              <div className="bg-[#FAF8F5] rounded-xl p-4 text-slate-900 border border-[#DDD5CA] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#E8734A] text-white font-bold text-[10px] flex items-center justify-center">
                    TM
                  </div>
                  <div className="leading-tight">
                    <span className="text-[12px] font-semibold text-slate-900 block">Toufiq Motion</span>
                    <span className="text-[10px] text-slate-500 font-mono">{serpSettings.canonical_domain}</span>
                  </div>
                </div>

                <h3 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                  {serpSettings.site_title_format.replace('%title%', 'Stories of Movement & Light')}
                </h3>

                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                  {serpSettings.meta_description}
                </p>
              </div>

              {/* Open Graph Card */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-[#7A7468] block">Social Share (Open Graph) Preview</span>
                <div className="bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl overflow-hidden shadow-2xs">
                  <img src={serpSettings.og_image} alt="OG" className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <span className="text-[10px] text-[#7A7468] uppercase tracking-wider block font-semibold">TOUFIQMOTION.COM</span>
                    <h5 className="text-xs font-bold text-[#1E1B18] line-clamp-1 mt-0.5">
                      {serpSettings.site_title_format.replace('%title%', 'Stories of Movement & Light')}
                    </h5>
                    <p className="text-[11px] text-[#7A7468] line-clamp-1 mt-0.5">{serpSettings.meta_description}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form onSubmit={handleSaveSchema} className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#543884] flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Entity &amp; Knowledge Graph Configuration
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Schema Entity Type</label>
                <select
                  value={schemaSettings.knowledge_type}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_type: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#543884] focus:bg-white"
                >
                  <option value="Organization">Organization (Publishing Media House)</option>
                  <option value="Person">Person (Independent Visual Journalist)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Entity Legal Brand Name</label>
                <input
                  type="text"
                  value={schemaSettings.knowledge_name}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_name: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#543884] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Official Brand Logo URL</label>
                <input
                  type="text"
                  value={schemaSettings.knowledge_logo}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_logo: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#543884] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Founder &amp; Chief Editor</label>
                <input
                  type="text"
                  value={schemaSettings.knowledge_founder}
                  onChange={(e) => setSchemaSettings({ ...schemaSettings, knowledge_founder: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#543884] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1E1B18] block">
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
                      className="flex-1 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-1.5 text-xs text-[#1E1B18] focus:outline-none focus:border-[#543884] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = schemaSettings.socials.filter((_, i) => i !== idx);
                        setSchemaSettings({ ...schemaSettings, socials: next });
                      }}
                      className="p-2 rounded-xl bg-[#FDF2F2] text-[#C93B3B] hover:bg-[#FCE3E3] cursor-pointer"
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
                  className="text-xs text-[#543884] hover:text-[#432c6b] font-semibold flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Plus className="w-3 h-3" /> Add Social Profile
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingSchema}
                className="w-full py-2.5 rounded-xl bg-[#543884] text-white hover:bg-[#432c6b] font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                {isSavingSchema ? 'Saving...' : 'Deploy Knowledge Graph'}
              </button>
            </div>
          </form>

          {/* JSON-LD Live Viewer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7468]">
                  Live JSON-LD Graph Payload
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedJsonLd);
                      setIsCopiedJsonLd(true);
                      setTimeout(() => setIsCopiedJsonLd(false), 2000);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FAF8F5] border border-[#DDD5CA] text-[#543884] hover:bg-[#F3F0FC] flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedJsonLd ? <Check className="w-3.5 h-3.5 text-[#2E7D5A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedJsonLd ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#F3F0FC] text-[#543884] border border-[#D9D0F5] hover:bg-[#E8E1F8] flex items-center gap-1"
                  >
                    <span>Test on Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#DDD5CA] font-mono text-[11px] text-[#2E4A3B] overflow-x-auto max-h-[460px] leading-relaxed">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Robots.txt Editor */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E6091] flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Live Robots.txt Deployment
                </h3>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1E6091] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open live</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#7A7468]">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setRobotsTxt(
                      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml`
                    )
                  }
                  className="px-2 py-1 rounded bg-[#FAF8F5] hover:bg-[#EDE7DF] border border-[#DDD5CA] text-[#6A6357] text-[10px] font-semibold cursor-pointer"
                >
                  Standard Production
                </button>
                <button
                  type="button"
                  onClick={() => setRobotsTxt(`User-agent: *\nDisallow: /`)}
                  className="px-2 py-1 rounded bg-[#FAF8F5] hover:bg-[#EDE7DF] border border-[#DDD5CA] text-[#6A6357] text-[10px] font-semibold cursor-pointer"
                >
                  Staging / No-Index
                </button>
              </div>

              <textarea
                rows={9}
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl p-3.5 font-mono text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E6091] focus:bg-white leading-relaxed"
              />

              <button
                onClick={handleSaveRobots}
                disabled={isSavingRobots}
                className="w-full py-2.5 rounded-xl bg-[#1E6091] text-white hover:bg-[#164b73] font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                {isSavingRobots ? 'Deploying...' : 'Save & Deploy robots.txt'}
              </button>
            </div>
          </div>

          {/* XML Sitemap Inspector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2E7D5A] flex items-center gap-2">
                  <Network className="w-4 h-4" /> Dynamic XML Sitemap Protocol
                </h3>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#2E7D5A] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>View live /sitemap.xml</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-[#EDF7F1] border border-[#C8E9D6] rounded-xl p-3.5 text-xs text-[#2E7D5A] space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Engine Status: Live &amp; Real-Time</span>
                  <span className="px-2 py-0.5 rounded bg-white text-[#2E7D5A] border border-[#C8E9D6] text-[10px]">XML 0.9 Protocol</span>
                </div>
                <p className="text-[11px] text-[#246649] leading-relaxed">
                  The sitemap is computed dynamically on request from SQLite, automatically including all published stories, categories, and core landing pages without caching delays.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-[#7A7468] uppercase tracking-wider">Included Slices</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] flex items-center justify-between">
                    <span className="text-[#7A7468]">Articles / Posts:</span>
                    <span className="font-bold text-[#1E1B18]">{overview.breakdown.articles} (0.90)</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] flex items-center justify-between">
                    <span className="text-[#7A7468]">Categories:</span>
                    <span className="font-bold text-[#1E1B18]">{overview.breakdown.categories} (0.85)</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] flex items-center justify-between">
                    <span className="text-[#7A7468]">Static Pages:</span>
                    <span className="font-bold text-[#1E1B18]">{overview.breakdown.staticPages} (1.0)</span>
                  </div>
                  <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] flex items-center justify-between">
                    <span className="text-[#7A7468]">Total URLs:</span>
                    <span className="font-bold text-[#2E7D5A]">{overview.totalIndexedUrls} URLs</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePingSearchEngines}
                disabled={isPinging}
                className="w-full py-2.5 rounded-xl bg-[#2E7D5A] text-white hover:bg-[#246649] font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Sitemap to Google &amp; Bing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SEARCH CONSOLE, ANALYTICS & CUSTOM HEAD TAGS
          ========================================================================= */}
      {activeTab === 'search_console' && (
        <div className="space-y-5">
          {/* Real Live Verification Status Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EDE7DF] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EDE7DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EDF7F1] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D5A]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#1E1B18]">
                    Live Tracking &amp; Head Tag Verification Engine
                  </h3>
                  <p className="text-[11px] text-[#7A7468]">
                    All tags are dynamically rendered on the server into the HTML &lt;head&gt; for crawlers and in the client DOM.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunHeadVerification}
                disabled={isVerifyingHead}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6] hover:bg-[#DEEFE5] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingHead ? 'animate-spin' : ''}`} />
                <span>{isVerifyingHead ? 'Verifying Live...' : 'Verify Live in <head>'}</span>
              </button>
            </div>

            {/* Live Status Indicators (Real, not fake) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7A7468] block">Search Console</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${trackingForm.google_site_verification ? 'bg-[#2E7D5A]' : 'bg-[#DDD5CA]'}`} />
                  <span className={`text-xs font-bold ${trackingForm.google_site_verification ? 'text-[#2E7D5A]' : 'text-[#7A7468]'}`}>
                    {trackingForm.google_site_verification ? 'Configured' : 'Not Set'}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7A7468] block">Bing Webmaster</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${trackingForm.bing_site_verification ? 'bg-[#1E6091]' : 'bg-[#DDD5CA]'}`} />
                  <span className={`text-xs font-bold ${trackingForm.bing_site_verification ? 'text-[#1E6091]' : 'text-[#7A7468]'}`}>
                    {trackingForm.bing_site_verification ? 'Configured' : 'Not Set'}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7A7468] block">Google Analytics (GA4)</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${trackingForm.google_analytics_id ? 'bg-[#2E7D5A]' : 'bg-[#DDD5CA]'}`} />
                  <span className={`text-xs font-bold ${trackingForm.google_analytics_id ? 'text-[#2E7D5A]' : 'text-[#7A7468]'}`}>
                    {trackingForm.google_analytics_id ? 'Active (GA4)' : 'Not Set'}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7A7468] block">Tag Manager (GTM)</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${trackingForm.google_tag_manager_id ? 'bg-[#1E6091]' : 'bg-[#DDD5CA]'}`} />
                  <span className={`text-xs font-bold ${trackingForm.google_tag_manager_id ? 'text-[#1E6091]' : 'text-[#7A7468]'}`}>
                    {trackingForm.google_tag_manager_id ? 'Active (GTM)' : 'Not Set'}
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EDE7DF] space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[#7A7468] block">Custom &lt;head&gt; Code</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${trackingForm.custom_head_tags ? 'bg-[#C26B18]' : 'bg-[#DDD5CA]'}`} />
                  <span className={`text-xs font-bold ${trackingForm.custom_head_tags ? 'text-[#C26B18]' : 'text-[#7A7468]'}`}>
                    {trackingForm.custom_head_tags ? `${trackingForm.custom_head_tags.length} chars` : 'Empty'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form: Search Console, Analytics & Custom Head Tags */}
          <form onSubmit={handleSaveTracking} className="space-y-4">
            
            {/* Card 1: Search Engine Verification Codes */}
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2E7D5A] flex items-center gap-2">
                  <Search className="w-4 h-4" /> 1. Search Engine Console Verification Codes
                </h3>
                <span className="text-[11px] text-[#7A7468]">Google Search Console &amp; Bing Webmaster</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Site Verification */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E1B18] flex items-center gap-1.5">
                      <span>Google Search Console Verification</span>
                      {trackingForm.google_site_verification && (
                        <span className="text-[10px] text-[#2E7D5A] font-bold">✓ Active</span>
                      )}
                    </label>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#2E7D5A] hover:underline flex items-center gap-1"
                    >
                      <span>Open GSC</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder='google-site-verification=... or <meta name="google-site-verification" content="..." />'
                    value={trackingForm.google_site_verification}
                    onChange={(e) => setTrackingForm({ ...trackingForm, google_site_verification: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] font-mono focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                  />
                  <p className="text-[11px] text-[#7A7468]">
                    In Search Console, choose <strong>URL Prefix</strong> &rarr; <strong>HTML Tag</strong>, then paste the tag or code above.
                  </p>
                </div>

                {/* Bing Webmaster Verification */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E1B18] flex items-center gap-1.5">
                      <span>Bing Webmaster Tools Verification</span>
                      {trackingForm.bing_site_verification && (
                        <span className="text-[10px] text-[#1E6091] font-bold">✓ Active</span>
                      )}
                    </label>
                    <a
                      href="https://www.bing.com/webmasters"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1E6091] hover:underline flex items-center gap-1"
                    >
                      <span>Open Bing</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder='e.g. 3F68A48B25C6719E or <meta name="msvalidate.01" content="..." />'
                    value={trackingForm.bing_site_verification}
                    onChange={(e) => setTrackingForm({ ...trackingForm, bing_site_verification: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] font-mono focus:outline-none focus:border-[#1E6091] focus:bg-white"
                  />
                  <p className="text-[11px] text-[#7A7468]">
                    In Bing Webmaster Tools, choose <strong>HTML Meta Tag</strong>, then paste the code or tag.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Google Analytics & Google Tag Manager */}
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E6091] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> 2. Google Analytics 4 (GA4) &amp; Google Tag Manager (GTM)
                </h3>
                <span className="text-[11px] text-[#7A7468]">Real-time visitor tracking</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GA4 Measurement ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E1B18]">
                      Google Analytics 4 Measurement ID
                    </label>
                    <a
                      href="https://analytics.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1E6091] hover:underline flex items-center gap-1"
                    >
                      <span>Open GA4</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={trackingForm.google_analytics_id}
                    onChange={(e) => setTrackingForm({ ...trackingForm, google_analytics_id: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] font-mono focus:outline-none focus:border-[#1E6091] focus:bg-white"
                  />
                  <p className="text-[11px] text-[#7A7468]">
                    Found in Google Analytics Admin &rarr; Data Streams &rarr; Measurement ID. Automatically outputs the official <code>gtag.js</code> script.
                  </p>
                </div>

                {/* Google Tag Manager Container ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E1B18]">
                      Google Tag Manager Container ID
                    </label>
                    <a
                      href="https://tagmanager.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1E6091] hover:underline flex items-center gap-1"
                    >
                      <span>Open GTM</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    value={trackingForm.google_tag_manager_id}
                    onChange={(e) => setTrackingForm({ ...trackingForm, google_tag_manager_id: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] font-mono focus:outline-none focus:border-[#1E6091] focus:bg-white"
                  />
                  <p className="text-[11px] text-[#7A7468]">
                    Optional: If using GTM instead of standalone GA4, enter your Container ID to load all your marketing tags.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Custom Tag Submit in Head Option */}
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#C26B18] flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> 3. Custom &lt;head&gt; Code &amp; Script Injection
                  </h3>
                  <p className="text-[11px] text-[#7A7468] mt-0.5">
                    Inject arbitrary custom meta tags, tracking pixels (Meta Pixel, Pinterest, TikTok), Google AdSense, or verification scripts directly into the HTML &lt;head&gt;.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const template = `<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', 'YOUR_PIXEL_ID');\nfbq('track', 'PageView');\n</script>`;
                      setTrackingForm((prev) => ({
                        ...prev,
                        custom_head_tags: prev.custom_head_tags ? `${prev.custom_head_tags}\n\n${template}` : template
                      }));
                    }}
                    className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE7DF] border border-[#DDD5CA] text-[10px] font-bold text-[#6A6357] cursor-pointer"
                  >
                    + Meta Pixel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const template = `<!-- Pinterest Tag -->\n<script>\n!function(e){if(!window.pintrk){window.pintrk = function () {\nwindow.pintrk.queue.push(Array.prototype.slice.call(arguments))};var\n  n=window.pintrk;n.queue=[],n.version="3.0";var\n  t=document.createElement("script");t.async=!0,t.src=e;var\n  r=document.getElementsByTagName("script")[0];\n  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");\npintrk('load', 'YOUR_TAG_ID');\npintrk('page');\n</script>`;
                      setTrackingForm((prev) => ({
                        ...prev,
                        custom_head_tags: prev.custom_head_tags ? `${prev.custom_head_tags}\n\n${template}` : template
                      }));
                    }}
                    className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE7DF] border border-[#DDD5CA] text-[10px] font-bold text-[#6A6357] cursor-pointer"
                  >
                    + Pinterest Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const template = `<meta name="author" content="Toufiq Motion" />\n<meta name="robots" content="index, follow, max-image-preview:large" />`;
                      setTrackingForm((prev) => ({
                        ...prev,
                        custom_head_tags: prev.custom_head_tags ? `${prev.custom_head_tags}\n\n${template}` : template
                      }));
                    }}
                    className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE7DF] border border-[#DDD5CA] text-[10px] font-bold text-[#6A6357] cursor-pointer"
                  >
                    + Custom Meta
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#1E1B18]">HTML / JavaScript Code to Inject</span>
                  <span className="text-[11px] text-[#7A7468]">
                    {trackingForm.custom_head_tags.length} characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder={`<!-- Paste your custom tracking scripts or meta tags here -->\n<script>\n  console.log("Toufiq Studio custom tag active");\n</script>`}
                  value={trackingForm.custom_head_tags}
                  onChange={(e) => setTrackingForm({ ...trackingForm, custom_head_tags: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl p-3 font-mono text-xs text-[#1E1B18] focus:outline-none focus:border-[#C26B18] focus:bg-white leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#EDE7DF]">
                <div className="text-[11px] text-[#7A7468]">
                  Changes are persisted to SQLite and immediately injected into the live HTML output.
                </div>
                <button
                  type="submit"
                  disabled={isSavingTracking}
                  className="px-6 py-2.5 rounded-xl bg-[#2E7D5A] text-white hover:bg-[#246649] font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingTracking ? 'Saving...' : 'Save & Deploy to <head>'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Card 4: Live Injected Head Preview & Server Verification */}
          {headVerification && (
            <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#543884] flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Live Injected &lt;head&gt; HTML Inspector
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                  Verified Live
                </span>
              </div>

              <div className="bg-[#FAF8F5] rounded-xl p-3.5 border border-[#DDD5CA] font-mono text-[11px] text-[#2E4A3B] overflow-x-auto max-h-56 leading-relaxed">
                <pre>{headVerification.injectedPreview || '<!-- No custom head tags currently configured -->'}</pre>
              </div>
            </div>
          )}

          {/* Card 5: Real Instant URL Indexing Submission Tool (IndexNow & Google API) */}
          <div className="bg-white rounded-2xl p-5 border border-[#EDE7DF] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2E7D5A] flex items-center gap-2">
                <Send className="w-4 h-4" /> Instant Search Engine Indexing (Google API &amp; Bing IndexNow)
              </h3>
              <span className="text-xs text-[#7A7468]">Real-time Crawl Queue</span>
            </div>

            <p className="text-xs text-[#7A7468]">
              Instantly notify Google and Bing crawlers about new or updated articles to achieve fastest indexing without waiting for passive crawl cycles.
            </p>

            <form onSubmit={handleSubmitIndexing} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="url"
                placeholder="https://toufiqmotion.com/travel/amalfi-coast-guide"
                value={indexingUrl}
                onChange={(e) => setIndexingUrl(e.target.value)}
                className="flex-1 bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] placeholder-[#9E9587] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
              />
              <select
                value={indexingEngine}
                onChange={(e) => setIndexingEngine(e.target.value)}
                className="bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
              >
                <option value="Google Indexing API">Google Indexing API</option>
                <option value="Bing IndexNow">Bing IndexNow</option>
              </select>
              <button
                type="submit"
                disabled={isSubmittingIndex}
                className="px-5 py-2 rounded-xl bg-[#2E7D5A] text-white hover:bg-[#246649] font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                {isSubmittingIndex ? 'Submitting...' : 'Queue Index Crawl'}
              </button>
            </form>

            {indexingLogs.length > 0 && (
              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EDE7DF] max-h-36 overflow-y-auto space-y-1.5">
                {indexingLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#1E1B18] truncate max-w-sm">{log.url}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#2E7D5A] font-bold">200 Queued</span>
                      <span className="text-[#7A7468] text-[10px]">{log.created_at?.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: QUICK EDIT SEO
          ========================================================================= */}
      {editingAuditItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingAuditItem(null);
          }}
        >
          <div className="bg-white border border-[#EDE7DF] text-[#1E1B18] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DF] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#2E7D5A] block">
                  Quick SEO Metadata Editor
                </span>
                <h3 className="font-serif font-bold text-base text-[#1E1B18] line-clamp-1 mt-0.5">
                  {editingAuditItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAuditItem(null)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EDE7DF] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#6A6357] hover:text-white shadow-xs cursor-pointer"
                title="Close"
              >
                <span className="text-xs font-bold uppercase tracking-wider">Close</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSeo} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Focus Keyphrase</label>
                <input
                  type="text"
                  value={quickSeoForm.focusKeyword}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, focusKeyword: e.target.value })}
                  placeholder="e.g. amalfi coast guide"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">SEO Meta Title</label>
                <input
                  type="text"
                  value={quickSeoForm.metaTitle}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, metaTitle: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Meta Description</label>
                <textarea
                  rows={3}
                  value={quickSeoForm.metaDescription}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, metaDescription: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl p-3 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Canonical URL</label>
                <input
                  type="text"
                  value={quickSeoForm.canonicalUrl}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, canonicalUrl: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#2E7D5A] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="noIndexToggle"
                  checked={quickSeoForm.noIndex}
                  onChange={(e) => setQuickSeoForm({ ...quickSeoForm, noIndex: e.target.checked })}
                  className="rounded border-[#DDD5CA] text-[#C93B3B] focus:ring-0"
                />
                <label htmlFor="noIndexToggle" className="text-xs text-[#7A7468]">
                  Instruct search crawlers not to index this story (noindex)
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EDE7DF]">
                <button
                  type="button"
                  onClick={() => setEditingAuditItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DDD5CA] text-[#6A6357] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickSeo}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E7D5A] text-white hover:bg-[#246649] transition-all shadow-xs cursor-pointer"
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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRedirectModalOpen(false);
          }}
        >
          <div className="bg-white border border-[#EDE7DF] text-[#1E1B18] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DF] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#1E6091] block">
                  Link Equity Manager
                </span>
                <h3 className="font-serif font-bold text-base text-[#1E1B18] mt-0.5">
                  {editingRedirectId ? 'Edit Redirect Rule' : 'Add 301/302 Redirect Rule'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRedirectModalOpen(false)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EDE7DF] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#6A6357] hover:text-white shadow-xs cursor-pointer"
                title="Close"
              >
                <span className="text-xs font-bold uppercase tracking-wider">Close</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveRedirect} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Source Request Path</label>
                <input
                  type="text"
                  required
                  placeholder="/old-travel-guide"
                  value={redirectForm.sourcePath}
                  onChange={(e) => setRedirectForm({ ...redirectForm, sourcePath: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E6091] focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E1B18]">Target Destination URL</label>
                <input
                  type="text"
                  required
                  placeholder="/travel or https://..."
                  value={redirectForm.targetPath}
                  onChange={(e) => setRedirectForm({ ...redirectForm, targetPath: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:outline-none focus:border-[#1E6091] focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E1B18]">Redirect Code</label>
                  <select
                    value={redirectForm.redirectCode}
                    onChange={(e) => setRedirectForm({ ...redirectForm, redirectCode: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                  >
                    <option value={301}>301 Permanent (SEO Recommended)</option>
                    <option value={302}>302 Temporary</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E1B18]">Notes / Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Legacy URL"
                    value={redirectForm.notes}
                    onChange={(e) => setRedirectForm({ ...redirectForm, notes: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5CA] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EDE7DF]">
                <button
                  type="button"
                  onClick={() => setIsRedirectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DDD5CA] text-[#6A6357] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E6091] text-white hover:bg-[#164b73] transition-all shadow-xs cursor-pointer"
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
