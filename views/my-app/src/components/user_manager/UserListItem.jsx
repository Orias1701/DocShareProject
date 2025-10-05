import React from "react";

export default function UserListItem({ user, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(user)}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
        selected ? "bg-gray-700/50" : "hover:bg-gray-700/30"
      }`}
    >
      <img src={user.avatar} alt={user.realName} className="w-12 h-12 rounded-full" />
      <div>
        <p className="text-white font-semibold">{user.realName}</p>
        <p className="text-gray-400 text-sm">{user.userName}</p>
      </div>
    </div>
  );
}
