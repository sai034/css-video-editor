
import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [
    // Example subtitle:
    // {
    //   id: '1',
    //   text: 'Hello, world!',
    //   startTime: '00:00:01,000',
    //   endTime: '00:00:05,000',
    // }
  ],
};

const subtitlesSlice = createSlice({
  name: 'subtitles',
  initialState,
  reducers: {
    addSubtitle: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ text = '', startTime = '00:00:00,000', endTime = '00:00:05,000' }) {
        return {
          payload: {
            id: nanoid(),
            text,
            startTime,
            endTime,
          },
        };
      },
    },

    updateSubtitleText(state, action) {
      const { id, text } = action.payload;
      const subtitle = state.items.find((sub) => sub.id === id);
      if (subtitle) {
        subtitle.text = text;
      }
    },

    updateSubtitleStartTime(state, action) {
      const { id, startTime } = action.payload;
      const subtitle = state.items.find((sub) => sub.id === id);
      if (subtitle) {
        subtitle.startTime = startTime;
      }
    },

    updateSubtitleEndTime(state, action) {
      const { id, endTime } = action.payload;
      const subtitle = state.items.find((sub) => sub.id === id);
      if (subtitle) {
        subtitle.endTime = endTime;
      }
    },

    // Combined update for start and end time
    updateSubtitleTime(state, action) {
      const { id, startTime, endTime } = action.payload;
      const subtitle = state.items.find((sub) => sub.id === id);
      if (subtitle) {
        if (startTime !== undefined) subtitle.startTime = startTime;
        if (endTime !== undefined) subtitle.endTime = endTime;
      }
    },

    removeSubtitle(state, action) {
      const id = action.payload;
      state.items = state.items.filter((sub) => sub.id !== id);
    },

    clearSubtitles(state) {
      state.items = [];
    },

    setSubtitles(state, action) {
      state.items = action.payload;
    },
  },
});

export const {
  addSubtitle,
  updateSubtitleText,
  updateSubtitleStartTime,
  updateSubtitleEndTime,
  updateSubtitleTime, 
  removeSubtitle,
  clearSubtitles,
  setSubtitles,
} = subtitlesSlice.actions;

export default subtitlesSlice.reducer;
