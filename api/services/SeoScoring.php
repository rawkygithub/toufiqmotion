<?php
declare(strict_types=1);

class SeoScoring
{
    public static function slugify(string $text): string
    {
        $slug = strtolower($text);
        $slug = (string)preg_replace('/[^\w\s-]/', '', $slug);
        $slug = trim($slug);
        $slug = (string)preg_replace('/[\s_-]+/', '-', $slug);
        return trim($slug, '-');
    }

    public static function calculateSeoScore(array $article): int
    {
        $score = 50;
        $kw = strtolower(trim((string)($article['focus_keyword'] ?? '')));
        $title = strtolower((string)($article['meta_title'] ?: ($article['title'] ?? '')));
        $desc = strtolower((string)($article['meta_description'] ?: ($article['excerpt'] ?? '')));
        $content = strtolower((string)($article['html_content'] ?: ($article['content_json'] ?? '')));

        if ($kw !== '') {
            $score += 10;
            if (str_contains($title, $kw)) {
                $score += 15;
            }
            if (str_contains($desc, $kw)) {
                $score += 10;
            }
            if (str_contains($content, $kw)) {
                $score += 10;
            }
        }

        $descLen = mb_strlen($desc, 'UTF-8');
        if ($descLen >= 100 && $descLen <= 165) {
            $score += 10;
        } elseif ($descLen > 50) {
            $score += 5;
        }

        $titleLen = mb_strlen($title, 'UTF-8');
        if ($titleLen >= 30 && $titleLen <= 65) {
            $score += 5;
        }

        return min(100, max(35, $score));
    }
}

