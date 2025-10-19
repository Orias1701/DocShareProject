// src/pages/my-posts/MyPostsPage.jsx
import React, { useEffect, useState } from "react";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";
import bookmarkService from "../../services/bookmarkService";

export default function MyPostsPage() {
  // -------- STATE CHÍNH --------
  const [sections, setSections] = useState([]); // Danh sách nhóm bài viết (theo album)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -------- CHUYỂN DỮ LIỆU VỀ DẠNG DỄ HIỂU --------
  function convertPost(post) {
    if (!post) return null;

    return {
      id: post.post_id,
      post_id: post.post_id,
      title: post.title || "Không có tiêu đề",
      authorName: post.author_name || "Tôi",
      authorAvatar:
        post.avatar_url ||
        post.author_avatar ||
        "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
      author: {
        id: post.user_id,
        name: post.author_name || "Tôi",
        avatar:
          post.avatar_url ||
          post.author_avatar ||
          "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg",
      },
      uploadTime: post.created_at,
      banner: post.banner_url || null,
      file: post.file_url ? { url: post.file_url, type: post.file_type || "" } : null,
      hashtags: post.hashtags,
      stats: {
        likes: post.reaction_count || 0,
        comments: post.comment_count || 0,
        views: post.view_count || 0,
      },
      album_id: post.album_id,
      album_name: post.album_name,
      category_id: post.category_id,
      category_name: post.category_name,
      is_bookmarked: !!post.is_bookmarked,
      user_id: post.user_id,
      created_at: post.created_at,
    };
  }

  // -------- TẢI DANH SÁCH BÀI VIẾT --------
  useEffect(() => {
    async function fetchMyPosts() {
      setLoading(true);
      setError(null);

      try {
        // Lấy dữ liệu từ 2 API
        const [postList, bookmarks] = await Promise.all([
          postService.listMyPosts(),
          bookmarkService.list(),
        ]);

        // Tạo danh sách ID bài đã bookmark
        const bookmarkedIds = new Set(
          (bookmarks || []).map((b) => b.post_id ?? b.id).filter(Boolean)
        );

        // Gom các bài viết theo album
        const grouped = new Map();

        (postList || []).forEach((p) => {
          const albumKey = p.album_id || "__no_album__";
          const albumName = p.album_name || "Chưa có album";

          if (!grouped.has(albumKey)) {
            grouped.set(albumKey, { title: albumName, posts: [] });
          }

          const postCard = convertPost(p);
          if (!postCard) return;

          // Đánh dấu nếu bài đã bookmark
          postCard.is_bookmarked =
            typeof p.is_bookmarked === "boolean"
              ? p.is_bookmarked
              : bookmarkedIds.has(p.post_id);

          grouped.get(albumKey).posts.push(postCard);
        });

        // Sắp xếp bài trong từng album (mới nhất ở trên)
        grouped.forEach((group) => {
          group.posts.sort(
            (a, b) => new Date(b.uploadTime) - new Date(a.uploadTime)
          );
        });

        // Chuyển Map → Array + sắp xếp album theo bài mới nhất
        const sortedAlbums = Array.from(grouped.values()).sort(
          (a, b) =>
            new Date(b.posts[0]?.uploadTime || 0) -
            new Date(a.posts[0]?.uploadTime || 0)
        );

        setSections(sortedAlbums);
      } catch (err) {
        console.error(err);
        setError(err.message || "Không thể tải bài viết của bạn.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyPosts();
  }, []);

  // -------- CẬP NHẬT BOOKMARK --------
  function handleBookmarkChange(nextState, postId) {
    setSections((oldSections) =>
      oldSections.map((album) => ({
        ...album,
        posts: album.posts.map((p) =>
          (p.post_id || p.id) === postId
            ? { ...p, is_bookmarked: nextState }
            : p
        ),
      }))
    );
  }

  // -------- XOÁ BÀI VIẾT --------
  function handleDeleted(deletedId) {
    setSections((oldSections) =>
      oldSections
        .map((album) => ({
          ...album,
          posts: album.posts.filter(
            (p) => String(p.post_id ?? p.id) !== String(deletedId)
          ),
        }))
        .filter((album) => album.posts.length > 0)
    );
  }

  // -------- SỬA BÀI VIẾT --------
  function handleEdited(updatedPost) {
    setSections((oldSections) => {
      const newAlbumId = updatedPost.album_id || "__no_album__";
      const newAlbumName = updatedPost.album_name || "Chưa có album";
      const postId = String(updatedPost.post_id);

      // Tìm bài cũ trong danh sách
      let oldAlbumIndex = -1;
      let oldPostIndex = -1;
      let oldPost = null;

      oldSections.forEach((album, albumIndex) => {
        const idx = album.posts.findIndex(
          (p) => String(p.post_id ?? p.id) === postId
        );
        if (idx !== -1) {
          oldAlbumIndex = albumIndex;
          oldPostIndex = idx;
          oldPost = album.posts[idx];
        }
      });

      if (!oldPost) return oldSections;

      // Gộp dữ liệu cũ + mới
      const mergedPost = {
        ...oldPost,
        ...updatedPost,
        id: updatedPost.post_id,
        post_id: updatedPost.post_id,
        album_id: updatedPost.album_id ?? oldPost.album_id,
        album_name: updatedPost.album_name ?? oldPost.album_name,
      };

      // Tạo bản sao an toàn
      const nextAlbums = oldSections.map((a) => ({
        ...a,
        posts: [...a.posts],
      }));

      const oldAlbumId = oldPost.album_id || "__no_album__";

      // Nếu vẫn cùng album → chỉ cập nhật dữ liệu
      if (oldAlbumId === newAlbumId) {
        nextAlbums[oldAlbumIndex].posts[oldPostIndex] = mergedPost;
        return nextAlbums;
      }

      // Nếu chuyển album khác → xóa khỏi album cũ
      nextAlbums[oldAlbumIndex].posts.splice(oldPostIndex, 1);
      if (nextAlbums[oldAlbumIndex].posts.length === 0)
        nextAlbums.splice(oldAlbumIndex, 1);

      // Thêm vào album mới
      let targetAlbum = nextAlbums.find((a) => a.title === newAlbumName);
      if (!targetAlbum) {
        targetAlbum = { title: newAlbumName, posts: [] };
        nextAlbums.push(targetAlbum);
      }

      targetAlbum.posts.push(mergedPost);
      targetAlbum.posts.sort(
        (a, b) =>
          new Date(b.uploadTime || b.created_at) -
          new Date(a.uploadTime || a.created_at)
      );

      return nextAlbums;
    });
  }

  // -------- GIAO DIỆN --------
  if (loading) {
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          p-4 rounded-lg border
          bg-[rgba(255,0,0,0.1)]
          border-[var(--color-border-strong)]
          text-[var(--color-text)]
        "
      >
        <strong className="text-red-400">Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-12">
        {sections.length === 0 ? (
          <PostSection
            title="Bài viết của tôi"
            posts={[]}
            showAlbum={false}
            emptyText="Bạn chưa có bài viết nào."
          />
        ) : (
          sections.map((album, i) => (
            <PostSection
              key={album.title + i}
              title={album.title}
              posts={album.posts}
              showAlbum={false}
              headerRight={
                <span
                  className="
                    text-xs text-[var(--color-text-muted)]
                    border border-[var(--color-border-soft)]
                    rounded-full px-2 py-0.5
                  "
                >
                  {album.posts.length} bài
                </span>
              }
              onBookmarkChange={handleBookmarkChange}
              onDeleted={handleDeleted}
              onEdited={handleEdited}
            />
          ))
        )}
      </div>
    </div>
  );
}
