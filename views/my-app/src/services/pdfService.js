// [Tác dụng file] Tải PDF qua proxy (để kèm cookie/CORS), kiểm tra bytes PDF, và fallback sang tải trực tiếp
import { pdfjsLib } from "../lib/pdfjs";

// [Tác dụng] Lấy API_ORIGIN (nếu có) từ biến môi trường
const API_ORIGIN =
  (typeof import.meta !== "undefined" &&
    import.meta &&
    import.meta.env &&
    import.meta.env.VITE_API_ORIGIN) || "";

// [Tác dụng] Tạo URL proxy để server tải hộ file PDF
export function buildProxyUrl(u) {
  if (!API_ORIGIN) return u; // không cấu hình proxy → trả về URL gốc
  const base = API_ORIGIN.replace(/\/+$/, "");
  const qs = new URLSearchParams({ u });
  return `${base}/index.php?action=pdf_proxy&${qs.toString()}`;
}

// [Tác dụng] Kiểm tra xem ArrayBuffer có chứa header %PDF- không
export function looksLikePdf(ab) {
  if (!ab || !ab.byteLength) return false;
  const maxScan = Math.min(ab.byteLength, 1024);
  const head = new Uint8Array(ab, 0, maxScan);
  const ascii = new TextDecoder("ascii").decode(head);
  return ascii.indexOf("%PDF-") !== -1;
}

// [Tác dụng] Tải tài liệu PDF: ưu tiên qua proxy, nếu lỗi thì pdf.js tự tải từ URL gốc
export async function loadPdfDocument(url) {
  if (API_ORIGIN) {
    try {
      const proxied = buildProxyUrl(url);
      const r = await fetch(proxied, {
        credentials: "include",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
      if (!r.ok) throw new Error("Proxy fetch failed: " + r.status);
      const ab = await r.arrayBuffer();

      if (!looksLikePdf(ab)) throw new Error("Proxy did not return a PDF");
      const task = pdfjsLib.getDocument({ data: ab });
      return await task.promise;
    } catch (e) {
      // rơi xuống fallback
    }
  }
  // Fallback: để pdf.js tự tải từ URL gốc
  const task2 = pdfjsLib.getDocument({ url });
  return await task2.promise;
}
