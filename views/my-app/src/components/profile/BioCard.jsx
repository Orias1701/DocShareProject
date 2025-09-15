import React from 'react';

/** Hàng thông tin đơn giản */
const InfoRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-sm">
    <i className={`${icon} text-gray-400 w-5 text-center`} />
    <span className="text-white font-medium">{text}</span>
  </div>
);

/**
 * BioCard linh hoạt:
 * - Prop `user` có thể là string (bio text) hoặc object (từ DB).
 * - Tự map: biography | bio, birthday | birth_date, followingCount | following_count, totalPosts | total_posts
 * - Ẩn row nếu không có dữ liệu.
 */
const BioCard = ({ user }) => {
  const isString = typeof user === 'string';
  const u = isString ? {} : (user || {});

  const biography =
    (isString ? user : (u.biography ?? u.bio)) || 'Chưa có bio';

  const birthday = u.birthday ?? u.birth_date ?? null;

  // tuỳ backend có hay không, nếu không thì null để ẩn dòng
  const followingCount =
    u.followingCount ?? u.following_count ?? null;

  const totalPosts =
    u.totalPosts ?? u.total_posts ?? null;

  return (
    <div className="bg-[#161621] p-6 rounded-lg border border-[#2d2d33] sticky top-24">
      <h3 className="text-lg font-bold mb-3">Biography</h3>

      {/* giữ xuống dòng từ text */}
      <p className="text-sm text-gray-300 mb-6 whitespace-pre-line">
        {biography}
      </p>

      <div className="flex flex-col gap-3">
        {birthday && (
          <InfoRow icon="fa-solid fa-cake-candles" text={birthday} />
        )}
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
