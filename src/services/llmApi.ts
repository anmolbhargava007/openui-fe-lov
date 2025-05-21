
import { LLMResponse } from "@/types/api";
import { v4 as uuidv4 } from "uuid";

const LLM_API_BASE_URL = import.meta.env.VITE_API_LLM_URL;

export const llmApi = {
  // Start a new session for workspace
  startSession: async (): Promise<{ success: boolean; session_id?: string }> => {
    try {
      const response = await fetch(`${LLM_API_BASE_URL}/start-session/`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to start session on LLM API");
      }

      const data = await response.json();
      return {
        success: true,
        session_id: data.session_id
      };
    } catch (error) {
      console.error("Error starting session on LLM API:", error);
      return { success: false };
    }
  },

  uploadDocument: async (file: File, sessionId: string): Promise<{ success: boolean; chunks?: number }> => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("session_id", sessionId);

      const response = await fetch(`${LLM_API_BASE_URL}/upload-pdf/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document to LLM API");
      }

      const data = await response.json();
      return {
        success: true,
        chunks: data.chunks
      };
    } catch (error) {
      console.error("Error uploading document to LLM API:", error);
      return { success: false };
    }
  },

  query: async (question: string, sessionId: string): Promise<LLMResponse> => {
    try {
      const response = await fetch(`${LLM_API_BASE_URL}/ask-question/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to query LLM API");
      }

      return await response.json();
    } catch (error) {
      console.error("Error querying LLM API:", error);
      
      return {
        answer: `The server is currently down. Please contact your administrator for assistance.`,
        sources: [
          {
            source_id: uuidv4(),
            summary: "This is a mock summary of the document.",
            file: "sample_document.pdf",
            page: 5,
          },
        ],
      };
    }
  },
};
