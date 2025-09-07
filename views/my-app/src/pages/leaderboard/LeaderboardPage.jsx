import React, { useState } from 'react';
import LeaderboardTabs from '../../components/leaderboard/LeaderboardTabs';
import RankItem from '../../components/leaderboard/RankItem';
import UserProfileCard from '../../components/leaderboard/UserProfileCard';

// --- Dữ liệu mẫu ---
// Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu này từ API
const tabs = ['Criterion 1', 'Criterion 2', 'Criterion 3', 'Criterion 4'];

const rankings = [
  { rank: 1, avatar: 'https://i.pravatar.cc/40?img=1', realName: 'Real name', userName: 'User name', score: 'Criterion score' },
  { rank: 2, avatar: 'https://i.pravatar.cc/40?img=2', realName: 'Real name', userName: 'User name', score: 'Criterion score' },
  { rank: 3, avatar: 'https://i.pravatar.cc/40?img=3', realName: 'Real name', userName: 'User name', score: 'Criterion score' },
  { rank: 4, avatar: 'https://i.pravatar.cc/40?img=4', realName: 'Real name', userName: 'User name', score: 'Criterion score' },
  { rank: 5, avatar: 'https://i.pravatar.cc/40?img=5', realName: 'Real name', userName: 'User name', score: 'Criterion score' },
];

const selectedUser = {
  avatar: 'https://i.pravatar.cc/150?img=1',
  realName: 'Real name',
  userName: 'User name',
  followerCount: 'Follower number',
  biography: 'User biography\nHeight based on the length of biography that user want it be',
  birthday: 'Birthday',
  followingCount: 'Following number',
  totalPosts: 'Total post number',
  recentPosts: [
    { title: 'Post name', description: 'Post description', image: 'https://i.pravatar.cc/48?img=11' },
    { title: 'Post name', description: 'Post description', image: 'https://i.pravatar.cc/48?img=12' },
  ]
};

function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedRank, setSelectedRank] = useState(rankings[0].rank);

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      {/* Grid layout chính chia làm 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === CỘT TRÁI (Bảng xếp hạng) === */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <LeaderboardTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
          <div className="bg-[#1621] p-4 rounded-lg border border-[#2d2d33] flex flex-col gap-3">
            {rankings.map(user => (
              <RankItem 
                key={user.rank}
                rank={user.rank}
                avatar={user.avatar}
                realName={user.realName}
                userName={user.userName}
                score={user.score}
                isSelected={selectedRank === user.rank}
                onClick={() => setSelectedRank(user.rank)}
              />
            ))}
          </div>
        </div>

        {/* === CỘT PHẢI (Thông tin chi tiết) === */}
        <div className="lg:col-span-1">
          <UserProfileCard user={selectedUser} />
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;