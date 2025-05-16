
import { SigninRequest, SignupRequest, AuthResponse } from "@/types/auth";

const API_BASE_URL = "http://15.206.121.90:1909/api/v1";

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
};