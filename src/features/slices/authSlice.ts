import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  login,
  requestPassword,
  resetPassword,
  signup,
} from "../services/authService";
import { AxiosError } from "axios";

// Define types for the user and login/signup responses
interface User {
  id: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Define types for the state
interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: { email: string; token: string } | null;
  message: string | null; // Add message for password reset
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null,
  message: null, // Initialize message state
};

// Utility type for API errors
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Thunks
export const loginThunk = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await login(payload);
      localStorage.setItem("user", JSON.stringify(response)); 
      return response; // Contains { token, user }
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Signup thunk
export const signupThunk = createAsyncThunk<
  AuthResponse,
  SignupPayload,
  { rejectValue: string }
>(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await signup(payload);
      localStorage.setItem("user", JSON.stringify(response)); 
      return response; // Should match { token, user }
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

// Request Password Reset Thunk
export const requestPasswordResetThunk = createAsyncThunk<
  string,
  { email: string },
  { rejectValue: string }
>(
  "auth/requestPasswordReset",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await requestPassword(email);
      return response.message;
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      return rejectWithValue(
        err.response?.data?.message || "Error requesting password reset"
      );
    }
  }
);

// Reset Password Thunk
export const resetPasswordThunk = createAsyncThunk<
  string,
  { email: string; otp: string; newPassword: string },
  { rejectValue: string }
>(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await resetPassword(email, otp, newPassword);
      return response.message;
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      return rejectWithValue(
        err.response?.data?.message || "Error resetting password"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("user"); 
    },
  },
  extraReducers: (builder) => {
    // Login Thunk
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = {
            email: action.payload.user.email,
            token: action.payload.token,
          };
          state.error = null;
        }
      )
      .addCase(
        loginThunk.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Login failed";
        }
      );

    // Signup Thunk
    builder
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signupThunk.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = {
            email: action.payload.user.email,
            token: action.payload.token,
          };
          state.error = null;
        }
      )
      .addCase(
        signupThunk.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Signup failed";
        }
      );

    // Request Password Reset Thunk
    builder
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        requestPasswordResetThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload; // Set the success message
          state.error = null;
        }
      )
      .addCase(
        requestPasswordResetThunk.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Error requesting password reset";
          state.message = null;
        }
      );

    // Reset Password Thunk
    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        resetPasswordThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload; // Set the success message
          state.error = null;
        }
      )
      .addCase(
        resetPasswordThunk.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Error resetting password";
          state.message = null;
        }
      );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
