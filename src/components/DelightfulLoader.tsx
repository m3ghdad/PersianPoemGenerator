import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Music2, Music3, Music4 } from 'lucide-react';
import { MoonLoader } from 'react-spinners';

interface LoadingPoem {
  fa: string;
  en: string;
  poet: string;
}

const loadingPoems: LoadingPoem[] = [
  {
    fa: "صبوری کن که تلخی‌ها گذارد\nکه بعد از هر شبی روزی برآید",
    en: "Be patient, for bitterness will pass\nAfter every night, a day will rise.",
    poet: "سعدی"
  },
  {
    fa: "صبوری می‌کنم تا کام دل یابم، ولی دانم\nکه این دریا به خون دل، شدن آسان نمی‌گردد",
    en: "I am patient till my heart's desire I gain\nI know this sea won't calm without the blood of pain.",
    poet: "حافظ"
  },
  {
    fa: "صبر کن ای دل که در پایان شب\nصبح امیدت دمَد از آفتاب",
    en: "Be patient, my heart\nAt the night's end, the sun of hope will rise.",
    poet: "مولانا"
  },
  {
    fa: "به صبر اندر آری به هر کار دست\nکز آتش، خردمند، آرد شکر ز پست",
    en: "With patience, you'll master any deed\nFor even from fire, the wise draw sweetness.",
    poet: "فردوسی"
  },
  {
    fa: "صبر کن، تا بر تو گردد روزگار\nکز شکیبایی، گل آید زین خار",
    en: "Be patient till fate turns your way\nFrom patience, flowers bloom from thorns.",
    poet: "عطار"
  },
  {
    fa: "دلا صبر کن، کار دنیا گذاره\nغم و شادی و تیمار دنیا گذاره",
    en: "O heart, be patient, this world will pass\nIts sorrow, its joy, its burden will pass.",
    poet: "باباطاهر"
  },
  {
    fa: "چون نیست رهی به جاودانی، صبر است\nدر ناملایمات جهانی، صبر است",
    en: "Since no road leads to eternity, be patient\nIn all this world's hardships, patience is the way.",
    poet: "خیام"
  },
  {
    fa: "هر که صبر آموخت، کام یافت\nهر که شتاب کرد، زیان یافت",
    en: "He who learned patience, found delight\nHe who rushed, met loss outright.",
    poet: "نظامی"
  },
  {
    fa: "صبوری، کلید گنج مراد است\nکه در بی‌تابی، درِ دل گشاد است",
    en: "Patience is the key to the treasure of desire\nFor restlessness only opens the heart to fire.",
    poet: "سنایی"
  },
  {
    fa: "صبری که تلخ نیست، صبر نیست\nشیرینیِ آن، در تلخی‌ست",
    en: "Patience that isn't bitter isn't patience\nIts sweetness lies in its bitterness.",
    poet: "بیدل دهلوی"
  }
];

// English poet names
const poetNamesEn: Record<string, string> = {
  "سعدی": "Saadi",
  "حافظ": "Hafez",
  "مولانا": "Rumi",
  "فردوسی": "Ferdowsi",
  "عطار": "Attar",
  "باباطاهر": "Baba Taher",
  "خیام": "Khayyam",
  "نظامی": "Nezami",
  "سنایی": "Sanai",
  "بیدل دهلوی": "Bidel Dehlavi"
};

interface DelightfulLoaderProps {
  language: 'fa' | 'en';
  message?: string;
  progress?: number;
}

export function DelightfulLoader({ language, message, progress = 0 }: DelightfulLoaderProps) {
  // Start with a random poem on each load
  const [currentPoem, setCurrentPoem] = useState(() => Math.floor(Math.random() * loadingPoems.length));
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
      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center justify-center space-y-8">
        {/* Spinner with percentage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col items-center gap-4"
        >
          <div className="relative flex flex-col items-center gap-6">
            <MoonLoader
              color="#ffffff"
              loading={true}
              size={48}
              speedMultiplier={1}
            />
            
            {/* Percentage below spinner */}
            {progress > 0 && (
              <motion.div
                className="text-foreground font-bold text-4xl md:text-5xl"
                animate={{
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {Math.round(progress)}%
              </motion.div>
            )}
          </div>
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
              className={`text-lg md:text-xl font-medium text-foreground/90 whitespace-pre-line leading-loose text-center ${
                isRTL ? 'font-[\'Vazirmatn\',_sans-serif]' : 'font-[\'Inter\',_sans-serif]'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ lineHeight: '1.8' }}
            >
              {displayedText.split('\n').map((line, i) => (
                <div key={i} className="mb-2">
                  {line}
                  {i === displayedText.split('\n').length - 1 && line.length < (language === 'fa' ? loadingPoems[currentPoem].fa : loadingPoems[currentPoem].en).length && (
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
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              {language === 'fa' 
                ? loadingPoems[currentPoem].poet 
                : poetNamesEn[loadingPoems[currentPoem].poet] || loadingPoems[currentPoem].poet
              }
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Custom message if provided */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground text-center"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}

