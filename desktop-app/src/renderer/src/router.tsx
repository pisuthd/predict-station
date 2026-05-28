import { createHashRouter } from 'react-router';
import DashboardLayout from './components/layout/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import ChatPage from './pages/ChatPage';
import RecentFormsPage from './pages/RecentFormsPage';
import FormDetailPage from './pages/FormDetailPage';
import FormSubmissionsPage from './pages/FormSubmissionsPage';
import NewFormPage from './pages/NewFormPage';
import SessionsPage from './pages/SessionsPage';
import ToolsPage from './pages/ToolsPage';
import SettingsPage from './pages/SettingsPage';
export const router = createHashRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'new-form', element: <NewFormPage /> },
      { path: 'recent-forms', element: <RecentFormsPage /> },
      { path: 'form/:slug', element: <FormDetailPage /> },
      { path: 'form/:slug/responses', element: <FormSubmissionsPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
