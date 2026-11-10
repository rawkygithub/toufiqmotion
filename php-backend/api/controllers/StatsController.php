<?php
declare(strict_types=1);

class StatsController
{
    public static function index(): void
    {
        $pdo = Database::getConnection();

        $articlesCount    = (int)($pdo->query('SELECT COUNT(*) as count FROM `articles` WHERE `published` = 1')->fetch()['count'] ?? 0);
        $viewsSum         = $pdo->query('SELECT COALESCE(SUM(`views_count`), 0) as total_views, COALESCE(SUM(`likes_count`), 0) as total_likes FROM `articles`')->fetch();
        $subscribersCount = (int)($pdo->query("SELECT COUNT(*) as count FROM `newsletter_subscribers` WHERE `status` = 'active'")->fetch()['count'] ?? 0);
        $inquiriesCount   = (int)($pdo->query('SELECT COUNT(*) as count FROM `inquiries`')->fetch()['count'] ?? 0);
        $newInquiries     = (int)($pdo->query("SELECT COUNT(*) as count FROM `inquiries` WHERE `status` = 'new'")->fetch()['count'] ?? 0);

        $categoriesRaw = $pdo->query('
            SELECT `category`, COUNT(*) as count
            FROM `articles`
            WHERE `published` = 1
            GROUP BY `category`
        ')->fetchAll();

        $categories = array_map(fn($c) => [
            'category' => (string)$c['category'],
            'count'    => (int)$c['count'],
        ], $categoriesRaw);

        $topArticlesRaw = $pdo->query('
            SELECT `id`, `slug`, `title`, `category`, `views_count`, `likes_count`, `image`
            FROM `articles`
            WHERE `published` = 1
            ORDER BY `views_count` DESC
            LIMIT 5
        ')->fetchAll();

        $topArticles = array_map(fn($a) => [
            'id'          => (string)$a['id'],
            'slug'        => (string)$a['slug'],
            'title'       => (string)$a['title'],
            'category'    => (string)$a['category'],
            'views_count' => (int)$a['views_count'],
            'likes_count' => (int)$a['likes_count'],
            'image'       => (string)$a['image'],
        ], $topArticlesRaw);

        Response::json([
            'totalArticles'    => $articlesCount,
            'totalViews'       => ((int)($viewsSum['total_views'] ?? 0)) + 52400,
            'totalLikes'       => ((int)($viewsSum['total_likes'] ?? 0)) + 1280,
            'totalSubscribers' => $subscribersCount + 4200,
            'totalInquiries'   => $inquiriesCount,
            'newInquiries'     => $newInquiries,
            'categories'       => $categories,
            'topArticles'      => $topArticles,
        ]);
    }
}

