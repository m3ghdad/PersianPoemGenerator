import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VideoControlsProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function VideoControls({ onNext, onPrevious }: VideoControlsProps) {
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const { isRTL, t } = useLanguage();

  useEffect(() => {
    if (showFeedback) {
      const timeout = setTimeout(() => {
        setShowFeedback(false);
        setFeedbackText('');
      }, 1500); // Show for 1.5 seconds

      return () => clearTimeout(timeout);
    }
  }, [showFeedback]);

  const handleLeftClick = () => {
    console.log('Left button (next) clicked');
    setFeedbackText('ویدیو بعدی');
    setShowFeedback(true);
    onNext();
  };

  const handleRightClick = () => {
    console.log('Right button (previous) clicked');
    setFeedbackText('ویدیو قبلی');
    setShowFeedback(true);
    onPrevious();
  };

  return (
    <>
      <div className="fixed bottom-16 left-4 z-30 flex items-center space-x-2">
        {isRTL ? (
          <>
            {/* RTL Mode - Left Button: Next (Right Arrow), Right Button: Previous (Left Arrow) */}
            <button
              onClick={handleLeftClick}
              className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-full p-2 hover:bg-black/50 transition-all duration-200 active:scale-95"
              aria-label="Next video"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={handleRightClick}
              className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-full p-2 hover:bg-black/50 transition-all duration-200 active:scale-95"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </>
        ) : (
          <>
            {/* LTR Mode - Left Button: Previous (Left Arrow), Right Button: Next (Right Arrow) */}
            <button
              onClick={handleRightClick}
              className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-full p-2 hover:bg-black/50 transition-all duration-200 active:scale-95"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={handleLeftClick}
              className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-full p-2 hover:bg-black/50 transition-all duration-200 active:scale-95"
              aria-label="Next video"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Feedback Text */}
      {showFeedback && (
        <div 
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-40 text-white text-sm text-center bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg transition-opacity duration-300"
          dir="rtl"
          style={{
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
          }}
        >
          {feedbackText}
        </div>
      )}
    </>
  );
}