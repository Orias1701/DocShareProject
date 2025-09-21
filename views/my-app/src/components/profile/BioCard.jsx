import React from "react";

/** Hàng thông tin đơn giản */
const InfoRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-sm">
    <i className={`${icon} text-gray-400 w-5 text-center`} />
    <span className="text-white/90">{text}</span>
  </div>
);

/** BioCard linh hoạt + màu sắc khớp mockup */
const BioCard = ({ user }) => {
  const isString = typeof user === "string";
  const u = isString ? {} : (user || {});

  const biography =
    (isString ? user : (u.biography ?? u.bio)) || "Chưa có bio";
  const birthday = u.birthday ?? u.birth_date ?? null;
  const followingCount = u.followingCount ?? u.following_count ?? null;
  const totalPosts = u.totalPosts ?? u.total_posts ?? null;

  return (
    <div className="bg-[#1f2430] border border-[#2b3240] rounded-2xl p-5 sticky top-24">
      <h3 className="text-white text-lg font-bold mb-3">Biography</h3>
      <p className="text-sm text-gray-300 mb-6 whitespace-pre-line">{biography}</p>

      <div className="flex flex-col gap-3">
        {birthday && <InfoRow icon="fa-solid fa-cake-candles" text={birthday} />}
        {Number.isFinite(Number(followingCount)) && (
          <InfoRow icon="fa-solid fa-user-plus" text={`${followingCount} following`} />
        )}
        {Number.isFinite(Number(totalPosts)) && (
          <InfoRow icon="fa-solid fa-file-lines" text={`${totalPosts} posts`} />
        )}
      </div>
    </div>
  );
};

export default BioCard;
