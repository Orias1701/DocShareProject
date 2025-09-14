import React from 'react';

/**
 * Component `ProfileHeader`
 * @description Hiển thị phần đầu của trang profile.
 */
const ProfileHeader = ({ avatar, realName, userName, followerCount }) => {
    return (
        <div className="flex justify-between gap-6">
            <div className="flex items-center gap-6">
                <img src={avatar} alt={realName} className="w-36 h-36 rounded-lg border-4 border-[#2d2d33]" />
                <div className="flex-grow">
                    <h1 className="text-4xl font-bold">{realName}</h1>
                    <p className="text-lg text-gray-400">{userName}</p>
                    <p className="text-md text-gray-500 mt-1">{followerCount}</p>
                </div>
            </div>
            <div>
                <button className="bg-[#2C323B] hover:bg-[#3e4550] text-white font-semibold py-2 px-5 rounded-lg transition-colors">
                    <i className="fa-solid fa-pencil mr-2"></i>
                    Edit profile
                </button>
            </div>
        </div>
    );
};

export default ProfileHeader;