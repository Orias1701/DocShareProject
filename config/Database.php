<?php
// config/Database.php
// Đọc file config.properties và trả PDO connection

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            $cfgFile = __DIR__ . '/config.properties';
            if (!file_exists($cfgFile)) {
                throw new Exception("Missing config file: $cfgFile");
            }

            $cfg = parse_ini_file($cfgFile);
            if ($cfg === false) {
                throw new Exception("Unable to parse config.properties");
            }

            $host = $cfg['db_host'] ?? 'sql104.infinityfree.com';
            $db   = $cfg['db_name'] ?? 'if0_39692334_doc_share';
            $user = $cfg['db_user'] ?? 'if0_39692334';
            $pass = $cfg['db_pass'] ?? 'XqXbv5AlBJD4';

            $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            try {
                self::$pdo = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                throw new Exception("DB connect error: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}
