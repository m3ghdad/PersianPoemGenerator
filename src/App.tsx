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
import { AnimatedHandBackground } from './components/AnimatedHandBackground';
import AnimatedGroup from './components/AnimatedGroup';
import { TypewriterText } from './components/TypewriterText';
import { Toaster } from './components/ui/sonner';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { DelightfulLoader } from './components/DelightfulLoader';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Language } from './utils/translations';

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
            // Get the original text (not HTML)
            const originalText = poem.text;
            // Split by line breaks
            const lines = originalText.split(/\r?\n/).filter(line => line.trim() !== '');
            // Group in pairs and add blank line between couplets
            const result = [];
            for (let i = 0; i < lines.length; i += 2) {
              if (i + 1 < lines.length) {
                // We have a pair - add first line, newline, second line
                result.push(lines[i]);
                result.push('\n');
                result.push(lines[i + 1]);
                // Add blank line after the couplet (unless it's the last couplet)
                if (i + 2 < lines.length) {
                  result.push('\n\n'); // Double newline creates the blank line
                }
              } else {
                // Last line is alone
                result.push(lines[i]);
              }
            }
            // Join everything together
            return result.join('');
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
              : '2px 2px 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.6)',
            whiteSpace: 'pre-line' // Preserve newlines while collapsing other whitespace
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  // Store original Persian poems to maintain consistency across language switches
  const [persianPoemsCache, setPersianPoemsCache] = useState<Poem[]>([]);
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
  const { language, t, isRTL, hasSelectedLanguage, isLoadingPreference, saveLanguagePreference } = useLanguage();
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
      // Shorter timeout to prevent cascading failures
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced to 5 seconds
      
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
      
      // Filter: Only accept poems with 10 lines or fewer
      const lines = poemText.trim().split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length > 10) {
        console.log(`Skipping poem ${data.id} - too long (${lines.length} lines)`);
        return null; // Skip this poem and try another
      }
      
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
      
      console.log(`✓ Accepted poem ${data.id} - ${lines.length} lines`);
      
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
    const maxAttempts = Math.min(count * 2, 30); // More conservative retry limit
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
        
        // Minimal delay between requests
        if (poems.length < count && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay for faster loading
        }
        
      } catch (error) {
        console.warn('Single poem fetch error:', error);
        attempts++;
        
        // Break on consecutive failures to avoid long timeouts
        if (attempts >= 8 && poems.length === 0) {
          console.warn('Too many consecutive failures, stopping API requests');
          break;
        }
      }
    }
    
    console.log(`✓ Successfully fetched ${poems.length} poems from API (${attempts} attempts)`);
    return poems;
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
      
      // Generate comprehensive line by line analysis - ALWAYS provide content
      const lines = poem.text.split(/\r?\n/).filter(line => line.trim() !== '');
      const lineByLine = lines.map((line, index) => {
        let meaning = '';
        
        // Detailed analysis based on content and position
        if (line.includes('عشق') || line.includes('دل') || line.includes('محبت')) {
          meaning = `در این بیت، شاعر با استفاده از واژگان عاطفی و تصاویر احساسی، به بیان عمق عشق و پیچیدگی‌های آن می‌پردازد. این بیان نه تنها حاوی معنای ظاهری است، بلکه لایه‌های عرفانی و فلسفی نیز در آن نهفته است. استفاده از کلمات کلیدی در این مصراع، نشان‌دهنده تجربه عمیق احساسی شاعر است.`;
        } else if (line.includes('گل') || line.includes('باغ') || line.includes('بهار')) {
          meaning = `شاعر در این بیت از تصاویر طبیعت و زیبایی‌های آن بهره می‌برد تا مفاهیم عمیق‌تری چون گذر زمان، زیبایی ناپایدار، و چرخه حیات را به تصویر بکشد. این استعاره‌های طبیعی از مشخصات بارز شعر کلاسیک فارسی است که معانی چندلایه را در قالب تصاویر ملموس ارائه می‌دهد.`;
        } else if (line.includes('می') || line.includes('جام') || line.includes('شراب')) {
          meaning = `در این مصراع، شراب و جام نه تنها به معنای ظاهری خود، بلکه به عنوان نمادی از معرفت، حال عرفانی، و مستی روحانی به کار رفته است. این یکی از رمزهای رایج در شعر فارسی است که مخاطب را به تفسیرهای عمیق‌تر دعوت می‌کند و لایه‌های معنایی متعددی دارد.`;
        } else if (line.includes('دنیا') || line.includes('فانی') || line.includes('زمان')) {
          meaning = `این بیت حاوی تأملات فلسفی درباره گذرا بودن حیات دنیوی و ماهیت زمان است. شاعر با زبانی شاعرانه و حکیمانه، به بررسی جایگاه انسان در جهان و ناپایداری امور مادی می‌پردازد، که از مضامین اصلی اندیشه فلسفی در ادبیات کلاسیک فارسی به شمار می‌رود.`;
        } else if (line.includes('یار') || line.includes('معشوق') || line.includes('دوست')) {
          meaning = `مفهوم یار و معشوق در این بیت فراتر از معنای عاشقانه صرف است و به بعد عرفانی و روحانی اشاره دارد. شاعر با استفاده از این واژگان، لایه‌های مختلف عشق از جسمانی تا روحانی و الهی را در هم می‌آمیزد و مخاطب را به درک عمیق‌تری از مفهوم محبت رهنمون می‌سازد.`;
        } else {
          // Default comprehensive analysis
          meaning = `این بیت با بهره‌گیری از زبان شاعرانه و تصاویر هنرمندانه، به بیان مفاهیم ${themeText} می‌پردازد. شاعر با انتخاب دقیق واژگان و ترکیب‌بندی استادانه، پیامی عمیق و چندلایه را منتقل می‌کند که نیازمند تأمل و دقت در خوانش است. این مصراع در کنار سایر ابیات، شبکه‌ای از معانی مرتبط را می‌سازد.`;
        }
        
        return {
          original: line.trim(),
          meaning: meaning
        };
      });
      
      return {
        generalMeaning: `${poem.poet?.name || 'شاعر'} در این اثر ارزشمند، با استادی تمام و بهره‌گیری از سنت غنی شعر کلاسیک فارسی، به بررسی و تحلیل ${themeText} می‌پردازد. این شعر نمونه‌ای از عمق اندیشه و ظرافت بیان است که با استفاده از تصاویر چندلایه، استعاره‌های نمادین، و صناعات ادبی برجسته، مخاطب را به سفری معنوی و فکری دعوت می‌کند. واژگان منتخب و ترکیب‌بندی هنرمندانه ابیات، نشان از تسلط کامل شاعر بر زبان و قواعد شعر دارد. این اثر در زمره آثار ماندگار ادبیات فارسی قرار می‌گیرد که همچنان پس از گذشت سالیان، قادر به تأثیرگذاری بر مخاطب معاصر است.`,
        mainThemes: `محورهای اصلی و مضامین برجسته این شعر عبارتند از: ${themeText}. این موضوعات نه تنها در سطح ظاهری کلام قابل مشاهده‌اند، بلکه در عمق معنایی و لایه‌های باطنی شعر نیز حضور دارند. شاعر با خلق ارتباطی پیچیده میان این مفاهیم، شبکه‌ای از معانی مرتبط را می‌سازد که نیازمند تأمل و دقت در خوانش است. هر یک از این مضامین بازتابی از تجربیات عمیق انسانی و حکمت کهن فرهنگ ایرانی به شمار می‌آیند.`,
        imagerySymbols: `نمادپردازی و تصویرآفرینی در این شعر از ویژگی‌های بارز آن است. شاعر از مجموعه‌ای گسترده از نمادهای کلاسیک و معاصر شعر فارسی بهره می‌برد که هر کدام حامل معانی چندگانه و قابل تفسیر در سطوح مختلف هستند. این تصاویر شاعرانه نه تنها جنبه زیبایی‌شناختی دارند، بلکه ابزاری برای انتقال مفاهیم فلسفی، عرفانی، و اجتماعی به حساب می‌آیند. رابطه پیچیده میان ظاهر و باطن این نمادها، عمق و غنای معنایی شعر را چند برابر می‌کند و امکان تفسیرهای متنوع را فراهم می‌سازد.`,
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
      
      const lines = poem.text.split(/\r?\n/).filter(line => line.trim() !== '');
      const lineByLine = lines.map((line, index) => {
        let meaning = '';
        
        // Comprehensive analysis based on content
        if (line.toLowerCase().includes('love') || line.toLowerCase().includes('heart') || line.toLowerCase().includes('beloved')) {
          meaning = 'In this verse, the poet employs emotive vocabulary and affective imagery to express the depth of love and its complexities. This expression contains not only surface meaning but also mystical and philosophical layers. The use of key words in this line demonstrates the poet\'s profound emotional experience and invites multiple interpretations across literal, symbolic, and spiritual dimensions.';
        } else if (line.toLowerCase().includes('flower') || line.toLowerCase().includes('garden') || line.toLowerCase().includes('spring')) {
          meaning = 'The poet draws upon images of nature and its beauties to depict deeper concepts such as the passage of time, transient beauty, and the cycle of life. These natural metaphors are characteristic features of classical Persian poetry that present multi-layered meanings through tangible images, creating rich semantic networks that reward careful reading.';
        } else if (line.toLowerCase().includes('wine') || line.toLowerCase().includes('cup') || line.toLowerCase().includes('tavern')) {
          meaning = 'In this line, wine and the cup serve not only their literal meanings but also as symbols of knowledge, mystical states, and spiritual intoxication. This is one of the common codes in Persian poetry that invites deeper interpretations and carries multiple semantic layers, functioning as a bridge between the material and spiritual realms.';
        } else if (line.toLowerCase().includes('world') || line.toLowerCase().includes('time') || line.toLowerCase().includes('life')) {
          meaning = 'This verse contains philosophical reflections on the transient nature of worldly existence and the essence of time. The poet, with poetic and wise language, examines humanity\'s place in the universe and the impermanence of material affairs, which are central themes in the philosophical thought of classical Persian literature.';
        } else {
          // Default comprehensive analysis
          meaning = `This line employs poetic language and artistic imagery to explore themes of ${themeText}. Through careful word choice and masterful composition, the poet conveys a deep, multi-layered message that demands contemplation and close reading. This verse, alongside the other lines, constructs an interconnected network of related meanings that enriches the overall significance of the work.`;
        }
        
        return {
          original: line.trim(),
          meaning: meaning
        };
      });
      
      return {
        generalMeaning: `In this masterful work, ${poem.poet?.name || 'the poet'} demonstrates exceptional command of classical Persian poetic traditions while exploring themes of ${themeText}. This poem exemplifies the depth of thought and elegance of expression characteristic of Persian literature, employing multi-layered imagery, symbolic metaphors, and sophisticated literary devices to invite the reader on both a spiritual and intellectual journey. The carefully chosen vocabulary and artistic verse composition reflect the poet's complete mastery of language and poetic conventions. This work stands among the enduring masterpieces of Persian literature, continuing to resonate with contemporary audiences across centuries.`,
        mainThemes: `The principal themes and prominent motifs of this poem include: ${themeText}. These subjects are present not only at the surface level of the text but also in deeper semantic and esoteric layers. Through creating complex relationships between these concepts, the poet constructs an interconnected network of meanings that demands careful contemplation and close reading. Each of these themes reflects profound human experiences and ancient wisdom from Persian cultural heritage.`,
        imagerySymbols: `Symbolism and imagery are prominent features of this poem. The poet draws upon an extensive repertoire of classical and contemporary Persian poetic symbols, each carrying multiple meanings interpretable at various levels. These poetic images serve not only aesthetic purposes but also function as vehicles for conveying philosophical, mystical, and social concepts. The complex relationship between the apparent and hidden dimensions of these symbols multiplies the poem's semantic depth and richness, enabling diverse interpretations.`,
        lineByLine
      };
    }
  }, []);

  // Test server connectivity silently
  const testServerConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // More reasonable timeout
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c192d0ee/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
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

  // Enhanced explanation system with OpenAI server as primary source
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

    // Try OpenAI server API first (primary method)
    try {
      console.log(`Fetching OpenAI explanation for poem ${poem.id} in ${language}`);
      
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000); // 60 seconds for PhD-level comprehensive tafsir generation
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c192d0ee/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          poem: {
            id: poem.id,
            text: poem.text,
            title: poem.title,
            poet: poem.poet
          },
          language: language
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        
        if (result.explanation && !controller.signal.aborted) {
          console.log(`✓ OpenAI explanation received for poem ${poem.id}`);
          
          // Ensure all data fields are strings, not objects
          const sanitizedExplanation = {
            ...result.explanation,
            generalMeaning: typeof result.explanation.generalMeaning === 'string' 
              ? result.explanation.generalMeaning 
              : JSON.stringify(result.explanation.generalMeaning),
            mainThemes: typeof result.explanation.mainThemes === 'string'
              ? result.explanation.mainThemes
              : JSON.stringify(result.explanation.mainThemes),
            imagerySymbols: typeof result.explanation.imagerySymbols === 'string'
              ? result.explanation.imagerySymbols
              : JSON.stringify(result.explanation.imagerySymbols),
          };
          
          const serverResult = {
            data: sanitizedExplanation,
            loading: false,
            error: '',
            timestamp: Date.now()
          };

          setExplanationCache(prev => new Map(prev.set(cacheKey, serverResult)));
          activeRequestsRef.current.delete(cacheKey);
          
          return serverResult;
        }
      } else {
        console.warn(`Server returned error status: ${response.status}`);
      }
    } catch (error) {
      // Log but continue to fallback
      if (error.name !== 'AbortError') {
        console.warn('OpenAI server explanation failed, using local fallback:', error.message);
      } else {
        console.warn('OpenAI request timed out, using local fallback');
      }
    }

    // Fallback to local explanation only if server fails
    console.log(`Using local explanation for poem ${poem.id}`);
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

  // Prefetch poems in background for instant loading
  const prefetchEnglishPoems = async () => {
    console.log('🔄 Starting background prefetch of English poems...');
    
    try {
      // Check how many we already have cached
      const cachedIds: number[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('translated_poem_')) {
          const id = parseInt(key.replace('translated_poem_', ''));
          if (!isNaN(id)) cachedIds.push(id);
        }
      }
      
      console.log(`Found ${cachedIds.length} cached translations`);
      
      // If we have enough cached, we're good
      if (cachedIds.length >= 8) {
        console.log('✓ Already have enough cached poems');
        return;
      }
      
      // Fetch and translate poems in background
      const persianPoems = await fetchRandomPoems(10);
      if (persianPoems.length === 0) return;
      
      console.log(`Prefetching ${persianPoems.length} poems in background...`);
      
      // Translate in parallel
      const promises = persianPoems.map(poem => translatePoem(poem).catch(() => null));
      await Promise.all(promises);
      
      console.log('✓ Background prefetch complete');
    } catch (error) {
      console.warn('Background prefetch failed:', error);
    }
  };

  // Re-enabled translation with proper error handling
  const translatePoem = async (poem: Poem): Promise<Poem | null> => {
    try {
      // Check cache first for instant loading
      const cacheKey = `translated_poem_${poem.id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedPoem = JSON.parse(cached);
          console.log(`✓ Using cached translation for poem ${poem.id}`);
          return cachedPoem;
        } catch (e) {
          console.warn('Failed to parse cached translation, will fetch new');
        }
      }
      
      console.log(`Translating poem ${poem.id} to English with OpenAI`);
      
      // Get OpenAI API key from environment variable
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!openaiApiKey) {
        console.warn('OpenAI API key not configured');
        return null;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout
      
      // Optimized shorter prompt for faster translation
      const prompt = `Translate to English (preserve poetic form):

${poem.text}

Title: ${poem.title}
Poet: ${poem.poet.name}

Format:
POEM:
[translation]

TITLE:
[English title]

POET:
[English name]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Translate Persian poetry to English. Preserve poetic form. Poet names: حافظ=Hafez, مولانا=Rumi, سعدی=Saadi, فردوسی=Ferdowsi, نظامی=Nezami, عمر خیام=Omar Khayyam. Titles: غزل=Ghazal, رباعی=Quatrain, مثنوی=Masnavi.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.6
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`OpenAI API error: ${response.status}`);
        return null;
      }

      const result = await response.json();
      const translation = result.choices[0]?.message?.content?.trim();
      
      if (!translation) {
        console.warn('OpenAI returned no translation');
        return null;
      }

      // Parse the response to extract poem, title, and poet name
      let translatedText = translation;
      let translatedTitle = poem.title; // Default to original
      let poetName = poem.poet.name; // Default to original
      
      // Try to extract poem, title, and poet from structured response
      const poemMatch = translation.match(/POEM:\s*([\s\S]*?)(?=TITLE:|POET:|$)/);
      const titleMatch = translation.match(/TITLE:\s*(.*?)(?:\n|$)/);
      const poetMatch = translation.match(/POET:\s*(.*?)(?:\n|$)/);
      
      if (poemMatch && poemMatch[1]) {
        translatedText = poemMatch[1].trim();
      }
      
      if (titleMatch && titleMatch[1]) {
        translatedTitle = titleMatch[1].trim();
      }
      
      if (poetMatch && poetMatch[1]) {
        poetName = poetMatch[1].trim();
      } else {
        // Fallback: try to detect and translate common Persian poet names
        const persianToEnglish: Record<string, string> = {
          'حافظ': 'Hafez',
          'مولانا': 'Rumi', 
          'سعدی': 'Saadi',
          'فردوسی': 'Ferdowsi',
          'نظامی': 'Nezami',
          'عمر خیام': 'Omar Khayyam',
          'خیام': 'Khayyam',
          'عطار': 'Attar',
          'جامی': 'Jami',
          'رودکی': 'Rudaki'
        };
        
        for (const [persian, english] of Object.entries(persianToEnglish)) {
          if (poem.poet.name.includes(persian)) {
            poetName = english;
            break;
          }
        }
      }

      // Create translated poem object
      const translatedPoem = {
        id: poem.id + 1000, // Offset to avoid ID conflicts
        title: translatedTitle,
        text: translatedText,
        htmlText: translatedText.replace(/\n/g, '<br/>'),
        poet: {
          id: poem.poet.id,
          name: poetName,
          fullName: poetName
        }
      };

      // Cache the translation for instant loading next time
      try {
        localStorage.setItem(cacheKey, JSON.stringify(translatedPoem));
        console.log(`✓ Translation cached for poem ${poem.id}`);
      } catch (e) {
        console.warn('Failed to cache translation:', e);
      }

      console.log(`✓ Translation successful for poem ${poem.id}`, 'Poet:', translatedPoem.poet.name);
      return translatedPoem;

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.warn('Translation request timed out');
      } else {
        console.warn('Translation error:', error);
      }
      return null;
    }
  };

  // Load initial poems with conservative approach
  const loadInitialPoems = async (targetLanguage?: Language) => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingMessage(targetLanguage === 'fa' ? 'بارگذاری اشعار...' : 'Loading poems...');
    const langToUse = targetLanguage || language;
    console.log('Loading initial poems for language:', langToUse);
    
    try {
      if (langToUse === 'fa') {
        console.log('Loading Persian poems from API...');
        setLoadingProgress(20);
        
        // Fetch Persian poems from API (reduced to 8 for consistency)
        const apiPoems = await Promise.race([
          fetchRandomPoems(8),
          new Promise<Poem[]>((resolve) => 
            setTimeout(() => {
              console.log('Initial load timeout');
              resolve([]);
            }, 15000)
          )
        ]);
        
        if (apiPoems.length > 0) {
          console.log(`✓ Loaded ${apiPoems.length} Persian poems from API`);
          setLoadingProgress(90);
          setPoems(apiPoems);
          setPersianPoemsCache(apiPoems); // Cache for language switching
          setUsingMockData(false);
          setLoadingProgress(100);
          setTimeout(() => setLoading(false), 300);
          
          // Pre-translate in background for instant language switching
          setTimeout(() => {
            console.log('🔄 Pre-translating poems in background for instant switch...');
            apiPoems.forEach(poem => {
              translatePoem(poem).catch(() => null);
            });
          }, 3000);
        } else {
          // Retry once if failed
          console.log('Retrying Persian poem fetch...');
          const retryPoems = await fetchRandomPoems(8);
          if (retryPoems.length > 0) {
            console.log(`✓ Loaded ${retryPoems.length} Persian poems on retry`);
            setPoems(retryPoems);
            setPersianPoemsCache(retryPoems); // Cache for language switching
            setUsingMockData(false);
            setLoading(false);
            
            // Pre-translate in background
            setTimeout(() => {
              console.log('🔄 Pre-translating retry poems in background...');
              retryPoems.forEach(poem => {
                translatePoem(poem).catch(() => null);
              });
            }, 3000);
          } else {
            console.error('Failed to load Persian poems from API after retry');
            setLoading(false);
          }
        }
      } else {
        // English mode: Load from cache first for instant 2-3s loading
        console.log('Loading English poems - checking cache...');
        setLoadingProgress(10);
        setLoadingMessage(langToUse === 'fa' ? 'جستجوی ترجمه‌ها...' : 'Checking translations...');
        
        // Get cached translations
        const cachedPoems: Poem[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('translated_poem_')) {
            try {
              const poem = JSON.parse(localStorage.getItem(key) || '');
              if (poem) cachedPoems.push(poem);
            } catch (e) {
              // Skip invalid cache entries
            }
          }
        }
        
        if (cachedPoems.length >= 8) {
          // We have enough cached poems - show them instantly!
          console.log(`✓ Loading ${cachedPoems.length} cached poems instantly`);
          setLoadingProgress(80);
          setLoadingMessage(langToUse === 'fa' ? 'آماده‌سازی نمایش...' : 'Preparing display...');
          const poemsToShow = cachedPoems.slice(0, 8);
          setPoems(poemsToShow);
          setUsingMockData(false);
          setLoadingProgress(100);
          setTimeout(() => setLoading(false), 300);
          
          // Try to load the original Persian poems from cache if available
          // This helps with language switching
          if (persianPoemsCache.length === 0) {
            // Load Persian originals in background
            setTimeout(async () => {
              try {
                const persianPoems = await fetchRandomPoems(8);
                if (persianPoems.length > 0) {
                  setPersianPoemsCache(persianPoems);
                  console.log('✓ Cached Persian poems for language switching');
                }
              } catch (e) {
                console.warn('Failed to cache Persian poems:', e);
              }
            }, 2000);
          }
          
          // Continue loading more in background
          setTimeout(() => {
            console.log('🔄 Loading additional poems in background...');
            loadMorePoems();
          }, 1000);
          return;
        }
        
        // Not enough cached - fetch and translate
        console.log(`Only ${cachedPoems.length} cached poems, fetching more...`);
        setLoadingProgress(30);
        setLoadingMessage(langToUse === 'fa' ? 'دریافت اشعار جدید...' : 'Fetching new poems...');
        
        // Show cached poems immediately while loading more
        if (cachedPoems.length > 0) {
          console.log(`Showing ${cachedPoems.length} cached poems while loading more...`);
          setPoems(cachedPoems);
          setUsingMockData(false);
        }
        
        // Fetch poems to translate
        const neededCount = Math.max(8 - cachedPoems.length, 5);
        setLoadingProgress(40);
        const persianPoems = await Promise.race([
          fetchRandomPoems(neededCount),
          new Promise<Poem[]>((resolve) => 
            setTimeout(() => {
              console.log('Persian fetch timeout for translation');
              resolve([]);
            }, 10000)
          )
        ]);
        
        if (persianPoems.length > 0) {
          console.log(`Fetched ${persianPoems.length} Persian poems, starting progressive translation...`);
          setLoadingProgress(50);
          setLoadingMessage(langToUse === 'fa' ? 'ترجمه اشعار...' : 'Translating poems...');
          
          // Cache Persian poems for language switching
          setPersianPoemsCache(persianPoems);
          
          // Progressive loading: show poems as they translate (batches of 2)
          const allTranslated: Poem[] = [...cachedPoems];
          let firstBatchShown = false;
          const totalToTranslate = persianPoems.length;
          
          for (let i = 0; i < persianPoems.length; i += 2) {
            const batch = persianPoems.slice(i, i + 2);
            const batchPromises = batch.map(poem => 
              Promise.race([
                translatePoem(poem),
                new Promise<Poem | null>((resolve) => 
                  setTimeout(() => resolve(null), 15000)
                )
              ]).catch(() => null)
            );
            
            const batchResults = await Promise.all(batchPromises);
            const batchPoems = batchResults.filter((p): p is Poem => p !== null);
            
            allTranslated.push(...batchPoems);
            
            // Update progress
            const progressPercent = 50 + ((i + 2) / totalToTranslate) * 40;
            setLoadingProgress(Math.min(progressPercent, 90));
            
            // Show first batch immediately for instant feedback
            if (!firstBatchShown && allTranslated.length > 0) {
              console.log(`✓ Showing first ${allTranslated.length} poems`);
              setPoems([...allTranslated]);
              setUsingMockData(false);
              setLoading(false);
              firstBatchShown = true;
            } else if (batchPoems.length > 0) {
              console.log(`✓ Added ${batchPoems.length} more (${allTranslated.length} total)`);
              setPoems([...allTranslated]);
            }
          }
          
          if (allTranslated.length > 0) {
            console.log(`✓ Completed loading ${allTranslated.length} poems`);
            
            // Preload more poems in the background
            setTimeout(() => {
              console.log('🔄 Preloading additional poems in background...');
              loadMorePoems();
            }, 2000);
          } else {
            // If no new translations, just use cached
            if (cachedPoems.length > 0) {
              setLoading(false);
            } else {
              console.error('Failed to translate any poems');
              setLoading(false);
            }
          }
        } else {
          // If fetch failed, use cached if available
          if (cachedPoems.length > 0) {
            setLoading(false);
          } else {
            console.error('Failed to fetch Persian poems for translation');
            setLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial poems:', String(error));
      setLoading(false);
    }
  };

  // Load additional poems when reaching the end
  const loadMorePoems = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    console.log('Loading additional poems for language:', language);
    
    try {
      if (language === 'fa') {
        // Persian mode - fetch from API
          console.log('Fetching more Persian poems from API...');
          
          const apiPoems = await Promise.race([
          fetchRandomPoems(10), // Batch size for loading more
            new Promise<Poem[]>((resolve) => 
              setTimeout(() => {
              console.log('Load more timeout');
                resolve([]);
              }, 15000) // 15 second timeout for additional loads
            )
          ]);
          
          if (apiPoems.length > 0) {
          console.log(`✓ Loaded ${apiPoems.length} more Persian poems from API`);
            setPoems(prev => [...prev, ...apiPoems]);
        } else {
          console.error('Failed to load more Persian poems');
          setHasMore(false);
        }
      } else {
        // English mode - fetch Persian poems and translate them
        console.log('Fetching and translating more Persian poems to English...');
          
          const persianPoems = await Promise.race([
          fetchRandomPoems(5),
            new Promise<Poem[]>((resolve) => 
              setTimeout(() => {
              console.log('Persian fetch timeout for translation');
                resolve([]);
            }, 10000)
            )
          ]);
          
          if (persianPoems.length > 0) {
          console.log(`Translating ${persianPoems.length} Persian poems to English in parallel...`);
          
          // Translate poems in parallel for faster loading
          const translationPromises = persianPoems.map(poem => 
            Promise.race([
                  translatePoem(poem),
                  new Promise<Poem | null>((resolve) => 
                setTimeout(() => resolve(null), 15000)
              )
            ]).catch(error => {
                console.warn('Translation failed for poem:', poem.id, error);
              return null;
            })
          );
          
          const results = await Promise.all(translationPromises);
          const translatedPoems = results.filter((p): p is Poem => p !== null);
            
            if (translatedPoems.length > 0) {
            console.log(`✓ Successfully translated ${translatedPoems.length} more poems to English in parallel`);
              setPoems(prev => [...prev, ...translatedPoems]);
          } else {
            console.error('Failed to translate any poems');
            setHasMore(false);
          }
        } else {
          console.error('Failed to fetch Persian poems for translation');
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more poems:', error);
      setHasMore(false);
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
    

    // More sensitive swipe detection - reduced threshold and increased time limit
    if (Math.abs(deltaY) > 40 && deltaTime < 800) {
      e.preventDefault();
      
      if (deltaY > 0) {
        // Swiping up - go to next poem
        if (currentIndex < poems.length - 1) {
          navigateToPoem(currentIndex + 1);
        } else {
        }
        
        // Load more if near end (within 5 poems of the end)
        if (currentIndex >= poems.length - 5 && !loadingMore) {
          loadMorePoems();
        }
      } else if (deltaY < 0) {
        // Swiping down - go to previous poem
        if (currentIndex > 0) {
          navigateToPoem(currentIndex - 1);
        } else {
        }
      }
    } else {
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

  // Handle more button click - require auth to view explanation
  const handleMoreOpen = () => {
    // TEMPORARY: Allow access without login for testing
    // TODO: Re-enable authentication check before production
    setMoreSheetOpen(true);
    
    // if (user) {
    //   setMoreSheetOpen(true);
    // } else {
    //   setAuthSheetOpen(true);
    // }
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

  // Prefetch English poems when language selection screen is shown
  useEffect(() => {
    if (!hasSelectedLanguage && !isLoadingPreference) {
      console.log('Language selection screen shown - starting background prefetch');
      // Start prefetching after a short delay to not block UI
      setTimeout(() => {
        prefetchEnglishPoems();
      }, 1000);
    }
  }, [hasSelectedLanguage, isLoadingPreference]);

  // Handle language selection from selection screen
  const handleLanguageSelect = async (selectedLanguage: 'fa' | 'en') => {
    console.log('Language selected:', selectedLanguage);
    console.log('Saving language preference to localStorage and server...');
    
    // Save the preference (this updates both localStorage and context state)
    await saveLanguagePreference(selectedLanguage, user?.id);
    
    console.log('Language preference saved. Current language state:', language);
    console.log('localStorage language:', localStorage.getItem('app-language'));
    
    // Wait a bit longer for context state to update, then load poems
    setTimeout(() => {
      console.log('Starting to load poems for selected language:', selectedLanguage);
      console.log('Context language state is now:', language);
      loadInitialPoems(selectedLanguage);
    }, 200); // Increased delay to ensure state update
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage: 'fa' | 'en') => {
    if (newLanguage === language) return;

    console.log(`Language changed to: ${newLanguage}`);
    
    // Save the new preference
    await saveLanguagePreference(newLanguage, user?.id);
    
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
    
    // Reset current index but keep poems
    setCurrentIndex(0);
    
    // If we have cached Persian poems, reuse them for instant language switch
    if (persianPoemsCache.length > 0) {
      console.log(`✓ Reusing ${persianPoemsCache.length} cached poems for language switch`);
      
      if (newLanguage === 'en') {
        // Switching to English - translate the cached Persian poems
        console.log('Translating cached Persian poems to English with progressive loading...');
        
        // Show loading immediately
        setLoading(true);
        setLoadingProgress(10);
        setLoadingMessage(newLanguage === 'fa' ? 'ترجمه اشعار...' : 'Translating poems...');
        
        // Translate and show poems progressively as they complete
        const translatedPoems: Poem[] = [];
        let firstBatchLoaded = false;
        const totalPoems = persianPoemsCache.length;
        
        // Translate in batches of 3 for faster perceived loading
        for (let i = 0; i < persianPoemsCache.length; i += 3) {
          const batch = persianPoemsCache.slice(i, i + 3);
          const batchPromises = batch.map(poem => translatePoem(poem).catch(() => null));
          const batchResults = await Promise.all(batchPromises);
          const batchPoems = batchResults.filter((p): p is Poem => p !== null);
          
          translatedPoems.push(...batchPoems);
          
          // Update progress
          const progressPercent = 10 + ((i + 3) / totalPoems) * 80;
          setLoadingProgress(Math.min(progressPercent, 90));
          
          // Show first batch immediately (instant feedback!)
          if (!firstBatchLoaded && translatedPoems.length > 0) {
            console.log(`✓ Showing first ${translatedPoems.length} poems immediately`);
            setPoems([...translatedPoems]);
            setLoadingProgress(100);
            setLoading(false);
            firstBatchLoaded = true;
          } else if (translatedPoems.length > 0) {
            // Update with more poems as they load
            console.log(`✓ Added ${batchPoems.length} more poems (${translatedPoems.length} total)`);
            setPoems([...translatedPoems]);
          }
        }
        
        console.log(`✓ Completed switch to English with ${translatedPoems.length} poems`);
      } else {
        // Switching to Farsi - show the original Persian poems instantly
        console.log('Showing original Persian poems');
        setPoems(persianPoemsCache);
        setLoading(false);
      }
      
      return;
    }
    
    // No cache - reset and load fresh poems
    console.log('No cached poems - loading fresh content');
    setUsedPoemIds(new Set());
    setPoems([]);
    setUsingMockData(false);
    setHasMore(true);
    
    // Reset API failure tracking
    setApiFailureCount(0);
    setLastApiFailureTime(0);
    
    // Load poems for the new language
    setTimeout(() => {
      loadInitialPoems(newLanguage);
    }, 100);
  };

  // Load saved language preference from server if user is logged in
  useEffect(() => {
    const loadSavedLanguagePreference = async () => {
      // Only load from server if user is logged in AND we don't have a local preference
      if (user?.id && !hasSelectedLanguage && !isLoadingPreference) {
        try {
          console.log('Loading saved language preference from server for user:', user.id);
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-c192d0ee/user-preference/${user.id}/language`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.value && ['fa', 'en'].includes(data.value)) {
              console.log('✓ Loaded saved language preference from server:', data.value);
              // Use saveLanguagePreference to update both state and localStorage
              await saveLanguagePreference(data.value, user.id);
            }
          }
        } catch (error) {
          console.warn('Failed to load language preference from server:', error);
        }
      }
    };

    loadSavedLanguagePreference();
  }, [user?.id, hasSelectedLanguage, isLoadingPreference]);

  // Check for password reset redirect on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const isPasswordReset = urlParams.get('reset') === 'true';
    const hasToken = hashParams.get('access_token') || urlParams.get('access_token');
    
    if (isPasswordReset && hasToken) {
      // Open auth sheet for password reset
      setAuthSheetOpen(true);
    }
  }, []);

  // Global error handler for auth issues - simplified and less aggressive
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error;
      if (error && (
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('refresh_token_not_found') ||
        error.name === 'AuthApiError'
      )) {
        console.log('Global auth error detected, letting AuthContext handle it');
        // Just prevent the error from propagating, let AuthContext handle the refresh
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
        console.log('Global auth promise rejection detected, letting AuthContext handle it');
        // Just prevent the error from propagating, let AuthContext handle the refresh
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Load initial data and test connectivity - only after language is selected
  useEffect(() => {
    // Don't auto-load if language hasn't been selected yet
    if (!hasSelectedLanguage || isLoadingPreference) {
      console.log('Skipping auto-load - waiting for language selection');
      return;
    }

    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      // Only load if we don't have poems yet
      if (poems.length > 0) {
        console.log('Poems already loaded, skipping auto-load');
        return;
      }
      
      console.log('Auto-loading poems for language:', language);
      
      try {
        // Test server connectivity silently in background
        testServerConnectivity().then(isConnected => {
          console.log('Server connectivity:', isConnected ? 'available' : 'unavailable');
        }).catch(() => {
          console.warn('Server connectivity test failed');
        });
        
        await loadInitialPoems(language);
      } catch (error) {
        console.error('Error in loadData:', error);
          setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
      
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
  }, [testServerConnectivity, hasSelectedLanguage, isLoadingPreference, language]);

  // Note: Removed auto-reload on language change to prevent conflicts
  // Language changes are now handled explicitly in handleLanguageChange

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
    // Only set up event listeners if we're past language selection and loading
    if (isLoadingPreference || !hasSelectedLanguage || loading) {
      return;
    }

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
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleKeyDown, isLoadingPreference, hasSelectedLanguage, loading]);

  // Show loading screen while checking for saved language preference
  if (isLoadingPreference) {
    console.log('Showing loading screen - isLoadingPreference:', isLoadingPreference);
    return <DelightfulLoader language={language} message={language === 'fa' ? 'بارگذاری تنظیمات...' : 'Loading preferences...'} />;
  }

  // Show language selection screen if user hasn't selected a language yet
  if (!hasSelectedLanguage) {
    console.log('Showing language selection screen - hasSelectedLanguage:', hasSelectedLanguage);
    console.log('Current language from context:', language);
    console.log('localStorage language:', localStorage.getItem('app-language'));
    return <LanguageSelectionScreen onLanguageSelect={handleLanguageSelect} />;
  }

  // Log current state when app is ready
  console.log('App ready - Language:', language, 'hasSelectedLanguage:', hasSelectedLanguage, 'Poems count:', poems.length);

  if (loading) {
    return <DelightfulLoader language={language} message={loadingMessage} progress={loadingProgress} />;
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-background relative overflow-hidden app-container"
      style={{ 
        touchAction: 'manipulation', // Optimized touch handling for swipe gestures
        height: '100dvh', // Use dynamic viewport height for better mobile support
        userSelect: 'none', // Prevent text selection during swipes
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {/* Enhanced swipe feedback overlay */}

      {/* Debug info overlay - removed for production */}
      {/* {isDragging && (
        <div className="absolute top-20 right-4 z-50 bg-black/50 text-white text-xs p-2 rounded pointer-events-none">
          <div>Current: {currentIndex + 1}/{poems.length}</div>
          <div>Direction: {swipeDirection || 'none'}</div>
          <div>Dragging: {isDragging ? 'yes' : 'no'}</div>
        </div>
      )} */}

      {/* Animated Hand Background */}
      <AnimatedHandBackground />
      
      {/* Video Playlist - Audio Only (hidden) */}
      <div className="hidden">
        <VideoPlaylist ref={videoPlaylistRef} isMuted={isMuted} />
      </div>

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
      {poems.length > 0 && poems[currentIndex] && poems[currentIndex].poet && (
        <div 
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-40 ${theme === 'dark' ? 'text-white bg-black/50' : 'text-black bg-white/50'} text-sm text-center backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg`}
          dir={isRTL ? "rtl" : "ltr"}
          style={{
            textShadow: theme === 'dark' 
              ? '1px 1px 2px rgba(0, 0, 0, 0.8)'
              : '1px 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          {poems[currentIndex].poet.name || (language === 'en' ? 'Unknown Poet' : 'نامعلوم')}
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