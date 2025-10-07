// src/pages/user_manager/modals/AddUserModal.jsx
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

  const showBanner = (type, text, ms = 2000) => {
    setBanner({ type, text });
    window.clearTimeout(showBanner._t);
    showBanner._t = window.setTimeout(() => setBanner(null), ms);
  };

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const canSave = useMemo(
    () => userName.trim().length >= 3 && emailOk && password.length >= 8,
    [userName, emailOk, password]
  );

  const handlePickAvatar = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(String(e.target.result || ""));
    reader.readAsDataURL(file);
  };

  const resetAll = () => {
    setFullName(""); setUserName(""); setEmail("");
    setPassword(""); setBirthDate(""); setBio("");
    setAvatarPreview("");
  };

  const handleSubmit = async () => {
    if (!canSave) return showBanner("error", "Username ≥ 3, email hợp lệ, mật khẩu ≥ 8.");
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
    } catch (e) {
      showBanner("error", e?.message || "Register failed");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={() => { resetAll(); onClose?.(); }}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-[460px] bg-[#1F2631] text-white rounded-xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
          <h3 className="text-sm font-semibold">Create user</h3>
          <button
            onClick={() => { resetAll(); onClose?.(); }}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-white/10 text-white/80 hover:text-white"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={
              "mx-3 mt-2 mb-1 px-2.5 py-1.5 rounded-md text-[12px] border " +
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

        {/* Body */}
        <div className="px-3 py-2 space-y-2">
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
                <label className="inline-flex items-center px-2.5 py-1.5 rounded-md border border-white/10 bg-[#0f1420] cursor-pointer text-xs">
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
                    className="h-9 w-9 rounded-md object-cover border border-white/10"
                  />
                )}
              </div>
              <p className="text-[10px] text-white/50 mt-1">Gửi dạng base64 trong <code>avatar_url</code>.</p>
            </Field>
          </div>

          <Field label="Biography">
            <textarea
              rows={3}
              className="w-full px-2.5 py-2 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-[13px] placeholder:text-white/40"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about you..."
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-white/10">
          <button
            className="h-[34px] px-3 rounded-md bg-[#2b3442] text-white/90 hover:bg-[#25303e] text-sm"
            onClick={() => { resetAll(); onClose?.(); }}
          >
            Cancel
          </button>
          <button
            className="h-[34px] px-3 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-50 text-sm"
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
      <label className="block text-[11px] text-white/70 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-white/50 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      type={type}
      className="h-[36px] w-full px-2.5 rounded-md bg-[#0f1420] border border-white/10 outline-none text-white text-[13px] placeholder:text-white/40"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
