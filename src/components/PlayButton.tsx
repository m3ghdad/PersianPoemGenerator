import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

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
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full shadow-lg"
        onClick={handlePlayPause}
        disabled={isLoading}
        aria-label={isPlaying ? "Pause poem" : "Play poem"}
        title={isPlaying ? "Pause poem" : "Play poem"}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause />
        ) : (
          <Play />
        )}
      </Button>

      {/* Error indicator */}
      {error && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}