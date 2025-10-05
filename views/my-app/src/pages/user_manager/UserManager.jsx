import React, { useMemo, useState } from "react";
import UserProfileCard from "../../components/leaderboard/UserProfileCard";
import PostCard from "../../components/leaderboard/PostCard";

import TabBar from "../../components/user_manager/TabBar";
import UsersListItem from "../../components/user_manager/list/UsersListItem";
import CategoryItem from "../../components/user_manager/list/CategoryItem";
import ReportItem from "../../components/user_manager/list/ReportItem";

import AddUserModal from "../../components/user_manager/modals/AddUserModal";
import AddCategoryModal from "../../components/user_manager/modals/AddCategoryModal";
import AddReportModal from "../../components/user_manager/modals/AddReportModal";
import ConfirmModal from "../../components/user_manager/modals/ConfirmModal";

import PostInfoPanel from "../../components/user_manager/panels/PostInfoPanel";
import AlbumInfoPanel from "../../components/user_manager/panels/AlbumInfoPanel";
import CategoryInfoPanel from "../../components/user_manager/panels/CategoryInfoPanel";
import ReportInfoPanel from "../../components/user_manager/panels/ReportInfoPanel";

import categoryServices from "../../services/categoryServices";
/** ----------------- MOCK DATA ----------------- */

/** ----------------- MOCK DATA cho users/reports ----------------- */
const AVATARS = Array.from({ length: 70 }).map(
  (_, i) => `https://i.pravatar.cc/100?img=${(i % 70) + 1}`
);
function makeUser(idx) {
  const names = [
    "Wade Warren","Jenny Wilson","Jane Cooper","Esther Howard","Leslie Alexander",
    "Robert Fox","Cody Fisher","Guy Hawkins","Darlene Robertson","Courtney Henry"
  ];
  const name = names[idx % names.length];
  const handle = `@${name.split(" ")[0].toLowerCase()}${idx}`;
  return {
    id: idx + 1,
    avatar: AVATARS[idx % AVATARS.length],
    realName: name,
    userName: handle,
    followerCount: 500 + ((idx * 37) % 3000),
    birthday: `199${idx % 10}-0${(idx % 9) + 1}-2${idx % 9}`,
    biography: "Short bio for demo.",
    followingCount: 50 + ((idx * 19) % 900),
    totalPosts: 10 + ((idx * 7) % 120),
  };
}
const USERS = Array.from({ length: 37 }).map((_, i) => makeUser(i));

const REPORTS_SEED = Array.from({ length: 23 }).map((_, i) => ({
  id: i + 1,
  title: `Weekly Report #${i + 1}`,
  description: "Summary of progress, blockers and next steps.",
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  status: (i % 3 === 0 ? "open" : i % 3 === 1 ? "in-review" : "closed"),
}));

const makePosts = (user) => [
  {
    id: 1,
    authorAvatar: user.avatar,
    authorName: user.realName,
    title: "Post name\nPost description",
    hashtags: ["#news", "#update"],
    uploadTime: "2 hours ago",
    sourceName: "mangle",
    sourceIcon: "https://dummyimage.com/32x32/000/fff.png&text=M",
    stats: { likes: 21, comments: 9 },
  },
];

