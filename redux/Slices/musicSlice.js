
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tracks: [],
  availableTracks: [

    {
      id: 1,
      name: 'Upbeat',
      url: `${process.env.PUBLIC_URL}/sounds/upbeat.mp3`,
      audioBuffer: null
    },
    {
      id: 2,
      name: 'Cinematic',
      url: `${process.env.PUBLIC_URL}/music/cinematic.mp3`,
      audioBuffer: null
    },
    {
      id: 3,
      name: 'Electronic',
      url: `${process.env.PUBLIC_URL}/music/electronic.mp3`,
      audioBuffer: null
    },
    {
      id: 4,
      name: 'Ambient',
      url: `${process.env.PUBLIC_URL}/music/ambient.mp3`,
      audioBuffer: null
    },
    {
      id: 5,
      name: 'Rock',
      url: `${process.env.PUBLIC_URL}/music/rock.mp3`,
      audioBuffer: null
    },


  ],
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    addMusicTrack: (state, action) => {
      state.tracks.push(action.payload);
    },
    updateMusicTimeRange: (state, action) => {
      const { id, startTime, endTime } = action.payload;
      const track = state.tracks.find(t => t.id === id);
      if (track) {
        track.startTime = startTime;
        track.endTime = endTime;
      }
    },
    updateMusicVolume: (state, action) => {
      const { id, volume } = action.payload;
      const track = state.tracks.find(t => t.id === id);
      if (track) {
        track.volume = volume;
      }
    },
    removeMusicTrack: (state, action) => {
      state.tracks = state.tracks.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  addMusicTrack,
  updateMusicTimeRange,
  updateMusicVolume,
  removeMusicTrack
} = musicSlice.actions;

export default musicSlice.reducer;