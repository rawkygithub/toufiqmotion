<?php
declare(strict_types=1);

class PostsController
{
    public static function formatArticle(?array $row): ?array
    {
        if (!$row) {
            return null;
        }

        $tags = json_decode((string)($row['tags_json'] ?? '[]'), true);
        $content = json_decode((string)($row['content_json'] ?? '[]'), true);

        return [
            'id'                  => (string)$row['id'],
            'slug'                => (string)$row['slug'],
            'title'               => (string)$row['title'],
            'excerpt'             => (string)$row['excerpt'],
            'category'            => (string)$row['category'],
            'subcategory'         => (string)$row['subcategory'],
            'date'                => (string)$row['date'],
            'readTime'            => (string)$row['read_time'],
            'image'               => (string)$row['image'],
            'featured'            => (bool)$row['featured'],
            'trendingRank'        => $row['trending_rank'] !== null ? (int)$row['trending_rank'] : null,
            'author'              => [
                'name'   => (string)$row['author_name'],
                'avatar' => (string)$row['author_avatar'],
                'role'   => (string)$row['author_role'],
            ],
            'quote'               => $row['quote'],
            'tags'                => is_array($tags) ? $tags : [],
            'content'             => is_array($content) ? $content : [],
            'htmlContent'         => $row['html_content'] ?: null,
            'focusKeyword'        => (string)($row['focus_keyword'] ?? ''),
            'metaTitle'           => (string)($row['meta_title'] ?: $row['title']),
            'metaDescription'     => (string)($row['meta_description'] ?: $row['excerpt']),
            'canonicalUrl'        => (string)($row['canonical_url'] ?? ''),
            'noIndex'             => (bool)$row['no_index'],
            'ogImage'             => (string)($row['og_image'] ?: $row['image']),
            'seoScore'            => $row['seo_score'] !== null ? (int)$row['seo_score'] : 85,
            'readabilityScore'    => $row['readability_score'] !== null ? (int)$row['readability_score'] : 90,
            'viewsCount'          => (int)$row['views_count'],
            'likesCount'          => (int)$row['likes_count'],
            'hasAffiliateLinks'   => (bool)($row['has_affiliate_links'] ?? 0),
            'affiliateDisclosure' => (string)($row['affiliate_disclosure_custom'] ?? ''),
            'published'           => (bool)$row['published'],
            'createdAt'           => $row['created_at'],
            'updatedAt'           => $row['updated_at'],
        ];
    }

    public static function index(): void
    {
        $category    = Request::query('category');
        $subcategory = Request::query('subcategory');
        $tag         = Request::query('tag');
        $q           = Request::query('q');
        $featured    = Request::query('featured');
        $sort        = Request::query('sort', 'latest');
        $pageNum     = max(1, (int)Request::query('page', 1));
        $limitNum    = max(1, min(100, (int)Request::query('limit', 50)));
        $offset      = ($pageNum - 1) * $limitNum;

        $sql = 'SELECT * FROM `articles` WHERE `published` = 1';
        $params = [];

        if ($category) {
            $sql .= ' AND `category` = ?';
            $params[] = $category;
        }
        if ($subcategory) {
            $sql .= ' AND `subcategory` = ?';
            $params[] = $subcategory;
        }
        if ($featured === '1' || $featured === 'true') {
            $sql .= ' AND `featured` = 1';
        }
        if ($q) {
            $sql .= ' AND (`title` LIKE ? OR `excerpt` LIKE ? OR `tags_json` LIKE ?)';
            $term = '%' . $q . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }
        if ($tag) {
            $sql .= ' AND `tags_json` LIKE ?';
            $params[] = '%"' . $tag . '"%';
        }

        if ($sort === 'popular') {
            $sql .= ' ORDER BY `views_count` DESC';
        } elseif ($sort === 'trending') {
            // Sort NULL trending ranks last (MySQL compatible)
            $sql .= ' ORDER BY (`trending_rank` IS NULL) ASC, `trending_rank` ASC, `likes_count` DESC';
        } else {
            $sql .= ' ORDER BY `created_at` DESC';
        }

        $sql .= ' LIMIT ? OFFSET ?';
        $params[] = $limitNum;
        $params[] = $offset;

        $pdo = Database::getConnection();
        $stmt = Database::execute($sql, $params);
        $rows = $stmt->fetchAll();

        $articles = array_map([self::class, 'formatArticle'], $rows);

        $countStmt = $pdo->query('SELECT COUNT(*) as total FROM `articles` WHERE `published` = 1');
        $total = (int)($countStmt->fetch()['total'] ?? 0);

        Response::json([
            'articles'   => $articles,
            'pagination' => [
                'total'      => $total,
                'page'       => $pageNum,
                'limit'      => $limitNum,
                'totalPages' => (int)ceil($total / $limitNum),
            ],
        ]);
    }

