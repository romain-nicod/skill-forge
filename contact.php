<?php
/**
 * AI-GMENTED.pm Contact Form Handler
 * Cookieless CSRF (HMAC-based), honeypot, rate limiting, email dispatch.
 * Zero cookies. Zero sessions. Zero tracking.
 *
 * Returns JSON when Accept: application/json, otherwise redirects (no-JS fallback).
 */

// Configuration
$recipient = 'contact@ai-gmented.pm';
$subject_prefix = '[Skill Forge Contact]';
$rate_limit_max = 5;
$rate_limit_window = 3600;
$rate_limit_dir = sys_get_temp_dir();
$csrf_ttl = 3600;

// CSRF secret — CHANGE THIS on deployment.
// On Infomaniak: set CSRF_SECRET in .user.ini or environment variable.
$csrf_secret = getenv('CSRF_SECRET');
if (!$csrf_secret) {
    // Secret persistant auto-généré (0600) — remplace le repli prévisible basé sur __DIR__
    $secret_file = sys_get_temp_dir() . '/aigmented_csrf_secret';
    $csrf_secret = @file_get_contents($secret_file) ?: '';
    if (strlen($csrf_secret) < 32) {
        $csrf_secret = bin2hex(random_bytes(32));
        @file_put_contents($secret_file, $csrf_secret, LOCK_EX);
        @chmod($secret_file, 0600);
    }
}

// Detect JSON request
$wants_json = (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false);

function respond($status, $message, $http_code, $code) {
    global $wants_json;
    if ($wants_json) {
        http_response_code($http_code);
        header('Content-Type: application/json');
        echo json_encode(['status' => $status, 'code' => $code, 'message' => $message]);
    } else {
        // Fallback sans JavaScript : page de confirmation (plus de redirection muette)
        $ok = ($status === 'success');
        $title = $ok ? 'Message sent' : 'Something went wrong';
        $body = $ok ? 'Thank you! We will get back to you shortly.'
                    : ('Your message could not be sent. ' . $message);
        http_response_code($ok ? 200 : $http_code);
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
           . '<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">'
           . '<title>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</title>'
           . '<link rel="stylesheet" href="/css/style.css?v=3"></head><body><main id="main"><section><div class="container">'
           . '<h1>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</h1>'
           . '<p class="section-text">' . htmlspecialchars($body, ENT_QUOTES, 'UTF-8') . '</p>'
           . '<a class="cta-link" href="/#contact">Back to Skill Forge <span class="arrow">&rarr;</span></a>'
           . '</div></section></main></body></html>';
    }
    exit;
}

// CSRF functions — cookieless, HMAC-based
function csrf_generate(string $secret): string {
    $ts = time();
    $payload = base64_encode($ts);
    $sig = hash_hmac('sha256', $payload, $secret);
    return $payload . '.' . $sig;
}

function csrf_verify(string $token, string $secret, int $ttl): bool {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return false;
    [$payload, $sig] = $parts;
    $expected = hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($expected, $sig)) return false;
    $ts = (int) base64_decode($payload);
    return (time() - $ts) < $ttl;
}

// GET ?csrf → return fresh token
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['csrf'])) {
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode(['token' => csrf_generate($csrf_secret)]);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond('error', 'Method not allowed.', 405, 'error');
}

// CSRF validation
$submitted_token = $_POST['csrf_token'] ?? '';
if (!csrf_verify($submitted_token, $csrf_secret, $csrf_ttl)) {
    respond('error', 'Form expired. Please refresh and try again.', 403, 'expired');
}

// Honeypot — silently reject bots
if (!empty($_POST['website'])) {
    respond('success', 'Message sent.', 200, 'sent');
}

// Rate limiting — file-based, no session
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rate_file = $rate_limit_dir . '/aigmented_rate_' . hash('sha256', $ip);
$submissions = [];
if (file_exists($rate_file)) {
    $data = file_get_contents($rate_file);
    $submissions = json_decode($data, true) ?: [];
    $submissions = array_filter($submissions, function($ts) use ($rate_limit_window) {
        return $ts > (time() - $rate_limit_window);
    });
}
if (count($submissions) >= $rate_limit_max) {
    respond('error', 'Too many requests. Please try again later.', 429, 'rate-limited');
}

// Validate & sanitise inputs
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = str_replace("\0", '', trim($_POST['message'] ?? ''));
$consent = isset($_POST['consent']);

// Only email + consent are required
if (empty($email) || !$consent) {
    respond('error', 'Please provide your email and consent.', 400, 'missing-fields');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond('error', 'Please provide a valid email address.', 400, 'invalid-email');
}

// Header injection protection
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$name = str_replace(["\r", "\n", "\0"], '', $name);

// Build email
$display_name = $name ?: '(not provided)';
$display_message = $message ?: '(no message)';

$email_subject = $subject_prefix . ' Enquiry from ' . $display_name;
$email_body  = "Name: {$display_name}\n";
$email_body .= "Email: {$email}\n\n";
$email_body .= "Message:\n{$display_message}\n";
$email_body .= "\n---\nSent from forge.ai-gmented.pm contact form\n";
$email_body .= "IP: {$ip}\n";
$email_body .= "Date: " . date('Y-m-d H:i:s T') . "\n";

// Send via SMTP (localhost:25) — Infomaniak msmtpd
$sent = false;
$smtp = @fsockopen('localhost', 25, $errno, $errstr, 10);
if ($smtp) {
    $from_addr = 'noreply@ai-gmented.pm';
    $smtpRead = function() use ($smtp) {
        $data = '';
        while ($line = fgets($smtp, 512)) {
            $data .= $line;
            if (substr($line, 3, 1) === ' ' || strlen($line) < 4) break;
        }
        return $data;
    };
    $smtpWrite = function($cmd) use ($smtp) { fwrite($smtp, $cmd . "\r\n"); };

    $smtpRead(); // 220 greeting
    $smtpWrite("EHLO ai-gmented.pm");
    $smtpRead(); // EHLO response
    $smtpWrite("MAIL FROM:<{$from_addr}>");
    $smtpRead();
    $smtpWrite("RCPT TO:<{$recipient}>");
    $smtpRead();
    $smtpWrite("DATA");
    $smtpRead(); // 354

    $msg  = "From: {$from_addr}\r\n";
    $msg .= "Reply-To: {$email}\r\n";
    $msg .= "To: {$recipient}\r\n";
    $msg .= "Subject: =?UTF-8?B?" . base64_encode($email_subject) . "?=\r\n";
    $msg .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $msg .= "X-Mailer: AI-GMENTED Contact Form\r\n";
    $msg .= "\r\n";
    $msg .= str_replace("\n.", "\n..", $email_body);
    $msg .= "\r\n.\r\n";
    fwrite($smtp, $msg);

    $resp = $smtpRead();
    $sent = (substr(trim($resp), 0, 3) === '250');
    $smtpWrite("QUIT");
    fclose($smtp);
}

// Record submission for rate limiting
$submissions[] = time();
file_put_contents($rate_file, json_encode(array_values($submissions)), LOCK_EX);

// Generic response — never expose technical details
if ($sent) {
    respond('success', 'Message sent. We will get back to you.', 200, 'sent');
} else {
    respond('error', 'Something went wrong. Please try again later.', 500, 'error');
}
