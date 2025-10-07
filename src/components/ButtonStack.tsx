import { FavoriteButton } from './FavoriteButton';
import { MoreButton } from './LanguageButton';
import { RefreshButton } from './RefreshButton';
import { LanguageToggleButton } from './LanguageToggleButton';
import { PlayButton } from './PlayButton';
import { MuteButton } from './MuteButton';

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

interface ButtonStackProps {
  poem?: Poem;
  onAuthRequired: () => void;
  onMoreOpen: () => void;
  onRefresh: () => Promise<void>;
  onLanguageChange?: (language: 'fa' | 'en') => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function ButtonStack({ poem, onAuthRequired, onMoreOpen, onRefresh, onLanguageChange, isMuted = false, onToggleMute }: ButtonStackProps) {
  return (
    <div className="fixed bottom-16 right-8 z-30 flex flex-col gap-2">
      {onToggleMute && (
        <MuteButton isMuted={isMuted} onToggleMute={onToggleMute} />
      )}
      <PlayButton poem={poem} />
      <LanguageToggleButton onLanguageChange={onLanguageChange} />
      <RefreshButton onRefresh={onRefresh} />
      <MoreButton onOpen={onMoreOpen} />
      {poem && (
        <FavoriteButton 
          poem={poem} 
          onAuthRequired={onAuthRequired}
        />
      )}
    </div>
  );
}