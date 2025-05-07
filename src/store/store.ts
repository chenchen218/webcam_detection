// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import faceDetectReducer from "../features/faceDetectSlice"; // Ensure path is correct
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Configure the Redux store
export const store = configureStore({
  // Combine all reducers here. 'faceDetect' is the key for the state slice.
  reducer: {
    faceDetect: faceDetectReducer,
    // Add other slice reducers here if your app grows:
    // e.g., settings: settingsReducer,
  },
  // Redux Toolkit includes default middleware like redux-thunk and checks for
  // immutability and serializability, which is generally good.
  // Avoid putting non-serializable values (like functions, Promises, class instances)
  // in state or actions unless you have a specific reason and configure middleware accordingly.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types or specific paths if necessary, but try to avoid non-serializable data.
        // ignoredActions: ['your/action/type'],
        // ignoredPaths: ['some.path.to.ignore'],
      },
    }),
  // Enable Redux DevTools Extension integration automatically (in development)
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` type from the store itself
// This represents the overall shape of your entire Redux state
export type RootState = ReturnType<typeof store.getState>;

// Infer the `AppDispatch` type from the store
// This type includes middleware types, helpful for dispatching thunks etc.
export type AppDispatch = typeof store.dispatch;

// Define typed hooks for convenience and type safety throughout the app
// Use these instead of the plain `useDispatch` and `useSelector` from 'react-redux'
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
