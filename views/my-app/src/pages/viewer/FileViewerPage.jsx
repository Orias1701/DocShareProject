// src/pages/viewer/FileViewerPage.jsx
import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";

// ====== PDF.js (bundle worker cùng origin, tránh lỗi fake worker) ======
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

// ====== UI constants ======
const WRAP = "min-h-screen bg-[#0D1117] text-white";
const CARD = "bg-[#0F172A] rounded-lg border border-white/10";
const viewerClass = "block w-full h-auto";

// ====== API base (BE) ======
// Nếu BE khác origin, đặt VITE_API_ORIGIN = "https://api.yourdomain.com" trong .env
// Nếu cùng origin, để chuỗi rỗng "" là được.
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";
const buildProxyUrl = (u) =>
  `${API_ORIGIN}/index.php?action=pdf_proxy&u=${encodeURIComponent(u)}`;

// ====== Avatar fallback nội bộ (data URI, không gọi ra ngoài) ======
const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="100%" height="100%" fill="#334155"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="28" fill="#e2e8f0">U</text>
    </svg>`
  );

// ====== Query helpers ======
function useQuery() {
  const { search } = useLocation();
  const p = new URLSearchParams(search);

  const raw = (p.get("url") || "").trim();
  const title = p.get("title") || "Post title";
  const album = p.get("album") || "Album name";
  const category = p.get("category") || "Album name";
  const hashtags = (p.get("hashtags") || "").split(/[,\s]+/).filter(Boolean);
  const authorName = p.get("author") || "Full name";
  const username = p.get("username") || "Username";
  const followers = p.get("followers") || "Following number";
  const avatarParam = p.get("avatar") || "";
  const summary = p.get("summary") || "Summary will be shown here";

  let url = raw;
  try {
    url = decodeURIComponent(raw);
  } catch {}

  // Nếu không có avatar param → dùng fallback nội bộ
  const avatar = avatarParam || FALLBACK_AVATAR;

  return {
    url,
    title,
    album,
    category,
    hashtags,
    authorName,
    username,
    followers,
    avatar,
    summary,
  };
}

// ====== Type helpers ======
const isPdf = (u, t = "") =>
  /application\/pdf/i.test(t) || /\.pdf(\?|#|$)/i.test(String(u || ""));
const isImage = (u, t = "") =>
  /^image\//i.test(t) || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(u || ""));

// ====== Helper: check bytes có “giống PDF” không (%PDF- trong ~1KB đầu) ======
function looksLikePdf(ab) {
  if (!ab || !ab.byteLength) return false;
  const maxScan = Math.min(ab.byteLength, 1024);
  const head = new Uint8Array(ab, 0, maxScan);
  const ascii = new TextDecoder("ascii").decode(head);
  return ascii.includes("%PDF-");
}

// ====== PDF.js Viewer (render từng trang vào <canvas>) ======
function PdfJsViewer({ url, title, previewPages = 5, scale = 1.4 }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const cancelRef = useRef({ canceled: false });

  useEffect(() => {
    cancelRef.current.canceled = false;
    setPdf(null);
    setNumPages(null);
    setErrMsg("");
    setLoading(true);
  
    (async () => {
      try {
        // LUÔN dùng proxy
        const proxied = buildProxyUrl(url);
        const res = await fetch(proxied, {
          credentials: "include",
          cache: "no-store",
          referrerPolicy: "no-referrer",
        });
        if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
        const ab = await res.arrayBuffer();
  
        // Kiểm tra bytes có phải PDF không
        const maxScan = Math.min(ab.byteLength, 1024);
        const ascii = new TextDecoder("ascii").decode(new Uint8Array(ab, 0, maxScan));
        if (!ascii.includes("%PDF-")) {
          throw new Error("Proxy did not return a PDF");
        }
  
        const task = pdfjsLib.getDocument({ data: ab });
        const doc = await task.promise;
  
        if (cancelRef.current.canceled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (e) {
        if (cancelRef.current.canceled) return;
        setErrMsg(
          (e && e.message) ||
          "Không thể mở PDF qua proxy. Kiểm tra whitelist/CORS ở BE."
        );
        setLoading(false);
      }
    })();
  
    return () => { cancelRef.current.canceled = true; };
  }, [url]);
  

  // Component render từng trang
  function PdfPage({ doc, pageNumber }) {
    const canvasRef = useRef(null);

    useEffect(() => {
      let running = true;
      (async () => {
        const page = await doc.getPage(pageNumber);
        if (!running) return;

        const viewport = page.getViewport({ scale });

        // Vẽ sắc nét theo devicePixelRatio
        const dpr = window.devicePixelRatio || 1;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        const transform =
          dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

        await page.render({
          canvasContext: ctx,
          viewport,
          transform,
        }).promise;
      })();
      return () => {
        running = false;
      };
    }, [doc, pageNumber]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full max-w-4xl h-auto rounded-md border border-white/10 shadow"
      />
    );
  }

  const showPages = numPages
    ? previewPages > 0
      ? Math.min(previewPages, numPages)
      : numPages
    : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="text-sm text-gray-300">
          {numPages ? `Preview ${showPages}/${numPages} trang` : "Đang tải PDF…"}
        </div>
        <div className="flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs rounded bg-white/10 hover:bg-white/20"
          >
            Mở bản gốc
          </a>
        </div>
      </div>

      {loading && (
        <div className="p-6 text-center text-gray-400">Đang render trang…</div>
      )}
      {!!errMsg && (
        <div className="p-6 text-center text-red-400 text-sm">
          {errMsg}
          <div className="mt-3">
            <a href={url} target="_blank" rel="noopener" className="underline">
              Mở trực tiếp PDF
            </a>
          </div>
        </div>
      )}

      {pdf && (
        <div className="flex flex-col items-center gap-4 p-4">
          {Array.from({ length: showPages }, (_, i) => i + 1).map((n) => (
            <PdfPage key={n} doc={pdf} pageNumber={n} />
          ))}
        </div>
      )}

      {!!numPages && previewPages > 0 && numPages > previewPages && (
        <div className="border-t border-white/10 p-6 text-center">
          <p className="text-sm text-gray-300 mb-3">
            Bạn đang xem trước {previewPages}/{numPages} trang.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm rounded bg-white/10 hover:bg-white/20"
          >
            Mở toàn bộ PDF
          </a>
        </div>
      )}
    </div>
  );
}

// ====== Trang chính ======
export default function FileViewerPage() {
  const {
    url,
    title,
    album,
    category,
    hashtags,
    authorName,
    username,
    followers,
    avatar,
    summary,
  } = useQuery();

  const valid = useMemo(() => !!url && /^https?:\/\//i.test(url), [url]);
  if (!valid) {
    return (
      <div className={`${WRAP} flex items-center justify-center p-6`}>
        <div className={`${CARD} p-6 max-w-xl w-full text-center`}>
          <h1 className="text-xl font-semibold mb-2">Không có URL hợp lệ</h1>
          <p className="text-gray-300 mb-4">Ví dụ:</p>
          <pre className="bg-black/30 rounded p-3 text-xs overflow-auto">
            /viewer/file?url=https%3A%2F%2Fexample.com%2Ffile.pdf
          </pre>
          <Link
            to="/"
            className="inline-block mt-4 px-4 py-2 rounded bg-white/10 hover:bg-white/20"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const mainContent = isPdf(url) ? (
    <div className={`${CARD} overflow-hidden`}>
      {/* Dùng PDF.js render canvas; đổi previewPages=0 để hiện toàn bộ */}
      <PdfJsViewer url={url} title={title} previewPages={5} scale={1.4} />
    </div>
  ) : isImage(url) ? (
    <div className={`${CARD} overflow-hidden`}>
      <div className={`w-full min-h-[60vh] bg-black/20 grid place-items-center`}>
        <img
          src={url}
          alt={title}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    </div>
  ) : (
    <div className={`${CARD} overflow-hidden`}>
      <div className={`w-full min-h-[60vh] grid place-items-center text-gray-300`}>
        <p>Post content will be shown here</p>
      </div>
    </div>
  );

  return (
    <div className={WRAP}>
      <h1 className="text-[18px] md:text-[20px] font-bold mb-3">{title}</h1>
      <div className="container mx-auto p-4 lg:p-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2">
            <div className={`${viewerClass}`}>{mainContent}</div>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20"
              >
                Mở bản gốc
              </a>
              <Link
                to={-1}
                className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20"
              >
                Quay lại
              </Link>
            </div>
          </div>

          {/* Cột phải */}
          <aside className="space-y-6">
            <div className={`${CARD} p-5`}>
              <h2 className="text-sm font-semibold mb-4">Post information</h2>
              <div className="space-y-3 text-gray-300 text-xs">
                <div>
                  <p className="text-[11px] text-gray-400">Album</p>
                  <p>{album}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Category</p>
                  <p>{category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Hashtag</p>
                  {hashtags.length ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hashtags.map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="bg-gray-700/40 px-2 py-0.5 rounded text-[11px]"
                        >
                          {t.startsWith("#") ? t : `#${t}`}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">—</p>
                  )}
                </div>
              </div>
            </div>

            <div className={`${CARD} p-5`}>
              <h2 className="text-sm font-semibold mb-4">User information</h2>
              <div className="flex items-center">
                <img
                  src={avatar || FALLBACK_AVATAR}
                  alt={authorName}
                  className="w-8 h-8 rounded-full mr-3 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AVATAR;
                    e.currentTarget.onerror = null;
                  }}
                />
                <div className="text-xs">
                  <p className="font-semibold">{authorName}</p>
                  <p className="text-gray-400">{username}</p>
                  <p className="text-gray-500 mt-1">{followers}</p>
                </div>
              </div>
            </div>

            <div className={`${CARD} p-5 h-48 grid place-items-center text-center`}>
              <p className="text-xs text-gray-300 px-2">{summary}</p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
