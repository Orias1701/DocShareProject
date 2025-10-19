import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { bookmarkService } from "../../services/bookmarkService";

/**
 * Nút lưu / bỏ lưu bài viết (bookmark)
 */
export default function BookmarkButton({
  postId,
  initiallyBookmarked = false,
  onChange,
  className = "",
}) {
  const [bookmarked, setBookmarked] = useState(!!initiallyBookmarked);
  const [loading, setLoading] = useState(false);

  // Đồng bộ lại trạng thái khi prop thay đổi
  useEffect(() => {
    setBookmarked(!!initiallyBookmarked);
  }, [initiallyBookmarked]);

  // Hàm xử lý khi người dùng nhấn nút
  async function handleClick() {
    if (!postId || loading) return;
    const next = !bookmarked;

    setLoading(true);
    setBookmarked(next); // cập nhật nhanh (optimistic UI)
    onChange?.(next, postId);

    try {
      const res = next
        ? await bookmarkService.add({ post_id: postId })
        : await bookmarkService.remove({ post_id: postId });

      if (!res?.ok) {
        // rollback khi thất bại
        setBookmarked(!next);
        onChange?.(!next, postId);
        console.error("[Bookmark] Lỗi phản hồi:", res?.raw || res);
        return;
      }
    } catch (err) {
      console.error("Bookmark error:", err);
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
      disabled={disabled}
      onClick={handleClick}
      className={[
        "transition-colors",
        "text-[var(--color-icon-default)] hover:text-[var(--color-icon-hover)] active:text-[var(--color-icon-active)]",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      title={bookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}
    >
      {loading ? (
        <i className="fa-solid fa-spinner animate-spin"></i>
      ) : bookmarked ? (
        <i className="fa-solid fa-bookmark text-[var(--color-accent)]"></i>
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
