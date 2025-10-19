import React, { useMemo, useState } from "react";

export default function AddUserModal({ open, onClose, onSave }) {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  // Hiển thị banner thông báo
  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  // Kiểm tra email và điều kiện hợp lệ
  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const canSave = useMemo(
    () => userName.trim().length >= 3 && emailOk && password.length >= 8,
    [userName, emailOk, password]
  );

  // Chọn ảnh avatar
  const handlePickAvatar = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(String(e.target.result || ""));
    reader.readAsDataURL(file);
  };

  // Reset toàn bộ input
  const resetAll = () => {
    setFullName("");
    setUserName("");
    setEmail("");
    setPassword("");
    setBirthDate("");
    setBio("");
    setAvatarPreview("");
  };

  // Gửi form
  const handleSubmit = async () => {
    if (!canSave)
      return showBanner("error", "Username ≥ 3, email hợp lệ, mật khẩu ≥ 8 ký tự.");
    try {
      setSaving(true);
      await onSave?.({
        full_name: fullName.trim(),
        username: userName.trim(),
        email: email.trim(),
        password,
        birth_date: birthDate || null,
        bio: bio || null,
        avatar_url: avatarPreview || null,
      });
      showBanner("success", "User created successfully!");
      resetAll();
      onClose?.();
    } catch (e) {
      showBanner("error", e?.message || "Register failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "var(--color-overlay-bg)" }}
        onClick={() => {
          resetAll();
          onClose?.();
        }}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[460px] rounded-xl border shadow-2xl"
        style={{
          background: "var(--color-modal-bg)",
          borderColor: "var(--color-modal-border)",
          color: "var(--color-text)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b"
          style={{ borderColor: "var(--color-modal-border)" }}
        >
          <h3 className="text-sm font-semibold">Create user</h3>
          <button
            onClick={() => {
              resetAll();
              onClose?.();
            }}
            className="h-7 w-7 flex items-center justify-center rounded-md border hover:opacity-80"
            style={{
              borderColor: "var(--color-border-soft)",
              color: "var(--color-text-secondary)",
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className="mx-3 mt-2 mb-1 px-2.5 py-1.5 rounded-md text-[12px] border"
            style={{
              background:
                banner.type === "success"
                  ? "rgba(16, 185, 129, 0.18)"
                  : banner.type === "error"
                  ? "rgba(239, 68, 68, 0.18)"
                  : "rgba(255,255,255,0.05)",
              color:
                banner.type === "success"
                  ? "#D1FAE5"
                  : banner.type === "error"
                  ? "#FECACA"
                  : "var(--color-text-secondary)",
              borderColor:
                banner.type === "success"
                  ? "rgba(16, 185, 129, 0.4)"
                  : banner.type === "error"
                  ? "rgba(239, 68, 68, 0.4)"
                  : "var(--color-border-soft)",
            }}
          >
            {banner.text}
          </div>
        )}

        {/* Body */}
        <div className="px-3 py-3 space-y-3">
          <Field label="Full name">
            <Input value={fullName} onChange={setFullName} placeholder="Full name" />
          </Field>

          <Field label="Username">
            <Input value={userName} onChange={setUserName} placeholder="username" />
          </Field>

          <Field label="Email">
            <Input type="email" value={email} onChange={setEmail} placeholder="email@example.com" />
          </Field>

          <Field label="Password" hint="≥ 8 characters">
            <Input type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          </Field>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Birthday">
              <Input type="date" value={birthDate} onChange={setBirthDate} />
            </Field>

            <Field label="Avatar">
              <div className="flex items-center gap-2">
                <label
                  className="inline-flex items-center px-2.5 py-1.5 rounded-md border cursor-pointer text-xs"
                  style={{
                    background: "var(--color-input-bg)",
                    borderColor: "var(--color-border-soft)",
                    color: "var(--color-text)",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePickAvatar(e.target.files?.[0])}
                  />
                  Upload
                </label>
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="preview"
                    className="h-9 w-9 rounded-md object-cover border"
                    style={{ borderColor: "var(--color-border-soft)" }}
                  />
                )}
              </div>
              <p className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>
                Gửi dạng base64 trong <code>avatar_url</code>.
              </p>
            </Field>
          </div>

          <Field label="Biography">
            <textarea
              rows={3}
              className="w-full px-2.5 py-2 rounded-md border outline-none text-[13px]"
              style={{
                background: "var(--color-input-bg)",
                borderColor: "var(--color-border-soft)",
                color: "var(--color-text)",
              }}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about you..."
            />
          </Field>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-3 py-2 border-t"
          style={{ borderColor: "var(--color-modal-border)" }}
        >
          <button
            className="h-[34px] px-3 rounded-md text-sm hover:opacity-80"
            style={{
              background: "var(--color-surface-alt)",
              color: "var(--color-text)",
            }}
            onClick={() => {
              resetAll();
              onClose?.();
            }}
          >
            Cancel
          </button>
          <button
            className="h-[34px] px-3 rounded-md text-sm disabled:opacity-50"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
            disabled={!canSave || saving}
            onClick={handleSubmit}
          >
            {saving ? "Creating..." : "Create user"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny UI helpers (compact) ---------- */
function Field({ label, hint, children }) {
  return (
    <div>
      <label
        className="block text-[11px] mb-1"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      type={type}
      className="h-[36px] w-full px-2.5 rounded-md border outline-none text-[13px] placeholder:opacity-60"
      style={{
        background: "var(--color-input-bg)",
        borderColor: "var(--color-border-soft)",
        color: "var(--color-text)",
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
