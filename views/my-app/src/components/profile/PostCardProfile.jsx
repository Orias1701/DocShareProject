import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ReactionThumbs from "../post/ReactionThumbs";

const FALLBACK_IMG =
  "https://i.pinimg.com/736x/18/bd/a5/18bda5a4616cd195fe49a9a32dbab836.jpg";

export default function PostCardProfile({ post = {} }) {
  const author = {
    id: post?.author?.id ?? post?.author_id ?? post?.user_id ?? null,
    realName: post?.author?.realName || "Real name",
    avatar: post?.author?.avatar || FALLBACK_IMG,
  };
  const postDate = post?.postDate || "Post date";
  const mangles = Array.isArray(post?.mangles) ? post.mangles.slice(0, 2) : [];

  const likeCount = Number(post?.reactionCounts?.like ?? post?.reaction_like_count ?? 0);
  const dislikeCount = Number(post?.reactionCounts?.dislike ?? post?.reaction_dislike_count ?? 0);
  const commentCount = Number(post?.commentCount ?? 0) || 0;
  const myReaction =
    post?.my_reaction === "like" || post?.my_reaction === "dislike"
      ? post.my_reaction
      : null;
  const postId = post?.post_id ?? post?.id ?? null;

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
                    )}&title=${encodeURIComponent(m?.title || "")}`}
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
                    {m?.description || "Post description"}
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

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Comments</span>
          <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-500" />
          <span className="text-gray-300">{commentCount}</span>
        </div>
      </div>
    </div>
  );
}

PostCardProfile.propTypes = {
  post: PropTypes.object,
};
