<?php
declare(strict_types=1);

class HeadTagsService
{
    public static function getSettingsMap(): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT `key`, `value` FROM `seo_settings`");
        $s = [];
        foreach ($stmt->fetchAll() as $row) {
            $s[(string)$row['key']] = (string)$row['value'];
        }
        return $s;
    }

    public static function buildHeadTagsHtml(): string
    {
        try {
            $s = self::getSettingsMap();
            $head = "\n    <!-- Injected SEO, Analytics & Custom Head Tags -->\n";

            // 1. Google Site Verification
            $gsc = trim($s['google_site_verification'] ?? '');
            if ($gsc !== '') {
                if (str_starts_with($gsc, '<meta') || str_starts_with($gsc, '<')) {
                    $head .= "    {$gsc}\n";
                } else {
                    $safe = htmlspecialchars($gsc, ENT_QUOTES, 'UTF-8');
                    $head .= "    <meta name=\"google-site-verification\" content=\"{$safe}\" />\n";
                }
            }

            // 2. Bing Webmaster Verification
            $bing = trim($s['bing_site_verification'] ?? '');
            if ($bing !== '') {
                if (str_starts_with($bing, '<meta') || str_starts_with($bing, '<')) {
                    $head .= "    {$bing}\n";
                } else {
                    $safe = htmlspecialchars($bing, ENT_QUOTES, 'UTF-8');
                    $head .= "    <meta name=\"msvalidate.01\" content=\"{$safe}\" />\n";
                }
            }

            // 3. Google Analytics 4 (GA4)
            $gaId = trim($s['google_analytics_id'] ?? '');
            if ($gaId !== '') {
                $safeGa = htmlspecialchars($gaId, ENT_QUOTES, 'UTF-8');
                $head .= "    <!-- Google Analytics (GA4) -->\n";
                $head .= "    <script async src=\"https://www.googletagmanager.com/gtag/js?id={$safeGa}\"></script>\n";
                $head .= "    <script>\n";
                $head .= "      window.dataLayer = window.dataLayer || [];\n";
                $head .= "      function gtag(){dataLayer.push(arguments);}\n";
                $head .= "      gtag('js', new Date());\n";
                $head .= "      gtag('config', '{$safeGa}');\n";
                $head .= "    </script>\n";
            }

            // 4. Google Tag Manager (GTM)
            $gtmId = trim($s['google_tag_manager_id'] ?? '');
            if ($gtmId !== '') {
                $safeGtm = htmlspecialchars($gtmId, ENT_QUOTES, 'UTF-8');
                $head .= "    <!-- Google Tag Manager -->\n";
                $head .= "    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n";
                $head .= "    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n";
                $head .= "    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n";
                $head .= "    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n";
                $head .= "    })(window,document,'script','dataLayer','{$safeGtm}');</script>\n";
            }

            // 5. Custom User Head Tags (pixels, fonts, verification tags, custom styles/scripts)
            $customHead = trim($s['custom_head_tags'] ?? '');
            if ($customHead !== '') {
                $head .= "    <!-- Custom User Head Code -->\n";
                $head .= "    {$customHead}\n";
            }

            $head .= "    <!-- End Injected SEO, Analytics & Custom Head Tags -->\n";
            return $head;
        } catch (Throwable $e) {
            return '';
        }
    }

    public static function injectHeadTagsIntoHtml(string $html): string
    {
        $headInjections = self::buildHeadTagsHtml();
        if (trim($headInjections) === '') {
            return $html;
        }
        if (str_contains($html, '</head>')) {
            return str_replace('</head>', $headInjections . '  </head>', $html);
        }
        return $html;
    }

    public static function verifyLiveHeadTags(): array
    {
        $s = self::getSettingsMap();

        $hasGoogle     = trim($s['google_site_verification'] ?? '') !== '';
        $hasBing       = trim($s['bing_site_verification'] ?? '') !== '';
        $hasGa         = trim($s['google_analytics_id'] ?? '') !== '';
        $hasGtm        = trim($s['google_tag_manager_id'] ?? '') !== '';
        $hasCustomHead = trim($s['custom_head_tags'] ?? '') !== '';

        $candidates = [
            APP_SHELL_HTML,
            ROOT_DIR . DIRECTORY_SEPARATOR . 'index.html',
        ];
        $targetHtmlPath = null;
        foreach ($candidates as $path) {
            if (is_file($path)) {
                $targetHtmlPath = $path;
                break;
            }
        }

        $injectedPreview = '';
        if ($targetHtmlPath !== null) {
            $rawHtml = file_get_contents($targetHtmlPath);
            if ($rawHtml !== false) {
                $finalHtml = self::injectHeadTagsIntoHtml($rawHtml);
                $headStart = strpos($finalHtml, '<head>');
                $headEnd   = strpos($finalHtml, '</head>');
                if ($headStart !== false && $headEnd !== false) {
                    $injectedPreview = substr($finalHtml, $headStart, ($headEnd + 7) - $headStart);
                }
            }
        }

        return [
            'success'   => true,
            'status'    => 'ready',
            'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
            'configured' => [
                'google_site_verification' => $hasGoogle,
                'bing_site_verification'   => $hasBing,
                'google_analytics_id'      => $hasGa,
                'google_tag_manager_id'    => $hasGtm,
                'custom_head_tags'         => $hasCustomHead,
            ],
            'values' => [
                'google_site_verification' => $s['google_site_verification'] ?? '',
                'bing_site_verification'   => $s['bing_site_verification'] ?? '',
                'google_analytics_id'      => $s['google_analytics_id'] ?? '',
                'google_tag_manager_id'    => $s['google_tag_manager_id'] ?? '',
                'custom_head_tags'         => $s['custom_head_tags'] ?? '',
            ],
            'injectedPreview' => $injectedPreview,
        ];
    }
}

