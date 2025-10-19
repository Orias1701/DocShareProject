import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaderboardTabs from "../../components/leaderboard/LeaderboardTabs";
import RankItem from "../../components/leaderboard/RankItem";
import UserProfileCard from "../../components/leaderboard/UserProfileCard";
import user_followServices from "../../services/user_followServices";
import postService from "../../services/postService";

const tabs = ["Criterion 1", "Criterion 2"];
const FALLBACK_AVATAR =
  "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [allRankings, setAllRankings] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Số liệu phụ thuộc user đang chọn (không dựa vào session hiện tại)
  const [selectedFollowingCount, setSelectedFollowingCount] = useState("-");
  const [selectedTotalPosts, setSelectedTotalPosts] = useState("-");

  const navigate = useNavigate();

  // Lấy top user
  useEffect(() => {
    async function loadTopUsers() {
      setLoading(true);
      try {
        const { status, data } = await user_followServices.top(10);
        const arr = status === "success" && Array.isArray(data) ? data : [];
        arr.sort(
          (a, b) => Number(b.followers_count ?? 0) - Number(a.followers_count ?? 0)
        );
        setAllRankings(arr);
        if (arr.length > 0) setSelectedUserId(arr[0].user_id);
      } catch (e) {
        console.error("Error fetching top users:", e);
        setAllRankings([]);
        setSelectedUserId(null);
      } finally {
        setLoading(false);
      }
    }
    loadTopUsers();
  }, []);

  // Khi đổi selectedUserId → lấy đúng chỉ số của user đó
  useEffect(() => {
    let alive = true;
    if (!selectedUserId) {
      setSelectedFollowingCount("-");
      setSelectedTotalPosts("-");
      return;
    }

    (async () => {
      try {
        const fRes = await user_followServices.countFollowing(selectedUserId);
        if (alive) setSelectedFollowingCount(Number(fRes?.data?.count ?? 0));

        const pCnt = await postService.countPostsByUser(selectedUserId);
        if (alive) setSelectedTotalPosts(Number(pCnt ?? 0));
      } catch (err) {
        console.error("[Leaderboard] fetch counts failed:", err);
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

  // Chia tab: mỗi tab hiển thị 5 người
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

  if (loading) {
    return (
      <div className="p-4 text-[var(--color-text-secondary)]">Đang tải...</div>
    );
  }

  return (
    <div className="p-4 text-[var(--color-text)]">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Tabs + danh sách top */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <LeaderboardTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="p-4 rounded-lg border bg-[var(--color-card-bg)] border-[var(--color-card-border)] flex flex-col gap-3">
            {rankings.length === 0 ? (
              <div className="text-[var(--color-text-muted)]">Chưa có dữ liệu.</div>
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

        {/* Cột phải: Hồ sơ của người đang chọn */}
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
                    // 2 số này lấy từ API theo selectedUserId
                    followingCount: selectedFollowingCount,
                    totalPosts: selectedTotalPosts,
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
                  }
            }
          />
        </div>
      </div>
    </div>
  );
}
