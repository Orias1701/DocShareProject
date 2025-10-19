import React, { useEffect, useMemo, useState } from "react";

const TABS = ["Hồ sơ", "Đăng nhập"];

export default function ModalEditUser({
  open,
  onClose,
  user,
  onUpdateAccount,
  onResetPassword,
  onUpdateProfile,
  onSetRole,
  profileTemplate,
}) {
  const [activeTab, setActiveTab] = useState("Hồ sơ");
  const [banner, setBanner] = useState(null);

  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  // PROFILE
  const initialProfile = useMemo(() => {
    const base = profileTemplate || {
      full_name: user?.full_name ?? "",
      birth_date: user?.birth_date ?? "",
      bio: user?.bio ?? "",
      avatar_url: user?.avatar_url ?? "",
    };
    return JSON.parse(JSON.stringify(base));
  }, [profileTemplate, user]);

  const [profile, setProfile] = useState(initialProfile);
  const [savingProfile, setSavingProfile] = useState(false);

  // ACCOUNT
  const [accUsername, setAccUsername] = useState("");
  const [accEmail, setAccEmail] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // PASSWORD
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [resetting, setResetting] = useState(false);

  // ROLE
  const [roleId, setRoleId] = useState("ROLE001");
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveTab("Hồ sơ");
      setBanner(null);
      setProfile(initialProfile);
      setAccUsername("");
      setAccEmail("");
      setNewPass("");
      setNewPass2("");
      setRoleId("ROLE001");
      return;
    }
    setProfile(initialProfile);
    setAccUsername(user?.username ?? "");
    setAccEmail(user?.email ?? "");
    setRoleId(user?.role_id ?? "ROLE001");
  }, [open, user, initialProfile]);

  const userId = user?.user_id;

  const canSaveProfile = useMemo(() => {
    const fullName = (profile?.full_name || "").trim();
    if (fullName && fullName.length < 2) return false;
    const bio = profile?.bio || "";
    if (bio.length > 500) return false;
    const bd = profile?.birth_date;
    if (bd && !/^\d{4}-\d{2}-\d{2}$/.test(bd)) return false;
    return true;
  }, [profile]);

  const canSaveAccount = useMemo(() => {
    const e = (accEmail || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }, [accEmail]);

  const canReset = useMemo(
    () => newPass.length >= 8 && newPass === newPass2,
    [newPass, newPass2]
  );

  const handleSaveProfile = async () => {
    if (!userId) return;
    if (!canSaveProfile) return showBanner("error", "Hồ sơ chưa hợp lệ.");
    if (!onUpdateProfile) return showBanner("info", "Thiếu onUpdateProfile.");
    try {
      setSavingProfile(true);
      const res = await onUpdateProfile({ user_id: userId, profile });
      res?.status === "ok"
        ? showBanner("success", res?.message || "Đã cập nhật hồ sơ.")
        : showBanner("error", res?.message || "Cập nhật hồ sơ thất bại.");
    } catch (e) {
      showBanner("error", e?.message || "Lỗi mạng khi cập nhật hồ sơ.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveLoginAndRoleAndMaybePassword = async () => {
    if (!userId) return;
    if (!canSaveAccount) return showBanner("error", "Email không hợp lệ.");
    try {
      setSavingAccount(true);
      const resAcc = await onUpdateAccount?.({
        user_id: userId,
        email: accEmail.trim(),
      });
      if (resAcc?.status !== "ok")
        return showBanner("error", resAcc?.message || "Cập nhật email thất bại.");
    } catch (e) {
      return showBanner("error", e?.message || "Lỗi khi cập nhật tài khoản.");
    } finally {
      setSavingAccount(false);
    }

    if (typeof onSetRole === "function" && roleId !== (user?.role_id ?? "ROLE001")) {
      try {
        setSavingRole(true);
        const r = await onSetRole({ user_id: userId, role_id: roleId });
        if (r?.status !== "ok")
          return showBanner("error", r?.message || "Cập nhật quyền thất bại.");
      } catch (e) {
        return showBanner("error", e?.message || "Lỗi khi cập nhật quyền.");
      } finally {
        setSavingRole(false);
      }
    }

    const wantReset = newPass.length > 0 || newPass2.length > 0;
    if (wantReset) {
      if (!canReset) return showBanner("error", "Mật khẩu ≥ 8 ký tự và trùng khớp.");
      if (!window.confirm("Đặt lại mật khẩu cho tài khoản này?"))
        return showBanner("info", "Đã huỷ đặt lại mật khẩu.");
      try {
        setResetting(true);
        const resPw = await onResetPassword?.({
          user_id: userId,
          new_password: newPass,
        });
        if (resPw?.status !== "ok")
          return showBanner("error", resPw?.message || "Đặt lại mật khẩu thất bại.");
        setNewPass("");
        setNewPass2("");
      } catch (e) {
        return showBanner("error", e?.message || "Lỗi khi đặt lại mật khẩu.");
      } finally {
        setResetting(false);
      }
    }

    showBanner("success", "Đã lưu thay đổi đăng nhập.");
  };

  const handlePrimarySave = async () => {
    if (activeTab === "Hồ sơ") await handleSaveProfile();
    else await handleSaveLoginAndRoleAndMaybePassword();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 z-0"
        style={{ background: "var(--color-overlay-bg)" }}
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[560px] rounded-2xl border shadow-2xl flex flex-col"
        style={{
          background: "var(--color-modal-bg)",
          borderColor: "var(--color-modal-border)",
          color: "var(--color-text)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <h3 className="text-[17px] font-semibold">Edit account</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md border hover:opacity-80"
            style={{
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text-secondary)",
            }}
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3">
          {banner && (
            <div
              className="mb-3 px-3 py-2 rounded-md text-xs border"
              style={{
                background:
                  banner.type === "success"
                    ? "rgba(16,185,129,0.18)"
                    : "rgba(239,68,68,0.18)",
                color:
                  banner.type === "success" ? "#D1FAE5" : "#FECACA",
                borderColor:
                  banner.type === "success"
                    ? "rgba(16,185,129,0.4)"
                    : "rgba(239,68,68,0.4)",
              }}
            >
              {banner.text}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="px-3 py-1.5 rounded-full text-xs border"
                style={{
                  background:
                    activeTab === t
                      ? "var(--color-accent)"
                      : "transparent",
                  color:
                    activeTab === t
                      ? "#fff"
                      : "var(--color-text-secondary)",
                  borderColor:
                    activeTab === t
                      ? "var(--color-accent)"
                      : "var(--color-border-soft)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "Hồ sơ" && (
            <div>
              <div
                className="text-xs space-y-1 mb-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <div>User ID: {user?.user_id}</div>
                <div>Username: {user?.username}</div>
                <div>Email: {user?.email}</div>
              </div>

              {Object.keys(profile || {}).map((k) => {
                if (k === "bio")
                  return (
                    <div key={k} className="mb-3">
                      <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                        Biography
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-md border outline-none text-sm"
                        style={{
                          background: "var(--color-input-bg)",
                          borderColor: "var(--color-border-soft)",
                          color: "var(--color-text)",
                        }}
                        value={profile[k] || ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, [k]: e.target.value }))
                        }
                      />
                    </div>
                  );

                const label =
                  k === "full_name"
                    ? "Your name"
                    : k === "birth_date"
                    ? "Birthday"
                    : k === "avatar_url"
                    ? "Avatar URL"
                    : k;

                return (
                  <div key={k} className="mb-3">
                    <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                      {label}
                    </label>
                    <input
                      type={k === "birth_date" ? "date" : "text"}
                      className="h-[42px] w-full px-3 rounded-md border outline-none text-sm"
                      style={{
                        background: "var(--color-input-bg)",
                        borderColor: "var(--color-border-soft)",
                        color: "var(--color-text)",
                      }}
                      value={profile[k] || ""}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, [k]: e.target.value }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "Đăng nhập" && (
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                Username (read-only)
              </label>
              <input
                className="h-[42px] w-full mb-3 px-3 rounded-md border outline-none text-sm"
                style={{
                  background: "var(--color-input-bg)",
                  borderColor: "var(--color-border-soft)",
                  color: "var(--color-text-muted)",
                }}
                value={accUsername || user?.username || ""}
                readOnly
              />

              <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                className="h-[42px] w-full mb-4 px-3 rounded-md border outline-none text-sm"
                style={{
                  background: "var(--color-input-bg)",
                  borderColor: "var(--color-border-soft)",
                  color: "var(--color-text)",
                }}
                value={accEmail}
                onChange={(e) => setAccEmail(e.target.value)}
              />

              <div className="mb-4">
                <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                  Role
                </label>
                <select
                  className="h-[42px] w-full px-3 rounded-md border outline-none text-sm"
                  style={{
                    background: "var(--color-input-bg)",
                    borderColor: "var(--color-border-soft)",
                    color: "var(--color-text)",
                  }}
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  <option value="ROLE011">ROLE011 — User</option>
                  <option value="ROLE000">ROLE000 — Admin</option>
                </select>
              </div>

              <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                New password
              </label>
              <input
                type="password"
                className="h-[42px] w-full mb-3 px-3 rounded-md border outline-none text-sm"
                style={{
                  background: "var(--color-input-bg)",
                  borderColor: "var(--color-border-soft)",
                  color: "var(--color-text)",
                }}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="≥ 8 ký tự"
              />

              <label className="block text-xs mb-1" style={{ color: "var(--color-text-secondary)" }}>
                Confirm new password
              </label>
              <input
                type="password"
                className="h-[42px] w-full mb-1 px-3 rounded-md border outline-none text-sm"
                style={{
                  background: "var(--color-input-bg)",
                  borderColor: "var(--color-border-soft)",
                  color: "var(--color-text)",
                }}
                value={newPass2}
                onChange={(e) => setNewPass2(e.target.value)}
              />
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--color-border-soft)" }}
        >
          <button
            className="h-[38px] px-4 rounded-md hover:opacity-80"
            style={{
              background: "var(--color-surface-alt)",
              color: "var(--color-text)",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-[38px] px-4 rounded-md disabled:opacity-50"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
            onClick={handlePrimarySave}
            disabled={
              activeTab === "Hồ sơ"
                ? savingProfile || !canSaveProfile
                : savingAccount || savingRole || resetting || !canSaveAccount
            }
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
