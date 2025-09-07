import React from 'react';

/**
 * Dòng thông tin phụ (ví dụ: Birthday, Following)
 */
const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 text-sm">
      <i className={`${icon} text-gray-400 w-5 text-center`}></i>
      <span className="text-white font-medium">{value}</span>
    </div>
);

/**
 * Component `BioCard`
 * @description Hiển thị card chứa thông tin "Biography" và các chi tiết khác.
 */
const BioCard = ({ user }) => {
    return (
        <div className="bg-[#1621] p-6 rounded-lg border border-[#2d2d33] sticky top-24">
            <h3 className="text-lg font-bold mb-3">Biography</h3>
            {/* `whitespace-pre-line` để giữ lại các ký tự xuống dòng */}
            <p className="text-sm text-gray-300 mb-6 whitespace-pre-line">{user.biography}</p>

            {/* Các thông tin chi tiết */}
            <div className="flex flex-col gap-3">
                <InfoRow icon="fa-solid fa-cake-candles" value={user.birthday} />
                <InfoRow icon="fa-solid fa-user-plus" value={`${user.followingCount} following`} />
                <InfoRow icon="fa-solid fa-file-lines" value={`${user.totalPosts} posts`} />
            </div>
        </div>
    );
};

export default BioCard;