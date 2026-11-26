import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  Undo,
  Redo,
  Eye,
  Columns,
  Maximize2,
  Minimize2,
  CheckSquare,
  Minus,
  Table,
  Upload,
  Clock,
  FileText,
  ShoppingBag,
  X,
  Video,
  Play,
  Type,
  Baseline,
  Palette,
  Highlighter,
  Subscript,
  Superscript,
  RemoveFormatting,
  Indent,
  Outdent,
  Code2,
  FileCode,
  ChevronDown,
  Info,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api/client';
import { MediaLibrary } from './MediaLibrary';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  token?: string;
  onStatsChange?: (stats: { wordCount: number; charCount: number; readTime: string; headings: number }) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  token,
  onStatsChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview' | 'html'>('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Popover States
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);
  
  // Dialogs
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Image Dialog
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Video Dialog
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoInput, setVideoInput] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [videoError, setVideoError] = useState('');

  // Selection Preservation Ref
  const savedSelectionRef = useRef<Range | null>(null);
  const isInternalChangeRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
        return;
      }
    }
    if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      savedSelectionRef.current = range;
    }
  };

  const insertHTMLAtCursor = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }

    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }

    let inserted = false;
    try {
      inserted = document.execCommand('insertHTML', false, html);
    } catch {
      inserted = false;
    }

    if (!inserted && editorRef.current) {
      if (savedSelectionRef.current) {
        const range = savedSelectionRef.current;
        range.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node: ChildNode | null;
        let lastNode: ChildNode | null = null;
        while ((node = tempDiv.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      } else {
        editorRef.current.innerHTML += html;
      }
    }

    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Table Dialog
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Affiliate Product Review Card Dialog
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [availableAffLinks, setAvailableAffLinks] = useState<any[]>([]);
  const [selectedAffLinkId, setSelectedAffLinkId] = useState('');
  const [affForm, setAffForm] = useState({
    title: '',
    slug: '',
    badge: "Editor's Choice",
    rating: 4.9,
    price: '$199.00',
    merchant: 'Amazon',
    imageUrl: '',
    description: '',
    pros: 'Exceptional build, High battery life, Weather-sealed',
    cons: 'Premium price point',
    buttonText: 'Check Price on Amazon'
  });

  // Color Swatches
  const TEXT_COLORS = [
    { label: 'Charcoal', value: '#1E1B18' },
    { label: 'Terracotta', value: '#E8734A' },
    { label: 'Forest', value: '#2E7D5A' },
    { label: 'Royal Blue', value: '#1E40AF' },
    { label: 'Purple', value: '#7C3AED' },
    { label: 'Amber', value: '#D97706' },
    { label: 'Crimson', value: '#DC2626' },
    { label: 'Slate', value: '#64748B' },
  ];

  const HIGHLIGHT_COLORS = [
    { label: 'None', value: 'transparent' },
    { label: 'Peach', value: '#FED7AA' },
    { label: 'Yellow', value: '#FEF08A' },
    { label: 'Green', value: '#BBF7D0' },
    { label: 'Blue', value: '#BAE6FD' },
    { label: 'Lavender', value: '#E9D5FF' },
    { label: 'Rose', value: '#FECDD3' },
  ];

  // Close popovers on click outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.editor-popover-container')) {
        setShowTextColorPicker(false);
        setShowHighlightPicker(false);
        setShowCalloutMenu(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Sync internal innerHTML only when value changes externally (not during active typing)
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (editorRef.current && (viewMode === 'editor' || viewMode === 'split')) {
      const isFocused = document.activeElement === editorRef.current || editorRef.current.contains(document.activeElement);
      if (!isFocused && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '<p>Start writing your captivating story...</p>';
        calculateStats();
      }
    }
  }, [value, viewMode]);

  const calculateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = text.length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
    const headings = (editorRef.current.querySelectorAll('h1, h2, h3, h4').length) || 0;

    if (onStatsChange) {
      onStatsChange({ wordCount, charCount, readTime, headings });
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;

    isInternalChangeRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce state propagation by 150ms so typing remains 100% smooth at native 120fps
    debounceTimerRef.current = setTimeout(() => {
      onChange(html);
      calculateStats();
    }, 150);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (editorRef.current && (viewMode === 'editor' || viewMode === 'split')) {
      isInternalChangeRef.current = true;
      onChange(editorRef.current.innerHTML);
      calculateStats();
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    try {
      document.execCommand(command, false, arg);
    } catch (err) {
      console.warn('execCommand failed:', command, err);
    }
    if (editorRef.current) {
      editorRef.current.focus();
      isInternalChangeRef.current = true;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      onChange(editorRef.current.innerHTML);
      calculateStats();
    }
  };

  // Font Family handler (Requirement 1: Text Style Selection)
  const applyFontFamily = (fontFamily: string) => {
    if (!fontFamily) return;
    if (editorRef.current) editorRef.current.focus();
    saveSelection();
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      const span = document.createElement('span');
      span.style.fontFamily = fontFamily;
      span.innerHTML = '&#8203;';
      range.insertNode(span);
      range.setStart(span, 1);
      range.setEnd(span, 1);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontName', false, fontFamily);
      if (editorRef.current) {
        const fontTags = editorRef.current.querySelectorAll('font[face]');
        fontTags.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const face = htmlEl.getAttribute('face');
          htmlEl.removeAttribute('face');
          htmlEl.style.fontFamily = face || fontFamily;
        });
      }
    }
    handleInput();
  };

  // Font Size handler (Requirement 2: Text Size Selection)
  const applyFontSize = (sizePx: string) => {
    if (!sizePx) return;
    if (editorRef.current) editorRef.current.focus();
    saveSelection();
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      const span = document.createElement('span');
      span.style.fontSize = sizePx;
      span.innerHTML = '&#8203;';
      range.insertNode(span);
      range.setStart(span, 1);
      range.setEnd(span, 1);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, '7');
      if (editorRef.current) {
        const styledEls = editorRef.current.querySelectorAll('span[style*="font-size"], font[size="7"]');
        styledEls.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.fontSize.includes('xxx-large') || htmlEl.getAttribute('size') === '7') {
            htmlEl.removeAttribute('size');
            htmlEl.style.fontSize = sizePx;
          }
        });
      }
    }
    handleInput();
  };

  // Text Color handler
  const applyTextColor = (color: string) => {
    if (editorRef.current) editorRef.current.focus();
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    handleInput();
    setShowTextColorPicker(false);
  };

  // Highlight Background handler
  const applyHighlightColor = (color: string) => {
    if (editorRef.current) editorRef.current.focus();
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
    document.execCommand('styleWithCSS', false, 'true');
    if (color === 'transparent') {
      document.execCommand('removeFormat', false, undefined);
    } else {
      document.execCommand('hiliteColor', false, color);
    }
    handleInput();
    setShowHighlightPicker(false);
  };

  // Block format dropdown handler
  const handleBlockFormat = (format: string) => {
    if (!format) return;
    if (editorRef.current) editorRef.current.focus();
    saveSelection();

    if (format === 'lead') {
      insertHTMLAtCursor('<p class="lead-text italic text-xl text-[#38332B] leading-[1.8] mb-4">Start your lead paragraph here with captivating introductory prose...</p><p><br></p>');
    } else if (format === 'blockquote') {
      executeCommand('formatBlock', '<blockquote>');
    } else if (format === 'pre') {
      executeCommand('formatBlock', '<pre>');
    } else {
      try {
        document.execCommand('formatBlock', false, `<${format}>`);
      } catch {
        try {
          document.execCommand('formatBlock', false, format);
        } catch (err) {
          console.warn('formatBlock failed:', format, err);
        }
      }
    }
    handleInput();
  };

  // Callout Box Handler
  const insertCallout = (type: 'ambient' | 'tip' | 'warning' | 'summary') => {
    let calloutHtml = '';
    if (type === 'ambient') {
      calloutHtml = `
        <div class="my-6 p-6 rounded-2xl bg-gradient-to-r from-[#FFF5F0] to-[#FAF8F5] border-l-4 border-[#E8734A] text-[#2D2A26] shadow-xs">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8734A] mb-1">
            <span>✨ Curated Travel &amp; Living Note</span>
          </div>
          <p class="italic text-base text-[#4A453E] m-0">Write your special insider advice, recommendation, or takeaway here...</p>
        </div><p><br></p>
      `;
    } else if (type === 'tip') {
      calloutHtml = `
        <div class="my-6 p-6 rounded-2xl bg-[#F0FDF4] border-l-4 border-emerald-500 text-[#1E1B18] shadow-xs">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <span>💡 Pro Insider Tip</span>
          </div>
          <p class="text-base text-emerald-950 m-0">Book early morning slots to experience this location with the best light and zero crowds...</p>
        </div><p><br></p>
      `;
    } else if (type === 'warning') {
      calloutHtml = `
        <div class="my-6 p-6 rounded-2xl bg-[#FFFBEB] border-l-4 border-amber-500 text-[#1E1B18] shadow-xs">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
            <span>⚠️ Important Notice</span>
          </div>
          <p class="text-base text-amber-950 m-0">Roads can be winding and steep; always carry cash and check local transit schedules in advance...</p>
        </div><p><br></p>
      `;
    } else if (type === 'summary') {
      calloutHtml = `
        <div class="my-6 p-6 rounded-2xl bg-[#F0F9FF] border-l-4 border-sky-500 text-[#1E1B18] shadow-xs">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
            <span>📌 Key Highlights &amp; Takeaways</span>
          </div>
          <p class="text-base text-sky-950 m-0">Best season: May to September &bull; Recommended stay: 4-5 nights &bull; Ideal for photography and culinary escapes.</p>
        </div><p><br></p>
      `;
    }
    insertHTMLAtCursor(calloutHtml);
    setShowCalloutMenu(false);
  };

  // Checklist Task List
  const insertTaskList = () => {
    const taskHtml = `
      <ul class="task-list my-4 space-y-2">
        <li><input type="checkbox" /> Pack lightweight linen clothing and comfortable walking shoes</li>
        <li><input type="checkbox" /> Reserve table at cliffside trattoria 2-3 weeks ahead</li>
        <li><input type="checkbox" /> Download offline navigation maps and local transit passes</li>
      </ul><p><br></p>
    `;
    insertHTMLAtCursor(taskHtml);
  };

  // Inline Code helper
  const insertInlineCode = () => {
    if (editorRef.current) editorRef.current.focus();
    saveSelection();
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString();
      insertHTMLAtCursor(`<code>${text}</code>`);
    } else {
      insertHTMLAtCursor(`<code>code</code>`);
    }
  };

  // View Mode Change helper with synchronization
  const handleViewModeChange = (mode: 'editor' | 'split' | 'preview' | 'html') => {
    if (viewMode === 'editor' || viewMode === 'split') {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
    setViewMode(mode);
  };

  const insertQuote = () => {
    executeCommand('formatBlock', '<blockquote>');
  };

  const insertCalloutBox = () => {
    insertCallout('ambient');
  };

  const handleInsertLink = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!linkUrl) return;
    const cleanUrl = linkUrl.trim().startsWith('http://') || linkUrl.trim().startsWith('https://') || linkUrl.trim().startsWith('/') || linkUrl.trim().startsWith('#')
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;
    const html = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-[#E8734A] underline font-medium hover:text-[#C85228]">${linkText || cleanUrl}</a>`;
    insertHTMLAtCursor(html);
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const handleInsertImage = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!imageUrl || !imageUrl.trim()) return;
    const cleanUrl = imageUrl.trim();
    const html = `
      <figure class="my-8 text-center">
        <img src="${cleanUrl}" alt="${imageCaption || 'Blog illustration'}" class="w-full rounded-2xl shadow-md object-cover max-h-[480px] mx-auto" />
        ${imageCaption ? `<figcaption class="text-xs text-[#8C8477] mt-2 italic">${imageCaption}</figcaption>` : ''}
      </figure><p><br></p>
    `;
    insertHTMLAtCursor(html);
    setImageUrl('');
    setImageCaption('');
    setShowImageModal(false);
  };

  const extractVideoEmbedUrl = (input: string): { embedUrl: string; provider: string } | null => {
    if (!input) return null;
    const trimmed = input.trim();

    // Match iframe src if user pasted embed code
    const iframeSrcMatch = trimmed.match(/src=["'](.*?)["']/);
    const target = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

    // YouTube matcher: watch?v=..., youtu.be/..., embed/..., shorts/...
    const ytMatch = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return {
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
        provider: 'YouTube'
      };
    }

    // Vimeo matcher: vimeo.com/123456789
    const vimeoMatch = target.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        provider: 'Vimeo'
      };
    }

    if (target.startsWith('https://') || target.startsWith('http://')) {
      return {
        embedUrl: target,
        provider: 'Video'
      };
    }

    return null;
  };

  const handleInsertVideo = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setVideoError('');
    if (!videoInput.trim()) {
      setVideoError('Please enter a YouTube or Vimeo video link.');
      return;
    }
    const parsed = extractVideoEmbedUrl(videoInput);
    if (!parsed) {
      setVideoError('Could not recognize a valid YouTube or Vimeo URL.');
      return;
    }

    const html = `
      <figure class="my-8 text-center video-embed-container">
        <div class="relative w-full overflow-hidden rounded-2xl shadow-lg aspect-video max-w-4xl mx-auto bg-black">
          <iframe
            src="${parsed.embedUrl}"
            title="${videoCaption || (parsed.provider + ' video player')}"
            class="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
        ${videoCaption ? `<figcaption class="text-xs text-[#8C8477] mt-2 italic">${videoCaption}</figcaption>` : ''}
      </figure><p><br></p>
    `;
    insertHTMLAtCursor(html);
    setVideoInput('');
    setVideoCaption('');
    setVideoError('');
    setShowVideoModal(false);
  };

  const handleInsertTable = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let tableHtml = '<table class="w-full my-6 border-collapse border border-[#E0DCD4] text-sm"><thead><tr class="bg-[#FAF8F5]">';
    for (let j = 0; j < tableCols; j++) {
      tableHtml += `<th class="border border-[#E0DCD4] p-3 text-left font-bold font-serif text-[#1E1B18]">Header ${j + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let i = 0; i < tableRows; i++) {
      tableHtml += '<tr class="hover:bg-[#FAF8F5]">';
      for (let j = 0; j < tableCols; j++) {
        tableHtml += `<td class="border border-[#E0DCD4] p-3 text-[#4A453E]">Item ${i + 1}-${j + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    insertHTMLAtCursor(tableHtml);
    setShowTableModal(false);
  };

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadMedia(token, file);
      setImageUrl(res.url);
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAffiliateModal = async () => {
    try {
      const res = await api.getAffiliateLinks();
      setAvailableAffLinks(res.links || []);
      if (res.links && res.links.length > 0) {
        const first = res.links[0];
        setSelectedAffLinkId(first.id);
        setAffForm({
          title: first.title,
          slug: first.slug,
          badge: first.badge || "Editor's Choice",
          rating: first.rating || 4.9,
          price: first.price || '',
          merchant: first.merchant,
          imageUrl: first.image_url || '',
          description: first.description || '',
          pros: (first.pros || []).join(', '),
          cons: (first.cons || []).join(', '),
          buttonText: first.button_text || `Check Price on ${first.merchant}`
        });
      }
    } catch {}
    setShowAffiliateModal(true);
  };

  const insertAffiliateCard = async () => {
    const prosArr = affForm.pros.split(',').map((p) => p.trim()).filter(Boolean);
    const consArr = affForm.cons.split(',').map((c) => c.trim()).filter(Boolean);

    try {
      const res = await api.generateAffiliateBoxHtml({
        title: affForm.title,
        slug: affForm.slug,
        badge: affForm.badge,
        rating: affForm.rating,
        price: affForm.price,
        merchant: affForm.merchant,
        imageUrl: affForm.imageUrl,
        description: affForm.description,
        pros: prosArr,
        cons: consArr,
        buttonText: affForm.buttonText
      });

      if (res.html) {
        document.execCommand('insertHTML', false, res.html + '<p><br/></p>');
        handleInput();
      }
    } catch {}
    setShowAffiliateModal(false);
  };

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        executeCommand('bold');
      } else if (e.key === 'i') {
        e.preventDefault();
        executeCommand('italic');
      } else if (e.key === 'u') {
        e.preventDefault();
        executeCommand('underline');
      } else if (e.key === 'k') {
        e.preventDefault();
        setShowLinkModal(true);
      }
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'
    }`}>
      
      {/* 1. Format Toolbar */}
      <div className="relative bg-[#FAF8F5] border-b border-[#EAE5DF] p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-1.5 text-[#4A453E]">
        
        {/* Left Toolbar Commands */}
        <div className="flex flex-wrap items-center gap-1">
          {/* History Undo / Redo */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl p-0.5 shadow-2xs mr-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('undo')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('redo')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Block Hierarchy Dropdown */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl px-2 py-0.5 shadow-2xs mr-1 text-xs">
            <select
              aria-label="Block formatting"
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                handleBlockFormat(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              className="bg-transparent text-xs font-semibold text-[#1E1B18] focus:outline-hidden cursor-pointer py-1 pr-1"
              title="Heading & Block Format"
            >
              <option value="" disabled>Block Style</option>
              <option value="p">Paragraph (Normal)</option>
              <option value="h1">Heading 1 (H1)</option>
              <option value="h2">Heading 2 (H2)</option>
              <option value="h3">Heading 3 (H3)</option>
              <option value="h4">Heading 4 (H4)</option>
              <option value="lead">Lead Paragraph</option>
              <option value="blockquote">Blockquote</option>
              <option value="pre">Code Block</option>
            </select>
          </div>

          {/* Requirement 1: Text Style Selection (Font Family) */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl px-2 py-0.5 shadow-2xs mr-1 text-xs">
            <Type className="w-3.5 h-3.5 text-[#E8734A] mr-1 shrink-0" />
            <select
              aria-label="Text font style"
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                applyFontFamily(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              className="bg-transparent text-xs font-semibold text-[#1E1B18] focus:outline-hidden cursor-pointer py-1 pr-1 max-w-[130px]"
              title="Font Style (Font Family)"
            >
              <option value="" disabled>Font Style</option>
              <option value="'Playfair Display', Georgia, serif">Editorial Serif</option>
              <option value="'Plus Jakarta Sans', system-ui, sans-serif">Modern Sans</option>
              <option value="'Cormorant Garamond', Georgia, serif">Classic Garamond</option>
              <option value="'Caveat', cursive">Handwriting Script</option>
              <option value="'JetBrains Mono', monospace">Monospace Code</option>
              <option value="Georgia, serif">Traditional Georgia</option>
            </select>
          </div>

          {/* Requirement 2: Text Size Selection (Font Size) */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl px-2 py-0.5 shadow-2xs mr-1 text-xs">
            <Baseline className="w-3.5 h-3.5 text-[#E8734A] mr-1 shrink-0" />
            <select
              aria-label="Text size"
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                applyFontSize(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              className="bg-transparent text-xs font-semibold text-[#1E1B18] focus:outline-hidden cursor-pointer py-1 pr-1 max-w-[105px]"
              title="Font Size"
            >
              <option value="" disabled>Text Size</option>
              <option value="12px">12px • Small</option>
              <option value="14px">14px • Fine</option>
              <option value="16px">16px • Normal</option>
              <option value="18px">18px • Lead</option>
              <option value="20px">20px • Large</option>
              <option value="24px">24px • XL</option>
              <option value="28px">28px • 2XL</option>
              <option value="32px">32px • 3XL</option>
              <option value="36px">36px • Title</option>
              <option value="42px">42px • Display</option>
              <option value="48px">48px • Hero</option>
            </select>
          </div>

          {/* Inline Text Styling */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl p-0.5 shadow-2xs mr-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('bold')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('italic')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('underline')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('strikeThrough')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('subscript')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer text-xs font-bold"
              title="Subscript (X₂)"
            >
              <Subscript className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('superscript')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer text-xs font-bold"
              title="Superscript (X²)"
            >
              <Superscript className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertInlineCode}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('removeFormat')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color & Highlight Picker Buttons */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl p-0.5 shadow-2xs mr-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowTextColorPicker(!showTextColorPicker);
                setShowHighlightPicker(false);
                setShowCalloutMenu(false);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showTextColorPicker ? 'bg-[#FAF8F5] text-[#E8734A]' : 'hover:bg-[#FAF8F5] hover:text-[#E8734A]'
              }`}
              title="Text Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowHighlightPicker(!showHighlightPicker);
                setShowTextColorPicker(false);
                setShowCalloutMenu(false);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showHighlightPicker ? 'bg-[#FAF8F5] text-[#E8734A]' : 'hover:bg-[#FAF8F5] hover:text-[#E8734A]'
              }`}
              title="Highlight Background Color"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment & Indentation */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl p-0.5 shadow-2xs mr-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyLeft')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyCenter')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyRight')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyFull')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Justify (Align Both Edges)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('outdent')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Decrease Indent"
            >
              <Outdent className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('indent')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Increase Indent"
            >
              <Indent className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists & Callouts */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl p-0.5 shadow-2xs mr-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Bullet List (Unordered)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Numbered List (Ordered)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertTaskList}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Interactive Checklist / Task List"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertQuote}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Editorial Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowCalloutMenu(!showCalloutMenu);
                setShowTextColorPicker(false);
                setShowHighlightPicker(false);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showCalloutMenu ? 'bg-[#FFF2EB] text-[#E8734A]' : 'hover:bg-[#FFF2EB] text-[#E8734A]'
              }`}
              title="Insert Callout Note Box (Curated, Pro Tip, Warning, Summary)"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Media & Insertions */}
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl p-0.5 shadow-2xs mr-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowLinkModal(true);
              }}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Insert Hyperlink (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowImageModal(true);
              }}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Insert Image / Upload / Media Library"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowVideoModal(true);
              }}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Embed YouTube / Vimeo Video"
            >
              <Video className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowTableModal(true);
              }}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Insert Table"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertHorizontalRule')}
              className="p-1.5 hover:bg-[#FAF8F5] hover:text-[#E8734A] rounded-lg transition-colors cursor-pointer"
              title="Horizontal Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Standout Eye-Catching Affiliate Box Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenAffiliateModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFF2EB] to-[#FFE5D6] hover:from-[#E8734A] hover:to-[#D56237] text-[#E8734A] hover:text-white border border-[#FFCEBA] transition-all flex items-center gap-1.5 font-bold text-xs shadow-2xs cursor-pointer group shrink-0 mr-1"
            title="Insert High-Converting Affiliate Product Review Box"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E8734A] group-hover:text-white transition-colors" />
            <span className="font-bold tracking-tight">🛍️ Affiliate Box</span>
          </button>
        </div>

        {/* Right Toolbar View Toggles */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white border border-[#E0DCD4] rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleViewModeChange('editor')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'editor' ? 'bg-[#E8734A] text-white shadow-xs' : 'hover:bg-[#FAF8F5] text-[#554E42]'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('split')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'split' ? 'bg-[#E8734A] text-white shadow-xs' : 'hover:bg-[#FAF8F5] text-[#554E42]'
              }`}
              title="Side-by-side Editor & Live Preview"
            >
              <Columns className="w-3 h-3" /> Split
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'preview' ? 'bg-[#E8734A] text-white shadow-xs' : 'hover:bg-[#FAF8F5] text-[#554E42]'
              }`}
              title="Live Reader Mode Preview"
            >
              <Eye className="w-3 h-3" /> Reader
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('html')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                viewMode === 'html' ? 'bg-[#E8734A] text-white shadow-xs' : 'hover:bg-[#FAF8F5] text-[#554E42]'
              }`}
              title="Inspect or Edit Raw HTML Source Code"
            >
              <Code2 className="w-3 h-3" /> HTML
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-white border border-[#E0DCD4] hover:border-[#E8734A] rounded-xl text-[#6A6357] transition-all shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Distraction-Free Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* POPOVERS */}

        {/* Text Color Picker Popover */}
        {showTextColorPicker && (
          <div className="editor-popover-container absolute top-12 left-6 z-30 bg-white rounded-2xl shadow-xl border border-[#EDE7DF] p-3 w-56 animate-in fade-in zoom-in-95">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] mb-2">
              Select Text Color
            </div>
            <div className="grid grid-cols-4 gap-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyTextColor(c.value)}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                  title={c.label}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-black/10 shadow-2xs group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                  />
                  <span className="text-[9px] text-[#6A6357] truncate w-full text-center">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Highlight Background Color Popover */}
        {showHighlightPicker && (
          <div className="editor-popover-container absolute top-12 left-16 z-30 bg-white rounded-2xl shadow-xl border border-[#EDE7DF] p-3 w-56 animate-in fade-in zoom-in-95">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] mb-2">
              Text Highlight Color
            </div>
            <div className="grid grid-cols-4 gap-2">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyHighlightColor(c.value)}
                  className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                  title={c.label}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-black/15 shadow-2xs group-hover:scale-110 transition-transform flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: c.value === 'transparent' ? '#FFFFFF' : c.value }}
                  >
                    {c.value === 'transparent' ? '✕' : ''}
                  </span>
                  <span className="text-[9px] text-[#6A6357] truncate w-full text-center">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Callout Box Menu Popover */}
        {showCalloutMenu && (
          <div className="editor-popover-container absolute top-12 left-44 z-30 bg-white rounded-2xl shadow-xl border border-[#EDE7DF] p-2.5 w-64 space-y-1 animate-in fade-in zoom-in-95">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C8477] px-2 py-1">
              Insert Callout Box
            </div>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertCallout('ambient')}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#FFF5F0] text-[#1E1B18] transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span className="text-[#E8734A]">✨</span>
              <div>
                <div>Ambient Light Note</div>
                <div className="text-[10px] font-normal text-[#8C8477]">Terracotta gradient note</div>
              </div>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertCallout('tip')}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#F0FDF4] text-[#1E1B18] transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span className="text-emerald-600">💡</span>
              <div>
                <div>Pro Insider Tip</div>
                <div className="text-[10px] font-normal text-[#8C8477]">Emerald green recommendation</div>
              </div>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertCallout('warning')}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#FFFBEB] text-[#1E1B18] transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span className="text-amber-600">⚠️</span>
              <div>
                <div>Warning / Notice</div>
                <div className="text-[10px] font-normal text-[#8C8477]">Amber caution callout</div>
              </div>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertCallout('summary')}
              className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#F0F9FF] text-[#1E1B18] transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <span className="text-sky-600">📌</span>
              <div>
                <div>Key Takeaways</div>
                <div className="text-[10px] font-normal text-[#8C8477]">Summary box with key points</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 2. Editor Body & Live Preview */}
      <div className={`grow overflow-y-auto ${isFullscreen ? 'h-[calc(100vh-160px)]' : 'min-h-[360px] max-h-[550px]'}`}>
        
        {/* Editor Only Mode */}
        {viewMode === 'editor' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="rich-editor-content p-6 sm:p-8 outline-hidden min-h-full font-serif text-[#2D2A26] text-lg leading-[1.8] focus:ring-0 selection:bg-[#E8734A]/20"
            style={{ minHeight: '360px' }}
          />
        )}

        {/* Split View Mode (Side-by-Side) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#EDE7DF] h-full">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="rich-editor-content p-6 outline-hidden font-serif text-[#2D2A26] text-base leading-[1.8] focus:ring-0 overflow-y-auto"
            />
            <div className="p-6 bg-[#FAF8F5] overflow-y-auto">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#8C8477] mb-3">
                Live Article Preview
              </div>
              <div
                className="rich-editor-content font-serif text-[#2D2A26] text-base leading-[1.8]"
                dangerouslySetInnerHTML={{ __html: value || '<p class="text-[#8C8477] italic">Start writing to see live preview...</p>' }}
              />
            </div>
          </div>
        )}

        {/* Full Reader Preview Mode */}
        {viewMode === 'preview' && (
          <div className="p-8 sm:p-12 bg-[#FAF8F5] min-h-full">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-3 bg-white rounded-xl border border-[#EDE7DF] text-xs text-[#8C8477] text-center">
                ✨ Magazine Preview Mode — Rendered with Toufiq Motion Editorial Typography
              </div>
              <article
                className="rich-editor-content font-serif text-[#2D2A26] text-lg sm:text-xl leading-[1.85]"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
          </div>
        )}

        {/* HTML Source Code Mode */}
        {viewMode === 'html' && (
          <div className="p-4 sm:p-6 bg-[#1A1816] min-h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2E2A24] text-xs">
              <span className="font-mono flex items-center gap-2 text-amber-400 font-semibold">
                <Code2 className="w-4 h-4" /> Raw HTML Source Code Editor
              </span>
              <span className="text-[11px] text-[#A09A8F]">
                Edit raw HTML elements directly. Changes sync immediately to visual modes.
              </span>
            </div>
            <textarea
              value={value}
              onChange={(e) => {
                isInternalChangeRef.current = true;
                onChange(e.target.value);
              }}
              className="w-full grow min-h-[360px] bg-transparent text-emerald-400 font-mono text-xs sm:text-sm leading-relaxed outline-hidden resize-none p-2 selection:bg-[#E8734A]/40"
              placeholder="<p>Enter custom HTML markup...</p>"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* 3. Bottom Status & Statistics Bar */}
      <div className="bg-[#FAF8F5] border-t border-[#EAE5DF] px-5 py-2.5 flex flex-wrap items-center justify-between text-xs text-[#8C8477]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-medium text-[#4A453E]">
            <FileText className="w-3.5 h-3.5 text-[#E8734A]" />
            {(editorRef.current?.innerText || '').trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <span>&bull;</span>
          <span>{(editorRef.current?.innerText || '').length} characters</span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {Math.max(1, Math.ceil(((editorRef.current?.innerText || '').trim().split(/\s+/).filter(Boolean).length) / 180))} min read
          </span>
        </div>

        <div className="text-[11px] text-[#9E978C] hidden sm:block">
          Shortcuts: <strong>Ctrl+B</strong> (Bold), <strong>Ctrl+I</strong> (Italic), <strong>Ctrl+K</strong> (Link)
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Link Modal */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLinkModal(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDE7DF] shadow-2xl w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
              <h4 className="font-serif font-bold text-lg text-[#1E1B18]">Insert Link</h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C8477] hover:bg-[#E8734A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Link URL *</label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInsertLink(e); }}
                  placeholder="https://... or /page"
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Display Text (Optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInsertLink(e); }}
                  placeholder="Read full itinerary here"
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-[#6A6357] hover:text-[#1E1B18] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="px-5 py-1.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowImageModal(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDE7DF] shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
              <h4 className="font-serif font-bold text-lg text-[#1E1B18]">Insert Image into Content</h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C8477] hover:bg-[#E8734A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Image URL or Path *</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleInsertImage(e); }}
                    placeholder="https://... or /uploads/... or select from library"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFF5EF] border border-[#FFCEBA] hover:bg-[#FFEADA] text-[#C85228] text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-2xs"
                      title="Select existing optimized WebP image from Media Library"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#E8734A]" />
                      <span>Select from Media Library</span>
                    </button>
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-bold hover:border-[#E8734A] text-[#1E1B18] flex items-center gap-1 shrink-0 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#E8734A]" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleDirectImageUpload} />
                    </label>
                  </div>
                </div>
              </div>

              {imageUrl && (
                <div className="h-28 rounded-xl overflow-hidden border border-[#E0DCD4]">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">Image Caption (Optional)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInsertImage(e); }}
                  placeholder="e.g. Sunset over the cliffs of Positano"
                  className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-[#6A6357] hover:text-[#1E1B18] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertImage}
                  className="px-5 py-1.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video / YouTube Embed Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowVideoModal(false);
              setVideoError('');
            }
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDE7DF] shadow-2xl w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-2xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#1E1B18]">Embed Video in Story</h4>
                  <p className="text-[11px] text-[#8C8477]">YouTube, Shorts, Vimeo, or iframe embed code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoError('');
                }}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C8477] hover:bg-[#E8734A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                  Video URL or Embed Code *
                </label>
                <input
                  type="text"
                  required
                  value={videoInput}
                  onChange={(e) => {
                    setVideoInput(e.target.value);
                    if (videoError) setVideoError('');
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInsertVideo(e); }}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD4] text-xs font-mono focus:outline-hidden focus:border-[#E8734A] bg-[#FAF8F5]"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[#8C8477]">
                  <span className="font-medium text-[#4A453E]">Supported:</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE5DF]">youtube.com/watch?v=...</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE5DF]">youtu.be/...</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE5DF]">youtube.com/shorts/...</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE5DF]">vimeo.com/...</span>
                </div>
                {videoError && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{videoError}</p>
                )}
              </div>

              {/* Live Preview if video is recognized */}
              {(() => {
                const parsed = extractVideoEmbedUrl(videoInput);
                if (!parsed) return null;
                return (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live {parsed.provider} Embed Preview:
                    </span>
                    <div className="relative w-full overflow-hidden rounded-xl aspect-video border border-[#E0DCD4] bg-black shadow-inner">
                      <iframe
                        src={parsed.embedUrl}
                        title="Video Preview"
                        className="w-full h-full border-0 absolute inset-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-[#4A453E] block mb-1">
                  Video Caption / Description (Optional)
                </label>
                <input
                  type="text"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInsertVideo(e); }}
                  placeholder="e.g. Cinematic 4K Drone Footage of the Amalfi Coast"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F0ECE6]">
                <button
                  type="button"
                  onClick={() => {
                    setShowVideoModal(false);
                    setVideoError('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#6A6357] hover:text-[#1E1B18] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertVideo}
                  className="px-6 py-2 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Insert Video Embed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTableModal(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EDE7DF] shadow-2xl w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
              <h4 className="font-serif font-bold text-lg text-[#1E1B18]">Insert Table</h4>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#8C8477] hover:bg-[#E8734A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4A453E] block mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-[#6A6357] hover:text-[#1E1B18] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  className="px-5 py-1.5 rounded-full bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Create Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Insert Affiliate Product Review Box */}
      {showAffiliateModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAffiliateModal(false);
          }}
        >
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EDE7DF] max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Insert Affiliate Product Review Box</h3>
                <p className="text-xs text-[#8C8477]">Embed a high-converting, Google-compliant product card</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAffiliateModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#8C8477] hover:bg-[#E8734A] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {availableAffLinks.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#FFF2EB] border border-[#FFCEBA] space-y-1">
                <label className="block text-[11px] font-bold uppercase text-[#E8734A]">
                  Select Pre-Configured Affiliate Link
                </label>
                <select
                  value={selectedAffLinkId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedAffLinkId(id);
                    const found = availableAffLinks.find((l) => l.id === id);
                    if (found) {
                      setAffForm({
                        title: found.title,
                        slug: found.slug,
                        badge: found.badge || "Editor's Choice",
                        rating: found.rating || 4.9,
                        price: found.price || '',
                        merchant: found.merchant,
                        imageUrl: found.image_url || '',
                        description: found.description || '',
                        pros: (found.pros || []).join(', '),
                        cons: (found.cons || []).join(', '),
                        buttonText: found.button_text || `Check Price on ${found.merchant}`
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0DCD4] text-xs font-semibold text-[#1E1B18] focus:outline-hidden"
                >
                  {availableAffLinks.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.merchant} • {l.price || 'No price'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Product Title</label>
                <input
                  type="text"
                  value={affForm.title}
                  onChange={(e) => setAffForm({ ...affForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Badge</label>
                  <input
                    type="text"
                    value={affForm.badge}
                    onChange={(e) => setAffForm({ ...affForm, badge: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={affForm.rating}
                    onChange={(e) => setAffForm({ ...affForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Price</label>
                  <input
                    type="text"
                    value={affForm.price}
                    onChange={(e) => setAffForm({ ...affForm, price: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Merchant</label>
                  <input
                    type="text"
                    value={affForm.merchant}
                    onChange={(e) => setAffForm({ ...affForm, merchant: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={affForm.imageUrl}
                  onChange={(e) => setAffForm({ ...affForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Pros (comma separated)</label>
                <input
                  type="text"
                  value={affForm.pros}
                  onChange={(e) => setAffForm({ ...affForm, pros: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C8477] mb-1">Cons (comma separated)</label>
                <input
                  type="text"
                  value={affForm.cons}
                  onChange={(e) => setAffForm({ ...affForm, cons: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#E0DCD4] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0ECE6]">
              <button
                type="button"
                onClick={() => setShowAffiliateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8C8477] hover:text-[#1E1B18]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertAffiliateCard}
                className="px-5 py-2.5 rounded-xl bg-[#E8734A] hover:bg-[#D56237] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Insert Card into Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal for Content Image Embed */}
      {isMediaPickerOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMediaPickerOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#EDE7DF] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E0DCD4] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E8734A] block">
                  Media Assets &bull; Content Image Embed
                </span>
                <h3 className="font-serif font-bold text-xl text-[#1E1B18] mt-0.5">
                  Select Image from Media Library
                </h3>
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
            <div className="overflow-y-auto p-4 sm:p-6 grow">
              <MediaLibrary
                token={token || null}
                selectionMode={true}
                onSelectImage={(url, item) => {
                  setImageUrl(url);
                  if (item?.title) setImageCaption(item.title);
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

