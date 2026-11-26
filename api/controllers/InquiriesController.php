<?php
declare(strict_types=1);

class InquiriesController
{
    public static function create(): void
    {
        $body = Request::body();
        $type        = (string)($body['type'] ?? 'contact');
        $name        = trim((string)($body['name'] ?? ''));
        $email       = trim((string)($body['email'] ?? ''));
        $company     = isset($body['company']) ? trim((string)$body['company']) : null;
        $subject     = isset($body['subject']) ? trim((string)$body['subject']) : '';
        $projectType = isset($body['projectType']) ? (string)$body['projectType'] : null;
        $message     = trim((string)($body['message'] ?? ''));

        if ($name === '' || $email === '' || $message === '') {
            Response::error('Name, email, and message are required', 400);
        }

        $finalSubject = $subject !== ''
            ? $subject
            : ($type === 'partnership' ? $projectType : 'General Inquiry');

        $id = 'inq-' . (int)round(microtime(true) * 1000);
        $pdo = Database::getConnection();
        $pdo->prepare("
            INSERT INTO `inquiries` (`id`, `type`, `name`, `email`, `company`, `subject`, `project_type`, `message`, `status`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
        ")->execute([
            $id,
            $type,
            $name,
            strtolower($email),
            $company ?: null,
            $finalSubject,
            $projectType ?: null,
            $message,
        ]);

        Response::json([
            'success' => true,
            'message' => $type === 'partnership'
                ? "Thank you for reaching out! We'll review your collaboration inquiry and reply within 24 hours."
                : 'Message received! Thank you for getting in touch with Toufiq Motion.',
        ], 201);
    }

    public static function index(): void
    {
        Auth::requireAuth();
        $type   = Request::query('type');
        $status = Request::query('status');

        $sql = 'SELECT * FROM `inquiries` WHERE 1=1';
        $params = [];

        if ($type) {
            $sql .= ' AND `type` = ?';
            $params[] = $type;
        }
        if ($status) {
            $sql .= ' AND `status` = ?';
            $params[] = $status;
        }
        $sql .= ' ORDER BY `created_at` DESC';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $inquiries = $stmt->fetchAll();

        Response::json(['inquiries' => $inquiries, 'total' => count($inquiries)]);
    }

    public static function updateStatus(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $body = Request::body();
        $status = (string)($body['status'] ?? '');

        if (!in_array($status, ['new', 'in_review', 'resolved'], true)) {
            Response::error('Status must be new, in_review, or resolved', 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('UPDATE `inquiries` SET `status` = ? WHERE `id` = ?');
        $stmt->execute([$status, $id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Inquiry not found', 404);
        }

        Response::json(['success' => true, 'status' => $status]);
    }

    public static function delete(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('DELETE FROM `inquiries` WHERE `id` = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            Response::error('Inquiry not found', 404);
        }
        Response::json(['success' => true, 'message' => 'Inquiry deleted']);
    }
}

