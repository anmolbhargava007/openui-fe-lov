
import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatView from "./ChatView";
import UploadModal from "./UploadModal";
import WorkspaceDialog from "./WorkspaceDialog";

const WorkspaceView = () => {
  const { workspaces, selectedWorkspace, selectWorkspace, loading } = useWorkspace();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);

  // Auto-select first workspace on initial load if workspaces exist
  useEffect(() => {
    if (!loading && workspaces.length > 0 && !selectedWorkspace) {
      selectWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace, loading, selectWorkspace]);

  if (!selectedWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="p-8 bg-gray-800 rounded-lg shadow-sm border border-gray-700 max-w-md text-center">
          <FileText className="h-12 w-12 text-[#A259FF] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome to SalesAdvisor
          </h2>
          {workspaces.length === 0 ? (
            <>
              <p className="text-gray-300 mb-6">
                Create a workspace to get started with your documents.
              </p>
              <Button 
                onClick={() => setIsWorkspaceDialogOpen(true)}
                className="bg-[#A259FF] hover:bg-[#A259FF]/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Workspace
              </Button>
            </>
          ) : (
            <p className="text-gray-300 mb-6">
              Select a workspace or create a new one to get started with your documents.
            </p>
          )}
        </div>

        {/* Workspace Creation Dialog */}
        <WorkspaceDialog
          isOpen={isWorkspaceDialogOpen}
          onClose={() => setIsWorkspaceDialogOpen(false)}
          workspace={null}
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
