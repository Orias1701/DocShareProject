// src/services/pdfService.js
import { pdfjsLib } from "../lib/pdfjs";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || ""; // để "" nếu FE & BE cùng origin
export const buildProxyUrl = (u) =>
  `${API_ORIGIN}/index.php?action=pdf_proxy&u=${encodeURIComponent(u)}`;

/** Kiểm tra bytes có “giống PDF” không (%PDF- xuất hiện trong ~1KB đầu) */
export function looksLikePdf(ab) {
  if (!ab || !ab.byteLength) return false;
  const maxScan = Math.min(ab.byteLength, 1024);
  const head = new Uint8Array(ab, 0, maxScan);
  const ascii = new TextDecoder("ascii").decode(head);
  return ascii.includes("%PDF-");
}

/** Tải PDF: ưu tiên proxy (ArrayBuffer), nếu fail thì để pdf.js tự tải trực tiếp */
export async function loadPdfDocument(url) {
  // 1) Thử proxy cùng origin — tránh ERR_TUNNEL/CORS
  try {
    const proxied = buildProxyUrl(url);
    const ab = await fetch(proxied, {
      credentials: "include",    // nếu BE cần session/cookie
      cache: "no-store",
      referrerPolicy: "no-referrer",
    }).then((r) => {
      if (!r.ok) throw new Error(`Proxy fetch failed: ${r.status}`);
      return r.arrayBuffer();
    });

    if (!looksLikePdf(ab)) throw new Error("Proxy did not return a PDF");
    const task = pdfjsLib.getDocument({ data: ab });
    return await task.promise;
  } catch (e) {
    // 2) Fallback: để pdf.js tự tải trực tiếp từ URL gốc
    const task = pdfjsLib.getDocument({ url });
    return await task.promise;
  }
}
