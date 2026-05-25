import React, { useEffect, useRef, useState } from 'react';
import { GlassSlider } from './GlassSlider';

const fallbackArt = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="24" fill="#20232a"/>
  <circle cx="60" cy="60" r="28" fill="#3b82f6"/>
  <path d="M50 46h16c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H50c-2.2 0-4-1.8-4-4V50c0-2.2 1.8-4 4-4Zm3 3v18h10V49H53Zm-5 5v8h4v-8h-4Z" fill="#f8fafc"/>
  <path d="M78 40c2.8 0 5 2.2 5 5v30c0 2.8-2.2 5-5 5" fill="none" stroke="#93c5fd" stroke-width="3" stroke-linecap="round"/>
</svg>
`)}`;

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const AudioPlayer = ({ currentUpload }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioSrc = currentUpload?.fileUrl
    ? `http://localhost:5000/${currentUpload.fileUrl.replace(/\\/g, '/')}`
    : '';

  useEffect(() => {
    if (!audioRef.current || !currentUpload) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    const audio = audioRef.current;
    audio.src = audioSrc;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.load();

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
      // Browsers may block autoplay until the user interacts.
    });
  }, [audioSrc, currentUpload]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Space' && event.key !== ' ') {
        return;
      }
      const target = event.target;
      if (!target || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
        return;
      }
      if (!audioRef.current || !currentUpload) {
        return;
      }
      event.preventDefault();
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        return;
      }
      audioRef.current.pause();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentUpload]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const updateVolume = () => setVolume(audio.volume);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('volumechange', updateVolume);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('volumechange', updateVolume);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  const handleTimelineChange = (e) => {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) {
      audioRef.current.currentTime = t;
    }
  };

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (v > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlayback = async () => {
    if (!audioRef.current || !currentUpload) return;
    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }
    audioRef.current.pause();
  };

  return (
    <div className="audio-player glass-panel">
      <div className="audio-player-inner">
        <img
          src={currentUpload?.coverArt || fallbackArt}
          alt={currentUpload?.filename || 'Album art'}
          className="audio-thumb"
        />
        <div className="audio-meta">
          <p>{currentUpload ? currentUpload.filename : 'Select a song to play'}</p>
          <p className="muted-copy">
            {currentUpload ? 'Playing from your collection' : 'Choose a song to start listening'}
          </p>
        </div>
      </div>
      <div className="audio-controls">
        <button
          type="button"
          className="audio-play-btn"
          onClick={togglePlayback}
          disabled={!currentUpload}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <rect x="5" y="4" width="3" height="12" rx="1.5" />
              <rect x="12" y="4" width="3" height="12" rx="1.5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6 4.5v11l9-5.5-9-5.5Z" />
            </svg>
          )}
        </button>
        <div className="audio-timeline">
          <span className="audio-time">{formatTime(currentTime)}</span>
          <GlassSlider
            min={0}
            max={duration || 1}
            step={0.01}
            value={currentTime}
            onChange={handleTimelineChange}
            aria-label="Seek timeline"
          />
          <span className="audio-time">{formatTime(duration)}</span>
        </div>
        <div className="audio-volume">
          <button
            type="button"
            className="audio-volume-icon"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            onClick={handleMute}
          >
            {isMuted || volume === 0 ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 8.5v3a1 1 0 0 0 1 1h2.5l3.5 3.5V4L7.5 7.5H5a1 1 0 0 0-1 1Z" fill="currentColor"/><path d="M15.5 8.5v3m-2-2.5 3 3m0-3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 8.5v3a1 1 0 0 0 1 1h2.5l3.5 3.5V4L7.5 7.5H5a1 1 0 0 0-1 1Z" fill="currentColor"/><path d="M14.5 10c0-1.38-.56-2.63-1.46-3.54m0 7.08A4.978 4.978 0 0 0 14.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )}
          </button>
          <GlassSlider
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            style={{ width: 80 }}
          />
        </div>
      </div>
      <audio ref={audioRef} src={audioSrc} style={{ display: 'none' }} />
    </div>
  );
};
