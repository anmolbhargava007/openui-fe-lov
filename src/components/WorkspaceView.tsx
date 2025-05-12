
import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatView from "./ChatView";
import UploadModal from "./UploadModal";

const WorkspaceView = () => {
  const { selectedWorkspace } = useWorkspace();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (!selectedWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="p-8 bg-gray-800 rounded-lg shadow-sm border border-gray-700 max-w-md text-center">
          <FileText className="h-12 w-12 text-[#A259FF] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome to DataGPT
          </h2>
          <p className="text-gray-300 mb-6">
            Select a workspace or create a new one to get started with your
            documents.
          </p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Workspace Header */}
      <header className="border-b border-gray-700 p-4 bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-white">
            <span className="text-[#A259FF]">DataGPT</span> /{" "}
            {selectedWorkspace.ws_name}
          </h1>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-grow overflow-hidden">
        {selectedWorkspace.ws_id && (
          <ChatView 
            workspaceId={selectedWorkspace.ws_id} 
            onUploadClick={() => setIsUploadModalOpen(true)}
          />
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default WorkspaceView;
