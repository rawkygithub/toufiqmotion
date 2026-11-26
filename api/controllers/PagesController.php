<?php
declare(strict_types=1);

class PagesController
{
    public static function formatPage(?array $row): ?array
    {
        if (!$row) {
            return null;
        }
        $blocks = is_string($row['blocks_json'])
            ? (json_decode($row['blocks_json'] ?: '[]', true) ?: [])
            : $row['blocks_json'];

        return [
            'id'               => (string)$row['id'],
            'title'            => (string)$row['title'],
            'slug'             => (string)$row['slug'],
            'excerpt'          => (string)($row['excerpt'] ?? ''),
            'status'           => (string)$row['status'],
            'featured_image'   => (string)($row['featured_image'] ?? ''),
            'template'         => (string)($row['template'] ?? 'custom'),
            'blocks_json'      => $blocks,
            'meta_title'       => (string)($row['meta_title'] ?? ''),
            'meta_description' => (string)($row['meta_description'] ?? ''),
            'focus_keyword'    => (string)($row['focus_keyword'] ?? ''),
            'canonical_url'    => (string)($row['canonical_url'] ?? ''),
            'no_index'         => (bool)$row['no_index'],
            'seo_score'        => (int)$row['seo_score'],
            'is_system'        => (bool)$row['is_system'],
            'views'            => (int)$row['views'],
            'created_at'       => $row['created_at'],
            'updated_at'       => $row['updated_at'],
        ];
    }

    public static function index(): void
    {
        $q      = strtolower(trim((string)Request::query('q', '')));
        $status = strtolower((string)Request::query('status', 'all'));

        $where = [];
        $params = [];

        if ($q !== '') {
            $where[] = '(LOWER(`title`) LIKE ? OR LOWER(`slug`) LIKE ? OR LOWER(`excerpt`) LIKE ?)';
            $term = '%' . $q . '%';
            $params = array_merge($params, [$term, $term, $term]);
        }

        if ($status === 'published') {
            $where[] = "`status` = 'published'";
        } elseif ($status === 'draft') {
            $where[] = "`status` = 'draft'";
        }

        $whereSql = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM `pages` {$whereSql} ORDER BY `updated_at` DESC");
        $stmt->execute($params);
        $pages = array_map([self::class, 'formatPage'], $stmt->fetchAll());

        $statsRow = $pdo->query("
            SELECT
                COUNT(*) as totalPages,
                COALESCE(SUM(CASE WHEN `status` = 'published' THEN 1 ELSE 0 END), 0) as publishedPages,
                COALESCE(SUM(CASE WHEN `status` = 'draft' THEN 1 ELSE 0 END), 0) as draftPages,
                COALESCE(SUM(`views`), 0) as totalViews
            FROM `pages`
        ")->fetch();

        Response::json([
            'success' => true,
            'pages'   => $pages,
            'total'   => count($pages),
            'stats'   => [
                'totalPages'     => (int)($statsRow['totalPages'] ?? 0),
                'publishedPages' => (int)($statsRow['publishedPages'] ?? 0),
                'draftPages'     => (int)($statsRow['draftPages'] ?? 0),
                'totalViews'     => (int)($statsRow['totalViews'] ?? 0),
            ],
        ]);
    }

    public static function showBySlug(array $params): void
    {
        $cleanSlug = ltrim(strtolower(trim((string)($params['slug'] ?? ''))), '/');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `pages` WHERE LOWER(`slug`) = ? LIMIT 1');
        $stmt->execute([$cleanSlug]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::error('Page not found', 404);
        }

        try {
            $pdo->prepare('UPDATE `pages` SET `views` = `views` + 1 WHERE `id` = ?')->execute([$page['id']]);
        } catch (Throwable $e) {}

        Response::json([
            'success' => true,
            'page'    => self::formatPage($page),
        ]);
    }

    public static function show(array $params): void
    {
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `pages` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::error('Page not found', 404);
        }

        Response::json([
            'success' => true,
            'page'    => self::formatPage($page),
        ]);
    }