    public static function show(array $params): void
    {
        $slugOrId = $params['slugOrId'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `articles` WHERE `slug` = ? OR `id` = ? LIMIT 1');
        $stmt->execute([$slugOrId, $slugOrId]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Article not found', 404);
        }

        $pdo->prepare('UPDATE `articles` SET `views_count` = `views_count` + 1 WHERE `id` = ?')
            ->execute([$row['id']]);

        $commStmt = $pdo->prepare("SELECT * FROM `comments` WHERE `article_id` = ? AND `status` = 'approved' ORDER BY `created_at` DESC");
        $commStmt->execute([$row['id']]);
        $comments = $commStmt->fetchAll();

        $article = self::formatArticle($row);
        $article['viewsCount'] = ((int)$row['views_count']) + 1;

        Response::json([
            'article'  => $article,
            'comments' => $comments,
        ]);
    }

    public static function like(array $params): void
    {
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('UPDATE `articles` SET `likes_count` = `likes_count` + 1 WHERE `id` = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Article not found', 404);
        }

        $rowStmt = $pdo->prepare('SELECT `likes_count` FROM `articles` WHERE `id` = ?');
        $rowStmt->execute([$id]);
        $row = $rowStmt->fetch();

        Response::json(['likesCount' => (int)($row['likes_count'] ?? 0)]);
    }

