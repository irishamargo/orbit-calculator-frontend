import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "moderator";
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = { user: null, loading: false, error: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.error = null;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { clearUser, setAuthError, setAuthLoading, setUser } =
  authSlice.actions;
export default authSlice.reducer;
