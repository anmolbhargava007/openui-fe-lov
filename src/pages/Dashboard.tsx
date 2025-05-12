
import React from 'react';
import Sidebar from '@/components/Sidebar';
import WorkspaceView from '@/components/WorkspaceView';
import { WorkspaceProvider } from '@/context/WorkspaceContext';

const Dashboard = () => {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <WorkspaceView />
        </div>
      </div>
    </WorkspaceProvider>
  );
};

export default Dashboard;
