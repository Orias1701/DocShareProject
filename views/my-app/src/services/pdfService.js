// ✅ src/services/pdfService.js
import { pdfjsLib } from "../lib/pdfjs";

// Ưu tiên env; fallback cùng origin /api/public
const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || `${window.location.origin}/api/public`;

export const buildProxyUrl = (u) =>
  `${API_ORIGIN}/index.php?action=pdf_proxy&u=${encodeURIComponent(u)}`;

export function looksLikePdf(ab) {
  if (!ab || !ab.byteLength) return false;
  const head = new Uint8Array(ab, 0, Math.min(ab.byteLength, 1024));
  return new TextDecoder("ascii").decode(head).includes("%PDF-");
}

export async function loadPdfDocument(url) {
  try {
    const ab = await fetch(buildProxyUrl(url), {
      credentials: "include",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    }).then((r) => {
      if (!r.ok) throw new Error(`Proxy fetch failed: ${r.status}`);
      return r.arrayBuffer();
    });
    if (!looksLikePdf(ab)) throw new Error("Proxy did not return a PDF");
    return await pdfjsLib.getDocument({ data: ab }).promise;
  } catch {
    return await pdfjsLib.getDocument({ url }).promise;
  }
}
