import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

interface MuteButtonProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export function MuteButton({ isMuted, onToggleMute }: MuteButtonProps) {
  return (
    <Button
      onClick={onToggleMute}
      size="icon"
      variant="ghost"
      className="w-10 h-10 rounded-full shadow-2xl backdrop-blur-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center group relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
      }}
      aria-label={isMuted ? "Unmute video" : "Mute video"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-foreground" />
      )}
    </Button>
  );
}