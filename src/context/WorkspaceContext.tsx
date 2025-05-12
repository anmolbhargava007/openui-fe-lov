import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { Workspace, Document, WorkspaceWithDocuments, ChatMessage, ChatData, LLMResponse } from "@/types/api";
import { workspaceApi, documentApi } from "@/services/api";
import { llmApi } from "@/services/llmApi";
import { v4 as uuidv4 } from "uuid";

interface WorkspaceContextType {
  workspaces: WorkspaceWithDocuments[];
  selectedWorkspace: WorkspaceWithDocuments | null;
  loading: boolean;
  error: string | null;
  createWorkspace: (name: string) => Promise<void>;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  deleteWorkspace: (wsId: number) => Promise<void>;
  selectWorkspace: (workspace: WorkspaceWithDocuments) => void;
  uploadDocument: (file: File) => Promise<boolean>;
  deleteDocument: (docId: number) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  sendMessage: (workspaceId: number, message: string) => Promise<void>;
  chatMessages: ChatData;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithDocuments[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceWithDocuments | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatData>({});

  // Load workspaces on mount
  useEffect(() => {
    refreshWorkspaces();
  }, []);

  // Refresh workspaces and their documents
  const refreshWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all workspaces
      const response = await workspaceApi.getAll();
      
      if (response && Array.isArray(response.data)) {
        // Transform into WorkspaceWithDocuments
        const transformedWorkspaces: WorkspaceWithDocuments[] = response.data.map(ws => ({
          ...ws,
          documents: [],
          // Mock data - in real app, these would come from the API
          messageCount: Math.floor(Math.random() * 50) + 5,
          fileCount: Math.floor(Math.random() * 15) + 1
        }));
        
        // For each workspace, get its documents
        for (const workspace of transformedWorkspaces) {
          try {
            if (workspace.ws_id) {
              const docs = await documentApi.getAll(workspace.ws_id);
              workspace.documents = docs;
              workspace.fileCount = docs.length; // Update with real count
            }
          } catch (docErr) {
            console.error(`Failed to load documents for workspace ${workspace.ws_id}:`, docErr);
          }
        }
        
        setWorkspaces(transformedWorkspaces);
        
        // If we have a selected workspace, update it
        if (selectedWorkspace && selectedWorkspace.ws_id) {
          const updatedSelected = transformedWorkspaces.find(w => w.ws_id === selectedWorkspace.ws_id);
          if (updatedSelected) {
            setSelectedWorkspace(updatedSelected);
          }
        }
      } else {
        console.error("Invalid response format from API:", response);
        throw new Error("Invalid response from API");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workspaces';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      setLoading(true);
      
      // Check for duplicate workspace
      const isDuplicate = workspaces.some(w => 
        w.ws_name.toLowerCase() === name.toLowerCase());
      
      if (isDuplicate) {
        toast.error("A workspace with this name already exists.");
        return;
      }
      
      const newWorkspace: Workspace = {
        ws_name: name,
        user_id: 1, // Default user ID
        is_active: true
      };
      
      const response = await workspaceApi.create(newWorkspace);
      
      if (response.success) {
        toast.success("Workspace created successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to create workspace");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workspace';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (workspace: Workspace) => {
    try {
      setLoading(true);
      
      // Check for duplicate name if changing the name
      const currentWorkspace = workspaces.find(w => w.ws_id === workspace.ws_id);
      
      if (currentWorkspace && currentWorkspace.ws_name !== workspace.ws_name) {
        const isDuplicate = workspaces.some(w => 
          w.ws_id !== workspace.ws_id && 
          w.ws_name.toLowerCase() === workspace.ws_name.toLowerCase());
        
        if (isDuplicate) {
          toast.error("A workspace with this name already exists.");
          return;
        }
      }
      
      const response = await workspaceApi.update(workspace);
      
      if (response.success) {
        toast.success("Workspace updated successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to update workspace");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workspace';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (wsId: number) => {
    try {
      setLoading(true);
      
      const response = await workspaceApi.delete(wsId);
      
      if (response.success) {
        // If the deleted workspace was selected, clear the selection
        if (selectedWorkspace && selectedWorkspace.ws_id === wsId) {
          setSelectedWorkspace(null);
        }
        
        toast.success("Workspace deleted successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to delete workspace");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workspace';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = (workspace: WorkspaceWithDocuments) => {
    setSelectedWorkspace(workspace);
  };

  const uploadDocument = async (file: File): Promise<boolean> => {
    try {
      if (!selectedWorkspace) {
        toast.error("Please select a workspace first");
        return false;
      }
      
      setLoading(true);
      
      // Check if the file is a PDF
      if (!file.type.includes('pdf')) {
        toast.error("Only PDF files are supported");
        return false;
      }

      // First try to upload to LLM API
      if (selectedWorkspace.ws_id) {
        try {
          await llmApi.uploadDocument(file, selectedWorkspace.ws_id);
        } catch (llmErr) {
          console.error("Failed to upload to LLM API, continuing with regular upload:", llmErr);
        }
      }
      
      // Then upload to regular API
      const response = await documentApi.upload(file, selectedWorkspace);
      
      if (response.success) {
        toast.success("Document uploaded successfully");
        await refreshWorkspaces();
        return true;
      } else {
        toast.error("Failed to upload document");
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId: number) => {
    try {
      setLoading(true);
      
      const response = await documentApi.delete(docId);
      
      if (response.success) {
        toast.success("Document deleted successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add new method for sending messages
  const sendMessage = async (workspaceId: number, message: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Add user message to state immediately
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: message,
        type: 'user',
        timestamp: Date.now()
      };

      setChatMessages(prev => {
        const workspaceMessages = prev[workspaceId] || [];
        return {
          ...prev,
          [workspaceId]: [...workspaceMessages, userMessage]
        };
      });

      // Send message to LLM API
      const response = await llmApi.query(message);

      // Add bot response
      const botMessage: ChatMessage = {
        id: uuidv4(),
        content: response.answer,
        type: 'bot',
        timestamp: Date.now(),
        sources: response.sources
      };

      setChatMessages(prev => {
        const workspaceMessages = prev[workspaceId] || [];
        return {
          ...prev,
          [workspaceId]: [...workspaceMessages, botMessage]
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);

      // Add error message as bot response
      const errorBotMessage: ChatMessage = {
        id: uuidv4(),
        content: "Sorry, I couldn't process your request. Please try again later.",
        type: 'bot',
        timestamp: Date.now()
      };

      setChatMessages(prev => {
        const workspaceMessages = prev[workspaceId] || [];
        return {
          ...prev,
          [workspaceId]: [...workspaceMessages, errorBotMessage]
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const contextValue: WorkspaceContextType = {
    workspaces,
    selectedWorkspace,
    loading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    uploadDocument,
    deleteDocument,
    refreshWorkspaces,
    sendMessage,
    chatMessages
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
