// src/components/user_manager/list/UsersListItem.jsx
import React, { useState } from "react";

export default function UsersListItem({
  user,
  active,
  onClick,
  onEdit,
  onRequestDelete,   // parent sẽ mở Confirm + gọi API
  onAvatarClick,
}) {
  const [msg, setMsg] = useState(null); // {type:'success'|'error', text:string}

  const handleDelete = (e) => {
    e.stopPropagation();
    setMsg(null);
    onRequestDelete && onRequestDelete(user); // chỉ báo parent
  };

  return (
    <div
      className={`w-full flex flex-col rounded-xl border transition-colors overflow-hidden ${
        active ? "bg-[#262b33] border-[#2d2d33]" : "bg-[#1C2028] border-[#2d2d33] hover:bg-[#222732]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <button onClick={onClick} className="flex items-center gap-3 min-w-0 text-left flex-1">
          <img
            src={user.avatar}
            alt={user.realName || "avatar"}
            className="w-8 h-8 rounded-full cursor-pointer"
            title="Open profile"
            onClick={(e) => {
              e.stopPropagation();
              onAvatarClick && onAvatarClick();
            }}
          />
          <div className="min-w-0">
            <div className="text-white font-semibold leading-tight truncate">{user.realName}</div>
            <div className="text-xs text-gray-400 -mt-0.5">{user.userName}</div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(user); }}
          >
            <i className="fa-regular fa-pen-to-square mr-1" />
            Edit
          </button>
          <button
            className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200"
            onClick={handleDelete}
          >
            <i className="fa-regular fa-trash-can mr-1" />
            Delete
          </button>
        </div>
      </div>

      {msg && (
        <div className={`px-4 pb-3 text-xs ${msg.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
