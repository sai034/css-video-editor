import { createSlice } from '@reduxjs/toolkit';

const imageOverlaySlice = createSlice({
  name: 'imageOverlay',
  initialState: {
    images: [],
  },
  reducers: {
    addImageOverlay: (state, action) => {
      state.images.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    updateImagePosition: (state, action) => {
      const { id, position } = action.payload;
      const image = state.images.find((img) => img.id === id);
      if (image) {
        image.position = { ...image.position, ...position };
      }
    },
    updateImageOpacity: (state, action) => {
      const { id, opacity } = action.payload;
      const image = state.images.find((img) => img.id === id);
      if (image) {
        image.opacity = opacity;
      }
    },

    updateImageTimeRange: (state, action) => {
      const { id, startTime, endTime } = action.payload;
      const image = state.images.find((img) => img.id === id);
      if (image) {
        image.startTime = startTime;
        image.endTime = endTime;
      }
    },
    updateImageUrl: (state, action) => {
      const { id, url, name } = action.payload;
      const image = state.images.find((img) => img.id === id);
      if (image) {
        image.url = url;
        image.name = name;
      }
    },

    updateImageSize: (state, action) => {
      const { id, size } = action.payload;
      const image = state.images.find((img) => img.id === id);
      if (image) {
        image.size = { ...size };
      }
    },
    removeImageOverlay: (state, action) => {
      state.images = state.images.filter((img) => img.id !== action.payload);
    },
  },
});

export const {
  addImageOverlay,
  updateImagePosition,
  updateImageOpacity,
  updateImageTimeRange,
  updateImageUrl,
  updateImageSize,
  removeImageOverlay,
} = imageOverlaySlice.actions;

export default imageOverlaySlice.reducer;