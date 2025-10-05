import React from "react";

export default function UsersListItem({ user, active, onClick, onEdit, onDelete }) {
  return (
    <div
      className={`w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 border transition-colors ${
        active ? "bg-[#262b33] border-[#2d2d33]" : "bg-[#1C2028] border-[#2d2d33] hover:bg-[#222732]"
      }`}
    >
      <button onClick={onClick} className="flex items-center gap-3 min-w-0 text-left flex-1">
        <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
        <div>
          <div className="text-white font-semibold leading-tight truncate">{user.realName}</div>
          <div className="text-xs text-gray-400 -mt-0.5">{user.userName}</div>
        </div>
      </button>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 rounded-md border border-white/10 text-xs text-white/80 hover:text-white" onClick={onEdit}>
          <i className="fa-regular fa-pen-to-square mr-1" />Edit
        </button>
        <button className="px-2 py-1 rounded-md border border-red-500/30 text-xs text-red-300 hover:text-red-200" onClick={onDelete}>
          <i className="fa-regular fa-trash-can mr-1" />Delete
        </button>
      </div>
    </div>
  );
}