    public static function create(): void
    {
        $user = Auth::requireAuth();
        $body = Request::body();

        $title       = $body['title'] ?? '';
        $excerpt     = $body['excerpt'] ?? '';
        $category    = $body['category'] ?? '';
        $subcategory = $body['subcategory'] ?? '';
        $image       = $body['image'] ?? '';

        if (!$title || !$category || !$subcategory || !$image) {
            Response::error('Title, category, subcategory, and image are required', 400);
        }

        $pdo = Database::getConnection();
        $id = 'post-' . (int)round(microtime(true) * 1000);
        $slug = SeoScoring::slugify((string)$title);

        $check = $pdo->prepare('SELECT `id` FROM `articles` WHERE `slug` = ? LIMIT 1');
        $check->execute([$slug]);
        if ($check->fetch()) {
            $slug .= '-' . random_int(100, 999);
        }

        $contentInput = $body['content'] ?? [];
        $contentArray = is_array($contentInput) ? $contentInput : [($contentInput ?: ($excerpt ?: $title))];
        $htmlContent  = $body['htmlContent'] ?? null;

        $plainText = $htmlContent ? strip_tags((string)$htmlContent) : implode(' ', array_map('strval', $contentArray));
        $words = preg_split('/\s+/', trim($plainText), -1, PREG_SPLIT_NO_EMPTY);
        $totalWords = is_array($words) ? count($words) : 0;
        $readTime = max(3, (int)ceil($totalWords / 180)) . ' min read';
        $date = date('M j, Y');

        $tags = is_array($body['tags'] ?? null) ? $body['tags'] : [];
        $featured = !empty($body['featured']) ? 1 : 0;
        $noIndex  = !empty($body['noIndex']) ? 1 : 0;
        $hasAff   = !empty($body['hasAffiliateLinks']) ? 1 : 0;

        $canonicalBase = Database::canonicalDomain();
        $canonicalUrl  = !empty($body['canonicalUrl']) ? (string)$body['canonicalUrl'] : "{$canonicalBase}/{$slug}";

        $stmt = $pdo->prepare('
            INSERT INTO `articles` (
                `id`, `slug`, `title`, `excerpt`, `category`, `subcategory`, `date`, `read_time`,
                `image`, `featured`, `author_name`, `author_avatar`, `author_role`,
                `quote`, `tags_json`, `content_json`, `html_content`,
                `focus_keyword`, `meta_title`, `meta_description`, `canonical_url`,
                `no_index`, `og_image`, `seo_score`, `readability_score`,
                `views_count`, `likes_count`, `published`, `has_affiliate_links`, `affiliate_disclosure_custom`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1, ?, ?)
        ');

        $stmt->execute([
            $id,
            $slug,
            $title,
            $excerpt ?: $title,
            $category,
            $subcategory,
            $date,
            $readTime,
            $image,
            $featured,
            ($user['email'] === 'admin@toufiqmotion.com') ? 'Toufiq Motion' : 'Editorial Team',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            'Founder & Travel Photographer',
            $body['quote'] ?? null,
            json_encode($tags, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            json_encode($contentArray, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $htmlContent ?: null,
            $body['focusKeyword'] ?? '',
            !empty($body['metaTitle']) ? $body['metaTitle'] : $title,
            !empty($body['metaDescription']) ? $body['metaDescription'] : ($excerpt ?: $title),
            $canonicalUrl,
            $noIndex,
            !empty($body['ogImage']) ? $body['ogImage'] : $image,
            isset($body['seoScore']) ? (int)$body['seoScore'] : 85,
            isset($body['readabilityScore']) ? (int)$body['readabilityScore'] : 90,
            $hasAff,
            $body['affiliateDisclosure'] ?? null,
        ]);

        $createdStmt = $pdo->prepare('SELECT * FROM `articles` WHERE `id` = ?');
        $createdStmt->execute([$id]);
        Response::json(['article' => self::formatArticle($createdStmt->fetch())], 201);
    }

    public static function update(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $body = Request::body();
        $pdo = Database::getConnection();

        $existStmt = $pdo->prepare('SELECT * FROM `articles` WHERE `id` = ? LIMIT 1');
        $existStmt->execute([$id]);
        $existing = $existStmt->fetch();

        if (!$existing) {
            Response::error('Article not found', 404);
        }

        $updatedTags = array_key_exists('tags', $body) && $body['tags'] !== null
            ? json_encode($body['tags'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            : $existing['tags_json'];

        $updatedContent = array_key_exists('content', $body) && $body['content'] !== null
            ? json_encode(is_array($body['content']) ? $body['content'] : [$body['content']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            : $existing['content_json'];

        $featuredVal = array_key_exists('featured', $body) ? (!empty($body['featured']) ? 1 : 0) : (int)$existing['featured'];
        $noIndexVal  = array_key_exists('noIndex', $body) ? (!empty($body['noIndex']) ? 1 : 0) : (int)$existing['no_index'];
        $hasAffVal   = array_key_exists('hasAffiliateLinks', $body) ? (!empty($body['hasAffiliateLinks']) ? 1 : 0) : (int)$existing['has_affiliate_links'];
        $affDiscVal  = array_key_exists('affiliateDisclosure', $body) ? $body['affiliateDisclosure'] : $existing['affiliate_disclosure_custom'];

        $stmt = $pdo->prepare('
            UPDATE `articles` SET
                `title` = COALESCE(?, `title`),
                `excerpt` = COALESCE(?, `excerpt`),
                `category` = COALESCE(?, `category`),
                `subcategory` = COALESCE(?, `subcategory`),
                `image` = COALESCE(?, `image`),
                `quote` = COALESCE(?, `quote`),
                `featured` = ?,
                `tags_json` = ?,
                `content_json` = ?,
                `html_content` = COALESCE(?, `html_content`),
                `focus_keyword` = COALESCE(?, `focus_keyword`),
                `meta_title` = COALESCE(?, `meta_title`),
                `meta_description` = COALESCE(?, `meta_description`),
                `canonical_url` = COALESCE(?, `canonical_url`),
                `no_index` = ?,
                `og_image` = COALESCE(?, `og_image`),
                `seo_score` = COALESCE(?, `seo_score`),
                `readability_score` = COALESCE(?, `readability_score`),
                `has_affiliate_links` = ?,
                `affiliate_disclosure_custom` = ?,
                `updated_at` = CURRENT_TIMESTAMP
            WHERE `id` = ?
        ');

        $stmt->execute([
            $body['title'] ?? null,
            $body['excerpt'] ?? null,
            $body['category'] ?? null,
            $body['subcategory'] ?? null,
            $body['image'] ?? null,
            $body['quote'] ?? null,
            $featuredVal,
            $updatedTags,
            $updatedContent,
            $body['htmlContent'] ?? null,
            $body['focusKeyword'] ?? null,
            $body['metaTitle'] ?? null,
            $body['metaDescription'] ?? null,
            $body['canonicalUrl'] ?? null,
            $noIndexVal,
            $body['ogImage'] ?? null,
            array_key_exists('seoScore', $body) && $body['seoScore'] !== null ? (int)$body['seoScore'] : null,
            array_key_exists('readabilityScore', $body) && $body['readabilityScore'] !== null ? (int)$body['readabilityScore'] : null,
            $hasAffVal,
            $affDiscVal,
            $id,
        ]);

        $updatedStmt = $pdo->prepare('SELECT * FROM `articles` WHERE `id` = ?');
        $updatedStmt->execute([$id]);
        Response::json(['article' => self::formatArticle($updatedStmt->fetch())]);
    }

    public static function delete(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('DELETE FROM `articles` WHERE `id` = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Article not found', 404);
        }

        Response::json(['success' => true, 'message' => 'Article deleted successfully']);
    }
}
