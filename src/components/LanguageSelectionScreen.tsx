import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface LanguageSelectionScreenProps {
  onLanguageSelect: (language: 'fa' | 'en') => void;
}

interface WelcomePoem {
  fa: string;
  en: string;
  poet: string;
}

const welcomePoems: WelcomePoem[] = [
  {
    fa: "خوش آمدی که با تو، دلم تازه شد بهار\nبی‌تو، خزان گرفته بود روزگار",
    en: "Welcome! With you, my heart has bloomed again\nWithout you, even spring was autumn's pain.",
    poet: "حافظ"
  },
  {
    fa: "قدم نه، که بهار آمد و گل خندید\nز آمدن تو، باغ جهان خرم دید",
    en: "Step in, spring has come, and flowers smiled;\nWith your arrival, the garden felt alive.",
    poet: "سعدی"
  },
  {
    fa: "آمدی و جانِ ما روشن شد\nدل ز دیدار تو گلشن شد",
    en: "You came, and our souls were lit —\nOur hearts became gardens from your visit.",
    poet: "مولانا"
  },
  {
    fa: "قدم رنجه فرما، صفا آری\nبه خانه دل، چراغ داری",
    en: "Grace us with your step, bring light\nYour presence makes the heart's home bright.",
    poet: "باباطاهر"
  },
  {
    fa: "چون تو آمدی، غم از دل برفت\nهر گوشه جان، چو گل بشکفت",
    en: "Since you arrived, sorrow departed\nEvery corner of my soul blossomed like a rose.",
    poet: "خیام"
  },
  {
    fa: "بهار از قدوم تو خوش آمد\nجهان از حضور تو خرم باد",
    en: "Spring is glad for your arrival\nThe world rejoices in your presence.",
    poet: "نظامی"
  },
  {
    fa: "آمدی و رونقِ جان تازه شد\nهر نفسی عطرِ جهان تازه شد",
    en: "You came, and life's delight renewed\nEach breath became the scent of a new world.",
    poet: "بیدل دهلوی"
  },
  {
    fa: "قدومت گلِ بستانِ دل ماست\nحضورت، طربِ جانِ ماست",
    en: "Your step is the flower of our heart's garden\nYour presence, the joy of our soul.",
    poet: "عطار"
  },
  {
    fa: "چو آمدی، همه درد از دل گریخت\nبه شوق تو، دل ما آگهی یافت",
    en: "When you arrived, all pain fled the heart\nOur hearts awoke with joy at your start.",
    poet: "فخرالدین عراقی"
  },
  {
    fa: "خوش آمدی، که جهان خوش شد از تو\nدل ما تازه شد، از نیکو روی تو",
    en: "Welcome, the world is joyful with you,\nOur hearts renewed by your fair view.",
    poet: "وحشی بافقی"
  }
];

// English poet names
const poetNamesEn: Record<string, string> = {
  "حافظ": "Hafez",
  "سعدی": "Saadi",
  "مولانا": "Rumi",
  "باباطاهر": "Baba Taher",
  "خیام": "Khayyam",
  "نظامی": "Nezami",
  "بیدل دهلوی": "Bidel Dehlavi",
  "عطار": "Attar",
  "فخرالدین عراقی": "Fakhruddin Iraqi",
  "وحشی بافقی": "Vahshi Bafqi"
};

export function LanguageSelectionScreen({ onLanguageSelect }: LanguageSelectionScreenProps) {
  // Random poem on each load
  const [currentPoem] = useState(() => Math.floor(Math.random() * welcomePoems.length));
  const [displayedText, setDisplayedText] = useState('');
  const [showFarsi, setShowFarsi] = useState(true);

  // Typewriter effect for the poem
  useEffect(() => {
    const poem = welcomePoems[currentPoem];
    const text = showFarsi ? poem.fa : poem.en;
    let currentIndex = 0;
    
    setDisplayedText(''); // Reset
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50); // 50ms per character
    
    return () => clearInterval(typeInterval);
  }, [currentPoem, showFarsi]);

  // Alternate between Farsi and English every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowFarsi(prev => !prev);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full bg-background flex flex-col items-center justify-center px-6">
      {/* Main content container */}
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-[48px] text-foreground font-['Noto_Nastaliq_Urdu',_serif] text-center" dir="rtl">
            رباعی وتار
          </h1>
        </motion.div>

        {/* Welcome poem - no container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full min-h-[140px] flex flex-col items-center justify-center"
        >
          <div 
            className={`text-lg md:text-xl font-medium text-foreground/80 whitespace-pre-line text-center leading-loose ${
              showFarsi ? 'font-[\'Noto_Nastaliq_Urdu\',_serif]' : 'font-[\'Inter\',_sans-serif]'
            }`}
            dir={showFarsi ? 'rtl' : 'ltr'}
            style={{ lineHeight: '1.8' }}
          >
            {displayedText.split('\n').map((line, i) => (
              <div key={i} className="mb-2">
                {line}
                {i === displayedText.split('\n').length - 1 && line.length < (showFarsi ? welcomePoems[currentPoem].fa : welcomePoems[currentPoem].en).length && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-0.5 h-5 bg-foreground/60 ml-1"
                  />
                )}
              </div>
            ))}
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-muted-foreground mt-4"
          >
            {showFarsi 
              ? welcomePoems[currentPoem].poet 
              : poetNamesEn[welcomePoems[currentPoem].poet] || welcomePoems[currentPoem].poet
            }
          </motion.p>
        </motion.div>

        {/* Language buttons using shadcn/ui Button (default variant) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full flex flex-col gap-4"
        >
          <Button
            onClick={() => onLanguageSelect('fa')}
            size="lg"
            className="w-full h-[60px] text-[20px] font-medium"
          >
            فارسی
          </Button>

          <Button
            onClick={() => onLanguageSelect('en')}
            size="lg"
            className="w-full h-[60px] text-[20px] font-medium"
          >
            English
          </Button>
        </motion.div>

        {/* Subtitle below buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col items-center gap-1"
        >
          <p className="text-[12px] text-muted-foreground text-center" dir="auto">
            می‌توانید این را هر زمان تغییر دهید
          </p>
          <p className="text-[12px] text-muted-foreground text-center">
            You can change this anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}
