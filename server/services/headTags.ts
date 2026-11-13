import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface HeadSettingsMap {
  google_site_verification?: string;
  bing_site_verification?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  custom_head_tags?: string;
  custom_body_tags?: string;
  canonical_domain?: string;
}

/**
 * Builds the HTML snippet for SEO meta tags, Google/Bing verification,
 * Google Analytics GA4, Google Tag Manager, and user custom <head> tags.
 */
export function buildHeadTagsHtml(): string {
  try {
    const rows = db.prepare('SELECT key, value FROM seo_settings').all() as { key: string; value: string }[];
    const s: Record<string, string> = {};
    for (const r of rows) s[r.key] = r.value;

    let head = '\n    <!-- Injected SEO, Analytics & Custom Head Tags -->\n';

    // 1. Google Site Verification
    if (s.google_site_verification && s.google_site_verification.trim()) {
      const val = s.google_site_verification.trim();
      if (val.startsWith('<meta') || val.startsWith('<')) {
        head += `    ${val}\n`;
      } else {
        head += `    <meta name="google-site-verification" content="${val}" />\n`;
      }
    }

    // 2. Bing Webmaster Verification
    if (s.bing_site_verification && s.bing_site_verification.trim()) {
      const val = s.bing_site_verification.trim();
      if (val.startsWith('<meta') || val.startsWith('<')) {
        head += `    ${val}\n`;
      } else {
        head += `    <meta name="msvalidate.01" content="${val}" />\n`;
      }
    }

    // 3. Google Analytics 4 (GA4)
    if (s.google_analytics_id && s.google_analytics_id.trim()) {
      const gaId = s.google_analytics_id.trim();
      head += `    <!-- Google Analytics (GA4) -->\n`;
      head += `    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>\n`;
      head += `    <script>\n`;
      head += `      window.dataLayer = window.dataLayer || [];\n`;
      head += `      function gtag(){dataLayer.push(arguments);}\n`;
      head += `      gtag('js', new Date());\n`;
      head += `      gtag('config', '${gaId}');\n`;
      head += `    </script>\n`;
    }

    // 4. Google Tag Manager (GTM)
    if (s.google_tag_manager_id && s.google_tag_manager_id.trim()) {
      const gtmId = s.google_tag_manager_id.trim();
      head += `    <!-- Google Tag Manager -->\n`;
      head += `    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n`;
      head += `    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n`;
      head += `    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n`;
      head += `    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n`;
      head += `    })(window,document,'script','dataLayer','${gtmId}');</script>\n`;
    }

    // 5. Custom Head Tags (Meta Pixel, Pinterest, custom meta, scripts, styles)
    if (s.custom_head_tags && s.custom_head_tags.trim()) {
      head += `    <!-- Custom User Head Code -->\n`;
      head += `    ${s.custom_head_tags.trim()}\n`;
    }

    head += `    <!-- End Injected SEO, Analytics & Custom Head Tags -->\n`;
    return head;
  } catch (err) {
    console.warn('Error building head tags:', err);
    return '';
  }
}

/**
 * Injects the generated head tags and custom favicon into raw HTML right before </head>
 */
export function injectHeadTagsIntoHtml(html: string): string {
  try {
    const favRow = db.prepare("SELECT value FROM site_settings WHERE key = 'favicon_url' LIMIT 1").get() as { value: string } | undefined;
    const faviconUrl = (favRow?.value || '').trim();
    if (faviconUrl) {
      const lower = faviconUrl.toLowerCase();
      let typeAttr = '';
      if (lower.endsWith('.svg')) typeAttr = ' type="image/svg+xml"';
      else if (lower.endsWith('.png')) typeAttr = ' type="image/png"';
      else if (lower.endsWith('.ico')) typeAttr = ' type="image/x-icon"';
      else if (lower.endsWith('.webp')) typeAttr = ' type="image/webp"';

      const customFavTag = `<link rel="icon"${typeAttr} href="${faviconUrl}" />`;
      if (/<link\s+rel=["']icon["'][^>]*>/i.test(html)) {
        html = html.replace(/<link\s+rel=["']icon["'][^>]*>/i, customFavTag);
      } else {
        html = html.replace('</head>', `    ${customFavTag}\n  </head>`);
      }
    }
  } catch {}

  const headInjections = buildHeadTagsHtml();
  if (!headInjections.trim()) return html;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${headInjections}  </head>`);
  }
  return html;
}

/**
 * Performs a verification check on what tags are configured in the DB
 * and whether they are successfully injected into the HTML.
 */
export function verifyLiveHeadTags() {
  const rows = db.prepare('SELECT key, value FROM seo_settings').all() as { key: string; value: string }[];
  const s: Record<string, string> = {};
  for (const r of rows) s[r.key] = r.value;

  const hasGoogle = !!(s.google_site_verification && s.google_site_verification.trim());
  const hasBing = !!(s.bing_site_verification && s.bing_site_verification.trim());
  const hasGa = !!(s.google_analytics_id && s.google_analytics_id.trim());
  const hasGtm = !!(s.google_tag_manager_id && s.google_tag_manager_id.trim());
  const hasCustomHead = !!(s.custom_head_tags && s.custom_head_tags.trim());

  const distDir = path.join(__dirname, '../../dist');
  const indexPath = path.join(distDir, 'index.html');
  const rootIndexPath = path.join(__dirname, '../../index.html');
  const targetHtmlPath = fs.existsSync(indexPath) ? indexPath : rootIndexPath;

  let injectedPreview = '';
  let liveHtmlStatus = 'ready';

  if (fs.existsSync(targetHtmlPath)) {
    const rawHtml = fs.readFileSync(targetHtmlPath, 'utf-8');
    const finalHtml = injectHeadTagsIntoHtml(rawHtml);
    const headStart = finalHtml.indexOf('<head>');
    const headEnd = finalHtml.indexOf('</head>');
    if (headStart !== -1 && headEnd !== -1) {
      injectedPreview = finalHtml.substring(headStart, headEnd + 7);
    }
  }

  return {
    success: true,
    status: liveHtmlStatus,
    timestamp: new Date().toISOString(),
    configured: {
      google_site_verification: hasGoogle,
      bing_site_verification: hasBing,
      google_analytics_id: hasGa,
      google_tag_manager_id: hasGtm,
      custom_head_tags: hasCustomHead
    },
    values: {
      google_site_verification: s.google_site_verification || '',
      bing_site_verification: s.bing_site_verification || '',
      google_analytics_id: s.google_analytics_id || '',
      google_tag_manager_id: s.google_tag_manager_id || '',
      custom_head_tags: s.custom_head_tags || ''
    },
    injectedPreview
  };
}

