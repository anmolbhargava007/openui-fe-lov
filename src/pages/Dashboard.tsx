import React from "react";
import Sidebar from "@/components/Sidebar";
import WorkspaceView from "@/components/WorkspaceView";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-20 border-b border-gray-700 p-4 bg-gray-800 shadow-sm flex items-center justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h1 className="text-2xl font-semibold text-white">
                <span className="text-[#A259FF]">SalesAdvisor</span>
              </h1>
            </div>
            {isAuthenticated && (
              <div className="mr-5">
                <UserMenu />
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto">
            <WorkspaceView />
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
};

export default Dashboard;