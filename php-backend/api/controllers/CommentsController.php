<?php
declare(strict_types=1);

class CommentsController
{
    public static function index(): void
    {
        Auth::requireAuth();
        $pdo = Database::getConnection();
        $stmt = $pdo->query('
            SELECT c.*, a.`title` as article_title, a.`slug` as article_slug
            FROM `comments` c
            JOIN `articles` a ON c.`article_id` = a.`id`
            ORDER BY c.`created_at` DESC
        ');
        Response::json(['comments' => $stmt->fetchAll()]);
    }

    public static function createForArticle(array $params): void
    {
        $articleId = $params['articleId'] ?? '';
        $body = Request::body();
        $authorName = trim((string)($body['authorName'] ?? ''));
        $authorEmail = isset($body['authorEmail']) ? trim((string)$body['authorEmail']) : null;
        $content = trim((string)($body['content'] ?? ''));

        if ($authorName === '' || $content === '') {
            Response::error('Name and comment message are required', 400);
        }

        $pdo = Database::getConnection();
        $check = $pdo->prepare('SELECT `id` FROM `articles` WHERE `id` = ? LIMIT 1');
        $check->execute([$articleId]);
        if (!$check->fetch()) {
            Response::error('Article not found', 404);
        }

        $id = 'comm-' . (int)round(microtime(true) * 1000);
        $pdo->prepare("
            INSERT INTO `comments` (`id`, `article_id`, `author_name`, `author_email`, `content`, `status`)
            VALUES (?, ?, ?, ?, ?, 'approved')
        ")->execute([$id, $articleId, $authorName, $authorEmail ?: null, $content]);

        $stmt = $pdo->prepare('SELECT * FROM `comments` WHERE `id` = ?');
        $stmt->execute([$id]);
        Response::json(['comment' => $stmt->fetch()], 201);
    }

    public static function delete(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('DELETE FROM `comments` WHERE `id` = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            Response::error('Comment not found', 404);
        }
        Response::json(['success' => true, 'message' => 'Comment deleted']);
    }
}

