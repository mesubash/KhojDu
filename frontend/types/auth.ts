// Auth-related TypeScript types and interfaces

export enum UserRole {
  TENANT = "TENANT",
  LANDLORD = "LANDLORD",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  dateOfBirth?: string;
  occupation?: string;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
  initials?: string;
  bio?: string;
  preferredLocation?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredPropertyType?: string;
  familySize?: number;
  hasPets?: boolean;
  smokingAllowed?: boolean;
  drinkingAllowed?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: string;
  occupation?: string;
}

export interface RegisterResponse {
  message?: string;
}

export interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface AuthError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

// JWT Token payload structure
export interface JwtPayload {
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}
