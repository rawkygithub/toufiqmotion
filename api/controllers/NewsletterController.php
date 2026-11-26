<?php
declare(strict_types=1);

class NewsletterController
{
    public static function subscribe(): void
    {
        $body   = Request::body();
        $email  = trim((string)($body['email'] ?? ''));
        $name   = trim((string)($body['name'] ?? ''));
        $source = (string)($body['source'] ?? 'footer');

        if ($email === '' || !str_contains($email, '@')) {
            Response::error('Valid email address is required', 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT `id`, `status` FROM `newsletter_subscribers` WHERE `email` = ? LIMIT 1');
        $stmt->execute([strtolower($email)]);
        $existing = $stmt->fetch();

        if ($existing) {
            if ($existing['status'] === 'unsubscribed') {
                $pdo->prepare('UPDATE `newsletter_subscribers` SET `status` = "active" WHERE `id` = ?')
                    ->execute([$existing['id']]);
                Response::json(['success' => true, 'message' => 'Welcome back! Your subscription is active again.']);
            }
            Response::json(['success' => true, 'message' => "You're already subscribed to Toufiq Motion updates!"]);
        }

        $id = 'sub-' . (int)round(microtime(true) * 1000);
        $pdo->prepare('
            INSERT INTO `newsletter_subscribers` (`id`, `email`, `name`, `source`)
            VALUES (?, ?, ?, ?)
        ')->execute([$id, strtolower($email), $name, $source]);

        Response::json([
            'success' => true,
            'message' => 'Welcome to the Toufiq Motion community! Check your inbox soon.',
        ], 201);
    }

    public static function index(): void
    {
        Auth::requireAuth();
        $pdo = Database::getConnection();
        $subscribers = $pdo->query('SELECT * FROM `newsletter_subscribers` ORDER BY `subscribed_at` DESC')->fetchAll();
        Response::json(['subscribers' => $subscribers, 'total' => count($subscribers)]);
    }

    public static function delete(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM `newsletter_subscribers` WHERE `id` = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Subscriber not found', 404);
        }
        Response::json(['success' => true, 'message' => 'Subscriber removed']);
    }
}

