// lib/features/auth/authSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  // You can add user information here if your backend returns it
  // user: any | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  // user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      // state.user = null;
    },

    setTokenFromStorage: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload; // Set isAuthenticated based on token presence
    },
  },
});

export const { loginSuccess, logout, setTokenFromStorage } = authSlice.actions;

export default authSlice.reducer;