<?php
declare(strict_types=1);

/**
 * Hostinger Production Configuration
 * Edit these MySQL credentials in Hostinger hPanel -> Databases -> MySQL Databases,
 * OR create a `config.local.php` beside this file returning an override array.
 */

$localOverrides = [];
$localConfigFile = __DIR__ . '/config.local.php';
if (is_file($localConfigFile)) {
    $loaded = require $localConfigFile;
    if (is_array($loaded)) {
        $localOverrides = $loaded;
    }
}

$defaults = [
    'DB_HOST'         => getenv('DB_HOST') ?: 'localhost',
    'DB_PORT'         => getenv('DB_PORT') ?: '3306',
    'DB_NAME'         => getenv('DB_NAME') ?: 'toufiq_blog',
    'DB_USER'         => getenv('DB_USER') ?: 'root',
    'DB_PASS'         => getenv('DB_PASS') ?: '',
    'JWT_SECRET'      => getenv('JWT_SECRET') ?: 'toufiq_motion_super_secure_secret_2026',
    'JWT_TTL_SECONDS' => 30 * 86400, // 30 days
    'MAX_UPLOAD_SIZE' => 10 * 1024 * 1024, // 10 MB
    'MAX_WEBP_BYTES'  => 250 * 1024, // 250 KB
    'ROOT_DIR'        => dirname(__DIR__, 2),
    'UPLOADS_DIR'     => dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads',
    'APP_SHELL_HTML'  => dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'app-shell.html',
    'DEBUG'           => false,
];

$config = array_merge($defaults, $localOverrides);

foreach ($config as $key => $val) {
    if (!defined($key)) {
        define($key, $val);
    }
}

