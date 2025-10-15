import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface PoemNavigationProps {
  currentIndex: number;
  totalPoems: number;
  onNavigate: (index: number) => void;
}

export function PoemNavigation({ currentIndex, totalPoems, onNavigate }: PoemNavigationProps) {
  const { language, t, isRTL } = useLanguage();
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Clear feedback after 2 seconds
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false);
        setFeedbackText('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
      setFeedbackText(t.previousPoem);
      setShowFeedback(true);
      
      // Add haptic feedback on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < totalPoems - 1) {
      onNavigate(currentIndex + 1);
      setFeedbackText(t.nextPoem);
      setShowFeedback(true);
      
      // Add haptic feedback on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalPoems - 1;

  return (
    <>
      <div className="fixed bottom-16 left-4 z-50 flex gap-2">
        {/* In LTR (English): Previous (left) | Next (right) */}
        {/* In RTL (Farsi): Next (left) | Previous (right) */}
        
        {isRTL ? (
          <>
            {/* Next button - left position in RTL */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={handleNext}
              disabled={!hasNext}
              aria-label={t.nextPoem}
            >
              <ChevronRight />
            </Button>

            {/* Previous button - right position in RTL */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              aria-label={t.previousPoem}
            >
              <ChevronLeft />
            </Button>
          </>
        ) : (
          <>
            {/* Previous button - left position in LTR */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              aria-label={t.previousPoem}
            >
              <ChevronLeft />
            </Button>

            {/* Next button - right position in LTR */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={handleNext}
              disabled={!hasNext}
              aria-label={t.nextPoem}
            >
              <ChevronRight />
            </Button>
          </>
        )}
      </div>

      {/* Feedback text - centered at bottom of page (same position as song controls) */}
      {showFeedback && feedbackText && (
        <div
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 pointer-events-none"
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{ marginBottom: '48px' }}
        >
          {feedbackText}
        </div>
      )}
    </>
  );
}

