
import { LLMResponse } from "@/types/api";
import { v4 as uuidv4 } from "uuid";

const LLM_API_BASE_URL = "https://llmdemoapi.in";

export const llmApi = {
  uploadDocument: async (file: File, workspaceId: number): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("workspace_id", workspaceId.toString());

      const response = await fetch(`${LLM_API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document to LLM API");
      }

      return true;
    } catch (error) {
      console.error("Error uploading document to LLM API:", error);
      // Return false but don't throw error to continue with original API
      return false;
    }
  },

  query: async (question: string): Promise<LLMResponse> => {
    try {
      const response = await fetch(`${LLM_API_BASE_URL}/query`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Using query parameters for GET request
        // In a real implementation, this might be a POST request with a body instead
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Failed to query LLM API");
      }

      return await response.json();
    } catch (error) {
      console.error("Error querying LLM API:", error);
      
      // Return mock data for testing when API fails
      return {
        answer: `This is a mock answer to your question: "${question}". The LLM API is currently unavailable.`,
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
