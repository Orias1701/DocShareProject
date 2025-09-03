<?php
// services/PdfToDocxConverter.php
require_once __DIR__ . '/../vendor/autoload.php';

use Smalot\PdfParser\Parser;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;

class PdfToDocxConverter {
    public static function convert($pdfInputPath, $docxOutputPath) {
        try {
            // Kiểm tra file PDF tồn tại
            if (!file_exists($pdfInputPath)) {
                throw new Exception("File PDF nguồn không tồn tại tại: " . $pdfInputPath);
            }

            // Trích xuất văn bản từ PDF
            $parser = new Parser();
            $pdf = $parser->parseFile($pdfInputPath);
            $text = $pdf->getText();

            // Tạo file DOCX
            $phpWord = new PhpWord();
            $section = $phpWord->addSection();
            $section->addText($text);

            // Lưu file DOCX
            $writer = IOFactory::createWriter($phpWord, 'Word2007');
            $writer->save($docxOutputPath);

            if (!file_exists($docxOutputPath)) {
                throw new Exception("Không thể tạo file DOCX tại: " . $docxOutputPath);
            }

            return true;
        } catch (Exception $e) {
            throw new Exception("Lỗi khi chuyển đổi PDF sang DOCX: " . $e->getMessage());
        }
    }
}