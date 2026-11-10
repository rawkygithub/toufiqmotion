<?php
declare(strict_types=1);

class Request
{
    private static ?array $cachedJsonBody = null;

    public static function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    public static function path(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $qPos = strpos($uri, '?');
        $path = $qPos === false ? $uri : substr($uri, 0, $qPos);
        $path = '/' . trim($path, '/');
        return $path === '' ? '/' : $path;
    }

    public static function apiPath(): string
    {
        $path = self::path();
        if (str_starts_with($path, '/api')) {
            $sub = substr($path, 4);
            return $sub === '' ? '/' : $sub;
        }
        return $path;
    }

    public static function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    public static function body(): array
    {
        if (self::$cachedJsonBody !== null) {
            return self::$cachedJsonBody;
        }

        $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $decoded = $raw ? json_decode($raw, true) : [];
            self::$cachedJsonBody = is_array($decoded) ? $decoded : [];
            return self::$cachedJsonBody;
        }

        if (!empty($_POST)) {
            self::$cachedJsonBody = $_POST;
            return self::$cachedJsonBody;
        }

        $raw = file_get_contents('php://input');
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                self::$cachedJsonBody = $decoded;
                return self::$cachedJsonBody;
            }
        }

        self::$cachedJsonBody = [];
        return self::$cachedJsonBody;
    }

    public static function header(string $name): ?string
    {
        $target = strtolower($name);
        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        if (!empty($_SERVER[$serverKey])) {
            return (string)$_SERVER[$serverKey];
        }

        if ($target === 'authorization') {
            if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                return (string)$_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }
        }

        if (function_exists('getallheaders')) {
            foreach (getallheaders() as $k => $v) {
                if (strtolower((string)$k) === $target) {
                    return (string)$v;
                }
            }
        } elseif (function_exists('apache_request_headers')) {
            foreach (apache_request_headers() as $k => $v) {
                if (strtolower((string)$k) === $target) {
                    return (string)$v;
                }
            }
        }

        return null;
    }

    public static function ip(): string
    {
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            return (string)$_SERVER['HTTP_CF_CONNECTING_IP'];
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $parts = explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($parts[0]);
        }
        return (string)($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
    }
}

