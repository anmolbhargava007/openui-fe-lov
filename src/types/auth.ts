
export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_mobile: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  updated_by: number;
  is_active: boolean;
  pi_user_prop?: {
    is_reset_pwd: boolean;
    registered_step: number;
    is_verified: string;
    comp_id: number | null;
    branch_id: number | null;
    location_id: number | null;
    user_type: string;
  };
  pi_roles?: {
    role_id: number;
    role_name: string;
  }[];
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
  success: boolean;
  statusCode: string;
  msg: string;
  data?: User[];
  accessToken?: string;
  refreshToken?: string;
}
