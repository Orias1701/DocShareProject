import React from "react";

export default function PostInfoPanel() {
  return (
    <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33]">
      <h3 className="text-lg font-semibold mb-2 text-white">Post Overview</h3>
      <p className="text-white/70 text-sm mb-3">
        Manage and review posts here. You can add, edit, or delete posts.
      </p>
      <ul className="text-sm text-gray-300 space-y-1">
        <li><i className="fa-regular fa-file-lines mr-2 text-sky-400"></i>Total posts: <b>42</b></li>
        <li><i className="fa-regular fa-heart mr-2 text-red-400"></i>Average likes: <b>120</b></li>
        <li><i className="fa-regular fa-comment mr-2 text-green-400"></i>Comments today: <b>15</b></li>
      </ul>
    </div>
  );
}
