import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ScrollArea } from "./ui/scroll-area";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { toFarsiNumber } from "../utils/numberUtils";

// Theme-aware iOS-style grabber component
const ThemedGrabber = ({ shouldPulse = false }: { shouldPulse?: boolean }) => (
  <div className="flex flex-col items-center py-1 px-0 relative">
    <div className={`bg-muted-foreground h-[6px] rounded-full shrink-0 w-[40px] shadow-lg border border-muted-foreground/20 ${
      shouldPulse ? 'animate-pulse' : ''
    }`} />
  </div>
);

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

// Comprehensive tafsir interface
interface ComprehensiveTafsir {
  meta?: {
    poet?: string;
    era?: string;
    form?: 'ghazal' | 'rubai' | 'masnavi' | 'nimaei' | 'free' | 'unknown';
    meter?: string;
    rhyme_radif?: string;
    source?: string;
  };
  overall_meaning?: {
    one_sentence?: string;
    paragraph?: string;
    key_claims?: Array<{ claim: string; evidence_beyts: number[] }>;
  };
  themes?: Array<{ 
    theme: string; 
    explanation: string; 
    evidence_beyts: number[] 
  }>;
  symbols?: Array<{
    symbol: string;
    meanings: string[];
    evidence_terms: string[];
    example_beyts: number[];
  }>;
  devices?: Array<{
    device: 'metaphor' | 'allusion' | 'ambiguity' | 'antithesis' | 'pun' | 'simile' | 'symbolism' | 'irony';
    quote: string;
    beyt: number;
    explanation: string;
  }>;
  per_beyt?: Array<{
    beyt_index: number;
    literal: string;
    readings: Array<{
      type: 'symbolic' | 'mystical' | 'ethical' | 'social' | 'romantic';
      text: string;
      confidence: number;
    }>;
    notes?: string;
  }>;
  glossary?: Array<{
    term: string;
    lemma: string;
    note: string;
  }>;
  uncertainty?: string;
  translation?: {
    en: string;
    register: 'faithful' | 'poetic' | 'literal';
  };
}

interface ExplanationData {
  lineByLine?: Array<{ original: string; meaning: string }>;
  generalMeaning?: string;
  mainThemes?: string;
  imagerySymbols?: string;
  fullTafsir?: ComprehensiveTafsir; // Add comprehensive tafsir data
}

interface DraggableMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poem?: Poem;
  cachedExplanation?: {
    data: ExplanationData;
    loading: boolean;
    error: string;
    timestamp: number;
  };
  onFetchExplanation: (poem: Poem, forceRefresh?: boolean) => Promise<{
    data: ExplanationData;
    loading: boolean;
    error: string;
    timestamp: number;
  }>;
}

