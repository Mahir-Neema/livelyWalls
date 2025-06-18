// lib/features/auth/authSlice.tsx
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  profilePicture: string | null;
  // You can add user information here if your backend returns it
  // user: any | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  profilePicture: null,
  // user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; profilePicture?: string | null }>
    ) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.profilePicture = action.payload.profilePicture || null;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.profilePicture = null;
      // state.user = null;
    },

    setTokenFromStorage: (
      state,
      action: PayloadAction<{
        token: string | null;
        profilePicture?: string | null;
      }>
    ) => {
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
      state.profilePicture = action.payload.profilePicture || null;
    },
  },
});

export const { loginSuccess, logout, setTokenFromStorage } = authSlice.actions;

export default authSlice.reducer;
