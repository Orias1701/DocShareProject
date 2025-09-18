import React, { useState, useEffect } from 'react';
import LeaderboardTabs from '../../components/leaderboard/LeaderboardTabs';
import RankItem from '../../components/leaderboard/RankItem';
import UserProfileCard from '../../components/leaderboard/UserProfileCard';
import user_followServices from '../../services/user_followServices';  // import API service

// --- Dữ liệu mẫu (sẽ thay bằng API) ---
const tabs = ['Criterion 1', 'Criterion 2', 'Criterion 3', 'Criterion 4'];

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
  const [selectedRank, setSelectedRank] = useState(1);
  const [rankings, setRankings] = useState([]);  // state lưu trữ dữ liệu top user
  const [loading, setLoading] = useState(true);  // trạng thái loading khi gọi API

  // Lấy top users từ API
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const data = await user_followServices.top();  // Gọi API top follow users
        setRankings(data);  // Cập nhật dữ liệu top vào state
      } catch (error) {
        console.error('Error fetching top users:', error);
      } finally {
        setLoading(false);  // Kết thúc trạng thái loading
      }
    };

    fetchTopUsers();
  }, []);  // Gọi API 1 lần khi component được mount

  if (loading) {
    return <div className="text-white p-4">Đang tải...</div>;
  }

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
                key={user.user_id}
                rank={user.followers_count}  // Sử dụng followers_count làm rank
                avatar={user.avatar_url}
                realName={user.full_name}
                userName={user.username}
                score={user.followers_count}
                isSelected={selectedRank === user.user_id}
                onClick={() => setSelectedRank(user.user_id)}  // Cập nhật rank khi click
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
