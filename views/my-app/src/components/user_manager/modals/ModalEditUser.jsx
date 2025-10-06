import React, { useEffect, useMemo, useState } from "react";

/**
 * ModalEditUser (Admin)
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - user: {
 *     user_id, username, email, full_name, role_id, status,
 *     birth_date, bio, avatar_url, ...
 *   }
 * - onUpdateAccount: async ({ user_id, username, email }) => Promise<{status, message}>
 * - onResetPassword: async ({ user_id, new_password }) => Promise<{status, message}>
 * - onSetRole: async ({ user_id, role_id }) => Promise<{status, message}>
 * - onSetStatus: async ({ user_id, status }) => Promise<{status, message}>
 *
 * Gợi ý status: "active" | "disabled" | "banned"
 * Gợi ý role:   "ROLE000" (admin) | "ROLE001" (user)
 */

const TABS = ["Account", "Security", "Role"];

export default function ModalEditUser({
  open,
  onClose,
  user,
  onUpdateAccount,
  onResetPassword,
  onSetRole,
  onSetStatus,
}) {
  const [activeTab, setActiveTab] = useState("Account");

  // Banner nhỏ hiển thị thông báo (success / error / info)
  const [banner, setBanner] = useState(null); // {type, text}
  const showBanner = (type, text, ms = 2200) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  // Account form
  const [accUsername, setAccUsername] = useState("");
  const [accEmail, setAccEmail] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // Security form
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [resetting, setResetting] = useState(false);

  // Role form
  const [roleId, setRoleId] = useState("ROLE001");
  const [status, setStatus] = useState("active");
  const [savingRole, setSavingRole] = useState(false);

  // Reset state khi mở/đóng
  useEffect(() => {
    if (!open) {
      setActiveTab("Account");
      setBanner(null);
      setAccUsername("");
      setAccEmail("");
      setNewPass("");
      setNewPass2("");
      setRoleId("ROLE001");
      setStatus("active");
      return;
    }
    // Khi mở, fill từ user
    setAccUsername(user?.username ?? "");
    setAccEmail(user?.email ?? "");
    setRoleId(user?.role_id ?? "ROLE001");
    setStatus(user?.status ?? "active");
  }, [open, user]);

  const userId = user?.user_id;

  const canSaveAccount = useMemo(() => {
    const u = (accUsername || "").trim();
    const e = (accEmail || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    return u.length >= 3 && emailOk;
  }, [accUsername, accEmail]);

  const canReset = useMemo(() => {
    return newPass.length >= 8 && newPass === newPass2;
  }, [newPass, newPass2]);

  const handleSaveAccount = async () => {
    if (!onUpdateAccount || !userId) return;
    if (!canSaveAccount) {
      showBanner("error", "Vui lòng nhập username >= 3 ký tự và email hợp lệ.");
      return;
    }
    try {
      setSavingAccount(true);
      const res = await onUpdateAccount({
        user_id: userId,
        username: accUsername.trim(),
        email: accEmail.trim(),
      });
      if (res?.status === "ok") {
        showBanner("success", res?.message || "Cập nhật tài khoản thành công.");
      } else {
        showBanner("error", res?.message || "Cập nhật tài khoản thất bại.");
      }
    } catch (e) {
      showBanner("error", e?.message || "Lỗi mạng khi cập nhật tài khoản.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleResetPassword = async () => {
    if (!onResetPassword || !userId) return;
    if (!canReset) {
      showBanner("error", "Mật khẩu phải >= 8 ký tự và trùng khớp.");
      return;
    }
    if (!window.confirm("Bạn chắc chắn muốn đặt lại mật khẩu cho tài khoản này?")) return;
    try {
      setResetting(true);
      const res = await onResetPassword({
        user_id: userId,
        new_password: newPass,
      });
      if (res?.status === "ok") {
        showBanner("success", res?.message || "Đã đặt lại mật khẩu.");
        setNewPass("");
        setNewPass2("");
      } else {
        showBanner("error", res?.message || "Đặt lại mật khẩu thất bại.");
      }
    } catch (e) {
      showBanner("error", e?.message || "Lỗi mạng khi đặt lại mật khẩu.");
    } finally {
      setResetting(false);
    }
  };

  const handleSaveRoleStatus = async () => {
    if (!userId) return;
    try {
      setSavingRole(true);
      // Lưu role trước
      let ok = true;
      if (onSetRole) {
        const r = await onSetRole({ user_id: userId, role_id: roleId });
        if (r?.status !== "ok") {
          ok = false;
          showBanner("error", r?.message || "Cập nhật role thất bại.");
        }
      }
      // Lưu status
      if (ok && onSetStatus) {
        const s = await onSetStatus({ user_id: userId, status });
        if (s?.status !== "ok") {
          ok = false;
          showBanner("error", s?.message || "Cập nhật trạng thái thất bại.");
        }
      }
      if (ok) showBanner("success", "Đã cập nhật quyền & trạng thái.");
    } catch (e) {
      showBanner("error", e?.message || "Lỗi mạng khi cập nhật quyền & trạng thái.");
    } finally {
      setSavingRole(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#151922] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Edit account (Admin)</h3>
          <button
            className="px-2 py-1 rounded-md border border-white/10 text-white/80 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Header user info */}
        <div className="text-sm text-white/60 mb-3">
          <div><span className="text-white/40">User ID:</span> {user?.user_id}</div>
          <div><span className="text-white/40">Name:</span> {user?.full_name || user?.username}</div>
          <div><span className="text-white/40">Current role:</span> {user?.role_id}</div>
          <div><span className="text-white/40">Status:</span> {user?.status || "active"}</div>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={
              "mb-3 px-3 py-2 rounded-md text-sm border " +
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

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={
                "px-3 py-1.5 rounded-md text-sm border " +
                (activeTab === t
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/80 border-white/20 hover:text-white")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Account" && (
          <div>
            <label className="block text-sm text-white/80 mb-1">Username</label>
            <input
              className="w-full mb-3 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
              value={accUsername}
              onChange={(e) => setAccUsername(e.target.value)}
              placeholder="username"
            />

            <label className="block text-sm text-white/80 mb-1">Email</label>
            <input
              type="email"
              className="w-full mb-4 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
              value={accEmail}
              onChange={(e) => setAccEmail(e.target.value)}
              placeholder="email@example.com"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md bg-white text-black disabled:opacity-40"
                onClick={handleSaveAccount}
                disabled={!canSaveAccount || savingAccount}
              >
                {savingAccount ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "Security" && (
          <div>
            <label className="block text-sm text-white/80 mb-1">New password</label>
            <input
              type="password"
              className="w-full mb-3 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="≥ 8 ký tự"
            />

            <label className="block text-sm text-white/80 mb-1">Confirm new password</label>
            <input
              type="password"
              className="w-full mb-4 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
              value={newPass2}
              onChange={(e) => setNewPass2(e.target.value)}
              placeholder="nhập lại"
            />

            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>Mẹo: dùng mật khẩu mạnh, ít nhất 8 ký tự.</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md border border-white/10 text-white/80"
                onClick={() => { setNewPass(""); setNewPass2(""); }}
              >
                Clear
              </button>
              <button
                className="px-3 py-1.5 rounded-md bg-white text-black disabled:opacity-40"
                onClick={handleResetPassword}
                disabled={!canReset || resetting}
              >
                {resetting ? "Resetting..." : "Reset password"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "Role" && (
          <div>
            <label className="block text-sm text-white/80 mb-1">Role</label>
            <select
              className="w-full mb-3 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              <option value="ROLE001">ROLE001 — User</option>
              <option value="ROLE000">ROLE000 — Admin</option>
            </select>

            <label className="block text-sm text-white/80 mb-1">Status</label>
            <select
              className="w-full mb-4 px-3 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="banned">Banned</option>
            </select>

            <div className="text-xs text-amber-300/90 mb-3">
              Lưu ý: thay đổi quyền/trạng thái ảnh hưởng đến quyền truy cập hệ thống.
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md bg-white text-black disabled:opacity-40"
                onClick={handleSaveRoleStatus}
                disabled={savingRole}
              >
                {savingRole ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
