import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ButtonStack } from './components/ButtonStack';
import { SettingsButton } from './components/SettingsButton';
import { AuthSheet } from './components/AuthSheet';
import { DraggableProfileSheet } from './components/DraggableProfileSheet';
import { DraggableFavoritesSheet } from './components/DraggableFavoritesSheet';
import { DraggableMoreSheet } from './components/DraggableMoreSheet';
import { VideoPlaylist, VideoPlaylistRef } from './components/VideoPlaylist';
import { VideoControls } from './components/VideoControls';
import AnimatedGroup from './components/AnimatedGroup';
import { TypewriterText } from './components/TypewriterText';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

interface Poem {
  id: number;
  title: string;
  text: string;
  htmlText: string;
  poet: {
    id: number;
    name: string;
    fullName: string;
  };
}

// Mock data for fallback when API fails
const mockPoemsFa: Poem[] = [
  {
    id: 1,
    title: "غزل شماره ۱",
    text: "الا یا ایها الساقی ادر کاسا و ناولها\nکه عشق آسان نمود اول ولی افتاد مشکل��ها",
    htmlText: "الا یا ایها الساقی ادر کاسا و ناولها<br/>که عشق آسان نمود اول ولی افتاد مشکل‌ها",
    poet: {
      id: 1,
      name: "حافظ",
      fullName: "خواجه شمس‌الدین محمد حافظ شیرازی"
    }
  },
  {
    id: 2,
    title: "رباعی",
    text: "این کوزه چو من عاشق زاری بوده است\nدر بند سر زلف نگاری بوده است\nاین دسته که بر گردن او می‌بینی\nدستی است که بر گردن یاری بوده است",
    htmlText: "این کوزه چو من عاشق زاری بوده است<br/>در بند سر زلف نگاری بوده است<br/>این دسته که بر گردن او می‌بینی<br/>دستی است که بر گردن یاری بوده است",
    poet: {
      id: 2,
      name: "عمر خیام",
      fullName: "غیاث‌الدین ابوالفتح عمر بن ابراهیم خیام نیشابوری"
    }
  },
  {
    id: 3,
    title: "غزل",
    text: "بنی آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند\nچو عضوی به درد آورد روزگار\nدگر عضوها را نماند قرار",
    htmlText: "بنی آدم اعضای یک پیکرند<br/>که در آفرینش ز یک گوهرند<br/>چو عضوی به درد آورد روزگار<br/>دگر عضوها را نماند قرار",
    poet: {
      id: 3,
      name: "سعدی",
      fullName: "ابومحمد مصلح‌الدین بن عبدالله شیرازی"
    }
  },
  {
    id: 4,
    title: "مثنوی معنوی",
    text: "بشنو از نی چون حکایت می‌کند\nاز جدایی‌ها شکایت می‌کند\nکز نیستان تا مرا ببریده‌اند\nدر نفیرم مرد و زن نالیده‌اند",
    htmlText: "بشنو از نی چون حکایت می‌کند<br/>از جدایی‌ها شکایت می‌کند<br/>کز نیستان تا مرا ببریده‌اند<br/>در نفیرم مرد و زن نالیده‌اند",
    poet: {
      id: 5,
      name: "مولانا",
      fullName: "جلال‌الدین محمد بلخی"
    }
  },
  {
    id: 5,
    title: "شاهنامه",
    text: "بسی رنج بردم در این سال سی\nعجم زنده کردم بدین پارسی\nبه نزدیک ایرانیان پهلوان\nمن اولم و جاودان بادمان",
    htmlText: "بسی رنج بردم در این سال سی<br/>عجم زنده کردم بدین پارسی<br/>به نزدیک ایرانیان پهلوان<br/>من اولم و جاودان بادمان",
    poet: {
      id: 4,
      name: "فردوسی",
      fullName: "ابوالقاسم فردوسی طوسی"
    }
  },
  {
    id: 6,
    title: "خسرو و شیرین",
    text: "عشق است که در دل فروزد شرار\nعشق است که آرد به جان قرار\nگر عشق نباشد کسی زنده نیست\nگر عشق نباشد کسی بنده نیست",
    htmlText: "عشق است که در دل فروزد شرار<br/>عشق است که آرد به جان قرار<br/>گر عشق نباشد کسی زنده نیست<br/>گر عشق نباشد کسی بنده نیست",
    poet: {
      id: 6,
      name: "نظامی",
      fullName: "نظامی گنجوی"
    }
  }
];

// English translated poems for demo
const mockPoemsEn: Poem[] = [
  {
    id: 101,
    title: "Ghazal No. 1",
    text: "Come, O cup-bearer, bring wine and offer it\nFor love seemed easy at first, but difficulties arose",
    htmlText: "Come, O cup-bearer, bring wine and offer it<br/>For love seemed easy at first, but difficulties arose",
    poet: {
      id: 1,
      name: "Hafez",
      fullName: "Khwaja Shams-ud-Din Muhammad Hafez-e Shirazi"
    }
  },
  {
    id: 102,
    title: "Quatrain",
    text: "This jug, like me, was once a lover in despair\nCaught in the bonds of some beloved's hair\nThis handle that you see upon its neck\nWas once an arm around a lover fair",
    htmlText: "This jug, like me, was once a lover in despair<br/>Caught in the bonds of some beloved's hair<br/>This handle that you see upon its neck<br/>Was once an arm around a lover fair",
    poet: {
      id: 2,
      name: "Omar Khayyam",
      fullName: "Ghiyath al-Din Abu'l-Fath Umar ibn Ibrahim al-Khayyam al-Nishapuri"
    }
  },
  {
    id: 103,
    title: "Ghazal",
    text: "Human beings are members of a whole\nIn creation of one essence and soul\nIf a member is afflicted with pain\nOther members uneasy will remain",
    htmlText: "Human beings are members of a whole<br/>In creation of one essence and soul<br/>If a member is afflicted with pain<br/>Other members uneasy will remain",
    poet: {
      id: 3,
      name: "Saadi",
      fullName: "Abu-Muhammad Muslih al-Din bin Abdallah Shirazi"
    }
  },
  {
    id: 104,
    title: "Masnavi",
    text: "Listen to the reed flute, how it tells a tale\nComplaining of separations, saying\nEver since I was parted from the reed-bed\nMy lament has caused men and women to moan",
    htmlText: "Listen to the reed flute, how it tells a tale<br/>Complaining of separations, saying<br/>Ever since I was parted from the reed-bed<br/>My lament has caused men and women to moan",
    poet: {
      id: 5,
      name: "Rumi",
      fullName: "Jalal al-Din Muhammad Balkhi"
    }
  },
  {
    id: 105,
    title: "Shahnameh",
    text: "I suffered much hardship in these thirty years\nI revived the Persians with this Persian\nAmong the Iranians, I am a champion\nI am first, and may I be eternal",
    htmlText: "I suffered much hardship in these thirty years<br/>I revived the Persians with this Persian<br/>Among the Iranians, I am a champion<br/>I am first, and may I be eternal",
    poet: {
      id: 4,
      name: "Ferdowsi",
      fullName: "Abul-Qasem Ferdowsi Tusi"
    }
  },
  {
    id: 106,
    title: "Khosrow and Shirin",
    text: "It is love that kindles fire in the heart\nIt is love that brings peace to the soul\nIf there is no love, no one is alive\nIf there is no love, no one is bound",
    htmlText: "It is love that kindles fire in the heart<br/>It is love that brings peace to the soul<br/>If there is no love, no one is alive<br/>If there is no love, no one is bound",
    poet: {
      id: 6,
      name: "Nezami",
      fullName: "Nezami Ganjavi"
    }
  }
];

