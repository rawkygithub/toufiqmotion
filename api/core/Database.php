<?php
declare(strict_types=1);

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            DB_HOST,
            DB_PORT,
            DB_NAME
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ];

        self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
        return self::$instance;
    }

    /**
     * Executes a prepared query binding ints/bools as PARAM_INT so native
     * MySQL prepares never fail on LIMIT ? OFFSET ?.
     */
    public static function execute(string $sql, array $params = []): PDOStatement
    {
        $stmt = self::getConnection()->prepare($sql);
        foreach (array_values($params) as $idx => $val) {
            $pos = $idx + 1;
            if (is_int($val)) {
                $stmt->bindValue($pos, $val, PDO::PARAM_INT);
            } elseif (is_bool($val)) {
                $stmt->bindValue($pos, $val ? 1 : 0, PDO::PARAM_INT);
            } elseif ($val === null) {
                $stmt->bindValue($pos, null, PDO::PARAM_NULL);
            } else {
                $stmt->bindValue($pos, (string)$val, PDO::PARAM_STR);
            }
        }
        $stmt->execute();
        return $stmt;
    }

    public static function baseUrl(): string
    {
        $isHttps = (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
            (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443)
        );
        $protocol = $isHttps ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $protocol . '://' . $host;
    }

    public static function canonicalDomain(): string
    {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->prepare("SELECT `value` FROM `seo_settings` WHERE `key` = 'canonical_domain' LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch();
            if ($row && !empty(trim((string)$row['value']))) {
                return rtrim(trim((string)$row['value']), '/');
            }
        } catch (Throwable $e) {
            // Fallback to runtime host
        }
        return self::baseUrl();
    }
}
