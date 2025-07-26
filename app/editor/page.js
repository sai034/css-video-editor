'use client';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TbCircleLetterIFilled, TbShare3 } from 'react-icons/tb';
import { AiOutlineClose } from 'react-icons/ai';
import { Howl, Howler } from 'howler';
import { FaPlay, FaCheck, FaImages, FaMusic, FaPalette, FaFont, FaDownload } from 'react-icons/fa';

const SubtitleEditor = lazy(() => import('../subtitleEditor/page'));
const ImageOverlay = lazy(() => import('../imageOverlay/page'));
const MusicEditor = lazy(() => import('../musicEditor/page'));
const BackgroundColorSection = lazy(() => import('../backgroundColor/page'));
const TextShapesEditor = lazy(() => import('../textShapes/page'));
const CoverPhoto = lazy(() => import('../coverPhoto/page'));

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
  // State declarations
  const [backgroundColors] = useState([
    { id: '1', name: 'Black', code: '#000000', image: '/images/bg-black.jpg' },
    { id: '2', name: 'White', code: '#FFFFFF', image: '/images/bg-white.jpg' },
    { id: '3', name: 'Light Blue', code: '#ADD8E6', image: '/images/bg-light-blue.jpg' },
    { id: '4', name: 'Dark Blue', code: '#1E3A8A', image: '/images/bg-dark-blue.jpg' },
    { id: '5', name: 'Red', code: '#EF4444', image: '/images/bg-red.jpg' },
    { id: '6', name: 'Green', code: '#10B981', image: '/images/bg-green.jpg' },
    { id: '7', name: 'Yellow', code: '#FFFF00', image: '/images/bg-yellow.jpg' },
    { id: '8', name: 'Orange', code: '#FFA500', image: '/images/bg-orange.jpg' },
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
    fontFamily: 'Arial',
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 10,
    showBackground: true,
    customShapePath: '', // Add this for custom shapes
    rotation: 0,
  });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoDuration, setCoverPhotoDuration] = useState(1);
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
  const [isMobile, setIsMobile] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [countdown, setCountdown] = useState(null);
  // Refs
  const rangeSliderRef = useRef(null);
  const previewVideoRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const imageRefs = useRef({});

  // Redux
  const dispatch = useDispatch();
  const { images } = useSelector((state) => state.imageOverlay || { images: [] });

  // Mobile detection and sharing capability
  useEffect(() => {
    const checkMobileAndSharing = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      if (navigator.share && navigator.canShare) {
        try {
          setCanShare(navigator.canShare({ files: [new File([''], 'test.mp4', { type: 'video/mp4' })] }));
        } catch (e) {
          setCanShare(false);
        }
      } else {
        setCanShare(false);
      }
    };
    checkMobileAndSharing();
    window.addEventListener('resize', checkMobileAndSharing);
    return () => window.removeEventListener('resize', checkMobileAndSharing);
  }, []);

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

  const getFileExtension = (format) => {
    return format.toLowerCase();
  };


  const generateShapePath = (shapeName, width, height) => {
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
          document.body.removeChild(videoElement);
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
    if (howlInstances[trackId]?.playing()) {
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

  // Download and Share
  const handleDirectDownload = () => {
    if (!video) {
      toast.error('No video selected for download!');
      return;
    }
    const url = URL.createObjectURL(video);
    const filename = `video.${getFileExtension(downloadFormat)}`;
    handleDownload(url, filename);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (url, filename) => {
    try {
      const extension = getFileExtension(downloadFormat);
      const sanitizedFilename = filename.replace(/\.[^/.]+$/, '') + `.${extension}`;
      if (isMobile) {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(new Blob([blob], { type: getMimeType(downloadFormat) }));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = sanitizedFilename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.info(
          <div className='grid grid-cols-1'>
            <div>
              <p>For android devices:</p>
              <ol className="list-decimal pl-5">
                <li>Download the video</li>
                <li>Open WhatsApp and tap the attachment icon.</li>
                <li>Select &quot;Documents&quot;, then click &quot;Browse documents&quot; and choose the file you want.</li>
              </ol>
            </div>
            <div>
              <p>For iOS devices:</p>
              <ol className="list-decimal pl-5">
                <li>Tap and hold the video</li>
                <li>Select &quot;Save Video&quot;</li>
                <li>Or use the Share button</li>
              </ol>
            </div>
          </div>,
          { autoClose: 10000 }
        );
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = sanitizedFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download video.');
    }
  };


const handleEdit = async () => {
  if (!video || !videoDuration || timeRange.start >= timeRange.end) {
    toast.error('Please select a valid time range!');
    return;
  }
  
  const selectedFormat = downloadFormats.find((f) => f.value === downloadFormat);
  if (!selectedFormat.supported) {
    toast.warn(
      `${selectedFormat.label} is not supported for editing. Use WebM or MP4 for editing.`
    );
    return;
  }
  if (coverPhotoImage && !coverPhotoImage.complete) {
    toast.error('Cover photo not loaded. Please try again.');
    return;
  }
  stopMusicPreview();
  setProcessing(true);

  // Warn mobile users about potential file size increase
  if (isMobile) {
    toast.info('Ultra-high-quality video selected (4K). This may result in significantly larger file sizes.');
  }

  // Estimate processing time (1.5 seconds per second of video duration)
  const estimatedTime = Math.ceil((timeRange.end - timeRange.start) * 1.5);
  setCountdown(estimatedTime);

  // Start countdown timer
  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return null;
      }
      return prev - 1;
    });
  }, 1000);

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
      clearInterval(timer);
      setCountdown(null);
      return;
    }






