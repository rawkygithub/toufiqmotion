<?php
declare(strict_types=1);

@ini_set('display_errors', '0');

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/core/Auth.php';

require_once __DIR__ . '/services/HeadTagsService.php';
require_once __DIR__ . '/services/ImageOptimizer.php';
require_once __DIR__ . '/services/SeoScoring.php';

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/PostsController.php';
require_once __DIR__ . '/controllers/CategoriesController.php';
require_once __DIR__ . '/controllers/CommentsController.php';
require_once __DIR__ . '/controllers/InquiriesController.php';
require_once __DIR__ . '/controllers/NewsletterController.php';
require_once __DIR__ . '/controllers/StatsController.php';
require_once __DIR__ . '/controllers/SettingsController.php';
require_once __DIR__ . '/controllers/MediaController.php';
require_once __DIR__ . '/controllers/PagesController.php';
require_once __DIR__ . '/controllers/SeoController.php';
require_once __DIR__ . '/controllers/AffiliateController.php';
require_once __DIR__ . '/controllers/UsersController.php';

if (Request::method() === 'OPTIONS') {
    Response::sendCorsHeaders();
    http_response_code(204);
    exit;
}

try {
    $router = new Router();

    // Health Check
    $router->get('/health', function (): void {
        Database::getConnection()->query('SELECT 1');
        Response::json([
            'status'       => 'healthy',
            'timestamp'    => gmdate('Y-m-d\TH:i:s\Z'),
            'service'      => 'Toufiq Motion Blog API (PHP 8 + MySQL)',
            'architecture' => 'Hostinger Shared/Premium Modular REST Engine',
        ]);
    });

    // Auth
    $router->post('/auth/login', fn() => AuthController::login());
    $router->get('/auth/me', fn() => AuthController::me());
    $router->post('/auth/refresh', fn() => AuthController::refresh());

    // Posts
    $router->get('/posts', fn() => PostsController::index());
    $router->get('/posts/:slugOrId', fn($p) => PostsController::show($p));
    $router->post('/posts/:id/like', fn($p) => PostsController::like($p));
    $router->post('/posts', fn() => PostsController::create());
    $router->put('/posts/:id', fn($p) => PostsController::update($p));
    $router->delete('/posts/:id', fn($p) => PostsController::delete($p));

    // Categories
    $router->get('/categories', fn() => CategoriesController::index());
    $router->post('/categories', fn() => CategoriesController::create());
    $router->put('/categories/:id', fn($p) => CategoriesController::update($p));
    $router->delete('/categories/:id', fn($p) => CategoriesController::delete($p));

    // Comments
    $router->get('/comments', fn() => CommentsController::index());
    $router->post('/comments/article/:articleId', fn($p) => CommentsController::createForArticle($p));
    $router->delete('/comments/:id', fn($p) => CommentsController::delete($p));

    // Inquiries
    $router->post('/inquiries', fn() => InquiriesController::create());
    $router->get('/inquiries', fn() => InquiriesController::index());
    $router->put('/inquiries/:id/status', fn($p) => InquiriesController::updateStatus($p));
    $router->delete('/inquiries/:id', fn($p) => InquiriesController::delete($p));

    // Newsletter
    $router->post('/newsletter', fn() => NewsletterController::subscribe());
    $router->get('/newsletter', fn() => NewsletterController::index());
    $router->delete('/newsletter/:id', fn($p) => NewsletterController::delete($p));

    // Stats
    $router->get('/stats', fn() => StatsController::index());

    // Settings
    $router->get('/settings', fn() => SettingsController::index());
    $router->post('/settings', fn() => SettingsController::save());

    // Media Library & WebP Optimization
    $router->get('/media', fn() => MediaController::index());
    $router->post('/media/upload', fn() => MediaController::upload());
    $router->post('/media/optimize-tool', fn() => MediaController::optimizeTool());
    $router->post('/media/batch-optimize', fn() => MediaController::batchOptimize());
    $router->post('/media/:id/optimize', fn($p) => MediaController::optimizeItem($p));
    $router->put('/media/:id', fn($p) => MediaController::update($p));
    $router->delete('/media/:id', fn($p) => MediaController::delete($p));

    // Pages Builder
    $router->get('/pages', fn() => PagesController::index());
    $router->get('/pages/slug/:slug', fn($p) => PagesController::showBySlug($p));
    $router->get('/pages/:id', fn($p) => PagesController::show($p));
    $router->post('/pages', fn() => PagesController::create());
    $router->put('/pages/:id', fn($p) => PagesController::update($p));
    $router->post('/pages/:id/duplicate', fn($p) => PagesController::duplicate($p));
    $router->post('/pages/:id/add-to-menu', fn($p) => PagesController::addToMenu($p));
    $router->delete('/pages/:id', fn($p) => PagesController::delete($p));

    // SEO Command Center
    $router->get('/seo/overview', fn() => SeoController::overview());
    $router->get('/seo/audit', fn() => SeoController::audit());
    $router->put('/seo/audit/:id', fn($p) => SeoController::updateAudit($p));
    $router->post('/seo/reanalyze', fn() => SeoController::reanalyze());
    $router->get('/seo/redirects', fn() => SeoController::getRedirects());
    $router->post('/seo/redirects', fn() => SeoController::createRedirect());
    $router->put('/seo/redirects/:id', fn($p) => SeoController::updateRedirect($p));
    $router->delete('/seo/redirects/:id', fn($p) => SeoController::deleteRedirect($p));
    $router->get('/seo/crawl-errors', fn() => SeoController::getCrawlErrors());
    $router->post('/seo/crawl-errors/resolve', fn() => SeoController::resolveCrawlError());
    $router->post('/seo/crawl-errors/clear', fn() => SeoController::clearCrawlErrors());
    $router->get('/seo/settings', fn() => SeoController::getSettings());
    $router->post('/seo/settings', fn() => SeoController::saveSettings());
    $router->post('/seo/ping', fn() => SeoController::ping());
    $router->get('/seo/indexing-logs', fn() => SeoController::getIndexingLogs());
    $router->post('/seo/indexing-submit', fn() => SeoController::submitIndexing());
    $router->get('/seo/search-queries', fn() => SeoController::getSearchQueries());
    $router->get('/seo/verify-head', fn() => SeoController::verifyHead());

    // Affiliate Marketing Engine
    $router->get('/affiliate/overview', fn() => AffiliateController::overview());
    $router->get('/affiliate/links', fn() => AffiliateController::links());
    $router->get('/affiliate/links/:id', fn($p) => AffiliateController::showLink($p));
    $router->post('/affiliate/links', fn() => AffiliateController::createLink());
    $router->put('/affiliate/links/:id', fn($p) => AffiliateController::updateLink($p));
    $router->delete('/affiliate/links/:id', fn($p) => AffiliateController::deleteLink($p));
    $router->get('/affiliate/clicks', fn() => AffiliateController::clicks());
    $router->post('/affiliate/generate-box-html', fn() => AffiliateController::generateBoxHtml());
    $router->get('/affiliate/settings', fn() => AffiliateController::getSettings());
    $router->post('/affiliate/settings', fn() => AffiliateController::saveSettings());

    // User & Role Management
    $router->get('/users/author', fn() => UsersController::primaryAuthor());
    $router->get('/users', fn() => UsersController::index());
    $router->get('/users/:id', fn($p) => UsersController::show($p));
    $router->post('/users', fn() => UsersController::create());
    $router->put('/users/:id', fn($p) => UsersController::update($p));
    $router->put('/users/:id/password', fn($p) => UsersController::changePassword($p));
    $router->delete('/users/:id', fn($p) => UsersController::delete($p));

    $router->dispatch(Request::method(), Request::apiPath());
} catch (Throwable $e) {
    $msg = DEBUG ? $e->getMessage() : ($e->getMessage() ?: 'Internal Server Error');
    Response::error($msg, 500);
}

