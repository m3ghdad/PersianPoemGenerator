import { createPortal } from 'react-dom';
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
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const justOpenedRef = useRef(false); // prevents instant close

  const place = () => {
    const el = buttonRef.current;
    if (!el) {
      console.log('❌ Button ref not available');
      return;
    }
    const r = el.getBoundingClientRect();
    const newPos = { top: r.top, left: r.left };
    console.log('📍 Calculated position:', newPos, 'Button rect:', r);
    // viewport coords for fixed positioning
    setPos(newPos);
    return newPos;
  };

  const handleClick = () => {
    console.log('🌍 Globe button clicked, isOpen:', isOpen);
    if (!isOpen) {
      const newPos = place();
      if (newPos) {
        console.log('✅ Opening menu at position:', newPos);
        justOpenedRef.current = true;
        setIsOpen(true);
        // let the current pointer event finish before we listen for outside clicks
        setTimeout(() => { justOpenedRef.current = false; }, 0);
      }
    } else {
      setIsOpen(false);
      console.log('❌ Closing menu');
    }
  };

  const handleLanguageChange = (lng: 'fa' | 'en') => {
    if (lng !== language) {
      setLanguage(lng);
      onLanguageChange?.(lng);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const onDocPointerDown = (e: PointerEvent) => {
      if (justOpenedRef.current) return;
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setIsOpen(false);
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const onLayout = () => place();

    // capture phase helps on Safari/iOS
    document.addEventListener('pointerdown', onDocPointerDown, { capture: true });
    document.addEventListener('keydown', onEsc);
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown, { capture: true } as any);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={buttonRef} className="inline-block">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={handleClick}
          aria-label={language === 'fa' ? 'تغییر زبان' : 'Change Language'}
          title={language === 'fa' ? 'تغییر زبان' : 'Change Language'}
        >
          <Globe />
        </Button>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-32 rounded-[34px] border border-white/20 shadow-2xl bg-[rgba(38,38,38,0.95)]"
          style={{
            // anchor at button's left, then shift 8px left by transform
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            transform: 'translateX(calc(-8px - 100%))'
          }}
        >
          <div className="py-2">
            <button
              onClick={() => handleLanguageChange('fa')}
              className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 ${language === 'fa' ? 'bg-white/10' : ''}`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {language === 'fa' && <div className="text-white text-lg font-semibold">✓</div>}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-normal tracking-wide">فارسی</div>
              </div>
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 ${language === 'en' ? 'bg-white/10' : ''}`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {language === 'en' && <div className="text-white text-lg font-semibold">✓</div>}
              </div>
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-normal tracking-wide">English</div>
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
