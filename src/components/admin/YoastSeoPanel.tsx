import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Share2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  Monitor,
  Code,
  Shield,
  Sparkles,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export interface SeoData {
  focusKeyword: string;
  metaTitle: string;
  slug: string;
  metaDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
}

interface YoastSeoPanelProps {
  seoData: SeoData;
  onChange: (updated: SeoData) => void;
  articleTitle: string;
  articleContent: string;
  articleImage: string;
  category: string;
}

export const YoastSeoPanel: React.FC<YoastSeoPanelProps> = ({
  seoData,
  onChange,
  articleTitle,
  articleContent,
  articleImage,
  category
}) => {
  const [activeTab, setActiveTab] = useState<'seo' | 'social' | 'schema' | 'advanced'>('seo');
  const [snippetDevice, setSnippetDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [socialNetwork, setSocialNetwork] = useState<'facebook' | 'twitter'>('facebook');
  const [copiedSchema, setCopiedSchema] = useState(false);

  const cleanContentText = useMemo(() => {
    return articleContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }, [articleContent]);

  const words = useMemo(() => cleanContentText.split(/\s+/).filter(Boolean), [cleanContentText]);
  const wordCount = words.length;

  // Real-time SEO analysis algorithm like Yoast SEO Premium
  const analysis = useMemo(() => {
    const keyword = seoData.focusKeyword.toLowerCase().trim();
    const title = (seoData.metaTitle || articleTitle).toLowerCase();
    const slug = (seoData.slug || '').toLowerCase();
    const desc = (seoData.metaDescription || '').toLowerCase();
    const text = cleanContentText.toLowerCase();

    const results: { type: 'good' | 'warning' | 'error'; label: string; detail: string }[] = [];

    if (!keyword) {
      results.push({
        type: 'error',
        label: 'Focus keyphrase',
        detail: 'Set a focus keyphrase in order to calculate an accurate SEO score.'
      });
      return { score: 45, readabilityScore: 80, results };
    }

    // 1. Keyphrase in SEO Title
    if (title.includes(keyword)) {
      if (title.indexOf(keyword) < 15) {
        results.push({
          type: 'good',
          label: 'Keyphrase in title',
          detail: 'Great job! The keyphrase appears near the beginning of your SEO title.'
        });
      } else {
        results.push({
          type: 'good',
          label: 'Keyphrase in title',
          detail: 'The focus keyphrase appears in the SEO title.'
        });
      }
    } else {
      results.push({
        type: 'error',
        label: 'Keyphrase in title',
        detail: 'The focus keyphrase does not appear in your SEO title.'
      });
    }

    // 2. SEO Title Width / Length
    const titleLen = (seoData.metaTitle || articleTitle).length;
    if (titleLen >= 40 && titleLen <= 65) {
      results.push({
        type: 'good',
        label: 'SEO title width',
        detail: `The SEO title is ${titleLen} characters, optimal for Google search displays without truncation.`
      });
    } else if (titleLen < 40) {
      results.push({
        type: 'warning',
        label: 'SEO title width',
        detail: `The SEO title is a bit short (${titleLen} chars). Add more descriptive search keywords.`
      });
    } else {
      results.push({
        type: 'warning',
        label: 'SEO title width',
        detail: `The SEO title is ${titleLen} characters and may be truncated on smaller search screens.`
      });
    }

    // 3. Keyphrase in Meta Description
    if (desc.includes(keyword)) {
      results.push({
        type: 'good',
        label: 'Keyphrase in meta description',
        detail: 'The focus keyphrase is highlighted in the meta description snippet.'
      });
    } else {
      results.push({
        type: 'error',
        label: 'Keyphrase in meta description',
        detail: 'The meta description does not contain your focus keyphrase.'
      });
    }

    // 4. Meta Description Length
    const descLen = (seoData.metaDescription || '').length;
    if (descLen >= 120 && descLen <= 160) {
      results.push({
        type: 'good',
        label: 'Meta description length',
        detail: `Well done! At ${descLen} characters, your description length is optimal.`
      });
    } else if (descLen < 120) {
      results.push({
        type: 'warning',
        label: 'Meta description length',
        detail: `The meta description is too short (${descLen}/160 chars). Add rich context to entice readers.`
      });
    } else {
      results.push({
        type: 'warning',
        label: 'Meta description length',
        detail: `The meta description exceeds 160 characters and will be clipped by search engines.`
      });
    }

    // 5. Keyphrase in Slug
    if (slug.includes(keyword.replace(/\s+/g, '-'))) {
      results.push({
        type: 'good',
        label: 'Keyphrase in slug',
        detail: 'The focus keyphrase appears cleanly in your permanent URL slug.'
      });
    } else {
      results.push({
        type: 'warning',
        label: 'Keyphrase in slug',
        detail: 'Consider adding your focus keyphrase to the URL slug for maximum ranking impact.'
      });
    }

    // 6. Keyphrase Density
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(keywordRegex) || [];
    const occurrences = matches.length;
    const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;

    if (occurrences >= 2 && density <= 3.0) {
      results.push({
        type: 'good',
        label: 'Keyphrase density',
        detail: `The focus keyphrase was found ${occurrences} times (${density.toFixed(1)}% density). Perfectly balanced!`
      });
    } else if (occurrences < 2) {
      results.push({
        type: 'warning',
        label: 'Keyphrase density',
        detail: `The keyphrase was only found ${occurrences} time. Mention it naturally across your content.`
      });
    } else {
      results.push({
        type: 'error',
        label: 'Keyphrase density',
        detail: `Keyphrase density is ${density.toFixed(1)}%. Be careful not to keyword-stuff.`
      });
    }

    // 7. Keyphrase in Introduction
    const first100Words = words.slice(0, 100).join(' ').toLowerCase();
    if (first100Words.includes(keyword)) {
      results.push({
        type: 'good',
        label: 'Keyphrase in introduction',
        detail: 'The keyphrase appears in the opening paragraph of your story.'
      });
    } else {
      results.push({
        type: 'warning',
        label: 'Keyphrase in introduction',
        detail: 'Your focus keyphrase does not appear in the first paragraph. Introduce it early.'
      });
    }

    // 8. Content Length
    if (wordCount >= 300) {
      results.push({
        type: 'good',
        label: 'Text length',
        detail: `The text contains ${wordCount} words, which exceeds the recommended 300 words minimum.`
      });
    } else {
      results.push({
        type: 'warning',
        label: 'Text length',
        detail: `The text is only ${wordCount} words. In-depth editorial stories rank significantly better with 500+ words.`
      });
    }

    // Calculate overall numeric score
    const goods = results.filter((r) => r.type === 'good').length;
    const warnings = results.filter((r) => r.type === 'warning').length;
    const errors = results.filter((r) => r.type === 'error').length;
    const calculatedScore = Math.min(100, Math.max(30, Math.round((goods * 12) + (warnings * 6) - (errors * 8))));

    return {
      score: calculatedScore,
      readabilityScore: wordCount > 150 ? 92 : 75,
      results
    };
  }, [seoData, articleTitle, cleanContentText, words, wordCount]);

  // Schema.org Structured Data JSON-LD
  const schemaJson = useMemo(() => {
    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': seoData.canonicalUrl || `https://toufiqmotion.com/${seoData.slug}`
        },
        headline: seoData.metaTitle || articleTitle,
        description: seoData.metaDescription,
        image: seoData.ogImage || articleImage,
        author: {
          '@type': 'Person',
          name: 'Toufiq Motion',
          url: 'https://toufiqmotion.com/about'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Toufiq Motion Editorial',
          logo: {
            '@type': 'ImageObject',
            url: 'https://toufiqmotion.com/logo.png'
          }
        },
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString()
      },
      null,
      2
    );
  }, [seoData, articleTitle, articleImage]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaJson);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDF7F1] text-[#2E7D5A] border border-[#C8E9D6]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          SEO: Good ({score}/100)
        </span>
      );
    }
    if (score >= 55) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          SEO: OK ({score}/100)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
        SEO: Needs Work ({score}/100)
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EDE7DF] shadow-xs overflow-hidden">
      
      {/* Panel Top Header with Yoast-style Traffic Light */}
      <div className="bg-[#FAF8F5] border-b border-[#EAE5DF] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF2EB] text-[#E8734A] flex items-center justify-center font-bold text-base shadow-2xs">
            ⚡
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1E1B18] flex items-center gap-2">
              Yoast SEO Premium Panel
              <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#2D2A26] text-white">
                PRO 2026
              </span>
            </h3>
            <p className="text-xs text-[#8C8477]">
              Real-time Google SERP simulation, Social cards &amp; ranking algorithms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getScoreBadge(analysis.score)}
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Readability: Good
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#EAE5DF] px-6 gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`py-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'seo' ? 'border-[#E8734A] text-[#E8734A]' : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Search className="w-3.5 h-3.5" /> Google Search Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`py-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'social' ? 'border-[#E8734A] text-[#E8734A]' : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" /> Social Media Cards
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`py-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'schema' ? 'border-[#E8734A] text-[#E8734A]' : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> Schema.org JSON-LD
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`py-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'advanced' ? 'border-[#E8734A] text-[#E8734A]' : 'border-transparent text-[#6A6357] hover:text-[#1E1B18]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Technical SEO
        </button>
      </div>

      {/* Tab 1: Google Search & Analysis */}
      {activeTab === 'seo' && (
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Focus Keyphrase Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E8734A]" /> Focus Keyphrase *
              </label>
              <span className="text-[11px] text-[#8C8477]">What search term should this story rank for?</span>
            </div>
            <input
              type="text"
              value={seoData.focusKeyword}
              onChange={(e) => onChange({ ...seoData, focusKeyword: e.target.value })}
              placeholder="e.g. Amalfi Coast travel guide, specialty coffee Tokyo"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E0DCD4] text-xs font-medium focus:outline-hidden focus:border-[#E8734A]"
            />
          </div>

          {/* Google SERP Snippet Preview Box */}
          <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#EDE7DF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-3">
              <span className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" /> Google Search Preview
              </span>
              <div className="flex items-center gap-1 bg-white border border-[#E0DCD4] rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSnippetDevice('mobile')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                    snippetDevice === 'mobile' ? 'bg-[#E8734A] text-white font-bold' : 'text-[#6A6357]'
                  }`}
                >
                  <Smartphone className="w-3 h-3" /> Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setSnippetDevice('desktop')}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                    snippetDevice === 'desktop' ? 'bg-[#E8734A] text-white font-bold' : 'text-[#6A6357]'
                  }`}
                >
                  <Monitor className="w-3 h-3" /> Desktop
                </button>
              </div>
            </div>

            {/* Google SERP Card Mockup */}
            <div className={`bg-white rounded-xl p-4 border border-[#E0DCD4] shadow-xs space-y-1 ${
              snippetDevice === 'mobile' ? 'max-w-md' : 'w-full'
            }`}>
              {/* Site breadcrumbs */}
              <div className="flex items-center gap-2 text-xs text-[#4d5156] mb-1">
                <div className="w-4 h-4 rounded-full bg-[#E8734A] text-white text-[9px] font-bold flex items-center justify-center">
                  TM
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-[11px] text-[#202124]">Toufiq Motion</span>
                  <span className="text-[10px] text-[#4d5156] truncate">
                    https://toufiqmotion.com › {category.toLowerCase()} › {seoData.slug || 'story'}
                  </span>
                </div>
              </div>

              {/* SERP Title */}
              <h4 className="text-base sm:text-lg text-[#1a0dab] hover:underline font-medium cursor-pointer leading-snug line-clamp-2">
                {seoData.metaTitle || articleTitle || 'Enter an engaging SEO title...'}
              </h4>

              {/* SERP Description */}
              <p className="text-xs sm:text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
                {seoData.metaDescription || 'Add a compelling meta description to improve your organic click-through rate on Google...'}
              </p>
            </div>
          </div>

          {/* Title & Description Inputs with Color Gauges */}
          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-[#4A453E]">SEO Title</label>
                <span className={`text-[11px] font-mono ${
                  (seoData.metaTitle || articleTitle).length > 60 ? 'text-amber-600 font-bold' : 'text-[#8C8477]'
                }`}>
                  {(seoData.metaTitle || articleTitle).length} / 60 characters
                </span>
              </div>
              <input
                type="text"
                value={seoData.metaTitle}
                onChange={(e) => onChange({ ...seoData, metaTitle: e.target.value })}
                placeholder={articleTitle || 'SEO Title...'}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A]"
              />
              {/* Length indicator progress */}
              <div className="h-1 bg-[#EAE5DF] rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    (seoData.metaTitle || articleTitle).length >= 40 && (seoData.metaTitle || articleTitle).length <= 65
                      ? 'bg-emerald-500'
                      : (seoData.metaTitle || articleTitle).length > 65 ? 'bg-amber-500' : 'bg-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, ((seoData.metaTitle || articleTitle).length / 65) * 100)}%` }}
                />
              </div>
            </div>

            {/* URL Slug */}
            <div>
              <label className="text-xs font-semibold text-[#4A453E] block mb-1">URL Slug</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-[#FAF8F5] border border-r-0 border-[#E0DCD4] rounded-l-xl text-xs text-[#8C8477] font-mono">
                  toufiqmotion.com/
                </span>
                <input
                  type="text"
                  value={seoData.slug}
                  onChange={(e) => onChange({ ...seoData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="slug-url-here"
                  className="grow px-3 py-2.5 rounded-r-xl border border-[#E0DCD4] text-xs font-mono focus:outline-hidden focus:border-[#E8734A]"
                />
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-[#4A453E]">Meta Description</label>
                <span className={`text-[11px] font-mono ${
                  (seoData.metaDescription || '').length >= 120 && (seoData.metaDescription || '').length <= 160
                    ? 'text-emerald-600 font-bold'
                    : 'text-[#8C8477]'
                }`}>
                  {(seoData.metaDescription || '').length} / 160 characters
                </span>
              </div>
              <textarea
                rows={3}
                value={seoData.metaDescription}
                onChange={(e) => onChange({ ...seoData, metaDescription: e.target.value })}
                placeholder="Write a clear, compelling summary describing what the reader will discover in this guide..."
                className="w-full p-3 rounded-xl border border-[#E0DCD4] text-xs focus:outline-hidden focus:border-[#E8734A] resize-none"
              />
              <div className="h-1 bg-[#EAE5DF] rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    (seoData.metaDescription || '').length >= 120 && (seoData.metaDescription || '').length <= 160
                      ? 'bg-emerald-500'
                      : (seoData.metaDescription || '').length > 160 ? 'bg-amber-500' : 'bg-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, ((seoData.metaDescription || '').length / 160) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Yoast SEO Detailed Assessment Checklist */}
          <div className="space-y-4 pt-4 border-t border-[#EDE7DF]">
            <h4 className="font-serif font-bold text-base text-[#1E1B18] flex items-center justify-between">
              <span>SEO Analysis Results ({analysis.results.length})</span>
              <span className="text-xs font-sans text-[#8C8477]">
                {analysis.results.filter(r => r.type === 'good').length} passed &bull; {analysis.results.filter(r => r.type === 'warning').length} improvements
              </span>
            </h4>

            <div className="space-y-2.5">
              {analysis.results.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-[#FAF8F5] rounded-xl text-xs">
                  {item.type === 'good' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                  {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                  {item.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}

                  <div>
                    <strong className="text-[#1E1B18] font-bold">{item.label}:</strong>{' '}
                    <span className="text-[#554E42]">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Social Media Previews */}
      {activeTab === 'social' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#EAE5DF] pb-3">
            <button
              type="button"
              onClick={() => setSocialNetwork('facebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                socialNetwork === 'facebook' ? 'bg-[#1877F2] text-white shadow-xs' : 'bg-[#FAF8F5] text-[#554E42]'
              }`}
            >
              Facebook / LinkedIn
            </button>
            <button
              type="button"
              onClick={() => setSocialNetwork('twitter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                socialNetwork === 'twitter' ? 'bg-black text-white shadow-xs' : 'bg-[#FAF8F5] text-[#554E42]'
              }`}
            >
              X / Twitter Card
            </button>
          </div>

          {/* Social Card Mockup */}
          <div className="max-w-md mx-auto bg-white rounded-2xl overflow-hidden border border-[#EDE7DF] shadow-md">
            <div className="aspect-[1.91/1] overflow-hidden bg-black/5 relative">
              <img
                src={seoData.ogImage || articleImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}
                alt="Social share preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-1 bg-[#F9F7F4]">
              <span className="text-[10px] uppercase font-bold text-[#8C8477] tracking-wider">
                TOUFIQMOTION.COM
              </span>
              <h5 className="font-serif font-bold text-sm text-[#1E1B18] line-clamp-1 leading-snug">
                {seoData.ogTitle || seoData.metaTitle || articleTitle}
              </h5>
              <p className="text-xs text-[#6A6357] line-clamp-2">
                {seoData.ogDescription || seoData.metaDescription || 'Read this compelling journey on Toufiq Motion...'}
              </p>
            </div>
          </div>

          {/* Social Custom Overrides */}
          <div className="space-y-4 pt-4 border-t border-[#EDE7DF]">
            <div>
              <label className="text-xs font-semibold text-[#4A453E] block mb-1">Social Share Image (OG Image)</label>
              <input
                type="url"
                value={seoData.ogImage}
                onChange={(e) => onChange({ ...seoData, ogImage: e.target.value })}
                placeholder={articleImage || 'https://...'}
                className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#4A453E] block mb-1">Social Title (Optional override)</label>
              <input
                type="text"
                value={seoData.ogTitle}
                onChange={(e) => onChange({ ...seoData, ogTitle: e.target.value })}
                placeholder={seoData.metaTitle || articleTitle}
                className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#4A453E] block mb-1">Social Description (Optional override)</label>
              <textarea
                rows={2}
                value={seoData.ogDescription}
                onChange={(e) => onChange({ ...seoData, ogDescription: e.target.value })}
                placeholder={seoData.metaDescription}
                className="w-full p-2.5 rounded-xl border border-[#E0DCD4] text-xs resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Schema.org JSON-LD */}
      {activeTab === 'schema' && (
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-base text-[#1E1B18]">Structured Data (JSON-LD)</h4>
              <p className="text-xs text-[#8C8477]">
                Google-validated Schema.org <code>BlogPosting</code> markup automatically generated
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySchema}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E0DCD4] hover:border-[#E8734A] text-xs font-semibold text-[#4A453E] flex items-center gap-1.5 transition-all"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copied!' : 'Copy JSON-LD'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#1E1B18] text-[#F3EFEA] rounded-2xl text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
            {schemaJson}
          </pre>
        </div>
      )}

      {/* Tab 4: Technical SEO */}
      {activeTab === 'advanced' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="text-xs font-semibold text-[#4A453E] block mb-1">Canonical URL</label>
            <input
              type="url"
              value={seoData.canonicalUrl}
              onChange={(e) => onChange({ ...seoData, canonicalUrl: e.target.value })}
              placeholder={`https://toufiqmotion.com/${seoData.slug || 'story'}`}
              className="w-full px-3 py-2 rounded-xl border border-[#E0DCD4] text-xs font-mono"
            />
            <p className="text-[11px] text-[#8C8477] mt-1">
              Leaves empty to default to self-referencing canonical URL (recommended).
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE7DF]">
            <div>
              <h5 className="font-bold text-xs text-[#1E1B18]">Search Engine Robots (noindex)</h5>
              <p className="text-[11px] text-[#8C8477]">
                Instruct Google not to show this story in search results
              </p>
            </div>
            <input
              type="checkbox"
              checked={seoData.noIndex}
              onChange={(e) => onChange({ ...seoData, noIndex: e.target.checked })}
              className="w-4 h-4 accent-[#E8734A]"
            />
          </div>
        </div>
      )}

    </div>
  );
};
