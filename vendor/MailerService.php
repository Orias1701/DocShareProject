<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/autoload.php';

class MailerService
{
    public static function sendMail($to, $subject, $body)
    {
        $mail = new PHPMailer(true);
        try {
            // ⚙️ SMTP config (dùng Gmail)
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'Thang10072005@gmail.com'; // 👈 email thật của bạn
            $mail->Password = 'gnoj kmsw evai jwer'; // 🔑 Mật khẩu ứng dụng (App Password)
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';

            // 📨 Người gửi / người nhận
            $mail->setFrom('youremail@gmail.com', 'DocShare Project');
            $mail->addAddress($to);
            $mail->isHTML(false);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }
}
