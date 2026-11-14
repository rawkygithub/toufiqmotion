<?php
declare(strict_types=1);

class AuthController
{
    public static function login(): void
    {
        $body = Request::body();
        $email = trim((string)($body['email'] ?? ''));
        $password = (string)($body['password'] ?? '');

        if ($email === '' || $password === '') {
            Response::error('Email and password are required', 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `users` WHERE `email` = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, (string)$user['password_hash'])) {
            Response::error('Invalid email or password', 401);
        }

        $token = Auth::generateToken([
            'id'    => (string)$user['id'],
            'email' => (string)$user['email'],
            'role'  => (string)$user['role'],
        ]);

        Response::json([
            'token' => $token,
            'user'  => [
                'id'     => (string)$user['id'],
                'name'   => (string)$user['name'],
                'email'  => (string)$user['email'],
                'role'   => (string)$user['role'],
                'avatar' => $user['avatar'],
            ],
        ]);
    }

    public static function me(): void
    {
        $authUser = Auth::requireAuth();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT `id`, `name`, `email`, `role`, `avatar` FROM `users` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$authUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User not found', 404);
        }

        Response::json(['user' => $user]);
    }

    public static function refresh(): void
    {
        $authHeader = Request::header('Authorization');
        if (!$authHeader || !preg_match('/^Bearer\s+(.+)$/i', trim($authHeader), $m)) {
            Response::error('Missing token', 401);
        }
        $token = trim($m[1]);

        try {
            $decoded = Auth::verifyToken($token, true);
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare('SELECT `id`, `name`, `email`, `role`, `avatar` FROM `users` WHERE `id` = ? LIMIT 1');
            $stmt->execute([(string)($decoded['id'] ?? '')]);
            $user = $stmt->fetch();

            if (!$user) {
                Response::error('User not found', 401);
            }

            $freshToken = Auth::generateToken([
                'id'    => (string)$user['id'],
                'email' => (string)$user['email'],
                'role'  => (string)$user['role'],
            ]);

            Response::json(['token' => $freshToken, 'user' => $user]);
        } catch (Throwable $e) {
            Response::error('Invalid token', 401);
        }
    }
}

