import React from "react";
import { useNavigate } from "react-router-dom";

import UsersListItem from "../list/UsersListItem";
import UserProfileCard from "../../leaderboard/UserProfileCard";
import AddUserModal from "../modals/AddUserModal";
import ConfirmModal from "../../common/ConfirmModal";
import ModalEditUser from "../modals/ModalEditUser";

import userInfoApi from "../../../services/user_infoServices";
import authApi from "../../../services/usersServices";

const FALLBACK_AVATAR = "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg";

const mapApiUser = (u) => ({
  id: u.user_id,
  user_id: u.user_id,
  avatar: u.avatar_url || FALLBACK_AVATAR,
  realName: u.full_name || u.username || "Unknown",
  userName: u.username ? `@${u.username}` : "",
  username: u.username || "",
  followerCount: Number(u.followers_count ?? 0),
  birthday: u.birth_date || "",
  biography: u.bio || "",
  followingCount: 0,
  totalPosts: Number(u.total_posts ?? 0),
  role_id: u.role_id || "ROLE001",
  status: u.status || "active",
  email: u.email || "",
});

export default function UsersTab() {
  const navigate = useNavigate();

  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [fetched, setFetched] = React.useState(false);

  const [selectedId, setSelectedId] = React.useState();
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const [openAdd, setOpenAdd] = React.useState(false);
  const [confirm, setConfirm] = React.useState({ open: false, target: null });

  const [openEdit, setOpenEdit] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);

  const [banner, setBanner] = React.useState(null);
  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const selectedUser =
    pageData.find((u) => u.id === selectedId) ?? pageData[0] ?? null;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userInfoApi.listUserInfos();
      if (res?.status === "ok" && Array.isArray(res.data)) {
        const mapped = res.data.map(mapApiUser);
        setData(mapped);
        setFetched(true);
        setSelectedId((prev) => prev ?? mapped[0]?.id);
      } else {
        throw new Error(res?.message || "Invalid user list response");
      }
    } catch (e) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!fetched && !loading) fetchUsers();
  }, []);

  React.useEffect(() => setPage(1), [fetched]);

  const onUpdateProfile = async ({ user_id, profile }) => {
    try {
      const res = await userInfoApi.updateUserInfo({
        user_id,
        full_name: profile.full_name ?? "",
        bio: profile.bio ?? "",
        birth_date: profile.birth_date ?? "",
        avatar: profile.avatar || undefined,
      });
      if (res?.status === "ok" || res?.status === "success") {
        await fetchUsers();
        showBanner("success", res?.message || "Đã cập nhật hồ sơ");
        return { status: "ok" };
      }
      return { status: "error", message: res?.message || "Update profile failed" };
    } catch (e) {
      return { status: "error", message: e?.message || "Network error" };
    }
  };

  const onUpdateAccount = async ({ user_id, email }) => {
    try {
      const res = await authApi.updateAccount({ user_id, email });
      if (res?.status === "ok") {
        await fetchUsers();
        showBanner("success", res?.message || "Đã cập nhật email");
        return { status: "ok" };
      }
      return { status: "error", message: res?.message || "Update account failed" };
    } catch (e) {
      return { status: "error", message: e?.message || "Network error" };
    }
  };

  const onResetPassword = async ({ user_id, new_password }) => {
    try {
      const res = await authApi.updateAccount({ user_id, new_password });
      if (res?.status === "ok") {
        showBanner("success", res?.message || "Đã đặt lại mật khẩu");
        return { status: "ok" };
      }
      return { status: "error", message: res?.message || "Reset password failed" };
    } catch (e) {
      return { status: "error", message: e?.message || "Network error" };
    }
  };

  const onSetRole = async ({ user_id, role_id }) => {
    try {
      const res = await authApi.updateAccount({ user_id, role_id });
      if (res?.status === "ok") {
        await fetchUsers();
        showBanner("success", res?.message || "Đã cập nhật quyền");
        return { status: "ok" };
      }
      return { status: "error", message: res?.message || "Set role failed" };
    } catch (e) {
      return { status: "error", message: e?.message || "Network error" };
    }
  };

  const onSetStatus = async ({ user_id, status }) => {
    try {
      if (typeof authApi.setStatus === "function") {
        const res = await authApi.setStatus({ user_id, status });
        if (res?.status === "ok" || res?.status === "success") {
          await fetchUsers();
          showBanner("success", res?.message || "Đã cập nhật trạng thái");
          return { status: "ok" };
        }
        return { status: "error", message: res?.message || "Set status failed" };
      }
      return { status: "error", message: "Endpoint setStatus chưa có trong usersServices.js" };
    } catch (e) {
      return { status: "error", message: e?.message || "Network error" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">User List</h2>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-outline"
              onClick={fetchUsers}
              disabled={loading}
              title="Refresh"
            >
              <i className="fa-solid fa-rotate" />
            </button>
            <button className="btn btn-primary" onClick={() => setOpenAdd(true)}>
              <i className="fa-regular fa-square-plus mr-1" /> Add
            </button>
          </div>
        </div>

        {banner && (
          <div
            className={
              "px-3 py-2 rounded-md text-sm border " +
              (banner.type === "success"
                ? "bg-emerald-900/30 text-emerald-200 border-emerald-700/40"
                : banner.type === "error"
                ? "bg-red-900/30 text-red-200 border-red-700/40"
                : "bg-white/5 text-white/80 border-white/10")
            }
          >
            {banner.text}
          </div>
        )}

        {loading && !fetched && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        )}

        {error && !data.length && (
          <div className="panel panel-muted text-red-300">
            Failed to load users: {error}
            <button onClick={fetchUsers} className="btn btn-primary mt-3">
              Retry
            </button>
          </div>
        )}

        {fetched && !data.length && (
          <div className="panel panel-muted">No users found.</div>
        )}

        <div className="space-y-3">
          {pageData.map((u) => (
            <UsersListItem
              key={u.user_id || u.id}
              user={u}
              active={u.id === selectedId}
              onClick={() => setSelectedId(u.id)}
              onEdit={() => {
                setEditUser(u);
                setOpenEdit(true);
              }}
              onRequestDelete={(user) => setConfirm({ open: true, target: user })}
              onAvatarClick={() => navigate(`/profile/${u.user_id || u.id}`)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <div>
              Page <strong>{page}</strong> / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Right panel */}
      <aside>
        {selectedUser ? (
          <UserProfileCard user={selectedUser} />
        ) : (
          <div className="panel panel-muted">Nothing to show here.</div>
        )}
      </aside>

      {/* Modals */}
      <AddUserModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={async (form) => {
          try {
            const res = await authApi.register({
              username: form.username,
              email: form.email,
              password: form.password,
              full_name: form.full_name,
              birth_date: form.birth_date || null,
              avatar_url: form.avatar_url || null,
              bio: form.bio || null,
            });
            if (res?.status !== "ok") throw new Error(res?.message || "Register failed");
            await fetchUsers();
            setOpenAdd(false);
            setPage(1);
            showBanner("success", "Tạo người dùng thành công.");
          } catch (e) {
            showBanner("error", e?.message || "Register failed");
          }
        }}
      />

      <ModalEditUser
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        user={editUser}
        onUpdateAccount={onUpdateAccount}
        onResetPassword={onResetPassword}
        onSetRole={onSetRole}
        onSetStatus={onSetStatus}
        onUpdateProfile={onUpdateProfile}
      />

      <ConfirmModal
        open={confirm.open}
        message={`Delete ${confirm.target?.realName || "this user"}?`}
        onClose={() => setConfirm({ open: false, target: null })}
        onConfirm={async () => {
          const targetId = confirm.target?.user_id || confirm.target?.id;
          try {
            const res = await authApi.deleteUser(targetId);
            if (res?.status !== "ok" && res?.status !== "success") {
              throw new Error(res?.message || "Delete failed");
            }
            setData((prev) => {
              const next = prev.filter((x) => (x.user_id || x.id) !== targetId);
              setSelectedId((prevSel) => (prevSel === targetId ? next[0]?.id ?? next[0]?.user_id : prevSel));
              const newTotal = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
              setPage((p) => Math.min(p, newTotal));
              return next;
            });
            showBanner("success", "Đã xoá người dùng.");
          } catch (e) {
            showBanner("error", e?.message || "Delete failed");
          } finally {
            setConfirm({ open: false, target: null });
          }
        }}
      />
    </div>
  );
}
