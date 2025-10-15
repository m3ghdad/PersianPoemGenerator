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
      variant="outline"
      className="rounded-full shadow-lg"
      aria-label={isMuted ? "Unmute video" : "Mute video"}
    >
      {isMuted ? <VolumeX /> : <Volume2 />}
    </Button>
  );
}