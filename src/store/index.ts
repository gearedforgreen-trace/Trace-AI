import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';

// Import all API slices to register them with the store
import './api/organizationsApi';
import './api/storesApi';
import './api/binsApi';
import './api/couponsApi';
import './api/materialsApi';
import './api/rewardRulesApi';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Add all API reducers
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // Add middleware for RTK Query's caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
// This will refetch data when the app regains focus or reconnects after being offline
setupListeners(store.dispatch);

// Export store types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;