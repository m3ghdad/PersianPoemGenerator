import { useState } from 'react';
import Button from '../imports/Button';
import { useLanguage } from '../contexts/LanguageContext';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useLanguage();

  const handleClick = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing poems:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing}
      className="w-10 h-10 rounded-full shadow-2xl backdrop-blur-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center group relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
      }}
      aria-label={isRefreshing ? "در حال بارگذاری..." : "بارگذاری اشعار جدید"}
      title={isRefreshing ? "در حال بارگذاری..." : "بارگذاری اشعار جدید"}
    >
      {/* Animated border overlay for refreshing state */}
      <div className={`absolute inset-0 rounded-full border-2 border-blue-400 transition-opacity duration-500 ${
        isRefreshing ? 'opacity-60 animate-pulse' : 'opacity-0'
      }`} />
      
      {/* Button content */}
      <div className={`w-4 h-4 transition-transform duration-500 ${
        isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
      }`}>
        <Button />
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-full shadow-[0px_4px_16px_0px_rgba(59,130,246,0.3)] opacity-0 hover:opacity-100 transition-opacity duration-500" />
    </button>
  );
}