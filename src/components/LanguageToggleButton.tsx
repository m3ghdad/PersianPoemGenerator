import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageToggleButtonProps {
  onLanguageChange?: (language: 'fa' | 'en') => void;
}

export function LanguageToggleButton({ onLanguageChange }: LanguageToggleButtonProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLanguageChange = (newLanguage: 'fa' | 'en') => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
    }
    setIsOpen(false);
  };

  const handleClick = () => {
    if (buttonRef.current && !isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();
      const gap = 8;

      // fixed elements use viewport coords, no scroll offsets
      const top = rect.top;
      const right = window.innerWidth - rect.left + gap; // 8px to the left of the button

      setMenuPosition({ top, right });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        className="rounded-full shadow-lg"
        onClick={handleClick}
        aria-label={language === 'fa' ? "تغییر زبان" : "Change Language"}
        title={language === 'fa' ? "تغییر زبان" : "Change Language"}
      >
        <Globe />
      </Button>

      {isOpen && (
        <div
          className="fixed z-[9999] w-32 bg-[rgba(38,38,38,0.95)] backdrop-blur-xl rounded-[34px] border border-white/20 shadow-2xl"
          style={{
            top: `${menuPosition.top}px`,
            right: `${Math.max(16, menuPosition.right)}px`
          }}
        >
          <div className="py-2">
            <button
              onClick={() => handleLanguageChange('fa')}
              className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 ${language === 'fa' ? 'bg-white/10' : ''}`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {language === 'fa' && (
                  <div className="text-white text-lg font-semibold">✓</div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-normal tracking-wide">
                  فارسی
                </div>
              </div>
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 ${language === 'en' ? 'bg-white/10' : ''}`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {language === 'en' && (
                  <div className="text-white text-lg font-semibold">✓</div>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-normal tracking-wide">
                  English
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}