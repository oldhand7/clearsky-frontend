import { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AgentSettingsIcon,
  KnowledgebaseIcon,
  PhoneIcon,
  TaskIcon,
  ToolsIcon,
  TranscriberIcon,
  VoiceIcon,
} from '../../../../assets/icons/Icons';

interface TabProps {
  onSelect: (tabName: string) => void;
  agentType: string | undefined;
}

const Tab: React.FC<TabProps> = ({ onSelect, agentType }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const allTabs = [
    { name: 'Agent', icon: (isActive: boolean) => <AgentSettingsIcon active={isActive} />, translationKey: 'agent' },
    { name: 'Knowledge Base', icon: (isActive: boolean) => <KnowledgebaseIcon active={isActive} />, translationKey: 'Knowledgebase' },
    { name: 'Transcriber', icon: (isActive: boolean) => <TranscriberIcon active={isActive} />, translationKey: 'transcriber' },
    { name: 'Voice', icon: (isActive: boolean) => <VoiceIcon active={isActive} />, translationKey: 'voice' },
    { name: 'Call', icon: (isActive: boolean) => <PhoneIcon active={isActive} />, translationKey: 'call' },
    { name: 'Functions', icon: (isActive: boolean) => <ToolsIcon active={isActive} />, translationKey: 'functions' },
    { name: 'Tasks', icon: (isActive: boolean) => <TaskIcon active={isActive} />, translationKey: 'tasks' },
  ];

  const chatTab = { name: 'Chat', icon: (isActive: boolean) => <FaCog className={`mr-1 ${isActive ? 'text-blue-500' : ''}`} />, translationKey: 'chat' };

  const embedSettingsTab = {
    name: 'Embed Settings',
    icon: (isActive: boolean) => <FaCog className={`mr-1 ${isActive ? 'text-white' : ''}`} />,
    translationKey: 'embed_settings',
  };

  const filteredTabs =
    agentType === 'TEXT'
      ? [...allTabs.filter((tab) => ['Agent', 'Knowledge Base'].includes(tab.name)), chatTab, embedSettingsTab]
      : [...allTabs];

  const [activeTab, setActiveTab] = useState(filteredTabs[0].name);

  const handleClick = (tabName: string) => {
    setActiveTab(tabName);
    onSelect(tabName);

    if (tabName === 'Chat') {
      navigate('/chat');
    } 
  };

  return (
    <div className="mb-4 p-2 rounded-lg w-full">
      <div className="flex flex-wrap gap-2">
        {filteredTabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleClick(tab.name)}
            className={`flex items-center h-[40px] px-4 space-x-2 rounded-md transition duration-300 ${
              activeTab === tab.name
                ? 'bg-[#2C54DA] text-white font-bold'
                : 'text-gray-700 hover:bg-gray-300 bg-white'
            }`}
          >
            {tab.icon(activeTab === tab.name)} <span>{t(tab.translationKey, tab.name)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tab;
