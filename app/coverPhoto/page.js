


'use client';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { IoMdPhotos } from "react-icons/io";
import Image from 'next/image';

export default function CoverPhoto({ coverPhoto, setCoverPhoto, coverPhotoDuration, setCoverPhotoDuration, videoDuration }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleCoverPhotoUpload = (e) => {
        console.log('[CoverPhoto] Upload triggered:', e.target.files);
        const file = e.target.files[0];
        if (!file) {
            toast.error('No image selected. Ensure gallery access is enabled.');
            console.error('[CoverPhoto] No file selected');
            return;
        }

        if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
            toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
            console.error('[CoverPhoto] Invalid format:', file.type);
            return;
        }

        const url = URL.createObjectURL(file);
        setCoverPhoto(file);
        setPreviewUrl(url);
        console.log('[CoverPhoto] Set preview URL:', url);

        // Set default duration to 1 second or video duration if shorter
        const defaultDuration = Math.min(1, videoDuration || 3);
        setCoverPhotoDuration(defaultDuration);
        console.log('[CoverPhoto] Set duration:', defaultDuration);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveCoverPhoto = () => {
        console.log('[CoverPhoto] Removing cover photo');
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setCoverPhoto(null);
        setPreviewUrl(null);
        setCoverPhotoDuration(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.success('Cover photo removed');
    };

    const handleDurationChange = (e) => {
        const value = parseFloat(e.target.value);
        console.log('[CoverPhoto] Duration change:', value);
        if (isNaN(value) || value < 0) {
            toast.error('Duration must be a positive number');
            console.error('[CoverPhoto] Invalid duration:', value);
            return;
        }
        if (videoDuration && value > videoDuration) {
            toast.warn(`Duration cannot exceed video duration (${videoDuration.toFixed(2)}s)`);
            setCoverPhotoDuration(videoDuration);
            console.log('[CoverPhoto] Set duration to video max:', videoDuration);
        } else {
            setCoverPhotoDuration(value);
            console.log('[CoverPhoto] Set duration:', value);
        }
    };

    const triggerFileInput = () => {
        console.log('[CoverPhoto] Triggering file input');
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded mb-4">
            <div className="mt-2">
                <label className="block text-xl font-semibold text-white mb-2 font-sans">
                    <span className='flex flex-row gap-2'>
                        <IoMdPhotos size={25} className='text-blue-400'/>
                        Cover Photo
                    </span>
                </label>
                <div
                    className="border-dashed border-2 p-6 rounded bg-gray-700 cursor-pointer mt-4"
                    onClick={triggerFileInput}
                >
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleCoverPhotoUpload}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    <p className="text-center text-sm text-gray-300">
                        Tap to select a cover photo
                    </p>
                </div>
            </div>
            {previewUrl && (
                <div className="mt-4">
                    <p className="text-sm font-semibold text-white mb-2 font-sans">Cover Photo Preview</p>
                    <Image
                        src={previewUrl}
                        alt="Cover Photo Preview"
                        className="max-w-[200px] max-h-[150px] rounded shadow"
                        width={200}
                        height={150}
                    />
                </div>
            )}
            {coverPhoto && (
                <div className="mt-4">
                    <label className="block text-sm font-semibold text-white mb-2 font-sans">
                        Cover Photo Duration (seconds)
                    </label>
                    <input
                        type="number"
                        value={coverPhotoDuration}
                        onChange={handleDurationChange}
                        min="0"
                        step="0.1"
                        className="block w-full sm:w-32 bg-gray-700 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={!videoDuration}
                        placeholder="Enter duration"
                    />
                </div>
            )}
            {coverPhoto && (
                <button
                    onClick={handleRemoveCoverPhoto}
                    className="mt-4 bg-red-600 px-4 py-2 rounded font-sans text-white hover:bg-red-700 cursor-pointer"
                >
                    Remove Cover Photo
                </button>
            )}
        </div>
    );
}