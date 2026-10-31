import React, { useState, useEffect, useRef } from 'react';
import { api, MediaItem, MediaStats, OptimizationToolResponse } from '../../api/client';
import {
  Image as ImageIcon,
  UploadCloud,
  Check,
  Copy,
  Trash2,
  ExternalLink,
  Zap,
  Download,
  RefreshCw,
  Search,
  Grid,
  List,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  Sparkles,
  Filter,
  X,
  Sliders,
  HardDrive,
  Maximize2
} from 'lucide-react';

interface MediaLibraryProps {
  token: string | null;
  onSelectImage?: (url: string, item?: MediaItem) => void;
  selectionMode?: boolean;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  token,
  onSelectImage,
  selectionMode = false
}) => {
  // Main Tab: 'library' or 'optimizer_tool'
  const [activeTab, setActiveTab] = useState<'library' | 'optimizer_tool'>('library');

  // Media Library state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'webp' | 'unoptimized'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'largest' | 'smallest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [autoOptimizeOnUpload, setAutoOptimizeOnUpload] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inspector modal state
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({ alt_text: '', title: '', caption: '' });
  const [metaSaving, setMetaSaving] = useState(false);
  const [isOptimizingItem, setIsOptimizingItem] = useState(false);

  // Standalone Optimizer Tool state
  const [toolFile, setToolFile] = useState<File | null>(null);
  const [toolResult, setToolResult] = useState<OptimizationToolResponse | null>(null);
  const [toolLoading, setToolLoading] = useState(false);
  const [toolSaved, setToolSaved] = useState(false);
  const toolInputRef = useRef<HTMLInputElement>(null);

  // Batch optimize state
  const [batchLoading, setBatchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, [searchQuery, filterType, sortBy]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMedia({
        q: searchQuery,
        filter: filterType,
        sort: sortBy,
        limit: 100
      });
      setMediaList(res.media);
      setStats(res.stats);
    } catch (err: any) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  // Upload handlers
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !token) return;
    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const res = await api.uploadMultipleMedia(token, fileArray, autoOptimizeOnUpload);
      showToast(`Uploaded ${res.media.length} image${res.media.length > 1 ? 's' : ''} successfully!`);
      loadMedia();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Copy link
  const copyLink = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showToast('Copied direct image link to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Optimize individual media item
  const handleOptimizeItem = async (item: MediaItem) => {
    if (!token) return;
    setIsOptimizingItem(true);
    try {
      const res = await api.optimizeMediaItem(token, item.id);
      showToast(res.message);
      // Update local state
      setMediaList((prev) => prev.map((m) => (m.id === item.id ? res.item : m)));
      if (selectedItem?.id === item.id) {
        setSelectedItem(res.item);
      }
      loadMedia();
    } catch (err: any) {
      alert(err.message || 'Optimization failed');
    } finally {
      setIsOptimizingItem(false);
    }
  };

  // Batch optimize
  const handleBatchOptimize = async () => {
    if (!token) return;
    if (!window.confirm('Convert all heavy & unoptimized images to WebP under 250 KB?')) return;
    setBatchLoading(true);
    try {
      const res = await api.batchOptimizeMedia(token);
      showToast(res.message);
      loadMedia();
    } catch (err: any) {
      alert(err.message || 'Batch optimization failed');
    } finally {
      setBatchLoading(false);
    }
  };

  // Save meta
  const handleSaveMeta = async () => {
    if (!token || !selectedItem) return;
    setMetaSaving(true);
    try {
      const res = await api.updateMediaItem(token, selectedItem.id, metaForm);
      setSelectedItem(res.item);
      setMediaList((prev) => prev.map((m) => (m.id === selectedItem.id ? res.item : m)));
      setIsEditingMeta(false);
      showToast('Image SEO metadata updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update metadata');
    } finally {
      setMetaSaving(false);
    }
  };

  // Delete media item
  const handleDeleteItem = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this media asset permanently?')) return;
    try {
      await api.deleteMediaItem(token, id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      showToast('Media item deleted');
      loadMedia();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // Standalone Optimizer Tool handlers
  const handleToolFileSelect = async (file: File) => {
    setToolFile(file);
    setToolResult(null);
    setToolSaved(false);
    setToolLoading(true);

    try {
      const res = await api.optimizeImageTool(file, false);
      setToolResult(res);
    } catch (err: any) {
      alert(err.message || 'Optimization tool failed');
    } finally {
      setToolLoading(false);
    }
  };

  const handleToolSaveToLibrary = async () => {
    if (!toolFile || !token) return;
    setToolLoading(true);
    try {
      const res = await api.optimizeImageTool(toolFile, true);
      setToolResult(res);
      setToolSaved(true);
      showToast('Optimized WebP image saved to Media Library!');
      loadMedia();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setToolLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1B18] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header: Tabs & Quick Storage Metrics */}
      <div className="bg-white rounded-3xl p-6 border border-[#EDE7DF] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
              WebP Engine &bull; Max 250 KB
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18]">
            Media Library &amp; WebP Optimizer
          </h2>
          <p className="text-xs text-[#8C8477] mt-0.5">
            Manage media assets, inspect SEO metadata, and guarantee ultra-fast page speeds with automated WebP compression under 250 KB.
          </p>
        </div>

        {/* Tab Switcher & Batch Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-[#FAF8F5] border border-[#E0DCD4] rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white text-[#C85228] font-bold shadow-xs'
                  : 'text-[#6A6357] hover:text-[#1E1B18]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Library ({stats?.totalItems || mediaList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('optimizer_tool')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'optimizer_tool'
                  ? 'bg-white text-[#C85228] font-bold shadow-xs'
                  : 'text-[#6A6357] hover:text-[#1E1B18]'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>WebP Optimizer Tool</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-800 font-bold">
                &le; 250 KB
              </span>
            </button>
          </div>

          {stats && stats.unoptimizedCount > 0 && (
            <button
              onClick={handleBatchOptimize}
              disabled={batchLoading}
              className="px-4 py-2.5 rounded-2xl bg-[#FFF2EB] border border-[#FFCEBA] text-[#C85228] hover:bg-[#FFE5D6] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Zap className="w-4 h-4" />
              <span>{batchLoading ? 'Optimizing...' : `Batch Convert (${stats.unoptimizedCount} files)`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Overview Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Total Media Assets</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">
              {stats.totalItems} files
            </div>
            <span className="text-[10px] text-[#8C8477] mt-0.5 block">Stored in library</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Storage Used</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] mt-0.5">
              {formatBytes(stats.totalStorageBytes)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <HardDrive className="w-3 h-3" /> Disk footprint
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">WebP Optimized</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#2E7D5A] mt-0.5">
              {stats.optimizedCount} files
            </div>
            <span className="text-[10px] text-[#2E7D5A] font-semibold mt-0.5 block">
              &le; 250 KB target met ✅
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider block">Needs Optimization</span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#E8734A] mt-0.5">
              {stats.unoptimizedCount} files
            </div>
            <span className="text-[10px] text-[#E8734A] font-semibold mt-0.5 block">
              {stats.unoptimizedCount > 0 ? 'Convert to WebP' : 'All optimal'}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MEDIA LIBRARY (GRID & LIST)                                        */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          
          {/* Multi-File Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`bg-white rounded-3xl p-6 sm:p-8 border-2 border-dashed transition-all text-center relative ${
              dragActive ? 'border-[#E8734A] bg-[#FFF8F5]' : 'border-[#E0DCD4] hover:border-[#C5BEB3]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              id="library-file-input"
            />

            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center mx-auto shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1E1B18]">
                Drag and drop your images here, or browse files
              </h3>
              <p className="text-xs text-[#8C8477]">
                Supports JPEG, PNG, GIF, BMP, SVG, TIFF, WebP. Multiple files supported.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <label
                  htmlFor="library-file-input"
                  className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading & Processing...' : 'Select Files to Upload'}</span>
                </label>

                {/* Auto Optimize Toggle */}
                <label className="flex items-center gap-2 text-xs font-semibold text-[#4A453E] cursor-pointer bg-[#FAF8F5] px-3.5 py-2 rounded-full border border-[#E5E0D8]">
                  <input
                    type="checkbox"
                    checked={autoOptimizeOnUpload}
                    onChange={(e) => setAutoOptimizeOnUpload(e.target.checked)}
                    className="accent-[#E8734A] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Auto-compress to WebP (&le; 250 KB)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Search, Filter & View Controls */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8477]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename, title, alt text..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] placeholder-[#9E978C] focus:outline-hidden focus:border-[#E8734A]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-[11px] font-bold text-[#8C8477] uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(['all', 'webp', 'unoptimized'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filterType === type
                      ? 'bg-[#E8734A] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-[#6A6357] hover:bg-[#F2EDE4] border border-[#E5E0D8]'
                  }`}
                >
                  {type === 'all' && 'All Formats'}
                  {type === 'webp' && 'WebP Only'}
                  {type === 'unoptimized' && 'Needs Optimization'}
                </button>
              ))}
            </div>

            {/* Sort & View Mode */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs text-[#4A453E] focus:outline-hidden"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="largest">Largest Size</option>
                <option value="smallest">Smallest Size</option>
              </select>

              <div className="flex p-0.5 bg-[#FAF8F5] border border-[#E0DCD4] rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-[#E8734A] shadow-xs' : 'text-[#8C8477]'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-[#E8734A] shadow-xs' : 'text-[#8C8477]'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Items Presentation */}
          {loading ? (
            <div className="py-20 text-center text-xs text-[#8C8477]">Loading media assets...</div>
          ) : mediaList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#EDE7DF] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#8C8477] flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-[#1E1B18]">No images match your filter</h4>
              <p className="text-xs text-[#8C8477]">
                Try adjusting your search query, or upload new high-resolution images above.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaList.map((item) => {
                const isUnder250Kb = item.size <= 256000;
                const isWebP = item.mimetype === 'image/webp' || item.filename.endsWith('.webp');

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (selectionMode && onSelectImage) {
                        onSelectImage(item.url, item);
                      } else {
                        setSelectedItem(item);
                        setMetaForm({
                          alt_text: item.alt_text || '',
                          title: item.title || item.original_name,
                          caption: item.caption || ''
                        });
                        setIsEditingMeta(false);
                      }
                    }}
                    className="group bg-white rounded-2xl border border-[#EDE7DF] hover:border-[#E8734A] shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer relative"
                  >
                    {/* Image Preview with Aspect Ratio */}
                    <div className="aspect-[4/3] bg-[#FAF8F5] relative overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.alt_text || item.title || item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Format Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-2xs ${
                          isWebP ? 'bg-emerald-500/90 text-white' : 'bg-black/70 text-white'
                        }`}>
                          {isWebP ? 'WEBP' : item.mimetype.split('/')[1]?.toUpperCase() || 'IMG'}
                        </span>
                      </div>

                      {/* Size Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-md shadow-2xs ${
                          isUnder250Kb ? 'bg-black/60 text-emerald-300' : 'bg-rose-600/90 text-white'
                        }`}>
                          {formatBytes(item.size)}
                        </span>
                      </div>

                      {/* Hover Overlay with Action Buttons */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLink(item.url, item.id);
                          }}
                          className="p-2 rounded-xl bg-white text-[#1E1B18] hover:text-[#E8734A] shadow-md transition-all cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {!isWebP || !isUnder250Kb ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptimizeItem(item);
                            }}
                            className="p-2 rounded-xl bg-[#E8734A] text-white hover:bg-[#D56237] shadow-md transition-all cursor-pointer"
                            title="Optimize to WebP (< 250 KB)"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setMetaForm({
                              alt_text: item.alt_text || '',
                              title: item.title || item.original_name,
                              caption: item.caption || ''
                            });
                          }}
                          className="p-2 rounded-xl bg-white text-[#1E1B18] hover:text-[#E8734A] shadow-md transition-all cursor-pointer"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Footer Info */}
                    <div className="p-3 space-y-1">
                      <div className="text-xs font-bold text-[#1E1B18] truncate" title={item.title || item.original_name}>
                        {item.title || item.original_name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#8C8477]">
                        <span>{item.width && item.height ? `${item.width}×${item.height}` : 'Image'}</span>
                        {item.is_optimized ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> &lt;250 KB
                          </span>
                        ) : (
                          <span className="text-[#E8734A] font-semibold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" /> Unoptimized
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] text-[#8C8477] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                    <th className="py-3 px-5">Image</th>
                    <th className="py-3 px-4">Title / Name</th>
                    <th className="py-3 px-4">Dimensions</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">SEO Alt Text</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE6]">
                  {mediaList.map((item) => {
                    const isUnder250Kb = item.size <= 256000;
                    const isWebP = item.mimetype === 'image/webp' || item.filename.endsWith('.webp');

                    return (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-5">
                          <div
                            onClick={() => setSelectedItem(item)}
                            className="w-12 h-10 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5E0D8] cursor-pointer"
                          >
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1E1B18] max-w-xs truncate">{item.title || item.original_name}</div>
                          <div className="text-[10px] text-[#8C8477] font-mono truncate">{item.filename}</div>
                        </td>
                        <td className="py-3 px-4 text-[#6A6357]">
                          {item.width && item.height ? `${item.width} × ${item.height}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={isUnder250Kb ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {formatBytes(item.size)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isWebP ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isWebP ? 'WebP' : item.mimetype.split('/')[1] || 'img'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#8C8477] max-w-xs truncate">
                          {item.alt_text || <span className="italic text-rose-400">Missing Alt Text</span>}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyLink(item.url, item.id)}
                              className="p-1.5 rounded-lg border border-[#E5E0D8] text-[#4A453E] hover:text-[#E8734A] transition-all cursor-pointer"
                              title="Copy URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {(!isWebP || !isUnder250Kb) && (
                              <button
                                onClick={() => handleOptimizeItem(item)}
                                className="px-2.5 py-1 rounded-lg bg-[#E8734A] text-white text-[11px] font-bold hover:bg-[#D56237] transition-all flex items-center gap-1 cursor-pointer"
                                title="Optimize to WebP < 250 KB"
                              >
                                <Zap className="w-3 h-3" /> Optimize
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedItem(item)}
                              className="p-1.5 rounded-lg border border-[#E5E0D8] text-[#4A453E] hover:text-[#E8734A] transition-all cursor-pointer"
                              title="Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg border border-[#E5E0D8] text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEDICATED WEBP IMAGE OPTIMIZER TOOL (< 250 KB GUARANTEE)          */}
      {/* ========================================================================= */}
      {activeTab === 'optimizer_tool' && (
        <div className="space-y-8">
          
          {/* Tool Hero Header */}
          <div className="bg-gradient-to-br from-[#FFFDFC] to-[#FAF6EE] rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8734A] to-[#C85228] text-white flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1E1B18]">
                  Automated WebP Image Optimizer
                </h3>
                <p className="text-xs text-[#8C8477]">
                  Guaranteed output under <strong>250 KB</strong> with lossless-grade visual perception for lightning-fast Core Web Vitals.
                </p>
              </div>
            </div>
          </div>

          {/* Drag & Drop File Selector */}
          <div
            onClick={() => toolInputRef.current?.click()}
            className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-[#E0DCD4] hover:border-[#E8734A] text-center cursor-pointer transition-all space-y-4 group"
          >
            <input
              ref={toolInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleToolFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-3xl bg-[#FFF2EB] text-[#E8734A] group-hover:scale-110 transition-transform flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-serif font-bold text-xl text-[#1E1B18]">
                {toolLoading ? 'Optimizing Image to WebP...' : 'Choose or drop any image to compress'}
              </h4>
              <p className="text-xs text-[#8C8477] max-w-md mx-auto mt-1">
                Drop large RAW, PNG, or high-res JPEG photos here. Our sharp engine will compress it into WebP strictly under 250 KB.
              </p>
            </div>

            <button
              type="button"
              className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Browse Image from Computer</span>
            </button>
          </div>

          {/* Optimization Results Comparison Card */}
          {toolResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0ECE6] gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[#1E1B18]">
                      Optimization Complete: {toolResult.originalName}
                    </h4>
                    <p className="text-xs text-[#8C8477]">
                      Converted to WebP format &bull; Strict target: &le; 250 KB
                    </p>
                  </div>
                </div>

                {/* Savings Badge */}
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider block">Bandwidth Saved</span>
                  <span className="text-base font-bold font-mono">
                    {toolResult.savingsPercent}% ({formatBytes(toolResult.savingsBytes)})
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Original */}
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EAE5DF] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#6A6357]">Original Image</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      RAW INPUT
                    </span>
                  </div>
                  <div className="aspect-[16/10] bg-white rounded-xl overflow-hidden border border-[#E5E0D8] flex items-center justify-center">
                    {toolFile && (
                      <img
                        src={URL.createObjectURL(toolFile)}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#6A6357]">
                    <div>File Size: <strong className="text-[#1E1B18] font-mono">{formatBytes(toolResult.originalSize)}</strong></div>
                    <div>Format: <strong className="text-[#1E1B18] uppercase">{toolFile?.type.split('/')[1] || 'JPG'}</strong></div>
                  </div>
                </div>

                {/* Optimized WebP */}
                <div className="bg-[#F0FDF4] rounded-2xl p-4 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Optimized Output
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                      WEBP &le; 250 KB ✅
                    </span>
                  </div>
                  <div className="aspect-[16/10] bg-white rounded-xl overflow-hidden border border-emerald-200 flex items-center justify-center">
                    <img
                      src={toolResult.base64Data || toolResult.url}
                      alt="Optimized WebP"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-emerald-950">
                    <div>
                      Optimized Size: <strong className="text-emerald-700 font-mono font-bold">{formatBytes(toolResult.optimizedSize)}</strong>
                    </div>
                    <div>
                      Dimensions: <strong className="text-emerald-700 font-mono">{toolResult.width} × {toolResult.height}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#F0ECE6]">
                <a
                  href={toolResult.url}
                  download={toolResult.url.split('/').pop() || 'optimized.webp'}
                  className="px-5 py-2.5 rounded-full bg-[#FAF8F5] border border-[#E0DCD4] hover:border-[#E8734A] text-[#1E1B18] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#E8734A]" /> Download .webp
                </a>

                <button
                  onClick={() => copyLink(toolResult.url, 'tool-res')}
                  className="px-5 py-2.5 rounded-full bg-[#FAF8F5] border border-[#E0DCD4] hover:border-[#E8734A] text-[#1E1B18] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Copy className="w-4 h-4 text-[#E8734A]" /> Copy WebP URL
                </button>

                <button
                  onClick={handleToolSaveToLibrary}
                  disabled={toolSaved || toolLoading}
                  className="px-6 py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {toolSaved ? (
                    <>
                      <Check className="w-4 h-4" /> Saved in Media Library
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4" /> Save into Media Library
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MEDIA DETAILS / INSPECTOR MODAL                                           */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#EDE7DF] max-h-[95vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#1E1B18] truncate max-w-lg">
                    {selectedItem.title || selectedItem.original_name}
                  </h3>
                  <p className="text-xs text-[#8C8477]">Asset Details &bull; SEO Image Inspector</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#8C8477] hover:text-[#1E1B18] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Grid: Preview & Metadata Editor */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left Column: Full-size Preview (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="aspect-[4/3] rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] overflow-hidden flex items-center justify-center relative">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.alt_text || selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black transition-colors"
                    title="Open Full Resolution"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Technical Specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EDE7DF] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C8477] uppercase font-bold block">File Size</span>
                    <strong className={selectedItem.size <= 256000 ? 'text-emerald-700 font-mono' : 'text-rose-600 font-mono'}>
                      {formatBytes(selectedItem.size)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C8477] uppercase font-bold block">Dimensions</span>
                    <strong className="text-[#1E1B18] font-mono">
                      {selectedItem.width && selectedItem.height ? `${selectedItem.width}×${selectedItem.height}` : 'Variable'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C8477] uppercase font-bold block">Format</span>
                    <strong className="text-[#1E1B18] uppercase">
                      {selectedItem.mimetype.split('/')[1] || 'WebP'}
                    </strong>
                  </div>
                  <div className="col-span-2 sm:col-span-3 pt-2 border-t border-[#EAE5DF]">
                    <span className="text-[10px] text-[#8C8477] uppercase font-bold block">File URL</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={selectedItem.url}
                        className="w-full px-2.5 py-1 text-[11px] font-mono bg-white rounded-lg border border-[#E0DCD4] text-[#4A453E]"
                      />
                      <button
                        onClick={() => copyLink(selectedItem.url, selectedItem.id)}
                        className="px-3 py-1 bg-white border border-[#E0DCD4] hover:border-[#E8734A] rounded-lg text-xs font-bold text-[#E8734A] shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* WebP Optimization Status Banner */}
                {selectedItem.is_optimized ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Optimized WebP &bull; Under 250 KB target met</span>
                    </div>
                    {selectedItem.original_size && (
                      <span className="text-[11px] font-mono text-emerald-700">
                        (Was {formatBytes(selectedItem.original_size)})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Image exceeds 250 KB or is uncompressed</span>
                    </div>
                    <button
                      onClick={() => handleOptimizeItem(selectedItem)}
                      disabled={isOptimizingItem}
                      className="px-3 py-1 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isOptimizingItem ? 'Optimizing...' : 'Optimize to WebP'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: SEO Metadata & Form Actions (5 cols) */}
              <div className="md:col-span-5 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                    <h4 className="font-serif font-bold text-sm text-[#1E1B18]">SEO &amp; Accessibility</h4>
                    <span className="text-[10px] text-[#8C8477]">Yoast Compliant</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                      Alt Text (Alternative Text)
                    </label>
                    <input
                      type="text"
                      value={metaForm.alt_text}
                      onChange={(e) => setMetaForm({ ...metaForm, alt_text: e.target.value })}
                      placeholder="Describe the image for search engines & screen readers"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                    <p className="text-[10px] text-[#8C8477] mt-1">
                      Critical for Google Images ranking and web accessibility compliance.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                      Image Title
                    </label>
                    <input
                      type="text"
                      value={metaForm.title}
                      onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
                      placeholder="Display title"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                      Editorial Caption
                    </label>
                    <textarea
                      rows={3}
                      value={metaForm.caption}
                      onChange={(e) => setMetaForm({ ...metaForm, caption: e.target.value })}
                      placeholder="Optional caption displayed under the image in article body"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>

                  <button
                    onClick={handleSaveMeta}
                    disabled={metaSaving}
                    className="w-full py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] hover:border-[#E8734A] text-[#1E1B18] hover:text-[#E8734A] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{metaSaving ? 'Saving...' : 'Save Image Metadata'}</span>
                  </button>
                </div>

                {/* Bottom Danger & Selector Actions */}
                <div className="pt-4 border-t border-[#F0ECE6] space-y-2">
                  {selectionMode && onSelectImage && (
                    <button
                      onClick={() => {
                        onSelectImage(selectedItem.url, selectedItem);
                        setSelectedItem(null);
                      }}
                      className="w-full py-2.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Select this Image</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="w-full py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Asset Permanently</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

