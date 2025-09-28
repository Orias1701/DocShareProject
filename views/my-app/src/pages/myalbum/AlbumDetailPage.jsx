import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostSection from "../../components/post/PostSection";
import postService from "../../services/postService";

export default function AlbumDetailPage() {
  const { albumId } = useParams();   // /albums/:albumId
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!albumId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await postService.getByAlbum(albumId);
        const rows = Array.isArray(res?.data) ? res.data : res;
        setPosts(rows || []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Không thể tải bài viết của album này.");
      } finally {
        setLoading(false);
      }
    })();
  }, [albumId]);

  if (loading) return <div className="text-white p-4">Đang tải bài viết...</div>;
  if (error) {
    return (
      <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg">
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <PostSection
        title={`Bài viết trong album #${albumId}`}
        posts={posts}
        showAlbum={false}
        hideReactions={false}
        emptyText="Album này chưa có bài viết nào."
      />
    </div>
  );
}
