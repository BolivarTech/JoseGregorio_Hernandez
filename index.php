<?php
/**
 * Secure Redirect Script for josegregoriohernandez.info
 *
 * Redirects traffic from index.php to jose_gregorio_hernandez.html using
 * secure, server-side practices:
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

// Define the target file (relative to this script directory)
$target_file = 'jose_gregorio_hernandez.html';

// Validate that the target file exists and is readable (use __DIR__ for a filesystem-accurate check)
$target_path = __DIR__ . DIRECTORY_SEPARATOR . $target_file;
if (!is_file($target_path) || !is_readable($target_path)) {
    // If file doesn't exist, return a proper 404 response
    http_response_code(404);
    ob_end_clean();
    echo 'Error 404: The requested page was not found.';
    exit;
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
