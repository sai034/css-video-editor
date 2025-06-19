// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import imageOverlayReducer from '../Slices/imageOverlaySlice';
import musicReducer from '../Slices/musicSlice';

export const store = configureStore({
  reducer: {
    imageOverlay: imageOverlayReducer,
    music: musicReducer,
  }
});
