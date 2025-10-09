import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

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
    <div className="h-screen w-full bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Main content container */}
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-2"
        >
          <h1 className="text-[30px] text-foreground font-normal text-center" dir="auto">
            انتخاب زبان
          </h1>
          <p className="text-[18px] text-muted-foreground text-center">
            Choose language
          </p>
        </motion.div>

        {/* Welcome poem in container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full bg-muted/20 backdrop-blur-xl rounded-2xl border border-border/50 p-6 min-h-[160px] flex flex-col items-center justify-center"
        >
          <div 
            className={`text-lg md:text-xl font-medium text-foreground/90 whitespace-pre-line text-center leading-loose ${
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

        {/* Language buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full flex flex-col gap-4"
        >
          {/* Farsi button */}
          <button 
            onClick={() => onLanguageSelect('fa')}
            className="bg-muted/30 backdrop-blur-xl hover:bg-muted/50 h-[105px] rounded-2xl w-full cursor-pointer transition-all duration-200 active:scale-95 border border-border/50"
          >
            <div className="flex flex-col items-center justify-center h-full px-6 py-6">
              <p className="text-[24px] text-foreground font-medium leading-[32px]" dir="auto">
                فارسی
              </p>
              <p className="text-[14px] text-muted-foreground leading-[20px]" dir="auto">
                شعر کلاسیک
              </p>
            </div>
          </button>

          {/* English button */}
          <button 
            onClick={() => onLanguageSelect('en')}
            className="bg-muted/30 backdrop-blur-xl hover:bg-muted/50 h-[105px] rounded-2xl w-full cursor-pointer transition-all duration-200 active:scale-95 border border-border/50"
          >
            <div className="flex flex-col items-center justify-center h-full px-6 py-6">
              <p className="text-[24px] text-foreground font-medium leading-[32px]">
                English
              </p>
              <p className="text-[14px] text-muted-foreground leading-[20px]">
                Translated Poetry
              </p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
