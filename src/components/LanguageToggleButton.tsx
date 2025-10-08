import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../imports/Button-52-1138';

interface LanguageMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: 'fa' | 'en';
  onLanguageChange: (lang: 'fa' | 'en') => void;
  position: { top: number; right: number };
}

function LanguageMenu({ isOpen, onClose, currentLanguage, onLanguageChange, position }: LanguageMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm language-menu-backdrop"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className="fixed z-50 w-32 language-menu-popup"
        style={{ 
          top: position.top - 120, 
          right: Math.max(16, position.right - 16), // Ensure it doesn't go off-screen
          minWidth: '120px',
          // On wide screens, ensure it stays within the mobile layout bounds
          ...(window.innerWidth > 743 && {
            right: Math.min(position.right - 16, (window.innerWidth - 743) / 2 + 743 - 136) // Keep within 743px width
          })
        }}
      >
        <div className="bg-[rgba(38,38,38,0.95)] backdrop-blur-xl rounded-[34px] border border-white/20 shadow-2xl overflow-hidden">
          {/* Liquid Glass Effect */}
          <div className="absolute inset-0 rounded-[34px]">
            <div className="absolute inset-0 bg-[rgba(204,204,204,0.67)] mix-blend-color-burn rounded-[34px]" />
            <div className="absolute inset-0 rounded-[34px]" 
                 style={{ backgroundImage: "linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.03) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.33) 0%, rgba(0, 0, 0, 0.33) 100%)" }} />
          </div>
          
          {/* Menu Items */}
          <div className="relative z-10 py-2">
            {/* Farsi Option */}
            <button
              onClick={() => {
                onLanguageChange('fa');
                onClose();
              }}
              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors duration-200"
            >
              {/* Checkmark */}
              <div className="w-6 h-6 flex items-center justify-center">
                {currentLanguage === 'fa' && (
                  <div className="text-white text-lg font-semibold">✓</div>
                )}
              </div>
              
              {/* Label */}
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-normal tracking-wide">
                  فارسی
                </div>
              </div>
            </button>
            
            {/* English Option */}
            <button
              onClick={() => {
                onLanguageChange('en');
                onClose();
              }}
              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors duration-200"
            >
              {/* Checkmark */}
              <div className="w-6 h-6 flex items-center justify-center">
                {currentLanguage === 'en' && (
                  <div className="text-white text-lg font-semibold">✓</div>
                )}
              </div>
              
              {/* Label */}
              <div className="flex-1 text-left">
                <div className="text-white text-sm font-normal tracking-wide">
                  English
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Custom Globe component with theme-aware color
function CustomGlobe() {
  const { theme } = useTheme();
  const fillColor = theme === 'light' ? '#0A0A0A' : '#FAFAFA';
  
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Globe">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Globe">
          <path 
            d="M8 1.33333C7.148 1.33333 6.22996 2.64067 5.72396 4.66667H10.276C9.77004 2.64067 8.852 1.33333 8 1.33333ZM5.3737 1.8737C4.05103 2.44303 2.95301 3.43067 2.23568 4.66667H4.34115C4.57848 3.57467 4.93103 2.6257 5.3737 1.8737ZM10.6263 1.8737C11.0683 2.6257 11.4215 3.57467 11.6589 4.66667H13.7643C13.047 3.43067 11.949 2.44303 10.6263 1.8737ZM1.64063 6C1.44196 6.632 1.33333 7.30333 1.33333 8C1.33333 8.69667 1.44196 9.368 1.64063 10H4.12109C4.04509 9.36333 4 8.69733 4 8C4 7.30267 4.04509 6.63667 4.12109 6H1.64063ZM5.46745 6C5.38145 6.626 5.33333 7.29667 5.33333 8C5.33333 8.70333 5.38145 9.374 5.46745 10H10.5326C10.6179 9.374 10.6667 8.70333 10.6667 8C10.6667 7.29667 10.6186 6.626 10.5326 6H5.46745ZM11.8789 6C11.9549 6.63667 12 7.30267 12 8C12 8.69733 11.9549 9.36333 11.8789 10H14.3594C14.5587 9.368 14.6667 8.69667 14.6667 8C14.6667 7.30333 14.5587 6.632 14.3594 6H11.8789ZM2.23568 11.3333C2.95301 12.5693 4.05103 13.557 5.3737 14.1263C4.9317 13.3743 4.57848 12.4253 4.34115 11.3333H2.23568ZM5.72396 11.3333C6.22996 13.3593 7.148 14.6667 8 14.6667C8.852 14.6667 9.77004 13.3593 10.276 11.3333H5.72396ZM11.6589 11.3333C11.4215 12.4253 11.069 13.3743 10.6263 14.1263C11.949 13.557 13.047 12.5693 13.7643 11.3333H11.6589Z" 
            fill={fillColor}
            id="Vector" 
          />
        </g>
      </svg>
    </div>
  );
}

// Custom Button component with theme-aware globe icon
function CustomButton() {
  return (
    <div className="bg-[rgba(38,38,38,0.3)] relative rounded-[1.75098e+07px] size-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.522px] border-neutral-800 border-solid inset-0 pointer-events-none rounded-[1.75098e+07px] shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex items-center justify-center pl-[0.53px] pr-[0.522px] py-[0.522px] relative size-full">
          <CustomGlobe />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.1)]" />
    </div>
  );
}

interface LanguageToggleButtonProps {
  onLanguageChange?: (language: 'fa' | 'en') => void;
}

export function LanguageToggleButton({ onLanguageChange }: LanguageToggleButtonProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      
      // Always use the simple calculation relative to the actual viewport
      // The CSS will handle constraining the backdrop and menu properly
      setButtonPosition({
        top: rect.top,
        right: window.innerWidth - rect.right
      });
    }
    setIsMenuOpen(true);
  };

  const handleLanguageChange = async (newLanguage: 'fa' | 'en') => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className="w-10 h-10 rounded-full shadow-2xl backdrop-blur-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center group relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
        aria-label={language === 'fa' ? "تغییر زبان" : "Change Language"}
        title={language === 'fa' ? "تغییر زبان" : "Change Language"}
      >
        {/* Button content */}
        <div className="w-4 h-4">
          <CustomButton />
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-full shadow-[0px_4px_16px_0px_rgba(59,130,246,0.3)] opacity-0 hover:opacity-100 transition-opacity duration-500" />
      </button>

      {/* Language Selection Menu - rendered as portal to avoid CSS conflicts */}
      {typeof document !== 'undefined' && createPortal(
        <LanguageMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          position={buttonPosition}
        />,
        document.body
      )}
    </>
  );
}