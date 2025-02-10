import { RoutesConfig } from './types/routes';
import { Agents, ConfigureAgent, CreateAgent, ForgotPassword, KnowledgeBase, Login, PhoneNumbers, Profile, SetNewPassword, Signup, Voices } from './lazyImports';
import PublicRoute from './components/auth/PublicRoute'; // Import the PublicRoute component
import Chat from './components/agent/text/Chat';
import ChatbotPopup from './components/chat/Chatbot';
import ReactionLogs from './components/agent/text/ReactionLogs';
import ChatTest from './components/ChatTest';

const isLoggedIn = Boolean(localStorage.getItem('user')); // Check if the user is logged in

const routes: RoutesConfig = {
  public: [
    {
      path: '/signup',
      element: (
        <PublicRoute isLoggedIn={isLoggedIn}>
          <Signup />
        </PublicRoute>
      ),
    },
    {
      path: '/login',
      element: (
        <PublicRoute isLoggedIn={isLoggedIn}>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: '/forgot-password',
      element: (
        <PublicRoute isLoggedIn={isLoggedIn}>
          <ForgotPassword />
        </PublicRoute>
      ),
    },
    {
      path: '/c',
      element:<ChatbotPopup />
    }, // Protect '/c' route explicitly
  ],
  private: [
    { path: '/', element: <Agents /> },
    { path: '/agents', element: <Agents /> },
    { path: '/create-agent', element: <CreateAgent /> },
    { path: '/configure-agent', element: <ConfigureAgent /> },
    { path: '/profile', element: <Profile /> },
    { path: '/phone-numbers', element: <PhoneNumbers /> },
    { path: '/update-password', element: <SetNewPassword /> },
    { path: '/voice-library', element: <Voices /> },
    { path: '/knowledge-base', element: <KnowledgeBase /> },
    { path: '/chat', element: <Chat /> },
    { path: '/reaction-logs', element: <ReactionLogs /> },
    { path: '/ct', element: <ChatTest /> },

    {
      path: '/c',
      element:  <ChatbotPopup/>
    }
  ],
};

export default routes;
