<?php
declare(strict_types=1);

class ImageOptimizer
{
    public const MAX_TARGET_BYTES = 256000; // 250 KB

    /**
     * Reads dimensions from image binary or returns null for SVG/unknown.
     */
    public static function getDimensionsFromString(string $binary): array
    {
        $info = @getimagesizefromstring($binary);
        if (!$info) {
            return ['width' => null, 'height' => null, 'mime' => null];
        }
        return [
            'width'  => isset($info[0]) ? (int)$info[0] : null,
            'height' => isset($info[1]) ? (int)$info[1] : null,
            'mime'   => $info['mime'] ?? null,
        ];
    }

    /**
     * Downloads remote HTTPS/HTTP image safely via cURL.
     */
    public static function fetchRemoteImage(string $url): string
    {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new RuntimeException('Invalid remote image URL');
        }

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS      => 5,
                CURLOPT_TIMEOUT        => 20,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_USERAGENT      => 'ToufiqMotionMediaOptimizer/1.0',
            ]);
            $data = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);

            if ($data === false || $httpCode >= 400) {
                throw new RuntimeException($err !== '' ? $err : 'Failed to fetch remote image (HTTP ' . $httpCode . ')');
            }
            return (string)$data;
        }

        $ctx = stream_context_create(['http' => ['timeout' => 20, 'user_agent' => 'ToufiqMotionMediaOptimizer/1.0']]);
        $data = @file_get_contents($url, false, $ctx);
        if ($data === false) {
            throw new RuntimeException('Could not fetch remote image');
        }
        return $data;
    }

    /**
     * Auto-orients image using EXIF orientation (for JPEG photos).
     */
    private static function autoOrientFromBinary(GdImage $img, string $binary): GdImage
    {
        if (!function_exists('exif_read_data')) {
            return $img;
        }

        $tmp = @tempnam(sys_get_temp_dir(), 'exif_');
        if (!$tmp) {
            return $img;
        }

        try {
            file_put_contents($tmp, $binary);
            $exif = @exif_read_data($tmp);
            if (!is_array($exif) || empty($exif['Orientation'])) {
                return $img;
            }
            $orientation = (int)$exif['Orientation'];
            $rotated = match ($orientation) {
                3 => @imagerotate($img, 180, 0),
                6 => @imagerotate($img, -90, 0),
                8 => @imagerotate($img, 90, 0),
                default => false,
            };
            if ($rotated instanceof GdImage) {
                imagedestroy($img);
                return $rotated;
            }
        } catch (Throwable $e) {
            // Safe fallback if EXIF parsing fails
        } finally {
            @unlink($tmp);
        }

        return $img;
    }

    /**
     * Converts any GD image resource into truecolor with preserved alpha.
     */
    private static function prepareTrueColor(GdImage $img): GdImage
    {
        if (!imageistruecolor($img)) {
            if (function_exists('imagepalettetotruecolor')) {
                imagepalettetotruecolor($img);
            } else {
                $w = imagesx($img);
                $h = imagesy($img);
                $true = imagecreatetruecolor($w, $h);
                imagealphablending($true, false);
                imagesavealpha($true, true);
                imagecopy($true, $img, 0, 0, 0, 0, $w, $h);
                imagedestroy($img);
                $img = $true;
            }
        }
        imagealphablending($img, true);
        imagesavealpha($img, true);
        return $img;
    }

    /**
     * Proportionally resizes a GD image inside maxDim without enlarging smaller images.
     */
    private static function resizeInside(GdImage $src, int $maxDim): GdImage
    {
        $origW = imagesx($src);
        $origH = imagesy($src);
        if ($origW <= $maxDim && $origH <= $maxDim) {
            return $src;
        }

        if ($origW >= $origH) {
            $newW = $maxDim;
            $newH = max(1, (int)round(($origH / $origW) * $maxDim));
        } else {
            $newH = $maxDim;
            $newW = max(1, (int)round(($origW / $origH) * $maxDim));
        }

        $dst = imagecreatetruecolor($newW, $newH);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        return $dst;
    }

    private static function encodeWebP(GdImage $img, int $quality): string
    {
        ob_start();
        imagewebp($img, null, $quality);
        return (string)ob_get_clean();
    }

    /**
     * Multi-pass WebP optimizer strictly targeting <= 250 KB (mirroring imageOptimizer.ts).
     */
    public static function optimizeBufferToWebP(string $inputBinary, int $targetMaxBytes = self::MAX_TARGET_BYTES): array
    {
        if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) {
            throw new RuntimeException('PHP GD WebP extension is not enabled on this server');
        }

        @ini_set('memory_limit', '256M');

        $originalSize = strlen($inputBinary);
        $img = @imagecreatefromstring($inputBinary);
        if (!($img instanceof GdImage)) {
            throw new RuntimeException('Unable to decode image file for optimization');
        }

        $img = self::prepareTrueColor($img);
        $img = self::autoOrientFromBinary($img, $inputBinary);

        $currentWidth = imagesx($img);
        $currentHeight = imagesy($img);

        // Protect Hostinger RAM on oversized 6K/8K originals by capping initial decode to 2400px
        if ($currentWidth > 2400 || $currentHeight > 2400) {
            $capped = self::resizeInside($img, 2400);
            if ($capped !== $img) {
                imagedestroy($img);
                $img = $capped;
                $currentWidth = imagesx($img);
                $currentHeight = imagesy($img);
            }
        }

        // Pass 1: Initial high-quality WebP (82)
        $quality = 82;
        $outputBuffer = self::encodeWebP($img, $quality);

        if (strlen($outputBuffer) <= $targetMaxBytes) {
            $optSize = strlen($outputBuffer);
            $savings = max(0, $originalSize - $optSize);
            $pct = $originalSize > 0 ? (int)round(($savings / $originalSize) * 100) : 0;
            imagedestroy($img);

            return [
                'buffer'         => $outputBuffer,
                'originalSize'   => $originalSize,
                'optimizedSize'  => $optSize,
                'savingsBytes'   => $savings,
                'savingsPercent' => $pct,
                'width'          => $currentWidth,
                'height'         => $currentHeight,
                'format'         => 'webp',
                'qualityUsed'    => $quality,
            ];
        }

        // Pass 2: Iterative quality tuning [75, 68, 60, 52, 45]
        foreach ([75, 68, 60, 52, 45] as $q) {
            $quality = $q;
            $outputBuffer = self::encodeWebP($img, $q);
            if (strlen($outputBuffer) <= $targetMaxBytes) {
                break;
            }
        }

        $finalWidth = $currentWidth;
        $finalHeight = $currentHeight;

        // Pass 3: Proportional dimension downscaling if still over 250 KB
        if (strlen($outputBuffer) > $targetMaxBytes) {
            foreach ([1920, 1600, 1400, 1200, 1000, 800] as $maxDim) {
                if ($currentWidth > $maxDim || $currentHeight > $maxDim) {
                    $resized = self::resizeInside($img, $maxDim);
                    $finalWidth = imagesx($resized);
                    $finalHeight = imagesy($resized);

                    $outputBuffer = self::encodeWebP($resized, 72);
                    if (strlen($outputBuffer) <= $targetMaxBytes) {
                        $quality = 72;
                        if ($resized !== $img) {
                            imagedestroy($resized);
                        }
                        break;
                    }

                    $outputBuffer = self::encodeWebP($resized, 55);
                    if ($resized !== $img) {
                        imagedestroy($resized);
                    }
                    if (strlen($outputBuffer) <= $targetMaxBytes) {
                        $quality = 55;
                        break;
                    }
                    $quality = 55;
                }
            }
        }

        imagedestroy($img);

        $optSize = strlen($outputBuffer);
        $savings = max(0, $originalSize - $optSize);
        $pct = $originalSize > 0 ? (int)round(($savings / $originalSize) * 100) : 0;

        return [
            'buffer'         => $outputBuffer,
            'originalSize'   => $originalSize,
            'optimizedSize'  => $optSize,
            'savingsBytes'   => $savings,
            'savingsPercent' => $pct,
            'width'          => $finalWidth,
            'height'         => $finalHeight,
            'format'         => 'webp',
            'qualityUsed'    => $quality,
        ];
    }
}

