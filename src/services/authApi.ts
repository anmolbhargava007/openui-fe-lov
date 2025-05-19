
import { SigninRequest, SignupRequest, AuthResponse, User, UserForManagement, ChatHistoryItem } from "@/types/auth";
import { API_BASE_URL } from "@/constants/api";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "An error occurred");
  }
  return response.json();
};

export const authApi = {
  signin: async (credentials: SigninRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse<AuthResponse>(response);
  },

  getUsers: async (roleId: number): Promise<{ data: UserForManagement[] }> => {
    const response = await fetch(`${API_BASE_URL}/user?role_id=${roleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<{ data: UserForManagement[] }>(response);
  },

  updateUser: async (userData: UserForManagement): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse<AuthResponse>(response);
  },

  getUserChatHistory: async (userId: number): Promise<{ data: ChatHistoryItem[] }> => {
    const response = await fetch(`${API_BASE_URL}/prompts?user_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<{ data: ChatHistoryItem[] }>(response);
  },
};
