<?php
declare(strict_types=1);

@ini_set('display_errors', '0');

require_once __DIR__ . '/api/config/config.php';
require_once __DIR__ . '/api/core/Database.php';
require_once __DIR__ . '/api/core/Request.php';
require_once __DIR__ . '/api/services/HeadTagsService.php';

$method = Request::method();
$path   = Request::path();

// 1. Dynamic XML Sitemap (/sitemap.xml)
if ($path === '/sitemap.xml') {
    try {
        $pdo = Database::getConnection();
        $baseUrl = Database::canonicalDomain();

        $articles   = $pdo->query('SELECT `slug`, `updated_at`, `created_at` FROM `articles` WHERE `published` = 1 AND `no_index` = 0')->fetchAll();
        $categories = $pdo->query('SELECT `slug` FROM `categories`')->fetchAll();
        $customPages = [];
        try {
            $customPages = $pdo->query("SELECT `slug`, `updated_at`, `created_at` FROM `pages` WHERE `status` = 'published' AND `no_index` = 0")->fetchAll();
        } catch (Throwable $e) {}

        $staticPages = [
            ['loc' => "{$baseUrl}/",             'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => "{$baseUrl}/travel",       'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => "{$baseUrl}/lifestyle",    'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => "{$baseUrl}/health",       'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => "{$baseUrl}/work-with-us", 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['loc' => "{$baseUrl}/about",        'priority' => '0.8', 'changefreq' => 'monthly'],
        ];

        $xml  = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:news=\"http://www.google.com/schemas/sitemap-news/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n";

        foreach ($staticPages as $p) {
            $loc = htmlspecialchars($p['loc'], ENT_XML1, 'UTF-8');
            $xml .= "  <url>\n    <loc>{$loc}</loc>\n    <changefreq>{$p['changefreq']}</changefreq>\n    <priority>{$p['priority']}</priority>\n  </url>\n";
        }
        foreach ($categories as $c) {
            $loc = htmlspecialchars("{$baseUrl}/category/{$c['slug']}", ENT_XML1, 'UTF-8');
            $xml .= "  <url>\n    <loc>{$loc}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n";
        }
        foreach ($articles as $a) {
            $rawDate = (string)($a['updated_at'] ?: ($a['created_at'] ?: date('Y-m-d')));
            $lastmod = explode(' ', $rawDate)[0];
            $loc = htmlspecialchars("{$baseUrl}/{$a['slug']}", ENT_XML1, 'UTF-8');
            $xml .= "  <url>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.90</priority>\n  </url>\n";
        }
        foreach ($customPages as $cp) {
            $rawDate = (string)($cp['updated_at'] ?: ($cp['created_at'] ?: date('Y-m-d')));
            $lastmod = explode(' ', $rawDate)[0];
            $loc = htmlspecialchars("{$baseUrl}/{$cp['slug']}", ENT_XML1, 'UTF-8');
            $xml .= "  <url>\n    <loc>{$loc}</loc>\n    <lastmod>{$lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n";
        }
        $xml .= "</urlset>";

        header('Content-Type: application/xml; charset=utf-8');
        echo $xml;
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo '<!-- Error generating sitemap -->';
        exit;
    }
}

// 2. Dynamic Robots.txt (/robots.txt)
if ($path === '/robots.txt') {
    header('Content-Type: text/plain; charset=utf-8');
    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT `value` FROM `seo_settings` WHERE `key` = 'robots_txt' LIMIT 1");
        $row = $stmt->fetch();
        $baseUrl = Database::baseUrl();
        $defaultRobots = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: {$baseUrl}/sitemap.xml";
        echo ($row && !empty(trim((string)$row['value']))) ? $row['value'] : $defaultRobots;
    } catch (Throwable $e) {
        echo "User-agent: *\nDisallow:";
    }
    exit;
}

