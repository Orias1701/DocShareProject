import React from 'react';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <i className={`${icon} text-gray-400 w-4 text-center`}></i>
    <span className="text-gray-400">{label}:</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const UserProfileCard = ({ user }) => {
  return (
    <div className="bg-[#1621] p-6 rounded-lg border border-[#2d2d33] sticky top-24">
      {/* User Info Header */}
      <div className="flex items-center gap-4 mb-6">
        <img src={user.avatar} alt={user.realName} className="w-24 h-24 rounded-lg" />
        <div>
          <h2 className="text-2xl font-bold">{user.realName}</h2>
          <p className="text-gray-400">{user.userName}</p>
          <p className="text-sm text-gray-500 mt-1">{user.followerCount}</p>
        </div>
      </div>
      
      {/* Biography */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Biography</h3>
        <p className="text-sm text-gray-300 whitespace-pre-line">{user.biography}</p>
      </div>
      
      {/* Details */}
      <div className="flex flex-col gap-3 mb-6">
        <InfoRow icon="fa-solid fa-cake-candles" label="Birthday" value={user.birthday} />
        <InfoRow icon="fa-solid fa-user-plus" label="Following number" value={user.followingCount} />
        <InfoRow icon="fa-solid fa-file-lines" label="Total post number" value={user.totalPosts} />
      </div>
      
      {/* Recent Posts */}
      <div>
        <h3 className="font-bold mb-3">Recent posts</h3>
        <div className="flex flex-col gap-3">
          {user.recentPosts.map((post, index) => (
            <div key={index} className="flex items-center gap-3 bg-[#2C323B] p-2 rounded-lg">
              <img src={post.image} alt={post.title} className="w-12 h-12 rounded-md" />
              <div>
                <p className="font-semibold text-sm text-white">{post.title}</p>
                <p className="text-xs text-gray-400">{post.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;