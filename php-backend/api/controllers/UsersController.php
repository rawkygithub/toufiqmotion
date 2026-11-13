<?php
declare(strict_types=1);

class UsersController
{
    private static array $ALLOWED_ROLES = ['admin', 'editor', 'author', 'contributor'];

    /**
     * GET /api/users
     * Returns all registered users with their article count and safe metadata
     */
    public static function index(): void
    {
        Auth::requireAuth();
        $pdo = Database::getConnection();

        try {
            $stmt = $pdo->query('
                SELECT u.`id`, u.`name`, u.`email`, u.`role`, u.`avatar`, u.`created_at`,
                       (SELECT COUNT(*) FROM `articles` a WHERE a.`author_name` = u.`name`) as `articlesCount`
                FROM `users` u
                ORDER BY (u.`role` = "admin") DESC, u.`created_at` ASC
            ');
            $rows = $stmt->fetchAll();

            $users = array_map(function ($r) {
                return [
                    'id'            => (string)$r['id'],
                    'name'          => (string)$r['name'],
                    'email'         => (string)$r['email'],
                    'role'          => (string)($r['role'] ?: 'admin'),
                    'avatar'        => $r['avatar'] ?: null,
                    'created_at'    => (string)$r['created_at'],
                    'articlesCount' => (int)($r['articlesCount'] ?? 0),
                ];
            }, $rows);

            Response::json(['users' => $users]);
        } catch (Throwable $e) {
            Response::error('Failed to retrieve users: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /api/users/:id
     * Returns a single user by ID
     */
    public static function show(array $params): void
    {
        Auth::requireAuth();
        $id = trim($params['id'] ?? '');

        if ($id === '') {
            Response::error('User ID required', 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('
            SELECT u.`id`, u.`name`, u.`email`, u.`role`, u.`avatar`, u.`created_at`,
                   (SELECT COUNT(*) FROM `articles` a WHERE a.`author_name` = u.`name`) as `articlesCount`
            FROM `users` u
            WHERE u.`id` = ?
            LIMIT 1
        ');
        $stmt->execute([$id]);
        $r = $stmt->fetch();

        if (!$r) {
            Response::error('User not found', 404);
        }

        Response::json([
            'user' => [
                'id'            => (string)$r['id'],
                'name'          => (string)$r['name'],
                'email'         => (string)$r['email'],
                'role'          => (string)($r['role'] ?: 'admin'),
                'avatar'        => $r['avatar'] ?: null,
                'created_at'    => (string)$r['created_at'],
                'articlesCount' => (int)($r['articlesCount'] ?? 0),
            ]
        ]);
    }

    /**
     * POST /api/users
     * Create a new team member with assigned role and initial password
     */
    public static function create(): void
    {
        $authUser = Auth::requireAuth();
        $body = Request::body();

        $name = trim((string)($body['name'] ?? ''));
        $email = strtolower(trim((string)($body['email'] ?? '')));
        $password = (string)($body['password'] ?? '');
        $role = strtolower(trim((string)($body['role'] ?? 'author')));
        $avatar = trim((string)($body['avatar'] ?? ''));

        if ($name === '') {
            Response::error('User full name is required', 400);
        }

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required', 400);
        }

        if (mb_strlen($password, 'UTF-8') < 6) {
            Response::error('Password must be at least 6 characters long', 400);
        }

        if (!in_array($role, self::$ALLOWED_ROLES, true)) {
            $role = 'author';
        }

        $pdo = Database::getConnection();

        // Check email uniqueness
        $checkStmt = $pdo->prepare('SELECT `id` FROM `users` WHERE `email` = ? LIMIT 1');
        $checkStmt->execute([$email]);
        if ($checkStmt->fetch()) {
            Response::error('A user account with this email address already exists', 400);
        }

        $userId = 'usr-' . bin2hex(random_bytes(6));
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Fallback default avatar if none provided
        if ($avatar === '') {
            $avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
        }

        $insertStmt = $pdo->prepare('
            INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `avatar`, `created_at`)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ');
        $insertStmt->execute([$userId, $name, $email, $passwordHash, $role, $avatar]);

        Response::json([
            'success' => true,
            'message' => "User '{$name}' created successfully with role '{$role}'",
            'user'    => [
                'id'            => $userId,
                'name'          => $name,
                'email'         => $email,
                'role'          => $role,
                'avatar'        => $avatar,
                'created_at'    => gmdate('Y-m-d H:i:s'),
                'articlesCount' => 0,
            ],
        ], 201);
    }

    /**
     * PUT /api/users/:id
     * Update user name, email, role, or avatar
     */
    public static function update(array $params): void
    {
        $authUser = Auth::requireAuth();
        $id = trim($params['id'] ?? '');

        if ($id === '') {
            Response::error('User ID required', 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `users` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            Response::error('User not found', 404);
        }

        $body = Request::body();
        $name = isset($body['name']) ? trim((string)$body['name']) : (string)$existing['name'];
        $email = isset($body['email']) ? strtolower(trim((string)$body['email'])) : (string)$existing['email'];
        $role = isset($body['role']) ? strtolower(trim((string)$body['role'])) : (string)$existing['role'];
        $avatar = isset($body['avatar']) ? trim((string)$body['avatar']) : (string)$existing['avatar'];

        if ($name === '') {
            Response::error('Name cannot be empty', 400);
        }

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required', 400);
        }

        if (!in_array($role, self::$ALLOWED_ROLES, true)) {
            $role = (string)$existing['role'];
        }

        // Email uniqueness check (if email changed)
        if ($email !== strtolower((string)$existing['email'])) {
            $checkStmt = $pdo->prepare('SELECT `id` FROM `users` WHERE `email` = ? AND `id` != ? LIMIT 1');
            $checkStmt->execute([$email, $id]);
            if ($checkStmt->fetch()) {
                Response::error('Email is already in use by another user account', 400);
            }
        }

        // Guard: Prevent demoting the last remaining admin
        if ($existing['role'] === 'admin' && $role !== 'admin') {
            $adminCountStmt = $pdo->query("SELECT COUNT(*) as c FROM `users` WHERE `role` = 'admin'");
            $adminCount = (int)$adminCountStmt->fetch()['c'];
            if ($adminCount <= 1) {
                Response::error('Cannot change role: this is the only remaining Administrator account on the blog', 400);
            }
        }

        $updStmt = $pdo->prepare('
            UPDATE `users`
            SET `name` = ?, `email` = ?, `role` = ?, `avatar` = ?
            WHERE `id` = ?
        ');
        $updStmt->execute([$name, $email, $role, $avatar, $id]);

        Response::json([
            'success' => true,
            'message' => "User '{$name}' updated successfully",
            'user'    => [
                'id'            => $id,
                'name'          => $name,
                'email'         => $email,
                'role'          => $role,
                'avatar'        => $avatar,
                'created_at'    => (string)$existing['created_at'],
            ],
        ]);
    }

    /**
     * PUT /api/users/:id/password
     * Change or reset password for user
     */
    public static function changePassword(array $params): void
    {
        Auth::requireAuth();
        $id = trim($params['id'] ?? '');

        if ($id === '') {
            Response::error('User ID required', 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT `id`, `name`, `email` FROM `users` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User not found', 404);
        }

        $body = Request::body();
        $newPassword = (string)($body['password'] ?? '');

        if (mb_strlen($newPassword, 'UTF-8') < 6) {
            Response::error('New password must be at least 6 characters long', 400);
        }

        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        $updStmt = $pdo->prepare('UPDATE `users` SET `password_hash` = ? WHERE `id` = ?');
        $updStmt->execute([$passwordHash, $id]);

        Response::json([
            'success' => true,
            'message' => "Password for user '{$user['name']}' has been updated successfully",
        ]);
    }

    /**
     * DELETE /api/users/:id
     * Delete user account with protective guards
     */
    public static function delete(array $params): void
    {
        $authUser = Auth::requireAuth();
        $id = trim($params['id'] ?? '');

        if ($id === '') {
            Response::error('User ID required', 400);
        }

        // Guard 1: Prevent deleting self
        if ($authUser['id'] === $id) {
            Response::error('You cannot delete your own active administrator account', 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT `id`, `name`, `role` FROM `users` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $target = $stmt->fetch();

        if (!$target) {
            Response::error('User not found', 404);
        }

        // Guard 2: Prevent deleting the last remaining admin
        if ($target['role'] === 'admin') {
            $adminCountStmt = $pdo->query("SELECT COUNT(*) as c FROM `users` WHERE `role` = 'admin'");
            $adminCount = (int)$adminCountStmt->fetch()['c'];
            if ($adminCount <= 1) {
                Response::error('Cannot delete the last remaining Administrator account on the blog', 400);
            }
        }

        $delStmt = $pdo->prepare('DELETE FROM `users` WHERE `id` = ?');
        $delStmt->execute([$id]);

        Response::json([
            'success' => true,
            'message' => "User '{$target['name']}' has been removed successfully",
        ]);
    }
}
