// Authentication service - handles all auth operations

import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  ChangePasswordRequest,
  AuthError,
  User,
  JwtPayload,
} from "@/types/auth";

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Start reactivation (sends email link)
   */
  async initiateReactivation(credentials: LoginRequest): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        "/auth/reactivate/init",
        credentials
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        credentials
      );

      // ✅ Access token returned in response (stored in memory by AuthContext)
      // ✅ Refresh token automatically stored in HTTP-only cookie by browser
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>("/auth/me");
      return response.data.data || null;
    } catch (error) {
      // User not authenticated
      return null;
    }
  }

  /**
   * Refresh access token using HTTP-only cookie
   */
  async refreshToken(): Promise<ApiResponse<RefreshResponse>> {
    try {
      // ✅ Refresh token automatically sent via HTTP-only cookie
      const response = await axiosInstance.post<ApiResponse<RefreshResponse>>(
        "/auth/refresh"
      );

      // ✅ New access token returned in response (stored in memory by AuthContext)
      // ✅ New refresh token automatically stored in HTTP-only cookie by browser
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user - clears tokens and session
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (clears refresh cookie and blacklists tokens)
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      // Even if API call fails, continue with cleanup
      console.error("Logout API error:", error);
    } finally {
      // ✅ Access token cleared from memory by AuthContext
      // ✅ Refresh token cookie cleared by backend
    }
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        `/auth/forgot-password?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        `/auth/reset-password`,
        null,
        {
          params: {
            token,
            newPassword,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        "/auth/change-password",
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        `/auth/verify-email?token=${encodeURIComponent(token)}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(email: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse>(
        `/auth/resend-verification?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;

    try {
      const payload: JwtPayload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  /**
   * Handle API errors and format them consistently
   */
  private handleError(error: any): AuthError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || "An error occurred",
        status: error.response.status,
        errors: error.response.data?.errors,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
