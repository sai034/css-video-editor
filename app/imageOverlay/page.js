

"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  addImageOverlay,
  updateImagePosition,
  updateImageOpacity,
  updateImageTimeRange,
  removeImageOverlay,
  updateImageUrl,
  updateImageSize,
} from '../../redux/Slices/imageOverlaySlice';
import { FaImages } from 'react-icons/fa';

const ImageOverlay = ({ videoDuration, videoRef, videoHeight = 1080 }) => {
  const dispatch = useDispatch();
  const { images } = useSelector((state) => state.imageOverlay);
  const [editingImageId, setEditingImageId] = useState(null);
  const [editableImage, setEditableImage] = useState({
    id: null,
    name: '',
    url: null,
    startTime: 0,
    endTime: 0,
    position: { x: 0, y: 0 },
    opacity: 1,
    size: { width: 200, height: 200 },
    naturalWidth: 0,
    naturalHeight: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const previousUrlsRef = useRef(new Set());


  const handleImageUpload = (files) => {
    setUploadError(null);
    setIsUploading(true);

    if (!files || !files.length) {
      toast.error('No image selected');
      setIsUploading(false);
      return;
    }

    const file = files[0];
    const url = URL.createObjectURL(file);
    previousUrlsRef.current.add(url);

    const img = new Image();
    img.onload = () => {
      const defaultSize = Math.min(200, Math.min(img.naturalWidth, img.naturalHeight));

      const imageData = {
        url,
        name: file.name,
        startTime: 0,
        endTime: videoDuration || 10,
        position: { x: 0, y: 0 },
        opacity: 1,
        size: {
          width: defaultSize,
          height: defaultSize
        },
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      };

      dispatch(addImageOverlay(imageData));
      setIsUploading(false);
    };
    img.onerror = () => {
      toast.error('Failed to load image');
      setIsUploading(false);
    };
    img.src = url;
  };
  const handleEditImageUpload = (files) => {
    console.log('[ImageOverlay] Edit upload triggered:', files);
    setUploadError(null);
    setIsUploading(true);

    if (!files || !files.length) {
      const errorMsg = 'No image selected. Ensure gallery access is enabled.';
      toast.error(errorMsg);
      setUploadError(errorMsg);
      setIsUploading(false);
      console.error('[ImageOverlay] Edit no files');
      return;
    }

    const file = files[0];
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      const errorMsg = `Invalid format: ${file.type}. Use JPEG, PNG, GIF, or WebP.`;
      toast.error(errorMsg);
      setUploadError(errorMsg);
      setIsUploading(false);
      console.error('[ImageOverlay] Edit invalid format:', file.type);
      return;
    }

    const url = URL.createObjectURL(file);
    previousUrlsRef.current.add(url);
    const newState = {
      ...editableImage,
      url,
      name: file.name,
      size: { width: 200, height: 200 },
      naturalWidth: 200,
      naturalHeight: 200,
    };
    setEditableImage(newState);
    dispatch(updateImageUrl({ id: editableImage.id, url, name: file.name }));
    dispatch(updateImageSize({ id: editableImage.id, size: { width: 200, height: 200 } }));
    toast.success(`Image "${file.name}" loaded`);
    console.log('[ImageOverlay] Updated editableImage:', newState);
    setIsUploading(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    console.log('[ImageOverlay] Triggering file input');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerEditFileInput = () => {
    console.log('[ImageOverlay] Triggering edit file input');
    if (editFileInputRef.current) {
      editFileInputRef.current.click();
    }
  };

  const startImageEdit = (img) => {
    console.log('[ImageOverlay] Start edit:', img.id);
    setEditingImageId(img.id);
    setEditableImage({
      id: img.id,
      name: img.name,
      url: img.url,
      startTime: img.startTime,
      endTime: img.endTime,
      position: { ...img.position },
      opacity: img.opacity,
      size: { width: img.size.width, height: img.size.height },
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    });
    setUploadError(null);
  };

  const handlePointerDown = (e) => {
    if (!previewRef.current || !editableImage.url || isUploading) return;
    console.log('[ImageOverlay] Pointer down:', e.type);
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setDragOffset({
      x: x - editableImage.position.x,
      y: y - editableImage.position.y,
    });
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !previewRef.current || !editableImage.url) return;
    e.preventDefault();
    const rect = previewRef.current.getBoundingClientRect();
    const maxX = rect.width - editableImage.size.width;
    const maxY = videoHeight - editableImage.size.height;

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (!clientX || !clientY) return;

    const x = Math.max(0, Math.min(clientX - rect.left - dragOffset.x, maxX));
    const y = Math.max(0, Math.min(clientY - rect.top - dragOffset.y, maxY));

    setEditableImage((prev) => ({
      ...prev,
      position: { x, y },
    }));
  };

  const handlePointerUp = () => {
    console.log('[ImageOverlay] Pointer up');
    setIsDragging(false);
  };

  const saveImageEdit = () => {
    if (!editableImage.url) {
      toast.error('Please select an image first');
      return;
    }

    if (editableImage.startTime >= editableImage.endTime) {
      toast.error('Start time must be less than end time');
      return;
    }

    console.log('[ImageOverlay] Saving edit:', editableImage);
    dispatch(updateImageTimeRange({
      id: editableImage.id,
      startTime: parseFloat(editableImage.startTime) || 0,
      endTime: parseFloat(editableImage.endTime) || videoDuration || 10,
    }));
    dispatch(updateImagePosition({
      id: editableImage.id,
      position: {
        x: Math.round(editableImage.position.x),
        y: Math.round(editableImage.position.y),
      },
    }));
    dispatch(updateImageOpacity({
      id: editableImage.id,
      opacity: parseFloat(editableImage.opacity) || 1,
    }));
    toast.success('Image settings saved');
    cancelImageEdit();
  };

  const cancelImageEdit = () => {
    console.log('[ImageOverlay] Cancel edit');
    setEditingImageId(null);
    setEditableImage({
      id: null,
      name: '',
      url: null,
      startTime: 0,
      endTime: 0,
      position: { x: 0, y: 0 },
      opacity: 1,
      size: { width: 200, height: 200 },
      naturalWidth: 0,
      naturalHeight: 0,
    });
    setUploadError(null);
  };

  const handleSizeChange = (e, dimension) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    // Calculate new size while maintaining aspect ratio
    let newSize = { ...editableImage.size };
    newSize[dimension] = value;

    // If holding shift key, maintain aspect ratio
    if (e.shiftKey) {
      const aspect = editableImage.naturalWidth / editableImage.naturalHeight;
      if (dimension === 'width') {
        newSize.height = value / aspect;
      } else {
        newSize.width = value * aspect;
      }
    }

    setEditableImage(prev => ({
      ...prev,
      size: newSize
    }));

    // Dispatch to Redux
    dispatch(updateImageSize({
      id: editableImage.id,
      size: newSize
    }));
  };

  const handleTimeChange = (e, field) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    setEditableImage((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === 'startTime' && value >= prev.endTime - 0.5) {
        newState.endTime = value + 0.5;
      } else if (field === 'endTime' && value <= prev.startTime + 0.5) {
        newState.startTime = value - 0.5;
      }
      newState.startTime = Math.max(0, Math.min(newState.startTime, videoDuration || 10));
      newState.endTime = Math.max(0, Math.min(newState.endTime, videoDuration || 10));
      return newState;
    });
  };

  useEffect(() => {
    console.log('[ImageOverlay] Mounted');
    return () => {
      console.log('[ImageOverlay] Unmounted');
      previousUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
        console.log('[ImageOverlay] Revoked URL:', url);
      });
      previousUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, dragOffset, editableImage.size]);

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded">
      <h2 className="text-xl mb-2 font-semibold font-sans">
        <span className="flex flex-row gap-2">
          <FaImages size={25} className="text-blue-400" />
          Image Overlays
        </span>
      </h2>
      <p className="text-sm md:text-[16.5px] text-gray-300 mb-3 font-sans">
        Add images to appear during specific video time ranges
      </p>

      <div
        className="border-dashed border-2 p-6 rounded bg-gray-700 mb-4 cursor-pointer"
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />
        <p className="text-center text-sm text-gray-300">
          {isUploading ? 'Uploading...' : 'Tap to select an image'}
        </p>
      </div>


      {editingImageId && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Position Image</h3>
          <div
            ref={previewRef}
            className="relative bg-gray-900 w-full h-[400px] md:h-[600px] rounded-md overflow-y-auto border border-gray-700"
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          >
            {videoRef.current?.src && (
              <video
                src={videoRef.current.src}
                className="absolute inset-0 w-full h-full object-contain opacity-50"
                muted
                loop
              />
            )}
            {editableImage.url && (
              <div
                className="absolute cursor-move"
                style={{
                  left: `${editableImage.position.x}px`,
                  top: `${editableImage.position.y}px`,
                  width: `${editableImage.size.width}px`,
                  height: `${editableImage.size.height}px`,
                  opacity: editableImage.opacity,
                }}
              >
                <img
                  key={editableImage.url}
                  src={editableImage.url}
                  alt="Overlay"
                  className="w-full h-full object-contain"
                  draggable="false"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Width: {editableImage.size.width}px
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="50"
                  max="1920"
                  step="1"
                  value={editableImage.size.width}
                  onChange={(e) => handleSizeChange(e, 'width')}
                  className="w-full"
                />

              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Height: {editableImage.size.height}px
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="50"
                  max="1080"
                  step="1"
                  value={editableImage.size.height}
                  onChange={(e) => handleSizeChange(e, 'height')}
                  className="w-full"
                />

              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
  <div>
    <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
    <input
      type="range"
      min="0"
      max={videoDuration || 10}
      step="0.1"
      value={editableImage.startTime}
      onChange={(e) => handleTimeChange(e, 'startTime')}
      className="w-full"
    />
    <div className="text-xs text-gray-300">{editableImage.startTime.toFixed(2)}s</div>
  </div>
  <div>
    <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
    <input
      type="range"
      min="0"
      max={videoDuration || 10}
      step="0.1"
      value={editableImage.endTime}
      onChange={(e) => handleTimeChange(e, 'endTime')}
      className="w-full"
    />
    <div className="text-xs text-gray-300">{editableImage.endTime.toFixed(2)}s</div>
  </div>
</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full"
                type="number"
                min="0"
                max={videoDuration || 10}
                step="0.1"
                value={editableImage.startTime}
                onChange={(e) => handleTimeChange(e, 'startTime')}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full"
                type="number"
                min="0"
                max={videoDuration || 10}
                step="0.1"
                value={editableImage.endTime}
                onChange={(e) => handleTimeChange(e, 'endTime')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block mb-1 text-xs text-gray-300">X Position (px)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full"
                type="number"
                min="0"
                value={editableImage.position.x}
                onChange={(e) =>
                  setEditableImage((prev) => ({
                    ...prev,
                    position: { ...prev.position, x: parseFloat(e.target.value) || 0 },
                  }))
                }
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-300">Y Position (px)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full"
                type="number"
                min="0"
                max={videoHeight}
                value={editableImage.position.y}
                onChange={(e) =>
                  setEditableImage((prev) => ({
                    ...prev,
                    position: { ...prev.position, y: parseFloat(e.target.value) || 0 },
                  }))
                }
              />
            </div>
          </div>

          <div
            className="border-dashed border-2 p-6 rounded bg-gray-700 mb-4 cursor-pointer"
            onClick={triggerEditFileInput}
          >
            <input
              ref={editFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => handleEditImageUpload(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
            <p className="text-center text-sm text-gray-300">
              {isUploading ? 'Uploading...' : 'Tap to select a new image'}
            </p>
          </div>


          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-4">
            <button
              onClick={saveImageEdit}
              className="w-full font-sans sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition cursor-pointer"
            >
              Save Changes
            </button>
            <button
              onClick={cancelImageEdit}
              className="w-full font-sans sm:w-auto bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-center text-sm md:text-xl mb-2 mt-6 font-sans">Image List</p>
        <div className="overflow-auto max-h-[420px]">
          {images.length === 0 ? (
            <div className="font-sans text-center text-sm md:text-xl text-gray-400 py-4">
              No images added
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {images?.map((img) => (
                <div key={img.id} className="bg-gray-700 p-3 rounded border border-gray-600">
                  {editingImageId === img.id ? null : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-medium text-blue-300 truncate max-w-xs"
                          title={img.name}
                        >
                          {img.name}
                        </span>
                      </div>

                      <div className="flex justify-center mb-2">
                        {img.url && (
                          <img
                            src={img.url}
                            alt="Preview"
                            className="max-h-20 max-w-full object-contain"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
                          <div className="p-2 bg-gray-600 rounded">{img.startTime.toFixed(2)}</div>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
                          <div className="p-2 bg-gray-600 rounded">{img.endTime.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block mb-1 text-xs text-gray-300">X Position</label>
                          <div className="p-2 bg-gray-600 rounded">{img.position.x || 0}</div>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs text-gray-300">Y Position</label>
                          <div className="p-2 bg-gray-600 rounded">{img.position.y || 0}</div>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-xs text-gray-300">Opacity</label>
                        <div className="p-2 bg-gray-600 rounded">{img.opacity.toFixed(1)}</div>
                      </div>

                      <div>
                        <label className="block mb-1 text-xs text-gray-300">Size</label>
                        <div className="p-2 bg-gray-600 rounded">
                          {img.size?.width || 200}px × {img.size?.height || 200}px
                        </div>
                      </div>

                      <p className="text-gray-300 text-xs md:text-sm mt-1">
                        Note: Image will not be shown during the final second.
                      </p>
                      <div className="flex justify-center gap-4 mt-2">
                        <button
                          onClick={() => startImageEdit(img)}
                          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => dispatch(removeImageOverlay(img.id))}
                          className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageOverlay;