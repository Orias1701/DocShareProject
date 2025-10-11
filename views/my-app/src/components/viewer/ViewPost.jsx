// src/components/post/ViewPost.jsx
import React, { useEffect, useState } from "react";
import PostLayout, { css } from "./ViewLayout";
import CommentsPanel from "../comments/CommentsPanel";
import postService from "../../services/postService";
import post_commentServices from "../../services/post_commentServices";
import PostOptionsMenu from "../post/PostOptionsMenu";

const FALLBACK_AVATAR =
  "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg";

export default function ViewPost({ postId, currentUserId, backHref, onBack }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await postService.getByIdCompact(postId);
        const p = res?.data?.post || res?.data || null;
        setPost(p || null);
        setHashtags(res?.data?.hashtags || []);

        if (res?.data?.comments) {
          setCommentCount(
            Array.isArray(res.data.comments) ? res.data.comments.length : 0
          );
        } else {
          const countRes = await post_commentServices.countCommentByPost(postId);
          if (countRes?.status === "ok")
            setCommentCount(Number(countRes.data?.count || 0));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  useEffect(() => {
    if (!postId || !showComments) return;
    (async () => {
      try {
        const res = await post_commentServices.countCommentByPost(postId);
        if (res?.status === "ok")
          setCommentCount(Number(res.data?.count || 0));
      } catch {}
    })();
  }, [postId, showComments]);

  if (loading) return <div className="p-6 text-gray-400">Đang tải post…</div>;
  if (!post) return <div className="p-6 text-red-400">Không tìm thấy dữ liệu post.</div>;

  const {
    title,
    file_url,
    banner_url,
    content,
    album_name,
    category_name,
    full_name,
    avatar_url,
    summary,
    post_id,
  } = post;

  const effectivePostId = postId || post_id;

  const safeTitle = title || "Chưa có dữ liệu";
  const safeAlbum = album_name || "Chưa có dữ liệu";
  const safeCategory = category_name || "Chưa có dữ liệu";
  const safeSummary = summary || "Chưa có dữ liệu";
  const safeAuthor = {
    name: full_name || "Chưa có dữ liệu",
    avatar: avatar_url || FALLBACK_AVATAR,
  };

  const isPdf = (url) =>
    typeof url === "string" && url.toLowerCase().trim().endsWith(".pdf");

  const main = (
    <div className={`${css.card} min-h-[420px]`}>
      {/* Style riêng cho vùng hiển thị nội dung WORD */}
      <style>{`
        /* Khung "trang giấy" */
        .viewer-page {
          background: #0f172a;           /* tối nhẹ khác nền */
          border: 1px solid #2d2d33;
          border-radius: 12px;
          padding: 28px;
          max-width: 720px;              /* độ rộng đọc tốt ~A4 */
          margin-left: auto;
          margin-right: auto;
        }
        /* Typography cơ bản, mặc định canh trái */
        .viewer-content { 
          color: #e5e7eb;
          text-align: left;
          line-height: 1.8;
          font-size: 1rem;
        }
        .viewer-content h1, .viewer-content h2, .viewer-content h3 {
          font-weight: 700;
          line-height: 1.25;
          margin: 0.8em 0 0.4em;
        }
        .viewer-content h1 { font-size: 1.75rem; }
        .viewer-content h2 { font-size: 1.4rem; }
        .viewer-content h3 { font-size: 1.2rem; }

        .viewer-content p { margin: 0.7em 0; }
        .viewer-content a { color: #93c5fd; text-decoration: underline; }
        .viewer-content img { max-width: 100%; height: auto; border-radius: 6px; }
        .viewer-content ul, .viewer-content ol { margin: 0.6em 0 0.6em 1.25em; }
        .viewer-content li { margin: 0.25em 0; }

        .viewer-content blockquote {
          border-left: 4px solid rgba(255,255,255,0.15);
          padding-left: 0.9rem;
          margin: 0.9rem 0;
          color: #d1d5db;
          font-style: italic;
        }
        .viewer-content code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          background: rgba(255,255,255,0.08);
          padding: 0.15rem 0.35rem;
          border-radius: 0.3rem;
        }
        .viewer-content pre {
          background: rgba(255,255,255,0.08);
          padding: 0.9rem 1rem;
          border-radius: 0.6rem;
          overflow-x: auto;
          margin: 0.9rem 0;
        }
        .viewer-content pre code { background: transparent; padding: 0; }

        /* Map các class của Quill để canh lề đúng */
        .viewer-content .ql-align-center { text-align: center; }
        .viewer-content .ql-align-right { text-align: right; }
        .viewer-content .ql-align-justify { text-align: justify; }

        /* Size của Quill */
        .viewer-content .ql-size-small { font-size: 0.9em; }
        .viewer-content .ql-size-large { font-size: 1.25em; }
        .viewer-content .ql-size-huge  { font-size: 1.5em; }

        /* Thụt đầu dòng của Quill */
        ${Array.from({length: 9}).map((_,i)=>`.viewer-content .ql-indent-${i+1}{ margin-left: ${(i+1)*1.5}rem; }`).join("\n")}
      `}</style>

      {/* Header actions */}
      <div className="p-4 flex items-center gap-2">
        {backHref ? (
          <a
            href={typeof backHref === "string" ? backHref : "#"}
            onClick={(e) => {
              if (backHref === -1) {
                e.preventDefault();
                window.history.back();
              }
            }}
            className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20"
          >
            Quay lại
          </a>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20"
          >
            Quay lại
          </button>
        )}

        <div className="ml-auto">
          <PostOptionsMenu
            postId={effectivePostId}
            onReport={() => alert("Report chưa triển khai.")}
          />
        </div>
      </div>

      {/* Nội dung */}
      {file_url ? (
        isPdf(file_url) ? (
          <div className="w-full h-[70vh]">
            <embed
              src={`${file_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              type="application/pdf"
              width="100%"
              height="100%"
              className="rounded-md"
            />
          </div>
        ) : (
          <img
            src={file_url || banner_url}
            alt={safeTitle}
            className="w-full h-auto object-contain rounded-md"
          />
        )
      ) : content ? (
        <div className="px-4 pb-6">
          {/* khung trang + nội dung */}
          <div className="viewer-page">
            <div
              className="viewer-content prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-[420px] grid place-items-center text-gray-400">
          Chưa có dữ liệu
        </div>
      )}

      {/* Bình luận */}
      {effectivePostId ? (
        <div className="p-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowComments((s) => !s)}
            className={`ml-auto px-3 py-1.5 text-sm rounded-lg transition ${
              showComments
                ? "bg-fuchsia-600 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            aria-expanded={showComments}
          >
            Bình luận • {commentCount}
          </button>
        </div>
      ) : null}
    </div>
  );

  const right = (
    <>
      <div className={`${css.card} p-5`}>
        <h2 className="text-base font-semibold mb-3">Thông tin post</h2>
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <span className="text-gray-400">Album:</span> {safeAlbum}
          </p>
          <p>
            <span className="text-gray-400">Category:</span> {safeCategory}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {hashtags?.length ? (
              hashtags.map((h) => (
                <span
                  key={h.hashtag_id || `${h.hashtag_name}-${Math.random()}`}
                  className="bg-white/10 text-xs px-2 py-0.5 rounded"
                >
                  #{h.hashtag_name}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">
                Hashtags: Chưa có dữ liệu
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`${css.card} p-5`}>
        <h2 className="text-base font-semibold mb-3">Thông tin tác giả</h2>
        <div className="flex items-center gap-3">
          <img
            src={safeAuthor.avatar}
            alt={safeAuthor.name}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-medium">{safeAuthor.name}</p>
          </div>
        </div>
      </div>

      <div className={`${css.card} p-5`}>
        <h2 className="text-base font-semibold mb-2">Tóm tắt</h2>
        <p className="text-sm text-gray-300">{safeSummary}</p>
      </div>
    </>
  );

  const comments =
    showComments && effectivePostId ? (
      <CommentsPanel
        postId={effectivePostId}
        currentUserId={currentUserId}
        initialCount={commentCount}
        onCountChange={(n) => setCommentCount(n)}
      />
    ) : null;

  return (
    <PostLayout title={safeTitle} main={main} comments={comments} right={right} />
  );
}
