import React, { useEffect, useState } from "react";
import postService from "../../../services/postService";
import post_reactionService from "../../../services/post_reactionService";

export default function PostInfoPanel({ postId }) {
  const [post, setPost] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      postService.getByIdCompact(postId).catch(() => null),
      post_reactionService.count(postId).catch(() => null),
    ])
      .then(([detailRes, reactRes]) => {
        const detail = detailRes?.data?.post || detailRes?.post || detailRes;
        setPost(detail || null);
        setHashtags(detailRes?.data?.hashtags ?? []);
        const likes = reactRes?.data?.total_likes ?? 0;
        const dislikes = reactRes?.data?.total_dislikes ?? 0;
        setCounts({ likes, dislikes });
      })
      .catch(() => setError("Không thể tải thông tin bài viết"))
      .finally(() => setLoading(false));
  }, [postId]);

  const wrapperStyle = {
    background: "var(--color-surface-alt)",
    borderColor: "var(--color-border-soft)",
    color: "var(--color-text)",
  };

  if (loading)
    return (
      <div className="p-6 rounded-xl border animate-pulse" style={wrapperStyle}>
        <div className="space-y-3">
          <div className="h-6 w-2/3 bg-white/10 rounded" />
          <div className="h-4 w-1/2 bg-white/10 rounded" />
          <div className="h-px bg-white/10" />
        </div>
      </div>
    );

  if (error || !post)
    return (
      <div className="p-6 rounded-xl border" style={wrapperStyle}>
        <p style={{ color: "var(--color-text-secondary)" }}>
          {error || "Không có dữ liệu bài viết."}
        </p>
      </div>
    );

  return (
    <div className="p-6 rounded-xl border" style={wrapperStyle}>
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-lg border flex items-center justify-center"
          style={{
            borderColor: "var(--color-border-soft)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--color-text-secondary)",
          }}
        >
          <i className="fa-regular fa-file-lines" />
        </div>
        <div>
          <div className="text-lg font-semibold">{post.title || "Untitled"}</div>
          <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            #{postId}
          </div>
        </div>
      </div>

      <div className="mt-4 h-px" style={{ background: "var(--color-border-soft)" }} />

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Overview</h4>
        <ul className="text-sm space-y-2" style={{ color: "var(--color-text-secondary)" }}>
          <li>Author: {post.full_name || "Ẩn danh"}</li>
          <li>Album: {post.album_name || "Không có album"}</li>
          <li>
            Hashtags:{" "}
            {hashtags.length > 0
              ? hashtags.map((h) => `#${h.hashtag_name}`).join(", ")
              : "Không có"}
          </li>
          <li>Created: {post.created_at || "—"}</li>
        </ul>
      </div>

      <div className="mt-4 h-px" style={{ background: "var(--color-border-soft)" }} />

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Reactions</h4>
        <div className="flex gap-6 text-sm">
          <span>👍 Likes: {counts.likes}</span>
          <span>👎 Dislikes: {counts.dislikes}</span>
        </div>
      </div>
    </div>
  );
}
