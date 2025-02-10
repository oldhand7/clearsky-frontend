import { useEffect, useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/API';
import { useDispatch } from 'react-redux';
import { setId } from '../../features/slices/agentSlice';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { fetchUserProfile } from '../../features/slices/profileSlice';
import { AppDispatch } from '../../app/store';
import { toast, ToastContainer } from 'react-toastify';
import Modal from '../common/Modal';
import Button from '../lib/Button';
import { useTranslation } from 'react-i18next';
import CreateAgent from './Create';
import ExploreAgents from './Explore';
import { DeleteIcon } from '../../assets/icons/Icons';
import FilterAgents from './FilterAgents';

interface Agent {
  agentType: string;
  id: number;
  name: string;
  model: string;
  uniqueId: string;
  createdAt: string;
  deployed: boolean;
}

interface AgentsResponse {
  status: number;
  message: string;
  agents: Agent[];
}

const ConfirmDeleteModal: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void }> = ({ isOpen, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="bg-white dark:bg-gray-800 mx-auto p-6 rounded-lg max-w-md sm:w-[400px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div className="w-12 h-12 bg-[#fee3e1] dark:bg-[#7f1d1d] rounded-[28px] border-8 border-[#fef2f1] dark:border-[#5a1a1a] justify-center items-center inline-flex">
        <DeleteIcon />
      </div>

      <div className='mt-4'>
        <div className="text-[#101828] dark:text-white text-xl font-bold leading-9">{t('modal_delete_title')}</div>
        <div className="text-[#475466] dark:text-gray-300 text-base font-medium leading-[30px]">{t('modal_delete_confirmation')}</div>
      </div>
      <div className="w-[352px] h-[0px] border border-[#eaecf0] dark:border-gray-700 mt-6"></div>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="light" onClick={onCancel} className='w-full' radius='full'>
          {t('button_cancel')}
        </Button>
        <Button variant="error" onClick={onConfirm} className='w-full' radius='full'>
          {t('button_confirm')}
        </Button>
      </div>
    </Modal>
  );
};

const AgentCard: React.FC<{ agent: Agent; onDeleteClick: (agent: Agent) => void }> = ({ agent, onDeleteClick }) => {


  const { t } = useTranslation('agents_module');

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleCardClick = () => {
    dispatch(setId(agent.id));
    navigate('/configure-agent');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(agent);
  };

  return (
    <div
      className="w-[349px] pb-6 p-6 bg-white dark:bg-transparent rounded-xl   dark:border-gray-700 flex-col justify-start items-start gap-6 inline-flex"
    >
      <div className='flex items-center justify-between w-full'>
        <div className="w-[71px] h-[71px] bg-[#f0ebff] dark:bg-[#4c1d95] rounded-full"></div>

      </div>
      <div className='flex  justify-between w-full'>
        <div>
          <div className=" text-[#344053] dark:text-white text-base font-bold leading-tight">{agent.name}</div>
          <div className="text-[#667085] dark:text-gray-400 text-sm font-semibold leading-tight">{agent.agentType === "TEXT" ? t('agentTypeText') : t('agentTypeVoice')}</div>
        </div>

        <div className='text-xs'>
          {agent.deployed ? (
            <div className='bg-[#027A48] py-1 px-3 rounded-full bg-opacity-10 text-[##027A48] font-bold '>{t('status_deployed')}</div>
          ) : (
            <div className='bg-[#EF4444] py-1 px-3 rounded-full bg-opacity-10 text-[#EF4444] font-bold '>{t('status_not_deployed')}</div>
          )}
        </div>
      </div>
      <div className="w-[301px] h-[0px] border border-[#eaecf0] dark:border-gray-700"></div>
      <div className="text-[#667085] dark:text-gray-400 text-sm font-semibold leading-[25px]">{t('summary_agent_purpose')}</div>

      <div className='flex justify-between w-full space-x-3'>
        <Button className='w-full' onClick={handleCardClick}>
          {t('action_open')}
        </Button>
        <div className="w-10 h-10 flex-col justify-start items-start gap-4 inline-flex" onClick={handleDeleteClick}>
          <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow border border-[#d0d5dd] dark:border-gray-600 justify-center items-center gap-2 inline-flex">
            <RiDeleteBin6Line size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Agents: React.FC = () => {
  const { t } = useTranslation('agents_module');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await API.get<AgentsResponse>('/agent/getlist');
        const agentsData = response?.data.agents;
        if (agentsData) {
          setAgents(agentsData);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleDelete = (id: number) => {
    setAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== id));
  };

  const handleDeleteClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAgent) {
      try {
        await API.delete(`/agent/remove/${selectedAgent.id}`);
        toast.success(t('toast_success_agent_removed'));
        handleDelete(selectedAgent.id);
      } catch (error) {
        toast.error(t('toast_error_agent_removal'));
      } finally {
        setIsModalOpen(false);
        setSelectedAgent(null);
      }
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="p-8 min-h-screen dark:text-white">
      <div className='flex justify-between'>
        <div>
          <div className="text-[#475466] dark:text-gray-300 text-base font-medium leading-[30px]">{t('description_manage_agents')}</div>

          <h2 className="text-[#565656] dark:text-white text-3xl font-bold leading-9">{t('title_agent_management')}</h2>
        </div>
        <div className='flex gap-x-6 items-center'>
          <ExploreAgents />
          <CreateAgent />

          <div className='h-10 px-3.5 py-3 bg-white dark:bg-gray-800 rounded-lg    justify-start items-center gap-2 inline-flex'>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"> <path d="M17.5 17.5L14.5834 14.5833M16.6667 9.58333C16.6667 13.4954 13.4954 16.6667 9.58333 16.6667C5.67132 16.6667 2.5 13.4954 2.5 9.58333C2.5 5.67132 5.67132 2.5 9.58333 2.5C13.4954 2.5 16.6667 5.67132 16.6667 9.58333Z" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" /> </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('search_agents')} // Translated placeholder
              className="bg-transparent text-[#344053] dark:text-white outline-none"
            />
          </div>
          <div className='w-[51px] h-[51px] rounded-full bg-white flex justify-center items-center'>
          <svg width="22" height="27" viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M11 26.8125C12.5125 26.8125 13.75 25.575 13.75 24.0625H8.25C8.25 25.575 9.4875 26.8125 11 26.8125ZM19.25 18.5625V11.6875C19.25 7.46625 17.0087 3.9325 13.0625 2.9975V2.0625C13.0625 0.92125 12.1412 0 11 0C9.85875 0 8.9375 0.92125 8.9375 2.0625V2.9975C5.005 3.9325 2.75 7.4525 2.75 11.6875V18.5625L0 21.3125V22.6875H22V21.3125L19.25 18.5625ZM16.5 19.9375H5.5V11.6875C5.5 8.2775 7.57625 5.5 11 5.5C14.4237 5.5 16.5 8.2775 16.5 11.6875V19.9375Z" fill="#2C54DA"/> </svg>
          </div>

        </div>
      </div>

      <ToastContainer position="bottom-center" />

      <div className="flex justify-between flex-wrap my-6 gap-4">
        <FilterAgents/>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex gap-6 flex-wrap">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDeleteClick={handleDeleteClick} />
          ))}
        </div>
      )}

      <ConfirmDeleteModal isOpen={isModalOpen} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </div>
  );
};

export default Agents;
