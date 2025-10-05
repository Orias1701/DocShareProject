import React from "react";

export default function ReportInfoPanel() {
  return (
    <div className="bg-[#1C2028] p-6 rounded-xl border border-[#2d2d33]">
      <h3 className="text-lg font-semibold mb-2 text-white">Report Summary</h3>
      <p className="text-white/70 text-sm mb-3">
        Overview of your recent reports and their statuses.
      </p>
      <ul className="text-sm text-gray-300 space-y-1">
        <li><i className="fa-solid fa-clipboard-check text-green-400 mr-2"></i>Closed: <b>8</b></li>
        <li><i className="fa-solid fa-hourglass-half text-yellow-400 mr-2"></i>In review: <b>3</b></li>
        <li><i className="fa-solid fa-circle-exclamation text-red-400 mr-2"></i>Open: <b>5</b></li>
      </ul>
    </div>
  );
}
