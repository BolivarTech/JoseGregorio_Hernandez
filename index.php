<?php
/**
 * Secure Redirect Script with Multi-Language Support for josegregoriohernandez.info
 *
 * Redirects traffic from index.php to the appropriate language version using
 * secure, server-side practices:
 *  - Automatic browser language detection (Spanish/English)
 *  - Cookie-based language preference storage
 *  - No output before PHP so headers can be sent safely
 *  - Relative Location header (avoids trusting Host header)
 *  - Security headers (CSP, Referrer-Policy, etc.)
 *  - Validates the target file exists before redirecting (using __DIR__)
 *
 * Adjust the $statusCode to 301 if this redirect is permanent.
 */

declare(strict_types=1);

// Start output buffering immediately to prevent accidental output from breaking headers
ob_start();

// Security headers
header('X-Frame-Options: SAMEORIGIN'); // Prevent clickjacking
header('X-Content-Type-Options: nosniff'); // Prevent MIME-sniffing
header('Referrer-Policy: strict-origin-when-cross-origin'); // Control referrer information
header('Permissions-Policy: geolocation=(), microphone=(), camera=()'); // Restrict features
// Content Security Policy: keep it strict; adjust as necessary for your site resources
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline';");

// If the incoming request is HTTPS, emit HSTS (only appropriate over HTTPS responses)
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    header('Strict-Transport-Security: max-age=63072000; includeSubDomains; preload');
}

/**
 * Detect user's preferred language
 * Priority: 1) Cookie preference, 2) Browser language, 3) Default (Spanish)
 *
 * @return string Language code ('es' or 'en')
 */
function detectUserLanguage(): string {
    // 1. Check if user has a saved preference in cookie
    if (isset($_COOKIE['preferred_language'])) {
        $cookieLang = strtolower(trim($_COOKIE['preferred_language']));
        if ($cookieLang === 'en' || $cookieLang === 'es') {
            return $cookieLang;
        }
    }

    // 2. Check browser's Accept-Language header
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $browserLang = strtolower($_SERVER['HTTP_ACCEPT_LANGUAGE']);

        // Parse the Accept-Language header (format: "en-US,en;q=0.9,es;q=0.8")
        // Check for English variants
        if (preg_match('/\b(en)(-[a-z]{2})?\b/i', $browserLang)) {
            return 'en';
        }

        // Check for Spanish variants (es, es-MX, es-VE, etc.)
        if (preg_match('/\b(es)(-[a-z]{2})?\b/i', $browserLang)) {
            return 'es';
        }
    }

    // 3. Default to Spanish
    return 'es';
}

/**
 * Get target file based on detected language
 *
 * @param string $lang Language code ('es' or 'en')
 * @return string Filename
 */
function getTargetFile(string $lang): string {
    $files = [
        'es' => 'jose_gregorio_hernandez.html',
        'en' => 'jose_gregorio_hernandez_en.html'
    ];

    return $files[$lang] ?? $files['es'];
}

// Detect user's preferred language
$detectedLang = detectUserLanguage();

// Get the appropriate target file
$target_file = getTargetFile($detectedLang);

// Validate that the target file exists and is readable (use __DIR__ for a filesystem-accurate check)
$target_path = __DIR__ . DIRECTORY_SEPARATOR . $target_file;
if (!is_file($target_path) || !is_readable($target_path)) {
    // If file doesn't exist, fall back to Spanish version
    $target_file = 'jose_gregorio_hernandez.html';
    $target_path = __DIR__ . DIRECTORY_SEPARATOR . $target_file;

    if (!is_file($target_path) || !is_readable($target_path)) {
        // If Spanish version also doesn't exist, return 404
        http_response_code(404);
        ob_end_clean();
        echo 'Error 404: The requested page was not found.';
        exit;
    }
}

// Build a relative Location header based on the script location so the redirect works in subdirectories
$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
if ($scriptDir === '' || $scriptDir === '.' || $scriptDir === '\\') {
    $location = $target_file;
} else {
    $location = $scriptDir . '/' . ltrim($target_file, '/');
}

// Choose status code: 302 (temporary) by default. Change to 301 for permanent redirect.
$statusCode = 302;
http_response_code($statusCode);
header('Location: ' . $location);

// Clear any buffered output and finish
ob_end_clean();
exit();
// End of script - no HTML below; this file only performs a server-side redirect.
