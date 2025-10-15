import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
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
    <Button
      variant="outline"
      size="icon"
      className={`rounded-full shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}
      onClick={handleClick}
      disabled={isRefreshing}
      aria-label={isRefreshing ? "در حال بارگذاری..." : "بارگذاری اشعار جدید"}
      title={isRefreshing ? "در حال بارگذاری..." : "بارگذاری اشعار جدید"}
    >
      <RefreshCw />
    </Button>
  );
}