const pixelRatio = 1; // Keep this fixed for mobile to avoid GPU overload

// 🆕 Allow up to 1080p on mobile if original video supports it
const maxWidth = isMobile ? Math.min(videoElement.videoWidth, 1920) : 3840;
const maxHeight = isMobile ? Math.min(videoElement.videoHeight, 1080) : 2160;

const scaleRatio = Math.min(maxWidth / videoElement.videoWidth, maxHeight / videoElement.videoHeight, 1);
const canvasWidth = Math.floor(videoElement.videoWidth * scaleRatio);
const canvasHeight = Math.floor(videoElement.videoHeight * scaleRatio);


    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true, 
      alpha: false,
      desynchronized: true
    });
    if (!ctx) {
      toast.error('Failed to initialize canvas context.');
      setProcessing(false);
      clearInterval(timer);
      setCountdown(null);
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 44100,
    });
    const destination = audioContext.createMediaStreamDestination();
    const audioStream = destination.stream;

    const frameRate = isMobile ? 24 : 30;
    const videoStream = canvas.captureStream(frameRate);
    const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);


const options = {
  mimeType: isMobile && downloadFormat === 'mp4' ? 'video/mp4;codecs=avc1' : getMimeType(downloadFormat),
  videoBitsPerSecond: isMobile ? 6000000 : 12000000, 
  audioBitsPerSecond: 128000,
};



    try {
      mediaRecorderRef.current = new MediaRecorder(combinedStream, options);
    } catch (error) {
      toast.error('Failed to initialize MediaRecorder.');
      setProcessing(false);
      clearInterval(timer);
      setCountdown(null);
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
      clearInterval(timer);
      setCountdown(null);
    };
    mediaRecorderRef.current.start();

    const videoAudioSource = audioContext.createMediaElementSource(videoElement);
    const musicGainNodes = {};
    const musicSources = {};

    if (enableMusic && selectedMusicTracks.length > 0) {
      for (const track of selectedMusicTracks) {
        try {
          console.log(`Loading music track: ${track.name} (ID: ${track.id})`);
          const response = await fetch(track.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = false;
          const gainNode = audioContext.createGain();
          gainNode.gain.setValueAtTime(musicVolumes[track.id] || 0.5, audioContext.currentTime);
          source.connect(gainNode);
          gainNode.connect(destination);
          musicSources[track.id] = source;
          musicGainNodes[track.id] = gainNode;

          const trackStartTime = parseFloat(musicStartTimes[track.id]) || 0;
          const trackEndTime = parseFloat(musicEndTimes[track.id]) || track.duration;
          const relativeStart = trackStartTime - startTimeSec;
          const relativeEnd = trackEndTime - startTimeSec;
          const videoDuration = endTimeSec - startTimeSec;

          console.log(`Track ${track.name}: startTime=${trackStartTime}, endTime=${trackEndTime}, relativeStart=${relativeStart}, relativeEnd=${relativeEnd}, videoDuration=${videoDuration}`);

          if (relativeEnd > 0 && relativeStart < videoDuration) {
            const playStart = Math.max(0, relativeStart);
            const playDuration = Math.min(trackEndTime - trackStartTime, videoDuration - playStart);
            const bufferOffset = Math.max(0, -relativeStart);

            console.log(`Scheduling track ${track.name}: playStart=${playStart}, playDuration=${playDuration}, bufferOffset=${bufferOffset}`);

            if (playDuration > 0) {
              source.start(audioContext.currentTime + playStart, bufferOffset, playDuration);
              source.onended = () => {
                console.log(`Track ${track.name} ended`);
              };
            } else {
              console.warn(`Track ${track.name} has invalid play duration: ${playDuration}`);
            }
          } else {
            console.warn(`Track ${track.name} is outside video time range`);
          }
        } catch (error) {
          console.error(`Error loading music track ${track.name} (ID: ${track.id}):`, error);
          toast.error(`Failed to load music track: ${track.name}`);
        }
      }
    }

    const originalAudioGain = audioContext.createGain();
    videoAudioSource.connect(originalAudioGain);
    originalAudioGain.gain.setValueAtTime(enableOriginalAudio ? 1.0 : 0.0, audioContext.currentTime);
    originalAudioGain.connect(destination);
    videoElement.currentTime = startTimeSec;
    const coverPhotoDurationSafe = coverPhotoDuration || 1;

    let lastFrameTime = performance.now();
    const frameInterval = 1000 / frameRate;

    const processFrame = () => {
      if (videoElement.paused || videoElement.ended || videoElement.currentTime >= endTimeSec) {
        Object.values(musicSources).forEach((source) => {
          try {
            source.stop();
            console.log('Music source stopped');
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

        if (activeBg && enableBackground) {
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

        const imagesToRender = isMobile ? images.slice(0, 2) : images;
        imagesToRender.forEach((img) => {
          const image = imageRefs.current[img.id];
          if (image && currentTime >= img.startTime && currentTime <= img.endTime) {
            ctx.globalAlpha = img.opacity;
            let displayWidth = img.size.width * pixelRatio;
            let displayHeight = img.size.height * pixelRatio;
            if (img.size.width && !img.size.height) {
              displayHeight = (img.size.width / img.naturalWidth) * img.naturalHeight * pixelRatio;
            } else if (img.size.height && !img.size.width) {
              displayWidth = (img.size.height / img.naturalHeight) * img.naturalWidth * pixelRatio;
            }
            ctx.drawImage(
              image,
              img.position.x * pixelRatio,
              img.position.y * pixelRatio,
              displayWidth,
              displayHeight
            );
            ctx.globalAlpha = 1.0;
          }
        });

        const shapesToRender = isMobile ? textShapes.slice(0, 2) : textShapes;
        shapesToRender.forEach((shape) => {
          if (currentTime >= shape.startTime && currentTime <= shape.endTime && enableTextShape) {
            ctx.save();
            ctx.globalAlpha = shape.opacity;
            if (shape.shape !== 'none') {
              ctx.beginPath();
              let path;
              if (shape.shape === 'custom' && shape.customShapeName) {
                path = new Path2D(generateShapePath(shape.customShapeName, shape.size.width * pixelRatio, shape.size.height * pixelRatio));
              } else {
                path = new Path2D(generateShapePath(shape.shape, shape.size.width * pixelRatio, shape.size.height * pixelRatio));
              }
              ctx.translate(shape.position.x * pixelRatio, shape.position.y * pixelRatio);
              if (shape.showBackground) {
                ctx.fillStyle = shape.backgroundColor;
                ctx.fill(path);
              }
              ctx.strokeStyle = shape.borderColor;
              ctx.lineWidth = shape.borderWidth * pixelRatio;
              ctx.stroke(path);
              ctx.translate(-shape.position.x * pixelRatio, -shape.position.y * pixelRatio);
            }
            ctx.fillStyle = shape.color;
            ctx.font = `${shape.fontSize * pixelRatio}px "${shape.fontFamily || 'Arial'}"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textX = shape.shape === 'none' ? shape.position.x * pixelRatio : shape.position.x * pixelRatio + (shape.size.width * pixelRatio) / 2;
            const textY = shape.shape === 'none' ? shape.position.y * pixelRatio : shape.position.y * pixelRatio + (shape.size.height * pixelRatio) / 2;
            ctx.fillText(shape.text, textX, textY);
            ctx.restore();
          }
        });

        const activeSubtitle = currentSubtitles.find(
          (s) => currentTime >= s.start && currentTime <= s.end
        );
        if (activeSubtitle) {
          ctx.fillStyle = 'white';
          ctx.font = `bold ${activeSubtitle.fontSize * pixelRatio || 24 * pixelRatio}px ${activeSubtitle.fontType || 'Arial'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 6 * pixelRatio;
          ctx.strokeText(activeSubtitle.text, canvas.width / 2, canvas.height - 40 * pixelRatio);
          ctx.fillText(activeSubtitle.text, canvas.width / 2, canvas.height - 40 * pixelRatio);
        }
      }

      const now = performance.now();
      const elapsed = now - lastFrameTime;
      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);
        requestAnimationFrame(processFrame);
      } else {
        setTimeout(() => requestAnimationFrame(processFrame), frameInterval - elapsed);
      }
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
    clearInterval(timer);
    setCountdown(null);
  };
};


  const handleDownloadSubtitles = () => {
    if (!subtitles.length) {
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
      .join('\n');
    const blob = new Blob([srtContent], { type: 'text/srt' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subtitles.srt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
  const renderTimeRangeSelector = () => {
    if (!video || !videoDuration) return null;
    return (
      <div className="mb-8 bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-200 font-sans mb-4">Please Select Your Desired Time Range</h3>
        <div className="relative mb-6">
          <div className="relative h-48 md:h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <video
              ref={previewVideoRef}
              src={URL.createObjectURL(video)}
              className="w-full h-full object-contain"
              muted
              playsInline
              onLoadedMetadata={() => {
                if (previewVideoRef.current && videoDuration) {
                  previewVideoRef.current.currentTime = timeRange.start;
                }
              }}
              onError={() => toast.error('Failed to load video preview')}
            />
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gray-700">
              <div
                className="absolute h-full bg-blue-600 opacity-75"
                style={{
                  left: `${(timeRange.start / videoDuration) * 100}%`,
                  width: `${((timeRange.end - timeRange.start) / videoDuration) * 100}%`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ew-resize shadow-md"
                style={{ left: `${(timeRange.start / videoDuration) * 100}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-ew-resize shadow-md"
                style={{ left: `${(timeRange.end / videoDuration) * 100}%` }}
              />
            </div>
          </div>
          <div
            ref={rangeSliderRef}
            className="relative h-6 bg-gray-600 rounded-full cursor-pointer mt-4"
            onMouseDown={(e) => {
              const rect = rangeSliderRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = Math.min(Math.max(x / rect.width, 0), 1);
              const time = percentage * videoDuration;
              const startDistance = Math.abs(time - timeRange.start);
              const endDistance = Math.abs(time - timeRange.end);
              if (startDistance < endDistance && startDistance < 0.5) {
                setIsDraggingStart(true);
              } else if (endDistance <= startDistance && endDistance < 0.5) {
                setIsDraggingEnd(true);
              } else {
                setIsScrubbing(true);
                setScrubbingTime(time);
                updatePreviewTime(time);
              }
            }}
          >
            <div
              className="absolute h-full bg-blue-600 rounded-full"
              style={{
                left: `${(timeRange.start / videoDuration) * 100}%`,
                width: `${((timeRange.end - timeRange.start) / videoDuration) * 100}%`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-ew-resize"
              style={{ left: `${(timeRange.start / videoDuration) * 100}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingStart(true);
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-ew-resize"
              style={{ left: `${(timeRange.end / videoDuration) * 100}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingEnd(true);
                updatePreviewTime(timeRange.end);
              }}
            />
            {isScrubbing && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-8 bg-red-500"
                style={{ left: `${(scrubbingTime / videoDuration) * 100}%` }}
              />
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time: {timeRange.start.toFixed(2)}s
              </label>
              <input
                type="range"
                min="0"
                max={videoDuration}
                step="0.1"
                value={timeRange.start}
                onChange={(e) => {
                  const newStart = parseFloat(e.target.value);
                  setTimeRange((prev) => ({ ...prev, start: Math.min(newStart, prev.end - 0.5) }));
                  updatePreviewTime(newStart);
                }}
                className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time: {timeRange.end.toFixed(2)}s
              </label>
              <input
                type="range"
                min={timeRange.start + 0.5}
                max={videoDuration}
                step="0.1"
                value={timeRange.end}
                onChange={(e) => {
                  const newEnd = parseFloat(e.target.value);
                  setTimeRange((prev) => ({ ...prev, end: Math.max(newEnd, prev.start + 0.5) }));
                  updatePreviewTime(newEnd);
                }}
                className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer accent-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-300">
            <span>Start: {timeRange.start.toFixed(2)}s</span>
            <span>Duration: {(timeRange.end - timeRange.start).toFixed(2)}s</span>
            <span>End: {timeRange.end.toFixed(2)}s</span>
          </div>
        </div>
      </div>
    );
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
  }, [isDraggingStart, isDraggingEnd, isScrubbing, videoDuration]);

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
      if (!currentIds.includes(id)) delete imageRefs.current[id];
    });
  }, [images]);

  useEffect(() => {
    Object.entries(musicEndTimes).forEach(([trackId, endTime]) => {
      const startTime = musicStartTimes[trackId] || 0;
      if (endTime <= startTime) toast.warn('Music end time should be after start time.');
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
  }, []);

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
          {video ? video.name : 'Drag and drop a video here or click to upload (Webm/Mp4)'}
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
        <span className="ml-2 mt-4 font-sans text-gray-300 cursor-pointer">
          Enable Original Audio [Select to keep original audio]
        </span>
      </label>
      <Suspense fallback={<div className='flex justify-center items-center'> <svg
        className="animate-spin h-7 w-7 text-white mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg></div>}>
        <SubtitleEditor
          subtitles={subtitles}
          setSubtitles={setSubtitles}
          videoDuration={videoDuration}
          updateSubtitleTime={updateSubtitleTime}
        />
      </Suspense>

      <Suspense fallback={<div className='flex justify-center items-center'> <svg
        className="animate-spin h-7 w-7 text-white mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg></div>}>
        <div className="mt-4">
          <CoverPhoto
            coverPhoto={coverPhoto}
            setCoverPhoto={setCoverPhoto}
            coverPhotoDuration={coverPhotoDuration}
            setCoverPhotoDuration={setCoverPhotoDuration}
            videoDuration={videoDuration}
          />
        </div>
      </Suspense>
      <Suspense fallback={<div className='mt-4 flex justify-center items-center'> <svg
        className="animate-spin h-7 w-7 text-white mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg></div>}>
        <ImageOverlay videoDuration={videoDuration} videoRef={videoRef} />
      </Suspense>
      <Suspense fallback={<div className='flex justify-center items-center'> <svg
        className="animate-spin h-7 w-7 text-white mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg></div>}>
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
          Enable Background Music [Select to include music]
        </span>
      </label>
      <Suspense fallback={<div className='flex justify-center items-center'> <svg
        className="animate-spin h-7 w-7 text-white mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg></div>}>
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
          Enable Background Color [Select to add background color]
        </span>
      </label>
      <Suspense fallback={<div className='flex justify-center items-center'> <svg
        className="animate-spin h-7 w-7 text-white mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg></div>}>
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
          className="form-checkbox h-5 w-5 ml-4 mt-2 text-blue-600 rounded cursor-pointer"
        />
        <span className="ml-2 mt-2 font-sans text-gray-300 cursor-pointer">
          Enable Text Shapes [Select to add text shapes]
        </span>
      </label>
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleEdit}
          disabled={processing || !video}
          className="bg-blue-600 font-sans px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer flex items-center justify-center w-full sm:w-auto"
        >
          {processing ? (
            <svg
              className="animate-spin h-7 w-7 text-white mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
          {processing ? 'Editing...' : 'Edit & Preview Video'}
        </button>

        <button
          onClick={handleDownloadSubtitles}
          className="bg-green-600 font-sans px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer flex items-center justify-center w-full sm:w-auto"
        >
          Download Subtitles (.srt)
        </button>

      </div>
      {/* {countdown !== null && (
        <span className="ml-2 text-lg text-[white] font-sans">
          Video will be ready with in ~{countdown}s
        </span>
      )} */}
      {countdown !== null ? (
  <div className=" bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between max-w-sm mx-auto sm:mx-0 z-50">
    <span className="text-sm sm:text-base font-sans">
      Video will be ready with in ~{countdown}s
    </span>
    <svg
      className="animate-spin h-5 w-5 text-blue-500 ml-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
) : editedVideoUrl ? (
  <div className="mb-2 bg-gray-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between max-w-sm mx-auto sm:mx-0 z-50">
    <span className="text-sm sm:text-base font-sans">
      Video is completed and ready to download
    </span>
    <FaCheck className="h-5 w-5 ml-2" />
  </div>
) : null}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
        {activeImages.length > 0 && (
          <div className="p-2 bg-gray-700 rounded text-sm sm:text-lg font-semibold">
            Active Images: {activeImages.join(', ')}
          </div>
        )}
      </div>
      {countdown !== null && (
        <span className="absolute top-[-1.5rem] left-0 text-sm text-gray-300">
          Video ready in ~{countdown}s
        </span>
      )
      }
      <div className="flex justify-end">
        <div className="flex flex-col">
          <label htmlFor="downloadFormat" className="block text-sm font-semibold mb-0.5">
            Select Download Format
          </label>
          <select
            id="downloadFormat"
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="mt-4">
          <video
            src={editedVideoUrl}
            controls
            className="w-full h-auto max-h-[70vh] rounded shadow-md"
            onTimeUpdate={(e) => {
              const current = e.target.currentTime;
              const activeSub = subtitles.find((s) => current >= s.start && current <= s.end + 1);
              setCurrentSubtitle(activeSub?.text || '');
              const activeImgs = images.filter((img) => current >= img.startTime && current <= img.endTime);
              setActiveImages(activeImgs.map((img) => img.name || img.id));
              const activeBg = selectedBgColors.find(
                (bg) => current >= bg.startTime && current <= bg.endTime
              );
              setActiveBgColor(activeBg);
              const activeShapes = textShapes.filter(
                (shape) => current >= shape.startTime && current <= shape.endTime
              );
              setActiveTextShapes(activeShapes);
            }}
          />
          {downloadFormat === "mp4" &&

            <p className="mt-2 font-sans text-xs text-gray-600 flex-none lg:hidden">
              Unfortunately, you won&apos;t be able to share the edited MP4 video directly through WhatsApp on your mobile phone, but you can share it via WhatsApp on your laptop. You can also use other applications on your mobile or laptop to share the MP4. Other file formats can still be sent through WhatsApp without issues.
            </p>

          }
          {activeBgColor && (
            <div className="mt-2 flex items-center">
              <span className="mr-2">Active Background:</span>
              <div
                className="w-6 h-6 rounded-full border border-gray-400"
                style={{ backgroundColor: activeBgColor.code }}
              />
              <span className="ml-2">{activeBgColor.name}</span>
            </div>
          )}
          {activeTextShapes.length > 0 && (
            <div className="mt-2">
              <span>Active Text Shapes:</span>
              {activeTextShapes.map((shape, index) => (
                <span key={index} className="ml-2">
                  `{shape.text}` ({shape.shape})
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2 items-center">
        {editedVideoUrl ? (
          <>

            <button
              onClick={() => handleDownload(editedVideoUrl, `edited-video.${getFileExtension(downloadFormat)}`)}
              className="font-sans outline-none cursor-pointer inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ease-in-out w-full sm:w-auto"
            >
              <FaDownload className="mr-2" />
              Download Edited Video ({downloadFormat.toUpperCase()})
            </button>

          </>
        ) : (
          <button
            onClick={handleDirectDownload}
            disabled={!video}
            className="font-sans outline-none cursor-pointer inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 ease-in-out w-full sm:w-auto disabled:opacity-50"
          >
            <FaDownload className="mr-2" />
            Download Original
          </button>
        )}
      </div>

    </div>
  );
}