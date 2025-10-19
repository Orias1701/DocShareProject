import React, { useEffect, useMemo, useState } from "react";
import postService from "../../../services/postService";
import post_reactionService from "../../../services/post_reactionService";

/**
 * PostInfoPanel
 * - Ưu tiên hiển thị ngay từ prop `post`.
 * - Nếu không có `post` nhưng có `postId` => mới gọi API lấy compact detail.
 * - Reactions (likes/dislikes) sẽ gọi API nhẹ theo postId (nếu có).
 */
export default function PostInfoPanel({ post: postProp, postId: postIdProp }) {
  const [post, setPost] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  // Chuẩn hoá dữ liệu truyền vào
  const normalizedFromProp = useMemo(() => {
    if (!postProp) return null;
    return {
      id: postProp.id || postProp.post_id || postIdProp,
      title: postProp.title || postProp.summary || "Untitled",
      full_name: postProp.authorName || postProp.full_name,
      album_name: postProp.albumName || postProp.album_name,
      created_at: postProp.uploadTime || postProp.created_at,
      hashtags: Array.isArray(postProp.hashtags) ? postProp.hashtags : [],
    };
  }, [postProp, postIdProp]);

  // Lấy chi tiết bài viết
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setError(null);

      if (normalizedFromProp) {
        if (mounted) {
          setPost({
            title: normalizedFromProp.title,
            full_name: normalizedFromProp.full_name,
            album_name: normalizedFromProp.album_name,
            created_at: normalizedFromProp.created_at,
            id: normalizedFromProp.id,
          });
          setHashtags(
            normalizedFromProp.hashtags.map((h) =>
              typeof h === "string"
                ? { hashtag_name: h.replace(/^#/, "") }
                : h
            )
          );
        }
        return;
      }

      if (!postIdProp) {
        setPost(null);
        return;
      }

      try {
        setLoadingDetail(true);
        const detailRes = await postService.getByIdCompact(postIdProp);
        const detail = detailRes?.data?.post || detailRes?.post || detailRes;
        if (mounted) {
          setPost(detail || null);
          const hs = detailRes?.data?.hashtags ?? [];
          setHashtags(hs);
        }
      } catch {
        if (mounted) setError("Không thể tải thông tin bài viết");
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [normalizedFromProp, postIdProp]);

  // Lấy lượt like/dislike
  useEffect(() => {
    let mounted = true;
    const pid = normalizedFromProp?.id || postIdProp || post?.post_id || post?.id;
    if (!pid) {
      setCounts({ likes: 0, dislikes: 0 });
      return;
    }

    post_reactionService
      .count(pid)
      .then((reactRes) => {
        if (!mounted) return;
        const likes =
          reactRes?.data?.total_likes ??
          reactRes?.total_likes ??
          reactRes?.data?.likes ??
          0;

        const dislikes =
          reactRes?.data?.total_dislikes ??
          reactRes?.total_dislikes ??
          reactRes?.data?.dislikes ??
          0;

        setCounts({ likes, dislikes });
      })
      .catch(() => {
        if (mounted) setCounts({ likes: 0, dislikes: 0 });
      });

    return () => {
      mounted = false;
    };
  }, [normalizedFromProp?.id, postIdProp, post?.post_id, post?.id]);

  const wrapperStyle = {
    background: "var(--color-card-bg)",
    borderColor: "var(--color-card-border)",
    color: "var(--color-text)",
  };

  // Khi đang loading
  if (loadingDetail && !normalizedFromProp) {
    return (
      <div className="p-6 rounded-xl border animate-pulse" style={wrapperStyle}>
        <div className="space-y-3">
          <div className="h-6 w-2/3 bg-white/10 rounded" />
          <div className="h-4 w-1/2 bg-white/10 rounded" />
          <div className="h-px bg-white/10" />
        </div>
      </div>
    );
  }

  // Khi lỗi
  if (error || !post) {
    return (
      <div className="p-6 rounded-xl border" style={wrapperStyle}>
        <p style={{ color: "var(--color-text-secondary)" }}>
          {error || "Không có dữ liệu bài viết."}
        </p>
      </div>
    );
  }

  const title = post.title || "Untitled";
  const author = post.full_name || "Ẩn danh";
  const album = post.album_name || "Không có album";
  const pid = normalizedFromProp?.id || postIdProp || post?.post_id || post?.id;

  // ----------------- JSX Render -----------------
  return (
    <div className="p-6 rounded-xl border text-left" style={wrapperStyle}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-lg border flex items-center justify-center"
          style={{
            borderColor: "var(--color-border-soft)",
            background: "var(--color-muted-bg)",
            color: "var(--color-text-secondary)",
          }}
        >
          <i className="fa-regular fa-file-lines" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold leading-snug">
            {title}
          </div>
          <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            #{pid}
          </div>
        </div>
      </div>

      <div className="mt-4 h-px" style={{ background: "var(--color-border-soft)" }} />

      {/* Overview */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Overview</h4>
        <dl className="text-sm grid grid-cols-[110px_1fr] gap-y-2 items-start">
          <dt className="text-[color:var(--color-text-muted)]">Author:</dt>
          <dd style={{ color: "var(--color-text)" }}>{author}</dd>

          <dt className="text-[color:var(--color-text-muted)]">Album:</dt>
          <dd style={{ color: "var(--color-text)" }}>{album}</dd>

          <dt className="text-[color:var(--color-text-muted)]">Hashtags:</dt>
          <dd>
            {hashtags?.length ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((h, i) => (
                  <span
                    key={h.hashtag_id || i}
                    className="px-2 py-0.5 rounded-md border text-xs"
                    style={{
                      borderColor: "var(--color-border-soft)",
                      color: "var(--color-text)",
                    }}
                  >
                    #{h.hashtag_name || String(h).replace(/^#/, "")}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: "var(--color-text-muted)" }}>Không có</span>
            )}
          </dd>

          <dt className="text-[color:var(--color-text-muted)]">Created:</dt>
          <dd style={{ color: "var(--color-text)" }}>
            {post.created_at || "—"}
          </dd>
        </dl>
      </div>

      <div className="mt-4 h-px" style={{ background: "var(--color-border-soft)" }} />

      {/* Reactions */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Reactions</h4>
        <dl className="text-sm grid grid-cols-[110px_1fr] gap-y-2 items-start">
          <dt className="text-[color:var(--color-text-muted)]">Likes:</dt>
          <dd style={{ color: "var(--color-text)" }}>
            <span className="inline-flex items-center gap-2">
              <i className="fa-regular fa-thumbs-up" />
              {counts.likes}
            </span>
          </dd>

          <dt className="text-[color:var(--color-text-muted)]">Dislikes:</dt>
          <dd style={{ color: "var(--color-text)" }}>
            <span className="inline-flex items-center gap-2">
              <i className="fa-regular fa-thumbs-down" />
              {counts.dislikes}
            </span>
          </dd>
        </dl>
      </div>
    </div>
  );
}
