

'use client';
import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TbCircleLetterIFilled } from 'react-icons/tb';
import { AiOutlineClose } from 'react-icons/ai';
import { Howl, Howler } from 'howler';
import {
  FaPlay,
  FaEdit,
  FaImages,
  FaMusic,
  FaPalette,
  FaFont,
  FaDownload,
  FaCheck,
} from 'react-icons/fa';
import { lazy, Suspense } from 'react';
// import SubtitleEditor from '../subtitleEditor/page';
import ImageOverlay from '../imageOverlay/page';
// import MusicEditor from '../musicEditor/page';
// import BackgroundColorSection from '../backgroundColor/page';
// import TextShapesEditor from '../textShapes/page';
// import CoverPhoto from '../coverPhoto/page';

const SubtitleEditor = lazy(() => import('../subtitleEditor/page'));
// const ImageOverlay = lazy(() => import('../imageOverlay/page'));
const MusicEditor = lazy(() => import('../musicEditor/page'));
const BackgroundColorSection = lazy(() => import('../backgroundColor/page'));
const TextShapesEditor = lazy(() => import('../textShapes/page'));
const CoverPhoto = lazy(() => import('../coverPhoto/page'));

// Constants
const DEFAULT_MUSIC_TRACKS = [
  { id: 1, name: 'Upbeat Corporate', url: '/music/upbeat-corporate.mp3', duration: 180, attribution: 'Music by Composer' },
  { id: 2, name: 'Cinematic Trailer', url: '/music/cinematic-trailer.mp3', duration: 120, attribution: 'Music by Composer' },
  { id: 3, name: 'Acoustic Chill', url: '/music/acoustic-chill.mp3', duration: 140, attribution: 'Music by Composer' },
  { id: 4, name: 'Urban Hip Hop', url: '/music/urban-hiphop.mp3', duration: 160, attribution: 'Music by Composer' },
];

const SHAPE_OPTIONS = [
  { value: 'none', label: 'None (Text Only)' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'square', label: 'Square' },
  { value: 'circle', label: 'Circle' },
  { value: 'rounded-rect', label: 'Rounded Rectangle' },
  { value: 'oval', label: 'Oval' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'star', label: 'Star' },
  { value: 'custom', label: 'Custom Shape' },
];

const downloadFormats = [
  { value: 'webm', label: 'WebM (VP9)', supported: true },
  { value: 'mp4', label: 'MP4 (H.264)', supported: true },
  { value: 'ogg', label: 'OGG (Theora)', supported: false },
  { value: 'avi', label: 'AVI', supported: false },
  { value: 'mov', label: 'QuickTime (MOV)', supported: false },
];

