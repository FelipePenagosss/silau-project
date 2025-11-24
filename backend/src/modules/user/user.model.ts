export interface User {
  id?: number;
  email: string;
  password: string;
  created_at?: string;
}

export interface UserCreateDTO {
  email: string;
  password: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
    token: string;
  };
}
