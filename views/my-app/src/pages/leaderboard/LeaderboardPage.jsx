// src/pages/leaderboard/LeaderboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaderboardTabs from "../../components/leaderboard/LeaderboardTabs";
import RankItem from "../../components/leaderboard/RankItem";
import UserProfileCard from "../../components/leaderboard/UserProfileCard";
import user_followServices from "../../services/user_followServices";
import postService from "../../services/postService";

const tabs = ["Criterion 1", "Criterion 2", "Criterion 3", "Criterion 4"];
const FALLBACK_AVATAR = "https://via.placeholder.com/96?text=User";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [allRankings, setAllRankings] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👉 state riêng cho số liệu phụ thuộc user đang chọn (không ăn theo session)
  const [selectedFollowingCount, setSelectedFollowingCount] = useState("-");
  const [selectedTotalPosts, setSelectedTotalPosts] = useState("-");

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { status, data } = await user_followServices.top(20);
        const arr = status === "success" && Array.isArray(data) ? data : [];
        arr.sort((a, b) => (b.followers_count ?? 0) - (a.followers_count ?? 0));
        setAllRankings(arr);
        if (arr.length > 0) setSelectedUserId(arr[0].user_id);
      } catch (e) {
        console.error("Error fetching top users:", e);
        setAllRankings([]);
        setSelectedUserId(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 👉 Khi đổi user đang chọn, fetch đúng counts theo selectedUserId (tránh ăn theo session)
  useEffect(() => {
    let alive = true;
    if (!selectedUserId) {
      setSelectedFollowingCount("-");
      setSelectedTotalPosts("-");
      return;
    }
    (async () => {
      try {
        // countFollowing cho user đang xem
        const fRes = await user_followServices.countFollowing(selectedUserId);
        if (alive) setSelectedFollowingCount(Number(fRes?.data?.count ?? 0));

        // countPostsByUser cho user đang xem
        const pCnt = await postService.countPostsByUser(selectedUserId);
        if (alive) setSelectedTotalPosts(Number(pCnt ?? 0));
      } catch (err) {
        console.error("[Leaderboard] fetch selected user's counts failed:", err);
        if (alive) {
          setSelectedFollowingCount("-");
          setSelectedTotalPosts("-");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedUserId]);

  const rankings = useMemo(() => {
    if (allRankings.length === 0) return [];
    const tabIndex = tabs.indexOf(activeTab);
    const start = tabIndex * 5;
    return allRankings.slice(start, start + 5);
  }, [allRankings, activeTab]);

  const selectedUser = useMemo(
    () => allRankings.find((u) => u.user_id === selectedUserId) || null,
    [allRankings, selectedUserId]
  );

  if (loading) return <div className="text-white p-4">Đang tải...</div>;

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <LeaderboardTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="bg-[#1C2028] p-4 rounded-lg border border-[#2d2d33] flex flex-col gap-3">
            {rankings.length === 0 ? (
              <div className="text-gray-400">Chưa có dữ liệu.</div>
            ) : (
              rankings.map((user, idx) => (
                <RankItem
                  key={user.user_id}
                  rank={idx + 1 + tabs.indexOf(activeTab) * 5}
                  avatar={user.avatar_url || FALLBACK_AVATAR}
                  realName={user.full_name || "Unknown"}
                  userName={user.username || ""}
                  score={user.followers_count ?? 0}
                  isSelected={selectedUserId === user.user_id}
                  onClick={() => setSelectedUserId(user.user_id)}
                  onAvatarClick={() => navigate(`/profile/${user.user_id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Cột phải */}
        <div className="lg:col-span-1">
          <UserProfileCard
            user={
              selectedUser
                ? {
                    avatar: selectedUser.avatar_url || FALLBACK_AVATAR,
                    realName: selectedUser.full_name || "Unknown",
                    userName: selectedUser.username || "",
                    followerCount: selectedUser.followers_count ?? 0,
                    biography: selectedUser.bio || "",
                    birthday: selectedUser.birth_date || "",
                    // 👇 hai số này là từ API theo selectedUserId, không ăn theo session
                    followingCount: selectedFollowingCount,
                    totalPosts: selectedTotalPosts,
                    recentPosts: [],
                  }
                : {
                    avatar: FALLBACK_AVATAR,
                    realName: "—",
                    userName: "",
                    followerCount: 0,
                    biography: "",
                    birthday: "",
                    followingCount: "-",
                    totalPosts: "-",
                    recentPosts: [],
                  }
            }
          />
        </div>
      </div>
    </div>
  );
}
