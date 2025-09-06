import React from "react";

/** Nút action nhỏ (icon + count) */
const CardAction = ({ icon, count, label }) => (
  <button
    className="flex items-center gap-1.5 text-gray-400 hover:text-white cursor-pointer transition-colors"
    aria-label={label}
    type="button"
  >
    <i className={icon} aria-hidden="true"></i>
    {count !== undefined && (
      <span className="text-sm font-medium">{count}</span>
    )}
  </button>
);

/** Thẻ post */
export default function PostCard({ post }) {
  const {
    authorAvatar,
    authorName,
    title,
    hashtags = [],
    uploadTime,
    sourceName,
    sourceIcon,
    stats = {},
  } = post || {};

  return (
    <article className="bg-[#1C2028] rounded-xl p-4 border border-gray-700/80 flex flex-col gap-3 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={authorAvatar}
            alt={authorName ? `Avatar của ${authorName}` : "Avatar"}
            className="w-6 h-6 rounded-full flex-shrink-0"
          />
          <span className="text-sm font-semibold truncate">{authorName}</span>
        </div>
        <button
          className="text-gray-400 hover:text-white"
          aria-label="Mở menu bài viết"
          type="button"
        >
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>

      {/* Body */}
      <div className="flex-grow">
        {/* Giới hạn đúng 3 dòng tiêu đề */}
        <p className="text-base leading-snug line-clamp-3 whitespace-pre-line">
          {title}
        </p>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {hashtags.map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                className="text-xs text-sky-400 bg-sky-900/40 px-2 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {uploadTime && (
          <p className="text-xs text-gray-500 mt-2">{uploadTime}</p>
        )}
      </div>

      {/* Nguồn */}
      <div className="bg-white text-black p-4 rounded-lg flex items-center justify-between text-lg">
        <span className="font-semibold truncate">{sourceName}</span>
        <img
          src={sourceIcon}
          alt={sourceName ? `Icon ${sourceName}` : "Source icon"}
          className="w-8 h-8"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700/50 mt-2">
        <div className="flex items-center gap-4">
          <CardAction
            icon="fa-regular fa-heart"
            count={stats.likes}
            label="Thích"
          />
          <CardAction
            icon="fa-regular fa-comment"
            count={stats.comments}
            label="Bình luận"
          />
          <CardAction icon="fa-regular fa-paper-plane" label="Chia sẻ" />
        </div>
        <CardAction icon="fa-regular fa-bookmark" label="Lưu" />
      </div>
    </article>
  );
}
