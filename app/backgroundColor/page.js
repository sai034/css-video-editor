


'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaPlay, FaEdit, FaImages, FaMusic, FaPalette, FaFont, FaDownload, FaCheck } from 'react-icons/fa';

const BackgroundColorSection = ({
  enableBackground,
  backgroundColors,
  selectedBgColors,
  setSelectedBgColors,
  selectedColor,
  setSelectedColor,
  manualBgColor,
  setManualBgColor,
  manualBgStartTime,
  setManualBgStartTime,
  manualBgEndTime,
  setManualBgEndTime,
  bgColorStartTime,
  setBgColorStartTime,
  bgColorEndTime,
  setBgColorEndTime,
  videoDuration,
}) => {
  return (
    <div className="mt-6 bg-gray-800 p-4 rounded">
      <h2 className="text-xl mb-2 font-semibold font-sans">
        <span className='flex flex-row gap-2'>
          <FaPalette size={25} className='text-blue-400' />
          Background Colors
        </span>
      </h2>
      <p className='text-sm md:text-md font-sans text-gray-300'>Select Or Add Background Colors to the video</p>

      {enableBackground && (
        <div className='mt-4'>
          <div className="mb-6">
            <h3 className="text-lg mb-3 font-sans">Add Custom Background Color</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-xs text-gray-300">Color Code or Color Name</label>
                <div className="flex items-center ">
                  <input
                    type="color"
                    value={manualBgColor}
                    onChange={(e) => setManualBgColor(e.target.value)}
                    className="w-10 h-10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={manualBgColor}
                    onChange={(e) => setManualBgColor(e.target.value)}
                    className="ml-2 p-2 bg-gray-600 rounded w-full outline-none"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <div className='mt-2'>
                <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 100}
                  step="0.1"
                  value={manualBgStartTime}
                  onChange={(e) => setManualBgStartTime(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <span className="text-xs text-gray-300">{manualBgStartTime ? manualBgStartTime.toFixed(2) : '0.00'}s</span>
              </div>
              <div className='mt-2'>
                <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 100}
                  step="0.1"
                  value={manualBgEndTime}
                  onChange={(e) => setManualBgEndTime(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <span className="text-xs text-gray-300">{manualBgEndTime ? manualBgEndTime.toFixed(2) : '0.00'}s</span>
              </div>
            </div>
            <button
              onClick={() => {
                const start = parseFloat(manualBgStartTime);
                const end = parseFloat(manualBgEndTime);
                if (isNaN(start) || isNaN(end) || start >= end || start < 0 || (videoDuration && end > videoDuration)) {
                  toast.error('Invalid time range for custom background color');
                  return;
                }
                setSelectedBgColors([...selectedBgColors, {
                  id: Date.now(),
                  name: "Custom Color",
                  code: manualBgColor,
                  startTime: start,
                  endTime: end
                }]);
                setManualBgStartTime('');
                setManualBgEndTime('');
              }}
              className="font-sans mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
            >
              Add Custom Background
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
              <input
                type="range"
                min="0"
                max={videoDuration || 100}
                step="0.1"
                value={bgColorStartTime}
                onChange={(e) => setBgColorStartTime(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <span className="text-xs text-gray-300">{bgColorStartTime ? bgColorStartTime.toFixed(2) : '0.00'}s</span>
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
              <input
                type="range"
                min="0"
                max={videoDuration || 100}
                step="0.1"
                value={bgColorEndTime}
                onChange={(e) => setBgColorEndTime(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
              <span className="text-xs text-gray-300">{bgColorEndTime ? bgColorEndTime.toFixed(2) : '0.00'}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <p className='font-medium font-sans'>Available Colors</p>
            <div className="w-full relative">
              <select
                value={selectedColor.name}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const color = backgroundColors.find(c => c.name === selectedName);
                  setSelectedColor(color);
                }}
                className="outline-none w-full h-12 rounded-md bg-gray-700 p-2 pl-10 cursor-pointer"
              >
                {backgroundColors.map((color) => (
                  <option
                    key={color.id}
                    value={color.name}
                    className="bg-gray-800 cursor-pointer"
                  >
                    {color.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-3">
                <div
                  className="w-6 h-6 rounded-full border border-gray-400"
                  style={{ backgroundColor: selectedColor.code }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const start = parseFloat(bgColorStartTime);
              const end = parseFloat(bgColorEndTime);
              if (isNaN(start) || isNaN(end) || start >= end || start < 0 || (videoDuration && end > videoDuration)) {
                toast.error('Invalid time range for background color');
                return;
              }
              setSelectedBgColors([...selectedBgColors, {
                ...selectedColor,
                startTime: start,
                endTime: end
              }]);
              setBgColorStartTime('');
              setBgColorEndTime('');
            }}
            className="font-sans mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded cursor-pointer"
          >
            Add Background Color
          </button>

          {selectedBgColors.length > 0 && (
            <div className="mt-4 overflow-auto max-h-40">
              <h3 className="text-lg font-semibold mb-3 font-sans">Added Background Colors</h3>
              <div className="space-y-2">
                {selectedBgColors.map((bg, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full mr-3"
                        style={{ backgroundColor: bg.code }}
                      />
                      <span>{bg.name} ({bg.startTime.toFixed(2)}s - {bg.endTime.toFixed(2)}s)</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBgColors(selectedBgColors.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-400 cursor-pointer font-sans"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundColorSection;