<?php
class PdfProxyController
{
  public function handle(): void
  {
    $u = $_GET['u'] ?? '';
    if (!$u) { http_response_code(400); exit('Missing u'); }

    $u = filter_var($u, FILTER_SANITIZE_URL);
    $parts = parse_url($u);
    if (!$parts || empty($parts['host']) || empty($parts['path'])) { http_response_code(400); exit('Invalid URL'); }

    // ===== Whitelist host =====
    $host = strtolower($parts['host']);
    $allowed = ['localhost','127.0.0.1', /* thêm domain ngoài nếu cần */];
    $ok = in_array($host, $allowed, true);
    if (!$ok) { http_response_code(403); exit('Host not allowed'); }

    // ===== Nếu là localhost/127.0.0.1 -> đọc trực tiếp trên đĩa =====
    if ($host === 'localhost' || $host === '127.0.0.1') {
      $relPath = $parts['path']; // ví dụ: /uploads/posts/68cd2e3d84b06.pdf
      if (strpos($relPath, '/uploads/') !== 0) {
        http_response_code(403); exit('Path not allowed');
      }

      // Thư mục uploads tuyệt đối của bạn (NHỚ escape backslash trong PHP)
      $uploadsRoot = 'E:\\CODE\\NHOM\\PHP\\DocShareProject\\uploads';

      // Chuẩn hoá path cho Windows
      $normalize = function ($p) {
        $p = str_replace('\\','/',$p);
        return rtrim($p,'/');
      };
      $uploadsRootN = $normalize(realpath($uploadsRoot) ?: $uploadsRoot);

      // phần còn lại sau '/uploads/'
      $relFile = ltrim(substr($relPath, strlen('/uploads/')), '/\\');
      $abs = realpath($uploadsRoot . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relFile));

      if (!$abs) { http_response_code(404); exit('File not found'); }
      $absN = $normalize($abs);
      if (strpos($absN, $uploadsRootN) !== 0) { http_response_code(403); exit('Invalid path'); }

      if (!is_file($abs) || !is_readable($abs)) { http_response_code(404); exit('File not readable'); }

      if (function_exists('ob_get_length')) { while (ob_get_length()) { @ob_end_clean(); } }
      header('Content-Type: application/pdf');
      header('Cache-Control: public, max-age=600');
      header('Content-Length: '.filesize($abs));
      readfile($abs);
      exit;
    }

    // ===== Domain ngoài (nếu có) -> dùng cURL như cũ =====
    $ch = curl_init($u);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_CONNECTTIMEOUT => 10,
      CURLOPT_TIMEOUT        => 30,
      CURLOPT_SSL_VERIFYPEER => true,
      CURLOPT_SSL_VERIFYHOST => 2,
      CURLOPT_ENCODING       => '', // auto decompress
      CURLOPT_HTTPHEADER     => ['Accept: application/pdf','User-Agent: PDFProxy/1.0'],
    ]);
    $data  = curl_exec($ch);
    $code  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $ctype = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'application/pdf';
    curl_close($ch);

    if ($code >= 400 || $data === false) { http_response_code(502); echo "Proxy fetch failed ($code)"; exit; }
    if (strlen($data) > 50 * 1024 * 1024) { http_response_code(413); exit('File too large'); }

    // check %PDF-
    $probe = substr($data, 0, 1024);
    if (strpos($probe, '%PDF-') === false) {
      http_response_code(502);
      header('Content-Type: text/plain; charset=utf-8');
      echo "Upstream did not return a PDF (content-type: $ctype)";
      exit;
    }

    if (function_exists('ob_get_length')) { while (ob_get_length()) { @ob_end_clean(); } }
    header('Content-Type: application/pdf');
    header('Cache-Control: public, max-age=600');
    header('Content-Length: '.strlen($data));
    echo $data;
    exit;
  }
}
