import React from 'react';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    <i className={`${icon} text-gray-400 w-4 text-center`}></i>
    <span className="text-gray-400">{label}:</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const UserProfileCard = ({ user }) => {
  return (
    <div className="bg-[#1C2028] p-6 rounded-lg border border-[#2d2d33] sticky top-24 text-left">
      {/* User Info Header */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={user.avatar}
          alt={user.realName}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-white">{user.realName}</h2>
          <p className="text-gray-400">{user.userName}</p>
          <p className="text-sm text-gray-500 mt-1">
            {user.followerCount} followers
          </p>
        </div>
      </div>

      {/* Biography */}
      <div className="mb-6">
        <h3 className="font-bold text-white mb-2">Biography</h3>
        <p className="text-sm text-gray-300 whitespace-pre-line">
          {user.biography}
        </p>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 mb-6">
        <InfoRow icon="fa-solid fa-cake-candles" label="Birthday" value={user.birthday} />
        <InfoRow icon="fa-solid fa-user-plus" label="Following number" value={user.followingCount} />
        <InfoRow icon="fa-solid fa-file-lines" label="Total post number" value={user.totalPosts} />
      </div>
    </div>
  );
};

export default UserProfileCard;
