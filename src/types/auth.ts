
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signin: (credentials: SigninRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
  expiryDate: string | null;
  userRole: UserRole;
}

export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  token?: string;
  role_id?: number;
}

export enum UserRole {
  Admin = 1,
  User = 2,
}

export interface SigninRequest {
  user_email: string;
  user_pwd: string;
}

export interface SignupRequest {
  user_name: string;
  user_email: string;
  user_pwd: string;
  user_mobile: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  is_active: boolean;
}

export interface AuthResponse {
  data: User[];
  message: string;
  success: boolean;
}

export interface LoginRequest {
  user_email: string;
  user_pwd: string;
}
