import React, { useEffect } from 'react';
import { api } from '../api/client';

export const HeadTagsInjector: React.FC = () => {
  useEffect(() => {
    let isMounted = true;

    api.getSeoSettings()
      .then((res) => {
        if (!isMounted || !res.settings) return;
        const s = res.settings;

        // 1. Google Site Verification
        if (s.google_site_verification && s.google_site_verification.trim()) {
          const val = s.google_site_verification.trim();
          const content = val.startsWith('<meta')
            ? val.match(/content=["']([^"']+)["']/i)?.[1] || val
            : val;

          let meta = document.querySelector('meta[name="google-site-verification"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'google-site-verification');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        }

        // 2. Bing Webmaster Verification
        if (s.bing_site_verification && s.bing_site_verification.trim()) {
          const val = s.bing_site_verification.trim();
          const content = val.startsWith('<meta')
            ? val.match(/content=["']([^"']+)["']/i)?.[1] || val
            : val;

          let meta = document.querySelector('meta[name="msvalidate.01"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'msvalidate.01');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        }

        // 3. Google Analytics (GA4)
        if (s.google_analytics_id && s.google_analytics_id.trim()) {
          const gaId = s.google_analytics_id.trim();
          const gaScriptId = 'ga4-gtag-script';
          if (!document.getElementById(gaScriptId)) {
            const gtagScript = document.createElement('script');
            gtagScript.id = gaScriptId;
            gtagScript.async = true;
            gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            document.head.appendChild(gtagScript);

            const inlineScript = document.createElement('script');
            inlineScript.id = 'ga4-inline-config';
            inlineScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `;
            document.head.appendChild(inlineScript);
          }
        }

        // 4. Custom Head Tags
        if (s.custom_head_tags && s.custom_head_tags.trim()) {
          const containerId = 'custom-user-head-tags';
          let container = document.getElementById(containerId);
          if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.display = 'none';
            document.head.appendChild(container);
            container.innerHTML = s.custom_head_tags;

            // Execute any <script> tags present inside custom_head_tags
            Array.from(container.querySelectorAll('script')).forEach((oldScript) => {
              const newScript = document.createElement('script');
              Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
              newScript.appendChild(document.createTextNode(oldScript.innerHTML));
              oldScript.parentNode?.replaceChild(newScript, oldScript);
            });
          }
        }
      })
      .catch((err) => {
        console.warn('HeadTagsInjector error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

