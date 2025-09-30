// src/components/post/ViewPost.jsx
import React, { useEffect, useState } from "react";
import PostLayout, { css } from "./ViewLayout";
import CommentsPanel from "../comments/CommentsPanel";
import postService from "../../services/postService";
import post_commentServices from "../../services/post_commentServices";
import PostOptionsMenu from "../post/PostOptionsMenu";

const FALLBACK_AVATAR =
  "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function ViewPost({ postId, currentUserId, backHref, onBack }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  // Load post + hashtags + comment count
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        setLoading(true);

        const res = await postService.getByIdCompact(postId);
        const p = res?.data?.post || res?.data || null;

        console.group("🔎 API DEBUG ViewPost");
        console.log("Full API response:", res);
        console.log("Post object (p):", p);
        console.log("API file_url:", p?.file_url);
        console.groupEnd();

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

  // Refresh count khi mở bình luận
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
  if (!post)
    return <div className="p-6 text-red-400">Không tìm thấy dữ liệu post.</div>;

  const {
    title,
    file_url,
    file_type,
    banner_url,
    content,
    album_name,
    category_name,
    full_name,
    avatar_url,
    summary,
    post_id, // phòng trường hợp BE trả kèm trong object post
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

  // === Handler: tải tài liệu qua BE ===
  const handleDownload = () => {
    if (!effectivePostId) {
      alert("Không xác định được post_id để tải.");
      return;
    }
    // Endpoint PHP: ?action=post.download&post_id=...
    const url = `${API_BASE}/index.php?action=post.download&post_id=${encodeURIComponent(
      effectivePostId
    )}`;

    // Mở tab mới để trình duyệt tự tải; hoặc dùng window.location.href nếu muốn tải trong tab hiện tại
    window.open(url, "_blank");
  };

  // === MAIN ===
  const main = (
    <div className={`${css.card} min-h-[420px]`}>
      {/* Thanh tác vụ góc phải */}
      <div className="p-4 flex items-center gap-2">
        {file_url ? (
          <a
            href={file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20"
            title="Mở bản gốc"
          >
            Mở bản gốc
          </a>
        ) : null}

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

        {/* Menu tuỳ chọn (Report / Tải) */}
        <div className="ml-auto">
          <PostOptionsMenu
            onReport={() => {
              // TODO: mở modal report
              alert("Report chưa triển khai.");
            }}
            onDownload={handleDownload}
          />
        </div>
      </div>

      {/* Vùng preview nội dung */}
      {file_url ? (
        file_url.toLowerCase().endsWith(".pdf") ? (
          // PDF preview (ẩn toolbar của viewer trình duyệt bằng hash; có thể không đồng nhất mọi browser)
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
        <div
          className="p-4 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="w-full h-[420px] grid place-items-center text-gray-400">
          Chưa có dữ liệu
        </div>
      )}

      {/* Thanh hành động (bình luận) */}
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

  // === SIDEBAR PHẢI ===
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
