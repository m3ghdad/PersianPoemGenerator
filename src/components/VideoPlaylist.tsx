import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface VideoPlaylistProps {
  isMuted: boolean;
}

export interface VideoPlaylistRef {
  navigateNext: () => void;
  navigatePrevious: () => void;
}

export const VideoPlaylist = forwardRef<VideoPlaylistRef, VideoPlaylistProps>(({ isMuted }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme } = useTheme();
  
  // Video URLs array for random selection
  const videoUrls = [
    "https://pspybykovwrfdxpkjpzd.supabase.co/storage/v1/object/public/poem-videos/07bb10c0-9358-41ce-8c76-dfffac886cbb/video_1759783667599.mp4",
    "https://pspybykovwrfdxpkjpzd.supabase.co/storage/v1/object/public/poem-videos/07bb10c0-9358-41ce-8c76-dfffac886cbb/video_1759784096398.mp4",
    "https://pspybykovwrfdxpkjpzd.supabase.co/storage/v1/object/public/poem-videos/07bb10c0-9358-41ce-8c76-dfffac886cbb/video_1759784508199.mp4",
    "https://pspybykovwrfdxpkjpzd.supabase.co/storage/v1/object/public/poem-videos/07bb10c0-9358-41ce-8c76-dfffac886cbb/video_1759785301412.mp4",
    "https://pspybykovwrfdxpkjpzd.supabase.co/storage/v1/object/public/poem-videos/07bb10c0-9358-41ce-8c76-dfffac886cbb/video_1759786378308.mp4",
    "https://pspybykovwrfdxpkjpzd.supabase.co/storage/v1/object/public/poem-videos/07bb10c0-9358-41ce-8c76-dfffac886cbb/video_1759786433870.mp4"
  ];

  // Start with a random video index on app load/refresh
  const [currentVideoIndex, setCurrentVideoIndex] = useState(() => {
    const randomIndex = Math.floor(Math.random() * videoUrls.length);
    console.log(`Starting video playlist with random video ${randomIndex + 1}/${videoUrls.length}`);
    return randomIndex;
  });

  // Get random video index that's different from current
  const getRandomVideoIndex = (currentIndex: number) => {
    if (videoUrls.length <= 1) return 0;
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * videoUrls.length);
    } while (newIndex === currentIndex);
    
    return newIndex;
  };

  // Manual navigation functions
  const navigateNext = () => {
    const nextIndex = (currentVideoIndex + 1) % videoUrls.length;
    console.log(`VideoPlaylist navigateNext called: video ${currentVideoIndex + 1} -> video ${nextIndex + 1} (${nextIndex + 1}/${videoUrls.length})`);
    switchToVideo(nextIndex);
  };

  const navigatePrevious = () => {
    const prevIndex = currentVideoIndex === 0 ? videoUrls.length - 1 : currentVideoIndex - 1;
    console.log(`VideoPlaylist navigatePrevious called: video ${currentVideoIndex + 1} -> video ${prevIndex + 1} (${prevIndex + 1}/${videoUrls.length})`);
    switchToVideo(prevIndex);
  };

  // Common video switching function
  const switchToVideo = (newIndex: number) => {
    const video = videoRef.current;
    if (!video || newIndex < 0 || newIndex >= videoUrls.length) return;
    
    video.src = videoUrls[newIndex];
    video.load();
    
    const playNext = () => {
      video.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Failed to play video after manual navigation:', error.name);
        }
      });
    };
    
    video.addEventListener('loadeddata', playNext, { once: true });
    setCurrentVideoIndex(newIndex);
  };

  // Expose navigation functions to parent component
  useImperativeHandle(ref, () => ({
    navigateNext,
    navigatePrevious
  }), [currentVideoIndex]);

  // Initialize and start playing immediately
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial video source to the randomly selected video
    video.src = videoUrls[currentVideoIndex];
    
    const startPlayback = async () => {
      try {
        // Load the video
        await new Promise((resolve) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.load();
        });
        
        // Start playing immediately
        await video.play();
        console.log('Video playlist started playing continuously');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Video playlist autoplay failed:', error.name);
          // Try again after a short delay
          setTimeout(() => {
            video.play().catch(() => {
              console.warn('Retry video play failed');
            });
          }, 1000);
        }
      }
    };

    startPlayback();
  }, []);

  // Handle video end - seamlessly move to next video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      const nextIndex = getRandomVideoIndex(currentVideoIndex);
      console.log(`Video ${currentVideoIndex + 1} ended, randomly switching to video ${nextIndex + 1}`);
      
      // Immediately switch to random next video without pause
      video.src = videoUrls[nextIndex];
      video.load();
      
      // Play the next video as soon as it's ready
      const playNext = () => {
        video.play().catch((error) => {
          if (error.name !== 'AbortError') {
            console.warn('Failed to play next video:', error.name);
          }
        });
      };
      
      // Listen for when the next video is ready
      video.addEventListener('loadeddata', playNext, { once: true });
      
      setCurrentVideoIndex(nextIndex);
    };

    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentVideoIndex, videoUrls]);

  // Handle mute/unmute without interrupting playback
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  // Handle visibility change - keep playing even when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (video && document.visibilityState === 'visible') {
        // Resume playing when tab becomes visible again
        if (video.paused) {
          video.play().catch((error) => {
            if (error.name !== 'AbortError') {
              console.warn('Failed to resume video after visibility change:', error.name);
            }
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 video-background">
      {/* Background Video Playlist */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        muted={isMuted}
        playsInline
        preload="auto"
        onPlay={() => {
          console.log(`Video ${currentVideoIndex + 1} is playing`);
        }}
        onPause={() => {
          console.log(`Video ${currentVideoIndex + 1} paused - this should not happen during normal operation`);
        }}
        onError={(e) => {
          console.warn('Video playlist error:', e);
          // Try to move to random next video on error
          const nextIndex = getRandomVideoIndex(currentVideoIndex);
          setCurrentVideoIndex(nextIndex);
        }}
        onStalled={() => {
          // Handle network stalls by trying to continue
          const video = videoRef.current;
          if (video && video.readyState >= 2) {
            video.play().catch(() => {
              console.warn('Failed to resume after stall');
            });
          }
        }}
        onWaiting={() => {
          console.log('Video is buffering...');
        }}
        onCanPlay={() => {
          // Ensure video plays when it's ready
          const video = videoRef.current;
          if (video && video.paused) {
            video.play().catch((error) => {
              if (error.name !== 'AbortError') {
                console.warn('Failed to play when ready:', error.name);
              }
            });
          }
        }}
      />
      
      {/* Theme-aware overlay for better text readability */}
      <div className={`absolute inset-0 z-5 ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'}`}></div>
    </div>
  );
});

VideoPlaylist.displayName = 'VideoPlaylist';