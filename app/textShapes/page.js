
'use client';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaFont } from 'react-icons/fa';

const TextShapesEditor = ({
  enableTextShape,
  setEnableTextShape,
  textShapes,
  setTextShapes,
  videoDuration,
  videoRef,
  videoHeight = 1080,
}) => {
  const [isEditingTextShape, setIsEditingTextShape] = useState(false);
  const [editingTextShapeId, setEditingTextShapeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);

  const [newTextShape, setNewTextShape] = useState({
    text: '',
    shape: 'none',
    position: { x: 50, y: 50 },
    size: { width: 200, height: 100 },
    color: '#ffffff',
    backgroundColor: '#000000',
    opacity: 1,
    startTime: 0,
    endTime: videoDuration || 5,
    fontSize: 24,
    fontFamily: 'Arial',
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 10,
    showBackground: false,
    customShapeName: '',
    rotation: 0,
  });

  const fontOptions = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Palatino',
    'Garamond',
    'Bookman',
    'Trebuchet MS',
  ];

  const generateShapePath = (shapeName, width, height) => {
    shapeName = shapeName.toLowerCase().trim();
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (shapeName) {
      case 'triangle':
        return `M${halfWidth},0 L${width},${height} L0,${height} Z`;
      case 'square':
        return `M0,0 L${width},0 L${width},${width} L0,${width} Z`;
      case 'rectangle':
        return `M0,0 L${width},0 L${width},${height} L0,${height} Z`;
      case 'circle':
        const radius = Math.min(width, height) / 2;
        return `M${halfWidth},${halfHeight} m-${radius},0 a${radius},${radius} 0 1,0 ${radius * 2},0 a${radius},${radius} 0 1,0 -${radius * 2},0 Z`;
      case 'oval':
        const rx = width / 2;
        const ry = height / 2;
        return `M${halfWidth},${halfHeight} m-${rx},0 a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 -${rx * 2},0 Z`;
      case 'diamond':
        return `M${halfWidth},0 L${width},${halfHeight} L${halfWidth},${height} L0,${halfHeight} Z`;
      case 'star':
        return `M${halfWidth},0 L${width * 0.6},${height} L0,${height * 0.4} L${width},${height * 0.4} L${width * 0.4},${height} Z`;
      case 'trapezium':
        return `M${width * 0.2},0 L${width * 0.8},0 L${width},${height} L0,${height} Z`;
      case 'pentagon':
        return `M${halfWidth},0 L${width},${height * 0.4} L${width * 0.8},${height} L${width * 0.2},${height} L0,${height * 0.4} Z`;
      case 'hexagon':
        return `M${width * 0.25},0 L${width * 0.75},0 L${width},${halfHeight} L${width * 0.75},${height} L${width * 0.25},${height} L0,${halfHeight} Z`;
      case 'heart':
        return `M${halfWidth},${height * 0.3} C${halfWidth},${height * 0.1} ${width * 0.7},0 ${width},${height * 0.2} C${width * 0.8},${height * 0.6} ${halfWidth},${height * 0.9} ${halfWidth},${height} C${halfWidth},${height * 0.9} ${width * 0.2},${height * 0.6} 0,${height * 0.2} C${width * 0.3},0 ${halfWidth},${height * 0.1} ${halfWidth},${height * 0.3} Z`;
      case 'rhombus':
        return `M${halfWidth},0 L${width},${halfHeight} L${halfWidth},${height} L0,${halfHeight} Z`;
      default:
        return `M0,0 L${width},0 L${width},${height} L0,${height} Z`;
    }
  };

  const handleAddOrUpdateTextShape = () => {
    console.log('[TextShapesEditor] Adding/Updating text shape:', newTextShape);
    if (!newTextShape.text) {
      toast.error('Please enter text content');
      return;
    }
    if (newTextShape.startTime >= newTextShape.endTime) {
      toast.error('End time must be after start time');
      return;
    }
    if (!fontOptions.includes(newTextShape.fontFamily)) {
      toast.error('Selected font is invalid');
      return;
    }
    if (newTextShape.shape === 'custom' && !newTextShape.customShapeName) {
      toast.error('Please enter a valid custom shape name');
      return;
    }

    if (isEditingTextShape) {
      setTextShapes(
        textShapes.map((shape) =>
          shape.id === editingTextShapeId ? { ...newTextShape, id: editingTextShapeId } : shape
        )
      );
      setIsEditingTextShape(false);
      setEditingTextShapeId(null);
    } else {
      const id = Date.now();
      setTextShapes([...textShapes, { ...newTextShape, id }]);
    }

    setNewTextShape({
      text: '',
      shape: 'none',
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      color: '#ffffff',
      backgroundColor: '#000000',
      opacity: 1,
      startTime: 0,
      endTime: videoDuration || 5,
      fontSize: 24,
      fontFamily: 'Arial',
      borderColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 0,
      showBackground: false,
      customShapeName: '',
      rotation: 0,
    });

    toast.success(isEditingTextShape ? 'Text shape updated successfully' : 'Text shape added successfully');
  };

  const startTextShapeEdit = (shape) => {
    console.log('[TextShapesEditor] Starting edit for shape:', shape.id);
    setEditingTextShapeId(shape.id);
    setIsEditingTextShape(true);
    setNewTextShape({ ...shape });
  };

  const cancelTextShapeEdit = () => {
    console.log('[TextShapesEditor] Canceling edit');
    setIsEditingTextShape(false);
    setEditingTextShapeId(null);
    setNewTextShape({
      text: '',
      shape: 'none',
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      color: '#ffffff',
      backgroundColor: '#000000',
      opacity: 1,
      startTime: 0,
      endTime: videoDuration || 5,
      fontSize: 24,
      fontFamily: 'Arial',
      borderColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 0,
      showBackground: false,
      customShapeName: '',
      rotation: 0,
    });
  };

  const handleMouseDown = (e) => {
    if (!previewRef.current || !newTextShape.text) return;
    console.log('[TextShapesEditor] Mouse down:', e.clientX, e.clientY);
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragOffset({
      x: x - newTextShape.position.x,
      y: y - newTextShape.position.y,
    });
    setIsDragging(true);
  };

  const handleTouchStart = (e) => {
    if (!previewRef.current || !newTextShape.text) return;
    console.log('[TextShapesEditor] Touch start:', e.touches[0].clientX, e.touches[0].clientY);
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setDragOffset({
      x: x - newTextShape.position.x,
      y: y - newTextShape.position.y,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !previewRef.current || !newTextShape.text) return;
    e.preventDefault();
    const rect = previewRef.current.getBoundingClientRect();
    const maxX = rect.width - newTextShape.size.width;
    const maxY = videoHeight - newTextShape.size.height;
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, maxX));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, maxY));

    setNewTextShape((prev) => ({
      ...prev,
      position: { x, y },
    }));
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !previewRef.current || !newTextShape.text) return;
    e.preventDefault();
    const rect = previewRef.current.getBoundingClientRect();
    const maxX = rect.width - newTextShape.size.width;
    const maxY = videoHeight - newTextShape.size.height;
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left - dragOffset.x, maxX));
    const y = Math.max(0, Math.min(e.touches[0].clientY - rect.top - dragOffset.y, maxY));

    setNewTextShape((prev) => ({
      ...prev,
      position: { x, y },
    }));
  };

  const handleMouseUp = () => {
    console.log('[TextShapesEditor] Mouse up');
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    console.log('[TextShapesEditor] Touch end');
    setIsDragging(false);
  };

  const handleSizeChange = (e, dimension) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    setNewTextShape((prev) => ({
      ...prev,
      size: {
        ...prev.size,
        [dimension]: value,
      },
    }));
  };

  const handleTimeChange = (e, field) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    setNewTextShape((prev) => {
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

  const handlePositionChange = (e, axis) => {
    const value = parseFloat(e.target.value);
    console.log(`[TextShapesEditor] Position ${axis} change:`, value);
    if (isNaN(value)) return;

    setNewTextShape((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        [axis]: Math.max(0, Math.min(value, axis === 'x' ? 1920 : videoHeight)),
      },
    }));
  };

  const handlePositionBlur = (e, axis) => {
    const value = parseFloat(e.target.value);
    console.log(`[TextShapesEditor] Position ${axis} blur:`, value);
    if (isNaN(value)) {
      toast.error(`Invalid ${axis.toUpperCase()} position`);
      return;
    }

    setNewTextShape((prev) => ({
      ...prev,
      position: {
        ...prev.position,
        [axis]: Math.max(0, Math.min(value, axis === 'x' ? 1920 : videoHeight)),
      },
    }));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, newTextShape.size]);

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded">
      <div className="flex flex-row justify-between">
        <div>
          <h2 className="text-xl mb-2 font-semibold font-sans">
            <span className="flex flex-row gap-2">
              <FaFont size={25} className="text-blue-400" />
              Text Shapes
            </span>
          </h2>
        </div>
      </div>
      <p className="text-sm md:text-md font-sans text-gray-300">
        Add text in different shapes or with any shape that appear during specific time ranges
      </p>

      {enableTextShape && (
        <div>
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Position Text Shape</h3>
            <div
              ref={previewRef}
              className="relative bg-gray-900 w-full h-[600px] rounded-md overflow-y-auto border border-gray-700"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {videoRef.current?.src && (
                <video
                  src={videoRef.current.src}
                  className="absolute inset-0 w-full h-full object-contain opacity-50"
                  muted
                  loop
                />
              )}
              {newTextShape.text && (
                <div
                  className="absolute cursor-move"
                  style={{
                    left: `${newTextShape.position.x}px`,
                    top: `${newTextShape.position.y}px`,
                    width: `${newTextShape.size.width}px`,
                    height: `${newTextShape.size.height}px`,
                    opacity: newTextShape.opacity,
                  }}
                >
                  {(newTextShape.shape === 'oval' || newTextShape.shape === 'custom') ? (
                    <svg
                      width={newTextShape.size.width}
                      height={newTextShape.size.height}
                      style={{ position: 'absolute', top: 0, left: 0 }}
                    >
                      <path
                        d={generateShapePath(
                          newTextShape.shape === 'custom' ? newTextShape.customShapeName : newTextShape.shape,
                          newTextShape.size.width,
                          newTextShape.size.height
                        )}
                        fill={newTextShape.showBackground ? newTextShape.backgroundColor : 'none'}
                        stroke={newTextShape.borderColor}
                        strokeWidth={newTextShape.borderWidth}
                      />
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill={newTextShape.color}
                        fontSize={`${newTextShape.fontSize}px`}
                        fontFamily={newTextShape.fontFamily}
                      >
                        {newTextShape.text}
                      </text>
                    </svg>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        color: newTextShape.color,
                        fontSize: `${newTextShape.fontSize}px`,
                        fontFamily: newTextShape.fontFamily,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: newTextShape.showBackground ? newTextShape.backgroundColor : 'transparent',
                        border: newTextShape.shape !== 'none' ? `${newTextShape.borderWidth}px solid ${newTextShape.borderColor}` : 'none',
                        borderRadius: newTextShape.shape === 'rectangle' || newTextShape.shape === 'square' ? `${newTextShape.borderRadius}px` : newTextShape.shape === 'circle' ? '50%' : '0',
                      }}
                    >
                      {newTextShape.text}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {newTextShape.shape !== 'none' && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Width (px)</label>
                    <input
                      type="range"
                      min="50"
                      max="1920"
                      step="10"
                      value={newTextShape.size.width}
                      onChange={(e) => handleSizeChange(e, 'width')}
                      className="w-full cursor-pointer"
                    />
                    <div className="text-center mt-1 text-gray-300">
                      {Math.round(newTextShape.size.width)}px
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">Height (px)</label>
                    <input
                      type="range"
                      min="50"
                      max="1080"
                      step="10"
                      value={newTextShape.size.height}
                      onChange={(e) => handleSizeChange(e, 'height')}
                      className="w-full cursor-pointer"
                    />
                    <div className="text-center mt-1 text-gray-300">
                      {Math.round(newTextShape.size.height)}px
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Opacity: {newTextShape.opacity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newTextShape.opacity}
                  onChange={(e) =>
                    setNewTextShape((prev) => ({
                      ...prev,
                      opacity: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Start Time (s): {newTextShape.startTime.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 10}
                  step="0.1"
                  value={newTextShape.startTime}
                  onChange={(e) => handleTimeChange(e, 'startTime')}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  End Time (s): {newTextShape.endTime.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 10}
                  step="0.1"
                  value={newTextShape.endTime}
                  onChange={(e) => handleTimeChange(e, 'endTime')}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  X Position (px): {Math.round(newTextShape.position.x)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1920"
                  step="1"
                  value={newTextShape.position.x}
                  onChange={(e) => handlePositionChange(e, 'x')}
                  className="w-full cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Y Position (px): {Math.round(newTextShape.position.y)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={videoHeight || 1080}
                  step="1"
                  value={newTextShape.position.y}
                  onChange={(e) => handlePositionChange(e, 'y')}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs text-gray-300 font-sans">Text Content</label>
              <input
                type="text"
                value={newTextShape.text}
                onChange={(e) => setNewTextShape({ ...newTextShape, text: e.target.value })}
                className="p-2 bg-gray-600 rounded w-full outline-none"
                placeholder="Enter text to display"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block mb-1 text-xs text-gray-300 font-sans">Shape Type</label>
                <select
                  value={newTextShape.shape}
                  onChange={(e) =>
                    setNewTextShape({
                      ...newTextShape,
                      shape: e.target.value,
                      showBackground: e.target.value !== 'none',
                    })
                  }
                  className="p-2 bg-gray-600 rounded w-full outline-none font-sans cursor-pointer"
                >
                  <option value="none">None (Text Only)</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="oval">Oval</option>
                  <option value="custom">Custom Shape</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs text-gray-300 font-sans">Font Type</label>
              <select
                value={newTextShape.fontFamily}
                onChange={(e) =>
                  setNewTextShape({
                    ...newTextShape,
                    fontFamily: e.target.value,
                  })
                }
                className="p-2 bg-gray-600 rounded w-full outline-none font-sans cursor-pointer"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1 font-sans">
                Note: Ensure the selected font is supported by the video rendering system.
              </p>
            </div>
          </div>

          {newTextShape.shape !== 'none' && (
//             <div className="mt-4 flex items-center">
//               {/* <label className="inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={newTextShape.showBackground}
//                   onChange={(e) =>
//                     setNewTextShape({
//                       ...newTextShape,
//                       showBackground: e.target.checked,
//                     })
//                   }
//           className="form-checkbox h-5 w-5 ml-4 mt-4 text-blue-600 rounded cursor-pointer"
//                 />
//                 <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                 <span className="ms-3 text-sm font-medium text-gray-300 font-sans cursor-pointer">
//                   Show Background [Enable this option if you want a background for your selected text shape; otherwise, leave it disabled]
//                 </span>
//               </label> */}
//               <label className="inline-flex items-center cursor-pointer mt-4">
//   <input
//     type="checkbox"
//     checked={newTextShape.showBackground}
//     onChange={(e) =>
//       setNewTextShape({
//         ...newTextShape,
//         showBackground: e.target.checked,
//       })
//     }
//     className="sr-only peer"
//   />
//   <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-colors duration-300">
//     <div className="absolute left-1 top-1 bg-white h-4 w-4 rounded-full transition-transform duration-300 peer-checked:translate-x-full"></div>
//   </div>
//   <span className="ml-3 text-sm font-medium text-gray-300 font-sans cursor-pointer">
//     Show Background [Enable this option if you want a background for your selected text shape; otherwise, leave it disabled]
//   </span>
// </label>

//             </div>
<div className="mt-4 flex items-center">
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={newTextShape.showBackground}
      onChange={(e) =>
        setNewTextShape({
          ...newTextShape,
          showBackground: e.target.checked,
        })
      }
      className="form-checkbox h-5 w-5 text-blue-600 rounded cursor-pointer"
    />
    <span className="ml-3 text-sm font-medium text-gray-300 font-sans cursor-pointer">
      Show Background [Enable this option if you want a background for your selected text shape; otherwise, leave it disabled]
    </span>
  </label>
</div>

          )}

          {newTextShape.shape === 'custom' && (
            <div className="mt-4">
              <label className="block mb-1 text-xs text-gray-300 font-sm">Shape Name</label>
              <input
                type="text"
                value={newTextShape.customShapeName || ''}
                onChange={(e) =>
                  setNewTextShape({
                    ...newTextShape,
                    customShapeName: e.target.value,
                  })
                }
                className="p-2 bg-gray-600 rounded w-full outline-none"
                placeholder="Enter shape name (triangle, trapezium, heart, etc.)"
              />
              <p className="text-xs text-gray-400 mt-1 font-sans">
                Supported shapes: triangle, square, rectangle, circle, diamond, star, trapezium, pentagon, hexagon, heart, rhombus
              </p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full cursor-pointer"
                type="number"
                min="0"
                max={videoDuration || 10}
                step="0.1"
                value={newTextShape.startTime}
                onChange={(e) => handleTimeChange(e, 'startTime')}
                onInput={(e) => handleTimeChange(e, 'startTime')}
                onBlur={(e) => handleTimeChange(e, 'startTime')}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full cursor-pointer"
                type="number"
                min="0"
                max={videoDuration || 10}
                step="0.1"
                value={newTextShape.endTime}
                onChange={(e) => handleTimeChange(e, 'endTime')}
                onInput={(e) => handleTimeChange(e, 'endTime')}
                onBlur={(e) => handleTimeChange(e, 'endTime')}
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block mb-1 text-xs text-gray-300">X Position (px)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full cursor-pointer"
                type="number"
                min="0"
                max="1920"
                step="1"
                value={Math.round(newTextShape.position.x)}
                onChange={(e) => handlePositionChange(e, 'x')}
                onInput={(e) => handlePositionChange(e, 'x')}
                onBlur={(e) => handlePositionBlur(e, 'x')}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-300">Y Position (px)</label>
              <input
                className="p-2 bg-gray-600 rounded w-full cursor-pointer"
                type="number"
                min="0"
                max={videoHeight || 1080}
                step="1"
                value={Math.round(newTextShape.position.y)}
                onChange={(e) => handlePositionChange(e, 'y')}
                onInput={(e) => handlePositionChange(e, 'y')}
                onBlur={(e) => handlePositionBlur(e, 'y')}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs text-gray-300 font-sans">Text Color</label>
              <input
                type="color"
                value={newTextShape.color}
                onChange={(e) => setNewTextShape({ ...newTextShape, color: e.target.value })}
                className="w-10 h-10 cursor-pointer"
              />
            </div>
            {newTextShape.shape !== 'none' && newTextShape.showBackground && (
              <div>
                <label className="block mb-1 text-xs text-gray-300 font-sans">Background Color</label>
                <input
                  type="color"
                  value={newTextShape.backgroundColor}
                  onChange={(e) => setNewTextShape({ ...newTextShape, backgroundColor: e.target.value })}
                  className="w-10 h-10 cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs text-gray-300 font-sans">Font Size</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={newTextShape.fontSize}
                onChange={(e) =>
                  setNewTextShape({
                    ...newTextShape,
                    fontSize: parseInt(e.target.value) || 16,
                  })
                }
                className="p-2 bg-gray-600 rounded w-full outline-none"
              />
            </div>
            {newTextShape.shape !== 'none' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs text-gray-300 font-sans">Border Width</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newTextShape.borderWidth}
                    onChange={(e) =>
                      setNewTextShape({
                        ...newTextShape,
                        borderWidth: parseInt(e.target.value) || 0,
                      })
                    }
                    className="p-2 bg-gray-600 rounded w-full outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-gray-300 font-sans">Border Color</label>
                  <input
                    type="color"
                    value={newTextShape.borderColor}
                    onChange={(e) =>
                      setNewTextShape({
                        ...newTextShape,
                        borderColor: e.target.value,
                      })
                    }
                    className="w-10 h-10 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-4">
            <button
              onClick={handleAddOrUpdateTextShape}
              className="w-full font-sans cursor-pointer sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              {isEditingTextShape ? 'Save Changes' : 'Add Text Shape'}
            </button>
            {isEditingTextShape && (
              <button
                onClick={cancelTextShapeEdit}
                className="w-full font-sans cursor-pointer sm:w-auto bg-[#64748B] text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            )}
          </div>

          {textShapes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2 font-sans">Added Text Shapes</h3>
              <div className="space-y-3 max-h-36 overflow-auto">
                {textShapes.map((shape) => (
                  <div key={shape.id} className="bg-gray-700 p-3 rounded border border-gray-600">
                    {editingTextShapeId === shape.id ? null : (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-blue-300">{shape.text}</span>
                            <span className="text-sm text-gray-300 ml-2">
                              ({shape.shape}, {shape.startTime}s-{shape.endTime}s, {shape.fontFamily})
                              {shape.showBackground && ' (with background)'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2 mt-2">
                          <div>
                            <label className="block mb-1 text-xs text-gray-300">Start Time (s)</label>
                            <div className="p-2 bg-gray-600 rounded">{shape.startTime}</div>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs text-gray-300">End Time (s)</label>
                            <div className="p-2 bg-gray-600 rounded">{shape.endTime}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block mb-1 text-xs text-gray-300">X Position</label>
                            <div className="p-2 bg-gray-600 rounded">{shape.position.x || 0}</div>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs text-gray-300">Y Position</label>
                            <div className="p-2 bg-gray-600 rounded">{shape.position.y || 0}</div>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 text-xs text-gray-300">Opacity</label>
                          <div className="p-2 bg-gray-600 rounded cursor-pointer">{shape.opacity.toFixed(1)}</div>
                        </div>

                        <div>
                          <label className="block mb-1 text-xs text-gray-300">Size</label>
                          <div className="p-2 bg-gray-600 rounded">
                            {shape.size?.width || 200}px × {shape.size?.height || 100}px
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 text-xs text-gray-300">Font</label>
                          <div className="p-2 bg-gray-600 rounded">{shape.fontFamily}</div>
                        </div>

                        <p className="text-gray-300 text-xs md:text-[14.5px] mt-1">
                          Note: Text shape will not be shown during the final second.
                        </p>

                        <div className="flex justify-center gap-4 mt-2">
                          <button
                            onClick={() => startTextShapeEdit(shape)}
                            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setTextShapes(textShapes.filter((s) => s.id !== shape.id));
                              toast.success('Text shape removed successfully');
                            }}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextShapesEditor;