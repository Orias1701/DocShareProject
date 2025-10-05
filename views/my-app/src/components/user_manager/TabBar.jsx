import React from "react";

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active ? "bg-white text-black border-white" : "text-white/80 border-white/10 hover:border-white/30"
    }`}
  >
    {children}
  </button>
);

export default function TabBar({ tabs = [], active, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-[#0F1218] p-1 rounded-full w-fit border border-white/10 mb-4">
      {tabs.map((tab) => (
        <TabButton key={tab} active={active === tab} onClick={() => onChange(tab)}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </TabButton>
      ))}
    </div>
  );
}
