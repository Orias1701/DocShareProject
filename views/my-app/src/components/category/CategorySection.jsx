import React from "react";
import PostCard from "../leaderboard/PostCard";

/**
 * Hiển thị 1 Category + danh sách bài viết trong đó
 */
export default function CategorySection({ title, posts = [] }) {
  return (
    <section className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)] text-start">
        {title}
      </h2>

      {posts.length === 0 ? (
        <div
          className="
            text-start text-[var(--color-text-muted)]
            border border-dashed border-[var(--color-border-soft)]
            rounded-xl py-10
          "
        >
          Chưa có bài viết.
        </div>
      ) : (
        <div
          className="
            grid gap-5
            grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
          "
        >
          {posts.map((post, i) => (
            <PostCard key={`${post.id ?? title}-${i}`} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
