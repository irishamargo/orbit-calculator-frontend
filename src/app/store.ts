import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import orbitsReducer from "../features/orbits/orbitsSlice";

export const store = configureStore({
  reducer: { auth: authReducer, orbits: orbitsReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
