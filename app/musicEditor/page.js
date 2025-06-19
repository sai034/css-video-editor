"use client"
import React, { useState, useEffect } from 'react';
import { Howl, Howler } from 'howler';
import { toast } from 'react-toastify';
import { FaPlay, FaEdit, FaImages, FaMusic, FaPalette, FaFont, FaDownload, FaCheck } from 'react-icons/fa';

const DEFAULT_MUSIC_TRACKS = [
  {
    id: 1,
    name: "Upbeat Corporate",
    url: "/music/upbeat-corporate.mp3",
    duration: 180,
    attribution: "Music by Composer"
  },
  {
    id: 2,
    name: "Cinematic Trailer",
    url: "/music/cinematic-trailer.mp3",
    duration: 120,
    attribution: "Music by Composer"
  },
  {
    id: 3,
    name: "Acoustic Chill",
    url: "/music/acoustic-chill.mp3",
    duration: 140,
    attribution: "Music by Composer"
  },
  {
    id: 4,
    name: "Urban Hip Hop",
    url: "/music/urban-hiphop.mp3",
    duration: 160,
    attribution: "Music by Composer"
  }
];
const MusicEditor = ({
  enableMusic,
  setEnableMusic,
  musicTracks,
  setMusicTracks,
  selectedTracks,
  setSelectedTracks,
  customMusicTracks,
  setCustomMusicTracks,
  musicStartTimes,
  setMusicStartTimes,
  musicEndTimes,
  setMusicEndTimes,
  musicVolumes,
  setMusicVolumes,
  musicFadeDurations,
  setMusicFadeDurations,
  howlInstances,
  setHowlInstances,
  isMusicPlaying,
  setIsMusicPlaying,
  toggleMusicPreview,
  stopMusicPreview,
  removeCustomTrack,
  toggleTrackSelection,
  isTrackSelected,
  handleMusicUpload
}) => {

  useEffect(() => {
    return () => {
      // Clean up all Howl instances
      Object.values(howlInstances).forEach(howl => howl.unload());
      Howler.unload();
    };
  }, [howlInstances]);

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded ">
      <h2 className="text-xl mb-2 font-semibold font-sans">
        <span className='flex flex-row gap-2'>
          <FaMusic size={25} className='text-blue-400' />
          Background Music
        </span>
      </h2>
      <p className='text-sm md:text-md font-sans text-gray-300'>Select the Background Music needed to be played in the video</p>
      <div className=''>
        {enableMusic && (
          <>
            <div className="mb-4 overflow-auto max-h-[400px] ">
              <label className="mt-4 block mb-2 text-sm font-sans font-medium text-gray-200">Available Music Tracks</label>
              <div className="space-y-3">
                {musicTracks.map((track) => (
                  <div key={track.id} className="bg-gray-700 p-3 rounded-lg ">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isTrackSelected(track.id)}
                          onChange={() => toggleTrackSelection(track.id)}
                          className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                        />
                        <span className="ml-2 font-medium font-sans text-purple-300">{track.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {track.isCustom && (
                          <button
                            onClick={() => removeCustomTrack(track.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm cursor-pointer font-sans"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {isTrackSelected(track.id) && (
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {/* <div>
                            <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={musicStartTimes[track.id] || 0}
                              onChange={(e) => setMusicStartTimes(prev => ({
                                ...prev,
                                [track.id]: parseFloat(e.target.value) || 0
                              }))}
                              className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={musicEndTimes[track.id] || track.duration}
                              onChange={(e) => setMusicEndTimes(prev => ({
                                ...prev,
                                [track.id]: parseFloat(e.target.value) || track.duration
                              }))}
                              className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2"
                            />
                          </div> */}
                          <div>
                            <label className="block mb-1 text-xs text-gray-300">Start Time: {(musicStartTimes[track.id] || 0).toFixed(1)}s</label>
                            <input
                              type="range"
                              min="0"
                              max={track.duration}
                              step="0.1"
                              value={musicStartTimes[track.id] || 0}
                              onChange={(e) => setMusicStartTimes(prev => ({
                                ...prev,
                                [track.id]: parseFloat(e.target.value) || 0
                              }))}
                              className="w-full cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-xs text-gray-300">End Time: {(musicEndTimes[track.id] || track.duration).toFixed(1)}s</label>
                            <input
                              type="range"
                              min="0"
                              max={track.duration}
                              step="0.1"
                              value={musicEndTimes[track.id] || track.duration}
                              onChange={(e) => setMusicEndTimes(prev => ({
                                ...prev,
                                [track.id]: parseFloat(e.target.value) || track.duration
                              }))}
                              className="w-full cursor-pointer"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 text-xs text-gray-300">
                            Volume: {((musicVolumes[track.id] || 0.5) * 100).toFixed(0)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={musicVolumes[track.id] || 0.5}
                            onChange={(e) => {
                              const volume = parseFloat(e.target.value);
                              setMusicVolumes(prev => ({
                                ...prev,
                                [track.id]: volume
                              }));
                              if (howlInstances[track.id]) {
                                howlInstances[track.id].volume(volume);
                              }
                            }}
                            className="w-full cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-xs text-gray-300">
                            Fade Duration: {musicFadeDurations[track.id] || 2}s
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={musicFadeDurations[track.id] || 2}
                            onChange={(e) => setMusicFadeDurations(prev => ({
                              ...prev,
                              [track.id]: parseFloat(e.target.value) || 0
                            }))}
                            className="w-full cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-1">
                      Duration: {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')}
                      {track.attribution && ` • ${track.attribution}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </>
        )}
        {enableMusic && (
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium text-gray-200 font-sans">Upload Your Own Music</label>
            <input
              id="music-upload"
              type="file"
              accept="audio/*"
              onChange={handleMusicUpload}
              className="hidden"
              multiple
            />
            <label
              htmlFor="music-upload"
              className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Upload Music (Multiple)
            </label>
            <p className='text-sm md:text-md font-sans text-gray-300 mt-2'>Uplaod and then Select the Background Music needed to be played in the video</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicEditor;