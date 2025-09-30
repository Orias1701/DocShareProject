import React from "react";

export const css = {
  wrap: "min-h-screen bg-[#0D1117] text-white",
  card: "bg-[#0F172A] rounded-lg border border-white/10",
  soft: "rounded-lg border border-white/10",
};

/**
 * API cũ:  <PostLayout title left right footer />
 * API mới: <PostLayout title main comments right footer />
 * - Nếu có `left` => dùng nguyên xi (giữ tương thích ngược).
 * - Nếu không có `left` nhưng có `main` => hiển thị `main`, rồi đến `comments` (nếu có).
 */
export default function PostLayout({ title, left, main, comments, right, footer }) {
  return (
    <div className={css.wrap}>
      <div className="px-4 lg:px-8 pt-4">
        <h1 className="text-[18px] md:text-[20px] font-bold text-center">
          {title || "Post title"}
        </h1>
      </div>

      <div className="container mx-auto p-4 lg:p-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {left ? left : (<>{main}{comments ? <div className="mt-6">{comments}</div> : null}</>)}
          </div>

          {/* ↓ thêm text-sm ở đây */}
          <aside className="lg:col-span-1 space-y-5 text-sm">
            {right}
          </aside>
        </section>

        {footer ? <div className="mt-8">{footer}</div> : null}
      </div>
    </div>
  );
}
