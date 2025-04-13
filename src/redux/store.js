import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['tasks/addTask/fulfilled', 'tasks/updateTask/fulfilled'],
        // Ignore these paths in the state
        ignoredPaths: ['tasks.items'],
      },
    }),
});
