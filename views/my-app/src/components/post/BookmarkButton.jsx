// src/components/post/BookmarkButton.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { bookmarkService } from "../../services/bookmarkService";

export default function BookmarkButton({
  postId,
  initiallyBookmarked = false,
  onChange,
  className = "",
}) {
  const [bookmarked, setBookmarked] = useState(!!initiallyBookmarked);
  const [loading, setLoading] = useState(false);

  // ✅ Sync state khi prop thay đổi (vd: reload/trang khác quay lại)
  useEffect(() => {
    setBookmarked(!!initiallyBookmarked);
  }, [initiallyBookmarked]);

  async function handleClick() {
    if (!postId || loading) return;
    const next = !bookmarked;

    setLoading(true);
    setBookmarked(next);         // optimistic
    onChange?.(next, postId);

    try {
      const res = next
        ? await bookmarkService.add({ post_id: postId })
        : await bookmarkService.remove({ post_id: postId });

      // ✅ Kiểm tra kết quả BE (bookmarkService đã chuẩn hoá {ok, raw})
      if (!res?.ok) {
        // rollback
        setBookmarked(!next);
        onChange?.(!next, postId);
        console.error("[Bookmark] Server rejected:", res?.raw || res);
        return;
      }

      if (next) console.log("Đã lưu:", postId);
    } catch (err) {
      console.error("Bookmark error:", err);
      // rollback khi lỗi mạng/exception
      setBookmarked(!next);
      onChange?.(!next, postId);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !postId;

  return (
    <button
      type="button"
      aria-label={bookmarked ? "Unbookmark" : "Bookmark"}
      aria-pressed={bookmarked}
      aria-busy={loading}
      disabled={disabled}
      onClick={handleClick}
      className={[
        "text-gray-400 hover:text-white transition-colors",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      title={bookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}
    >
      {loading ? (
        <i className="fa-solid fa-spinner animate-spin"></i>
      ) : bookmarked ? (
        <i className="fa-solid fa-bookmark"></i>
      ) : (
        <i className="fa-regular fa-bookmark"></i>
      )}
    </button>
  );
}

BookmarkButton.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initiallyBookmarked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
};
