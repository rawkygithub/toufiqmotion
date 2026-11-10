import React, { useState, useEffect } from 'react';
import { api, AffiliateLink, AffiliateClick, AffiliateOverview, AffiliateSettings } from '../../api/client';
import { MediaLibrary } from './MediaLibrary';
import {
  TrendingUp,
  Link as LinkIcon,
  ShoppingBag,
  ExternalLink,
  Copy,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  MousePointerClick,
  ShieldCheck,
  Check,
  X,
  Code,
  DollarSign,
  Tag,
  Star,
  Globe,
  Sliders,
  Clock,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface AffiliateManagerProps {
  token: string | null;
}

export const AffiliateManager: React.FC<AffiliateManagerProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'box_builder' | 'clicks' | 'ftc'>('overview');

  // Overview data
  const [overview, setOverview] = useState<AffiliateOverview | null>(null);
  const [loading, setLoading] = useState(false);

  // Links Inventory state
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Link Edit / Create Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState({
    title: '',
    slug: '',
    target_url: '',
    merchant: 'Amazon',
    category: 'Camera & Photography',
    price: '$199.00',
    rating: 4.9,
    badge: "Editor's Choice",
    image_url: '',
    description: '',
    pros: 'Outstanding quality, Lightweight & durable, High battery life',
    cons: 'Premium price tag, Limited color options',
    button_text: 'Check Price on Amazon',
    secondary_url: '',
    secondary_button_text: 'Official Website',
    is_active: true
  });
  const [linkSaving, setLinkSaving] = useState(false);

  // Click Logs state
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);

  // FTC Disclosure settings state
  const [ftcSettings, setFtcSettings] = useState<AffiliateSettings>({
    disclosure: 'Affiliate Disclosure: Toufiq Motion is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you. We only recommend gear and stays we genuinely test, use, and love.',
    position: 'top',
    autoNofollow: true
  });
  const [ftcSaving, setFtcSaving] = useState(false);

  // Product Review Box Generator state
  const [selectedProductForBox, setSelectedProductForBox] = useState<string>('');
  const [boxConfig, setBoxConfig] = useState({
    title: 'Sony Alpha 7 IV Full-Frame Camera',
    slug: 'sony-a7iv',
    badge: "Editor's Choice",
    rating: 4.9,
    price: '$2,498.00',
    merchant: 'Amazon',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    description: 'Our primary camera body for documenting high-contrast alpine expeditions and coastal sunrises with unmatched dynamic range and 33MP clarity.',
    pros: ['Outstanding 33MP sensor', 'Class-leading autofocus', 'Weather-sealed chassis'],
    cons: ['Steep learning curve', 'Higher battery drain in 4K'],
    buttonText: 'Check Price on Amazon',
    secondaryUrl: 'https://www.bhphotovideo.com',
    secondaryButtonText: 'View on B&H Photo'
  });
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Media Library Picker
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadOverview();
    loadLinks();
    loadFtcSettings();
  }, [searchQuery, selectedMerchant, selectedCategory]);

  useEffect(() => {
    if (activeTab === 'clicks' && token) {
      loadClicks();
    }
  }, [activeTab]);

  useEffect(() => {
    generateBoxHtmlPreview();
  }, [boxConfig]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadOverview = async () => {
    try {
      const data = await api.getAffiliateOverview();
      setOverview(data);
    } catch (err: any) {
      console.error('Failed to load overview:', err);
    }
  };

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await api.getAffiliateLinks({
        q: searchQuery,
        merchant: selectedMerchant,
        category: selectedCategory
      });
      setLinks(res.links);
    } catch (err: any) {
      console.error('Failed to load links:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClicks = async () => {
    if (!token) return;
    try {
      const res = await api.getAffiliateClicks(token);
      setClicks(res.clicks);
    } catch (err: any) {
      console.error('Failed to load clicks:', err);
    }
  };

  const loadFtcSettings = async () => {
    try {
      const res = await api.getAffiliateSettings();
      if (res.settings) {
        setFtcSettings(res.settings);
      }
    } catch {}
  };

  // Open modal to create new affiliate link
  const openNewLinkModal = () => {
    setEditingLinkId(null);
    setLinkForm({
      title: '',
      slug: '',
      target_url: '',
      merchant: 'Amazon',
      category: 'Camera & Photography',
      price: '$99.00',
      rating: 4.9,
      badge: "Editor's Choice",
      image_url: '',
      description: '',
      pros: 'Top-tier performance, Durable construction, Highly rated',
      cons: 'Premium price point',
      button_text: 'Check Price on Amazon',
      secondary_url: '',
      secondary_button_text: 'Official Store',
      is_active: true
    });
    setIsLinkModalOpen(true);
  };

  // Open modal to edit existing link
  const openEditLinkModal = (link: AffiliateLink) => {
    setEditingLinkId(link.id);
    setLinkForm({
      title: link.title,
      slug: link.slug,
      target_url: link.target_url,
      merchant: link.merchant,
      category: link.category,
      price: link.price || '',
      rating: link.rating || 4.9,
      badge: link.badge || "Editor's Choice",
      image_url: link.image_url || '',
      description: link.description || '',
      pros: (link.pros || []).join(', '),
      cons: (link.cons || []).join(', '),
      button_text: link.button_text || 'Check Price',
      secondary_url: link.secondary_url || '',
      secondary_button_text: link.secondary_button_text || '',
      is_active: link.is_active
    });
    setIsLinkModalOpen(true);
  };

  // Save Link
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLinkSaving(true);
    try {
      const prosArr = linkForm.pros.split(',').map((p) => p.trim()).filter(Boolean);
      const consArr = linkForm.cons.split(',').map((c) => c.trim()).filter(Boolean);

      const payload = {
        title: linkForm.title.trim(),
        slug: linkForm.slug.trim(),
        target_url: linkForm.target_url.trim(),
        merchant: linkForm.merchant.trim(),
        category: linkForm.category.trim(),
        price: linkForm.price.trim(),
        rating: Number(linkForm.rating) || 4.9,
        badge: linkForm.badge.trim(),
        image_url: linkForm.image_url.trim(),
        description: linkForm.description.trim(),
        pros: prosArr,
        cons: consArr,
        button_text: linkForm.button_text.trim(),
        secondary_url: linkForm.secondary_url.trim(),
        secondary_button_text: linkForm.secondary_button_text.trim(),
        is_active: linkForm.is_active
      };

      if (editingLinkId) {
        await api.updateAffiliateLink(token, editingLinkId, payload);
        showNotification('success', `Affiliate link "${payload.title}" updated.`);
      } else {
        await api.createAffiliateLink(token, payload);
        showNotification('success', `New cloaked link created (/go/${payload.slug || 'slug'}).`);
      }

      setIsLinkModalOpen(false);
      await loadLinks();
      await loadOverview();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save affiliate link');
    } finally {
      setLinkSaving(false);
    }
  };

  // Delete Link
  const handleDeleteLink = async (link: AffiliateLink) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete "${link.title}"? Existing cloaked links (/go/${link.slug}) will stop redirecting.`)) return;
    try {
      await api.deleteAffiliateLink(token, link.id);
      showNotification('success', `Link "${link.title}" deleted.`);
      await loadLinks();
      await loadOverview();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete affiliate link');
    }
  };

  // Copy cloaked URL to clipboard
  const copyCloakedUrl = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const cloaked = `${origin}/go/${slug}`;
    navigator.clipboard.writeText(cloaked);
    setCopiedSlug(slug);
    showNotification('success', `Cloaked link copied: ${cloaked}`);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Save FTC Settings
  const handleSaveFtcSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFtcSaving(true);
    try {
      await api.saveAffiliateSettings(token, ftcSettings);
      showNotification('success', 'FTC affiliate disclosure settings saved successfully!');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save FTC settings');
    } finally {
      setFtcSaving(false);
    }
  };

  // Generate Review Box HTML
  const generateBoxHtmlPreview = async () => {
    try {
      const res = await api.generateAffiliateBoxHtml(boxConfig);
      setGeneratedHtml(res.html);
    } catch {}
  };

  const copyBoxHtmlToClipboard = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopiedHtml(true);
    showNotification('success', 'Product Review Card HTML copied! Ready to paste into any blog article.');
    setTimeout(() => setCopiedHtml(false), 3000);
  };

  // Populate box builder from an existing affiliate link
  const handleSelectLinkForBox = (id: string) => {
    setSelectedProductForBox(id);
    const found = links.find((l) => l.id === id);
    if (found) {
      setBoxConfig({
        title: found.title,
        slug: found.slug,
        badge: found.badge || "Editor's Choice",
        rating: found.rating || 4.9,
        price: found.price || '',
        merchant: found.merchant,
        imageUrl: found.image_url || '',
        description: found.description || '',
        pros: found.pros || [],
        cons: found.cons || [],
        buttonText: found.button_text || `Check Price on ${found.merchant}`,
        secondaryUrl: found.secondary_url || '',
        secondaryButtonText: found.secondary_button_text || ''
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in fade-in duration-200 ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-75 cursor-pointer ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header & Metrics Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFF2EB] to-[#FFE5D6] text-[#E8734A] flex items-center justify-center font-bold text-xl shadow-2xs border border-[#FFCEBA]/60">
              🛍️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-2xl text-[#1E1B18]">
                  Affiliate Marketing Command Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  FTC Compliant
                </span>
              </div>
              <p className="text-xs text-[#8C8477]">
                Cloaked redirects (/go/:slug), conversion click analytics, product review boxes, and Google-compliant sponsored rel attributes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openNewLinkModal}
              className="py-2.5 px-4 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Affiliate Link</span>
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#F0ECE6]">
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EDE7DF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] block">Total Cloaked Links</span>
              <div className="font-serif text-2xl font-bold text-[#1E1B18] mt-1">{overview.metrics.totalLinks}</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">{overview.metrics.activeLinks} active redirects</span>
            </div>

            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EDE7DF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] block">Tracked Clicks</span>
              <div className="font-serif text-2xl font-bold text-[#E8734A] mt-1">{overview.metrics.totalClicks.toLocaleString()}</div>
              <span className="text-[10px] text-[#8C8477] mt-0.5 block">Lifetime reader referrals</span>
            </div>

            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EDE7DF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] block">Clicks Today</span>
              <div className="font-serif text-2xl font-bold text-[#1E1B18] mt-1">{overview.metrics.clicksToday}</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Last 24 hours</span>
            </div>

            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EDE7DF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] block">Active Networks</span>
              <div className="font-serif text-2xl font-bold text-[#1E1B18] mt-1">{overview.merchants.length}</div>
              <span className="text-[10px] text-sky-600 font-semibold mt-0.5 block">Amazon, Booking, etc.</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-[#EDE7DF] shadow-xs flex flex-wrap items-center gap-1">
        {[
          { id: 'overview', label: 'Performance Overview', icon: TrendingUp },
          { id: 'links', label: `Links & Cloaker (${links.length})`, icon: LinkIcon },
          { id: 'box_builder', label: 'Product Review Box Generator', icon: ShoppingBag },
          { id: 'clicks', label: 'Live Click Stream', icon: MousePointerClick },
          { id: 'ftc', label: 'FTC Disclosure & SEO Settings', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-[#E8734A] text-white shadow-2xs'
                  : 'text-[#5A5348] hover:bg-[#FAF8F5] hover:text-[#1E1B18]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERFORMANCE OVERVIEW                                               */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && overview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Top Clicked Products */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Top Performing Affiliate Products</h3>
                <p className="text-xs text-[#8C8477]">Ranked by total reader referral clicks</p>
              </div>
              <button
                onClick={() => setActiveTab('links')}
                className="text-xs font-bold text-[#E8734A] hover:underline cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {overview.topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DF] hover:border-[#E8734A] transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-white border border-[#E0DCD4] flex items-center justify-center font-bold text-xs text-[#E8734A] shrink-0">
                      #{idx + 1}
                    </span>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-[#EAE5DF] shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE5DF] flex items-center justify-center text-lg shrink-0">📦</div>
                    )}
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors truncate">
                        {p.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8C8477]">
                        <span className="font-mono text-[#E8734A]">/go/{p.slug}</span>
                        <span>&bull;</span>
                        <span className="font-medium text-[#1E1B18]">{p.merchant}</span>
                        {p.price && <span>&bull; {p.price}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-[#1E1B18]">{p.clicks_count.toLocaleString()}</div>
                      <div className="text-[10px] text-[#8C8477]">clicks</div>
                    </div>

                    <button
                      onClick={() => copyCloakedUrl(p.slug)}
                      title="Copy Cloaked Link"
                      className="p-2 rounded-xl bg-white border border-[#E0DCD4] hover:bg-[#FFF2EB] text-[#5A5348] hover:text-[#E8734A] transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (5 cols): Merchant Networks Breakdown & FTC Status */}
          <div className="lg:col-span-5 space-y-6">
            {/* Merchant Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#F0ECE6]">
                <h3 className="font-serif font-bold text-base text-[#1E1B18]">Affiliate Networks Breakdown</h3>
                <p className="text-xs text-[#8C8477]">Click distribution across active partner programs</p>
              </div>

              <div className="space-y-3">
                {overview.merchants.map((m) => (
                  <div key={m.merchant} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E1B18]">{m.merchant}</span>
                      <span className="text-[#8C8477] font-semibold">{m.clicks} clicks ({m.linksCount} links)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#EAE5DF]">
                      <div
                        className="h-full bg-gradient-to-r from-[#E8734A] to-[#F59E0B] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(10, (m.clicks / (overview.metrics.totalClicks || 1)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Monetization Card */}
            <div className="bg-gradient-to-br from-[#FFF2EB] to-[#FFFBF8] rounded-3xl p-6 border border-[#FFCEBA] space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h4 className="font-serif font-bold text-sm text-[#1E1B18]">Affiliate SEO Best Practice</h4>
              </div>
              <p className="text-xs text-[#5A5348] leading-relaxed">
                Google Search and Amazon Associates require every affiliate link to have <code>rel="nofollow sponsored"</code> and a clear FTC disclosure near the top of the article. All your cloaked links automatically comply with these rules.
              </p>
              <button
                onClick={() => setActiveTab('box_builder')}
                className="w-full py-2 rounded-xl bg-white border border-[#FFCEBA] text-[#E8734A] text-xs font-bold hover:bg-[#E8734A] hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                Open Review Box Generator &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AFFILIATE LINKS & CLOAKER INVENTORY                                 */}
      {/* ========================================================================= */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8477]" />
                <input
                  type="text"
                  placeholder="Search products or slugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] placeholder-[#A39B8E] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <select
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#1E1B18] focus:outline-hidden"
              >
                <option value="all">All Merchants</option>
                <option value="Amazon">Amazon</option>
                <option value="Booking.com">Booking.com</option>
                <option value="Patagonia">Patagonia</option>
                <option value="Leica">Leica</option>
                <option value="Agoda">Agoda</option>
                <option value="GetYourGuide">GetYourGuide</option>
              </select>
            </div>

            <button
              onClick={openNewLinkModal}
              className="py-2 px-3.5 rounded-xl bg-[#E8734A] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-[#D56237] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          {/* Links Table */}
          <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] text-[#8C8477] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                    <th className="py-3 px-5">Product &amp; Cloaked URL</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Clicks</th>
                    <th className="py-3 px-4">Rel Tags</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8C8477]">
                        <div className="w-6 h-6 border-2 border-[#E8734A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading affiliate links...
                      </td>
                    </tr>
                  ) : links.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8C8477]">
                        No affiliate links found. Click "Add Link" to create your first cloaked redirect!
                      </td>
                    </tr>
                  ) : (
                    links.map((link) => (
                      <tr key={link.id} className="hover:bg-[#FAF8F5] transition-colors group">
                        <td className="py-3.5 px-5">
                          <div className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
                            {link.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[#E8734A] font-bold text-[11px]">
                              /go/{link.slug}
                            </span>
                            <span className="text-[10px] text-[#8C8477] truncate max-w-xs">
                              &rarr; {link.target_url}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#1E1B18]">
                          {link.merchant}
                        </td>

                        <td className="py-3.5 px-4 text-[#5A5348]">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E0DCD4] text-[10px]">
                            {link.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#1E1B18]">
                          {link.price || '—'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-serif font-bold text-sm text-[#E8734A]">
                            {link.clicks_count.toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] text-[#2E7D5A] bg-[#EDF7F1] px-2 py-0.5 rounded-md border border-[#C8E9D6]">
                            nofollow sponsored
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => copyCloakedUrl(link.slug)}
                              title="Copy Cloaked Link URL (/go/slug)"
                              className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#5A5348] hover:bg-[#E8734A] hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedSlug === link.slug ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <a
                              href={`/go/${link.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Test Cloaked Redirect"
                              className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#5A5348] hover:bg-[#E0DCD4] transition-colors cursor-pointer inline-flex"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => {
                                handleSelectLinkForBox(link.id);
                                setActiveTab('box_builder');
                              }}
                              title="Generate Product Review Box HTML"
                              className="p-1.5 rounded-lg bg-[#FFF2EB] text-[#E8734A] hover:bg-[#E8734A] hover:text-white transition-colors cursor-pointer"
                            >
                              <Code className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openEditLinkModal(link)}
                              title="Edit Affiliate Link"
                              className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#5A5348] hover:bg-[#E0DCD4] transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteLink(link)}
                              title="Delete Link"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRODUCT REVIEW BOX GENERATOR (WYSIWYG & HTML OUTPUT)                */}
      {/* ========================================================================= */}
      {activeTab === 'box_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Box Customizer (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1E1B18]">Product Review Card Builder</h3>
                <p className="text-[10px] text-[#8C8477]">Generate high-converting editorial product units</p>
              </div>

              {links.length > 0 && (
                <select
                  value={selectedProductForBox}
                  onChange={(e) => handleSelectLinkForBox(e.target.value)}
                  className="px-2.5 py-1 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#1E1B18]"
                >
                  <option value="">-- Load from link --</option>
                  {links.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                Product Title
              </label>
              <input
                type="text"
                value={boxConfig.title}
                onChange={(e) => setBoxConfig({ ...boxConfig, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-semibold text-[#1E1B18] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Award Badge
                </label>
                <input
                  type="text"
                  value={boxConfig.badge}
                  onChange={(e) => setBoxConfig({ ...boxConfig, badge: e.target.value })}
                  placeholder="e.g. Editor's Choice"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Rating (0 - 5.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={boxConfig.rating}
                  onChange={(e) => setBoxConfig({ ...boxConfig, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Price Display
                </label>
                <input
                  type="text"
                  value={boxConfig.price}
                  onChange={(e) => setBoxConfig({ ...boxConfig, price: e.target.value })}
                  placeholder="e.g. $2,498.00"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Merchant
                </label>
                <input
                  type="text"
                  value={boxConfig.merchant}
                  onChange={(e) => setBoxConfig({ ...boxConfig, merchant: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                Product Image URL
              </label>
              <input
                type="text"
                value={boxConfig.imageUrl}
                onChange={(e) => setBoxConfig({ ...boxConfig, imageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                Cloaked Redirect Slug (/go/:slug)
              </label>
              <input
                type="text"
                value={boxConfig.slug}
                onChange={(e) => setBoxConfig({ ...boxConfig, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-mono text-[#E8734A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                Description / Verdict
              </label>
              <textarea
                rows={2}
                value={boxConfig.description}
                onChange={(e) => setBoxConfig({ ...boxConfig, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                Pros (comma separated)
              </label>
              <input
                type="text"
                value={boxConfig.pros.join(', ')}
                onChange={(e) => setBoxConfig({ ...boxConfig, pros: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                Cons / Considerations (comma separated)
              </label>
              <input
                type="text"
                value={boxConfig.cons.join(', ')}
                onChange={(e) => setBoxConfig({ ...boxConfig, cons: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
              />
            </div>
          </div>

          {/* Right Column: Live Render & Copy HTML (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E8734A]" />
                  <span className="font-serif font-bold text-sm text-[#1E1B18]">Live WYSIWYG Card Preview</span>
                </div>

                <button
                  onClick={copyBoxHtmlToClipboard}
                  className="px-4 py-2 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {copiedHtml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedHtml ? 'HTML Copied!' : 'Copy Card HTML'}</span>
                </button>
              </div>

              {/* Rendered HTML Preview */}
              <div
                className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE7DF]"
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
              />

              {/* Raw HTML Code Box */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] block mb-1">
                  Ready-to-Paste HTML (can also be inserted via Rich Text Editor &rarr; Affiliate Box)
                </span>
                <textarea
                  readOnly
                  rows={6}
                  value={generatedHtml}
                  className="w-full p-3 rounded-xl bg-[#1E1B18] text-emerald-400 font-mono text-[11px] leading-relaxed focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE CLICK ANALYTICS STREAM                                        */}
      {/* ========================================================================= */}
      {activeTab === 'clicks' && (
        <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Live Referral Click Stream</h3>
              <p className="text-xs text-[#8C8477]">Recent 50 times readers clicked an affiliate product on your blog</p>
            </div>
            <button
              onClick={loadClicks}
              className="px-3 py-1.5 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#5A5348] hover:bg-white cursor-pointer"
            >
              Refresh Feed
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#8C8477] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-4">Product / Slug</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Referrer Article</th>
                  <th className="py-3 px-4">Reader Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB]">
                {clicks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#8C8477]">
                      No clicks recorded yet. Once readers click your cloaked links, events will appear here in real time.
                    </td>
                  </tr>
                ) : (
                  clicks.map((clk) => (
                    <tr key={clk.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-5 font-mono text-[11px] text-[#8C8477]">
                        {new Date(clk.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1E1B18]">
                        <div>{clk.product_title || clk.slug}</div>
                        <div className="font-mono text-[#E8734A] text-[10px]">/go/{clk.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E1B18]">
                        {clk.merchant || 'Amazon'}
                      </td>
                      <td className="py-3.5 px-4 text-[#5A5348] font-mono text-[11px]">
                        {clk.referer || 'Direct'}
                      </td>
                      <td className="py-3.5 px-4 text-[#8C8477] text-[11px] truncate max-w-xs">
                        {clk.user_agent?.slice(0, 35)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FTC DISCLOSURE & SEO SETTINGS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'ftc' && (
        <div className="max-w-3xl bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#F0ECE6]">
            <h3 className="font-serif font-bold text-xl text-[#1E1B18]">FTC Affiliate Disclosure &amp; SEO Rules</h3>
            <p className="text-xs text-[#8C8477]">
              Configure sitewide disclosure text and Google sponsored link compliance
            </p>
          </div>

          <form onSubmit={handleSaveFtcSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8477] mb-1.5">
                Sitewide Affiliate Disclosure Text
              </label>
              <textarea
                rows={4}
                value={ftcSettings.disclosure}
                onChange={(e) => setFtcSettings({ ...ftcSettings, disclosure: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] leading-relaxed focus:outline-hidden focus:border-[#E8734A]"
              />
              <span className="text-[11px] text-[#8C8477] mt-1 block">
                This notice is automatically displayed near the top of every blog post that contains affiliate links.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C8477] mb-1.5">
                Disclosure Position
              </label>
              <select
                value={ftcSettings.position}
                onChange={(e) => setFtcSettings({ ...ftcSettings, position: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#1E1B18] focus:outline-hidden"
              >
                <option value="top">Top of article (Recommended by FTC &amp; Amazon)</option>
                <option value="inline">Before first product box</option>
                <option value="bottom">Bottom of article</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#EDF7F1] border border-[#C8E9D6] flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-xs text-[#2E7D5A]">Auto-Inject rel="nofollow sponsored"</div>
                <div className="text-[11px] text-[#2E7D5A]/80">
                  Adheres to Google Search spam policies to protect your search rankings.
                </div>
              </div>
              <input
                type="checkbox"
                checked={ftcSettings.autoNofollow}
                onChange={(e) => setFtcSettings({ ...ftcSettings, autoNofollow: e.target.checked })}
                className="w-4 h-4 text-[#E8734A] rounded-sm focus:ring-[#E8734A]"
              />
            </div>

            <button
              type="submit"
              disabled={ftcSaving}
              className="py-2.5 px-6 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {ftcSaving ? 'Saving Settings...' : 'Save FTC Settings'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT AFFILIATE LINK                                       */}
      {/* ========================================================================= */}
      {isLinkModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLinkModalOpen(false);
          }}
        >
          <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-[#EDE7DF] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#F0ECE6] flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1E1B18]">
                  {editingLinkId ? 'Edit Affiliate Link' : 'Add New Cloaked Affiliate Link'}
                </h3>
                <p className="text-xs text-[#8C8477]">
                  Creates a clean /go/:slug redirect with conversion click tracking
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#4A453E] shadow-xs cursor-pointer"
                title="Close"
              >
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white">Close</span>
                <X className="w-3.5 h-3.5 group-hover:text-white" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 sm:p-8 grow">
              <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Product / Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={linkForm.title}
                  onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                  placeholder="e.g. Sony Alpha 7 IV Camera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-semibold text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Target Raw Affiliate URL * (with partner tag)
                </label>
                <input
                  type="url"
                  required
                  value={linkForm.target_url}
                  onChange={(e) => setLinkForm({ ...linkForm, target_url: e.target.value })}
                  placeholder="https://amazon.com/dp/B09JZT6YK5?tag=yourtag-20"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-mono text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                    Cloaked URL Slug (/go/:slug)
                  </label>
                  <input
                    type="text"
                    value={linkForm.slug}
                    onChange={(e) => setLinkForm({ ...linkForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="e.g. sony-a7iv"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-mono text-[#E8734A] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                    Merchant / Network
                  </label>
                  <input
                    type="text"
                    value={linkForm.merchant}
                    onChange={(e) => setLinkForm({ ...linkForm, merchant: e.target.value })}
                    placeholder="Amazon, Booking.com, etc."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={linkForm.category}
                    onChange={(e) => setLinkForm({ ...linkForm, category: e.target.value })}
                    placeholder="Gear, Coffee, Hotel..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    value={linkForm.price}
                    onChange={(e) => setLinkForm({ ...linkForm, price: e.target.value })}
                    placeholder="$199.00"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                    Award Badge
                  </label>
                  <input
                    type="text"
                    value={linkForm.badge}
                    onChange={(e) => setLinkForm({ ...linkForm, badge: e.target.value })}
                    placeholder="Editor's Choice"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Product Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={linkForm.image_url}
                    onChange={(e) => setLinkForm({ ...linkForm, image_url: e.target.value })}
                    placeholder="https://..."
                    className="grow px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-[#FFF2EB] text-[#E8734A] hover:bg-[#E8734A] hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Library
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Editorial Verdict / Summary
                </label>
                <textarea
                  rows={2}
                  value={linkForm.description}
                  onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                  placeholder="Why we recommend this product..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Pros (comma separated)
                </label>
                <input
                  type="text"
                  value={linkForm.pros}
                  onChange={(e) => setLinkForm({ ...linkForm, pros: e.target.value })}
                  placeholder="Pro 1, Pro 2, Pro 3"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                  Cons (comma separated)
                </label>
                <input
                  type="text"
                  value={linkForm.cons}
                  onChange={(e) => setLinkForm({ ...linkForm, cons: e.target.value })}
                  placeholder="Con 1, Con 2"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F0ECE6]">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#5A5348] hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {linkSaving ? 'Saving Link...' : 'Save Affiliate Link'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMediaPickerOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E0DCD4] flex items-center justify-between shrink-0">
              <h3 className="font-serif font-bold text-xl text-[#1E1B18]">Select Product Image</h3>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#4A453E] shadow-xs cursor-pointer"
                title="Close"
              >
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white">Close</span>
                <X className="w-3.5 h-3.5 group-hover:text-white" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 grow">
              <MediaLibrary
                token={token}
                selectionMode={true}
                onSelectImage={(url) => {
                  setLinkForm({ ...linkForm, image_url: url });
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
