// src/components/profile/PostCardProfile.jsx
// Card bài viết trong trang hồ sơ.
// - Sử dụng local state để hiển thị tức thì sau khi Edit.
// - Khi Report toggle: cập nhật local + báo lên cha lưu vào danh sách.
// - Khi Delete: ẩn card + báo cha filter khỏi danh sách.

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import ReactionThumbs from "../post/ReactionThumbs";
import CommentsPanel from "../comments/CommentsPanel";
import useAuth from "../../hook/useAuth";
import post_commentServices from "../../services/post_commentServices";

import PostOptionsMenu from "../post/PostOptionsMenu";

const FALLBACK_IMG =
  "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

export default function PostCardProfile({ post = {}, onEdited, onDeleted, onReportChange }) {
  const [hidden, setHidden] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  // Đồng bộ khi props.post thay đổi (do cha merge hoặc re-fetch)
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  // Lấy user đăng nhập để đưa xuống CommentsPanel
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || null;

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(
    Number(localPost?.commentCount ?? localPost?.comment_count ?? 0)
  );

  // Bóc dữ liệu hiển thị
  const author = {
    id:
      localPost?.author?.id ??
      localPost?.author_id ??
      localPost?.user_id ??
      null,
    realName:
      localPost?.author?.realName || localPost?.author_name || "Real name",
    avatar: localPost?.author?.avatar || localPost?.avatar_url || FALLBACK_IMG,
  };
  const postDate = localPost?.postDate || localPost?.created_at || "Post date";
  const mangles = Array.isArray(localPost?.mangles)
    ? localPost.mangles.slice(0, 2)
    : [];

  const likeCount = Number(
    localPost?.reactionCounts?.like ?? localPost?.reaction_like_count ?? 0
  );
  const dislikeCount = Number(
    localPost?.reactionCounts?.dislike ?? localPost?.reaction_dislike_count ?? 0
  );
  const myReaction =
    localPost?.my_reaction === "like" || localPost?.my_reaction === "dislike"
      ? localPost.my_reaction
      : null;

  const postId = localPost?.post_id ?? localPost?.id ?? null;

  // Bỏ thẻ HTML cho mô tả ngắn
  function stripHtmlTags(html) {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Lấy count thực tế
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!postId) return;
      try {
        const res = await post_commentServices.countCommentByPost(postId);
        if (alive && res?.ok) setCommentCount(Number(res.data?.count || 0));
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  // Refresh khi mở khung bình luận
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!postId || !showComments) return;
      try {
        const res = await post_commentServices.countCommentByPost(postId);
        if (alive && res?.ok) setCommentCount(Number(res.data?.count || 0));
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [postId, showComments]);

  // Xoá xong: ẩn card + báo cha
  const handleDeleted = (deletedId) => {
    setHidden(true);
    onDeleted?.(deletedId ?? postId);
  };

  // Sửa xong: cập nhật local + báo cha merge
  const handleEdited = (updated) => {
    setLocalPost((prev) => ({
      ...prev,
      ...updated,
      mangles:
        Array.isArray(prev.mangles) && prev.mangles.length
          ? [
              {
                ...prev.mangles[0],
                title: updated?.title ?? prev.mangles[0]?.title,
                image: updated?.banner_url ?? prev.mangles[0]?.image,
              },
            ]
          : prev.mangles,
    }));
    onEdited?.(updated);
  };

  if (hidden) return null;

  return (
    <div className="bg-[#1f2430] border border-[#2b3240] rounded-2xl p-4 sm:p-5 text-white">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {author.id ? (
            <Link
              to={`/profile/${encodeURIComponent(author.id)}`}
              className="flex items-center gap-3"
            >
              <img
                src={author.avatar || FALLBACK_IMG}
                alt={author.realName}
                className="w-9 h-9 rounded-full object-cover"
                loading="lazy"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
              <div className="leading-tight">
                <div className="font-semibold">{author.realName}</div>
                <div className="text-xs text-gray-400">{postDate}</div>
              </div>
            </Link>
          ) : (
            <>
              <img
                src={author.avatar || FALLBACK_IMG}
                alt={author.realName}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="leading-tight">
                <div className="font-semibold">{author.realName}</div>
                <div className="text-xs text-gray-400">{postDate}</div>
              </div>
            </>
          )}
        </div>

        {/* Menu 3 chấm */}
        <PostOptionsMenu
          postId={postId}
          ownerId={author.id}
          postRaw={localPost}
          onDeleted={handleDeleted}
          onEdited={handleEdited}
          // ✅ truyền trạng thái report ban đầu & callback lên cha
          initialIsReported={Boolean(localPost?.is_reported)}
          onReportChange={(next) => {
            setLocalPost((prev) => ({ ...prev, is_reported: Boolean(next) }));
            onReportChange?.(postId, Boolean(next));
          }}
        />
      </div>

      {/* Mangles */}
      <div className="mt-4 space-y-3">
        {mangles.map((m, idx) => {
          const imgSrc = m?.image || FALLBACK_IMG;
          const imgEl = (
            <div className="w-[56px] h-[56px] rounded-lg overflow-hidden bg-[#2b3240] flex-shrink-0">
              <img
                src={imgSrc}
                alt={m?.title || ""}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
            </div>
          );

          return (
            <div
              key={idx}
              className="bg-[#222834] border border-[#2b3240] rounded-xl px-3 py-3"
            >
              <div className="flex items-center gap-3">
                {m?.fileUrl ? (
                  <Link
                    to={`/viewer/file?url=${encodeURIComponent(
                      m.fileUrl
                    )}&title=${encodeURIComponent(m?.title || "")}${
                      postId ? `&post_id=${encodeURIComponent(postId)}` : ""
                    }`}
                    aria-label="Xem nội dung"
                  >
                    {imgEl}
                  </Link>
                ) : (
                  <Link
                    to={`/viewer/content/${postId}`}
                    className="block"
                    aria-label="Xem post"
                  >
                    {imgEl}
                  </Link>
                )}

                <div className="min-w-0">
                  <div className="text-gray-100 font-semibold truncate">
                    {m?.title || "Post name"}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {stripHtmlTags(m?.description) || "Post description"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <ReactionThumbs
          postId={postId}
          initialCounts={{ like: likeCount, dislike: dislikeCount }}
          initialMyReaction={myReaction}
          autoRefresh={false}
          size="md"
          likeColor="#ec4899"
          dislikeColor="#9ca3af"
        />

        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          className={`px-3 py-1.5 text-sm rounded-lg transition
            ${
              showComments
                ? "bg-fuchsia-600 text-white"
                : "bg-[#2b3240] text-gray-200 hover:bg-[#333a49]"
            }`}
          aria-expanded={showComments}
        >
          Bình luận • {commentCount}
        </button>
      </div>

      {/* Comments */}
      {showComments && postId && (
        <div className="mt-4">
          <CommentsPanel
            postId={postId}
            currentUserId={currentUserId}
            // onCountChange={(n) => setCommentCount(n)} // nếu muốn realtime
          />
        </div>
      )}
    </div>
  );
}

PostCardProfile.propTypes = {
  post: PropTypes.object,
  onEdited: PropTypes.func,         // (updated) => void
  onDeleted: PropTypes.func,        // (postId) => void
  onReportChange: PropTypes.func,   // (postId, nextIsReported) => void
};