// Simple border component
function SimpleBorder() {
  return (
    <div className="absolute inset-4 pointer-events-none">
      <div className="w-full h-full rounded-lg border border-white/20"></div>
    </div>
  );
}

function PoemCard({ poem, isActive, currentIndex, cardIndex }: { 
  poem: Poem; 
  isActive: boolean; 
  currentIndex: number;
  cardIndex: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { isRTL } = useLanguage();
  const { theme } = useTheme();

  // Calculate card position based on current index
  const getCardTransform = () => {
    const offset = cardIndex - currentIndex;
    if (offset === 0) return 'translateY(0%)';
    if (offset < 0) return 'translateY(-100%)';
    return 'translateY(100%)';
  };

  return (
    <div 
      className="absolute inset-0 w-full h-screen flex flex-col bg-transparent transition-transform duration-300 ease-out overflow-hidden"
      style={{
        transform: getCardTransform(),
        zIndex: isActive ? 10 : 1
      }}
    >
      {/* Author name at the top */}
      <div 
        className="relative z-20 w-full text-center px-6 md:px-8 flex-shrink-0"
        style={{
          paddingTop: `max(2rem, env(safe-area-inset-top) + 1rem)` // Ensure it's below notch/status bar
        }}
      >

      </div>

      {/* Poem content in the center */}
      <div className="relative z-20 max-w-4xl w-full flex-1 flex flex-col justify-center text-center px-6 md:px-8 self-center px-[24px] py-[0px]">
        <TypewriterText
          text={(() => {
            const text = poem.htmlText || poem.text.replace(/\n/g, '<br/>');
            // Add spacing between every two lines for both languages
            return text.replace(/<br\/>/g, '<br/><br/>');
          })()}
          speed={isRTL ? 20 : 25} // Slower for more contemplative reading
          startDelay={600} // Longer delay before starting for dramatic effect
          lineBreakPause={600} // Pause between lines for poetry rhythm
          isActive={isActive}
          className={`${theme === 'dark' ? 'text-white' : 'text-black'} leading-relaxed font-light tracking-wide transition-all duration-500 overflow-y-auto scrollbar-hide text-shadow-lg drop-shadow-lg`}
          dir={isRTL ? "rtl" : "ltr"}
          style={{ 
            fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
            fontSize: isRTL ? '20px' : '16px',
            lineHeight: '1.8',
            maxHeight: 'calc(100vh - 200px)', // Simplified calculation
            paddingLeft: isRTL ? '0' : '48px',
            paddingRight: isRTL ? '0' : '48px',
            textShadow: theme === 'dark' 
              ? '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)'
              : '2px 2px 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.6)'
          }}
        />
      </div>

      {/* Bottom spacer to ensure content doesn't get hidden behind home indicator */}
      <div 
        className="flex-shrink-0"
        style={{
          paddingBottom: `max(2rem, env(safe-area-inset-bottom) + 1rem)` // Ensure space above home indicator
        }}
      />
      

    </div>
  );
}

function AppContent() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [usedPoemIds, setUsedPoemIds] = useState<Set<number>>(new Set());
  const [usingMockData, setUsingMockData] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoPlaylistRef = useRef<VideoPlaylistRef>(null);
  
  // Video state
  const [isMuted, setIsMuted] = useState(true); // Start muted for better UX
  
  // Sheet states
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [favoritesSheetOpen, setFavoritesSheetOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  
  const { user, refreshSession } = useAuth();
  const { language, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  
  // Touch handling state
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const swipeCountRef = useRef(0);

  // Explanation cache system with comprehensive tafsir support
  const [explanationCache, setExplanationCache] = useState<Map<string, {
    data: {
      lineByLine?: Array<{ original: string; meaning: string }>;
      generalMeaning?: string;
      mainThemes?: string;
      imagerySymbols?: string;
      fullTafsir?: any; // Comprehensive tafsir data from server
    };
    loading: boolean;
    error: string;
    timestamp: number;
  }>>(new Map());

  // Track active explanation requests to prevent duplicates and enable cleanup
  const activeRequestsRef = useRef<Map<string, AbortController>>(new Map());

  // Shuffle array utility
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Circuit breaker state - more lenient
  const [apiFailureCount, setApiFailureCount] = useState(0);
  const [lastApiFailureTime, setLastApiFailureTime] = useState<number>(0);
  const circuitBreakerTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset failure count after successful API call
  const resetApiFailures = useCallback(() => {
    setApiFailureCount(0);
    setLastApiFailureTime(0);
  }, []);

  // Check if we should try API (only block after 5 consecutive failures within 10 minutes)
  const shouldTryApi = useCallback(() => {
    if (apiFailureCount < 5) return true;
    const timeSinceLastFailure = Date.now() - lastApiFailureTime;
    return timeSinceLastFailure > 10 * 60 * 1000; // 10 minutes
  }, [apiFailureCount, lastApiFailureTime]);

  // Handle API failure more gracefully
  const handleApiFailure = useCallback(() => {
    const newCount = apiFailureCount + 1;
    setApiFailureCount(newCount);
    setLastApiFailureTime(Date.now());
    
    if (newCount >= 5) {
      setUsingMockData(true);
    }
  }, [apiFailureCount]);

  // Fetch a single random poem from API
  const fetchSingleRandomPoem = async (): Promise<Poem | null> => {
    // Check if we should try API
    if (!shouldTryApi()) {
      return null;
    }

    try {
      // More reasonable timeout to prevent cascading failures
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased to 8 seconds
      
      const response = await fetch('https://api.ganjoor.net/api/ganjoor/poem/random', {
        signal: controller.signal,
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Persian Poetry App',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      // Check response status
      if (!response.ok) {
        // Silent handling of API errors
        handleApiFailure();
        return null;
      }
      
      // Get response text
      const text = await response.text();
      if (!text.trim()) {
        // Silent handling of empty response - this is common
        handleApiFailure();
        return null;
      }
      
      // Parse JSON
      const data = JSON.parse(text);
      if (!data?.id || (!data.plainText && !data.text)) {
        // Silent handling of invalid data
        handleApiFailure();
        return null;
      }
      
      // Skip if already used
      if (usedPoemIds.has(data.id)) {
        return null; // Return null to try again later
      }
      
      // Extract poet name
      let poetName = 'نامعلوم';
      if (data.poet?.name) {
        poetName = data.poet.name.trim();
      } else if (data.fullTitle?.includes(' » ')) {
        poetName = data.fullTitle.split(' » ')[0].trim();
      }
      
      // Create poem object
      const poemText = data.plainText || data.text || '';
      const poem = {
        id: data.id,
        title: (data.title || 'بدون عنوان').trim(),
        text: poemText.trim(),
        htmlText: data.htmlText || poemText.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>'),
        poet: {
          id: data.poet?.id || Date.now(),
          name: poetName,
          fullName: data.poet?.fullName || poetName
        }
      };
      
      // Success - reset failure count and add to used poems
      resetApiFailures();
      setUsedPoemIds(prev => new Set([...prev, data.id]));
      return poem;
      
    } catch (error) {
      // Silent handling of API errors - these are expected when APIs are down
      handleApiFailure();
      return null;
    }
  };

  // Fetch multiple random poems with conservative sequential approach
  const fetchRandomPoems = async (count: number = 20): Promise<Poem[]> => {
    const poems: Poem[] = [];
    const maxAttempts = Math.min(count * 2, 40); // Reasonable retry limit
    let attempts = 0;
    
    console.log(`Fetching ${count} poems from Ganjoor API...`);
    
    // Use sequential requests instead of concurrent batches to avoid overwhelming the API
    while (poems.length < count && attempts < maxAttempts && shouldTryApi()) {
      try {
        const poem = await fetchSingleRandomPoem();
        
        if (poem) {
          poems.push(poem);
          console.log(`✓ Fetched poem ${poems.length}/${count}: ${poem.title}`);
        }
        
        attempts++;
        
        // Short delay between requests to be respectful to the API
        if (poems.length < count && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Slightly longer delay
        }
        
      } catch (error) {
        console.warn('Single poem fetch error:', error);
        attempts++;
        
        // Break on consecutive failures to avoid long timeouts
        if (attempts >= 10 && poems.length === 0) {
          console.warn('Too many consecutive failures, stopping API requests');
          break;
        }
      }
    }
    
    console.log(`✓ Successfully fetched ${poems.length} poems from API (${attempts} attempts)`);
    return poems;
  };

  // Get mock poems based on language
  const getMockPoems = () => {
    return language === 'fa' ? mockPoemsFa : mockPoemsEn;
  };

  // Convert numbers to Farsi numerals
  const toFarsiNumber = (num: number): string => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().split('').map(digit => farsiDigits[parseInt(digit)]).join('');
  };

  // Local explanation generator to avoid server dependency
  const generateLocalExplanation = useCallback((poem: Poem, language: string) => {
    const isPersia = language === 'fa';
    const text = poem.text.toLowerCase();
    
    if (isPersia) {
      const themes = [];
      
      // Persian theme detection
      if (text.includes('عشق') || text.includes('محبت') || text.includes('دل')) {
        themes.push('عشق و محبت');
      }
      if (text.includes('گل') || text.includes('بهار') || text.includes('باغ')) {
        themes.push('طبیعت و زیبایی');
      }
      if (text.includes('دنیا') || text.includes('فانی') || text.includes('زندگی')) {
        themes.push('فلسفه زندگی');
      }
      if (text.includes('خدا') || text.includes('الله') || text.includes('رب')) {
        themes.push('معنویت و عرفان');
      }
      if (text.includes('جام') || text.includes('می') || text.includes('شراب')) {
        themes.push('نماد و استعاره');
      }
      if (text.includes('یار') || text.includes('معشوق') || text.includes('دوست')) {
        themes.push('عشق عرفانی');
      }
      
      const themeText = themes.length > 0 ? themes.join('، ') : 'زیبایی و هنر';
      
      // Generate line by line analysis
      const lines = poem.text.split(/\r?\n/).filter(line => line.trim() !== '').slice(0, 8);
      const lineByLine = lines.map(line => {
        let meaning = `این بیت درباره ${themeText} سخن می‌گوید`;
        
        if (line.includes('عشق') || line.includes('دل')) {
          meaning = 'این بیت درباره عمق احساسات و عشق صحبت می‌کند';
        } else if (line.includes('گل') || line.includes('باغ')) {
          meaning = 'این بیت از طبیعت برای بیان زیبایی و ناپایداری استفاده می‌کند';
        } else if (line.includes('می') || line.includes('جام')) {
          meaning = 'در این بیت شراب نمادی از معرفت و حال عرفانی است';
        } else if (line.includes('دنیا') || line.includes('فانی')) {
          meaning = 'این بیت درباره گذرا بودن زندگی دنیوی تأمل می‌کند';
        }
        
        return {
          original: line.trim(),
          meaning: meaning
        };
      });
      
      return {
        generalMeaning: `این شعر زیبا دربردارنده موضوعات ${themeText} است و با استفاده از تصاویر و استعاره‌های ظریف، پیام عمیق و معنادار خود را به مخاطب منتقل می‌کند.`,
        mainThemes: `موضوعات اصلی: ${themeText}`,
        imagerySymbols: `شاعر از تصاویر و نمادهای کلاسیک شعر فارسی استفاده کرده است که لایه‌های معنایی عمیق‌تری به شعر می‌بخشند.`,
        lineByLine
      };
    } else {
      const themes = [];
      
      // English theme detection
      if (text.includes('love') || text.includes('heart') || text.includes('beloved')) {
        themes.push('love and devotion');
      }
      if (text.includes('flower') || text.includes('garden') || text.includes('spring')) {
        themes.push('nature and beauty');
      }
      if (text.includes('life') || text.includes('world') || text.includes('time')) {
        themes.push('philosophy of life');
      }
      if (text.includes('god') || text.includes('divine') || text.includes('spiritual')) {
        themes.push('spirituality and mysticism');
      }
      if (text.includes('wine') || text.includes('cup') || text.includes('tavern')) {
        themes.push('symbolism and metaphor');
      }
      
      const themeText = themes.length > 0 ? themes.join(', ') : 'beauty and artistry';
      
      const lines = poem.text.split(/\r?\n/).filter(line => line.trim() !== '').slice(0, 8);
      const lineByLine = lines.map(line => {
        let meaning = `This line explores themes of ${themeText}`;
        
        if (line.toLowerCase().includes('love') || line.toLowerCase().includes('heart')) {
          meaning = 'This line expresses deep emotions and the nature of love';
        } else if (line.toLowerCase().includes('flower') || line.toLowerCase().includes('garden')) {
          meaning = 'This line uses nature imagery to convey beauty and transience';
        } else if (line.toLowerCase().includes('wine') || line.toLowerCase().includes('cup')) {
          meaning = 'Here wine serves as a metaphor for spiritual intoxication';
        }
        
        return {
          original: line.trim(),
          meaning: meaning
        };
      });
      
      return {
        generalMeaning: `This beautiful poem encompasses themes of ${themeText}, using delicate imagery and metaphors to convey its profound message following the rich tradition of Persian poetry.`,
        mainThemes: `Main themes: ${themeText}`,
        imagerySymbols: `The poet uses classical Persian metaphors and symbols, creating layers of meaning that enhance the poem's literary significance.`,
        lineByLine
      };
    }
  }, []);

  // Test server connectivity silently
  const testServerConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // More reasonable timeout
      
      const response = await fetch('https://gshjtggmbgr4exrxqw9wz7a.supabase.co/functions/v1/make-server-c192d0ee/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdSVGp0Z2dtYmdyNGV4cnhxdzl3ejdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Njk4OTIsImV4cCI6MjA1MjQ0NTg5Mn0.a1N0i6dHtxTBLwzFTBAd3JULDIlJOqN1U11D0W_sQsU`
        },
        signal: controller.signal
      });
      
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      // Silent failure - this is expected when server is unavailable
      return false;
    }
  }, []);

  // Enhanced explanation system with optional server enhancement
  const fetchExplanation = useCallback(async (poem: Poem, forceRefresh = false): Promise<{
    data: {
      lineByLine?: Array<{ original: string; meaning: string }>;
      generalMeaning?: string;
      mainThemes?: string;
      imagerySymbols?: string;
      fullTafsir?: any; // Comprehensive tafsir data from server
    };
    loading: boolean;
    error: string;
    timestamp: number;
  }> => {
    const cacheKey = `${poem.id}-${language}`;
    
    // Return cached result if available and not forcing refresh
    if (!forceRefresh && explanationCache.has(cacheKey)) {
      const cached = explanationCache.get(cacheKey)!;
      return cached;
    }

    // Cancel any existing request for this poem
    const existingController = activeRequestsRef.current.get(cacheKey);
    if (existingController && !existingController.signal.aborted) {
      existingController.abort();
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    activeRequestsRef.current.set(cacheKey, controller);

    // Set loading state
    const loadingResult = {
      data: {},
      loading: true,
      error: '',
      timestamp: Date.now()
    };
    setExplanationCache(prev => new Map(prev.set(cacheKey, loadingResult)));

    // Try server enhancement only if explicitly requested - completely silent
    if (forceRefresh) {
      try {
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000); // Reasonable timeout to prevent cascading failures
        
        const response = await fetch('https://gshjtggmbgr4exrxqw9wz7a.supabase.co/functions/v1/make-server-c192d0ee/explain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdSVGp0Z2dtYmdyNGV4cnhxdzl3ejdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Njk4OTIsImV4cCI6MjA1MjQ0NTg5Mn0.a1N0i6dHtxTBLwzFTBAd3JULDIlJOqN1U11D0W_sQsU`
          },
          body: JSON.stringify({
            poem: {
              text: poem.text,
              title: poem.title,
              poet: poem.poet.name
            },
            language: language
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          
          if (result.explanation && !controller.signal.aborted) {
            // Server returns transformed explanation data - store as is
            const serverResult = {
              data: result.explanation,
              loading: false,
              error: '',
              timestamp: Date.now()
            };

            setExplanationCache(prev => new Map(prev.set(cacheKey, serverResult)));
            activeRequestsRef.current.delete(cacheKey);
            
            return serverResult;
          }
        }
      } catch (error) {
        // Silent fallback - server enhancement failed but that's expected
        if (error.name !== 'AbortError') {
          console.warn('Server explanation failed:', error.message);
        }
      }
    }

    // Always generate local explanation as primary method
    const localExplanation = generateLocalExplanation(poem, language);
    
    const successResult = {
      data: localExplanation,
      loading: false,
      error: '',
      timestamp: Date.now()
    };

    setExplanationCache(prev => new Map(prev.set(cacheKey, successResult)));
    activeRequestsRef.current.delete(cacheKey);
    
    return successResult;
  }, [language, explanationCache, generateLocalExplanation]);

  // Re-enabled translation with proper error handling
  const translatePoem = async (poem: Poem): Promise<Poem | null> => {
    try {
      console.log(`Translating poem ${poem.id} to English`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout
      
      const response = await fetch('https://gshjtggmbgr4exrxqw9wz7a.supabase.co/functions/v1/make-server-c192d0ee/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdSVGp0Z2dtYmdyNGV4cnhxdzl3ejdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4Njk4OTIsImV4cCI6MjA1MjQ0NTg5Mn0.a1N0i6dHtxTBLwzFTBAd3JULDIlJOqN1U11D0W_sQsU`
        },
        body: JSON.stringify({
          poem: {
            text: poem.text,
            title: poem.title,
            poet: poem.poet.name
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Translation API error: ${response.status}`);
        return null;
      }

      const result = await response.json();
      
      if (!result.translatedPoem) {
        console.warn('Translation API returned no translated poem');
        return null;
      }

      // Create translated poem object
      const translatedPoem = {
        id: poem.id + 1000, // Offset to avoid ID conflicts
        title: result.translatedPoem.title || poem.title,
        text: result.translatedPoem.text || poem.text,
        htmlText: result.translatedPoem.htmlText || result.translatedPoem.text?.replace(/\n/g, '<br/>') || poem.htmlText,
        poet: {
          id: poem.poet.id,
          name: result.translatedPoem.poet || poem.poet.name,
          fullName: result.translatedPoem.poet || poem.poet.fullName
        }
      };

      console.log(`✓ Translation successful for poem ${poem.id}`);
      return translatedPoem;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Translation request timed out');
      } else {
        console.warn('Translation error:', error);
      }
      return null;
    }
  };

  // Load initial poems with conservative approach
  const loadInitialPoems = async () => {
    setLoading(true);
    console.log('Loading initial poems...');
    
    try {
      if (language === 'fa') {
        console.log('Loading Persian poems from API...');
        
        // Start with smaller batch and shorter timeout to avoid build timeouts
        const apiPoems = await Promise.race([
          fetchRandomPoems(15), // Reduced from 20 to 15
          new Promise<Poem[]>((resolve) => 
            setTimeout(() => {
              console.log('Initial load timeout, falling back to mock data');
              resolve([]);
            }, 25000) // 25 second timeout to prevent build timeout
          )
        ]);
        
        if (apiPoems.length > 0) {
          console.log(`✓ Loaded ${apiPoems.length} poems from API`);
          setPoems(apiPoems);
          setUsingMockData(false);
        } else {
          // Fallback to mock data if API fails
          console.log('API failed or timed out, using mock Persian poems');
          const shuffledMock = shuffleArray(mockPoemsFa);
          // Create extended mock poems for better variety
          const extendedMock = [];
          for (let i = 0; i < 30; i++) {
            extendedMock.push({
              ...shuffledMock[i % shuffledMock.length],
              id: shuffledMock[i % shuffledMock.length].id + (Math.floor(i / shuffledMock.length) * 1000)
            });
          }
          setPoems(extendedMock);
          setUsingMockData(true);
        }
      } else {
        // English mode: use extended mock poems
        console.log('Loading English poems from mock data...');
        const shuffledMock = shuffleArray(mockPoemsEn);
        // Create extended mock poems for better variety
        const extendedMock = [];
        for (let i = 0; i < 30; i++) {
          extendedMock.push({
            ...shuffledMock[i % shuffledMock.length],
            id: shuffledMock[i % shuffledMock.length].id + (Math.floor(i / shuffledMock.length) * 1000)
          });
        }
        setPoems(extendedMock);
        setUsingMockData(true);
      }
    } catch (error) {
      console.warn('Error loading initial poems:', error);
      // Fallback to extended mock data
      const shuffledMock = shuffleArray(getMockPoems());
      const extendedMock = [];
      for (let i = 0; i < 30; i++) {
        extendedMock.push({
          ...shuffledMock[i % shuffledMock.length],
          id: shuffledMock[i % shuffledMock.length].id + (Math.floor(i / shuffledMock.length) * 1000)
        });
      }
      setPoems(extendedMock);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  // Load additional poems when reaching the end
  const loadMorePoems = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    console.log('Loading additional poems...');
    
    try {
      if (language === 'fa') {
        // Persian mode - try API if available with timeout
        if (shouldTryApi() && !usingMockData) {
          console.log('Fetching more Persian poems from API...');
          
          const apiPoems = await Promise.race([
            fetchRandomPoems(10), // Reduced batch size for loading more
            new Promise<Poem[]>((resolve) => 
              setTimeout(() => {
                console.log('Load more timeout, falling back to mock data');
                resolve([]);
              }, 15000) // 15 second timeout for additional loads
            )
          ]);
          
          if (apiPoems.length > 0) {
            console.log(`✓ Loaded ${apiPoems.length} more poems from API`);
            setPoems(prev => [...prev, ...apiPoems]);
            setLoadingMore(false);
            return;
          }
        }
        
        // Use extended mock Persian poems
        console.log('Using mock Persian poems for additional content');
        const shuffledMock = shuffleArray(mockPoemsFa);
        const currentCount = poems.length;
        const extendedMock = [];
        for (let i = 0; i < 20; i++) {
          extendedMock.push({
            ...shuffledMock[i % shuffledMock.length],
            id: shuffledMock[i % shuffledMock.length].id + currentCount + (Math.floor(i / shuffledMock.length) * 1000)
          });
        }
        setPoems(prev => [...prev, ...extendedMock]);
        setUsingMockData(true);
      } else {
        // English mode - try translation or use mock (simplified)
        if (shouldTryApi() && !usingMockData) {
          console.log('Trying to fetch and translate Persian poems to English...');
          
          const persianPoems = await Promise.race([
            fetchRandomPoems(5), // Reduced for translation load
            new Promise<Poem[]>((resolve) => 
              setTimeout(() => {
                console.log('Translation fetch timeout, using mock data');
                resolve([]);
              }, 10000) // Shorter timeout for translation
            )
          ]);
          
          if (persianPoems.length > 0) {
            console.log(`Translating ${persianPoems.length} Persian poems to English...`);
            const translatedPoems: Poem[] = [];
            
            // Translate poems one by one with shorter timeout
            for (const poem of persianPoems.slice(0, 3)) { // Limit to 3 to avoid timeouts
              try {
                const translated = await Promise.race([
                  translatePoem(poem),
                  new Promise<Poem | null>((resolve) => 
                    setTimeout(() => resolve(null), 8000) // 8 second timeout per translation
                  )
                ]);
                
                if (translated) {
                  translatedPoems.push(translated);
                }
                
                // Small delay between translations
                await new Promise(resolve => setTimeout(resolve, 200));
              } catch (error) {
                console.warn('Translation failed for poem:', poem.id, error);
              }
            }
            
            if (translatedPoems.length > 0) {
              console.log(`✓ Successfully translated ${translatedPoems.length} poems to English`);
              setPoems(prev => [...prev, ...translatedPoems]);
              setLoadingMore(false);
              return;
            }
          }
        }
        
        // Use extended mock English poems
        console.log('Using mock English poems for additional content');
        const shuffledMock = shuffleArray(mockPoemsEn);
        const currentCount = poems.length;
        const extendedMock = [];
        for (let i = 0; i < 20; i++) {
          extendedMock.push({
            ...shuffledMock[i % shuffledMock.length],
            id: shuffledMock[i % shuffledMock.length].id + currentCount + (Math.floor(i / shuffledMock.length) * 1000)
          });
        }
        setPoems(prev => [...prev, ...extendedMock]);
        setUsingMockData(true);
      }
    } catch (error) {
      console.warn('Error loading more poems:', error);
      // Fallback to extended mock data
      const shuffledMock = shuffleArray(getMockPoems());
      const currentCount = poems.length;
      const extendedMock = [];
      for (let i = 0; i < 20; i++) {
        extendedMock.push({
          ...shuffledMock[i % shuffledMock.length],
          id: shuffledMock[i % shuffledMock.length].id + currentCount + (Math.floor(i / shuffledMock.length) * 1000)
        });
      }
      setPoems(prev => [...prev, ...extendedMock]);
      setUsingMockData(true);
    } finally {
      setLoadingMore(false);
    }
  };

  // Navigate to specific poem with card transition
  const navigateToPoem = useCallback((index: number) => {
    console.log('navigateToPoem called:', { from: currentIndex, to: index, totalPoems: poems.length });
    
    if (index >= 0 && index < poems.length) {
      console.log('✓ Navigating to poem index:', index);
      setCurrentIndex(index);
      
      // Add haptic feedback on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } else {
      console.log('✗ Cannot navigate - index out of bounds:', { index, min: 0, max: poems.length - 1 });
    }
  }, [currentIndex, poems.length]);

  // Check if any sheet is open
  const isAnySheetOpen = authSheetOpen || profileSheetOpen || favoritesSheetOpen || moreSheetOpen;

  // Enhanced touch handlers for reliable poem navigation
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Don't handle touches when any sheet is open
    if (isAnySheetOpen) return;
    
    const touch = e.touches[0];
    setTouchStart({
      y: touch.clientY,
      time: Date.now()
    });
    setIsDragging(false);
    setSwipeDirection(null);
    
    console.log('Touch start:', touch.clientY);
  }, [isAnySheetOpen]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Don't handle touches when any sheet is open
    if (isAnySheetOpen || !touchStart) return;
    
    const touch = e.touches[0];
    const deltaY = touchStart.y - touch.clientY;
    
    // Set dragging state for any significant movement
    if (Math.abs(deltaY) > 10) {
      setIsDragging(true);
    }
    
    // Set swipe direction for larger movements
    if (Math.abs(deltaY) > 30) {
      const newDirection = deltaY > 0 ? 'up' : 'down';
      setSwipeDirection(newDirection);
      console.log('Swipe direction:', newDirection, 'Delta:', deltaY);
    }
    
    // Prevent scrolling during significant vertical swipes
    if (Math.abs(deltaY) > 20) {
      e.preventDefault();
    }
  }, [touchStart, isAnySheetOpen]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Don't handle touches when any sheet is open
    if (isAnySheetOpen || !touchStart) return;

    const touch = e.changedTouches[0];
    const deltaY = touchStart.y - touch.clientY;
    const deltaTime = Date.now() - touchStart.time;
    
    console.log('Touch end - deltaY:', deltaY, 'deltaTime:', deltaTime, 'currentIndex:', currentIndex, 'totalPoems:', poems.length);

    // More sensitive swipe detection - reduced threshold and increased time limit
    if (Math.abs(deltaY) > 40 && deltaTime < 800) {
      e.preventDefault();
      
      if (deltaY > 0) {
        // Swiping up - go to next poem
        if (currentIndex < poems.length - 1) {
          console.log('Navigating to next poem:', currentIndex + 1);
          navigateToPoem(currentIndex + 1);
        } else {
          console.log('At last poem, loading more...');
        }
        
        // Load more if near end (within 5 poems of the end)
        if (currentIndex >= poems.length - 5 && !loadingMore) {
          console.log('Near end of poems, loading more...');
          loadMorePoems();
        }
      } else if (deltaY < 0) {
        // Swiping down - go to previous poem
        if (currentIndex > 0) {
          console.log('Navigating to previous poem:', currentIndex - 1);
          navigateToPoem(currentIndex - 1);
        } else {
          console.log('At first poem');
        }
      }
    } else {
      console.log('Swipe not detected - deltaY:', Math.abs(deltaY), 'threshold: 40, deltaTime:', deltaTime, 'limit: 800');
    }

    // Reset states
    setTouchStart(null);
    setSwipeDirection(null);
    setIsDragging(false);
  }, [touchStart, currentIndex, poems.length, navigateToPoem, loadingMore, isAnySheetOpen]);

  // Enhanced keyboard navigation with logging
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle keyboard navigation when any sheet is open
    if (isAnySheetOpen) return;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) {
        console.log('Keyboard navigation to previous poem:', currentIndex - 1);
        navigateToPoem(currentIndex - 1);
      } else {
        console.log('At first poem, cannot go to previous');
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < poems.length - 1) {
        console.log('Keyboard navigation to next poem:', currentIndex + 1);
        navigateToPoem(currentIndex + 1);
        
        // Load more if near end (within 5 poems of the end)
        if (currentIndex >= poems.length - 5 && !loadingMore) {
          console.log('Near end, loading more poems...');
          loadMorePoems();
        }
      } else {
        console.log('At last poem, cannot go to next without loading more');
        // Try to load more if we're near the end
        if (currentIndex >= poems.length - 5 && !loadingMore) {
          console.log('Loading more poems from keyboard navigation...');
          loadMorePoems();
        }
      }
    }
  }, [currentIndex, poems.length, navigateToPoem, loadingMore, isAnySheetOpen]);

  // Handle auth requirement for favorites
  const handleAuthRequired = () => {
    setAuthSheetOpen(true);
  };

  // Handle settings button click
  const handleSettingsClick = () => {
    if (user) {
      setProfileSheetOpen(true);
    } else {
      setAuthSheetOpen(true);
    }
  };

  // Handle show favorites
  const handleShowFavorites = () => {
    setProfileSheetOpen(false);
    setFavoritesSheetOpen(true);
  };

  // Handle more button click
  const handleMoreOpen = () => {
    setMoreSheetOpen(true);
  };

  // Handle mute toggle
  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Video navigation handlers
  const handleVideoNext = () => {
    console.log('handleVideoNext called');
    if (videoPlaylistRef.current) {
      console.log('VideoPlaylist ref found, calling navigateNext');
      videoPlaylistRef.current.navigateNext();
    } else {
      console.warn('VideoPlaylist ref not found');
    }
  };

  const handleVideoPrevious = () => {
    console.log('handleVideoPrevious called');
    if (videoPlaylistRef.current) {
      console.log('VideoPlaylist ref found, calling navigatePrevious');
      videoPlaylistRef.current.navigatePrevious();
    } else {
      console.warn('VideoPlaylist ref not found');
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    console.log('Refreshing app - cancelling active requests and resetting state');
    
    // Cancel all active explanation requests safely
    const requestsToCancel = Array.from(activeRequestsRef.current.entries());
    activeRequestsRef.current.clear();
    
    requestsToCancel.forEach(([key, controller]) => {
      try {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      } catch (error) {
        // Ignore errors during cancellation
      }
    });
    
    // Reset all state
    setCurrentIndex(0);
    setUsedPoemIds(new Set());
    setExplanationCache(new Map());
    setPoems([]);
    setUsingMockData(false);
    setHasMore(true);
    
    // Reset API failure tracking
    setApiFailureCount(0);
    setLastApiFailureTime(0);
    
    // Small delay to ensure state updates, then reload
    setTimeout(() => {
      loadInitialPoems();
    }, 100);
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage: 'fa' | 'en') => {
    if (newLanguage === language) return;

    console.log(`Language changed to: ${newLanguage}`);
    
    // Cancel all active explanation requests safely
    const requestsToCancel = Array.from(activeRequestsRef.current.entries());
    activeRequestsRef.current.clear();
    
    requestsToCancel.forEach(([key, controller]) => {
      try {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      } catch (error) {
        console.warn('Error cancelling request during language change:', error);
      }
    });
    
    // Clear explanations cache for new language
    setExplanationCache(new Map());
    
    // Reset state for both language changes
    setCurrentIndex(0);
    setUsedPoemIds(new Set());
    setPoems([]);
    setUsingMockData(false);
    setHasMore(true);
    
    // Reset API failure tracking
    setApiFailureCount(0);
    setLastApiFailureTime(0);
    
    // Load poems for the new language
    setTimeout(() => {
      loadInitialPoems();
    }, 100); // Small delay to ensure state is updated
  };

  // Global error handler for auth issues
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error;
      if (error && (
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('refresh_token_not_found') ||
        error.name === 'AuthApiError'
      )) {
        console.log('Global auth error detected, refreshing session');
        // Try to refresh session, which will handle clearing if needed
        refreshSession().catch(() => {
          // If refresh fails, the user will be signed out
          console.log('Session refresh failed, user will be signed out');
        });
        
        // Prevent the error from propagating
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error && (
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('refresh_token_not_found') ||
        error.name === 'AuthApiError'
      )) {
        console.log('Global auth promise rejection detected, refreshing session');
        // Try to refresh session
        refreshSession().catch(() => {
          console.log('Session refresh failed, user will be signed out');
        });
        
        // Prevent the error from propagating
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [refreshSession]);

  // Load initial data and test connectivity with global timeout protection
  useEffect(() => {
    let mounted = true;
    let globalTimeoutId: NodeJS.Timeout;
    
    const loadData = async () => {
      if (!mounted) return;
      
      // Set a global timeout to prevent page timeout errors
      globalTimeoutId = setTimeout(() => {
        if (mounted) {
          console.log('Global timeout reached, forcing fallback to mock data');
          
          // Force fallback to mock data
          const shuffledMock = shuffleArray(getMockPoems());
          const extendedMock = [];
          for (let i = 0; i < 30; i++) {
            extendedMock.push({
              ...shuffledMock[i % shuffledMock.length],
              id: shuffledMock[i % shuffledMock.length].id + (Math.floor(i / shuffledMock.length) * 1000)
            });
          }
          setPoems(extendedMock);
          setUsingMockData(true);
          setLoading(false);
          
          // Cancel any ongoing requests
          activeRequestsRef.current.forEach((controller) => {
            try {
              controller.abort();
            } catch (error) {
              // Ignore errors during cleanup
            }
          });
          activeRequestsRef.current.clear();
        }
      }, 28000); // 28 second global timeout to prevent 30s page timeout
      
      try {
        // Test server connectivity silently in background
        testServerConnectivity().then(isConnected => {
          // Silent - no need to log connectivity status
        }).catch(() => {
          // Silent failure is expected when server is down
        });
        
        await loadInitialPoems();
      } catch (error) {
        console.error('Error in loadData:', error);
        
        // Fallback on any error
        if (mounted) {
          const shuffledMock = shuffleArray(getMockPoems());
          const extendedMock = [];
          for (let i = 0; i < 30; i++) {
            extendedMock.push({
              ...shuffledMock[i % shuffledMock.length],
              id: shuffledMock[i % shuffledMock.length].id + (Math.floor(i / shuffledMock.length) * 1000)
            });
          }
          setPoems(extendedMock);
          setUsingMockData(true);
          setLoading(false);
        }
      } finally {
        if (globalTimeoutId) {
          clearTimeout(globalTimeoutId);
        }
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
      
      if (globalTimeoutId) {
        clearTimeout(globalTimeoutId);
      }
      
      // Cancel all active explanation requests on unmount
      activeRequestsRef.current.forEach((controller, key) => {
        try {
          controller.abort();
        } catch (error) {
          console.warn('Error aborting controller on unmount:', error);
        }
      });
      activeRequestsRef.current.clear();
    };
  }, [testServerConnectivity]);

  // Reload poems when language changes (only for Persian)
  useEffect(() => {
    if (poems.length === 0 && language === 'fa') {
      // Only auto-load Persian poems when no poems exist
      loadInitialPoems();
    }
  }, [language]);

  // Clean up old cache entries periodically - but be very conservative
  useEffect(() => {
    // Only clean up when cache gets very large to reduce interference
    if (explanationCache.size > 20) {
      const entries = Array.from(explanationCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const newCache = new Map(entries.slice(0, 15)); // Keep even more entries
      setExplanationCache(newCache);
      
      // Don't cancel active requests during cache cleanup to prevent AbortErrors
      // Just clean up the cache entries - let the requests complete naturally
      console.log(`Cleaned explanation cache: ${explanationCache.size} -> ${newCache.size} entries`);
    }
  }, [explanationCache.size]); // Only trigger when cache size changes

  // Add event listeners with proper setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.warn('Container ref not found, touch navigation will not work');
      return;
    }

    console.log('Setting up touch and keyboard event listeners');

    // Touch events - using passive: false for touchmove to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Keyboard events on window
    window.addEventListener('keydown', handleKeyDown);

    console.log('✓ Event listeners added successfully');

    return () => {
      console.log('Cleaning up event listeners');
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleKeyDown]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin mb-6"></div>
        <div className="text-foreground text-xl md:text-2xl animate-pulse" dir={isRTL ? "rtl" : "ltr"}>{t.loading}</div>
        {(language === 'fa' && usingMockData) && (
          <div className="text-foreground/60 text-sm mt-2" dir={isRTL ? "rtl" : "ltr"}>{t.mockDataSubtitle}</div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-background relative overflow-hidden app-container"
      style={{ 
        touchAction: 'manipulation', // Optimized touch handling for swipe gestures
        height: '100vh',
        height: '100dvh', // Use dynamic viewport height for better mobile support
        userSelect: 'none', // Prevent text selection during swipes
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {/* Enhanced swipe feedback overlay */}
      {swipeDirection && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-6xl transform transition-all duration-200 ${
            swipeDirection === 'up' ? 'translate-y-4 opacity-90 scale-110' : '-translate-y-4 opacity-90 scale-110'
          }`}
          style={{
            textShadow: theme === 'dark' 
              ? '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 0, 0, 0.6)'
              : '2px 2px 8px rgba(255, 255, 255, 0.8), 0 0 16px rgba(255, 255, 255, 0.6)',
            filter: 'drop-shadow(0 0 10px currentColor)'
          }}>
            {swipeDirection === 'up' ? '↑' : '↓'}
          </div>
        </div>
      )}

      {/* Debug info overlay - remove in production */}
      {isDragging && (
        <div className="absolute top-20 right-4 z-50 bg-black/50 text-white text-xs p-2 rounded pointer-events-none">
          <div>Current: {currentIndex + 1}/{poems.length}</div>
          <div>Direction: {swipeDirection || 'none'}</div>
          <div>Dragging: {isDragging ? 'yes' : 'no'}</div>
        </div>
      )}

      {/* Video Playlist Background */}
      <VideoPlaylist ref={videoPlaylistRef} isMuted={isMuted} />

      {/* Render cards - only render visible cards for performance */}
      {poems.slice(Math.max(0, currentIndex - 1), Math.min(poems.length, currentIndex + 2)).map((poem, relativeIndex) => {
        const actualIndex = Math.max(0, currentIndex - 1) + relativeIndex;
        return (
          <PoemCard 
            key={`${poem.id}-${actualIndex}`}
            poem={poem} 
            isActive={actualIndex === currentIndex} 
            currentIndex={currentIndex}
            cardIndex={actualIndex}
          />
        );
      })}
      
      {/* Progress indicator */}
      <div className="absolute top-16 left-4 z-40 flex flex-col space-y-4">
        {Array.from({ length: 5 }, (_, i) => {
          // Only show dots if we have poems
          if (poems.length === 0) return null;
          
          // Calculate the relative position in a sliding window
          const windowStart = Math.max(0, currentIndex - 2);
          const dotIndex = windowStart + i;
          const isVisible = dotIndex < poems.length;
          const isActive = dotIndex === currentIndex && isVisible;
          
          return (
            <div
              key={i}
              className={`w-1.5 h-4 rounded-full transition-all duration-300 shadow-lg ${
                isActive 
                  ? (theme === 'dark' ? 'bg-white' : 'bg-black')
                  : isVisible 
                    ? (theme === 'dark' ? 'bg-white/50' : 'bg-black/50')
                    : (theme === 'dark' ? 'bg-white/20' : 'bg-black/20')
              }`}
              style={{
                opacity: isVisible ? 1 : 0.3
              }}
            />
          );
        })}
        {/* Current position indicator */}
        <div className={`mt-2 ${theme === 'dark' ? 'text-white/80' : 'text-black/80'} text-xs text-left shadow-lg`} dir="rtl" style={{
          textShadow: theme === 'dark' 
            ? '1px 1px 2px rgba(0, 0, 0, 0.8)' 
            : '1px 1px 2px rgba(255, 255, 255, 0.8)'
        }}>
          {toFarsiNumber(currentIndex + 1)}
        </div>
      </div>


      
      {/* Loading indicator when loading more */}
      {loadingMore && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="text-foreground/60 text-sm animate-pulse" dir={isRTL ? "rtl" : "ltr"}>
            {t.loading}
          </div>
        </div>
      )}
      
      {/* API status indicator - only show when using mock data or after many API failures */}
      {(usingMockData || apiFailureCount >= 5) && language === 'fa' && (
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-yellow-600/20 text-yellow-300 text-xs px-2 py-1 rounded" dir={isRTL ? "rtl" : "ltr"}>
            {apiFailureCount >= 5 ? t.apiUnavailable : t.sampleMode}
          </div>
        </div>
      )}

      {/* Button Stack with Language, Refresh, More and Favorite buttons */}
      <ButtonStack 
        poem={poems.length > 0 ? poems[currentIndex] : undefined}
        onAuthRequired={handleAuthRequired}
        onMoreOpen={handleMoreOpen}
        onRefresh={handleRefresh}
        onLanguageChange={handleLanguageChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Settings Button */}
      <SettingsButton onOpen={handleSettingsClick} />

      {/* Author name positioned at top */}
      {poems.length > 0 && poems[currentIndex] && (
        <div 
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-40 ${theme === 'dark' ? 'text-white bg-black/50' : 'text-black bg-white/50'} text-sm text-center backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg`}
          dir={isRTL ? "rtl" : "ltr"}
          style={{
            textShadow: theme === 'dark' 
              ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
              : '1px 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          {poems[currentIndex].poet.name}
        </div>
      )}

      {/* Video Controls - positioned 64px from bottom */}
      <VideoControls 
        onNext={handleVideoNext}
        onPrevious={handleVideoPrevious}
      />

      {/* Animated Group - centered at bottom of page */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-32 h-16">
          <AnimatedGroup />
        </div>
      </div>

      {/* Auth Sheet */}
      <AuthSheet 
        open={authSheetOpen} 
        onOpenChange={setAuthSheetOpen} 
      />

      {/* Profile Sheet */}
      <DraggableProfileSheet 
        open={profileSheetOpen} 
        onOpenChange={setProfileSheetOpen}
        onShowFavorites={handleShowFavorites}
      />

      {/* Favorites Sheet */}
      <DraggableFavoritesSheet 
        open={favoritesSheetOpen} 
        onOpenChange={setFavoritesSheetOpen}
      />

      {/* More Sheet */}
      <DraggableMoreSheet 
        open={moreSheetOpen} 
        onOpenChange={setMoreSheetOpen}
        poem={poems.length > 0 ? poems[currentIndex] : undefined}
        cachedExplanation={poems.length > 0 && poems[currentIndex] ? 
          explanationCache.get(`${poems[currentIndex].id}-${language}`) : undefined}
        onFetchExplanation={fetchExplanation}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProfileProvider>
            <AppContent />
          </ProfileProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}