// src/components/profile/BioCard.jsx
import React, { useEffect, useState } from "react";
import { user_followServices } from "../../services/user_followServices";
import postService from "../../services/postService";

const InfoRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-sm">
    <i className={`${icon} text-gray-400 w-5 text-center`} />
    <span className="text-white/90">{text}</span>
  </div>
);

const BioCard = ({ user }) => {
  const isString = typeof user === "string";
  const u = isString ? {} : (user || {});

  const biography = (isString ? user : (u.biography ?? u.bio)) || "Chưa có bio";
  const birthday = u.birthday ?? u.birth_date ?? null;

  const initialFollowing = u.followingCount ?? u.following_count ?? null;
  const initialTotalPosts = u.totalPosts ?? u.total_posts ?? null;

  const [followingCount, setFollowingCount] = useState(initialFollowing);
  const [totalPosts, setTotalPosts] = useState(initialTotalPosts);

  const userId = u.user_id ?? u.id ?? null;

  // reset khi chuyển sang user khác
  useEffect(() => {
    setFollowingCount(initialFollowing);
    setTotalPosts(initialTotalPosts);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true;
    if (!userId) return;

    (async () => {
      try {
        if (followingCount == null) {
          const res = await user_followServices.countFollowing(userId); // <-- truyền userId
          if (!mounted) return;
          const cnt = res?.data?.count ?? 0;
          setFollowingCount(Number(cnt) || 0);
        }

        if (totalPosts == null) {
          const cnt = await postService.countPostsByUser(userId); // <-- truyền userId
          if (!mounted) return;
          setTotalPosts(Number(cnt) || 0);
        }
      } catch (e) {
        console.error("[BioCard] fetch counts failed:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, followingCount, totalPosts]); // dependencies an toàn

  return (
    <div className="bg-[#1f2430] border border-[#2b3240] rounded-2xl p-5 sticky top-24">
      <h3 className="text-white text-lg font-bold mb-3">Biography</h3>
      <p className="text-sm text-gray-300 mb-6 whitespace-pre-line">{biography}</p>

      <div className="flex flex-col gap-3">
        {birthday && <InfoRow icon="fa-solid fa-cake-candles" text={birthday} />}

        {Number.isFinite(Number(followingCount)) && (
          <InfoRow icon="fa-solid fa-user-plus" text={`${Number(followingCount)} following`} />
        )}

        {Number.isFinite(Number(totalPosts)) && (
          <InfoRow icon="fa-solid fa-file-lines" text={`${Number(totalPosts)} posts`} />
        )}
      </div>
    </div>
  );
};

export default BioCard;
