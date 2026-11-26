<?php
declare(strict_types=1);

class AffiliateController
{
    public static function formatLink(?array $row): ?array
    {
        if (!$row) {
            return null;
        }
        $pros = is_string($row['pros_json'] ?? null) ? (json_decode((string)$row['pros_json'], true) ?: []) : [];
        $cons = is_string($row['cons_json'] ?? null) ? (json_decode((string)$row['cons_json'], true) ?: []) : [];

        return [
            'id'                    => (string)$row['id'],
            'title'                 => (string)$row['title'],
            'slug'                  => (string)$row['slug'],
            'target_url'            => (string)$row['target_url'],
            'merchant'              => (string)$row['merchant'],
            'category'              => (string)($row['category'] ?? 'Gear'),
            'price'                 => (string)($row['price'] ?? ''),
            'rating'                => (float)$row['rating'],
            'badge'                 => (string)($row['badge'] ?? "Editor's Choice"),
            'image_url'             => (string)($row['image_url'] ?? ''),
            'description'           => (string)($row['description'] ?? ''),
            'pros'                  => $pros,
            'cons'                  => $cons,
            'button_text'           => (string)($row['button_text'] ?? 'Check Price on Amazon'),
            'secondary_url'         => (string)($row['secondary_url'] ?? ''),
            'secondary_button_text' => (string)($row['secondary_button_text'] ?? ''),
            'clicks_count'          => (int)$row['clicks_count'],
            'last_clicked_at'       => $row['last_clicked_at'],
            'is_active'             => (bool)$row['is_active'],
            'rel_tags'              => (string)($row['rel_tags'] ?? 'nofollow sponsored noopener'),
            'created_at'            => $row['created_at'],
            'updated_at'            => $row['updated_at'],
        ];
    }