export function DraggableMoreSheet({
  open,
  onOpenChange,
  poem,
  cachedExplanation,
  onFetchExplanation,
}: DraggableMoreSheetProps) {
  const { t, isRTL, language } = useLanguage();
  
  // AI explanation state - now structured with comprehensive tafsir support
  const [explanationData, setExplanationData] = useState<ExplanationData>({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string>('');
  const [activeExplanationTab, setActiveExplanationTab] = useState<'lineByLine' | 'general' | 'themes' | 'imagery' | 'devices' | 'meta'>('lineByLine');
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [initialHeight, setInitialHeight] = useState(70);
  const [currentHeight, setCurrentHeight] = useState(70); // Start at 70%
  const [showPulse, setShowPulse] = useState(true);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Snap points (as percentages of viewport height)
  const SNAP_POINTS = [40, 70, 90];
  const CLOSE_THRESHOLD = 20; // Below this percentage, the sheet closes

  // Load explanation when sheet opens and poem changes
  useEffect(() => {
    if (open && poem) {
      setCurrentHeight(70); // Reset to default height when opening
      setInitialHeight(70);
      setShowPulse(true);
      
      // Check for cached explanation first
      if (cachedExplanation) {
        if (cachedExplanation.loading) {
          setLoadingExplanation(true);
          setExplanationData({});
          setExplanationError('');
        } else if (cachedExplanation.error) {
          setLoadingExplanation(false);
          setExplanationData({});
          setExplanationError(cachedExplanation.error);
        } else if (Object.keys(cachedExplanation.data).length > 0) {
          setLoadingExplanation(false);
          setExplanationData(cachedExplanation.data);
          setExplanationError('');
        } else {
          // No cached data, fetch explanation (use local method)
          handleFetchExplanation(false);
        }
      } else {
        // No cache available, fetch explanation (use local method)
        handleFetchExplanation(false);
      }
      
      // Stop pulsing after 3 seconds
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowPulse(false);
      setExplanationData({});
      setExplanationError('');
    }
  }, [open, poem?.id, language, cachedExplanation]);

  // Update explanation state when cached data changes
  useEffect(() => {
    if (open && poem && cachedExplanation) {
      if (cachedExplanation.loading) {
        setLoadingExplanation(true);
        setExplanationError('');
      } else if (cachedExplanation.error) {
        setLoadingExplanation(false);
        setExplanationError(cachedExplanation.error);
      } else if (Object.keys(cachedExplanation.data).length > 0) {
        setLoadingExplanation(false);
        setExplanationData(cachedExplanation.data);
        setExplanationError('');
      }
    }
  }, [cachedExplanation, open, poem]);

  // Handle fetching explanation using the parent's fetchExplanation function
  const handleFetchExplanation = async (forceRefresh = false) => {
    if (!poem) return;

    try {
      const result = await onFetchExplanation(poem, forceRefresh);
      
      // Update local state based on the result
      setLoadingExplanation(result.loading);
      setExplanationData(result.data);
      setExplanationError(result.error);
    } catch (error) {
      setLoadingExplanation(false);
      setExplanationError(t.explanationError || 'Error generating explanation');
    }
  };

  // Drag handlers for sheet resize
  const handleDragStart = useCallback((clientY: number) => {
    console.log('Drag start at:', clientY);
    setIsDragging(true);
    setDragStartY(clientY);
    setInitialHeight(currentHeight);
    
    // Disable body scroll during drag
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }, [currentHeight]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - dragStartY;
    const viewportHeight = window.innerHeight;
    const heightChange = (deltaY / viewportHeight) * 100;
    
    console.log('Drag move - deltaY:', deltaY, 'heightChange:', heightChange);
    
    // Calculate new height based on initial height and drag distance
    // Positive deltaY means dragging down, so reduce height
    const newHeight = Math.max(10, Math.min(95, initialHeight - heightChange));
    
    console.log('New height:', newHeight);
    
    // Apply the height immediately during drag
    if (sheetRef.current) {
      sheetRef.current.style.height = `${newHeight}vh`;
      sheetRef.current.style.transition = 'none'; // Disable transition during drag
    }
  }, [isDragging, dragStartY, initialHeight]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    console.log('Drag end');

    const currentSheetHeight = sheetRef.current ? 
      parseFloat(sheetRef.current.style.height) : currentHeight;

    setIsDragging(false);
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    // Check if should close
    if (currentSheetHeight < CLOSE_THRESHOLD) {
      console.log('Closing sheet - height below threshold:', currentSheetHeight);
      onOpenChange(false);
      return;
    }

    // Find closest snap point
    const closestSnapPoint = SNAP_POINTS.reduce((prev, curr) => 
      Math.abs(curr - currentSheetHeight) < Math.abs(prev - currentSheetHeight) ? curr : prev
    );

    console.log('Snapping to:', closestSnapPoint);
    setCurrentHeight(closestSnapPoint);

    // Animate to snap point
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      sheetRef.current.style.height = `${closestSnapPoint}vh`;
      
      // Remove transition after animation
      setTimeout(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transition = '';
        }
      }, 300);
    }
  }, [isDragging, currentHeight, onOpenChange]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Mouse down at:', e.clientY);
    handleDragStart(e.clientY);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      handleDragMove(e.clientY);
    }
  }, [handleDragMove, isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      handleDragEnd();
    }
  }, [handleDragEnd, isDragging]);

  // Touch event handlers for drag
  const handleTouchStartDrag = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Touch start at:', e.touches[0].clientY);
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const handleTouchMoveDrag = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      handleDragMove(e.touches[0].clientY);
    }
  }, [handleDragMove, isDragging]);

  const handleTouchEndDrag = useCallback((e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      handleDragEnd();
    }
  }, [handleDragEnd, isDragging]);

  // Global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      const options = { passive: false, capture: true };
      
      document.addEventListener('mousemove', handleMouseMove, options);
      document.addEventListener('mouseup', handleMouseUp, options);
      document.addEventListener('touchmove', handleTouchMoveDrag, options);
      document.addEventListener('touchend', handleTouchEndDrag, options);
      document.addEventListener('touchcancel', handleTouchEndDrag, options);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleMouseUp, { capture: true });
        document.removeEventListener('touchmove', handleTouchMoveDrag, { capture: true });
        document.removeEventListener('touchend', handleTouchEndDrag, { capture: true });
        document.removeEventListener('touchcancel', handleTouchEndDrag, { capture: true });
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMoveDrag, handleTouchEndDrag]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Draggable Sheet */}
      <motion.div
        ref={sheetRef}
        initial={{ y: "100%", height: "70vh" }}
        animate={{ y: 0, height: `${currentHeight}vh` }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border backdrop-blur-xl rounded-t-xl overflow-hidden flex flex-col ${
          isDragging ? 'shadow-2xl' : ''
        }`}
        style={{ 
          height: `${currentHeight}vh`,
          maxHeight: '95vh',
          minHeight: '20vh',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
      >
        {/* iOS-style Drag Handle Area */}
        <div
          className={`flex-shrink-0 py-5 px-6 select-none transition-all duration-200 min-h-[56px] flex flex-col items-center justify-center border-b border-border/50 ${
            isDragging 
              ? 'cursor-grabbing bg-accent/40' 
              : 'cursor-grab hover:bg-accent/20 active:bg-accent/30'
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStartDrag}
          style={{ 
            touchAction: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          }}
        >
          {/* iOS-style Grabber with enhanced visibility */}
          <div className={`transition-all duration-200 ${isDragging ? 'opacity-70 scale-110' : 'opacity-100 hover:scale-105'}`}>
            <ThemedGrabber shouldPulse={showPulse && !isDragging} />
          </div>
          
          {/* Subtle hint text */}
          <div className={`text-muted-foreground/50 text-xs mt-2`} dir={isRTL ? "rtl" : "ltr"}>
            {isDragging ? t.dragging : t.dragToResize}
          </div>
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border/50">
          <div className={isRTL ? "text-right" : "text-left"} dir={isRTL ? "rtl" : "ltr"}>
            <h2 className="text-foreground text-xl font-medium">
              {t.poemExplanation || 'تفسیر'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {t.aiDisclaimer || 'تفسیر زیر توسط هوش مصنوعی تولید شده و ممکن است حاوی خطا باشد'}
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div 
          className="flex-1 overflow-hidden relative"
          style={{ 
            touchAction: isDragging ? 'none' : 'auto',
            pointerEvents: isDragging ? 'none' : 'auto'
          }}
        >
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6" dir={isRTL ? "rtl" : "ltr"}>
              {poem ? (
                <>
                  {/* Poem Title */}
                  <div className="space-y-2">
                    <h3 className={`text-foreground text-lg font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.title || 'Title'}
                    </h3>
                    <p className={`text-muted-foreground bg-muted/30 rounded-lg p-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {poem.title}
                    </p>
                  </div>

                  {/* Poet Information */}
                  <div className="space-y-2">
                    <h3 className={`text-foreground text-lg font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t.poet || 'Poet'}
                    </h3>
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                      <p className={`text-foreground font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {poem.poet.name}
                      </p>
                      {poem.poet.fullName !== poem.poet.name && (
                        <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                          {poem.poet.fullName}
                        </p>
                      )}
                    </div>
                  </div>



                  {/* AI Explanation with Tabs */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className={`text-foreground text-lg font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t.poemExplanation || 'تفسیر'}
                      </h3>

                    </div>
                    
                    {loadingExplanation ? (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center space-x-2" dir={isRTL ? "rtl" : "ltr"}>
                            <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                            <span className="text-muted-foreground">
                              {t.generatingAIExplanation || 'در حال تولید تفسیر با هوش مصنوعی...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : explanationError ? (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-center py-8">
                          <div className="text-destructive mb-2">
                            {explanationError}
                          </div>
                          <button
                            onClick={() => handleFetchExplanation(false)}
                            className="text-primary hover:text-primary/80 text-sm underline"
                          >
                            {t.tryAgain || 'Try again'}
                          </button>
                        </div>
                      </div>
                    ) : Object.keys(explanationData).length > 0 ? (
                      <>
                        {/* Explanation Tabs - بیت به بیت first as requested */}
                        <div className="flex flex-wrap gap-2 mb-4" dir={isRTL ? "rtl" : "ltr"}>
                          <button
                            onClick={() => setActiveExplanationTab('lineByLine')}
                            className={`px-3 py-2 text-sm rounded-lg transition-all ${
                              activeExplanationTab === 'lineByLine'
                                ? 'bg-foreground text-background'
                                : 'bg-muted/50 text-foreground hover:bg-muted'
                            }`}
                          >
                            {isRTL ? 'بیت به بیت' : 'Line by Line'}
                          </button>
                          <button
                            onClick={() => setActiveExplanationTab('general')}
                            className={`px-3 py-2 text-sm rounded-lg transition-all ${
                              activeExplanationTab === 'general'
                                ? 'bg-foreground text-background'
                                : 'bg-muted/50 text-foreground hover:bg-muted'
                            }`}
                          >
                            {isRTL ? 'معنای کلی' : 'General'}
                          </button>
                          <button
                            onClick={() => setActiveExplanationTab('themes')}
                            className={`px-3 py-2 text-sm rounded-lg transition-all ${
                              activeExplanationTab === 'themes'
                                ? 'bg-foreground text-background'
                                : 'bg-muted/50 text-foreground hover:bg-muted'
                            }`}
                          >
                            {isRTL ? 'موضوعات' : 'Themes'}
                          </button>
                          <button
                            onClick={() => setActiveExplanationTab('imagery')}
                            className={`px-3 py-2 text-sm rounded-lg transition-all ${
                              activeExplanationTab === 'imagery'
                                ? 'bg-foreground text-background'
                                : 'bg-muted/50 text-foreground hover:bg-muted'
                            }`}
                          >
                            {isRTL ? 'تصاویر و نمادها' : 'Imagery & Symbols'}
                          </button>
                          {/* Show advanced tabs only if comprehensive tafsir data is available */}
                          {explanationData.fullTafsir && (
                            <>
                              <button
                                onClick={() => setActiveExplanationTab('devices')}
                                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                                  activeExplanationTab === 'devices'
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                }`}
                              >
                                {isRTL ? 'صناعات ادبی' : 'Literary Devices'}
                              </button>
                              <button
                                onClick={() => setActiveExplanationTab('meta')}
                                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                                  activeExplanationTab === 'meta'
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted/50 text-foreground hover:bg-muted'
                                }`}
                              >
                                {isRTL ? 'اطلاعات کلی' : 'Meta Info'}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Refresh Button for AI Enhancement */}
                        <div className={`mb-3 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                          <button
                            onClick={() => handleFetchExplanation(true)}
                            disabled={loadingExplanation}
                            className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            dir={isRTL ? "rtl" : "ltr"}
                            title={isRTL ? 'تحلیل عمیق با هوش مصنوعی (۳۰-۶۰ ثانیه)' : 'Deep AI Analysis (30-60 seconds)'}
                          >
                            {loadingExplanation ? (
                              <>
                                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <span>{isRTL ? 'تحلیل هوش مصنوعی...' : 'AI Analyzing...'}</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{isRTL ? 'تفسیر هوشمند' : 'AI Analysis'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Explanation Content */}
                        <div className="bg-muted/30 rounded-lg p-4">
                          {activeExplanationTab === 'general' && explanationData.generalMeaning && (
                            <div 
                              className={`text-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-left'} prose prose-sm max-w-none`}
                              style={{
                                fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                lineHeight: '1.8'
                              }}
                              dir={isRTL ? "rtl" : "ltr"}
                              dangerouslySetInnerHTML={{
                                __html: explanationData.generalMeaning
                                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--foreground); font-weight: 600;">$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em style="color: var(--muted-foreground); font-style: italic;">$1</em>')
                                  .replace(/\n\n/g, `</p><p style="margin: 0.75rem 0; text-align: ${isRTL ? 'right' : 'left'}; direction: ${isRTL ? 'rtl' : 'ltr'};">`)
                                  .replace(/\n/g, '<br/>')
                                  .replace(/^(.*)$/, `<p style="margin: 0.75rem 0; text-align: ${isRTL ? 'right' : 'left'}; direction: ${isRTL ? 'rtl' : 'ltr'};">$1</p>`)
                              }}
                            />
                          )}

                          {activeExplanationTab === 'themes' && (
                            <div className="space-y-4">
                              {/* Use comprehensive tafsir themes if available, fallback to simple mainThemes */}
                              {explanationData.fullTafsir?.themes && explanationData.fullTafsir.themes.length > 0 ? (
                                <div className="space-y-4">
                                  {explanationData.fullTafsir.themes.map((theme, index) => (
                                    <div key={index} className={`${isRTL ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-muted`}>
                                      <div className={`text-foreground font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                        {theme.theme}
                                      </div>
                                      <div 
                                        className={`text-muted-foreground text-sm mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
                                        style={{
                                          fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                          lineHeight: '1.6'
                                        }}
                                        dir={isRTL ? "rtl" : "ltr"}
                                      >
                                        {theme.explanation}
                                      </div>
                                      {theme.evidence_beyts && theme.evidence_beyts.length > 0 && (
                                        <div className={`text-muted-foreground text-xs ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                          <strong>{isRTL ? 'شاهد: ابیات ' : 'Evidence: verses '}</strong>{isRTL ? theme.evidence_beyts.map(n => toFarsiNumber(n)).join('، ') : theme.evidence_beyts.join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : explanationData.mainThemes ? (
                                <div 
                                  className={`text-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-left'} prose prose-sm max-w-none`}
                                  style={{
                                    fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                    lineHeight: '1.8'
                                  }}
                                  dir={isRTL ? "rtl" : "ltr"}
                                  dangerouslySetInnerHTML={{
                                    __html: explanationData.mainThemes
                                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--foreground); font-weight: 600;">$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em style="color: var(--muted-foreground); font-style: italic;">$1</em>')
                                      .replace(/\n\n/g, `</p><p style="margin: 0.75rem 0; text-align: ${isRTL ? 'right' : 'left'}; direction: ${isRTL ? 'rtl' : 'ltr'};">`)
                                      .replace(/\n/g, '<br/>')
                                      .replace(/^(.*)$/, `<p style="margin: 0.75rem 0; text-align: ${isRTL ? 'right' : 'left'}; direction: ${isRTL ? 'rtl' : 'ltr'};">$1</p>`)
                                  }}
                                />
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  {isRTL ? 'موضوعات در دسترس نیست' : 'Themes not available'}
                                </div>
                              )}
                            </div>
                          )}

                          {activeExplanationTab === 'imagery' && (
                            <div className="space-y-4">
                              {/* Use comprehensive tafsir symbols if available, fallback to simple imagerySymbols */}
                              {explanationData.fullTafsir?.symbols && explanationData.fullTafsir.symbols.length > 0 ? (
                                <div className="space-y-4">
                                  {explanationData.fullTafsir.symbols.map((symbol, index) => (
                                    <div key={index} className={`${isRTL ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-muted`}>
                                      <div className={`text-foreground font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                        {symbol.symbol}
                                      </div>
                                      <div className={`text-muted-foreground text-sm mb-2 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                        <strong>{isRTL ? 'معانی:' : 'Meanings:'}</strong> {symbol.meanings.join(isRTL ? '، ' : ', ')}
                                      </div>
                                      {symbol.evidence_terms && symbol.evidence_terms.length > 0 && (
                                        <div className={`text-muted-foreground text-xs ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                          <strong>{isRTL ? 'واژگان:' : 'Terms:'}</strong> {symbol.evidence_terms.join(isRTL ? '، ' : ', ')}
                                        </div>
                                      )}
                                      {symbol.example_beyts && symbol.example_beyts.length > 0 && (
                                        <div className={`text-muted-foreground text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                          <strong>{isRTL ? 'ابیات:' : 'Verses:'}</strong> {isRTL ? symbol.example_beyts.map(n => toFarsiNumber(n)).join('، ') : symbol.example_beyts.join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : explanationData.imagerySymbols ? (
                                <div 
                                  className={`text-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-left'} prose prose-sm max-w-none`}
                                  style={{
                                    fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                    lineHeight: '1.8'
                                  }}
                                  dir={isRTL ? "rtl" : "ltr"}
                                  dangerouslySetInnerHTML={{
                                    __html: explanationData.imagerySymbols
                                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--foreground); font-weight: 600;">$1</strong>')
                                      .replace(/\*(.*?)\*/g, '<em style="color: var(--muted-foreground); font-style: italic;">$1</em>')
                                      .replace(/\n\n/g, `</p><p style="margin: 0.75rem 0; text-align: ${isRTL ? 'right' : 'left'}; direction: ${isRTL ? 'rtl' : 'ltr'};">`)
                                      .replace(/\n/g, '<br/>')
                                      .replace(/^(.*)$/, `<p style="margin: 0.75rem 0; text-align: ${isRTL ? 'right' : 'left'}; direction: ${isRTL ? 'rtl' : 'ltr'};">$1</p>`)
                                  }}
                                />
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  {isRTL ? 'تصاویر و نمادها در دسترس نیست' : 'Imagery and symbols not available'}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Literary Devices Tab - only shown if comprehensive tafsir is available */}
                          {activeExplanationTab === 'devices' && explanationData.fullTafsir?.devices && (
                            <div className="space-y-4">
                              {explanationData.fullTafsir.devices.map((device, index) => (
                                <div key={index} className={`${isRTL ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-muted`}>
                                  <div className={`text-foreground font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                    {isRTL ? 
                                      (device.device === 'metaphor' ? 'استعاره' :
                                       device.device === 'allusion' ? 'تلمیح' :
                                       device.device === 'ambiguity' ? 'ابهام' :
                                       device.device === 'antithesis' ? 'تضاد' :
                                       device.device === 'pun' ? 'ایهام' :
                                       device.device === 'simile' ? 'تشبیه' :
                                       device.device === 'symbolism' ? 'نمادپردازی' : 
                                       device.device === 'irony' ? 'کنایه' : device.device) :
                                      device.device.charAt(0).toUpperCase() + device.device.slice(1)
                                    } <span className="text-muted-foreground text-sm">({isRTL ? `بیت ${toFarsiNumber(device.beyt)}` : `Verse ${device.beyt}`})</span>
                                  </div>
                                  <div className={`text-muted-foreground text-sm mb-2 italic ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                    "{device.quote}"
                                  </div>
                                  <div 
                                    className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                                    style={{
                                      fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                      lineHeight: '1.6'
                                    }}
                                    dir={isRTL ? "rtl" : "ltr"}
                                  >
                                    {device.explanation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Meta Information Tab - only shown if comprehensive tafsir is available */}
                          {activeExplanationTab === 'meta' && explanationData.fullTafsir?.meta && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {explanationData.fullTafsir.meta.poet && (
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <div className={`text-muted-foreground text-xs mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                      {isRTL ? 'شاعر' : 'Poet'}
                                    </div>
                                    <div className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                      {explanationData.fullTafsir.meta.poet}
                                    </div>
                                  </div>
                                )}
                                {explanationData.fullTafsir.meta.era && (
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <div className={`text-muted-foreground text-xs mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                      {isRTL ? 'دوره' : 'Era'}
                                    </div>
                                    <div className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                      {explanationData.fullTafsir.meta.era}
                                    </div>
                                  </div>
                                )}
                                {explanationData.fullTafsir.meta.form && (
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <div className={`text-muted-foreground text-xs mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                      {isRTL ? 'قالب' : 'Form'}
                                    </div>
                                    <div className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                      {isRTL ? 
                                        (explanationData.fullTafsir.meta.form === 'ghazal' ? 'غزل' :
                                         explanationData.fullTafsir.meta.form === 'rubai' ? 'رباعی' :
                                         explanationData.fullTafsir.meta.form === 'masnavi' ? 'مثنوی' :
                                         explanationData.fullTafsir.meta.form === 'nimaei' ? 'نیمایی' :
                                         explanationData.fullTafsir.meta.form === 'free' ? 'آزاد' : 'نامعلوم') :
                                        explanationData.fullTafsir.meta.form
                                      }
                                    </div>
                                  </div>
                                )}
                                {explanationData.fullTafsir.meta.meter && (
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <div className={`text-muted-foreground text-xs mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                      {isRTL ? 'بحر' : 'Meter'}
                                    </div>
                                    <div className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                      {explanationData.fullTafsir.meta.meter}
                                    </div>
                                  </div>
                                )}
                                {explanationData.fullTafsir.meta.rhyme_radif && (
                                  <div className="bg-muted/50 rounded-lg p-3">
                                    <div className={`text-muted-foreground text-xs mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                      {isRTL ? 'قافیه و ردیف' : 'Rhyme & Radif'}
                                    </div>
                                    <div className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                      {explanationData.fullTafsir.meta.rhyme_radif}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Overall meaning from comprehensive tafsir */}
                              {explanationData.fullTafsir.overall_meaning && (
                                <div className="space-y-3">
                                  {explanationData.fullTafsir.overall_meaning.one_sentence && (
                                    <div className="bg-muted/30 rounded-lg p-4">
                                      <div className={`text-muted-foreground text-xs mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {isRTL ? 'خلاصه' : 'Summary'}
                                      </div>
                                      <div 
                                        className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`}
                                        style={{
                                          fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                          lineHeight: '1.8'
                                        }}
                                        dir={isRTL ? "rtl" : "ltr"}
                                      >
                                        {explanationData.fullTafsir.overall_meaning.one_sentence}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {explanationData.fullTafsir.overall_meaning.key_claims && explanationData.fullTafsir.overall_meaning.key_claims.length > 0 && (
                                    <div className="bg-muted/30 rounded-lg p-4">
                                      <div className={`text-muted-foreground text-xs mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {isRTL ? 'ادعاهای کلیدی' : 'Key Claims'}
                                      </div>
                                      <div className="space-y-2">
                                        {explanationData.fullTafsir.overall_meaning.key_claims.map((claim, index) => (
                                          <div key={index} className={`${isRTL ? 'border-r-2 pr-3' : 'border-l-2 pl-3'} border-muted`}>
                                            <div 
                                              className={`text-foreground text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                                              style={{
                                                fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                                lineHeight: '1.6'
                                              }}
                                              dir={isRTL ? "rtl" : "ltr"}
                                            >
                                              {claim.claim}
                                            </div>
                                            <div className={`text-muted-foreground text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                              {isRTL ? 'شاهد: ابیات ' : 'Evidence: verses '}{isRTL ? claim.evidence_beyts.map(n => toFarsiNumber(n)).join('، ') : claim.evidence_beyts.join(', ')}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Uncertainty section */}
                              {explanationData.fullTafsir.uncertainty && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                  <div className={`text-yellow-800 dark:text-yellow-200 text-xs mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'عدم قطعیت' : 'Uncertainty'}
                                  </div>
                                  <div 
                                    className={`text-yellow-700 dark:text-yellow-300 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                                    style={{
                                      fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                      lineHeight: '1.6'
                                    }}
                                    dir={isRTL ? "rtl" : "ltr"}
                                  >
                                    {explanationData.fullTafsir.uncertainty}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {activeExplanationTab === 'lineByLine' && (
                            <div className="space-y-4">
                              {/* Use comprehensive tafsir per_beyt if available, fallback to simple lineByLine */}
                              {explanationData.fullTafsir?.per_beyt ? (
                                explanationData.fullTafsir.per_beyt.map((beyt, index) => (
                                  <div key={index} className={`${isRTL ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-muted`}>
                                    <div 
                                      className={`text-foreground font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
                                      style={{
                                        fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                        lineHeight: '1.8'
                                      }}
                                      dir={isRTL ? "rtl" : "ltr"}
                                    >
                                      <span className="text-muted-foreground text-xs mr-2">
                                        {isRTL ? `بیت ${toFarsiNumber(beyt.beyt_index)}:` : `Verse ${beyt.beyt_index}:`}
                                      </span>
                                      {beyt.literal}
                                    </div>
                                    {beyt.readings && beyt.readings.length > 0 && (
                                      <div className="space-y-2">
                                        {beyt.readings.map((reading, readingIndex) => (
                                          <div key={readingIndex} className="text-sm">
                                            <div className={`text-muted-foreground text-xs mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                              {isRTL ? 
                                                (reading.type === 'symbolic' ? 'نمادین' : 
                                                 reading.type === 'mystical' ? 'عرفانی' :
                                                 reading.type === 'ethical' ? 'اخلاقی' :
                                                 reading.type === 'social' ? 'اجتماعی' : 'عاشقانه') :
                                                reading.type.charAt(0).toUpperCase() + reading.type.slice(1)
                                              } {reading.confidence && (isRTL ? `(٪${toFarsiNumber(Math.round(reading.confidence * 100))})` : `(${Math.round(reading.confidence * 100)}%)`)}
                                            </div>
                                            <div 
                                              className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}
                                              style={{
                                                fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                                lineHeight: '1.6'
                                              }}
                                              dir={isRTL ? "rtl" : "ltr"}
                                            >
                                              {reading.text}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {beyt.notes && (
                                      <div className={`text-xs text-muted-foreground/70 mt-2 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
                                        {isRTL ? 'یادداشت:' : 'Note:'} {beyt.notes}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : explanationData.lineByLine ? (
                                explanationData.lineByLine.map((line, index) => (
                                  <div key={index} className={`${isRTL ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-muted`}>
                                    <div 
                                      className={`text-foreground font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
                                      style={{
                                        fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                        lineHeight: '1.8'
                                      }}
                                      dir={isRTL ? "rtl" : "ltr"}
                                    >
                                      {line.original}
                                    </div>
                                    <div 
                                      className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                                      style={{
                                        fontFamily: isRTL ? 'system-ui, -apple-system, sans-serif' : 'Georgia, "Times New Roman", serif',
                                        lineHeight: '1.6'
                                      }}
                                      dir={isRTL ? "rtl" : "ltr"}
                                      dangerouslySetInnerHTML={{
                                        __html: line.meaning
                                          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--foreground); font-weight: 600;">$1</strong>')
                                          .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
                                      }}
                                    />
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  {isRTL ? 'تفسیر بیت به بیت در دسترس نیست' : 'Line by line analysis not available'}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show message if no content for active tab */}
                          {((activeExplanationTab === 'general' && !explanationData.generalMeaning) ||
                            (activeExplanationTab === 'themes' && !explanationData.mainThemes && (!explanationData.fullTafsir?.themes || explanationData.fullTafsir.themes.length === 0)) ||
                            (activeExplanationTab === 'imagery' && !explanationData.imagerySymbols && (!explanationData.fullTafsir?.symbols || explanationData.fullTafsir.symbols.length === 0)) ||
                            (activeExplanationTab === 'lineByLine' && !explanationData.lineByLine && (!explanationData.fullTafsir?.per_beyt || explanationData.fullTafsir.per_beyt.length === 0)) ||
                            (activeExplanationTab === 'devices' && (!explanationData.fullTafsir?.devices || explanationData.fullTafsir.devices.length === 0)) ||
                            (activeExplanationTab === 'meta' && !explanationData.fullTafsir?.meta)) && (
                            <div className="text-center py-8 text-muted-foreground">
                              {t.noContentForTab || 'محتوایی برای این بخش تولید نشده است'}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="text-center py-8 text-muted-foreground">
                          {t.noExplanationGenerated || 'تفسیری تولید نشده است'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Character and Line Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-foreground text-lg font-medium">
                        {isRTL ? toFarsiNumber(poem.text.split('\n').length) : poem.text.split('\n').length}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {t.lines || 'Lines'}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-foreground text-lg font-medium">
                        {isRTL ? toFarsiNumber(poem.text.replace(/\s/g, '').length) : poem.text.replace(/\s/g, '').length}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {t.characters || 'Characters'}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-muted-foreground text-lg mb-2">
                    {t.noPoemSelected || 'No poem selected'}
                  </div>
                  <div className="text-muted-foreground/70 text-sm">
                    {t.noPoemSelectedSubtitle || 'View a poem to see its details here'}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </>
  );
}