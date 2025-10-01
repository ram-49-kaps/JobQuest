import { configureStore } from '@reduxjs/toolkit';
import filterReducer from '../redux/AllJobs/filterSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    auth: authReducer,
  },
});

export default store;