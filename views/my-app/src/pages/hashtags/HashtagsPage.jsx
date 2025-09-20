// src/pages/hashtags/MyHashtagsPage.jsx
import React, { useEffect, useState } from "react";
import HashtagLink from "../../components/hashtag/HashtagLink";
import { hashtagService } from "../../services/hashtagService";

function MyHashtagsPage() {
  const [myHashtags, setMyHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await hashtagService.myHashtag();
        // ⚡ API trả về mảng [ {hashtag_id, hashtag_name}, ... ]
        setMyHashtags(Array.isArray(res) ? res : res?.data ?? []);
      } catch (e) {
        console.error(e);
        setError("Không thể tải hashtags của bạn.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-white p-4">Đang tải hashtags...</div>;
  if (error) {
    return (
      <div className="text-white p-4 bg-red-900/40 border border-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="text-white p-4">
      <h2 className="text-2xl font-bold mb-6">My hashtags</h2>
      {myHashtags.length === 0 ? (
        <p className="text-gray-400">Bạn chưa có hashtag nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {myHashtags.map((tag) => (
            <HashtagLink
              key={tag.hashtag_id}
              tag={tag.hashtag_name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyHashtagsPage;
