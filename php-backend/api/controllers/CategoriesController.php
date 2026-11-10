<?php
declare(strict_types=1);

class CategoriesController
{
    public static function index(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query('
            SELECT c.*, COUNT(a.`id`) as article_count
            FROM `categories` c
            LEFT JOIN `articles` a ON a.`category` = c.`name` AND a.`published` = 1
            GROUP BY c.`id`
            ORDER BY c.`created_at` ASC
        ');

        $formatted = [];
        foreach ($stmt->fetchAll() as $cat) {
            $subs = json_decode((string)($cat['subcategories_json'] ?? '[]'), true);
            $formatted[] = [
                'id'            => (string)$cat['id'],
                'name'          => (string)$cat['name'],
                'slug'          => (string)$cat['slug'],
                'description'   => $cat['description'],
                'icon'          => (string)($cat['icon'] ?: 'Compass'),
                'image'         => $cat['image'],
                'subcategories' => is_array($subs) ? $subs : [],
                'articleCount'  => (int)$cat['article_count'],
                'createdAt'     => $cat['created_at'],
            ];
        }

        Response::json(['categories' => $formatted, 'total' => count($formatted)]);
    }

    public static function create(): void
    {
        Auth::requireAuth();
        $body = Request::body();
        $name = trim((string)($body['name'] ?? ''));

        if ($name === '') {
            Response::error('Category name is required', 400);
        }

        $slug = SeoScoring::slugify($name);
        $pdo = Database::getConnection();

        $check = $pdo->prepare('SELECT `id` FROM `categories` WHERE `name` = ? OR `slug` = ? LIMIT 1');
        $check->execute([$name, $slug]);
        if ($check->fetch()) {
            Response::error('A category with this name already exists', 400);
        }

        $id = 'cat-' . (int)round(microtime(true) * 1000);
        $subsRaw = $body['subcategories'] ?? [];
        $subsArr = is_array($subsRaw)
            ? $subsRaw
            : array_values(array_filter(array_map('trim', explode(',', (string)$subsRaw))));

        $image = !empty($body['image'])
            ? (string)$body['image']
            : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';

        $stmt = $pdo->prepare('
            INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `image`, `subcategories_json`)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $id,
            $name,
            $slug,
            isset($body['description']) && trim((string)$body['description']) !== '' ? trim((string)$body['description']) : null,
            $body['icon'] ?? 'Compass',
            $image,
            json_encode($subsArr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $createdStmt = $pdo->prepare('SELECT * FROM `categories` WHERE `id` = ?');
        $createdStmt->execute([$id]);
        $created = $createdStmt->fetch();
        $created['subcategories'] = $subsArr;
        $created['articleCount'] = 0;

        Response::json(['category' => $created], 201);
    }

    public static function update(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $body = Request::body();
        $pdo = Database::getConnection();

        $existStmt = $pdo->prepare('SELECT * FROM `categories` WHERE `id` = ? LIMIT 1');
        $existStmt->execute([$id]);
        $existing = $existStmt->fetch();
        if (!$existing) {
            Response::error('Category not found', 404);
        }

        $newName = !empty($body['name']) ? trim((string)$body['name']) : (string)$existing['name'];
        $newSlug = !empty($body['name']) ? SeoScoring::slugify($newName) : (string)$existing['slug'];

        if (array_key_exists('subcategories', $body)) {
            $rawSubs = $body['subcategories'];
            $arr = is_array($rawSubs)
                ? $rawSubs
                : array_values(array_filter(array_map('trim', explode(',', (string)$rawSubs))));
            $subcatsJson = json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            $subcatsJson = $existing['subcategories_json'];
        }

        if ($newName !== $existing['name']) {
            $pdo->prepare('UPDATE `articles` SET `category` = ? WHERE `category` = ?')
                ->execute([$newName, $existing['name']]);
        }

        $pdo->prepare('
            UPDATE `categories` SET
                `name` = ?,
                `slug` = ?,
                `description` = COALESCE(?, `description`),
                `icon` = COALESCE(?, `icon`),
                `image` = COALESCE(?, `image`),
                `subcategories_json` = ?
            WHERE `id` = ?
        ')->execute([
            $newName,
            $newSlug,
            $body['description'] ?? null,
            $body['icon'] ?? null,
            $body['image'] ?? null,
            $subcatsJson,
            $id,
        ]);

        $updStmt = $pdo->prepare('SELECT * FROM `categories` WHERE `id` = ?');
        $updStmt->execute([$id]);
        $updated = $updStmt->fetch();
        $updated['subcategories'] = json_decode((string)($updated['subcategories_json'] ?? '[]'), true) ?: [];

        Response::json(['category' => $updated]);
    }

    public static function delete(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $existStmt = $pdo->prepare('SELECT * FROM `categories` WHERE `id` = ? LIMIT 1');
        $existStmt->execute([$id]);
        $existing = $existStmt->fetch();
        if (!$existing) {
            Response::error('Category not found', 404);
        }

        $cntStmt = $pdo->prepare('SELECT COUNT(*) as count FROM `articles` WHERE `category` = ?');
        $cntStmt->execute([$existing['name']]);
        $linked = (int)($cntStmt->fetch()['count'] ?? 0);

        if ($linked > 0) {
            Response::error("Cannot delete category \"{$existing['name']}\" because it contains {$linked} articles. Please reassign or delete those articles first.", 400);
        }

        $pdo->prepare('DELETE FROM `categories` WHERE `id` = ?')->execute([$id]);
        Response::json(['success' => true, 'message' => "Category \"{$existing['name']}\" deleted successfully"]);
    }
}

