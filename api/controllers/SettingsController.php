<?php
declare(strict_types=1);

class SettingsController
{
    public static function index(): void
    {
        $pdo = Database::getConnection();
        $rows = $pdo->query('SELECT `key`, `value` FROM `site_settings`')->fetchAll();
        $settings = [];

        foreach ($rows as $r) {
            $k = (string)$r['key'];
            $v = (string)$r['value'];

            if (str_ends_with($k, '_json')) {
                $decoded = json_decode($v, true);
                $settings[$k] = json_last_error() === JSON_ERROR_NONE ? $decoded : $v;
            } elseif ($v === 'true') {
                $settings[$k] = true;
            } elseif ($v === 'false') {
                $settings[$k] = false;
            } else {
                $settings[$k] = $v;
            }
        }

        // Dynamically bind authoritative primary administrator & author metadata
        try {
            $adminStmt = $pdo->query("SELECT `name`, `email`, `role`, `avatar` FROM `users` WHERE `role` = 'admin' ORDER BY `created_at` ASC LIMIT 1");
            $admin = $adminStmt ? $adminStmt->fetch() : null;
            if (!$admin) {
                $userStmt = $pdo->query("SELECT `name`, `email`, `role`, `avatar` FROM `users` ORDER BY `created_at` ASC LIMIT 1");
                $admin = $userStmt ? $userStmt->fetch() : null;
            }

            if ($admin) {
                $settings['admin_name'] = (string)$admin['name'];
                $settings['admin_email'] = (string)$admin['email'];
                $settings['admin_role'] = (string)$admin['role'];
                $settings['admin_avatar'] = !empty($admin['avatar']) ? (string)$admin['avatar'] : '';
            }
        } catch (Throwable $e) {
            // gracefully fallback if users table does not exist
        }

        if (!isset($settings['admin_role_title'])) {
            $settings['admin_role_title'] = 'Photographer & Lifestyle Writer';
        }

        Response::json([
            'settings' => count($settings) > 0 ? $settings : new stdClass(),
        ]);
    }

    public static function save(): void
    {
        Auth::requireAuth();
        $updates = Request::body();
        $pdo = Database::getConnection();

        $upsert = $pdo->prepare('
            INSERT INTO `site_settings` (`key`, `value`, `updated_at`)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = CURRENT_TIMESTAMP
        ');

        foreach ($updates as $k => $v) {
            if ($v === null) {
                continue;
            }
            if (is_bool($v)) {
                $upsert->execute([(string)$k, $v ? 'true' : 'false']);
            } elseif (is_array($v) || is_object($v)) {
                $upsert->execute([(string)$k, json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
            } else {
                $upsert->execute([(string)$k, (string)$v]);
            }
        }

        Response::json([
            'success' => true,
            'message' => 'Site appearance & customizer settings updated successfully',
        ]);
    }
}

