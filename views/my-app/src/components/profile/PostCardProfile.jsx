// src/components/profile/PostCardProfile.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ReactionThumbs from "../post/ReactionThumbs";
import CommentsPanel from "../comments/CommentsPanel";
import useAuth from "../../hook/useAuth"; // ✅ chú ý: hooks/useAuth
import post_commentServices from "../../services/post_commentServices";



const FALLBACK_IMG =
  "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

export default function PostCardProfile({ post = {} }) {
  // Lấy user hiện đang đăng nhập để truyền xuống CommentsPanel
  const { user } = useAuth();
  const currentUserId = user?.user_id || user?.id || null;

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(
    Number(post?.commentCount ?? post?.comment_count ?? 0)
  );

  const author = {
    id: post?.author?.id ?? post?.author_id ?? post?.user_id ?? null,
    realName: post?.author?.realName || post?.author_name || "Real name",
    avatar: post?.author?.avatar || post?.avatar_url || FALLBACK_IMG,
  };
  const postDate = post?.postDate || post?.created_at || "Post date";
  const mangles = Array.isArray(post?.mangles) ? post.mangles.slice(0, 2) : [];

  const likeCount = Number(
    post?.reactionCounts?.like ?? post?.reaction_like_count ?? 0
  );
  const dislikeCount = Number(
    post?.reactionCounts?.dislike ?? post?.reaction_dislike_count ?? 0
  );
  const myReaction =
    post?.my_reaction === "like" || post?.my_reaction === "dislike"
      ? post.my_reaction
      : null;

  const postId = post?.post_id ?? post?.id ?? null;

  // 🔹 Đặt ở trên cùng trong component (trước return)
function stripHtmlTags(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}


  

  // 🔢 Lấy count thực tế từ BE (dùng countCommentByPost)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!postId) return;
      try {
        const res = await post_commentServices.countCommentByPost(postId);
        if (alive && res?.ok) {
          setCommentCount(Number(res.data?.count || 0));
        }
      } catch {
        // giữ nguyên count sẵn có khi lỗi
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  // (Tuỳ chọn) mỗi lần mở khung comment thì refresh count 1 nhịp
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!postId || !showComments) return;
      try {
        const res = await post_commentServices.countCommentByPost(postId);
        if (alive && res?.ok) {
          setCommentCount(Number(res.data?.count || 0));
        }
      } catch {
        // im lặng
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId, showComments]);

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
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
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
        <button className="text-gray-400 hover:text-gray-200" aria-label="More">
          <i className="fa-solid fa-ellipsis" />
        </button>
      </div>

      {/* Mangles (thumbnail + tiêu đề) */}
      <div className="mt-4 space-y-3">
        {mangles.map((m, idx) => {
          const imgSrc = m?.image || FALLBACK_IMG;
          const imgEl = (
            <div className="w-[56px] h-[56px] rounded-lg overflow-hidden bg-[#2b3240] flex-shrink-0">
              <img
                src={imgSrc}
                alt={m?.title || ""}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
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
                  imgEl
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

      {/* Footer: reactions + nút mở bình luận (kèm count) */}
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

      {/* Khung bình luận (toggle) */}
      {showComments && postId && (
        <div className="mt-4">
          <CommentsPanel
            postId={postId}
            currentUserId={currentUserId}
            // Nếu sau này bạn bổ sung onCountChange trong CommentsPanel,
            // có thể bật dòng dưới để cập nhật realtime:
            // onCountChange={(n) => setCommentCount(n)}
          />
        </div>
      )}
    </div>
  );
}

PostCardProfile.propTypes = {
  post: PropTypes.object,
};
