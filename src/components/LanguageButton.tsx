import { MoreHorizontal } from 'lucide-react';
import Book from '../imports/Book-50-1735';

interface MoreButtonProps {
  onOpen: () => void;
}

export function MoreButton({ onOpen }: MoreButtonProps) {
  return (
    <button
      onClick={onOpen}
      className="relative w-10 h-10 rounded-full shadow-2xl backdrop-blur-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
      }}
      aria-label="More options"
    >
      {/* Animated border overlay */}
      <div className="absolute inset-0 rounded-full border-2 border-[#77ff85] opacity-0 animate-pulse hover:opacity-60 transition-opacity duration-500" />
      <div className="absolute inset-0 rounded-full shadow-[0px_4px_16px_0px_rgba(119,255,133,0.3)] opacity-0 hover:opacity-100 transition-opacity duration-500" />
    
      <div className="w-[18px] h-[18px] text-foreground/80">
        <div className="[&_path]:fill-[#0A0A0A] dark:[&_path]:fill-[#FAFAFA]">
          <Book />
        </div>
      </div>
    </button>
  );
}