import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';

interface LivePlayerProps {
  src: string;
  poster?: string;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-theme-city'); // Optional theme
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        liveui: true,
        poster: poster,
        sources: [{
          src: src,
          type: 'application/x-mpegURL'
        }]
      }, () => {
        videojs.log('player is ready');
      });
    }
  }, [src, poster]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player className="w-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <div ref={videoRef} />
    </div>
  );
};