/** ----------------- PAGE ----------------- */
export default function UserManager() {
  // Tabs: user | posts | album | categories | reports
  const [activeTab, setActiveTab] = useState("user");

  // datasets
  const [usersData, setUsersData] = useState(USERS);

  // Categories lấy từ API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [categoriesFetched, setCategoriesFetched] = useState(false);

  // reports (mock)
  const [reports, setReports] = useState(REPORTS_SEED);

  // pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // selection (for user tabs)
  const isUserTab = ["user", "posts", "album"].includes(activeTab);
  const [selectedUserId, setSelectedUserId] = useState(undefined);

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  /** -------- Fetch categories từ API (list_categories) -------- */
  const mapApiCategory = (c) => ({
    id: c.category_id,          // string ID từ API
    name: c.category_name,
    posts: 0,                   // API không trả -> tạm 0
  });

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const data = await categoryServices.list(); // ← gọi API
      if (Array.isArray(data)) {
        setCategories(data.map(mapApiCategory));
        setCategoriesFetched(true);
      } else {
        throw new Error("Invalid category list response");
      }
    } catch (err) {
      setCategoriesError(err?.message || "Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Prefetch khi vào tab categories lần đầu
  React.useEffect(() => {
    if (activeTab === "categories" && !categoriesFetched && !categoriesLoading) {
      fetchCategories();
    }
  }, [activeTab]); // eslint-disable-line

  // dataset theo tab
  const fullDataset = useMemo(() => {
    if (activeTab === "categories") return categories;
    if (activeTab === "reports") return reports;
    if (activeTab === "posts") return usersData.filter((_, i) => i % 2 === 0);
    if (activeTab === "album") return usersData.slice(1);
    return usersData; // user
  }, [activeTab, usersData, categories, reports]);

  const totalPages = Math.max(1, Math.ceil(fullDataset.length / PAGE_SIZE));
  const currentPageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return fullDataset.slice(start, start + PAGE_SIZE);
  }, [fullDataset, page]);

  // sync page
  React.useEffect(() => setPage(1), [activeTab]);
  React.useEffect(
    () => setPage((p) => Math.min(Math.max(1, p), totalPages)),
    [totalPages]
  );

  // sync selected user
  React.useEffect(() => {
    if (!isUserTab) { setSelectedUserId(undefined); return; }
    setSelectedUserId(currentPageData[0]?.id);
  }, [currentPageData, isUserTab]);

  const selectedUser = useMemo(() => {
    if (!isUserTab) return null;
    return currentPageData.find((u) => u?.id === selectedUserId) ?? null;
  }, [isUserTab, currentPageData, selectedUserId]);

  const posts = useMemo(
    () => (selectedUser ? makePosts(selectedUser) : []),
    [selectedUser]
  );

  /** Add modals */
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openAddReport, setOpenAddReport] = useState(false);

  const handleOpenAdd = () => {
    if (activeTab === "categories") setOpenAddCategory(true);
    else if (activeTab === "reports") setOpenAddReport(true);
    else setOpenAddUser(true);
  };

  const handleSaveAddUser = (form) => {
    const nextId = (usersData[usersData.length - 1]?.id || 0) + 1;
    setUsersData([
      { ...makeUser(nextId - 1), realName: form.realName, userName: form.userName, id: nextId },
      ...usersData,
    ]);
    setOpenAddUser(false);
  };

  // Categories: gọi API create rồi refetch
  const handleSaveAddCategory = async ({ name }) => {
    try {
      await categoryServices.create({ category_name: name });
      await fetchCategories(); // đồng bộ list với server
    } catch (e) {
      console.error(e);
      // fallback local nếu cần
      setCategories((prev) => [{ id: `LOCAL_${Date.now()}`, name, posts: 0 }, ...prev]);
    } finally {
      setOpenAddCategory(false);
    }
  };

  const handleSaveAddReport = ({ title, description, status }) => {
    const nextId = (reports[0]?.id || 0) + 1;
    setReports([{ id: nextId, title, description, status, createdAt: new Date().toISOString() }, ...reports]);
    setOpenAddReport(false);
  };

  /** Delete flow */
  const handleDeleteRequest = (item, type) => {
    setDeleteTarget(item);
    setDeleteType(type);
    setShowConfirm(true);
  };
  const confirmDelete = async () => {
    try {
      if (deleteType === "user") {
        setUsersData((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      } else if (deleteType === "category") {
        await categoryServices.delete(deleteTarget.id); // gọi API
        await fetchCategories(); // refetch list
      } else {
        setReports((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      }
    } catch (e) {
      console.error(e);
      // optional: toast lỗi
    } finally {
      setShowConfirm(false);
      setDeleteTarget(null);
      setDeleteType(null);
    }
  };

  /** Lists */
  const renderList = () => {
    if (activeTab === "categories") {
      if (categoriesLoading) {
        return (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        );
      }
      if (categoriesError) {
        return (
          <div className="text-red-300 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            Failed to load categories: {categoriesError}
            <div className="mt-3">
              <button
                onClick={fetchCategories}
                className="px-3 py-1.5 rounded-md bg-white text-black"
              >
                Retry
              </button>
            </div>
          </div>
        );
      }
      if (categoriesFetched && categories.length === 0) {
        return (
          <div className="text-white/70 bg-white/5 border border-white/10 rounded-xl p-4">
            No categories found.
          </div>
        );
      }
      return currentPageData.map((c) => (
        <CategoryItem
          key={c.id}
          cat={c}
          onEdit={() => alert("Edit category")}
          onDelete={() => handleDeleteRequest(c, "category")}
        />
      ));
    }

    if (activeTab === "reports")
      return currentPageData.map((r) => (
        <ReportItem
          key={r.id}
          report={r}
          onEdit={() => alert("Edit report")}
          onDelete={() => handleDeleteRequest(r, "report")}
        />
      ));

    // user | posts | album — list user items
    return currentPageData.map((u) => (
      <UsersListItem
        key={u.id}
        user={u}
        active={u.id === selectedUserId}
        onClick={() => setSelectedUserId(u.id)}
        onEdit={() => alert("Edit user")}
        onDelete={() => handleDeleteRequest(u, "user")}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#0F1218] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">Dashboard Manager</h1>

        <TabBar
          tabs={["user", "posts", "album", "categories", "reports"]}
          active={activeTab}
          onChange={setActiveTab}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List
              </h2>

              <div className="flex items-center gap-2">
                {activeTab === "categories" && (
                  <button
                    className="px-3 py-1.5 rounded-md border border-white/20 text-white/90 hover:text-white"
                    onClick={fetchCategories}
                    disabled={categoriesLoading}
                    title="Refresh from API"
                  >
                    <i className="fa-solid fa-rotate"></i>
                  </button>
                )}
                <button className="px-3 py-1.5 rounded-md bg-white text-black" onClick={handleOpenAdd}>
                  <i className="fa-regular fa-square-plus mr-1" /> Add
                </button>
              </div>
            </div>

            <div className="space-y-3">{renderList()}</div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <div className="text-sm text-white/80">
                  Page <span className="font-semibold">{page}</span> / {totalPages}
                </div>
                <button
                  className="px-3 py-1.5 rounded-md border border-white/10 text-sm text-white/90 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}

            {/* Demo PostCard khi có user được chọn (tab user/posts/album) */}
            {selectedUser && isUserTab && (
              <section className="space-y-3">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </section>
            )}
          </div>

          {/* RIGHT: Aside panels */}
          <aside>
            {activeTab === "user" && selectedUser && <UserProfileCard user={selectedUser} />}
            {activeTab === "posts" && <PostInfoPanel />}
            {activeTab === "album" && <AlbumInfoPanel />}
            {activeTab === "categories" && (
              categoriesLoading ? (
                <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
                  Loading categories...
                </div>
              ) : (
                <CategoryInfoPanel category={currentPageData[0]} />
              )
            )}
            {activeTab === "reports" && <ReportInfoPanel />}

            {((activeTab === "user" && !selectedUser) ||
              (activeTab === "categories" && !categoriesLoading && !currentPageData[0])) && (
              <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33] text-white/70">
                Nothing to show here.
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal open={openAddUser} onClose={() => setOpenAddUser(false)} onSave={handleSaveAddUser} />
      <AddCategoryModal open={openAddCategory} onClose={() => setOpenAddCategory(false)} onSave={handleSaveAddCategory} />
      <AddReportModal open={openAddReport} onClose={() => setOpenAddReport(false)} onSave={handleSaveAddReport} />

      {/* Confirm delete */}
      <ConfirmModal
        open={showConfirm}
        message={`Are you sure you want to delete ${
          deleteTarget?.realName || deleteTarget?.name || deleteTarget?.title || "this item"
        }?`}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

