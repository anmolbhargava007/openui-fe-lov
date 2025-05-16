import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import {
  Workspace,
  Document,
  WorkspaceWithDocuments,
  ChatMessage,
  ChatData,
  LLMResponse,
} from "@/types/api";
import { workspaceApi, documentApi } from "@/services/api";
import { llmApi } from "@/services/llmApi";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext";

interface WorkspaceContextType {
  workspaces: WorkspaceWithDocuments[];
  selectedWorkspace: WorkspaceWithDocuments | null;
  loading: boolean;
  error: string | null;
  createWorkspace: (name: string, userId?: number) => Promise<void>;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  deleteWorkspace: (wsId: number) => Promise<void>;
  selectWorkspace: (workspace: WorkspaceWithDocuments) => void;
  uploadDocument: (file: File) => Promise<boolean>;
  deleteDocument: (docId: number) => Promise<void>;
  refreshWorkspaces: (userId?: number) => Promise<void>;
  sendMessage: (workspaceId: number, message: string) => Promise<void>;
  chatMessages: ChatData;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithDocuments[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceWithDocuments | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatData>({});

  useEffect(() => {
    if (user?.user_id) {
      refreshWorkspaces();
    }
  }, [user?.user_id]);

  const refreshWorkspaces = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await workspaceApi.getAll(user.user_id);
      if (response && Array.isArray(response.data)) {
        const transformed: WorkspaceWithDocuments[] = response.data.map(
          (ws) => ({
            ...ws,
            documents: [],
            messageCount: Math.floor(Math.random() * 50) + 5,
            fileCount: Math.floor(Math.random() * 15) + 1,
          })
        );

        for (const workspace of transformed) {
          try {
            if (workspace.ws_id) {
              const docs = await documentApi.getAll(workspace.ws_id);
              workspace.documents = docs;
              workspace.fileCount = docs.length;
            }
          } catch (err) {
            console.error(
              `Error loading docs for workspace ${workspace.ws_id}:`,
              err
            );
          }
        }

        setWorkspaces(transformed);

        if (selectedWorkspace && selectedWorkspace.ws_id) {
          const updated = transformed.find(
            (w) => w.ws_id === selectedWorkspace.ws_id
          );
          if (updated) setSelectedWorkspace(updated);
        }
      } else {
        throw new Error("Invalid response from API");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load workspaces";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string) => {
    if (!user?.user_id) return;

    try {
      setLoading(true);

      const isDuplicate = workspaces.some(
        (w) => w.ws_name.toLowerCase() === name.toLowerCase()
      );
      if (isDuplicate) {
        toast.error("A workspace with this name already exists.");
        return;
      }

      const newWorkspace: Workspace = {
        ws_name: name,
        user_id: user.user_id,
        is_active: true,
      };

      const response = await workspaceApi.create(newWorkspace);
      if (response.success) {
        toast.success("Workspace created successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to create workspace");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create workspace";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (workspace: Workspace) => {
    try {
      setLoading(true);

      const currentWorkspace = workspaces.find(
        (w) => w.ws_id === workspace.ws_id
      );

      if (currentWorkspace && currentWorkspace.ws_name !== workspace.ws_name) {
        const isDuplicate = workspaces.some(
          (w) =>
            w.ws_id !== workspace.ws_id &&
            w.ws_name.toLowerCase() === workspace.ws_name.toLowerCase()
        );

        if (isDuplicate) {
          toast.error("A workspace with this name already exists.");
          return;
        }
      }
      const response = await workspaceApi.update({
        ...workspace,
        user_id: user.user_id,
      });

      if (response.success) {
        toast.success("Workspace updated successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to update workspace");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update workspace";
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
        if (selectedWorkspace && selectedWorkspace.ws_id === wsId) {
          setSelectedWorkspace(null);
        }

        toast.success("Workspace deleted successfully");
        await refreshWorkspaces();
      } else {
        toast.error("Failed to delete workspace");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete workspace";
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

      if (!file.type.includes("pdf")) {
        toast.error("Only PDF files are supported");
        return false;
      }

      if (selectedWorkspace.ws_id) {
        try {
          await llmApi.uploadDocument(file, selectedWorkspace.ws_id);
        } catch (llmErr) {
          console.error("Failed to upload to LLM API:", llmErr);
        }
      }
      const response = await documentApi.upload(file, {
        ...selectedWorkspace,
        user_id: user.user_id,
      });

      if (response.success) {
        toast.success("Document uploaded successfully");
        await refreshWorkspaces();
        return true;
      } else {
        toast.error("Failed to upload document");
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload document";
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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete document";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    workspaceId: number,
    message: string
  ): Promise<void> => {
    try {
      setLoading(true);

      // Add user message to state immediately
      const userMessage: ChatMessage = {
        id: uuidv4(),
        content: message,
        type: "user",
        timestamp: Date.now(),
      };

      setChatMessages((prev) => {
        const workspaceMessages = prev[workspaceId] || [];
        return {
          ...prev,
          [workspaceId]: [...workspaceMessages, userMessage],
        };
      });

      // Send message to LLM API
      const response = await llmApi.query(message);

      // Add bot response
      const botMessage: ChatMessage = {
        id: uuidv4(),
        content: response.answer,
        type: "bot",
        timestamp: Date.now(),
        sources: response.sources,
      };

      setChatMessages((prev) => {
        const workspaceMessages = prev[workspaceId] || [];
        return {
          ...prev,
          [workspaceId]: [...workspaceMessages, botMessage],
        };
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      toast.error(errorMessage);

      // Add error message as bot response
      const errorBotMessage: ChatMessage = {
        id: uuidv4(),
        content:
          "Sorry, I couldn't process your request. Please try again later.",
        type: "bot",
        timestamp: Date.now(),
      };

      setChatMessages((prev) => {
        const workspaceMessages = prev[workspaceId] || [];
        return {
          ...prev,
          [workspaceId]: [...workspaceMessages, errorBotMessage],
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
    chatMessages,
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
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
