import React from 'react';

const LeaderboardTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center gap-2">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm
            ${activeTab === tab 
              ? 'bg-white text-black' 
              : 'bg-[#2C323B] text-white hover:bg-[#3e4550]'
            }
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default LeaderboardTabs;