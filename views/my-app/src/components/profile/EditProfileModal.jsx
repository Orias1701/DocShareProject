// src/components/profile/EditProfileModal.jsx
import React, { useMemo, useState } from "react";
import Modal from "../common/Modal"; // đường dẫn tới Modal bạn đã dán

// format 'YYYY-MM-DD' cho <input type="date">
function toDateInputValue(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const EditProfileModal = ({ isOpen, onClose, user, onSubmit }) => {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [birthDate, setBirthDate] = useState(
    toDateInputValue(user?.birth_date || user?.birthday)
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useMemo(() => {
    setFullName(user?.full_name || "");
    setBio(user?.bio || "");
    setBirthDate(toDateInputValue(user?.birth_date || user?.birthday));
    setPreviewUrl(user?.avatar_url || "");
    setAvatarFile(null);
    setError("");
  }, [user, isOpen]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setAvatarFile(f || null);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        full_name: fullName.trim(),
        bio: bio.trim(),
        birth_date: birthDate || null,
        avatar: avatarFile || undefined,   // 👈 đúng key "avatar" để PHP nhận file
      };
      console.log("[EditProfile] submit payload:", payload);
      await onSubmit(payload);             // 👈 gọi sang ProfilePage
    } catch (err) {
      setError(err?.message || "Cập nhật thất bại");
      setSaving(false);
      return;
    }
    setSaving(false);
    onClose();                             // đóng modal sau khi ok
  };


  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose}>
      <h3 className="text-xl font-semibold mb-4">Edit profile</h3>

      <form onSubmit={submit} className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <img
            src={previewUrl || "https://i.pravatar.cc/150?img=1"}
            alt="avatar"
            className="w-20 h-20 rounded-lg border border-[#2d2d33] object-cover"
          />
          <label className="cursor-pointer bg-[#2C323B] hover:bg-[#3e4550] text-white text-sm py-2 px-3 rounded-lg">
            <i className="fa-solid fa-upload mr-2" />
            Change avatar
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {/* Full name */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">Your name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#141821] border border-[#2d2d33] rounded-lg px-3 py-2 text-white outline-none"
            placeholder="Your name"
            required
          />
        </div>

        {/* Username: chỉ hiển thị, không sửa ở API này */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">Your username</label>
          <input
            value={user?.username || ""}
            disabled
            className="w-full bg-[#11151d] border border-[#2d2d33] rounded-lg px-3 py-2 text-gray-400 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            (Username không cập nhật tại đây)
          </p>
        </div>

        {/* Biography */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">Biography</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-[#141821] border border-[#2d2d33] rounded-lg px-3 py-2 text-white outline-none resize-y"
            placeholder="Write something about you..."
          />
        </div>

        {/* Birthday */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">Birthday</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-[#141821] border border-[#2d2d33] rounded-lg px-3 py-2 text-white outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-900/40 text-red-200 border border-red-700 rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#2C323B] text-white hover:bg-[#3e4550] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
