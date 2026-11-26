<?php
declare(strict_types=1);

class MediaController
{
    private const ALLOWED_EXT = ['jpeg', 'jpg', 'png', 'webp', 'svg', 'gif'];

    public static function formatMedia(?array $row): ?array
    {
        if (!$row) {
            return null;
        }
        return [
            'id'            => (string)$row['id'],
            'filename'      => (string)$row['filename'],
            'original_name' => (string)$row['original_name'],
            'url'           => (string)$row['url'],
            'mimetype'      => (string)$row['mimetype'],
            'size'          => (int)$row['size'],
            'width'         => $row['width'] !== null ? (int)$row['width'] : null,
            'height'        => $row['height'] !== null ? (int)$row['height'] : null,
            'alt_text'      => (string)($row['alt_text'] ?? ''),
            'title'         => (string)($row['title'] ?? ''),
            'caption'       => (string)($row['caption'] ?? ''),
            'is_optimized'  => (int)$row['is_optimized'],
            'original_size' => $row['original_size'] !== null ? (int)$row['original_size'] : null,
            'created_at'    => $row['created_at'],
            'updated_at'    => $row['updated_at'],
        ];
    }

    private static function ensureUploadsDir(): void
    {
        if (!is_dir(UPLOADS_DIR)) {
            @mkdir(UPLOADS_DIR, 0755, true);
        }
    }