export default function VideoEditor() {
  // State
  const [backgroundColors] = useState([
    { id: 1, name: 'Black', code: '#000000', image: '/bg-black.jpg' },
    { id: 2, name: 'White', code: '#FFFFFF', image: '/bg-white.jpg' },
    { id: 3, name: 'Light Blue', code: '#ADD8E6', image: '/bg-light-blue.jpg' },
    { id: 4, name: 'Dark Blue', code: '#1E3A8A', image: '/bg-dark-blue.jpg' },
    { id: 5, name: 'Red', code: '#EF4444', image: '/bg-red.jpg' },
    { id: 6, name: 'Green', code: '#10B981', image: '/bg-green.jpg' },
    { id: 7, name: 'Yellow', code: '#FFFF00', image: '/bg-yellow.jpg' },
    { id: 8, name: 'Orange', code: '#FFA500', image: '/bg-orange.jpg' },
  ]);
  const [enableOriginalAudio, setEnableOriginalAudio] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTextShapes, setActiveTextShapes] = useState([]);
  const [textShapes, setTextShapes] = useState([]);
  const [enableTextShape, setEnableTextShape] = useState(false);
  const [newTextShape, setNewTextShape] = useState({
    text: '',
    shape: 'none',
    position: { x: 50, y: 50 },
    size: { width: 200, height: 100 },
    color: '#ffffff',
    backgroundColor: '#000000',
    opacity: 1,
    startTime: 0,
    endTime: 0,
    fontSize: 24,
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 10,
    showBackground: false,
    customShapePath: '',
    rotation: 0,
  });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoDuration, setCoverPhotoDuration] = useState(0);
  const [coverPhotoImage, setCoverPhotoImage] = useState(null);
  const [timeRange, setTimeRange] = useState({ start: 0, end: 0 });
  const [scrubbingTime, setScrubbingTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [video, setVideo] = useState(null);
  const [editedVideoUrl, setEditedVideoUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [videoDuration, setVideoDuration] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [activeImages, setActiveImages] = useState([]);
  const [musicTracks, setMusicTracks] = useState([...DEFAULT_MUSIC_TRACKS]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [customMusicTracks, setCustomMusicTracks] = useState([]);
  const [musicStartTimes, setMusicStartTimes] = useState({});
  const [musicEndTimes, setMusicEndTimes] = useState({});
  const [musicVolumes, setMusicVolumes] = useState({});
  const [musicFadeDurations, setMusicFadeDurations] = useState({});
  const [howlInstances, setHowlInstances] = useState({});
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [enableMusic, setEnableMusic] = useState(false);
  const [selectedColor, setSelectedColor] = useState(backgroundColors[0]);
  const [selectedBgColors, setSelectedBgColors] = useState([]);
  const [bgColorStartTime, setBgColorStartTime] = useState('');
  const [bgColorEndTime, setBgColorEndTime] = useState('');
  const [manualBgColor, setManualBgColor] = useState('#000000');
  const [manualBgStartTime, setManualBgStartTime] = useState('');
  const [manualBgEndTime, setManualBgEndTime] = useState('');
  const [activeBgColor, setActiveBgColor] = useState(null);
  const [enableBackground, setEnableBackground] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('webm');

  // Refs
  const rangeSliderRef = useRef(null);
  const previewVideoRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const imageRefs = useRef({});

  // Redux
  const dispatch = useDispatch();
  const { images } = useSelector((state) => state.imageOverlay);

  // Utility Components
  const PositionItem = ({ name, value, desc }) => (
    <div className="bg-gray-700 p-3 rounded">
      <div className="font-medium">{name}</div>
      <div className="text-blue-300 text-sm">{value}</div>
      <div className="text-gray-400 text-xs mt-1">{desc}</div>
    </div>
  );

  // Utility Functions
  const getMimeType = (format) => {
    switch (format) {
      case 'webm': return 'video/webm;codecs=vp9';
      case 'mp4': return 'video/mp4;codecs=avc1';
      case 'ogg': return 'video/ogg;codecs=theora';
      case 'avi': return 'video/x-msvideo';
      case 'mov': return 'video/quicktime';
      default: return 'video/webm;codecs=vp9';
    }
  };

  const getFileExtension = (format) => format.toLowerCase();

  const generateShapePath = (shapeName, width, height) => {
    shapeName = shapeName.toLowerCase().trim();
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    switch (shapeName) {
      case 'triangle':
        return `M${halfWidth} 0 L${width} ${height} L0 ${height} Z`;
      case 'square':
        return `M0 0 L${width} 0 L${width} ${width} L0 ${width} Z`;
      case 'rectangle':
        return `M0 0 L${width} 0 L${width} ${height} L0 ${height} Z`;
      case 'circle':
        const radius = Math.min(width, height) / 2;
        return `M${halfWidth},${halfHeight} m-${radius},0 a${radius},${radius} 0 1,0 ${radius * 2},0 a${radius},${radius} 0 1,0 -${radius * 2},0 Z`;
      case 'oval':
        const rx = width / 2;
        const ry = height / 2;
        return `M${halfWidth},${halfHeight} m-${rx},0 a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 -${rx * 2},0 Z`;
      case 'diamond':
        return `M${halfWidth} 0 L${width} ${halfHeight} L${halfWidth} ${height} L0 ${halfHeight} Z`;
      case 'star':
        return `M${halfWidth},0 L${width * 0.6},${height} L0,${height * 0.4} L${width},${height * 0.4} L${width * 0.4},${height} Z`;
      case 'trapezium':
        return `M${width * 0.2} 0 L${width * 0.8} 0 L${width} ${height} L0 ${height} Z`;
      case 'pentagon':
        return `M${halfWidth},0 L${width},${height * 0.4} L${width * 0.8},${height} L${width * 0.2},${height} L0,${height * 0.4} Z`;
      case 'hexagon':
        return `M${width * 0.25},0 L${width * 0.75},0 L${width},${halfHeight} L${width * 0.75},${height} L${width * 0.25},${height} L0,${halfHeight} Z`;
      case 'heart':
        return `M${halfWidth},${height * 0.3} C${halfWidth},${height * 0.1} ${width * 0.7},0 ${width},${height * 0.2} C${width * 0.8},${height * 0.6} ${halfWidth},${height * 0.9} ${halfWidth},${height} C${halfWidth},${height * 0.9} ${width * 0.2},${height * 0.6} 0,${height * 0.2} C${width * 0.3},0 ${halfWidth},${height * 0.1} ${halfWidth},${height * 0.3} Z`;
      case 'rhombus':
        return `M${halfWidth} 0 L${width} ${halfHeight} L${halfWidth} ${height} L0 ${halfHeight} Z`;
      default:
        return `M0 0 L${width} 0 L${width} ${height} L0 ${height} Z`;
    }
  };

  // Video Upload Handling
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'video/*': [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setVideo(file);
      setEditedVideoUrl(null);

      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.src = URL.createObjectURL(file);
      tempVideo.style.display = 'none';
      document.body.appendChild(tempVideo);

      tempVideo.onloadedmetadata = () => {
        if (isFinite(tempVideo.duration)) {
          handleDurationAndDimensions(tempVideo);
        } else {
          tempVideo.currentTime = Number.MAX_SAFE_INTEGER;
          tempVideo.ontimeupdate = () => {
            tempVideo.ontimeupdate = null;
            handleDurationAndDimensions(tempVideo);
          };
        }
      };

      tempVideo.onerror = () => {
        toast.error('Failed to load video metadata.');
        document.body.removeChild(tempVideo);
      };

      const handleDurationAndDimensions = (videoElement) => {
        const duration = videoElement.duration;
        if (!isFinite(duration)) {
          toast.error('Invalid video duration');
          return;
        }

        setVideoDuration(duration);
        setTimeRange({ start: 0, end: Math.min(10, duration) });
        setDimensions({ width: videoElement.videoWidth, height: videoElement.videoHeight });

        URL.revokeObjectURL(videoElement.src);
        document.body.removeChild(videoElement);
      };
    },
  });

  // Time Range and Scrubbing
  const updatePreviewTime = (time) => {
    if (!previewVideoRef.current || !Number.isFinite(time) || time < 0) return;
    try {
      const safeTime = Math.min(time, videoDuration || Infinity);
      previewVideoRef.current.currentTime = safeTime;
    } catch (error) {
      console.error('Error setting video currentTime:', error);
    }
  };

  const handleMouseMove = (e) => {
    if (!rangeSliderRef.current || !videoDuration) return;

    const rect = rangeSliderRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const percentage = x / rect.width;
    const time = Math.max(0, Math.min(percentage * videoDuration, videoDuration));

    if (isDraggingStart) {
      const newStart = Math.min(time, timeRange.end - 0.5);
      setTimeRange((prev) => ({ ...prev, start: newStart }));
      updatePreviewTime(newStart);
    } else if (isDraggingEnd) {
      const newEnd = Math.max(time, timeRange.start + 0.5);
      setTimeRange((prev) => ({ ...prev, end: newEnd }));
      updatePreviewTime(newEnd);
    } else if (isScrubbing) {
      setScrubbingTime(time);
      updatePreviewTime(time);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
    setIsScrubbing(false);
  };

  // Music Handling
  const handleMusicUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = url;

      audio.onloadedmetadata = () => {
        const newTrack = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
          duration: audio.duration,
          attribution: 'Custom Upload',
          isCustom: true,
        };

        setCustomMusicTracks((prev) => [...prev, newTrack]);
        setMusicTracks((prev) => [...prev, newTrack]);
        setMusicStartTimes((prev) => ({ ...prev, [newTrack.id]: 0 }));
        setMusicEndTimes((prev) => ({ ...prev, [newTrack.id]: audio.duration }));
        setMusicVolumes((prev) => ({ ...prev, [newTrack.id]: 0.5 }));
        setMusicFadeDurations((prev) => ({ ...prev, [newTrack.id]: 2 }));
      };

      audio.onerror = () => toast.error(`Failed to load music file: ${file.name}`);
    });
  };

  const toggleMusicPreview = (trackId) => {
    const track = musicTracks.find((t) => t.id === trackId);
    if (!track) return;

    Object.values(howlInstances).forEach((howl) => {
      if (howl.playing()) howl.stop();
    });

    if (howlInstances[trackId] && howlInstances[trackId].playing()) {
      howlInstances[trackId].stop();
      setIsMusicPlaying(false);
    } else {
      const howl = new Howl({
        src: [track.url],
        volume: musicVolumes[trackId] || 0.5,
        onend: () => setIsMusicPlaying(false),
        onplayerror: () => {
          toast.error('Failed to play music preview');
          setIsMusicPlaying(false);
        },
      });

      howl.play();
      setHowlInstances((prev) => ({ ...prev, [trackId]: howl }));
      setIsMusicPlaying(true);
    }
  };

  const stopMusicPreview = () => {
    Object.values(howlInstances).forEach((howl) => howl.stop());
    setIsMusicPlaying(false);
  };

  const removeCustomTrack = (trackId) => {
    setCustomMusicTracks((prev) => prev.filter((track) => track.id !== trackId));
    setMusicTracks((prev) => prev.filter((track) => track.id !== trackId));
    setSelectedTracks((prev) => prev.filter((id) => id !== trackId));

    if (howlInstances[trackId]) {
      howlInstances[trackId].unload();
      setHowlInstances((prev) => {
        const newInstances = { ...prev };
        delete newInstances[trackId];
        return newInstances;
      });
    }
  };

  const toggleTrackSelection = (trackId) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const isTrackSelected = (trackId) => selectedTracks.includes(trackId);

  const handleDirectDownload = () => {
    if (!video) {
      toast.error('No video selected for download!');
      return;
    }

    const url = URL.createObjectURL(video);
    const link = document.createElement('a');
    link.href = url;
    link.download = `original-video.${getFileExtension(downloadFormat)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Original video downloaded in ${downloadFormat.toUpperCase()} format`);
  };

  const handleEdit = async () => {
    // Validate inputs
    if (!video || !videoDuration || timeRange.start >= timeRange.end) {
      toast.error('Please select a valid time range!');
      return;
    }

    const selectedFormat = downloadFormats.find((f) => f.value === downloadFormat);
    if (!selectedFormat.supported) {
      toast.warn(
        `The ${selectedFormat.label} format is not supported for editing. You can download the original video in this format, but editing is only supported for WebM and MP4.`
      );
      return;
    }

    // Validate cover photo
    if (coverPhotoImage && !coverPhotoImage.complete) {
      toast.error('Cover photo is not fully loaded. Please try again.');
      return;
    }

    stopMusicPreview();
    setProcessing(true);
    const videoUrl = URL.createObjectURL(video);
    const currentSubtitles = [...subtitles];
    const startTimeSec = timeRange.start;
    const endTimeSec = timeRange.end;
    const selectedMusicTracks = musicTracks.filter((track) => selectedTracks.includes(track.id));

    const videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.src = videoUrl;
    videoElement.muted = !enableOriginalAudio;

    videoElement.onloadedmetadata = async () => {
      if (
        startTimeSec >= videoElement.duration ||
        endTimeSec > videoElement.duration ||
        startTimeSec >= endTimeSec
      ) {
        toast.error('Invalid time range!');
        setProcessing(false);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 1280;
      canvas.height = videoElement.videoHeight || 720;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        toast.error('Failed to initialize canvas context.');
        setProcessing(false);
        return;
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000,
      });
      const destination = audioContext.createMediaStreamDestination();
      const audioStream = destination.stream;
      const videoStream = canvas.captureStream(60);
      const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);

      const options = {
        mimeType: getMimeType(downloadFormat),
        videoBitsPerSecond: 50_000_000,
        audioBitsPerSecond: 256_000,
      };

      try {
        mediaRecorderRef.current = new MediaRecorder(combinedStream, options);
      } catch (error) {
        toast.error('Failed to initialize MediaRecorder. Format may be unsupported.');
        setProcessing(false);
        return;
      }

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType });
        const editedUrl = URL.createObjectURL(blob);
        setEditedVideoUrl(editedUrl);
        setProcessing(false);
      };

      mediaRecorderRef.current.start(10);

      const videoAudioSource = audioContext.createMediaElementSource(videoElement);
      const musicGainNodes = {};
      const musicSources = {};

      if (enableMusic && selectedMusicTracks.length > 0) {
        for (const track of selectedMusicTracks) {
          try {
            const response = await fetch(track.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = false;

            const gainNode = audioContext.createGain();
            gainNode.gain.value = musicVolumes[track.id] || 0.5;

            source.connect(gainNode);
            gainNode.connect(destination);

            musicSources[track.id] = source;
            musicGainNodes[track.id] = gainNode;

            const trackStartTime = parseFloat(musicStartTimes[track.id]) || 0;
            const trackEndTime = parseFloat(musicEndTimes[track.id]) || track.duration;
            const relativeStart = trackStartTime - startTimeSec;
            const relativeEnd = trackEndTime - startTimeSec;

            if (relativeEnd > 0 && relativeStart < endTimeSec - startTimeSec) {
              const playStart = Math.max(0, relativeStart);
              const playDuration = Math.min(trackEndTime - trackStartTime, endTimeSec - startTimeSec - playStart);
              const bufferOffset = Math.max(0, startTimeSec - trackStartTime);

              source.start(audioContext.currentTime + playStart, bufferOffset, playDuration);
            }
          } catch (error) {
            console.error(`Error loading music track ${track.id}:`, error);
            toast.error(`Failed to load music track: ${track.name}`);
          }
        }
      }

      const originalAudioGain = audioContext.createGain();
      videoAudioSource.connect(originalAudioGain);

      if (enableOriginalAudio) {
        originalAudioGain.gain.value = 1.0;
      } else {
        originalAudioGain.gain.value = 0.0;
      }

      // Connect to output
      originalAudioGain.connect(destination);
      originalAudioGain.connect(audioContext.destination);
      videoElement.currentTime = startTimeSec;

      const coverPhotoDurationSafe = coverPhotoDuration || 5; // Default to 5 seconds if undefined

      const processFrame = () => {
        if (videoElement.paused || videoElement.ended || videoElement.currentTime >= endTimeSec) {
          Object.values(musicSources).forEach((source) => {
            try {
              source.stop();
            } catch (e) {
              console.log('Music source already stopped');
            }
          });

          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }

          videoElement.pause();
          return;
        }

        const currentTime = videoElement.currentTime - startTimeSec;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Log for debugging cover photo
        console.log('currentTime:', currentTime, 'coverPhotoDuration:', coverPhotoDurationSafe, 'coverPhotoImage:', coverPhotoImage);

        if (coverPhotoImage && currentTime < coverPhotoDurationSafe) {
          try {
            ctx.drawImage(coverPhotoImage, 0, 0, canvas.width, canvas.height);
          } catch (error) {
            console.error('Error drawing cover photo:', error);
            toast.error('Failed to render cover photo.');
          }
        } else {
          const activeBg = selectedBgColors.find(
            (bg) => currentTime >= bg.startTime && currentTime <= bg.endTime
          );

          if (activeBg) {
            ctx.fillStyle = activeBg.code;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setActiveBgColor(activeBg);
          } else {
            setActiveBgColor(null);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.globalAlpha = activeBg ? 0.5 : 1.0;
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1.0;

          images.forEach((img) => {
            const image = imageRefs.current[img.id];
            if (image && currentTime >= img.startTime && currentTime <= img.endTime) {
              ctx.globalAlpha = img.opacity;
              ctx.drawImage(
                image,
                img.position.x || 0,
                img.position.y || 0,
                img.size.width || image.width,
                img.size.height || image.height
              );
              ctx.globalAlpha = 1.0;
            }
          });

          textShapes.forEach((shape) => {
            if (currentTime >= shape.startTime && currentTime <= shape.endTime) {
              ctx.save();
              ctx.globalAlpha = shape.opacity;

              if (shape.shape !== 'none') {
                ctx.beginPath();
                if (shape.shape === 'custom' && shape.customShapeName) {
                  const path = new Path2D(generateShapePath(shape.customShapeName, shape.size.width, shape.size.height));
                  ctx.translate(shape.position.x, shape.position.y);
                  if (shape.showBackground) {
                    ctx.fillStyle = shape.backgroundColor;
                    ctx.fill(path);
                  }
                  ctx.strokeStyle = shape.borderColor;
                  ctx.lineWidth = shape.borderWidth;
                  ctx.stroke(path);
                  ctx.translate(-shape.position.x, -shape.position.y);
                } else {
                  const path = new Path2D(generateShapePath(shape.shape, shape.size.width, shape.size.height));
                  ctx.translate(shape.position.x, shape.position.y);
                  if (shape.showBackground) {
                    ctx.fillStyle = shape.backgroundColor;
                    ctx.fill(path);
                  }
                  ctx.strokeStyle = shape.borderColor;
                  ctx.lineWidth = shape.borderWidth;
                  ctx.stroke(path);
                  ctx.translate(-shape.position.x, -shape.position.y);
                }
              }

              ctx.fillStyle = shape.color;
              ctx.font = `${shape.fontSize}px "${shape.fontFamily}"`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              const textX = shape.shape === 'none' ? shape.position.x : shape.position.x + shape.size.width / 2;
              const textY = shape.shape === 'none' ? shape.position.y : shape.position.y + shape.size.height / 2;

              ctx.fillText(shape.text, textX, textY);
              ctx.restore();
            }
          });
          const activeSubtitle = currentSubtitles.find(
            (s) => currentTime >= s.start && currentTime <= s.end
          );

          if (activeSubtitle) {
            ctx.fillStyle = 'white';
            ctx.font = `bold ${activeSubtitle.fontSize}px ${activeSubtitle.fontType}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 6;
            ctx.strokeText(activeSubtitle.text, canvas.width / 2, canvas.height - 40);
            ctx.fillText(activeSubtitle.text, canvas.width / 2, canvas.height - 40);
          }
        }

        requestAnimationFrame(processFrame);
      };

      videoElement.addEventListener(
        'canplay',
        () => {
          if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
              videoElement.play();
              processFrame();
            });
          } else {
            videoElement.play();
            processFrame();
          }
        },
        { once: true }
      );
    };

    videoElement.onerror = () => {
      toast.error('Failed to load video for editing.');
      setProcessing(false);
    };
  };

  const handleDownloadSubtitles = () => {
    if (subtitles.length === 0) {
      toast.info('No subtitles to download.');
      return;
    }

    const srtContent = subtitles
      .map((sub, index) => {
        const formatTime = (seconds) => {
          const date = new Date(0);
          date.setSeconds(seconds);
          const hh = date.toISOString().substr(11, 2);
          const mm = date.toISOString().substr(14, 2);
          const ss = date.toISOString().substr(17, 2);
          const ms = date.getMilliseconds().toString().padStart(3, '0');
          return `${hh}:${mm}:${ss},${ms}`;
        };
        return `${index + 1}\n${formatTime(sub.start)} --> ${formatTime(sub.end)}\n${sub.text}\n`;
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

  const handleDisplay = () => toast.success('Video Downloaded Successfully');

  // Subtitles
  const adjustSubtitleTime = (index, field, delta) => {
    setSubtitles((prev) => {
      const newSubs = [...prev];
      const newValue = Math.max(0, (parseFloat(newSubs[index][field]) || 0) + delta);
      if (videoDuration && newValue > videoDuration) return prev;
      newSubs[index][field] = newValue;
      return newSubs;
    });
  };

  const updateSubtitleTime = (index, field, value) => {
    setSubtitles((prev) => {
      const newSubs = [...prev];
      let val = parseFloat(value);
      if (isNaN(val) || val < 0) val = 0;
      if (videoDuration && val > videoDuration) val = videoDuration;
      newSubs[index][field] = val;
      return newSubs;
    });
  };

  // Effects
  useEffect(() => {
    if (videoDuration && Number.isFinite(videoDuration)) {
      const initialEnd = Math.min(10, videoDuration);
      setTimeRange({ start: 0, end: initialEnd });
      const timer = setTimeout(() => {
        if (previewVideoRef.current) previewVideoRef.current.currentTime = 0;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videoDuration]);

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalMouseMove = (e) => handleMouseMove(e);

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingStart, isDraggingEnd, isScrubbing, videoDuration, timeRange]);

  useEffect(() => {
    images.forEach((img) => {
      if (!imageRefs.current[img.id] || imageRefs.current[img.id].src !== img.url) {
        const image = new Image();
        image.src = img.url;
        image.onload = () => {
          imageRefs.current[img.id] = image;
          setActiveImages([...activeImages]);
        };
      }
    });

    const currentIds = images.map((img) => img.id);
    Object.keys(imageRefs.current).forEach((id) => {
      if (!currentIds.includes(Number(id))) delete imageRefs.current[id];
    });
  }, [images, activeImages]);

  useEffect(() => {
    Object.entries(musicEndTimes).forEach(([trackId, endTime]) => {
      const startTime = musicStartTimes[trackId] || 0;
      if (endTime <= startTime) toast.warn('Music end time should be after start time for track');
    });
  }, [musicStartTimes, musicEndTimes]);

  useEffect(() => {
    return () => {
      Object.values(howlInstances).forEach((howl) => howl.unload());
      Howler.unload();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [howlInstances]);
  useEffect(() => {
    if (coverPhoto) {
      const image = new Image();
      image.src = URL.createObjectURL(coverPhoto);
      image.onload = () => {
        setCoverPhotoImage(image);
      };
      image.onerror = () => {
        toast.error('Failed to load cover photo');
        setCoverPhotoImage(null);
      };
      return () => {
        if (image.src) URL.revokeObjectURL(image.src);
      };
    } else {
      setCoverPhotoImage(null);
    }
  }, [coverPhoto]);

  // Time Range Selector
  const renderTimeRangeSelector = () => {
    if (!video || !videoDuration) return null;

    return (
      <div className="mb-6 bg-gray-800 w-full">
        <div className="relative mb-4 mt-2">
          <div className="relative h-48 md:h-[300px] bg-gray-800 rounded-lg overflow-hidden mb-2">
            <video
              ref={previewVideoRef}
              src={URL.createObjectURL(video)}
              className="w-full h-full opacity-90 cursor-default"
              muted
              playsInline
              onLoadedMetadata={() => {
                if (previewVideoRef.current && videoDuration) {
                  previewVideoRef.current.currentTime = timeRange.start;
                }
              }}
              onError={() => toast.error('Failed to load video preview')}
            />
            <div className="absolute bottom-3 left-0 right-0 h-1 bg-gray-600">
              <div
                className="absolute top-0 h-full bg-blue-500"
                style={{
                  left: `${(timeRange.start / videoDuration) * 100}%`,
                  right: `${100 - (timeRange.end / videoDuration) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="relative h-5">
            <div
              ref={rangeSliderRef}
              className="absolute bottom-12 left-0 right-0 h-2 bg-gray-600 rounded-full cursor-pointer"
            >
              <div
                className="absolute top-0 h-full bg-blue-500 rounded-full"
                style={{
                  left: `${(timeRange.start / videoDuration) * 100}%`,
                  right: `${100 - (timeRange.end / videoDuration) * 100}%`,
                }}
              />
              <div
                className="absolute top-1/2 -mt-3 w-6 h-6 bg-blue-500 rounded-full shadow-md cursor-pointer hover:bg-blue-400 transition-colors"
                style={{ left: `${(timeRange.start / videoDuration) * 100}%` }}
                onMouseDown={() => setIsDraggingStart(true)}
              />
              <div
                className="absolute top-1/2 -mt-3 w-6 h-6 bg-blue-500 rounded-full shadow-md cursor-pointer hover:bg-blue-400 transition-colors"
                style={{ left: `${(timeRange.end / videoDuration) * 100}%` }}
                onMouseDown={() => {
                  setIsDraggingEnd(true);
                  previewVideoRef.current.currentTime = timeRange.end;
                }}
              />
            </div>
            <div className="flex justify-between mt-6 text-sm text-gray-400">
              <span>Start: {timeRange.start.toFixed(2)}s</span>
              <span>Duration: {(timeRange.end - timeRange.start).toFixed(2)}s</span>
              <span>End: {timeRange.end.toFixed(2)}s</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Time</label>
              <input
                type="range"
                min="0"
                max={videoDuration}
                step="0.1"
                value={timeRange.start}
                onChange={(e) => {
                  const newStart = parseFloat(e.target.value);
                  setTimeRange((prev) => ({ ...prev, start: Math.min(newStart, prev.end - 0.5) }));
                  previewVideoRef.current.currentTime = newStart;
                }}
                className="w-full cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Time</label>
              <input
                type="range"
                min="0"
                max={videoDuration}
                step="0.1"
                value={timeRange.end}
                onChange={(e) => {
                  const newEnd = parseFloat(e.target.value);
                  setTimeRange((prev) => ({ ...prev, end: Math.max(newEnd, prev.start + 0.5) }));
                  previewVideoRef.current.currentTime = newEnd;
                }}
                className="w-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-sans font-bold mb-6 text-center">CSS Video Editor</h1>

      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-400 p-6 rounded cursor-pointer mb-4 bg-gray-800"
      >
        <input {...getInputProps()} />
        <p className="text-center font-sans text-sm md:text-lg">
          {video ? video.name : 'Drag and drop a video here or click to select one'}
        </p>
      </div>

      <video ref={videoRef} style={{ display: 'none' }} crossOrigin="anonymous" />
      {renderTimeRangeSelector()}
      {videoDuration !== null && (
        <p className="text-sm text-gray-300 mb-4">Video Duration: {videoDuration.toFixed(2)} seconds</p>
      )}

      <label className="inline-flex items-center mb-4">
        <input
          type="checkbox"
          checked={enableOriginalAudio}
          onChange={(e) => setEnableOriginalAudio(e.target.checked)}
          className="form-checkbox h-5 w-5 ml-4 mt-4 text-blue-600 rounded cursor-pointer"
        />
        <span className="ml-2 mt-6 relative bottom-1 font-sans text-gray-300 cursor-pointer">
          Enable Original Audio [Select to include the video&apos;s original audio]
        </span>

      </label>
      <Suspense fallback={<div>Loading Subtitle Editor...</div>}>

        <SubtitleEditor
          subtitles={subtitles}
          setSubtitles={setSubtitles}
          videoDuration={videoDuration}
          updateSubtitleTime={updateSubtitleTime}
        />
      </Suspense>
      <div className="bg-gray-800 w-full mt-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
          aria-label="Position presets info"
        >
          <div className="bg-gray-800 p-2 mt-4 flex flex-row gap-2">
            <TbCircleLetterIFilled size={28} />
            <p className="font-sans text-xs md:text-[14.5px] mt-1">Position Presets Guide For Images and Text Shapes</p>
          </div>
        </button>
      </div>
      <Suspense fallback={<div>Loading Cover Photo...</div>}>
        <div className='mt-2'>

          <CoverPhoto
            coverPhoto={coverPhoto}
            setCoverPhoto={setCoverPhoto}
            coverPhotoDuration={coverPhotoDuration}
            setCoverPhotoDuration={setCoverPhotoDuration}
            videoDuration={videoDuration}
          />

        </div>
      </Suspense>
      <Suspense fallback={<div>Loading Image Overlay...</div>}>
        <ImageOverlay videoDuration={videoDuration} videoRef={videoRef} />
      </Suspense>
      <Suspense fallback={<div>Loading Music Editor...</div>}>
        <MusicEditor
          enableMusic={enableMusic}
          setEnableMusic={setEnableMusic}
          musicTracks={musicTracks}
          setMusicTracks={setMusicTracks}
          selectedTracks={selectedTracks}
          setSelectedTracks={setSelectedTracks}
          customMusicTracks={customMusicTracks}
          setCustomMusicTracks={setCustomMusicTracks}
          musicStartTimes={musicStartTimes}
          setMusicStartTimes={setMusicStartTimes}
          musicEndTimes={musicEndTimes}
          setMusicEndTimes={setMusicEndTimes}
          musicVolumes={musicVolumes}
          setMusicVolumes={setMusicVolumes}
          musicFadeDurations={musicFadeDurations}
          setMusicFadeDurations={setMusicFadeDurations}
          howlInstances={howlInstances}
          setHowlInstances={setHowlInstances}
          isMusicPlaying={isMusicPlaying}
          setIsMusicPlaying={setIsMusicPlaying}
          toggleMusicPreview={toggleMusicPreview}
          stopMusicPreview={stopMusicPreview}
          removeCustomTrack={removeCustomTrack}
          toggleTrackSelection={toggleTrackSelection}
          isTrackSelected={isTrackSelected}
          handleMusicUpload={handleMusicUpload}
        />
      </Suspense>
      <label className="inline-flex items-center mb-4">
        <input
          type="checkbox"
          checked={enableMusic}
          onChange={(e) => setEnableMusic(e.target.checked)}
          className="form-checkbox h-5 w-5 ml-4 mt-4 text-blue-600 rounded cursor-pointer"
        />
        <span className="ml-2 mt-4 font-sans text-gray-300 cursor-pointer">
          Enable Background Music [Kindly enable the checkbox to include music in the video.]
        </span>
      </label>
      <Suspense fallback={<div>Loading Background Color...</div>}>
        <BackgroundColorSection
          enableBackground={enableBackground}
          backgroundColors={backgroundColors}
          selectedBgColors={selectedBgColors}
          setSelectedBgColors={setSelectedBgColors}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          manualBgColor={manualBgColor}
          setManualBgColor={setManualBgColor}
          manualBgStartTime={manualBgStartTime}
          setManualBgStartTime={setManualBgStartTime}
          manualBgEndTime={manualBgEndTime}
          setManualBgEndTime={setManualBgEndTime}
          bgColorStartTime={bgColorStartTime}
          setBgColorStartTime={setBgColorStartTime}
          bgColorEndTime={bgColorEndTime}
          setBgColorEndTime={setBgColorEndTime}
          videoDuration={videoDuration}
        />
      </Suspense>
      <label className="inline-flex items-center mb-4">
        <input
          type="checkbox"
          checked={enableBackground}
          onChange={(e) => setEnableBackground(e.target.checked)}
          className="form-checkbox h-5 w-5 ml-4 mt-4 text-blue-600 rounded cursor-pointer"
        />
        <span className="ml-2 mt-4 font-sans text-gray-300 cursor-pointer">
          Enable Background Color [Please enable the checkbox to add a background color to the video.]
        </span>
      </label>
      <Suspense fallback={<div>Loading Text Shapes...</div>}>
        <TextShapesEditor
          enableTextShape={enableTextShape}
          setEnableTextShape={setEnableTextShape}
          textShapes={textShapes}
          setTextShapes={setTextShapes}
          videoDuration={videoDuration}
          videoRef={videoRef}
          videoHeight={dimensions.height || 1080}
        />
      </Suspense>
      <label className="inline-flex items-center mb-4">
        <input
          type="checkbox"
          checked={enableTextShape}
          onChange={(e) => setEnableTextShape(e.target.checked)}
          className="form-checkbox h-5 w-5 ml-4 mt-4 text-blue-600 rounded cursor-pointer"
        />
        <span className="ml-2 mt-2 relative top-1 font-sans text-gray-300 cursor-pointer">
          Enable Text Shape [Kindly select the checkbox to add text shapes]
        </span>
      </label>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6 mt-4">
        <button
          onClick={handleEdit}
          disabled={processing || !video}
          className="bg-blue-600 font-sans px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {processing ? 'Processing...' : 'Edit & Preview Video'}
        </button>
        <button
          onClick={handleDownloadSubtitles}
          className="bg-green-600 px-6 py-2 font-sans rounded hover:bg-green-700 cursor-pointer"
        >
          Download Subtitles (.srt)
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        {activeImages.length > 0 && (
          <div className="bg-opacity-50 p-2 rounded text-sm sm:text-lg font-sans">
            Active Images: {activeImages.join(', ')}
          </div>
        )}
      </div>
      <div className='flex justify-end'>
        <div className='flex flex-col'>
          <label htmlFor="downloadFormat" className="block text-sm font-semibold text-white mb-2 font-sans">
            Select Download Format
          </label>
          <select
            id="downloadFormat"
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value)}
            className="block w-full sm:w-auto bg-gray-800 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ease-in-out duration-200"
          >
            {downloadFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {editedVideoUrl && (
        <div className="mt-6 relative">
          <video
            src={editedVideoUrl}
            controls
            className="w-full h-auto max-h-[70vh] rounded shadow"
            onTimeUpdate={(e) => {
              const current = e.target.currentTime;
              const activeSub = subtitles.find((s) => current >= s.start && current <= s.end + 1);
              setCurrentSubtitle(activeSub?.text || '');
              const activeImgs = images.filter((img) => current >= img.startTime && current <= img.endTime);
              setActiveImages(activeImgs.map((img) => img.name));
              const activeBg = selectedBgColors.find(
                (bg) => current >= bg.startTime && current <= bg.endTime
              );
              setActiveBgColor(activeBg);
              const activeTextShapes = textShapes.filter(
                (shape) => current >= shape.startTime && current <= shape.endTime
              );
              setActiveTextShapes(activeTextShapes);
            }}
          />
          {activeBgColor && (
            <div className="mt-2 flex items-center">
              <span className="mr-2 font-sans">Active Background:</span>
              <div
                className="w-6 h-6 rounded-full border border-gray-400"
                style={{ backgroundColor: activeBgColor.code }}
              />
              <span className="ml-2 font-sans">{activeBgColor.name}</span>
            </div>
          )}
          {activeTextShapes.length > 0 && (
            <div className="mt-2">
              <span className="font-sans">Active Text Shapes: </span>
              {activeTextShapes.map((shape, i) => (
                <span key={i} className="ml-2 font-sans">
                  '{shape.text}' ({shape.shape})
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
        {editedVideoUrl ? (
          <a
            href={editedVideoUrl}
            onClick={handleDisplay}
            download={`edited-video.${getFileExtension(downloadFormat)}`}
            className="font-sans outline-none cursor-pointer inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ease-in-out w-full sm:w-auto"
          >
            Download Edited Video ({downloadFormat.toUpperCase()})
          </a>
        ) : (
          <button
            onClick={handleDirectDownload}
            disabled={!video}
            className="font-sans outline-none cursor-pointer inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ease-in-out w-full sm:w-auto disabled:opacity-50"
          >
            Download Original Video ({downloadFormat.toUpperCase()})
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Position Presets Guide</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white cursor-pointer hover:text-gray-400 transition-colors"
              >
                <AiOutlineClose className="text-xl" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-6">
                <h4 className="font-medium mb-2 text-blue-400">Horizontal (X) Positions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <PositionItem name="Far Left" value="100px" desc="Safe margin from left edge" />
                  <PositionItem name="Left Third" value="480px" desc="Left-aligned content" />
                  <PositionItem name="Center Left" value="640px" desc="Between left and center" />
                  <PositionItem name="Center" value="960px" desc="Exact horizontal middle" />
                  <PositionItem name="Center Right" value="1280px" desc="Between center and right" />
                  <PositionItem name="Right Third" value="1440px" desc="Right-aligned content" />
                  <PositionItem name="Far Right" value="1820px" desc="Safe margin from right edge" />
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-blue-400">Vertical (Y) Positions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <PositionItem name="Far Top" value="100px" desc="Safe margin from top edge" />
                  <PositionItem name="Upper Third" value="240px" desc="For titles/headings" />
                  <PositionItem name="Center Top" value="360px" desc="Just above center" />
                  <PositionItem name="Center" value="540px" desc="Exact vertical middle" />
                  <PositionItem name="Center Bottom" value="720px" desc="Just below center" />
                  <PositionItem name="Lower Third" value="810px" desc="Standard text position" />
                  <PositionItem name="Far Bottom" value="980px" desc="Safe margin from bottom" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
                <p className="font-medium">Note:</p>
                <p>All values are for 1920×1080 resolution. Positions are in pixels.</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
