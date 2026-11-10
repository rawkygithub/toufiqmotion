import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api, CustomPage, PageBlock, PageBlockType, PagesOverviewStats } from '../../api/client';
import { MediaLibrary } from './MediaLibrary';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Search,
  ExternalLink,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Monitor,
  Tablet,
  Smartphone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Type,
  Layout,
  Grid,
  MessageSquare,
  Quote,
  Compass,
  Code,
  Globe,
  Sliders,
  Settings,
  X,
  Check,
  Save,
  Menu,
  FileText
} from 'lucide-react';

interface PagesManagerProps {
  token: string | null;
}

// Starter templates for quick page building
const PAGE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start fresh with an empty page and add blocks freely',
    icon: '✨',
    blocks: []
  },
  {
    id: 'showcase',
    name: 'Destination Showcase',
    description: 'Hero banner, 2-column feature, highlights grid, and travel itinerary CTA',
    icon: '🏝️',
    blocks: [
      {
        id: 'hero-1',
        type: 'hero' as PageBlockType,
        title: 'Wild Coastlines & Alpine Sanctuaries',
        subtitle: 'An intimate travel journal mapping conscious escapes across the globe with slow intention.',
        badge: 'Curated 2026 Collection',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'View Escapes',
        buttonLink: '#destinations',
        secondaryButtonText: 'Read Travel Journal',
        secondaryButtonLink: '/travel',
        alignment: 'center' as const
      },
      {
        id: 'split-1',
        type: 'split_feature' as PageBlockType,
        title: 'Mindful Travel Philosophy',
        subtitle: 'Traveling not just to check pins on a map, but to pause, breathe, and genuinely connect.',
        badge: 'Slow Journeys',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        imagePosition: 'right' as const,
        content: '<p>Every journey documented on Toufiq Motion prioritizes stillness over rushing, celebrating quiet mountain mornings, coastal artisans, and local traditions.</p>',
        items: [
          { title: 'Zero Rush Itineraries', description: 'Stay minimum 4 nights in every retreat to truly settle in.' },
          { title: 'Support Local Crafters', description: 'Handcrafted ceramicists, local roasters, and family vineyards.' },
          { title: 'Carbon Conscious Escapes', description: 'Prioritizing scenic rail routes and eco-certified stays.' }
        ],
        buttonText: 'Explore Guides',
        buttonLink: '/travel'
      },
      {
        id: 'cards-1',
        type: 'cards_grid' as PageBlockType,
        title: 'Featured Retreats & Havens',
        subtitle: 'Hand-selected sanctuaries for rest, writing, and creative rejuvenation.',
        badge: 'Handpicked',
        items: [
          {
            title: 'Dolomite High Cabins',
            description: 'Minimalist wooden timber chalets nested beneath jagged alpine peaks with warm woodstoves.',
            badge: 'Italian Alps',
            icon: '🏔️',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
            link: '/travel'
          },
          {
            title: 'Kyoto Machiya Townhouses',
            description: 'Century-old restored wooden townhouses featuring private moss courtyards and tatami suites.',
            badge: 'Japan',
            icon: '🍵',
            image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
            link: '/travel'
          },
          {
            title: 'Amalfi Lemon Groves Villa',
            description: 'Sun-drenched clifftop estate overlooking the turquoise Mediterranean with fragrant citrus orchards.',
            badge: 'Italy',
            icon: '🍋',
            image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
            link: '/travel'
          }
        ]
      },
      {
        id: 'cta-1',
        type: 'cta_banner' as PageBlockType,
        title: 'Plan Your Next Slow Escape with Us',
        subtitle: 'Join over 4,200 readers receiving our monthly seasonal retreat guides and secret coordinates.',
        badge: 'Private Dispatch',
        buttonText: 'Subscribe to Dispatch',
        buttonLink: '#newsletter',
        secondaryButtonText: 'Browse All Guides',
        secondaryButtonLink: '/travel'
      }
    ]
  },
  {
    id: 'partnership',
    name: 'Brand Partnerships & Media Kit',
    description: 'Header, audience metrics, sponsorship tiers, and collaboration contact',
    icon: '🤝',
    blocks: [
      {
        id: 'hero-media',
        type: 'hero' as PageBlockType,
        title: 'Brand Collaborations & Editorial Storytelling',
        subtitle: 'Partner with Toufiq Motion to bring your brand to life through luminous photography and intentional narratives.',
        badge: 'Media Kit 2026',
        backgroundColor: '#FFF2EB',
        buttonText: 'Request Rate Card',
        buttonLink: '/contact',
        secondaryButtonText: 'Our Audience Reach',
        secondaryButtonLink: '#metrics',
        alignment: 'center' as const
      },
      {
        id: 'cards-metrics',
        type: 'cards_grid' as PageBlockType,
        title: 'Audience Demographics & Reach',
        subtitle: 'An engaged community of high-intent travelers, design lovers, and conscious consumers.',
        badge: 'Verified Numbers',
        items: [
          { title: '62,000+ Readers', description: 'Monthly unique readers spending an average of 4.2 minutes per article.', icon: '📈', badge: 'High Retention' },
          { title: '4,200+ Subscribers', description: 'Weekly dispatch with an outstanding 48.2% open rate and 11.5% CTR.', icon: '💌', badge: 'Loyal Base' },
          { title: 'Tier 1 Demographics', description: '68% US, UK, and European audience aged 25-45 with high purchasing power.', icon: '🌍', badge: 'Global Reach' }
        ]
      },
      {
        id: 'quote-collab',
        type: 'quote' as PageBlockType,
        title: 'Toufiq Motion produced the single most engaging and visually stunning editorial campaign for our alpine lodge in our 12-year history.',
        authorName: 'Elena Rostova',
        authorRole: 'Marketing Director, St. Moritz Haven Retreats',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      },
      {
        id: 'cta-collab',
        type: 'cta_banner' as PageBlockType,
        title: 'Ready to Craft Something Unforgettable?',
        subtitle: 'We only partner with brands that align with our mindful travel, design, and wellbeing values.',
        badge: 'Open for Q3 & Q4',
        buttonText: 'Start a Conversation',
        buttonLink: '/contact',
        secondaryButtonText: 'Explore Recent Work',
        secondaryButtonLink: '/travel'
      }
    ]
  },
  {
    id: 'faq_page',
    name: 'FAQ & Editorial Standards',
    description: 'Header, structured accordion questions, and support contact banner',
    icon: '❓',
    blocks: [
      {
        id: 'hero-faq',
        type: 'hero' as PageBlockType,
        title: 'Frequently Asked Questions & Editorial Policy',
        subtitle: 'Clear answers on our photography rights, hotel review independence, gear recommendations, and dispatch schedules.',
        badge: 'Transparency',
        backgroundColor: '#FFFFFF',
        alignment: 'center' as const
      },
      {
        id: 'faq-list',
        type: 'faq_accordion' as PageBlockType,
        title: 'Everything You Need to Know',
        subtitle: 'Click any question to view our full editorial guidelines and policies.',
        items: [
          {
            title: 'Are hotel and retreat reviews sponsored or independent?',
            description: '<p>Every review on Toufiq Motion is conducted with strict editorial independence. When a stay is hosted, we explicitly disclose it at the top of the article. We never accept payment in exchange for positive reviews.</p>'
          },
          {
            title: 'Can I license or use Toufiq Motion photography?',
            description: '<p>All photographs published on this journal are protected by copyright. For commercial licensing, editorial publications, or digital rights, please reach out via our contact page with your proposed usage.</p>'
          },
          {
            title: 'How do you choose destinations to feature?',
            description: '<p>We prioritize places with deep cultural preservation, architectural integrity, pristine natural beauty, and conscious hospitality initiatives.</p>'
          },
          {
            title: 'How often is the weekly newsletter sent?',
            description: '<p>Every Sunday morning at 8:00 AM EST, featuring our latest journal entries, secret coordinates, coffee brew recipes, and quiet playlist recommendations.</p>'
          }
        ]
      },
      {
        id: 'cta-help',
        type: 'cta_banner' as PageBlockType,
        title: 'Still have an unanswered question?',
        subtitle: 'Our editorial studio responds to every reader and partner inquiry within 24-48 business hours.',
        badge: 'Friendly Support',
        buttonText: 'Send Direct Message',
        buttonLink: '/contact'
      }
    ]
  }
];

export const PagesManager: React.FC<PagesManagerProps> = ({ token }) => {
  const { setActivePage } = useTheme();

  // Mode: 'list' (manage/maintain) or 'builder' (visual block builder)
  const [mode, setMode] = useState<'list' | 'builder'>('list');

  // List data state
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [stats, setStats] = useState<PagesOverviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Active page being edited in builder
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isNewPage, setIsNewPage] = useState(false);
  const [builderTab, setBuilderTab] = useState<'blocks' | 'add' | 'templates' | 'seo'>('blocks');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Media Library Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    type: 'block_image' | 'item_image' | 'gallery_image';
    blockId: string;
    itemIndex?: number;
  } | null>(null);

  // Template Picker Modal for new page
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  useEffect(() => {
    loadPages();
  }, [searchQuery, statusFilter]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await api.getPages({
        q: searchQuery,
        status: statusFilter
      });
      setPages(res.pages);
      setStats(res.stats);
    } catch (err: any) {
      console.error('Failed to load pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Open builder for creating a new page
  const handleStartCreatePage = () => {
    setIsTemplateModalOpen(true);
  };

  const handleApplyTemplate = (tpl: typeof PAGE_TEMPLATES[0]) => {
    setIsTemplateModalOpen(false);
    const newPage: CustomPage = {
      id: '',
      title: tpl.id === 'blank' ? 'Untitled Page' : tpl.name,
      slug: tpl.id === 'blank' ? `page-${Date.now()}` : tpl.id,
      excerpt: tpl.description,
      status: 'draft',
      template: 'standard',
      blocks_json: JSON.parse(JSON.stringify(tpl.blocks)),
      meta_title: tpl.name,
      meta_description: tpl.description,
      focus_keyword: '',
      canonical_url: '',
      no_index: false,
      seo_score: 85,
      is_system: false,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setEditingPage(newPage);
    setIsNewPage(true);
    setMode('builder');
    setSelectedBlockId(newPage.blocks_json[0]?.id || null);
    setBuilderTab('blocks');
  };

  // Open builder to edit existing page
  const handleEditPage = (page: CustomPage) => {
    setEditingPage(JSON.parse(JSON.stringify(page)));
    setIsNewPage(false);
    setMode('builder');
    setSelectedBlockId(page.blocks_json[0]?.id || null);
    setBuilderTab('blocks');
  };

  // Duplicate page
  const handleDuplicate = async (page: CustomPage) => {
    if (!token) return;
    try {
      const res = await api.duplicatePage(token, page.id);
      showNotification('success', `Page duplicated successfully as "${res.page.title}"`);
      await loadPages();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to duplicate page');
    }
  };

  // 1-Click Add to Navbar Menu
  const handleAddToMenu = async (page: CustomPage) => {
    if (!token) return;
    try {
      const res = await api.addPageToMenu(token, page.id);
      showNotification('success', `"${page.title}" added to site navigation menu!`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to add to navigation');
    }
  };

  // Delete page
  const handleDeletePage = async (page: CustomPage) => {
    if (!token) return;
    if (page.is_system) {
      alert('System pages cannot be deleted as they are required for core site functionality.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete "${page.title}"?`)) return;

    try {
      await api.deletePage(token, page.id);
      showNotification('success', `Page "${page.title}" deleted.`);
      await loadPages();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete page');
    }
  };

  // Save current page in builder
  const handleSavePage = async () => {
    if (!token || !editingPage) return;
    setSaving(true);
    try {
      if (isNewPage) {
        const res = await api.createPage(token, editingPage);
        setEditingPage(res.page);
        setIsNewPage(false);
        showNotification('success', `Page "${res.page.title}" created successfully!`);
      } else {
        const res = await api.updatePage(token, editingPage.id, editingPage);
        setEditingPage(res.page);
        showNotification('success', `Page "${res.page.title}" saved and updated!`);
      }
      await loadPages();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  // Block management functions
  const addBlock = (type: PageBlockType) => {
    if (!editingPage) return;
    const newBlockId = `block-${Date.now()}`;
    let newBlock: PageBlock;

    switch (type) {
      case 'hero':
        newBlock = {
          id: newBlockId,
          type: 'hero',
          title: 'Hero Headline Title',
          subtitle: 'A compelling descriptive subtitle introducing this editorial page.',
          badge: 'New Section',
          buttonText: 'Explore Now',
          buttonLink: '#',
          alignment: 'center'
        };
        break;
      case 'split_feature':
        newBlock = {
          id: newBlockId,
          type: 'split_feature',
          title: 'Two-Column Editorial Feature',
          subtitle: 'Balance evocative photography with rich storytelling text.',
          badge: 'Spotlight',
          imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          imagePosition: 'right',
          content: '<p>Share your story with complete typographic elegance and responsive layouts.</p>',
          items: [
            { title: 'First Highlight Point', description: 'Detailed point explanation' },
            { title: 'Second Highlight Point', description: 'Another valuable feature' }
          ],
          buttonText: 'Learn More',
          buttonLink: '#'
        };
        break;
      case 'cards_grid':
        newBlock = {
          id: newBlockId,
          type: 'cards_grid',
          title: 'Interactive Feature Cards',
          subtitle: 'Showcase offerings, sub-destinations, or resources.',
          badge: 'Collection',
          items: [
            { title: 'Item One', description: 'Brief description of this element.', icon: '✨', link: '#' },
            { title: 'Item Two', description: 'Brief description of this element.', icon: '🌿', link: '#' },
            { title: 'Item Three', description: 'Brief description of this element.', icon: '☕', link: '#' }
          ]
        };
        break;
      case 'faq_accordion':
        newBlock = {
          id: newBlockId,
          type: 'faq_accordion',
          title: 'Frequently Asked Questions',
          subtitle: 'Clear answers to help your readers and partners.',
          badge: 'Help & Q&A',
          items: [
            { title: 'How does this work?', description: '<p>Provide clear, helpful information here.</p>' },
            { title: 'What is the schedule or delivery?', description: '<p>Details and expectations for the reader.</p>' }
          ]
        };
        break;
      case 'cta_banner':
        newBlock = {
          id: newBlockId,
          type: 'cta_banner',
          title: 'Call to Action Banner',
          subtitle: 'Guide readers to subscribe, contact, or explore the next chapter.',
          badge: 'Join Us',
          buttonText: 'Get Started',
          buttonLink: '/contact',
          backgroundColor: '#FFF2EB'
        };
        break;
      case 'quote':
        newBlock = {
          id: newBlockId,
          type: 'quote',
          title: 'A beautifully formatted pull quote highlighting a central thought or reader testimonial.',
          authorName: 'Editorial Writer',
          authorRole: 'Toufiq Motion Journal',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
        break;
      case 'gallery':
        newBlock = {
          id: newBlockId,
          type: 'gallery',
          title: 'Visual Photo Gallery',
          subtitle: 'A high-impact photo mosaic with zoom capability.',
          galleryImages: [
            { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', caption: 'Coastal Sunset' },
            { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', caption: 'Alpine Silence' },
            { url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80', caption: 'Kyoto Moss Garden' }
          ]
        };
        break;
      case 'rich_text':
        newBlock = {
          id: newBlockId,
          type: 'rich_text',
          title: 'Typographic Reading Column',
          content: '<p>Write formatted paragraphs, subheadings, and thoughtful reflections with clean styling.</p>'
        };
        break;
      case 'post_grid':
        newBlock = {
          id: newBlockId,
          type: 'post_grid',
          title: 'Recent Stories & Articles',
          subtitle: 'Dynamically pulled from your published blog articles.',
          postLimit: 3
        };
        break;
      case 'embed':
        newBlock = {
          id: newBlockId,
          type: 'embed',
          title: 'Custom HTML or Widget Embed',
          embedCode: '<div class="p-6 bg-[#FAF8F5] rounded-xl text-center text-xs text-[#8C8477]">Custom Embed Placeholder (Google Maps, Spotify, or interactive widget)</div>'
        };
        break;
      case 'affiliate_box':
        newBlock = {
          id: newBlockId,
          type: 'affiliate_box',
          title: 'Sony Alpha 7 IV Full-Frame Camera',
          badge: "Editor's Choice",
          rating: 4.9,
          price: '$2,498.00',
          merchant: 'Amazon',
          imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
          subtitle: 'Our primary camera body for documenting expeditions with 33MP clarity.',
          buttonText: 'Check Price on Amazon',
          buttonLink: '/go/sony-a7iv',
          secondaryButtonText: 'View on B&H Photo',
          secondaryButtonLink: 'https://www.bhphotovideo.com',
          pros: ['33MP BSI full-frame sensor', 'Flawless real-time eye autofocus', 'Rugged weather-sealed chassis'],
          cons: ['Steep menu learning curve', 'Higher battery drain in 4K']
        };
        break;
      default:
        return;
    }

    const updatedBlocks = [...editingPage.blocks_json, newBlock];
    setEditingPage({
      ...editingPage,
      blocks_json: updatedBlocks
    });
    setSelectedBlockId(newBlockId);
    setBuilderTab('blocks');
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!editingPage) return;
    const blocks = [...editingPage.blocks_json];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    const [moved] = blocks.splice(index, 1);
    blocks.splice(targetIdx, 0, moved);

    setEditingPage({
      ...editingPage,
      blocks_json: blocks
    });
  };

  const duplicateBlock = (block: PageBlock) => {
    if (!editingPage) return;
    const cloned: PageBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${Date.now()}`,
      title: block.title ? `${block.title} (Copy)` : undefined
    };
    const idx = editingPage.blocks_json.findIndex((b) => b.id === block.id);
    const updated = [...editingPage.blocks_json];
    updated.splice(idx + 1, 0, cloned);
    setEditingPage({
      ...editingPage,
      blocks_json: updated
    });
    setSelectedBlockId(cloned.id);
  };

  const deleteBlock = (id: string) => {
    if (!editingPage) return;
    const updated = editingPage.blocks_json.filter((b) => b.id !== id);
    setEditingPage({
      ...editingPage,
      blocks_json: updated
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(updated[0]?.id || null);
    }
  };

  const updateSelectedBlock = (updates: Partial<PageBlock>) => {
    if (!editingPage || !selectedBlockId) return;
    const updated = editingPage.blocks_json.map((b) => {
      if (b.id === selectedBlockId) {
        return { ...b, ...updates };
      }
      return b;
    });
    setEditingPage({
      ...editingPage,
      blocks_json: updated
    });
  };

  // Open media picker for a block
  const handleOpenMediaPicker = (
    type: 'block_image' | 'item_image' | 'gallery_image',
    blockId: string,
    itemIndex?: number
  ) => {
    setMediaPickerTarget({ type, blockId, itemIndex });
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelected = (url: string) => {
    if (!mediaPickerTarget || !editingPage) return;
    const { type, blockId, itemIndex } = mediaPickerTarget;

    const updated = editingPage.blocks_json.map((b) => {
      if (b.id === blockId) {
        if (type === 'block_image') {
          return { ...b, imageUrl: url };
        } else if (type === 'item_image' && itemIndex !== undefined && b.items) {
          const items = [...b.items];
          items[itemIndex] = { ...items[itemIndex], image: url };
          return { ...b, items };
        } else if (type === 'gallery_image') {
          const gallery = [...(b.galleryImages || []), { url, caption: '' }];
          return { ...b, galleryImages: gallery };
        }
      }
      return b;
    });

    setEditingPage({
      ...editingPage,
      blocks_json: updated
    });
    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  // Selected block reference
  const selectedBlock = editingPage?.blocks_json.find((b) => b.id === selectedBlockId);

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
          <button
            onClick={() => setNotification(null)}
            className="hover:opacity-75 cursor-pointer ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: PAGES MAINTENANCE LIST                                             */}
      {/* ========================================================================= */}
      {mode === 'list' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE7DF] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-2xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold text-lg shadow-2xs border border-[#FFCEBA]/60">
                    📐
                  </span>
                  <div>
                    <h2 className="font-serif font-bold text-2xl text-[#1E1B18]">
                      Page Builder &amp; Maintenance
                    </h2>
                    <p className="text-xs text-[#8C8477]">
                      Create high-converting landing pages, destination guides, and manage live published URLs
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleStartCreatePage}
                  className="py-2.5 px-4 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Build New Page</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#F0ECE6]">
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EDE7DF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477]">Total Pages</span>
                  <div className="font-serif text-xl font-bold text-[#1E1B18] mt-0.5">{stats.totalPages}</div>
                </div>
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EDE7DF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Published</span>
                  <div className="font-serif text-xl font-bold text-emerald-700 mt-0.5">{stats.publishedPages}</div>
                </div>
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EDE7DF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Drafts</span>
                  <div className="font-serif text-xl font-bold text-amber-700 mt-0.5">{stats.draftPages}</div>
                </div>
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EDE7DF]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8734A]">Total Views</span>
                  <div className="font-serif text-xl font-bold text-[#1E1B18] mt-0.5">{stats.totalViews.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE7DF] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(['all', 'published', 'draft'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-[#E8734A] text-white shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#5A5348] hover:bg-[#F0ECE6]'
                  }`}
                >
                  {tab === 'all' ? 'All Pages' : tab}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8477]" />
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] placeholder-[#A39B8E] focus:outline-hidden focus:border-[#E8734A]"
              />
            </div>
          </div>

          {/* Pages Table */}
          <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] text-[#8C8477] uppercase tracking-wider text-[11px] border-b border-[#EDE7DF]">
                    <th className="py-3 px-5">Page &amp; Live Slug</th>
                    <th className="py-3 px-4">Template</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4">SEO Score</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2EB]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8C8477]">
                        <div className="w-6 h-6 border-2 border-[#E8734A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading pages...
                      </td>
                    </tr>
                  ) : pages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8C8477]">
                        No pages found. Click "Build New Page" to start your first custom layout!
                      </td>
                    </tr>
                  ) : (
                    pages.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors group">
                        <td className="py-3.5 px-5">
                          <div className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
                            {p.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#8C8477] font-mono">
                              /{p.slug}
                            </span>
                            {p.is_system && (
                              <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-[#EAE5DF] text-[#5A5348] uppercase">
                                System
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E0DCD4] text-[11px] text-[#5A5348] font-medium">
                            {p.template}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            p.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#5A5348] font-mono text-[11px]">
                          {p.views.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                            {p.seo_score}% Yoast
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#8C8477] text-[11px]">
                          {new Date(p.updated_at).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditPage(p)}
                              title="Visual Block Builder"
                              className="p-1.5 rounded-lg bg-[#FFF2EB] text-[#E8734A] hover:bg-[#E8734A] hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setActivePage(p.slug as any);
                              }}
                              title="View Live Page on Site"
                              className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#5A5348] hover:bg-[#E0DCD4] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleAddToMenu(p)}
                              title="Add to Header Navigation Menu"
                              className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#5A5348] hover:bg-[#E0DCD4] transition-colors cursor-pointer"
                            >
                              <Menu className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDuplicate(p)}
                              title="Duplicate Page"
                              className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#5A5348] hover:bg-[#E0DCD4] transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {!p.is_system && (
                              <button
                                onClick={() => handleDeletePage(p)}
                                title="Delete Page"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
      {/* MODE 2: VISUAL BLOCK-BASED PAGE BUILDER                                    */}
      {/* ========================================================================= */}
      {mode === 'builder' && editingPage && (
        <div className="space-y-4">
          {/* Builder Top Control Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EDE7DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Return to pages list? Any unsaved edits will be discarded.')) {
                    setMode('list');
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#5A5348] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                &larr; Exit Builder
              </button>

              <div className="min-w-0">
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  placeholder="Page Title..."
                  className="font-serif font-bold text-base sm:text-lg text-[#1E1B18] bg-transparent border-b border-transparent hover:border-[#E0DCD4] focus:border-[#E8734A] focus:outline-hidden px-1 py-0.5"
                />
                <div className="flex items-center gap-2 text-[11px] text-[#8C8477] font-mono px-1">
                  <span>Slug: /</span>
                  <input
                    type="text"
                    value={editingPage.slug}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })}
                    className="bg-transparent border-b border-transparent hover:border-[#E0DCD4] focus:border-[#E8734A] focus:outline-hidden text-[#5A5348]"
                  />
                </div>
              </div>
            </div>

            {/* Middle: Device Preview Switcher */}
            <div className="flex items-center justify-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#EDE7DF] self-center">
              <button
                onClick={() => setDevicePreview('desktop')}
                title="Desktop View (100%)"
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  devicePreview === 'desktop'
                    ? 'bg-white text-[#E8734A] shadow-2xs'
                    : 'text-[#8C8477] hover:text-[#1E1B18]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                onClick={() => setDevicePreview('tablet')}
                title="Tablet View (768px)"
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  devicePreview === 'tablet'
                    ? 'bg-white text-[#E8734A] shadow-2xs'
                    : 'text-[#8C8477] hover:text-[#1E1B18]'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                onClick={() => setDevicePreview('mobile')}
                title="Mobile View (380px)"
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  devicePreview === 'mobile'
                    ? 'bg-white text-[#E8734A] shadow-2xs'
                    : 'text-[#8C8477] hover:text-[#1E1B18]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Right: Status, Template, and Save Button */}
            <div className="flex items-center gap-2">
              <select
                value={editingPage.status}
                onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as any })}
                className="px-2.5 py-1.5 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#1E1B18] focus:outline-hidden"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <select
                value={editingPage.template}
                onChange={(e) => setEditingPage({ ...editingPage, template: e.target.value as any })}
                className="px-2.5 py-1.5 rounded-xl border border-[#E0DCD4] bg-[#FAF8F5] text-xs font-semibold text-[#1E1B18] focus:outline-hidden"
              >
                <option value="standard">Standard Layout</option>
                <option value="fullwidth">Fullwidth Layout</option>
                <option value="minimal">Minimal Reading</option>
                <option value="landing">Conversion Landing</option>
              </select>

              <button
                onClick={handleSavePage}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Page'}</span>
              </button>
            </div>
          </div>

          {/* Builder Workspace: Left Sidebar (Palette & Settings) + Right Canvas (Live Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (4 cols): Blocks Inspector & Navigation */}
            <div className="lg:col-span-5 space-y-4">
              {/* Builder Tabs */}
              <div className="bg-white rounded-2xl p-2 border border-[#EDE7DF] shadow-xs flex items-center gap-1">
                <button
                  onClick={() => setBuilderTab('blocks')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    builderTab === 'blocks'
                      ? 'bg-[#E8734A] text-white shadow-2xs'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Blocks ({editingPage.blocks_json.length})</span>
                </button>

                <button
                  onClick={() => setBuilderTab('add')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    builderTab === 'add'
                      ? 'bg-[#E8734A] text-white shadow-2xs'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Block</span>
                </button>

                <button
                  onClick={() => setBuilderTab('seo')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    builderTab === 'seo'
                      ? 'bg-[#E8734A] text-white shadow-2xs'
                      : 'text-[#5A5348] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>SEO</span>
                </button>
              </div>

              {/* TAB 1: BLOCKS OUTLINE & INSPECTOR */}
              {builderTab === 'blocks' && (
                <div className="space-y-4">
                  {/* Outline List */}
                  <div className="bg-white rounded-3xl p-4 border border-[#EDE7DF] shadow-xs space-y-2 max-h-72 overflow-y-auto">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] px-1 pb-1">
                      Page Structure ({editingPage.blocks_json.length} blocks)
                    </div>

                    {editingPage.blocks_json.map((block, idx) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          selectedBlockId === block.id
                            ? 'bg-[#FFF2EB] border-[#E8734A] text-[#1E1B18] shadow-2xs'
                            : 'bg-[#FAF8F5] border-[#EDE7DF] text-[#5A5348] hover:border-[#E0DCD4]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-white border border-[#E0DCD4] flex items-center justify-center text-[10px] font-bold text-[#E8734A] shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold capitalize truncate">
                              {block.type.replace('_', ' ')}
                            </div>
                            <div className="text-[10px] text-[#8C8477] truncate">
                              {block.title || 'Untitled block'}
                            </div>
                          </div>
                        </div>

                        {/* Order & Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => moveBlock(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1 rounded-md hover:bg-white text-[#8C8477] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveBlock(idx, 'down')}
                            disabled={idx === editingPage.blocks_json.length - 1}
                            title="Move Down"
                            className="p-1 rounded-md hover:bg-white text-[#8C8477] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateBlock(block)}
                            title="Duplicate"
                            className="p-1 rounded-md hover:bg-white text-[#8C8477] cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            title="Delete"
                            className="p-1 rounded-md hover:bg-rose-50 text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BLOCK INSPECTOR / SETTINGS FORM */}
                  {selectedBlock ? (
                    <div className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold text-xs uppercase">
                            ⚙️
                          </span>
                          <div>
                            <div className="font-serif font-bold text-sm text-[#1E1B18] capitalize">
                              Edit {selectedBlock.type.replace('_', ' ')}
                            </div>
                            <div className="text-[10px] text-[#8C8477] font-mono">
                              ID: {selectedBlock.id}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                          Live Sync
                        </span>
                      </div>

                      {/* Badge / Pill */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                          Badge / Tagline Pill
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.badge || ''}
                          onChange={(e) => updateSelectedBlock({ badge: e.target.value })}
                          placeholder="e.g. Curated 2026 Collection"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                        />
                      </div>

                      {/* Block Title */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                          Block Headline / Title
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.title || ''}
                          onChange={(e) => updateSelectedBlock({ title: e.target.value })}
                          placeholder="Main block headline"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-semibold text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                        />
                      </div>

                      {/* Block Subtitle */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                          Supporting Subtitle / Paragraph
                        </label>
                        <textarea
                          rows={2}
                          value={selectedBlock.subtitle || ''}
                          onChange={(e) => updateSelectedBlock({ subtitle: e.target.value })}
                          placeholder="Contextual subtitle..."
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                        />
                      </div>

                      {/* Rich Content (for split_feature and rich_text) */}
                      {(selectedBlock.type === 'split_feature' || selectedBlock.type === 'rich_text') && (
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                            HTML / Body Content
                          </label>
                          <textarea
                            rows={4}
                            value={selectedBlock.content || ''}
                            onChange={(e) => updateSelectedBlock({ content: e.target.value })}
                            placeholder="<p>Full content paragraphs...</p>"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-mono text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                          />
                        </div>
                      )}

                      {/* Embed Code (for embed block) */}
                      {selectedBlock.type === 'embed' && (
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                            Embed HTML Code (iframe, script, etc.)
                          </label>
                          <textarea
                            rows={4}
                            value={selectedBlock.embedCode || ''}
                            onChange={(e) => updateSelectedBlock({ embedCode: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-mono text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                          />
                        </div>
                      )}

                      {/* Image Settings (Hero, Split Feature, and Affiliate Box) */}
                      {(selectedBlock.type === 'hero' || selectedBlock.type === 'split_feature' || selectedBlock.type === 'affiliate_box') && (
                        <div className="space-y-2 pt-2 border-t border-[#F0ECE6]">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477]">
                            {selectedBlock.type === 'affiliate_box' ? 'Product Photo' : 'Feature / Background Image'}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={selectedBlock.imageUrl || ''}
                              onChange={(e) => updateSelectedBlock({ imageUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="grow px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                            />
                            <button
                              onClick={() => handleOpenMediaPicker('block_image', selectedBlock.id)}
                              className="px-3 py-2 rounded-xl bg-[#FFF2EB] text-[#E8734A] hover:bg-[#E8734A] hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Library</span>
                            </button>
                          </div>

                          {selectedBlock.type === 'split_feature' && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[11px] text-[#8C8477]">Image Side:</span>
                              <button
                                onClick={() => updateSelectedBlock({ imagePosition: 'left' })}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                  selectedBlock.imagePosition === 'left' ? 'bg-[#E8734A] text-white' : 'bg-[#FAF8F5] text-[#5A5348]'
                                }`}
                              >
                                Left
                              </button>
                              <button
                                onClick={() => updateSelectedBlock({ imagePosition: 'right' })}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                  selectedBlock.imagePosition !== 'left' ? 'bg-[#E8734A] text-white' : 'bg-[#FAF8F5] text-[#5A5348]'
                                }`}
                              >
                                Right
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Affiliate Box Specific Controls */}
                      {selectedBlock.type === 'affiliate_box' && (
                        <div className="space-y-3 pt-2 border-t border-[#F0ECE6]">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Price</label>
                              <input
                                type="text"
                                value={selectedBlock.price || ''}
                                onChange={(e) => updateSelectedBlock({ price: e.target.value })}
                                placeholder="$2,498.00"
                                className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Rating</label>
                              <input
                                type="number"
                                step="0.1"
                                min="1"
                                max="5"
                                value={selectedBlock.rating || 4.9}
                                onChange={(e) => updateSelectedBlock({ rating: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Merchant</label>
                              <input
                                type="text"
                                value={selectedBlock.merchant || ''}
                                onChange={(e) => updateSelectedBlock({ merchant: e.target.value })}
                                placeholder="Amazon"
                                className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Pros (comma separated)</label>
                            <input
                              type="text"
                              value={(selectedBlock.pros || []).join(', ')}
                              onChange={(e) => updateSelectedBlock({ pros: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                              placeholder="Pros list..."
                              className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Cons (comma separated)</label>
                            <input
                              type="text"
                              value={(selectedBlock.cons || []).join(', ')}
                              onChange={(e) => updateSelectedBlock({ cons: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                              placeholder="Cons list..."
                              className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Call to Action Buttons */}
                      {(selectedBlock.type === 'hero' || selectedBlock.type === 'split_feature' || selectedBlock.type === 'cta_banner' || selectedBlock.type === 'affiliate_box') && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F0ECE6]">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">
                              Button Label
                            </label>
                            <input
                              type="text"
                              value={selectedBlock.buttonText || ''}
                              onChange={(e) => updateSelectedBlock({ buttonText: e.target.value })}
                              placeholder="e.g. Explore"
                              className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">
                              Button Link / URL
                            </label>
                            <input
                              type="text"
                              value={selectedBlock.buttonLink || ''}
                              onChange={(e) => updateSelectedBlock({ buttonLink: e.target.value })}
                              placeholder="/travel or https://..."
                              className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden"
                            />
                          </div>
                        </div>
                      )}

                      {/* Items Manager for Cards Grid, FAQ, or Split Feature */}
                      {(selectedBlock.type === 'cards_grid' || selectedBlock.type === 'faq_accordion' || selectedBlock.type === 'split_feature') && (
                        <div className="space-y-3 pt-2 border-t border-[#F0ECE6]">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477]">
                              Structured Items ({selectedBlock.items?.length || 0})
                            </label>
                            <button
                              onClick={() => {
                                const items = [...(selectedBlock.items || [])];
                                items.push({
                                  title: `New ${selectedBlock.type === 'faq_accordion' ? 'Question' : 'Item'}`,
                                  description: 'Description content here',
                                  icon: '✨'
                                });
                                updateSelectedBlock({ items });
                              }}
                              className="text-xs font-bold text-[#E8734A] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Item</span>
                            </button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto">
                            {selectedBlock.items?.map((item, itemIdx) => (
                              <div key={itemIdx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EDE7DF] space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const items = [...(selectedBlock.items || [])];
                                      items[itemIdx] = { ...items[itemIdx], title: e.target.value };
                                      updateSelectedBlock({ items });
                                    }}
                                    placeholder="Item title..."
                                    className="font-bold text-xs bg-white px-2 py-1 rounded-lg border border-[#E0DCD4] grow text-[#1E1B18] focus:outline-hidden"
                                  />
                                  <button
                                    onClick={() => {
                                      const items = selectedBlock.items?.filter((_, i) => i !== itemIdx);
                                      updateSelectedBlock({ items });
                                    }}
                                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                <textarea
                                  rows={2}
                                  value={item.description || ''}
                                  onChange={(e) => {
                                    const items = [...(selectedBlock.items || [])];
                                    items[itemIdx] = { ...items[itemIdx], description: e.target.value };
                                    updateSelectedBlock({ items });
                                  }}
                                  placeholder="Description..."
                                  className="w-full text-xs bg-white px-2 py-1 rounded-lg border border-[#E0DCD4] text-[#5A5348] focus:outline-hidden"
                                />

                                {selectedBlock.type === 'cards_grid' && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      value={item.icon || ''}
                                      onChange={(e) => {
                                        const items = [...(selectedBlock.items || [])];
                                        items[itemIdx] = { ...items[itemIdx], icon: e.target.value };
                                        updateSelectedBlock({ items });
                                      }}
                                      placeholder="Icon (e.g. 🏝️)"
                                      className="text-xs bg-white px-2 py-1 rounded-lg border border-[#E0DCD4] text-[#1E1B18]"
                                    />
                                    <input
                                      type="text"
                                      value={item.link || ''}
                                      onChange={(e) => {
                                        const items = [...(selectedBlock.items || [])];
                                        items[itemIdx] = { ...items[itemIdx], link: e.target.value };
                                        updateSelectedBlock({ items });
                                      }}
                                      placeholder="Link URL"
                                      className="text-xs bg-white px-2 py-1 rounded-lg border border-[#E0DCD4] text-[#1E1B18]"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-8 border border-[#EDE7DF] text-center text-[#8C8477] text-xs">
                      Select a block from the outline above or click directly on the live canvas to inspect and edit its settings.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ADD BLOCK PALETTE */}
              {builderTab === 'add' && (
                <div className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-xs space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C8477]">
                    Choose a Block to Append
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: 'hero', name: 'Hero Banner', desc: 'Large headline, background image & CTA', icon: '🌟' },
                      { type: 'split_feature', name: '2-Col Split', desc: 'Side-by-side photography & narrative', icon: '📖' },
                      { type: 'cards_grid', name: 'Cards Grid', desc: '2 or 3-column interactive feature cards', icon: '🗂️' },
                      { type: 'faq_accordion', name: 'FAQ Accordion', desc: 'Expandable Q&A accordion list', icon: '❓' },
                      { type: 'cta_banner', name: 'CTA Banner', desc: 'High-converting callout banner', icon: '📣' },
                      { type: 'quote', name: 'Pull Quote', desc: 'Large serif quote with author photo', icon: '❝' },
                      { type: 'gallery', name: 'Photo Gallery', desc: 'Mosaic gallery with zoom modal', icon: '🖼️' },
                      { type: 'rich_text', name: 'Rich Text', desc: 'Formatted paragraphs & reading column', icon: '✍️' },
                      { type: 'post_grid', name: 'Post Grid', desc: 'Dynamic recent blog articles feed', icon: '📰' },
                      { type: 'embed', name: 'HTML Embed', desc: 'Custom iframe, map, or audio player', icon: '💻' },
                      { type: 'affiliate_box', name: 'Affiliate Review Box', desc: 'Product card with rating, price, pros/cons & buy button', icon: '🛍️' }
                    ].map((b) => (
                      <button
                        key={b.type}
                        onClick={() => addBlock(b.type as PageBlockType)}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DF] hover:border-[#E8734A] hover:bg-[#FFF2EB] transition-all text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div>
                          <span className="text-xl block mb-1.5">{b.icon}</span>
                          <div className="font-serif font-bold text-xs text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
                            {b.name}
                          </div>
                          <div className="text-[10px] text-[#8C8477] line-clamp-2 mt-0.5">
                            {b.desc}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#E8734A] mt-2 flex items-center gap-0.5">
                          + Add &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SEO METADATA SETTINGS */}
              {builderTab === 'seo' && (
                <div className="bg-white rounded-3xl p-5 border border-[#EDE7DF] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#1E1B18]">
                        SEO &amp; Search Engine Optimization
                      </h3>
                      <p className="text-[10px] text-[#8C8477]">
                        Yoast-compatible meta tags and indexability settings
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
                      Score: {editingPage.seo_score}%
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                      Meta Title (SERP Preview)
                    </label>
                    <input
                      type="text"
                      value={editingPage.meta_title || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                      placeholder="Title for Google results..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                      Meta Description (120-160 characters)
                    </label>
                    <textarea
                      rows={3}
                      value={editingPage.meta_description || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                      placeholder="Descriptive summary for Google snippet..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C8477] mb-1">
                      Focus Keyword
                    </label>
                    <input
                      type="text"
                      value={editingPage.focus_keyword || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, focus_keyword: e.target.value })}
                      placeholder="e.g. slow travel guide, media kit"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs text-[#1E1B18] focus:outline-hidden focus:border-[#E8734A]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE7DF]">
                    <div>
                      <div className="font-semibold text-xs text-[#1E1B18]">Search Engine Indexing</div>
                      <div className="text-[10px] text-[#8C8477]">Allow Google &amp; Bing to index this page in Sitemap</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!editingPage.no_index}
                      onChange={(e) => setEditingPage({ ...editingPage, no_index: !e.target.checked })}
                      className="w-4 h-4 text-[#E8734A] rounded-sm focus:ring-[#E8734A]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (7 cols): Live WYSIWYG Device Canvas */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full mb-2 flex items-center justify-between text-xs text-[#8C8477] px-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8734A]" />
                  <span>Real-Time WYSIWYG Canvas</span>
                </span>
                <span>Click any block to edit</span>
              </div>

              {/* Device Wrapper Frame */}
              <div
                className={`transition-all duration-300 w-full bg-[#FAF8F5] p-4 sm:p-6 rounded-3xl border-2 border-[#E0DCD4] shadow-inner min-h-[600px] ${
                  devicePreview === 'mobile'
                    ? 'max-w-[390px]'
                    : devicePreview === 'tablet'
                    ? 'max-w-[768px]'
                    : 'max-w-full'
                }`}
              >
                <div className="space-y-8">
                  {editingPage.blocks_json.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-[#E0DCD4] flex items-center justify-center mx-auto text-xl">
                        📐
                      </div>
                      <div className="font-serif font-bold text-base text-[#1E1B18]">
                        Canvas is currently blank
                      </div>
                      <p className="text-xs text-[#8C8477] max-w-xs mx-auto">
                        Add blocks from the left panel palette to start crafting your custom page.
                      </p>
                      <button
                        onClick={() => setBuilderTab('add')}
                        className="px-4 py-2 rounded-xl bg-[#E8734A] text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                      >
                        + Add First Block
                      </button>
                    </div>
                  ) : (
                    editingPage.blocks_json.map((block) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`rounded-2xl transition-all cursor-pointer relative group ${
                          selectedBlockId === block.id
                            ? 'ring-2 ring-[#E8734A] ring-offset-2'
                            : 'hover:ring-1 hover:ring-[#E0DCD4]'
                        }`}
                      >
                        {/* Block Type Tag Pill */}
                        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>{block.type}</span>
                        </div>

                        {/* Block Preview Render */}
                        {block.type === 'hero' && (
                          <div
                            className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden bg-white border border-[#EDE7DF]"
                            style={{
                              backgroundImage: block.imageUrl ? `url(${block.imageUrl})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              color: block.imageUrl ? '#ffffff' : '#1E1B18'
                            }}
                          >
                            {block.imageUrl && <div className="absolute inset-0 bg-black/60 z-0" />}
                            <div className="relative z-10 space-y-2 max-w-md mx-auto">
                              {block.badge && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2EB] text-[#E8734A]">
                                  {block.badge}
                                </span>
                              )}
                              <h3 className="font-serif font-bold text-xl sm:text-2xl leading-tight">
                                {block.title || 'Hero Title'}
                              </h3>
                              {block.subtitle && (
                                <p className="text-xs opacity-85">{block.subtitle}</p>
                              )}
                              {block.buttonText && (
                                <div className="pt-2">
                                  <span className="px-4 py-1.5 rounded-xl bg-[#E8734A] text-white text-[11px] font-bold uppercase inline-block">
                                    {block.buttonText}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {block.type === 'split_feature' && (
                          <div className="rounded-2xl p-6 bg-white border border-[#EDE7DF] space-y-3">
                            {block.badge && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2EB] text-[#E8734A]">
                                {block.badge}
                              </span>
                            )}
                            <h3 className="font-serif font-bold text-lg text-[#1E1B18]">
                              {block.title || 'Feature Title'}
                            </h3>
                            {block.subtitle && (
                              <p className="text-xs text-[#5A5348]">{block.subtitle}</p>
                            )}
                            {block.imageUrl && (
                              <div className="h-32 rounded-xl overflow-hidden mt-2">
                                <img src={block.imageUrl} alt="Feature" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === 'cards_grid' && (
                          <div className="space-y-3">
                            {block.title && (
                              <h3 className="font-serif font-bold text-base text-[#1E1B18] text-center">
                                {block.title}
                              </h3>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {block.items?.map((item, i) => (
                                <div key={i} className="p-3.5 rounded-xl bg-white border border-[#EDE7DF] space-y-1">
                                  <span className="text-sm">{item.icon || '✨'}</span>
                                  <div className="font-serif font-bold text-xs text-[#1E1B18]">{item.title}</div>
                                  <div className="text-[11px] text-[#8C8477]">{item.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'faq_accordion' && (
                          <div className="rounded-2xl p-5 bg-white border border-[#EDE7DF] space-y-2">
                            <h3 className="font-serif font-bold text-sm text-[#1E1B18] text-center mb-2">
                              {block.title || 'FAQ Accordion'}
                            </h3>
                            {block.items?.map((item, i) => (
                              <div key={i} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DF] text-xs font-semibold text-[#1E1B18] flex items-center justify-between">
                                <span>{item.title}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-[#8C8477]" />
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === 'cta_banner' && (
                          <div
                            className="rounded-2xl p-6 text-center border border-[#FFCEBA] space-y-2"
                            style={{ backgroundColor: block.backgroundColor || '#FFF2EB' }}
                          >
                            <h3 className="font-serif font-bold text-base text-[#1E1B18]">
                              {block.title || 'Call to Action'}
                            </h3>
                            {block.subtitle && (
                              <p className="text-xs text-[#5A5348]">{block.subtitle}</p>
                            )}
                            {block.buttonText && (
                              <div className="pt-1">
                                <span className="px-4 py-1.5 rounded-xl bg-[#E8734A] text-white text-[11px] font-bold uppercase inline-block">
                                  {block.buttonText}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div className="rounded-2xl p-6 bg-white border border-[#EDE7DF] text-center space-y-2">
                            <span className="text-2xl text-[#E8734A] font-serif leading-none">&ldquo;</span>
                            <blockquote className="font-serif italic text-sm text-[#1E1B18]">
                              {block.title || 'Editorial pull quote'}
                            </blockquote>
                            {block.authorName && (
                              <div className="text-[11px] font-bold text-[#8C8477]">
                                — {block.authorName}
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === 'gallery' && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              {block.galleryImages?.map((img, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#EDE7DF] bg-white">
                                  <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'rich_text' && (
                          <div className="rounded-2xl p-5 bg-white border border-[#EDE7DF] space-y-2">
                            {block.title && (
                              <h3 className="font-serif font-bold text-base text-[#1E1B18]">
                                {block.title}
                              </h3>
                            )}
                            <div
                              className="text-xs text-[#5A5348] line-clamp-3"
                              dangerouslySetInnerHTML={{ __html: block.content || '<p>Paragraph text...</p>' }}
                            />
                          </div>
                        )}

                        {block.type === 'post_grid' && (
                          <div className="p-4 rounded-2xl bg-white border border-[#EDE7DF] text-center space-y-1">
                            <h3 className="font-serif font-bold text-xs text-[#1E1B18]">
                              {block.title || 'Dynamic Articles Feed'}
                            </h3>
                            <p className="text-[10px] text-[#8C8477]">
                              Live grid showing latest {block.postLimit || 3} published journal entries
                            </p>
                          </div>
                        )}

                        {block.type === 'embed' && (
                          <div className="p-4 rounded-2xl bg-white border border-[#EDE7DF] text-center text-xs text-[#8C8477]">
                            [Custom HTML / Iframe Embed Widget]
                          </div>
                        )}

                        {block.type === 'affiliate_box' && (
                          <div className="rounded-2xl p-5 bg-white border border-[#EDE7DF] shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2EB] text-[#E8734A] border border-[#FFCEBA]">
                                ★ {block.badge || "Editor's Choice"}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-[#1E1B18]">
                                <span>{block.rating || 4.9}</span>
                                <span className="text-amber-400">★★★★★</span>
                              </div>
                            </div>

                            <div className="flex gap-4 items-center">
                              {block.imageUrl && (
                                <img src={block.imageUrl} alt="" className="w-20 h-20 rounded-xl object-contain bg-[#FAF8F5] p-1 border border-[#EDE7DF] shrink-0" />
                              )}
                              <div className="min-w-0">
                                <h3 className="font-serif font-bold text-sm text-[#1E1B18] truncate">
                                  {block.title || 'Product Title'}
                                </h3>
                                <div className="font-bold text-xs text-[#E8734A] mt-0.5">
                                  {block.price} <span className="text-[10px] text-[#8C8477]">({block.merchant || 'Amazon'})</span>
                                </div>
                                <p className="text-[11px] text-[#5A5348] line-clamp-2 mt-1">
                                  {block.subtitle || ''}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#F0ECE6] flex items-center justify-between">
                              <span className="px-3 py-1.5 rounded-xl bg-[#E8734A] text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                                {block.buttonText || 'Check Price'} &rarr;
                              </span>
                              <span className="text-[10px] font-mono text-[#2E7D5A] bg-[#EDF7F1] px-2 py-0.5 rounded-md">
                                sponsored
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TEMPLATE PICKER (FOR NEW PAGES)                                  */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTemplateModalOpen(false);
          }}
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EDE7DF] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#F0ECE6] flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1E1B18]">
                  Select a Starting Page Template
                </h3>
                <p className="text-xs text-[#8C8477]">
                  Start with a curated pre-structured layout or a blank canvas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DDD7CD] hover:border-[#E8734A] hover:bg-[#E8734A] transition-all text-[#4A453E] shadow-xs cursor-pointer"
                title="Close"
              >
                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white">Close</span>
                <X className="w-3.5 h-3.5 group-hover:text-white" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAGE_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DF] hover:border-[#E8734A] hover:bg-[#FFF2EB] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-2xl block">{tpl.icon}</span>
                      <h4 className="font-serif font-bold text-sm text-[#1E1B18] group-hover:text-[#E8734A] transition-colors">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-[#5A5348] leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#EAE5DF] flex items-center justify-between text-xs font-bold text-[#E8734A]">
                      <span>{tpl.blocks.length} pre-built blocks</span>
                      <span>Use &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MEDIA LIBRARY PICKER                                              */}
      {/* ========================================================================= */}
      {isMediaPickerOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMediaPickerOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E0DCD4] flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1E1B18]">
                  Select Image from Media Library
                </h3>
                <p className="text-xs text-[#8C8477]">
                  Choose any webp-optimized photo or upload new assets directly
                </p>
              </div>
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
                onSelectImage={handleMediaSelected}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

