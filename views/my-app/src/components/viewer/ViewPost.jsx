// src/components/post/ViewPost.jsx
import React, { useEffect, useState } from "react";
import PostLayout, { css } from "./ViewLayout";
import CommentsPanel from "../comments/CommentsPanel";
import postService from "../../services/postService";
import post_commentServices from "../../services/post_commentServices";

const FALLBACK_AVATAR =
  "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg";

export default function ViewPost({ postId, currentUserId, backHref, onBack }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false); // 🔹 toggle

  // load post + hashtags + comment count (nếu BE chưa trả mảng comments)
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        setLoading(true);

        const res = await postService.getByIdCompact(postId);
        const p = res?.data?.post || res?.data || null;

        // === Debug log toàn bộ data nhận từ API ===
        console.group("🔎 API DEBUG ViewPost");
        console.log("Full API response:", res);
        console.log("res.data:", res?.data);
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

  // mỗi lần mở khung bình luận thì làm tươi count một nhịp (giống PostCardProfile)
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

  if (loading)
    return <div className="p-6 text-gray-400">Đang tải post…</div>;
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
  } = post;

  // 🔎 Debug log ngay trước khi render
  console.log("👉 FE render file_url:", file_url);

  // fallback hiển thị
  const safeTitle = title || "Chưa có dữ liệu";
  const safeAlbum = album_name || "Chưa có dữ liệu";
  const safeCategory = category_name || "Chưa có dữ liệu";
  const safeSummary = summary || "Chưa có dữ liệu";
  const safeAuthor = {
    name: full_name || "Chưa có dữ liệu",
    avatar: avatar_url || FALLBACK_AVATAR,
  };

  // ==== MAIN (nội dung + thanh hành động bên dưới) ====
  const main = (
    <div className={`${css.card} min-h-[420px]`}>
        {file_url ? (
        file_url.toLowerCase().endsWith(".pdf") ? (
          // 🟢 PDF viewer
          <div className="w-full h-[70vh]">   {/* cao ~70% viewport cho thoáng */}
            <iframe
              src={`${file_url}#toolbar=1&navpanes=0&scrollbar=1`}
              title="PDF Viewer"
              className="w-full h-full rounded-md"
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

      {/* Action bar */}
      <div className="p-4 flex items-center gap-2">
        {file_url ? (
          <>
            {/* 🔎 Debug log trong thẻ <a> */}
            {console.log("👉 Link Mở bản gốc dùng file_url:", file_url)}
            <a
              href={file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/20"
            >
              Mở bản gốc
            </a>
          </>
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

        {postId ? (
          <button
            type="button"
            onClick={() => setShowComments((s) => !s)}
            className={`ml-auto px-3 py-1.5 text-sm rounded-lg transition
              ${
                showComments
                  ? "bg-fuchsia-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            aria-expanded={showComments}
          >
            Bình luận • {commentCount}
          </button>
        ) : null}
      </div>
    </div>
  );

  // ==== SIDEBAR PHẢI ====
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
                  key={h.hashtag_id}
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
    showComments && postId ? (
      <CommentsPanel
        postId={postId}
        currentUserId={currentUserId}
        initialCount={commentCount}
        onCountChange={(n) => setCommentCount(n)}
      />
    ) : null;

  return (
    <PostLayout title={safeTitle} main={main} comments={comments} right={right} />
  );
}
