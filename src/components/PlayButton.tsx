import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import svgPlayPaths from '../imports/svg-1ebf8vx3an';
import svgPausePaths from '../imports/svg-znizth8oyx';

interface Poem {
  id: number;
  title: string;
  text: string;
  htmlText: string;
  poet: {
    id: number;
    name: string;
    fullName: string;
  };
}

interface PlayButtonProps {
  poem?: Poem;
}

export function PlayButton({ poem }: PlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPoemIdRef = useRef<number | null>(null);
  
  const { language } = useLanguage();
  const { theme } = useTheme();

  // Clean up audio when poem changes
  useEffect(() => {
    if (poem && currentPoemIdRef.current !== poem.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setIsLoading(false);
      setError(null);
      currentPoemIdRef.current = poem.id;
    }
  }, [poem?.id]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Only show in English mode
  if (language !== 'en' || !poem) {
    return null;
  }

  const handlePlayPause = async () => {
    if (!poem) return;

    try {
      // If already playing, pause
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      // If audio exists and is paused, resume
      if (audioRef.current && !isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      // Generate new audio
      setIsLoading(true);
      setError(null);

      const { projectId, publicAnonKey } = await import("../utils/supabase/info");
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c192d0ee/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            text: poem?.text || '',
            voice: 'alloy' // Human-like voice
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and setup audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        setIsLoading(false);
      };

      audio.oncanplaythrough = () => {
        setIsLoading(false);
        audio.play();
        setIsPlaying(true);
      };

      // Load the audio
      audio.load();

    } catch (error) {
      console.error('Error playing poem:', error);
      setError(error.message || 'Failed to play poem');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="w-10 h-10 rounded-full shadow-2xl backdrop-blur-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center group relative overflow-hidden disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
        aria-label={isPlaying ? "Pause poem" : "Play poem"}
        title={isPlaying ? "Pause poem" : "Play poem"}
      >
        {/* Button content */}
        <div className="w-4 h-4">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <div className="relative shrink-0 size-[16px]" data-name="Pause">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <g id="Pause">
                  <path d={svgPausePaths.p15b16e00} fill="var(--fill-0, #FAFAFA)" id="Vector" />
                </g>
              </svg>
            </div>
          ) : (
            <div className="relative shrink-0 size-[16px]" data-name="Play">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <g id="Play">
                  <path d={svgPlayPaths.p29890330} fill="var(--fill-0, #FAFAFA)" id="Vector" />
                </g>
              </svg>
            </div>
          )}
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-full shadow-[0px_4px_16px_0px_rgba(59,130,246,0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>

      {/* Error indicator */}
      {error && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {error}
        </div>
      )}
    </>
  );
}