    public static function overview(): void
    {
        $pdo = Database::getConnection();

        $statsRow = $pdo->query('
            SELECT
                COUNT(*) as totalLinks,
                COALESCE(SUM(CASE WHEN `is_active` = 1 THEN 1 ELSE 0 END), 0) as activeLinks,
                COALESCE(SUM(`clicks_count`), 0) as totalClicks
            FROM `affiliate_links`
        ')->fetch();

        $todayClicksRow = $pdo->query('
            SELECT COUNT(*) as count
            FROM `affiliate_clicks`
            WHERE `created_at` >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        ')->fetch();

        $merchantsRaw = $pdo->query('
            SELECT `merchant`, COUNT(*) as linksCount, COALESCE(SUM(`clicks_count`), 0) as clicks
            FROM `affiliate_links`
            GROUP BY `merchant`
            ORDER BY `clicks` DESC
        ')->fetchAll();

        $merchants = array_map(fn($m) => [
            'merchant'   => (string)$m['merchant'],
            'linksCount' => (int)$m['linksCount'],
            'clicks'     => (int)$m['clicks'],
        ], $merchantsRaw);

        $topProductsRaw = $pdo->query('
            SELECT `id`, `title`, `slug`, `merchant`, `category`, `price`, `rating`, `badge`, `image_url`, `clicks_count`, `last_clicked_at`
            FROM `affiliate_links`
            WHERE `is_active` = 1
            ORDER BY `clicks_count` DESC
            LIMIT 6
        ')->fetchAll();

        $topProducts = array_map(fn($p) => [
            'id'              => (string)$p['id'],
            'title'           => (string)$p['title'],
            'slug'            => (string)$p['slug'],
            'merchant'        => (string)$p['merchant'],
            'category'        => (string)$p['category'],
            'price'           => (string)$p['price'],
            'rating'          => (float)$p['rating'],
            'badge'           => (string)$p['badge'],
            'image_url'       => (string)$p['image_url'],
            'clicks_count'    => (int)$p['clicks_count'],
            'last_clicked_at' => $p['last_clicked_at'],
        ], $topProductsRaw);

        $recentClicks = $pdo->query('
            SELECT c.*, l.`title` as product_title
            FROM `affiliate_clicks` c
            LEFT JOIN `affiliate_links` l ON c.`link_id` = l.`id`
            ORDER BY c.`created_at` DESC
            LIMIT 15
        ')->fetchAll();

        Response::json([
            'success'      => true,
            'metrics'      => [
                'totalLinks'  => (int)($statsRow['totalLinks'] ?? 0),
                'activeLinks' => (int)($statsRow['activeLinks'] ?? 0),
                'totalClicks' => (int)($statsRow['totalClicks'] ?? 0),
                'clicksToday' => (int)($todayClicksRow['count'] ?? 0),
            ],
            'merchants'    => $merchants,
            'topProducts'  => $topProducts,
            'recentClicks' => $recentClicks,
        ]);
    }

    public static function links(): void
    {
        $q        = strtolower(trim((string)Request::query('q', '')));
        $merchant = trim((string)Request::query('merchant', 'all'));
        $category = trim((string)Request::query('category', 'all'));

        $where = [];
        $params = [];

        if ($q !== '') {
            $where[] = '(LOWER(`title`) LIKE ? OR LOWER(`slug`) LIKE ? OR LOWER(`description`) LIKE ?)';
            $term = '%' . $q . '%';
            $params = array_merge($params, [$term, $term, $term]);
        }
        if ($merchant !== '' && $merchant !== 'all') {
            $where[] = 'LOWER(`merchant`) = ?';
            $params[] = strtolower($merchant);
        }
        if ($category !== '' && $category !== 'all') {
            $where[] = 'LOWER(`category`) = ?';
            $params[] = strtolower($category);
        }

        $whereSql = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM `affiliate_links` {$whereSql} ORDER BY `clicks_count` DESC, `updated_at` DESC");
        $stmt->execute($params);

        $links = array_map([self::class, 'formatLink'], $stmt->fetchAll());
        Response::json(['success' => true, 'links' => $links, 'total' => count($links)]);
    }

    public static function showLink(array $params): void
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM `affiliate_links` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$params['id'] ?? '']);
        $link = $stmt->fetch();

        if (!$link) {
            Response::error('Affiliate link not found', 404);
        }

        Response::json(['success' => true, 'link' => self::formatLink($link)]);
    }

    public static function createLink(): void
    {
        Auth::requireAuth();
        $body = Request::body();
        $title = trim((string)($body['title'] ?? ''));
        $targetUrl = trim((string)($body['target_url'] ?? ''));

        if ($title === '' || $targetUrl === '') {
            Response::error('Title and target affiliate URL are required', 400);
        }

        $cleanSlug = trim((string)preg_replace('/[^a-z0-9]+/', '-', strtolower((string)($body['slug'] ?: $title))), '-');
        $pdo = Database::getConnection();

        $check = $pdo->prepare('SELECT `id` FROM `affiliate_links` WHERE `slug` = ? LIMIT 1');
        $check->execute([$cleanSlug]);
        if ($check->fetch()) {
            $cleanSlug .= '-' . substr((string)time(), -4);
        }

        $id   = 'aff-' . (int)round(microtime(true) * 1000);
        $pros = is_array($body['pros'] ?? null) ? $body['pros'] : [];
        $cons = is_array($body['cons'] ?? null) ? $body['cons'] : [];

        $pdo->prepare('
            INSERT INTO `affiliate_links` (
                `id`, `title`, `slug`, `target_url`, `merchant`, `category`, `price`, `rating`, `badge`,
                `image_url`, `description`, `pros_json`, `cons_json`, `button_text`, `secondary_url`,
                `secondary_button_text`, `is_active`, `rel_tags`, `created_at`, `updated_at`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ')->execute([
            $id,
            $title,
            $cleanSlug,
            $targetUrl,
            trim((string)($body['merchant'] ?? 'Amazon')),
            trim((string)($body['category'] ?? 'Gear')),
            trim((string)($body['price'] ?? '')),
            isset($body['rating']) ? (float)$body['rating'] : 4.9,
            trim((string)($body['badge'] ?? "Editor's Choice")),
            trim((string)($body['image_url'] ?? '')),
            trim((string)($body['description'] ?? '')),
            json_encode($pros, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            json_encode($cons, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            trim((string)($body['button_text'] ?? 'Check Price on Amazon')),
            trim((string)($body['secondary_url'] ?? '')),
            trim((string)($body['secondary_button_text'] ?? '')),
            (!array_key_exists('is_active', $body) || !empty($body['is_active'])) ? 1 : 0,
            'nofollow sponsored noopener',
        ]);

        $createdStmt = $pdo->prepare('SELECT * FROM `affiliate_links` WHERE `id` = ?');
        $createdStmt->execute([$id]);

        Response::json([
            'success' => true,
            'message' => 'Affiliate link created successfully',
            'link'    => self::formatLink($createdStmt->fetch()),
        ], 201);
    }

    public static function updateLink(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `affiliate_links` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            Response::error('Affiliate link not found', 404);
        }

        $body = Request::body();
        $prosJson = array_key_exists('pros', $body) ? json_encode($body['pros'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : $existing['pros_json'];
        $consJson = array_key_exists('cons', $body) ? json_encode($body['cons'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : $existing['cons_json'];
        $activeVal = array_key_exists('is_active', $body) ? (!empty($body['is_active']) ? 1 : 0) : (int)$existing['is_active'];

        $pdo->prepare('
            UPDATE `affiliate_links` SET
                `title` = ?,
                `slug` = ?,
                `target_url` = ?,
                `merchant` = ?,
                `category` = ?,
                `price` = ?,
                `rating` = ?,
                `badge` = ?,
                `image_url` = ?,
                `description` = ?,
                `pros_json` = ?,
                `cons_json` = ?,
                `button_text` = ?,
                `secondary_url` = ?,
                `secondary_button_text` = ?,
                `is_active` = ?,
                `updated_at` = CURRENT_TIMESTAMP
            WHERE `id` = ?
        ')->execute([
            trim((string)($body['title'] ?? $existing['title'])),
            strtolower(trim((string)($body['slug'] ?? $existing['slug']))),
            trim((string)($body['target_url'] ?? $existing['target_url'])),
            trim((string)($body['merchant'] ?? $existing['merchant'])),
            trim((string)($body['category'] ?? $existing['category'])),
            trim((string)($body['price'] ?? $existing['price'])),
            isset($body['rating']) ? (float)$body['rating'] : (float)$existing['rating'],
            trim((string)($body['badge'] ?? $existing['badge'])),
            trim((string)($body['image_url'] ?? $existing['image_url'])),
            trim((string)($body['description'] ?? $existing['description'])),
            $prosJson,
            $consJson,
            trim((string)($body['button_text'] ?? $existing['button_text'])),
            trim((string)($body['secondary_url'] ?? $existing['secondary_url'] ?? '')),
            trim((string)($body['secondary_button_text'] ?? $existing['secondary_button_text'] ?? '')),
            $activeVal,
            $id,
        ]);

        $updStmt = $pdo->prepare('SELECT * FROM `affiliate_links` WHERE `id` = ?');
        $updStmt->execute([$id]);

        Response::json([
            'success' => true,
            'message' => 'Affiliate link updated successfully',
            'link'    => self::formatLink($updStmt->fetch()),
        ]);
    }

    public static function deleteLink(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $check = $pdo->prepare('SELECT `id` FROM `affiliate_links` WHERE `id` = ? LIMIT 1');
        $check->execute([$id]);
        if (!$check->fetch()) {
            Response::error('Affiliate link not found', 404);
        }

        $pdo->prepare('DELETE FROM `affiliate_clicks` WHERE `link_id` = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM `affiliate_links` WHERE `id` = ?')->execute([$id]);
        Response::json(['success' => true, 'message' => 'Affiliate link deleted successfully']);
    }

    public static function clicks(): void
    {
        Auth::requireAuth();
        $clicks = Database::getConnection()->query('
            SELECT c.*, l.`title` as product_title, l.`merchant`
            FROM `affiliate_clicks` c
            LEFT JOIN `affiliate_links` l ON c.`link_id` = l.`id`
            ORDER BY c.`created_at` DESC
            LIMIT 50
        ')->fetchAll();

        Response::json(['success' => true, 'clicks' => $clicks, 'total' => count($clicks)]);
    }

    public static function generateBoxHtml(): void
    {
        $b = Request::body();
        $title      = htmlspecialchars((string)($b['title'] ?? 'Featured Product'), ENT_QUOTES, 'UTF-8');
        $slug       = htmlspecialchars((string)($b['slug'] ?? 'product'), ENT_QUOTES, 'UTF-8');
        $badge      = htmlspecialchars((string)($b['badge'] ?? "Editor's Choice"), ENT_QUOTES, 'UTF-8');
        $rating     = htmlspecialchars((string)($b['rating'] ?? 4.9), ENT_QUOTES, 'UTF-8');
        $price      = htmlspecialchars((string)($b['price'] ?? ''), ENT_QUOTES, 'UTF-8');
        $merchant   = htmlspecialchars((string)($b['merchant'] ?? 'Amazon'), ENT_QUOTES, 'UTF-8');
        $imageUrl   = htmlspecialchars((string)($b['imageUrl'] ?? ''), ENT_QUOTES, 'UTF-8');
        $desc       = htmlspecialchars((string)($b['description'] ?? ''), ENT_QUOTES, 'UTF-8');
        $pros       = is_array($b['pros'] ?? null) ? $b['pros'] : [];
        $cons       = is_array($b['cons'] ?? null) ? $b['cons'] : [];
        $btnText    = htmlspecialchars((string)($b['buttonText'] ?? ('Check Price on ' . ($b['merchant'] ?? 'Amazon'))), ENT_QUOTES, 'UTF-8');
        $secUrl     = htmlspecialchars((string)($b['secondaryUrl'] ?? ''), ENT_QUOTES, 'UTF-8');
        $secBtnText = htmlspecialchars((string)($b['secondaryButtonText'] ?? 'Official Website'), ENT_QUOTES, 'UTF-8');

        $cloakedUrl = "/go/{$slug}";

        $prosHtml = '';
        foreach ($pros as $p) {
            $safeP = htmlspecialchars((string)$p, ENT_QUOTES, 'UTF-8');
            $prosHtml .= '<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:13px;color:#2D2A26;"><span style="color:#10B981;font-weight:bold;line-height:1;">✓</span> <span>' . $safeP . '</span></li>';
        }
        $consHtml = '';
        foreach ($cons as $c) {
            $safeC = htmlspecialchars((string)$c, ENT_QUOTES, 'UTF-8');
            $consHtml .= '<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;font-size:13px;color:#2D2A26;"><span style="color:#EF4444;font-weight:bold;line-height:1;">✕</span> <span>' . $safeC . '</span></li>';
        }

        $badgeHtml = $badge !== '' ? '<span style="display:inline-flex;align-items:center;gap:6px;background:#FFF2EB;color:#E8734A;border:1px solid #FFCEBA;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">★ ' . $badge . '</span>' : '';
        $priceHtml = $price !== '' ? '<div style="margin-top:12px;font-family:serif;font-size:20px;font-weight:700;color:#1E1B18;">' . $price . ' <span style="font-size:11px;color:#8C8477;font-family:sans-serif;font-weight:normal;">(' . $merchant . ')</span></div>' : '';
        $imgBlock  = $imageUrl !== '' ? '<div style="text-align:center;"><img src="' . $imageUrl . '" alt="' . $title . '" style="max-height:220px;max-width:100%;object-fit:contain;border-radius:16px;margin:0 auto;display:block;" />' . $priceHtml . '</div>' : '';
        $descHtml  = $desc !== '' ? '<p style="font-size:14px;color:#5A5348;line-height:1.6;margin:0 0 16px 0;">' . $desc . '</p>' : '';

        $prosConsBlock = '';
        if (count($pros) > 0 || count($cons) > 0) {
            $prosSec = count($pros) > 0 ? '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#10B981;margin-bottom:8px;">Key Advantages</div><ul style="list-style:none;padding:0;margin:0;">' . $prosHtml . '</ul></div>' : '';
            $consSec = count($cons) > 0 ? '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#EF4444;margin-bottom:8px;">Considerations</div><ul style="list-style:none;padding:0;margin:0;">' . $consHtml . '</ul></div>' : '';
            $prosConsBlock = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:20px;padding:14px;background:#FAF8F5;border-radius:16px;border:1px solid #EDE7DF;">' . $prosSec . $consSec . '</div>';
        }

        $secLinkHtml = $secUrl !== '' ? '<a href="' . $secUrl . '" target="_blank" rel="nofollow sponsored noopener" style="display:inline-flex;align-items:center;gap:6px;background:#FAF8F5;color:#2D2A26;border:1px solid #E0DCD4;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:600;text-decoration:none;"><span>' . $secBtnText . '</span></a>' : '';

        $html = <<<HTML
<div class="affiliate-product-card" style="margin:36px 0;border-radius:24px;border:1px solid #EDE7DF;background:#FFFFFF;box-shadow:0 4px 20px -2px rgba(0,0,0,0.05);overflow:hidden;font-family:system-ui,-apple-system,sans-serif;">
  <div style="background:#FAF8F5;border-bottom:1px solid #F0ECE6;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    {$badgeHtml}
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:13px;font-weight:700;color:#1E1B18;">{$rating} / 5.0</span>
      <span style="color:#F59E0B;letter-spacing:1px;font-size:14px;">★★★★★</span>
    </div>
  </div>
  <div style="padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;align-items:center;">
    {$imgBlock}
    <div>
      <h3 style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#1E1B18;margin:0 0 10px 0;line-height:1.25;">{$title}</h3>
      {$descHtml}
      {$prosConsBlock}
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding-top:4px;">
        <a href="{$cloakedUrl}" target="_blank" rel="nofollow sponsored noopener" style="display:inline-flex;align-items:center;gap:8px;background:#E8734A;color:#FFFFFF;padding:12px 24px;border-radius:14px;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.04em;box-shadow:0 2px 8px rgba(232,115,74,0.3);transition:all 0.2s ease;">
          <span>{$btnText}</span>
          <span>&rarr;</span>
        </a>
        {$secLinkHtml}
      </div>
    </div>
  </div>
</div>
HTML;

        Response::json(['success' => true, 'html' => trim($html)]);
    }

    public static function getSettings(): void
    {
        $pdo = Database::getConnection();
        $get = function (string $key, ?string $default = null) use ($pdo): ?string {
            $s = $pdo->prepare('SELECT `value` FROM `site_settings` WHERE `key` = ? LIMIT 1');
            $s->execute([$key]);
            $row = $s->fetch();
            return $row ? (string)$row['value'] : $default;
        };

        Response::json([
            'success'  => true,
            'settings' => [
                'disclosure'   => $get('affiliate_ftc_disclosure', 'Affiliate Disclosure: Toufiq Motion is reader-supported. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.'),
                'position'     => $get('affiliate_disclosure_position', 'top'),
                'autoNofollow' => $get('affiliate_auto_nofollow', 'true') === 'true',
            ],
        ]);
    }

    public static function saveSettings(): void
    {
        Auth::requireAuth();
        $body = Request::body();
        $pdo  = Database::getConnection();

        $upsert = $pdo->prepare('
            INSERT INTO `site_settings` (`key`, `value`, `updated_at`)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = CURRENT_TIMESTAMP
        ');

        if (array_key_exists('disclosure', $body)) {
            $upsert->execute(['affiliate_ftc_disclosure', (string)$body['disclosure']]);
        }
        if (array_key_exists('position', $body)) {
            $upsert->execute(['affiliate_disclosure_position', (string)$body['position']]);
        }
        if (array_key_exists('autoNofollow', $body)) {
            $upsert->execute(['affiliate_auto_nofollow', !empty($body['autoNofollow']) ? 'true' : 'false']);
        }

        Response::json(['success' => true, 'message' => 'Affiliate & FTC settings updated successfully']);
    }
}

