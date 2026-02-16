import { configureStore } from '@reduxjs/toolkit';
import tharunAuthSlice from './tharunAuthSlice';

export const tharunStore = configureStore({
  reducer: {
    tharunAuth: tharunAuthSlice,
  },
});
