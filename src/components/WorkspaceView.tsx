
import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatView from "./ChatView";
import UploadModal from "./UploadModal";
import WorkspaceDialog from "./WorkspaceDialog";

const WorkspaceView = () => {
  const { selectedWorkspace, workspaces, selectWorkspace } = useWorkspace();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);

  // Auto-select first workspace if available
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      selectWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace, selectWorkspace]);

  if (!selectedWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 light:from-gray-100 light:to-white">
        <div className="p-8 bg-gray-800 dark:bg-gray-800 light:bg-white rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 light:border-gray-200 max-w-md text-center">
          <FileText className="h-12 w-12 text-[#A259FF] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white dark:text-white light:text-gray-800 mb-2">
            Welcome to SalesAdvisor
          </h2>
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 mb-6">
            {workspaces.length > 0 
              ? "Select a workspace or create a new one to get started with your documents."
              : "Create a workspace to get started with your documents."}
          </p>
          {workspaces.length > 0 ? (
            <Button
              onClick={() =>
                document
                  .querySelector('[data-sidebar="trigger"]')
                  ?.dispatchEvent(new MouseEvent("click"))
              }
              className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white"
            >
              View Workspaces
            </Button>
          ) : (
            <Button
              onClick={() => setIsWorkspaceDialogOpen(true)}
              className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Workspace
            </Button>
          )}
        </div>

        <WorkspaceDialog
          isOpen={isWorkspaceDialogOpen}
          onClose={() => setIsWorkspaceDialogOpen(false)}
          mode="create"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-hidden">
        {selectedWorkspace.ws_id && (
          <ChatView
            workspaceId={selectedWorkspace.ws_id}
            onUploadClick={() => setIsUploadModalOpen(true)}
          />
        )}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default WorkspaceView;