    /**
     * Normalizes single or multi-file $_FILES structures (supports 'files', 'files[]', 'file', 'image').
     */
    private static function collectUploadedFiles(array $keys = ['files', 'file', 'image']): array
    {
        $collected = [];
        foreach ($keys as $key) {
            if (!isset($_FILES[$key])) {
                continue;
            }
            $entry = $_FILES[$key];
            if (is_array($entry['name'])) {
                $count = count($entry['name']);
                for ($i = 0; $i < $count; $i++) {
                    if (($entry['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                        continue;
                    }
                    $collected[] = [
                        'name'     => (string)$entry['name'][$i],
                        'type'     => (string)$entry['type'][$i],
                        'tmp_name' => (string)$entry['tmp_name'][$i],
                        'error'    => (int)$entry['error'][$i],
                        'size'     => (int)$entry['size'][$i],
                    ];
                }
            } elseif (($entry['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $collected[] = [
                    'name'     => (string)$entry['name'],
                    'type'     => (string)$entry['type'],
                    'tmp_name' => (string)$entry['tmp_name'],
                    'error'    => (int)$entry['error'],
                    'size'     => (int)$entry['size'],
                ];
            }
        }
        return $collected;
    }

    public static function index(): void
    {
        $page   = max(1, (int)Request::query('page', 1));
        $limit  = min(100, max(1, (int)Request::query('limit', 60)));
        $offset = ($page - 1) * $limit;
        $q      = strtolower(trim((string)Request::query('q', '')));
        $filter = strtolower((string)Request::query('filter', 'all'));
        $sort   = strtolower((string)Request::query('sort', 'newest'));

        $where = [];
        $params = [];

        if ($q !== '') {
            $where[] = '(LOWER(`filename`) LIKE ? OR LOWER(`original_name`) LIKE ? OR LOWER(`title`) LIKE ? OR LOWER(`alt_text`) LIKE ?)';
            $term = '%' . $q . '%';
            $params = array_merge($params, [$term, $term, $term, $term]);
        }

        if ($filter === 'webp') {
            $where[] = "(`mimetype` = 'image/webp' OR `filename` LIKE '%.webp')";
        } elseif ($filter === 'unoptimized') {
            $where[] = '(`is_optimized` = 0 OR `size` > 256000)';
        } elseif ($filter === 'optimized') {
            $where[] = '(`is_optimized` = 1 AND `size` <= 256000)';
        }

        $whereSql = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

        $orderBySql = match ($sort) {
            'oldest'   => 'ORDER BY `created_at` ASC',
            'largest'  => 'ORDER BY `size` DESC',
            'smallest' => 'ORDER BY `size` ASC',
            default    => 'ORDER BY `created_at` DESC',
        };

        $pdo = Database::getConnection();
        $stmt = Database::execute("SELECT * FROM `media` {$whereSql} {$orderBySql} LIMIT ? OFFSET ?", array_merge($params, [$limit, $offset]));
        $items = array_map([self::class, 'formatMedia'], $stmt->fetchAll());

        $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM `media` {$whereSql}");
        $countStmt->execute($params);
        $total = (int)($countStmt->fetch()['total'] ?? 0);

        $statsRow = $pdo->query('
            SELECT
                COUNT(*) as totalItems,
                COALESCE(SUM(`size`), 0) as totalStorageBytes,
                COALESCE(SUM(CASE WHEN `is_optimized` = 1 AND `size` <= 256000 THEN 1 ELSE 0 END), 0) as optimizedCount,
                COALESCE(SUM(CASE WHEN `is_optimized` = 0 OR `size` > 256000 THEN 1 ELSE 0 END), 0) as unoptimizedCount
            FROM `media`
        ')->fetch();

        Response::json([
            'success' => true,
            'media'   => $items,
            'total'   => $total,
            'page'    => $page,
            'limit'   => $limit,
            'stats'   => [
                'totalItems'        => (int)($statsRow['totalItems'] ?? 0),
                'totalStorageBytes' => (int)($statsRow['totalStorageBytes'] ?? 0),
                'optimizedCount'    => (int)($statsRow['optimizedCount'] ?? 0),
                'unoptimizedCount'  => (int)($statsRow['unoptimizedCount'] ?? 0),
            ],
        ]);
    }

    public static function upload(): void
    {
        Auth::requireAuth();
        self::ensureUploadsDir();

        $files = self::collectUploadedFiles(['files', 'file', 'image']);
        if (count($files) === 0) {
            Response::error('No files provided for upload', 400);
        }

        $autoOptimize = (Request::query('autoOptimize') === 'true' || ($_POST['autoOptimize'] ?? '') === 'true');
        $pdo = Database::getConnection();
        $uploadedItems = [];

        $insertStmt = $pdo->prepare('
            INSERT INTO `media` (`id`, `filename`, `original_name`, `url`, `mimetype`, `size`, `width`, `height`, `alt_text`, `title`, `is_optimized`, `original_size`, `created_at`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ');

        foreach ($files as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::error('Upload failed with PHP error code: ' . $file['error'], 400);
            }
            if ($file['size'] > MAX_UPLOAD_SIZE) {
                Response::error('File exceeds 10MB upload limit', 400);
            }

            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, self::ALLOWED_EXT, true)) {
                Response::error('Only image files (jpeg, jpg, png, webp, svg, gif) are supported', 400);
            }

            $binary = file_get_contents($file['tmp_name']);
            if ($binary === false) {
                Response::error('Could not read uploaded file', 500);
            }

            $ms = (int)round(microtime(true) * 1000);
            $rand = random_int(100000000, 999999999);
            $mediaId = 'med-' . $ms . '-' . substr(bin2hex(random_bytes(3)), 0, 6);

            $finalFilename = "blog-{$ms}-{$rand}.{$ext}";
            $finalPath     = UPLOADS_DIR . DIRECTORY_SEPARATOR . $finalFilename;
            $finalSize     = $file['size'];
            $dims          = ImageOptimizer::getDimensionsFromString($binary);
            $finalMime     = $dims['mime'] ?: ($file['type'] ?: 'image/' . $ext);
            $width         = $dims['width'];
            $height        = $dims['height'];
            $isOptimized   = 0;
            $originalSize  = $file['size'];

            $canOptimize = in_array($ext, ['jpeg', 'jpg', 'png', 'webp'], true);

            if ($autoOptimize && $canOptimize && ($file['size'] > MAX_WEBP_BYTES || $finalMime !== 'image/webp')) {
                try {
                    $res = ImageOptimizer::optimizeBufferToWebP($binary, MAX_WEBP_BYTES);
                    $finalFilename = "blog-{$ms}-{$rand}-opt.webp";
                    $finalPath     = UPLOADS_DIR . DIRECTORY_SEPARATOR . $finalFilename;
                    file_put_contents($finalPath, $res['buffer']);
                    $finalSize   = $res['optimizedSize'];
                    $finalMime   = 'image/webp';
                    $width       = $res['width'];
                    $height      = $res['height'];
                    $isOptimized = 1;
                } catch (Throwable $optErr) {
                    file_put_contents($finalPath, $binary);
                }
            } else {
                file_put_contents($finalPath, $binary);
            }

            $fileUrl      = '/uploads/' . $finalFilename;
            $baseTitle    = (string)preg_replace('/\.[^.]+$/', '', $file['name']);
            $defaultTitle = str_replace(['-', '_'], ' ', $baseTitle);

            $insertStmt->execute([
                $mediaId,
                $finalFilename,
                $file['name'],
                $fileUrl,
                $finalMime,
                $finalSize,
                $width,
                $height,
                $defaultTitle,
                $defaultTitle,
                $isOptimized,
                $originalSize,
            ]);

            $savedStmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = ?');
            $savedStmt->execute([$mediaId]);
            $uploadedItems[] = self::formatMedia($savedStmt->fetch());
        }

        Response::json([
            'success'  => true,
            'count'    => count($uploadedItems),
            'media'    => $uploadedItems,
            'url'      => $uploadedItems[0]['url'] ?? null,
            'filename' => $uploadedItems[0]['filename'] ?? null,
        ]);
    }

    public static function optimizeItem(array $params): void
    {
        Auth::requireAuth();
        self::ensureUploadsDir();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        if (!$item) {
            Response::error('Media item not found', 404);
        }

        $isLocal = str_starts_with((string)$item['url'], '/uploads/');
        if ($isLocal) {
            $safeName = basename((string)$item['filename']);
            $filePath = UPLOADS_DIR . DIRECTORY_SEPARATOR . $safeName;
            if (!is_file($filePath)) {
                Response::error('Underlying image file does not exist on disk', 404);
            }
            $inputBinary = (string)file_get_contents($filePath);
        } else {
            $inputBinary = ImageOptimizer::fetchRemoteImage((string)$item['url']);
        }

        $originalSize = (int)($item['size'] ?: strlen($inputBinary));
        $result = ImageOptimizer::optimizeBufferToWebP($inputBinary, MAX_WEBP_BYTES);

        $baseName = (string)preg_replace('/\.[^.]+$/', '', (string)$item['filename']);
        $baseName = (string)preg_replace('/[^a-zA-Z0-9_-]/', '-', $baseName);
        $webpFilename = $baseName . '-' . (int)round(microtime(true) * 1000) . '.webp';
        $webpPath = UPLOADS_DIR . DIRECTORY_SEPARATOR . $webpFilename;

        file_put_contents($webpPath, $result['buffer']);

        if ($isLocal) {
            $oldPath = UPLOADS_DIR . DIRECTORY_SEPARATOR . basename((string)$item['filename']);
            if (is_file($oldPath) && $oldPath !== $webpPath) {
                @unlink($oldPath);
            }
        }

        $newUrl = '/uploads/' . $webpFilename;
        $pdo->prepare("
            UPDATE `media`
            SET `filename` = ?,
                `url` = ?,
                `mimetype` = 'image/webp',
                `size` = ?,
                `original_size` = ?,
                `width` = ?,
                `height` = ?,
                `is_optimized` = 1,
                `updated_at` = CURRENT_TIMESTAMP
            WHERE `id` = ?
        ")->execute([
            $webpFilename,
            $newUrl,
            $result['optimizedSize'],
            $originalSize,
            $result['width'],
            $result['height'],
            $id,
        ]);

        $updStmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = ?');
        $updStmt->execute([$id]);
        $updatedItem = self::formatMedia($updStmt->fetch());

        $kb = number_format($result['optimizedSize'] / 1024, 1);

        Response::json([
            'success' => true,
            'message' => "Image successfully optimized to WebP ({$kb} KB - under 250 KB limit)",
            'item'    => $updatedItem,
            'report'  => [
                'originalSize'   => $originalSize,
                'optimizedSize'  => $result['optimizedSize'],
                'savingsBytes'   => $result['savingsBytes'],
                'savingsPercent' => $result['savingsPercent'],
                'width'          => $result['width'],
                'height'         => $result['height'],
                'format'         => 'webp',
                'qualityUsed'    => $result['qualityUsed'],
            ],
        ]);
    }

    public static function optimizeTool(): void
    {
        self::ensureUploadsDir();
        $files = self::collectUploadedFiles(['image', 'file', 'files']);
        $imageUrl = trim((string)($_POST['imageUrl'] ?? (Request::body()['imageUrl'] ?? '')));

        if (count($files) > 0) {
            $f = $files[0];
            if ($f['error'] !== UPLOAD_ERR_OK) {
                Response::error('Failed to upload image file', 400);
            }
            $inputBinary  = (string)file_get_contents($f['tmp_name']);
            $originalName = $f['name'];
            $originalSize = $f['size'];
        } elseif ($imageUrl !== '') {
            $inputBinary  = ImageOptimizer::fetchRemoteImage($imageUrl);
            $originalSize = strlen($inputBinary);
            $parsedPath   = (string)(parse_url($imageUrl, PHP_URL_PATH) ?? '');
            $originalName = basename($parsedPath) ?: 'remote-image';
        } else {
            Response::error('Please upload an image file or provide an imageUrl', 400);
        }

        $result = ImageOptimizer::optimizeBufferToWebP($inputBinary, MAX_WEBP_BYTES);

        $cleanBase = (string)preg_replace('/\.[^.]+$/', '', $originalName);
        $cleanBase = (string)preg_replace('/[^a-zA-Z0-9_-]/', '-', $cleanBase);
        $webpFilename = $cleanBase . '-' . (int)round(microtime(true) * 1000) . '.webp';
        $webpPath = UPLOADS_DIR . DIRECTORY_SEPARATOR . $webpFilename;

        file_put_contents($webpPath, $result['buffer']);
        $webpUrl = '/uploads/' . $webpFilename;

        $savedMediaItem = null;
        $saveToLib = (Request::query('saveToLibrary') === 'true' || ($_POST['saveToLibrary'] ?? '') === 'true');
        if ($saveToLib) {
            $pdo = Database::getConnection();
            $mediaId = 'med-' . (int)round(microtime(true) * 1000);
            $title = str_replace(['-', '_'], ' ', (string)preg_replace('/\.[^.]+$/', '', $originalName));

            $pdo->prepare("
                INSERT INTO `media` (`id`, `filename`, `original_name`, `url`, `mimetype`, `size`, `width`, `height`, `alt_text`, `title`, `is_optimized`, `original_size`, `created_at`)
                VALUES (?, ?, ?, ?, 'image/webp', ?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
            ")->execute([
                $mediaId,
                $webpFilename,
                $originalName,
                $webpUrl,
                $result['optimizedSize'],
                $result['width'],
                $result['height'],
                $title,
                $title,
                $originalSize,
            ]);

            $sStmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = ?');
            $sStmt->execute([$mediaId]);
            $savedMediaItem = self::formatMedia($sStmt->fetch());
        }

        Response::json([
            'success'        => true,
            'originalName'   => $originalName,
            'originalSize'   => $originalSize,
            'optimizedSize'  => $result['optimizedSize'],
            'savingsBytes'   => $result['savingsBytes'],
            'savingsPercent' => $result['savingsPercent'],
            'width'          => $result['width'],
            'height'         => $result['height'],
            'format'         => 'webp',
            'url'            => $webpUrl,
            'base64Data'     => 'data:image/webp;base64,' . base64_encode($result['buffer']),
            'mediaItem'      => $savedMediaItem,
            'qualityUsed'    => $result['qualityUsed'],
        ]);
    }

    public static function batchOptimize(): void
    {
        Auth::requireAuth();
        self::ensureUploadsDir();
        $pdo = Database::getConnection();

        $items = $pdo->query('SELECT * FROM `media` WHERE `is_optimized` = 0 OR `size` > 256000 LIMIT 25')->fetchAll();
        $processedCount = 0;
        $totalSavingsBytes = 0;

        foreach ($items as $item) {
            try {
                $inputBinary = null;
                $url = (string)$item['url'];

                if (str_starts_with($url, '/uploads/')) {
                    $filePath = UPLOADS_DIR . DIRECTORY_SEPARATOR . basename((string)$item['filename']);
                    if (is_file($filePath)) {
                        $inputBinary = file_get_contents($filePath);
                    }
                } elseif (str_starts_with($url, 'http')) {
                    $inputBinary = ImageOptimizer::fetchRemoteImage($url);
                }

                if ($inputBinary !== null && $inputBinary !== false) {
                    $oldSize = (int)($item['size'] ?: strlen($inputBinary));
                    $result = ImageOptimizer::optimizeBufferToWebP($inputBinary, MAX_WEBP_BYTES);

                    $baseName = (string)preg_replace('/\.[^.]+$/', '', (string)$item['filename']);
                    $baseName = (string)preg_replace('/[^a-zA-Z0-9_-]/', '-', $baseName);
                    $webpFilename = $baseName . '-opt-' . (int)round(microtime(true) * 1000) . '.webp';
                    $webpPath = UPLOADS_DIR . DIRECTORY_SEPARATOR . $webpFilename;

                    file_put_contents($webpPath, $result['buffer']);
                    $newUrl = '/uploads/' . $webpFilename;

                    $pdo->prepare("
                        UPDATE `media`
                        SET `filename` = ?,
                            `url` = ?,
                            `mimetype` = 'image/webp',
                            `size` = ?,
                            `original_size` = ?,
                            `width` = ?,
                            `height` = ?,
                            `is_optimized` = 1,
                            `updated_at` = CURRENT_TIMESTAMP
                        WHERE `id` = ?
                    ")->execute([
                        $webpFilename,
                        $newUrl,
                        $result['optimizedSize'],
                        $oldSize,
                        $result['width'],
                        $result['height'],
                        $item['id'],
                    ]);

                    $processedCount++;
                    $totalSavingsBytes += max(0, $oldSize - $result['optimizedSize']);
                }
            } catch (Throwable $e) {
                // Skip item gracefully on error
            }
        }

        Response::json([
            'success'           => true,
            'processedCount'    => $processedCount,
            'totalSavingsBytes' => $totalSavingsBytes,
            'message'           => "Batch optimization completed: {$processedCount} images converted to WebP under 250 KB.",
        ]);
    }

    public static function update(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $body = Request::body();
        $pdo = Database::getConnection();

        $check = $pdo->prepare('SELECT `id` FROM `media` WHERE `id` = ? LIMIT 1');
        $check->execute([$id]);
        if (!$check->fetch()) {
            Response::error('Media asset not found', 404);
        }

        $pdo->prepare('
            UPDATE `media`
            SET `alt_text` = COALESCE(?, `alt_text`),
                `title` = COALESCE(?, `title`),
                `caption` = COALESCE(?, `caption`),
                `updated_at` = CURRENT_TIMESTAMP
            WHERE `id` = ?
        ')->execute([
            $body['alt_text'] ?? null,
            $body['title'] ?? null,
            $body['caption'] ?? null,
            $id,
        ]);

        $updStmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = ?');
        $updStmt->execute([$id]);
        Response::json(['success' => true, 'item' => self::formatMedia($updStmt->fetch())]);
    }

    public static function delete(array $params): void
    {
        Auth::requireAuth();
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $item = $stmt->fetch();
        if (!$item) {
            Response::error('Media asset not found', 404);
        }

        if (!empty($item['url']) && str_starts_with((string)$item['url'], '/uploads/')) {
            $filePath = UPLOADS_DIR . DIRECTORY_SEPARATOR . basename((string)$item['filename']);
            if (is_file($filePath)) {
                @unlink($filePath);
            }
        }

        $pdo->prepare('DELETE FROM `media` WHERE `id` = ?')->execute([$id]);
        Response::json(['success' => true, 'message' => 'Media asset deleted successfully']);
    }
}