// 3. Affiliate Link Cloaker & Conversion Redirect (/go/:slug)
if (preg_match('#^/go/([^/]+)$#', $path, $m)) {
    $slug = strtolower(trim(urldecode($m[1])));
    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `affiliate_links` WHERE LOWER(`slug`) = ? AND `is_active` = 1 LIMIT 1');
        $stmt->execute([$slug]);
        $link = $stmt->fetch();

        if ($link) {
            $pdo->prepare('UPDATE `affiliate_links` SET `clicks_count` = `clicks_count` + 1, `last_clicked_at` = CURRENT_TIMESTAMP WHERE `id` = ?')
                ->execute([$link['id']]);

            $clickId = 'clk-' . (int)round(microtime(true) * 1000) . '-' . substr(bin2hex(random_bytes(2)), 0, 4);
            $pdo->prepare('
                INSERT INTO `affiliate_clicks` (`id`, `link_id`, `slug`, `merchant`, `referer`, `user_agent`, `ip`, `created_at`)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ')->execute([
                $clickId,
                $link['id'],
                $link['slug'],
                $link['merchant'],
                $_SERVER['HTTP_REFERER'] ?? 'Direct Navigation',
                $_SERVER['HTTP_USER_AGENT'] ?? 'Browser',
                Request::ip(),
            ]);

            header('Location: ' . $link['target_url'], true, 302);
            exit;
        }
    } catch (Throwable $e) {
        // Fallback to home on error
    }
    header('Location: /', true, 302);
    exit;
}

// 4. SEO 301/302 Redirects & Legacy Crawler 404 Logger (on GET/HEAD)
if ($method === 'GET' || $method === 'HEAD') {
    $cleanPath = strtolower($path);
    try {
        $pdo = Database::getConnection();
        $redStmt = $pdo->prepare('SELECT * FROM `seo_redirects` WHERE LOWER(`source_path`) = ? LIMIT 1');
        $redStmt->execute([$cleanPath]);
        $redirect = $redStmt->fetch();

        if ($redirect) {
            $pdo->prepare('UPDATE `seo_redirects` SET `hits_count` = `hits_count` + 1, `last_accessed` = CURRENT_TIMESTAMP WHERE `id` = ?')
                ->execute([$redirect['id']]);
            header('Location: ' . $redirect['target_path'], true, (int)($redirect['redirect_code'] ?: 301));
            exit;
        }
    } catch (Throwable $e) {}

    $isCrawlErrorPath = $path !== '/index.php' && (
        str_contains($path, '.php') ||
        str_starts_with($path, '/wp-') ||
        str_starts_with($path, '/feed') ||
        str_starts_with($path, '/tag/') ||
        str_starts_with($path, '/archives/') ||
        str_contains($path, '.asp')
    );

    if ($isCrawlErrorPath) {
        try {
            $pdo = Database::getConnection();
            $errId = 'err-' . (int)round(microtime(true) * 1000);
            $pdo->prepare('
                INSERT INTO `seo_crawl_errors` (`id`, `path`, `hits_count`, `referer`, `user_agent`, `ip`, `status`, `last_detected`)
                VALUES (?, ?, 1, ?, ?, ?, "active", CURRENT_TIMESTAMP)
                ON DUPLICATE KEY UPDATE `hits_count` = `hits_count` + 1, `last_detected` = CURRENT_TIMESTAMP
            ')->execute([
                $errId,
                $path,
                $_SERVER['HTTP_REFERER'] ?? 'Direct Navigation',
                $_SERVER['HTTP_USER_AGENT'] ?? 'Search Crawler',
                Request::ip(),
            ]);
        } catch (Throwable $e) {}

        http_response_code(404);
        echo '<!-- 404 Crawl Error Logged in SEO Command Center --> Not Found';
        exit;
    }
}

// 5. Serve React SPA Shell with Dynamic Server-Side <head> Tag Injection
header('Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: text/html; charset=utf-8');

$shellFile = is_file(APP_SHELL_HTML)
    ? APP_SHELL_HTML
    : (is_file(__DIR__ . '/index.html') ? __DIR__ . '/index.html' : null);

if ($shellFile === null) {
    http_response_code(404);
    echo 'Frontend build not found (missing app-shell.html).';
    exit;
}

$rawHtml   = (string)file_get_contents($shellFile);
$finalHtml = HeadTagsService::injectHeadTagsIntoHtml($rawHtml);
echo $finalHtml;
