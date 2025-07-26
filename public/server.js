
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(fileUpload());
app.use(express.json());

// Ensure temp directory exists
const TEMP_DIR = path.join(__dirname, 'temp');
fs.mkdir(TEMP_DIR, { recursive: true });

app.post('/api/process-video', async (req, res) => {
  try {
    // Validate inputs
    if (!req.files || !req.files.video) {
      return res.status(400).send('No video file uploaded');
    }

    const videoFile = req.files.video;
    const coverPhoto = req.files.coverPhoto || null;
    const { subtitles, images, musicTracks, timeRange, coverPhotoDuration, textShapes, backgroundColors, enableOriginalAudio, format } = req.body;

    // Parse JSON fields
    const parsedSubtitles = JSON.parse(subtitles || '[]');
    const parsedImages = JSON.parse(images || '[]');
    const parsedMusicTracks = JSON.parse(musicTracks || '[]');
    const parsedTimeRange = JSON.parse(timeRange || '{}');
    const parsedTextShapes = JSON.parse(textShapes || '[]');
    const parsedBackgroundColors = JSON.parse(backgroundColors || '[]');
    const enableAudio = enableOriginalAudio === 'true';
    const outputFormat = format || 'mp4';

    // Save uploaded files
    const videoPath = path.join(TEMP_DIR, `input-${Date.now()}.mp4`);
    await videoFile.mv(videoPath);
    const outputPath = path.join(TEMP_DIR, `output-${Date.now()}.${outputFormat}`);

    // Prepare FFmpeg command
    let ffmpegCommand = ffmpeg(videoPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset fast',
        '-movflags +faststart',
        '-b:v 3M', // 3Mbps video bitrate
        '-b:a 128k', // 128kbps audio bitrate
        `-t ${parsedTimeRange.end - parsedTimeRange.start}`,
        `-ss ${parsedTimeRange.start}`,
      ]);

    // Apply audio settings
    if (!enableAudio) {
      ffmpegCommand = ffmpegCommand.noAudio();
    }

    // Add music tracks
    if (parsedMusicTracks.length > 0) {
      const musicFiles = [];
      for (const track of parsedMusicTracks) {
        if (track.file) {
          const musicPath = path.join(TEMP_DIR, `music-${track.id}-${Date.now()}.mp3`);
          await track.file.mv(musicPath);
          musicFiles.push({ path: musicPath, start: track.startTime, duration: track.endTime - track.startTime, volume: track.volume });
        }
      }

      if (musicFiles.length > 0) {
        const amixFilter = musicFiles.map((track, i) => `[${i + (enableAudio ? 1 : 0)}:a]volume=${track.volume}[a${i}]`).join(';');
        const mix = `[a0]${musicFiles.map((_, i) => `[a${i}]`).join('')}amix=inputs=${musicFiles.length}[mixed]`;
        ffmpegCommand = ffmpegCommand
          .input(musicFiles.map(f => f.path))
          .complexFilter(`${amixFilter};${mix}`)
          .outputOptions('-map 0:v -map [mixed]');
      }
    }

    // Add subtitles (as SRT file)
    if (parsedSubtitles.length > 0) {
      const srtContent = parsedSubtitles
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
      const srtPath = path.join(TEMP_DIR, `subtitles-${Date.now()}.srt`);
      await fs.writeFile(srtPath, srtContent);
      ffmpegCommand = ffmpegCommand
        .outputOptions([`-vf subtitles=${srtPath}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2'`]);
    }

    // Add cover photo
    if (coverPhoto) {
      const coverPath = path.join(TEMP_DIR, `cover-${Date.now()}.jpg`);
      await coverPhoto.mv(coverPath);
      ffmpegCommand = ffmpegCommand
        .input(coverPath)
        .complexFilter(`[0:v][1:v]overlay=0:0:enable='lte(t,${coverPhotoDuration})'[v]`)
        .outputOptions('-map [v]');
    }

    // Add text shapes and background colors (simplified example, extend as needed)
    let vfFilters = [];
    parsedTextShapes.forEach((shape) => {
      if (shape.text && shape.startTime <= shape.endTime) {
        const drawtext = `drawtext=text='${shape.text}':fontcolor=${shape.color}:fontsize=${shape.fontSize}:x=${shape.position.x}:y=${shape.position.y}:enable='between(t,${shape.startTime},${shape.endTime})'`;
        vfFilters.push(drawtext);
      }
    });
    parsedBackgroundColors.forEach((bg) => {
      if (bg.startTime <= bg.endTime) {
        const drawbox = `drawbox=x=0:y=0:w=iw:h=ih:color=${bg.code}:t=fill:enable='between(t,${bg.startTime},${bg.endTime})'`;
        vfFilters.push(drawbox);
      }
    });
    if (vfFilters.length > 0) {
      ffmpegCommand = ffmpegCommand.outputOptions(`-vf "${vfFilters.join(',')}"`);
    }

    // Execute FFmpeg
    ffmpegCommand
      .on('end', async () => {
        res.setHeader('Content-Type', `video/${outputFormat}`);
        res.setHeader('Content-Disposition', `attachment; filename="edited-video.${outputFormat}"`);
        const outputBuffer = await fs.readFile(outputPath);
        res.send(outputBuffer);

        // Clean up
        await fs.unlink(videoPath);
        if (coverPhoto) await fs.unlink(coverPath);
        if (parsedSubtitles.length > 0) await fs.unlink(srtPath);
        for (const music of musicFiles) await fs.unlink(music.path);
        await fs.unlink(outputPath);
      })
      .on('error', async (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).send('Error processing video');
        // Clean up
        await fs.unlink(videoPath).catch(() => {});
        if (coverPhoto) await fs.unlink(coverPath).catch(() => {});
        if (parsedSubtitles.length > 0) await fs.unlink(srtPath).catch(() => {});
        for (const music of musicFiles) await fs.unlink(music.path).catch(() => {});
      })
      .save(outputPath);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
