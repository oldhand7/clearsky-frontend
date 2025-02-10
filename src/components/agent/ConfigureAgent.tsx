import React, { useState, useEffect } from 'react';
import Tab from './voice/config/Tab';
import { useDispatch, useSelector } from 'react-redux';
import { setId, fetchAgentData } from '../../features/slices/agentSlice';
import { RootState, AppDispatch } from '../../app/store';
import API from '../../utils/API';
import AgentConfig from './voice/config/AgentConfig';
import TranscriberConfig from './voice/config/TranscriberConfig';
import VoiceConfig from './voice/config/VoiceConfig';
import CallConfig from './voice/config/CallConfig';
import FunctionsConfig from './voice/config/FunctionsConfig';
import TasksConfig from './voice/config/TaskConfiguration';
import { useTranslation } from 'react-i18next';
import SpeakToAgent from './SpeakToAgent';
import Chat from './text/Chat';
import KnowledgeBaseConfig from './voice/KnowledgebaseConfig';
import Button from '../lib/Button';
import { CallAddIcon } from '../../assets/icons/Icons';
import EmbedSettingsConfig from './voice/config/EmbedSettingsConfig';
import { v4 as uuidv4 } from 'uuid';

interface Agent {
  id: number;
  name: string;
  model: string;
}

interface AgentsResponse {
  status: number;
  message: string;
  agents: Agent[];
}

const ConfigureAgent: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('Model');
  const [agents, setAgents] = useState<Agent[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const currentId = useSelector((state: RootState) => state.agent.id);
  const currentAgentName = useSelector((state: RootState) => state.agent.agentData?.name);
  const currentAgentType = useSelector((state: RootState) => state.agent.agentData?.agentType);


  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await API.get<AgentsResponse>('/agent/getlist');
        setAgents(response.data.agents);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
  }, []);

  interface AgentSession {
    agentId: number;
    sessionId: string;
  }
  

  
    useEffect(() => {
      const savedAgentId = localStorage.getItem('selectedAgentId');
      const savedAgentSessions = localStorage.getItem('agentSessions');
  
      // Parse existing agent sessions or initialize an empty array
      const agentSessions: AgentSession[] = savedAgentSessions
        ? (JSON.parse(savedAgentSessions) as AgentSession[])
        : [];
  
      if (currentId) {
        // If `currentId` exists, save it and manage its session
        localStorage.setItem('selectedAgentId', currentId.toString());
  
        const existingSession = agentSessions.find(
          (session) => session.agentId === currentId
        );
  
        if (!existingSession) {
          // Add a new session if it doesn't exist
          const newSession: AgentSession = {
            agentId: currentId,
            sessionId: uuidv4(),
          };
          agentSessions.push(newSession);
          localStorage.setItem('agentSessions', JSON.stringify(agentSessions));
        }
  
        dispatch(fetchAgentData(currentId));
      } else if (savedAgentId) {
        // If no `currentId`, try to restore from localStorage
        const id = parseInt(savedAgentId, 10);
  
        if (!isNaN(id)) {
          const existingSession = agentSessions.find(
            (session) => session.agentId === id
          );
  
          if (!existingSession) {
            // Add a new session for the restored agent ID if it doesn't exist
            const newSession: AgentSession = {
              agentId: id,
              sessionId: uuidv4(),
            };
            agentSessions.push(newSession);
            localStorage.setItem('agentSessions', JSON.stringify(agentSessions));
          }
  
          dispatch(setId(id));
          dispatch(fetchAgentData(id));
        } else {
          console.warn('Invalid savedAgentId in localStorage:', savedAgentId);
        }
      } else {
        // Initialize `agentSessions` in localStorage if not present
        if (!savedAgentSessions) {
          localStorage.setItem('agentSessions', JSON.stringify([]));
        }
      }
    }, [currentId, dispatch]);
  


 

  const renderContent = () => {
    console.log('Current Agent Type:', currentAgentType);
    console.log('Active Tab:', activeTab);

    if (currentAgentType === 'TEXT') {
      switch (activeTab) {
        case 'Agent':
          return <AgentConfig />;
        case 'Knowledge Base':
          return <KnowledgeBaseConfig />;
        case 'Chat':
          return <Chat />;
        case 'Embed Settings':
          return <EmbedSettingsConfig />;
        default:
          return <AgentConfig />;
      }
    } else if (currentAgentType === 'VOICE') {
      switch (activeTab) {
        case 'Agent':
          return <AgentConfig />;
        case 'Transcriber':
          return <TranscriberConfig />;
        case 'Knowledge Base':
          return <KnowledgeBaseConfig />;
        case 'Voice':
          return <VoiceConfig />;
        case 'Call':
          return <CallConfig />;
        case 'Functions':
          return <FunctionsConfig />;
        case 'Tasks':
          return <TasksConfig />;
        case 'Embed Settings':
          return <EmbedSettingsConfig />;
        default:
          return <AgentConfig />;
      }
    }
    return <AgentConfig />;
  };




  return (
    <div className="w-[90%] m-8 p-6  rounded-xl   flex-col justify-start items-start gap-8 inline-flex">
      {/* Dropdown for mobile devices */}
      <div className="xl-custom:hidden">
        <select
          value={currentId || ''}
          className="bg-gray-100 dark:bg-gray-800 p-2 rounded w-full"
        >
          <option value="">{t('select_agent')}</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>



      {/* Main content area */}
      <div className="flex flex-col w-full space-y-4">
        <div className="flex justify-between">
         
          <div className="rounded-full text-xl  ">
            {currentAgentType === 'VOICE' && (
              <span className="text-[#475467] text-sm font-semibold  leading-[25px]">$0.05 / min</span>
            )}

              <h2 className='text-3xl text-[#565656] font-bold'>{currentAgentName || t('select_agent')}</h2>
          </div>

          {currentAgentType === 'VOICE' && (
            <div className="flex space-x-4 h-10">
              <Button type='icon-button' className='bg-white '>
                <CallAddIcon />
                <span className='text-black'>
                Receive incoming calls
                </span>
              </Button>
             
       
              <SpeakToAgent />
            </div>
          )}
        </div>


        <Tab onSelect={setActiveTab} agentType={currentAgentType || 'TEXT'} />


        <div className="mt-4">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ConfigureAgent;
