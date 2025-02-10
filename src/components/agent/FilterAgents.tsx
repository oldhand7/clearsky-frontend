import React, { useState } from 'react';
import {  TextChatIcon, UserIcon, VoiceIcon } from '../../assets/icons/Icons';

const FilterAgents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All Agents');

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
      <div className="h-10 rounded-lg space-x-[15px] justify-start items-start inline-flex">
        <div
          onClick={() => handleTabClick('Voice Agents')}
          className={`px-4 py-2.5 rounded-lg ${
            activeTab === 'Voice Agents' ? 'bg-[#2C54DA] text-white' : 'bg-white text-[#667085] dark:bg-gray-800 dark:text-gray-300'
          } justify-center items-center gap-2 flex cursor-pointer`}
        >
          {/* Add your VoiceIcon here */}
          <VoiceIcon stroke={activeTab === 'Voice Agents' ? '#FFFFFF' : '#667085'} />
          <div className="text-sm font-semibold  leading-tight">Voice Agents</div>
        </div>
        <div
          onClick={() => handleTabClick('Text-Based Agents')}
          className={`px-4 py-2.5 rounded-lg ${
            activeTab === 'Text-Based Agents' ? 'bg-[#2C54DA] text-white' : 'bg-white text-[#667085] dark:bg-gray-800 dark:text-gray-300'
          }  justify-center items-center gap-2 flex cursor-pointer`}
        >
          <TextChatIcon stroke={activeTab === 'Text-Based Agents' ? '#FFFFFF' : '#667085'}  />
          <div className="text-sm font-semibold  leading-tight">Text-Based Agents</div>
        </div>
        <div
          onClick={() => handleTabClick('All Agents')}
          className={`px-4 py-2.5 rounded-lg ${
            activeTab === 'All Agents' ? 'bg-[#2C54DA] text-white' : 'bg-white text-[#667085] dark:bg-gray-800 dark:text-gray-300'
          }   justify-center items-center gap-2 flex cursor-pointer`}
        >
         <UserIcon stroke={activeTab === 'All Agents' ? '#FFFFFF' : '#667085'} />
          <div className="text-sm font-semibold  leading-tight">All Agents</div>
        </div>
      </div>
    </div>
  );
};

export default FilterAgents;
