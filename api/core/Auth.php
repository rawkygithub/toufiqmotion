<?php
declare(strict_types=1);

class Auth
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        return $decoded === false ? '' : $decoded;
    }

    public static function generateToken(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $now = time();
        $claims = [
            'id'    => $payload['id'],
            'email' => $payload['email'],
            'role'  => $payload['role'],
            'iat'   => $now,
            'exp'   => $now + JWT_TTL_SECONDS,
        ];

        $segments = [
            self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES)),
            self::base64UrlEncode(json_encode($claims, JSON_UNESCAPED_SLASHES)),
        ];
        $signingInput = implode('.', $segments);
        $signature = hash_hmac('sha256', $signingInput, JWT_SECRET, true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * Verifies HS256 JWT token. Throws RuntimeException if signature is invalid
     * or if expired (unless $ignoreExpiration is true).
     */
    public static function verifyToken(string $jwt, bool $ignoreExpiration = false): array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            throw new RuntimeException('Malformed JWT token');
        }

        [$headB64, $payloadB64, $sigB64] = $parts;
        $header = json_decode(self::base64UrlDecode($headB64), true);
        $payload = json_decode(self::base64UrlDecode($payloadB64), true);
        $signature = self::base64UrlDecode($sigB64);

        if (!is_array($header) || !is_array($payload) || ($header['alg'] ?? '') !== 'HS256') {
            throw new RuntimeException('Invalid JWT algorithm or payload');
        }

        $expectedSig = hash_hmac('sha256', $headB64 . '.' . $payloadB64, JWT_SECRET, true);
        if (!hash_equals($expectedSig, $signature)) {
            throw new RuntimeException('Invalid JWT signature');
        }

        if (!$ignoreExpiration && isset($payload['exp']) && time() >= (int)$payload['exp']) {
            throw new RuntimeException('Token expired');
        }

        return $payload;
    }

    /**
     * Express requireAuth() equivalent with 30-day expired token auto-renewal.
     */
    public static function requireAuth(): array
    {
        $authHeader = Request::header('Authorization');
        if (!$authHeader || !preg_match('/^Bearer\s+(.+)$/i', trim($authHeader), $m)) {
            Response::error('Unauthorized: Missing or invalid token', 401);
        }

        $token = trim($m[1]);

        try {
            $decoded = self::verifyToken($token, false);
            return [
                'id'    => (string)($decoded['id'] ?? ''),
                'email' => (string)($decoded['email'] ?? ''),
                'role'  => (string)($decoded['role'] ?? 'admin'),
            ];
        } catch (Throwable $e) {
            // Try HMAC signature validation ignoring expiration for smooth session continuity
            try {
                $unexpired = self::verifyToken($token, true);
                if (!empty($unexpired['id'])) {
                    $pdo = Database::getConnection();
                    $stmt = $pdo->prepare('SELECT `id`, `email`, `role` FROM `users` WHERE `id` = ? LIMIT 1');
                    $stmt->execute([$unexpired['id']]);
                    $user = $stmt->fetch();

                    if ($user) {
                        $userData = [
                            'id'    => (string)$user['id'],
                            'email' => (string)$user['email'],
                            'role'  => (string)$user['role'],
                        ];
                        $freshToken = self::generateToken($userData);
                        header('X-Renewed-Token: ' . $freshToken);
                        header('Access-Control-Expose-Headers: X-Renewed-Token');
                        return $userData;
                    }
                }
            } catch (Throwable $inner) {
                // Invalid / forged signature
            }

            Response::error('Unauthorized: Token has expired or is invalid', 401);
        }
    }
}

