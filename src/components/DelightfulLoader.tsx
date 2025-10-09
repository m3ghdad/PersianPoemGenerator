import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Music2, Music3, Music4 } from 'lucide-react';

interface LoadingPoem {
  fa: string;
  en: string;
  poet: string;
}

const loadingPoems: LoadingPoem[] = [
  {
    fa: "صبوری کن که تلخی‌ها گذارد\nکه بعد از هر شبی روزی برآید",
    en: "Be patient, for bitterness will pass —\nafter every night, a day will rise.",
    poet: "سعدی • Saadi"
  },
  {
    fa: "صبوری می‌کنم تا کام دل یابم، ولی دانم\nکه این دریا به خون دل، شدن آسان نمی‌گردد",
    en: "I am patient till my heart's desire I gain —\nbut I know this sea won't calm without the blood of pain.",
    poet: "حافظ • Hafez"
  },
  {
    fa: "صبر کن ای دل که در پایان شب\nصبح امیدت دمَد از آفتاب",
    en: "Be patient, my heart —\nat the night's end, the sun of hope will rise.",
    poet: "مولانا • Rumi"
  },
  {
    fa: "به صبر اندر آری به هر کار دست\nکز آتش، خردمند، آرد شکر ز پست",
    en: "With patience, you'll master any deed —\nfor even from fire, the wise draw sweetness.",
    poet: "فردوسی • Ferdowsi"
  },
  {
    fa: "صبر کن، تا بر تو گردد روزگار\nکز شکیبایی، گل آید زین خار",
    en: "Be patient till fate turns your way —\nfrom patience, flowers bloom from thorns.",
    poet: "عطار • Attar"
  },
  {
    fa: "دلا صبر کن، کار دنیا گذاره\nغم و شادی و تیمار دنیا گذاره",
    en: "O heart, be patient, this world will pass —\nits sorrow, its joy, its burden will pass.",
    poet: "باباطاهر • Baba Taher"
  },
  {
    fa: "چون نیست رهی به جاودانی، صبر است\nدر ناملایمات جهانی، صبر است",
    en: "Since no road leads to eternity, be patient —\nin all this world's hardships, patience is the way.",
    poet: "خیام • Khayyam"
  },
  {
    fa: "هر که صبر آموخت، کام یافت\nهر که شتاب کرد، زیان یافت",
    en: "He who learned patience, found delight;\nhe who rushed, met loss outright.",
    poet: "نظامی • Nezami"
  },
  {
    fa: "صبوری، کلید گنج مراد است\nکه در بی‌تابی، درِ دل گشاد است",
    en: "Patience is the key to the treasure of desire —\nfor restlessness only opens the heart to fire.",
    poet: "سنایی • Sanai"
  },
  {
    fa: "صبری که تلخ نیست، صبر نیست\nشیرینیِ آن، در تلخی‌ست",
    en: "Patience that isn't bitter isn't patience —\nits sweetness lies in its bitterness.",
    poet: "بیدل دهلوی • Bidel Dehlavi"
  }
];

interface DelightfulLoaderProps {
  language: 'fa' | 'en';
  message?: string;
  progress?: number;
}

export function DelightfulLoader({ language, message, progress = 0 }: DelightfulLoaderProps) {
  const [currentPoem, setCurrentPoem] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isRTL] = useState(language === 'fa');
  
  // Rotate through poems every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPoem(prev => (prev + 1) % loadingPoems.length);
      setDisplayedText(''); // Reset for new poem
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const poem = loadingPoems[currentPoem];
    const text = language === 'fa' ? poem.fa : poem.en;
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50); // 50ms per character
    
    return () => clearInterval(typeInterval);
  }, [currentPoem, language]);

  // Generate random positions for musical notes
  const generateMusicNotes = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      Icon: [Music, Music2, Music3, Music4][i % 4],
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
    }));
  };

  const [musicNotes] = useState(generateMusicNotes);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Floating musical notes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {musicNotes.map((note) => (
          <motion.div
            key={note.id}
            className="absolute text-foreground/10"
            initial={{ 
              y: '100vh', 
              x: `${note.x}vw`,
              rotate: 0,
              opacity: 0
            }}
            animate={{ 
              y: '-20vh', 
              rotate: 360,
              opacity: [0, 0.3, 0.3, 0]
            }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <note.Icon size={24 + Math.random() * 16} />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center space-y-8">
        {/* Loading image with animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0,
          }}
          transition={{ 
            duration: 1,
            ease: "easeOut"
          }}
          className="w-72 h-72 md:w-96 md:h-96 relative"
        >
          <motion.img 
            src="/loading-poet.png" 
            alt="Loading" 
            className="w-full h-full object-contain drop-shadow-2xl"
            animate={{
              y: [0, -10, 0],
              rotate: [-2, 2, -2]
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              },
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            onError={(e) => {
              // Fallback to SVG if PNG not found
              e.currentTarget.src = '/loading-poet.svg';
            }}
          />
        </motion.div>

        {/* Poem text with typewriter effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPoem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 min-h-[140px] flex flex-col items-center justify-center"
          >
            <div 
              className={`text-lg md:text-xl font-medium text-foreground/90 whitespace-pre-line leading-relaxed ${
                isRTL ? 'font-[\'Vazirmatn\',_sans-serif]' : 'font-[\'Inter\',_sans-serif]'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-foreground/60 ml-1"
              />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              {loadingPoems[currentPoem].poet}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Custom message if provided */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {message}
          </motion.p>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden backdrop-blur-xl">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full"
              initial={{ width: '0%' }}
              animate={{ 
                width: progress > 0 ? `${progress}%` : '60%',
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ 
                width: { duration: 0.5 },
                backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
              }}
              style={{
                backgroundSize: '200% 100%'
              }}
            />
          </div>
          
          {/* Progress percentage or loading text */}
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-center text-muted-foreground"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {progress > 0 
              ? `${Math.round(progress)}%` 
              : (language === 'fa' ? 'در حال بارگذاری...' : 'Loading...')
            }
          </motion.p>
        </div>

        {/* Pulsing dots */}
        <div className="flex items-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary/60 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

