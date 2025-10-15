import { BookOpen } from 'lucide-react';
import { Button } from './ui/button';

interface MoreButtonProps {
  onOpen: () => void;
}

export function MoreButton({ onOpen }: MoreButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full shadow-lg"
      onClick={onOpen}
      aria-label="More options"
    >
      <BookOpen />
    </Button>
  );
}