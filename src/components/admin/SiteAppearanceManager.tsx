import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api, SiteSettings, MenuItem, FooterValueProp, LegalLink } from '../../api/client';
import {
  Layout,
  Image as ImageIcon,
  Type,
  Menu as MenuIcon,
  Layers,
  Link2,
  Upload,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Sparkles,
  Sliders,
  Compass,
  Coffee,
  Heart,
  Home as HomeIcon,
  ShieldCheck,
  Camera,
  Save,
  RotateCcw,
  X,
  Bell,
  Palette
} from 'lucide-react';

interface SiteAppearanceManagerProps {
  token: string | null;
}

export const SiteAppearanceManager: React.FC<SiteAppearanceManagerProps> = ({ token }) => {
  const { siteSettings, setSiteSettings, refreshSiteSettings } = useTheme();

  // Active sub-tab inside the customizer
  const [activeSubTab, setActiveSubTab] = useState<'home_layout' | 'logo' | 'header' | 'menu' | 'footer' | 'credits'>('home_layout');

  // Form local state
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  // Quick instant activation of home variant
  const handleSelectHomeVariant = async (variant: 'design1' | 'design2' | 'design3') => {
    const updated = { ...formData, home_variant: variant };
    setFormData(updated);
    if (!token) return;
    try {
      await api.saveSiteSettings(token, { home_variant: variant });
      setSiteSettings((prev) => ({ ...prev, home_variant: variant }));
      await refreshSiteSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.warn('Could not auto-save home variant:', err);
    }
  };

  // Menu item modal state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
  const [menuForm, setMenuForm] = useState<MenuItem>({
    id: '',
    label: '',
    type: 'page',
    pageId: 'travel',
    url: '/travel',
    hasDropdown: false,
    enabled: true
  });

  // Sync local state when siteSettings change
  useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  // Handle direct file upload for logo image
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploadingLogo(true);
    try {
      const uploadRes = await api.uploadMedia(token, file);
      setFormData((prev) => ({
        ...prev,
        logo_type: 'image',
        logo_url: uploadRes.url
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload logo image');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle direct file upload for favicon (.ico, .png, .svg, .webp)
  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploadingFavicon(true);
    try {
      const uploadRes = await api.uploadMedia(token, file);
      setFormData((prev) => ({
        ...prev,
        favicon_url: uploadRes.url
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload favicon icon');
    } finally {
      setIsUploadingFavicon(false);
      if (e.target) e.target.value = '';
    }
  };

  // Save all customizer settings to backend
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return alert('Admin authentication required');

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.saveSiteSettings(token, formData);
      setSiteSettings(formData);
      await refreshSiteSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save appearance settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Menu builder handlers
  const openAddMenuModal = () => {
    setEditingMenuIndex(null);
    setMenuForm({
      id: 'm-' + Date.now(),
      label: '',
      type: 'page',
      pageId: 'travel',
      url: '/travel',
      hasDropdown: false,
      enabled: true
    });
    setIsMenuModalOpen(true);
  };

  const openEditMenuModal = (index: number) => {
    setEditingMenuIndex(index);
    setMenuForm(formData.menu_items_json?.[index] || {
      id: 'm-' + Date.now(),
      label: '',
      type: 'page',
      pageId: 'travel',
      url: '/travel',
      hasDropdown: false,
      enabled: true
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.label.trim()) return alert('Please enter a menu label');

    const currentMenus = [...(formData.menu_items_json || [])];

    if (editingMenuIndex !== null) {
      currentMenus[editingMenuIndex] = menuForm;
    } else {
      currentMenus.push(menuForm);
    }

    setFormData((prev) => ({
      ...prev,
      menu_items_json: currentMenus
    }));
    setIsMenuModalOpen(false);
  };

  const handleDeleteMenuItem = (index: number) => {
    if (!confirm('Are you sure you want to remove this menu item?')) return;
    const currentMenus = [...(formData.menu_items_json || [])];
    currentMenus.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      menu_items_json: currentMenus
    }));
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    const currentMenus = [...(formData.menu_items_json || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMenus.length) return;

    const temp = currentMenus[index];
    currentMenus[index] = currentMenus[targetIndex];
    currentMenus[targetIndex] = temp;

    setFormData((prev) => ({
      ...prev,
      menu_items_json: currentMenus
    }));
  };

  const handleToggleMenuEnabled = (index: number) => {
    const currentMenus = [...(formData.menu_items_json || [])];
    currentMenus[index] = {
      ...currentMenus[index],
      enabled: !currentMenus[index].enabled
    };
    setFormData((prev) => ({
      ...prev,
      menu_items_json: currentMenus
    }));
  };

  return (
    <div className="bg-[#FAF8F5] rounded-3xl border border-[#EDE7DF] shadow-sm overflow-hidden text-[#1E1B18] space-y-6 p-6 sm:p-8">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EAE5DF] pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
            Visual Brand Customizer
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] mt-0.5">
            Header, Logo, Menu &amp; Footer Manager
          </h2>
          <p className="text-xs text-[#7A7468] mt-1">
            Customize your brand logo, announcement banner, navigation menu items, footer columns, value strip, and legal copyright credits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Saved &amp; Live!
            </div>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Appearance'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#EAE5DF] gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('home_layout')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'home_layout'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Homepage Layout (3 Designs)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logo')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'logo'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Brand Logo &amp; Favicon</span>
        </button>

        <button
          onClick={() => setActiveSubTab('header')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'header'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Header &amp; Announcement Bar</span>
        </button>

        <button
          onClick={() => setActiveSubTab('menu')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'menu'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <MenuIcon className="w-4 h-4" />
          <span>Navigation Menu Builder ({(formData.menu_items_json || []).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('footer')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'footer'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Footer Content &amp; Value Strip</span>
        </button>

        <button
          onClick={() => setActiveSubTab('credits')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'credits'
              ? 'border-[#E8734A] text-[#E8734A]'
              : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Footer Credits &amp; Legal</span>
        </button>
      </div>

      {/* =====================================================================
          SUB-TAB 0: HOMEPAGE DESIGNER LAYOUT SELECTION
          ===================================================================== */}
      {activeSubTab === 'home_layout' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#EDE7DF] space-y-2 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
                  Visitor Experience &bull; Page 1 Master Architecture
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1E1B18] mt-0.5">
                  Select Active Homepage Design for Public Visitors
                </h3>
              </div>
              <button
                type="button"
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] text-[#4A453E] hover:text-[#E8734A] text-xs font-semibold transition-all cursor-pointer shadow-2xs group self-start sm:self-auto"
                title="Preview live site in new tab"
              >
                <Eye className="w-3.5 h-3.5 text-[#E8734A]" />
                <span>View Live Homepage ↗</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7468] leading-relaxed pt-1">
              Select which of the 3 editorial layouts public visitors will see when landing on your blog. The layout switcher has been removed from the public frontend so readers enjoy a clean, distraction-free magazine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* DESIGN 1: Minimal Magazine */}
            <div
              onClick={() => handleSelectHomeVariant('design1')}
              className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between shadow-2xs relative ${
                (formData.home_variant || 'design1') === 'design1'
                  ? 'border-[#E8734A] ring-3 ring-[#E8734A]/15 bg-gradient-to-b from-[#FFFBF8] to-white shadow-md'
                  : 'border-[#EAE5DF] hover:border-[#D5CFC5] hover:shadow-md'
              }`}
            >
              {(formData.home_variant || 'design1') === 'design1' && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#E8734A] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Check className="w-3.5 h-3.5" /> Active on Live Site
                </div>
              )}

              <div className="space-y-4">
                {/* Visual Blueprint Diagram */}
                <div className="rounded-2xl overflow-hidden border border-[#EAE5DF] bg-[#FAF8F5] p-3.5 aspect-[16/10] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF]">
                    <div className="w-16 h-2 rounded-full bg-[#1E1B18]/70" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#E8734A]" />
                      <div className="w-2 h-2 rounded-full bg-[#EAE5DF]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 my-1.5 items-center">
                    <div className="col-span-7 space-y-1">
                      <div className="w-full h-3.5 rounded bg-[#1E1B18]/80" />
                      <div className="w-4/5 h-2 rounded bg-[#8C8477]/40" />
                      <div className="w-2/3 h-2 rounded bg-[#8C8477]/30" />
                    </div>
                    <div className="col-span-5 h-16 rounded-t-full bg-gradient-to-b from-[#FFD8C7] to-[#E8734A]/80 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                      Arch Hero
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-[#EAE5DF]">
                    <div className="h-4 rounded bg-white flex items-center justify-center text-[9px]">✈️</div>
                    <div className="h-4 rounded bg-white flex items-center justify-center text-[9px]">☕</div>
                    <div className="h-4 rounded bg-white flex items-center justify-center text-[9px]">🌿</div>
                    <div className="h-4 rounded bg-white flex items-center justify-center text-[9px]">💼</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8734A]">Style 1 &bull; PDF Page 1</div>
                  <h4 className="font-serif font-bold text-xl text-[#1E1B18] mt-0.5">Design 1 — Minimal Magazine</h4>
                  <p className="text-xs text-[#7A7468] mt-1.5 leading-relaxed">
                    Split hero section with signature arched photography, 4 circular category icons, Swiss Alps editorial feature card, and a 3-column curated story grid.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0ECE6] space-y-2 text-xs text-[#554E42]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>Signature Arched Feature Photo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>4 Circular Category Navigation Badges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>Swiss Alps Featured Story Card</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHomeVariant('design1');
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    (formData.home_variant || 'design1') === 'design1'
                      ? 'bg-[#E8734A] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4A453E] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-white'
                  }`}
                >
                  {(formData.home_variant || 'design1') === 'design1' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Currently Active
                    </>
                  ) : (
                    'Activate Design 1'
                  )}
                </button>
              </div>
            </div>

            {/* DESIGN 2: Clean Editorial */}
            <div
              onClick={() => handleSelectHomeVariant('design2')}
              className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between shadow-2xs relative ${
                formData.home_variant === 'design2'
                  ? 'border-[#E8734A] ring-3 ring-[#E8734A]/15 bg-gradient-to-b from-[#FFFBF8] to-white shadow-md'
                  : 'border-[#EAE5DF] hover:border-[#D5CFC5] hover:shadow-md'
              }`}
            >
              {formData.home_variant === 'design2' && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#E8734A] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Check className="w-3.5 h-3.5" /> Active on Live Site
                </div>
              )}

              <div className="space-y-4">
                {/* Visual Blueprint Diagram */}
                <div className="rounded-2xl overflow-hidden border border-[#EAE5DF] bg-[#FAF8F5] p-3.5 aspect-[16/10] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF]">
                    <div className="w-16 h-2 rounded-full bg-[#1E1B18]/70" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#E8734A]" />
                      <div className="w-2 h-2 rounded-full bg-[#EAE5DF]" />
                    </div>
                  </div>
                  {/* Full Bleed Panorama Box */}
                  <div className="h-16 rounded-xl bg-gradient-to-r from-[#2A2622] via-[#4A423A] to-[#2A2622] text-white p-2 flex flex-col justify-end shadow-2xs my-1">
                    <div className="w-2/3 h-2.5 rounded bg-white/90" />
                    <div className="w-1/3 h-1.5 rounded bg-white/60 mt-1" />
                  </div>
                  {/* 3 Category Cards Grid */}
                  <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-[#EAE5DF]">
                    <div className="h-5 rounded-lg bg-white border border-[#EAE5DF] flex items-center justify-center text-[8px] font-bold text-[#4A453E]">Travel</div>
                    <div className="h-5 rounded-lg bg-white border border-[#EAE5DF] flex items-center justify-center text-[8px] font-bold text-[#4A453E]">Lifestyle</div>
                    <div className="h-5 rounded-lg bg-white border border-[#EAE5DF] flex items-center justify-center text-[8px] font-bold text-[#4A453E]">Health</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8734A]">Style 2 &bull; PDF Page 1</div>
                  <h4 className="font-serif font-bold text-xl text-[#1E1B18] mt-0.5">Design 2 — Clean Editorial</h4>
                  <p className="text-xs text-[#7A7468] mt-1.5 leading-relaxed">
                    Full-bleed alpine panoramic hero header, 3 large rounded destination showcase cards, and a spacious, elegant reading flow.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0ECE6] space-y-2 text-xs text-[#554E42]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>Full-Width Panoramic Alpine Hero</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>3 Large Rounded Destination Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>Editorial Flow with Bold Typography</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHomeVariant('design2');
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.home_variant === 'design2'
                      ? 'bg-[#E8734A] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4A453E] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-white'
                  }`}
                >
                  {formData.home_variant === 'design2' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Currently Active
                    </>
                  ) : (
                    'Activate Design 2'
                  )}
                </button>
              </div>
            </div>

            {/* DESIGN 3: Modern Card Style */}
            <div
              onClick={() => handleSelectHomeVariant('design3')}
              className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between shadow-2xs relative ${
                formData.home_variant === 'design3'
                  ? 'border-[#E8734A] ring-3 ring-[#E8734A]/15 bg-gradient-to-b from-[#FFFBF8] to-white shadow-md'
                  : 'border-[#EAE5DF] hover:border-[#D5CFC5] hover:shadow-md'
              }`}
            >
              {formData.home_variant === 'design3' && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#E8734A] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Check className="w-3.5 h-3.5" /> Active on Live Site
                </div>
              )}

              <div className="space-y-4">
                {/* Visual Blueprint Diagram */}
                <div className="rounded-2xl overflow-hidden border border-[#EAE5DF] bg-[#FAF8F5] p-3.5 aspect-[16/10] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF]">
                    <div className="w-16 h-2 rounded-full bg-[#1E1B18]/70" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#E8734A]" />
                      <div className="w-2 h-2 rounded-full bg-[#EAE5DF]" />
                    </div>
                  </div>
                  {/* Asymmetric 2-Column Mockup */}
                  <div className="grid grid-cols-12 gap-2 my-1 items-stretch">
                    <div className="col-span-7 h-16 rounded-xl bg-gradient-to-br from-[#1E1B18] to-[#3A332C] text-white p-2 flex flex-col justify-between shadow-2xs">
                      <span className="text-[7px] text-[#FFB599] uppercase font-bold">Amalfi Feature</span>
                      <div className="w-full h-2 rounded bg-white/80" />
                    </div>
                    <div className="col-span-5 flex flex-col gap-1 justify-between">
                      <div className="h-7 rounded-lg bg-white border border-[#EAE5DF] p-1 flex items-center">
                        <div className="w-3/4 h-1.5 rounded bg-[#8C8477]/40" />
                      </div>
                      <div className="h-7 rounded-lg bg-white border border-[#EAE5DF] p-1 flex items-center">
                        <div className="w-2/3 h-1.5 rounded bg-[#8C8477]/40" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#EAE5DF] text-[8px] text-[#8C8477]">
                    <span>Stamp Overlay</span>
                    <span className="text-[#E8734A] font-bold">Handcrafted Ethos</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8734A]">Style 3 &bull; PDF Page 1</div>
                  <h4 className="font-serif font-bold text-xl text-[#1E1B18] mt-0.5">Design 3 — Modern Card Style</h4>
                  <p className="text-xs text-[#7A7468] mt-1.5 leading-relaxed">
                    Asymmetric layout with dark coastal Amalfi feature card, handwritten script stamp overlay, and stacked secondary stories.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0ECE6] space-y-2 text-xs text-[#554E42]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>Asymmetric Amalfi Feature Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>Handwritten Script Stamp Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8734A] shrink-0" />
                    <span>Stacked Secondary Editorial Cards</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHomeVariant('design3');
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.home_variant === 'design3'
                      ? 'bg-[#E8734A] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-[#4A453E] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-white'
                  }`}
                >
                  {formData.home_variant === 'design3' ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Currently Active
                    </>
                  ) : (
                    'Activate Design 3'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 1: BRAND LOGO & IDENTITY
          ===================================================================== */}
      {activeSubTab === 'logo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            
            {/* Logo Display Mode Toggle */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8C8477] block">
                Logo Display Format
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logo_type: 'text' })}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    formData.logo_type === 'text'
                      ? 'border-[#E8734A] bg-[#FFF5EF] text-[#C85228]'
                      : 'border-[#EAE5DF] bg-[#FAF8F5] text-[#554E42] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Type className="w-5 h-5 text-[#E8734A]" />
                    {formData.logo_type === 'text' && <Check className="w-4 h-4 text-[#E8734A]" />}
                  </div>
                  <div className="font-serif font-bold text-sm">Editorial Text Monogram</div>
                  <div className="text-[11px] text-[#7A7468] mt-0.5">Styled serif typography + subtitle</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logo_type: 'image' })}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    formData.logo_type === 'image'
                      ? 'border-[#E8734A] bg-[#FFF5EF] text-[#C85228]'
                      : 'border-[#EAE5DF] bg-[#FAF8F5] text-[#554E42] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <ImageIcon className="w-5 h-5 text-[#E8734A]" />
                    {formData.logo_type === 'image' && <Check className="w-4 h-4 text-[#E8734A]" />}
                  </div>
                  <div className="font-serif font-bold text-sm">Custom Graphic / PNG Logo</div>
                  <div className="text-[11px] text-[#7A7468] mt-0.5">Upload a transparent PNG/SVG</div>
                </button>
              </div>
            </div>

            {/* Custom Graphic Logo Upload */}
            {formData.logo_type === 'image' && (
              <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs animate-in fade-in">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8C8477] block">
                  Upload Logo Graphic (PNG / SVG)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] hover:border-[#E8734A] text-[#1E1B18] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                    <Upload className="w-4 h-4 text-[#E8734A]" />
                    <span>{isUploadingLogo ? 'Uploading...' : 'Choose File to Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                      disabled={isUploadingLogo}
                    />
                  </label>

                  <span className="text-xs text-[#8C8477]">or paste URL below:</span>
                </div>

                <div className="space-y-1">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                  />
                </div>

                {/* Logo Height Adjustment */}
                <div className="space-y-2 pt-2 border-t border-[#F0ECE6]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#554E42]">Header Logo Display Height</span>
                    <span className="font-mono font-bold text-[#E8734A]">{formData.logo_height || 36}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="65"
                    value={Number(formData.logo_height || 36)}
                    onChange={(e) => setFormData({ ...formData, logo_height: Number(e.target.value) })}
                    className="w-full accent-[#E8734A] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Site Title & Tagline */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8C8477] block">
                Brand Text &amp; Subtitle
              </label>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#554E42]">Website Brand Title</label>
                <input
                  type="text"
                  value={formData.site_title || ''}
                  onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                  placeholder="Toufiq Motion"
                  className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#554E42]">Tagline / Editorial Subtitle</label>
                <input
                  type="text"
                  value={formData.site_tagline || ''}
                  onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                  placeholder="Travel • Lifestyle • Wellbeing"
                  className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>
            </div>

            {/* Favicon (Browser Tab & App Icon) */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8C8477] block">
                    Favicon &amp; Browser Tab Icon
                  </label>
                  <p className="text-[11px] text-[#7A7468] mt-0.5">
                    The signature icon shown in browser tabs, bookmarks, and mobile home screen shortcuts.
                  </p>
                </div>
                {formData.favicon_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, favicon_url: '' })}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset to Default
                  </button>
                )}
              </div>

              {/* Favicon Upload Row */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] hover:border-[#E8734A] text-[#1E1B18] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs">
                  <Upload className="w-4 h-4 text-[#E8734A]" />
                  <span>{isUploadingFavicon ? 'Uploading...' : 'Upload Favicon File'}</span>
                  <input
                    type="file"
                    accept=".ico,.png,.svg,.webp,image/png,image/x-icon,image/svg+xml,image/webp"
                    onChange={handleFaviconFileUpload}
                    className="hidden"
                    disabled={isUploadingFavicon}
                  />
                </label>

                <span className="text-xs text-[#8C8477]">or enter image URL:</span>
              </div>

              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="https://toufiqmotion.com/uploads/favicon.png"
                  value={formData.favicon_url || ''}
                  onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 text-xs text-[#7A7468]">
                <div className="w-10 h-10 rounded-xl border border-[#EDE7DF] bg-[#FAF8F5] flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                  {formData.favicon_url ? (
                    <img
                      src={formData.favicon_url}
                      alt="Favicon"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-lg">✨</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[#1E1B18]">
                    {formData.favicon_url ? 'Custom Favicon Active' : 'Default ✨ Sparkle Active'}
                  </div>
                  <div className="text-[11px] text-[#8C8477]">
                    Recommended specs: 32×32 or 64×64 PNG, SVG, or ICO.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C8477] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#E8734A]" /> Live Brand Header Preview
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Real-time Preview
                </span>
              </div>

              {/* Simulated Header Section */}
              <div className="p-6 bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl flex items-center justify-between">
                <div>
                  {formData.logo_type === 'image' && formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt={formData.site_title || 'Toufiq Motion'}
                      style={{ maxHeight: `${formData.logo_height || 36}px` }}
                      className="object-contain"
                    />
                  ) : (
                    <div>
                      <span className="font-serif text-2xl font-bold tracking-tight text-[#1E1B18] block leading-tight">
                        {formData.site_title || 'Toufiq Motion'}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C8477] font-medium font-sans">
                        {formData.site_tagline || 'Travel • Lifestyle • Wellbeing'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#8C8477]">
                  <span className="text-[#E8734A]">Home</span>
                  <span>Travel</span>
                  <span>Lifestyle</span>
                </div>
              </div>

              <div className="text-[11px] text-[#7A7468] leading-relaxed bg-[#FFF9F5] p-3 rounded-xl border border-[#FADCC8]">
                💡 Tip: If using an image logo, we recommend a transparent PNG or SVG around 200px wide for optimal crispness on retina and mobile displays.
              </div>
            </div>

            {/* Live Browser Tab Simulation Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C8477] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8734A]" /> Live Browser Tab Preview
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Real-time Simulation
                </span>
              </div>

              {/* Realistic Chrome/Safari Window Header Mockup */}
              <div className="rounded-xl overflow-hidden border border-[#DDD7CD] shadow-sm bg-[#EFECE6]">
                {/* Window top bar */}
                <div className="px-3 pt-2.5 pb-0 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                  </div>

                  {/* Browser Tab */}
                  <div className="ml-2 px-3 py-1.5 bg-white rounded-t-lg border-t border-x border-[#DDD7CD] flex items-center gap-2 max-w-[210px] shadow-2xs">
                    {formData.favicon_url ? (
                      <img
                        src={formData.favicon_url}
                        alt="Favicon preview"
                        className="w-3.5 h-3.5 object-contain shrink-0"
                      />
                    ) : (
                      <span className="text-[11px] leading-none shrink-0">✨</span>
                    )}
                    <span className="text-[11px] font-medium text-[#1E1B18] truncate">
                      {formData.site_title || 'Toufiq Motion'}
                    </span>
                    <span className="text-[10px] text-[#8C8477] hover:text-[#1E1B18] ml-auto shrink-0">×</span>
                  </div>
                </div>

                {/* Browser URL address bar */}
                <div className="bg-white px-3 py-2 border-t border-[#DDD7CD] flex items-center gap-2 text-[11px] text-[#554E42]">
                  <div className="flex-1 bg-[#FAF8F5] border border-[#E0DCD4] rounded-md px-2.5 py-1 flex items-center gap-1.5 text-[#8C8477]">
                    <span className="text-[10px] text-emerald-600">🔒</span>
                    <span className="text-[#1E1B18] font-mono text-[10px] truncate">https://toufiqmotion.com/</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#7A7468] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE7DF]">
                ✨ Changes take effect across your site instantly when saved, and update automatically in browser tabs, bookmarks, and search snippets.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: HEADER & ANNOUNCEMENT BAR
          ===================================================================== */}
      {activeSubTab === 'header' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            
            {/* Announcement Banner Settings */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-3">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#1E1B18]">Top Announcement Bar</h4>
                  <p className="text-xs text-[#7A7468]">Display special announcements, new issue notices, or newsletter alerts at the very top of your site.</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.announcement_enabled)}
                    onChange={(e) => setFormData({ ...formData, announcement_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8734A]"></div>
                </label>
              </div>

              {formData.announcement_enabled && (
                <div className="space-y-4 pt-2 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#554E42]">Announcement Text Message</label>
                    <input
                      type="text"
                      value={formData.announcement_text || ''}
                      onChange={(e) => setFormData({ ...formData, announcement_text: e.target.value })}
                      placeholder="✨ Spring 2026 Editorial Issue is live: Discover the Amalfi Coast & Slow Coffee Chronicles"
                      className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#554E42]">Action Link (Page path or External URL)</label>
                    <input
                      type="text"
                      value={formData.announcement_link || ''}
                      onChange={(e) => setFormData({ ...formData, announcement_link: e.target.value })}
                      placeholder="/travel or https://..."
                      className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Header Behavior & CTA Button */}
            <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
              <h4 className="font-serif font-bold text-base text-[#1E1B18]">Header Sticky &amp; Call To Action</h4>

              <div className="flex items-center justify-between py-2 border-b border-[#F0ECE6]">
                <div>
                  <span className="font-bold text-xs text-[#1E1B18] block">Sticky Floating Header</span>
                  <span className="text-[11px] text-[#7A7468]">Keep the navigation bar fixed to the top as readers scroll down the page</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.header_sticky)}
                    onChange={(e) => setFormData({ ...formData, header_sticky: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8734A]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#F0ECE6]">
                <div>
                  <span className="font-bold text-xs text-[#1E1B18] block">Header Action CTA Button</span>
                  <span className="text-[11px] text-[#7A7468]">Surface an eye-catching button (e.g. "Work with Us" or "Contact") in the navbar</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.header_cta_enabled)}
                    onChange={(e) => setFormData({ ...formData, header_cta_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8734A]"></div>
                </label>
              </div>

              {formData.header_cta_enabled && (
                <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#554E42]">Button Text</label>
                    <input
                      type="text"
                      value={formData.header_cta_text || ''}
                      onChange={(e) => setFormData({ ...formData, header_cta_text: e.target.value })}
                      placeholder="Work with Us"
                      className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#554E42]">Button Target Link</label>
                    <input
                      type="text"
                      value={formData.header_cta_link || ''}
                      onChange={(e) => setFormData({ ...formData, header_cta_link: e.target.value })}
                      placeholder="/work"
                      className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#EDE7DF] shadow-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C8477]">
                Live Announcement &amp; CTA Preview
              </h4>

              {formData.announcement_enabled && (
                <div className="p-2.5 rounded-xl bg-[#FFF2EB] border border-[#FADCC8] text-[#C85228] text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-2xs">
                  <span>{formData.announcement_text || 'Announcement text goes here'}</span>
                  {formData.announcement_link && <ArrowRight className="w-3.5 h-3.5 inline" />}
                </div>
              )}

              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#1E1B18]">{formData.site_title || 'Toufiq Motion'}</span>
                {formData.header_cta_enabled && (
                  <button className="px-3.5 py-1.5 rounded-full bg-[#E8734A] text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                    {formData.header_cta_text || 'Work with Us'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: NAVIGATION MENU BUILDER
          ===================================================================== */}
      {activeSubTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EDE7DF] shadow-2xs">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1E1B18]">Header Menu Items</h3>
              <p className="text-xs text-[#7A7468]">Add, re-order, toggle, and configure links shown in the top navigation bar.</p>
            </div>

            <button
              onClick={openAddMenuModal}
              className="px-4 py-2 rounded-full bg-[#E8734A] text-white hover:bg-[#D56237] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Menu Item
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#EDE7DF] shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#8C8477] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                  <th className="py-3 px-5">Reorder</th>
                  <th className="py-3 px-4">Menu Label</th>
                  <th className="py-3 px-4">Target Link / Page</th>
                  <th className="py-3 px-4">Homepage Dropdown</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {(formData.menu_items_json || []).map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveMenuItem(index, 'up')}
                          className="p-1 rounded bg-[#FAF8F5] hover:bg-[#EDE7DF] text-[#6A6357] disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === (formData.menu_items_json || []).length - 1}
                          onClick={() => handleMoveMenuItem(index, 'down')}
                          className="p-1 rounded bg-[#FAF8F5] hover:bg-[#EDE7DF] text-[#6A6357] disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#1E1B18] text-sm">
                      {item.label}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#8C8477]">
                      {item.url || `/${item.pageId}`}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.hasDropdown ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF2EB] text-[#E8734A] border border-[#FADCC8]">
                          3 Designer Layouts
                        </span>
                      ) : (
                        <span className="text-[#8C8477] text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleMenuEnabled(index)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          item.enabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {item.enabled ? '✓ Visible' : 'Hidden'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditMenuModal(index)}
                        className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE7DF] text-[#554E42]"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenuItem(index)}
                        className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-rose-50 text-rose-500"
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

      {/* =====================================================================
          SUB-TAB 4: FOOTER CONTENT & VALUE STRIP
          ===================================================================== */}
      {activeSubTab === 'footer' && (
        <div className="space-y-6">
          
          {/* Newsletter Box Settings */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-[#1E1B18]">Footer Newsletter Box</h4>
                <p className="text-xs text-[#7A7468]">Configure the subscriber banner shown at the top of the footer.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.footer_newsletter_enabled)}
                  onChange={(e) => setFormData({ ...formData, footer_newsletter_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8734A]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#554E42]">Newsletter Tagline</label>
                <input
                  type="text"
                  value={formData.footer_newsletter_tagline || ''}
                  onChange={(e) => setFormData({ ...formData, footer_newsletter_tagline: e.target.value })}
                  placeholder="Join The Journey"
                  className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#554E42]">Newsletter Heading Title</label>
                <input
                  type="text"
                  value={formData.footer_newsletter_title || ''}
                  onChange={(e) => setFormData({ ...formData, footer_newsletter_title: e.target.value })}
                  placeholder="Get Travel Inspiration in Your Inbox"
                  className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#554E42]">Newsletter Explanatory Subtitle</label>
              <textarea
                rows={2}
                value={formData.footer_newsletter_subtitle || ''}
                onChange={(e) => setFormData({ ...formData, footer_newsletter_subtitle: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl p-3 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
              />
            </div>
          </div>

          {/* Footer Editorial Bio */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
            <h4 className="font-serif font-bold text-base text-[#1E1B18]">Brand Bio Paragraph in Footer</h4>
            <textarea
              rows={3}
              value={formData.footer_bio_text || ''}
              onChange={(e) => setFormData({ ...formData, footer_bio_text: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl p-3 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
            />
          </div>

          {/* 4 Value Proposition Strip Cards */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
            <h4 className="font-serif font-bold text-base text-[#1E1B18]">4 Value Proposition Strip Cards</h4>
            <p className="text-xs text-[#7A7468]">The 4 signature pillars shown right above the copyright bar.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(formData.footer_values_json || []).map((val, idx) => (
                <div key={idx} className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE5DF] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#8C8477]">
                    <span>Card #{idx + 1}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border">{val.icon}</span>
                  </div>

                  <input
                    type="text"
                    value={val.title}
                    onChange={(e) => {
                      const next = [...(formData.footer_values_json || [])];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setFormData({ ...formData, footer_values_json: next });
                    }}
                    placeholder="Title"
                    className="w-full bg-white border border-[#E0DCD4] rounded-lg px-3 py-1.5 text-xs font-bold text-[#1E1B18]"
                  />

                  <input
                    type="text"
                    value={val.desc}
                    onChange={(e) => {
                      const next = [...(formData.footer_values_json || [])];
                      next[idx] = { ...next[idx], desc: e.target.value };
                      setFormData({ ...formData, footer_values_json: next });
                    }}
                    placeholder="Short description"
                    className="w-full bg-white border border-[#E0DCD4] rounded-lg px-3 py-1.5 text-[11px] text-[#554E42]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Links Manager */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
            <h4 className="font-serif font-bold text-base text-[#1E1B18]">Footer Social Media Profile URLs</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['instagram', 'youtube', 'pinterest', 'facebook', 'twitter'].map((platform) => (
                <div key={platform} className="space-y-1">
                  <label className="text-xs font-bold text-[#554E42] capitalize">{platform} Profile URL</label>
                  <input
                    type="url"
                    value={formData.footer_socials_json?.[platform] || ''}
                    onChange={(e) => {
                      const nextSocials = { ...(formData.footer_socials_json || {}), [platform]: e.target.value };
                      setFormData({ ...formData, footer_socials_json: nextSocials });
                    }}
                    placeholder={`https://${platform}.com/...`}
                    className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2 text-xs text-[#1E1B18]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 5: FOOTER CREDITS & LEGAL
          ===================================================================== */}
      {activeSubTab === 'credits' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
            <h4 className="font-serif font-bold text-base text-[#1E1B18]">Footer Copyright &amp; Credits</h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#554E42]">Copyright Notice Text</label>
              <input
                type="text"
                value={formData.footer_copyright_text || ''}
                onChange={(e) => setFormData({ ...formData, footer_copyright_text: e.target.value })}
                placeholder="© 2026 Toufiq Motion. Handcrafted with luminous intention. All rights reserved."
                className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#554E42]">Designer / Built-with Credit</label>
                <input
                  type="text"
                  value={formData.footer_made_with || ''}
                  onChange={(e) => setFormData({ ...formData, footer_made_with: e.target.value })}
                  placeholder="Designed with Inside Light"
                  className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18]"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE5DF] mt-4">
                <div>
                  <span className="font-bold text-xs text-[#1E1B18] block">Back To Top Floating Button</span>
                  <span className="text-[11px] text-[#7A7468]">Show the smooth scroll-to-top arrow button</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formData.footer_back_to_top_enabled)}
                  onChange={(e) => setFormData({ ...formData, footer_back_to_top_enabled: e.target.checked })}
                  className="rounded border-gray-300 text-[#E8734A] focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Legal Links Manager */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDE7DF] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-3">
              <h4 className="font-serif font-bold text-base text-[#1E1B18]">Footer Legal &amp; Policy Links</h4>
              <button
                type="button"
                onClick={() => {
                  const current = [...(formData.footer_legal_links_json || [])];
                  current.push({ label: 'New Policy', url: '#policy' });
                  setFormData({ ...formData, footer_legal_links_json: current });
                }}
                className="text-xs text-[#E8734A] font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-2">
              {(formData.footer_legal_links_json || []).map((link, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const next = [...(formData.footer_legal_links_json || [])];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setFormData({ ...formData, footer_legal_links_json: next });
                    }}
                    placeholder="Link Label"
                    className="flex-1 bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-3 py-2 text-xs font-semibold text-[#1E1B18]"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const next = [...(formData.footer_legal_links_json || [])];
                      next[idx] = { ...next[idx], url: e.target.value };
                      setFormData({ ...formData, footer_legal_links_json: next });
                    }}
                    placeholder="Target URL / #hash"
                    className="flex-1 bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-3 py-2 text-xs text-[#6A6357] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(formData.footer_legal_links_json || [])];
                      next.splice(idx, 1);
                      setFormData({ ...formData, footer_legal_links_json: next });
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD / EDIT MENU ITEM
          ===================================================================== */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#EDE7DF] space-y-5 text-[#1E1B18]">
            <div className="flex items-center justify-between border-b border-[#F0ECE6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#1E1B18]">
                {editingMenuIndex !== null ? 'Edit Menu Item' : 'Add New Navigation Link'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMenuModalOpen(false)}
                className="text-[#8C8477] hover:text-[#1E1B18] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#554E42]">Menu Label (Display Text)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Photography Journals"
                  value={menuForm.label}
                  onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-4 py-2.5 text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#554E42]">Link Destination Type</label>
                  <select
                    value={menuForm.type}
                    onChange={(e) => setMenuForm({ ...menuForm, type: e.target.value as any })}
                    className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                  >
                    <option value="page">Built-in Page</option>
                    <option value="link">Custom External Link</option>
                  </select>
                </div>

                {menuForm.type === 'page' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#554E42]">Target Page</label>
                    <select
                      value={menuForm.pageId || 'home'}
                      onChange={(e) =>
                        setMenuForm({
                          ...menuForm,
                          pageId: e.target.value,
                          url: e.target.value === 'home' ? '/' : `/${e.target.value}`
                        })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    >
                      <option value="home">Home</option>
                      <option value="travel">Travel</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="health">Health &amp; Wellbeing</option>
                      <option value="work">Work with Us</option>
                      <option value="about">About</option>
                      <option value="contact">Contact</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#554E42]">URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={menuForm.url}
                      onChange={(e) => setMenuForm({ ...menuForm, url: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hasDropdownToggle"
                  checked={Boolean(menuForm.hasDropdown)}
                  onChange={(e) => setMenuForm({ ...menuForm, hasDropdown: e.target.checked })}
                  className="rounded border-[#E0DCD4] text-[#E8734A] focus:ring-0"
                />
                <label htmlFor="hasDropdownToggle" className="text-xs text-[#554E42]">
                  Show Homepage 3-Design Layouts Dropdown on hover
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F0ECE6]">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-[#E0DCD4] text-[#6A6357]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#E8734A] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#D56237]"
                >
                  {editingMenuIndex !== null ? 'Update Menu Item' : 'Add to Navigation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