    public static function create(): void
    {
        Auth::requireAuth();
        $body = Request::body();
        $title = trim((string)($body['title'] ?? ''));

        if ($title === '') {
            Response::error('Page title is required', 400);
        }

        $cleanSlug = SeoScoring::slugify((string)($body['slug'] ?: $title));
        $pdo = Database::getConnection();

        $check = $pdo->prepare('SELECT `id` FROM `pages` WHERE `slug` = ? LIMIT 1');
        $check->execute([$cleanSlug]);
        if ($check->fetch()) {
            $cleanSlug .= '-' . substr((string)time(), -4);
        }

        $id = 'page-' . (int)round(microtime(true) * 1000);
        $blocksRaw = $body['blocks_json'] ?? [];
        $blocksString = is_string($blocksRaw) ? $blocksRaw : json_encode($blocksRaw, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $blocksArr = is_array($blocksRaw) ? $blocksRaw : (json_decode((string)$blocksString, true) ?: []);

        $excerpt      = trim((string)($body['excerpt'] ?? ''));
        $metaTitle    = trim((string)($body['meta_title'] ?? ''));
        $metaDesc     = trim((string)($body['meta_description'] ?? ''));
        $focusKeyword = trim((string)($body['focus_keyword'] ?? ''));

        $seoScore = 80;
        if (strlen($metaTitle) >= 30) $seoScore += 5;
        if (strlen($metaDesc) >= 80) $seoScore += 5;
        if ($focusKeyword !== '') $seoScore += 5;
        if (count($blocksArr) >= 3) $seoScore += 4;

        $pdo->prepare('
            INSERT INTO `pages` (
                `id`, `title`, `slug`, `excerpt`, `status`, `featured_image`, `template`, `blocks_json`,
                `meta_title`, `meta_description`, `focus_keyword`, `canonical_url`, `no_index`, `seo_score`, `is_system`, `views`, `created_at`, `updated_at`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ')->execute([
            $id,
            $title,
            $cleanSlug,
            $excerpt,
            $body['status'] ?? 'published',
            $body['featured_image'] ?? '',
            $body['template'] ?? 'custom',
            $blocksString,
            $metaTitle !== '' ? $metaTitle : $title,
            $metaDesc !== '' ? $metaDesc : $excerpt,
            $focusKeyword,
            trim((string)($body['canonical_url'] ?? '')),
            !empty($body['no_index']) ? 1 : 0,
            min(100, $seoScore),
        ]);

        $createdStmt = $pdo->prepare('SELECT * FROM `pages` WHERE `id` = ?');
        $createdStmt->execute([$id]);

        Response::json([
            'success' => true,
            'message' => 'Page created successfully',
            'page'    => self::formatPage($createdStmt->fetch()),
        ], 201);
    }

    public static function update(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $body = Request::body();
        $pdo = Database::getConnection();

        $existStmt = $pdo->prepare('SELECT * FROM `pages` WHERE `id` = ? LIMIT 1');
        $existStmt->execute([$id]);
        $existing = $existStmt->fetch();
        if (!$existing) {
            Response::error('Page not found', 404);
        }

        $finalSlug = (string)$existing['slug'];
        if (!empty($body['slug']) && $body['slug'] !== $existing['slug']) {
            $finalSlug = SeoScoring::slugify((string)$body['slug']);
            $colCheck = $pdo->prepare('SELECT `id` FROM `pages` WHERE `slug` = ? AND `id` != ? LIMIT 1');
            $colCheck->execute([$finalSlug, $id]);
            if ($colCheck->fetch()) {
                $finalSlug .= '-' . substr((string)time(), -4);
            }
        }

        $blocksString = array_key_exists('blocks_json', $body)
            ? (is_string($body['blocks_json']) ? $body['blocks_json'] : json_encode($body['blocks_json'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES))
            : $existing['blocks_json'];

        $checkMetaTitle = !empty($body['meta_title']) ? (string)$body['meta_title'] : (string)$existing['meta_title'];
        $checkMetaDesc  = !empty($body['meta_description']) ? (string)$body['meta_description'] : (string)$existing['meta_description'];
        $checkKeyword   = !empty($body['focus_keyword']) ? (string)$body['focus_keyword'] : (string)$existing['focus_keyword'];

        $seoScore = 80;
        if (strlen($checkMetaTitle) >= 30) $seoScore += 5;
        if (strlen($checkMetaDesc) >= 80) $seoScore += 5;
        if ($checkKeyword !== '') $seoScore += 5;

        $pdo->prepare('
            UPDATE `pages`
            SET `title` = COALESCE(?, `title`),
                `slug` = ?,
                `excerpt` = COALESCE(?, `excerpt`),
                `status` = COALESCE(?, `status`),
                `featured_image` = COALESCE(?, `featured_image`),
                `template` = COALESCE(?, `template`),
                `blocks_json` = ?,
                `meta_title` = COALESCE(?, `meta_title`),
                `meta_description` = COALESCE(?, `meta_description`),
                `focus_keyword` = COALESCE(?, `focus_keyword`),
                `canonical_url` = COALESCE(?, `canonical_url`),
                `no_index` = COALESCE(?, `no_index`),
                `seo_score` = ?,
                `updated_at` = CURRENT_TIMESTAMP
            WHERE `id` = ?
        ')->execute([
            isset($body['title']) ? trim((string)$body['title']) : null,
            $finalSlug,
            array_key_exists('excerpt', $body) && $body['excerpt'] !== null ? trim((string)$body['excerpt']) : null,
            $body['status'] ?? null,
            array_key_exists('featured_image', $body) ? $body['featured_image'] : null,
            $body['template'] ?? null,
            $blocksString,
            array_key_exists('meta_title', $body) && $body['meta_title'] !== null ? trim((string)$body['meta_title']) : null,
            array_key_exists('meta_description', $body) && $body['meta_description'] !== null ? trim((string)$body['meta_description']) : null,
            array_key_exists('focus_keyword', $body) && $body['focus_keyword'] !== null ? trim((string)$body['focus_keyword']) : null,
            array_key_exists('canonical_url', $body) && $body['canonical_url'] !== null ? trim((string)$body['canonical_url']) : null,
            array_key_exists('no_index', $body) ? (!empty($body['no_index']) ? 1 : 0) : null,
            min(100, $seoScore),
            $id,
        ]);

        $updStmt = $pdo->prepare('SELECT * FROM `pages` WHERE `id` = ?');
        $updStmt->execute([$id]);

        Response::json([
            'success' => true,
            'message' => 'Page updated successfully',
            'page'    => self::formatPage($updStmt->fetch()),
        ]);
    }

    public static function duplicate(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `pages` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $page = $stmt->fetch();
        if (!$page) {
            Response::error('Page not found to duplicate', 404);
        }

        $newId    = 'page-' . (int)round(microtime(true) * 1000);
        $newTitle = $page['title'] . ' (Copy)';
        $newSlug  = $page['slug'] . '-copy-' . substr((string)time(), -4);

        $pdo->prepare("
            INSERT INTO `pages` (
                `id`, `title`, `slug`, `excerpt`, `status`, `featured_image`, `template`, `blocks_json`,
                `meta_title`, `meta_description`, `focus_keyword`, `canonical_url`, `no_index`, `seo_score`, `is_system`, `views`, `created_at`, `updated_at`
            ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ")->execute([
            $newId,
            $newTitle,
            $newSlug,
            $page['excerpt'],
            $page['featured_image'],
            $page['template'],
            $page['blocks_json'],
            $newTitle,
            $page['meta_description'],
            $page['focus_keyword'],
            '',
            $page['no_index'],
            $page['seo_score'],
        ]);

        $dupStmt = $pdo->prepare('SELECT * FROM `pages` WHERE `id` = ?');
        $dupStmt->execute([$newId]);

        Response::json([
            'success' => true,
            'message' => 'Page duplicated as draft',
            'page'    => self::formatPage($dupStmt->fetch()),
        ]);
    }

    public static function addToMenu(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `pages` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $page = $stmt->fetch();
        if (!$page) {
            Response::error('Page not found', 404);
        }

        $setStmt = $pdo->query("SELECT `value` FROM `site_settings` WHERE `key` = 'menu_items_json' LIMIT 1");
        $row = $setStmt->fetch();
        $menuItems = [];
        if ($row && !empty($row['value'])) {
            $decoded = json_decode((string)$row['value'], true);
            if (is_array($decoded)) {
                $menuItems = $decoded;
            }
        }

        $targetUrl = '/' . $page['slug'];
        foreach ($menuItems as $m) {
            if (($m['url'] ?? '') === $targetUrl || ($m['pageId'] ?? '') === $page['slug']) {
                Response::json(['success' => true, 'message' => 'Page is already present in the navigation menu']);
            }
        }

        $menuItems[] = [
            'id'          => 'm-' . $page['slug'],
            'label'       => $page['title'],
            'type'        => 'page',
            'pageId'      => $page['slug'],
            'url'         => $targetUrl,
            'hasDropdown' => false,
            'enabled'     => true,
        ];

        $pdo->prepare("
            INSERT INTO `site_settings` (`key`, `value`, `updated_at`)
            VALUES ('menu_items_json', ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = CURRENT_TIMESTAMP
        ")->execute([json_encode($menuItems, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

        Response::json([
            'success'   => true,
            'message'   => "\"{$page['title']}\" added to navigation menu successfully!",
            'menuItems' => $menuItems,
        ]);
    }

    public static function delete(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT `is_system`, `title` FROM `pages` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::error('Page not found', 404);
        }
        if (!empty($page['is_system'])) {
            Response::error('System core pages cannot be deleted', 403);
        }

        $pdo->prepare('DELETE FROM `pages` WHERE `id` = ?')->execute([$id]);
        Response::json(['success' => true, 'message' => "Page \"{$page['title']}\" deleted successfully"]);
    }
}

