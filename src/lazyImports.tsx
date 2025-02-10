import { lazy } from 'react';

export const Signup = lazy(() => import('./components/auth/Signup'));
export const Login = lazy(() => import('./components/auth/Login'));
export const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
export const Overview = lazy(() => import('./components/dashboard/Overview'));
export const Agents = lazy(() => import('./components/agent/AgentList'));
export const CreateAgent = lazy(() => import('./components/agent/Create'));
export const ConfigureAgent = lazy(() => import('./components/agent/ConfigureAgent'));
export const Profile = lazy(() => import('./components/dashboard/Profile'));
export const PhoneNumbers = lazy(() => import('./components/dashboard/ImportPhoneNumber'));
export const SetNewPassword = lazy(() => import('./components/dashboard/SetNewPassword'));
export const Voices = lazy(() => import('./components/dashboard/Voices'));
export const KnowledgeBase = lazy(() => import('./components/dashboard/KnowledgeBase'));
