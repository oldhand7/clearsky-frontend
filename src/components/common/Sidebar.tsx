import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import SmallLogo from './SmallLogo';
import { useTranslation } from 'react-i18next';
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import {AgentsIcon, CubeIcon, DashboardIcon, FavoritesIcon, HomeIcon, KnowledgebaseIcon, PhoneNumbersIcon, StarIcon, VoiceAgentIcon,} from '../../assets/icons/Icons';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface SidebarItem {
    count?: number;
    icon: JSX.Element;
    label: string;
    path: string;
    subItems?: SidebarItem[];
}

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const initialSidebarState = JSON.parse(localStorage.getItem('sidebarOpen') || 'true');

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(initialSidebarState);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuToggle = (label: string) => {
    setExpandedMenus((prevState) => {
      const newState = { ...prevState, [label]: !prevState[label] };
      Object.keys(newState).forEach((key) => {
        if (key !== label) newState[key] = false;
      });
      return newState;
    });
  };

  const isActive = (path: string): boolean => location.pathname === path;

  const isParentActive = (item: SidebarItem): boolean => {
    return item.subItems?.some((subItem) => isActive(subItem.path)) || false;
  };

  const sidebarItems: SidebarItem[] = [
    { path: '/', icon: <HomeIcon />, label: 'home' },
    { path: '/dashboard', icon: <DashboardIcon />, label: 'dashboard' },
    {
      path: '/agents',
      icon: <AgentsIcon />,
      label: 'agents',
      subItems: [
        { path: '/agents/favorites', label: 'favorites', icon: <FavoritesIcon />, count: 2 },
        { path: '/agents/category-2', label: 'category #2', icon: <StarIcon /> },
        { path: '/agents/category-3', label: 'category #3', icon: <CubeIcon /> },
      ],
    },
    { path: '/phone-numbers', icon: <PhoneNumbersIcon />, label: 'phone_numbers' },
    { path: '/voice-library', icon: <VoiceAgentIcon />, label: 'voice_library' },
    { path: '/knowledge-base', icon: <KnowledgebaseIcon active/>, label: 'knowledge_base' },
  ];

  return (
    <div
      className={`sidebar fixed bottom-12 h-[96%] top-0 transition-transform duration-300 transform lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:block w-[280px] bg-[#2E53DA] rounded-[19px] m-[21px] pt-3 ${
        isSidebarOpen ? 'w-64' : 'w-[95px]'
      } max-w-xstext-gray-200 transition-width duration-300 ease-in-out`}
    >
      <div>
        <div className="flex justify-between items-center mt-[24px] ml-[20px]">
          {isSidebarOpen ? (
            <Link to="/">
              <Logo width={160} height={50} />
            </Link>
          ) : (
            <Link to="/">
              <SmallLogo width={30} height={30} mode="light" />
            </Link>
          )}
          <button onClick={handleSidebarToggle} className="text-white focus:outline-none p-2">
            {isSidebarOpen ? <GoChevronLeft /> : <GoChevronRight />}
          </button>
        </div>
        <hr className="border-white my-[23.5px] mx-[21px]" />

        <p className='font-light px-[21px] text-white'>Your Dashboard</p>
        <ul className="space-y-2 mt-4 px-[16px] font-medium">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <div
                className={`flex justify-between items-center rounded-lg transition duration-300 ${
                  isActive(item.path) || isParentActive(item) || (item.subItems && expandedMenus[item.label])
                    ? 'bg-white text-black'
                    : 'hover:opacity-80 text-white'
                }`}
                onClick={() => (item.subItems ? handleMenuToggle(item.label) : setExpandedMenus({}))}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition duration-300 ${
                    isActive(item.path) || isParentActive(item) || (item.subItems && expandedMenus[item.label])
                      ? 'font-bold text-black'
                      : 'text-white'
                  }`}
                >
                  {item.icon}
                  {isSidebarOpen && <span>{t(item.label)}</span>}
                </Link>
                {item.subItems && isSidebarOpen && (
                  <button onClick={() => handleMenuToggle(item.label)} className="focus:outline-none p-2">
                    {expandedMenus[item.label] ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                )}
              </div>
              {item.subItems && isSidebarOpen && expandedMenus[item.label] && (
                <ul className="ml-2 mt-2 space-y-1">
                  {item.subItems.map((subItem) => <li key={subItem.path} className="hover:opacity-80 rounded-lg">
                    <Link
                      to={subItem.path}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isActive(subItem.path) ? 'bg-white text-black font-bold' : 'text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {subItem.icon}
                        {isSidebarOpen && <span>{t(subItem.label)}</span>}
                      </div>
                      {subItem.count && <span className="text-sm bg-gray-500 text-white rounded-full px-2 py-1">{subItem.count}</span>}
                    </Link>
                  </li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <div className="absolute bottom-4 w-full px-4">
          <p className="text-white text-xs">Powered by ClearSky. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
