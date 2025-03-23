// lib/store.tsx

import { configureStore } from '@reduxjs/toolkit';
import propertyReducer from './features/property/propertySlice';
import authReducer from './features/auth/authSlice'; 

// const store = configureStore({
//   reducer: {
    
//   },
// });

export const makeStore = () => {
  return configureStore({
    reducer: {
      property: propertyReducer, // Reducer for property data
      auth: authReducer,
    }
  })
}

export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;
