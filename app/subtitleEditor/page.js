"use client"
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { MdSubtitles } from 'react-icons/md';

const SubtitleEditor = ({ subtitles, setSubtitles, videoDuration }) => {
    const [importedSubtitles, setImportedSubtitles] = useState([]);
    const [subtitleText, setSubtitleText] = useState('');
    const [subtitleStart, setSubtitleStart] = useState(0);
    const [subtitleEnd, setSubtitleEnd] = useState(0);
    const [subtitleFontSize, setSubtitleFontSize] = useState(20);
    const [subtitleFontType, setSubtitleFontType] = useState('Arial');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editableSubtitle, setEditableSubtitle] = useState({
        text: '',
        start: 0,
        end: 0,
        fontSize: 20,
        fontType: 'Arial',
    });
    const fileInputRef = useRef(null);


    const fontOptions = [
        { value: 'Arial', label: 'Arial' },
        { value: 'Helvetica', label: 'Helvetica' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Courier New', label: 'Courier New' },
        { value: 'Verdana', label: 'Verdana' },
        { value: 'Georgia', label: 'Georgia' },
        { value: 'Roboto', label: 'Roboto' },
        { value: 'Open Sans', label: 'Open Sans' },
        { value: 'Palatino', label: 'Palatino' },
        { value: 'Garamond', label: 'Garamond' },
        { value: 'Bookman', label: 'Bookman' },

        { value: 'Trebuchet MS', label: 'Trebuchet MS' },

    ];

    const parseSRT = (content) => {
        const subtitles = [];
        const blocks = content.split(/\r?\n\r?\n/);

        for (const block of blocks) {
            if (!block.trim()) continue;

            const lines = block.split(/\r?\n/);
            if (lines && lines.length < 3) continue;

            const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s-->\s(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
            if (!timeMatch) continue;

            const startTime =
                parseInt(timeMatch[1]) * 3600 +
                parseInt(timeMatch[2]) * 60 +
                parseInt(timeMatch[3]) +
                parseInt(timeMatch[4]) / 1000;

            const endTime =
                parseInt(timeMatch[5]) * 3600 +
                parseInt(timeMatch[6]) * 60 +
                parseInt(timeMatch[7]) +
                parseInt(timeMatch[8]) / 1000;

            const text = lines.slice(2).join('\n');

            subtitles.push({
                text,
                start: startTime,
                end: endTime,
                fontSize: 20,
                fontType: 'Arial',
            });
        }

        return subtitles;
    };

    const handleAddSubtitle = () => {
        const start = parseFloat(subtitleStart);
        const end = parseFloat(subtitleEnd);
        const fontSize = parseInt(subtitleFontSize);

        if (!subtitleText || isNaN(start) || isNaN(end) || isNaN(fontSize)) {
            toast.error('Please enter the Subtitle, Time ranges, and valid Font Size!');
            return;
        }
        if (start >= end || start < 0 || (videoDuration && end > videoDuration)) {
            toast.error('Invalid time range!');
            return;
        }
        if (fontSize < 10 || fontSize > 100) {
            toast.error('Font size must be between 10 and 100 pixels!');
            return;
        }

        setSubtitles([
            ...subtitles,
            { text: subtitleText, start, end, fontSize, fontType: subtitleFontType },
        ]);
        setSubtitleText('');
        setSubtitleStart(0); // Reset to 0
        setSubtitleEnd(0); // Reset to 0
        setSubtitleFontSize(20);
        setSubtitleFontType('Arial');
    };

    const handleDeleteSubtitle = (index) => {
        const updated = subtitles.filter((_, i) => i !== index);
        setSubtitles(updated);
    };

    const handleSubtitleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                const newSubtitles = parseSRT(content);

                if (newSubtitles && newSubtitles.length > 0) {
                    setSubtitles([...subtitles, ...newSubtitles]);
                    toast.success(`Imported subtitles successfully`);
                } else {
                    toast.warning('No valid subtitles found in the file');
                }
            } catch (error) {
                toast.error('Error parsing subtitle file');
                console.error('Subtitle parse error:', error);
            }
        };

        reader.readAsText(file);
    };

    const handleDownloadSubtitles = () => {
        if (subtitles && subtitles.length === 0) {
            toast.info('No subtitles to download.');
            return;
        }

        const srtContent = subtitles
            ?.map((sub, index) => {
                const formatTime = (seconds) => {
                    const date = new Date(0);
                    date.setSeconds(seconds);
                    const hh = date.toISOString().substr(11, 2);
                    const mm = date.toISOString().substr(14, 2);
                    const ss = date.toISOString().substr(17, 2);
                    const ms = Math.round((seconds % 1) * 1000).toString().padStart(3, '0');
                    return `${hh}:${mm}:${ss},${ms}`;
                };

                const start = sub.start;
                const end = sub.end;

                return `${index + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${sub.text}\n`;
            })
            .join('');

        const blob = new Blob([srtContent], { type: 'text/srt;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'subtitles.srt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mt-6 bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-sans mb-2 font-semibold">
                <span className="flex flex-row gap-2">
                    <MdSubtitles size={25} className="text-blue-400" />
                    Subtitles
                </span>
            </h2>
            <p className="text-sm md:text-[16.5px] font-sans text-gray-300 mb-3">
                Import Subtitle File
            </p>
            <div className="">
                <input
                    id="subtitle-import"
                    type="file"
                    accept=".srt,.vtt,.txt"
                    onChange={handleSubtitleFileUpload}
                    className="hidden"
                    ref={fileInputRef}
                />
                <label
                    htmlFor="subtitle-import"
                    className="outline-none cursor-pointer inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ease-in-out w-full sm:w-auto"
                >
                    Import Subtitles (.srt/.vtt/.txt)
                </label>
            </div>
            <p className="text-md md:text-xl font-sans text-gray-300 mb-3 mt-8 text-center">
                Or
            </p>
            <p className="text-sm md:text-[16.5px] font-sans text-gray-300 mb-3 mt-8">
                Add text that will appear during specific time ranges
            </p>
            <input
                className="p-2 bg-gray-700 rounded w-full mb-2 outline-none"
                placeholder="Subtitle Text"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                    <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
                    <input
                        type="range"
                        min="0"
                        max={videoDuration || 100}
                        step="0.1"
                        value={subtitleStart || 0} // Ensure value is a number
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setSubtitleStart(isNaN(value) ? 0 : value);
                        }}
                        className="w-full cursor-pointer"
                    />
                    <span className="text-xs text-gray-300">
                        {(subtitleStart || 0).toFixed(2)}s
                    </span>
                </div>
                <div>
                    <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
                    <input
                        type="range"
                        min="0"
                        max={videoDuration || 100}
                        step="0.1"
                        value={subtitleEnd || 0} // Ensure value is a number
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setSubtitleEnd(isNaN(value) ? 0 : value);
                        }}
                        className="w-full cursor-pointer"
                    />
                    <span className="text-xs text-gray-300">
                        {(subtitleEnd || 0).toFixed(2)}s
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                    <label className="block mb-1 text-xs text-gray-300">Font Size (px)</label>
                    <input
                        type="number"
                        min="10"
                        max="100"
                        value={subtitleFontSize || 20} // Ensure value is a number
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setSubtitleFontSize(isNaN(value) ? 20 : value);
                        }}
                        className="p-2 bg-gray-700 rounded w-full outline-none"
                        placeholder="Font Size (10-100)"
                    />
                </div>
                <div>
                    <label className="block mb-1 text-xs text-gray-300">Font Type</label>
                    <select
                        value={subtitleFontType}
                        onChange={(e) => setSubtitleFontType(e.target.value)}
                        className="p-3 bg-gray-700  rounded w-full outline-none"
                    >
                        {fontOptions?.map((font) => (
                            <option key={font.value} value={font.value}>
                                {font.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-gray-300 font-sans text-xs md:text-[14.5px] mt-1">
                Note: Subtitle will not be shown during the final second. For example, if you want a full 3s display, use an end time like 4s.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <div>
                    <button
                        onClick={handleAddSubtitle}
                        className="font-sans outline-none cursor-pointer inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ease-in-out w-full sm:w-auto"
                    >
                        Add Subtitle
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => setSubtitles([])}
                        className="font-sans outline-none cursor-pointer inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ease-in-out w-full sm:w-auto"
                    >
                        Clear All Subtitles
                    </button>
                </div>
            </div>

            <p className="text-center font-sans text-sm md:text-xl mb-2 mt-6">
                Subtitle&apos;s  List
            </p>
            <div className="overflow-auto max-h-[200px]">
                {subtitles && subtitles.length === 0 ? (
                    <div className="text-center font-sans text-sm md:text-xl text-gray-400 py-2">
                        No subtitles added
                    </div>
                ) : (
                    subtitles?.map((s, idx) => {
                        const isEditing = editingIndex === idx;

                        return (
                            <li key={idx} className="flex flex-col space-y-2 bg-gray-700 p-3 rounded-lg mb-5">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="block mb-1 text-left ml-1 text-xs text-gray-300">
                                                Subtitle Text
                                            </label>
                                            <input
                                                type="text"
                                                value={editableSubtitle.text}
                                                onChange={(e) =>
                                                    setEditableSubtitle((prev) => ({
                                                        ...prev,
                                                        text: e.target.value,
                                                    }))
                                                }
                                                placeholder="Subtitle Text"
                                                className="w-full p-2 rounded bg-gray-600 text-white text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="block mb-1 text-xs text-gray-300">
                                                    Start Time (s)
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={videoDuration || 100}
                                                    step="0.1"
                                                    value={editableSubtitle.start || 0} // Ensure value is a number
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        setEditableSubtitle((prev) => ({
                                                            ...prev,
                                                            start: isNaN(value) ? 0 : value,
                                                        }));
                                                    }}
                                                    className="w-full cursor-pointer"
                                                />
                                                <span className="text-xs text-gray-300">
                                                    {(editableSubtitle.start || 0).toFixed(2)}s
                                                </span>
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-xs text-gray-300">
                                                    End Time (s)
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={videoDuration || 100}
                                                    step="0.1"
                                                    value={editableSubtitle.end || 0} // Ensure value is a number
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        setEditableSubtitle((prev) => ({
                                                            ...prev,
                                                            end: isNaN(value) ? 0 : value,
                                                        }));
                                                    }}
                                                    className="w-full cursor-pointer"
                                                />
                                                <span className="text-xs text-gray-300">
                                                    {(editableSubtitle.end || 0).toFixed(2)}s
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="block mb-1 text-xs text-gray-300">
                                                    Font Size (px)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="100"
                                                    value={editableSubtitle.fontSize || 20} // Ensure value is a number
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        setEditableSubtitle((prev) => ({
                                                            ...prev,
                                                            fontSize: isNaN(value) ? 20 : value,
                                                        }));
                                                    }}
                                                    className="p-2 bg-gray-600 rounded w-full outline-none"
                                                    placeholder="Font Size (10-100)"
                                                />
                                            </div>
                                            <div className=''>
                                                <label className="block mb-1 text-xs text-gray-300">
                                                    Font Type
                                                </label>
                                                <select
                                                    value={editableSubtitle.fontType}
                                                    onChange={(e) =>
                                                        setEditableSubtitle((prev) => ({
                                                            ...prev,
                                                            fontType: e.target.value,
                                                        }))
                                                    }
                                                    className="p-2 bg-gray-600 rounded w-full outline-none"
                                                >
                                                    {fontOptions?.map((font) => (
                                                        <option key={font.value} value={font.value}>
                                                            {font.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <button
                                                onClick={() => {
                                                    const start = parseFloat(editableSubtitle.start);
                                                    const end = parseFloat(editableSubtitle.end);
                                                    const fontSize = parseInt(editableSubtitle.fontSize);
                                                    if (
                                                        !editableSubtitle.text ||
                                                        isNaN(start) ||
                                                        isNaN(end) ||
                                                        start >= end ||
                                                        start < 0 ||
                                                        (videoDuration && end > videoDuration) ||
                                                        isNaN(fontSize) ||
                                                        fontSize < 10 ||
                                                        fontSize > 100
                                                    ) {
                                                        toast.error('Invalid subtitle, time range, or font size!');
                                                        return;
                                                    }
                                                    const updated = [...subtitles];
                                                    updated[idx] = {
                                                        text: editableSubtitle.text,
                                                        start,
                                                        end,
                                                        fontSize,
                                                        fontType: editableSubtitle.fontType,
                                                    };
                                                    setSubtitles(updated);
                                                    setEditingIndex(null);
                                                    setEditableSubtitle({
                                                        text: '',
                                                        start: 0,
                                                        end: 0,
                                                        fontSize: 20,
                                                        fontType: 'Arial',
                                                    });
                                                }}
                                                className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingIndex(null);
                                                    setEditableSubtitle({
                                                        text: '',
                                                        start: 0,
                                                        end: 0,
                                                        fontSize: 20,
                                                        fontType: 'Arial',
                                                    });
                                                }}
                                                className="cursor-pointer bg-[#64748B] text-white px-4 py-2 rounded hover:bg-gray-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <p
                                                className="text-lg font-semibold mt-4"
                                                style={{ fontFamily: s.fontType, fontSize: `${s.fontSize}px` }}
                                            >
                                                {s.text}
                                            </p>
                                            <p className="text-sm text-gray-300 mt-4">
                                                {s.start.toFixed(2)}s - {s.end.toFixed(2)}s
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                Font: {s.fontType}, {s.fontSize}px
                                            </p>
                                        </div>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => {
                                                    setEditingIndex(idx);
                                                    setEditableSubtitle({
                                                        text: s.text,
                                                        start: s.start,
                                                        end: s.end,
                                                        fontSize: s.fontSize,
                                                        fontType: s.fontType,
                                                    });
                                                }}
                                                className="font-sans cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSubtitle(idx)}
                                                className="font-sans cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SubtitleEditor;