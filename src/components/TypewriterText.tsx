import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // Characters per second
  startDelay?: number; // Delay before starting animation in ms
  lineBreakPause?: number; // Extra pause at line breaks in ms
  isActive: boolean; // Whether the animation should start
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  dir?: "ltr" | "rtl";
}

export function TypewriterText({ 
  text, 
  speed = 50, // Default 50 characters per second
  startDelay = 300,
  lineBreakPause = 400, // Pause at line breaks for poetry rhythm
  isActive, 
  onComplete,
  className = "",
  style = {},
  dir
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const currentIndexRef = useRef(0);

  // Strip HTML tags for character counting, but preserve structure for display
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const plainText = stripHtml(text);

  // Reset animation when isActive changes or text changes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isActive) {
      setDisplayedText("");
      setIsAnimating(false);
      setIsComplete(false);
      currentIndexRef.current = 0;
      return;
    }

    // Start animation after delay
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(true);
      currentIndexRef.current = 0;
      
      const interval = 1000 / speed; // Convert speed to interval
      
      const typeNextCharacter = () => {
        currentIndexRef.current += 1;
        
        if (currentIndexRef.current >= plainText.length) {
          setDisplayedText(text); // Show full HTML text
          setIsAnimating(false);
          setIsComplete(true);
          
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          if (onComplete) {
            onComplete();
          }
        } else {
          // For HTML content, we need to carefully build the displayed text
          // while preserving HTML structure
          const targetLength = currentIndexRef.current;
          const partialText = buildPartialHtml(text, targetLength);
          setDisplayedText(partialText);
          
          // Check if we just completed a line (found a <br/> or <br>)
          const justCompletedLine = partialText.match(/<br\s*\/?>$/i);
          const nextInterval = justCompletedLine ? lineBreakPause : interval;
          
          intervalRef.current = setTimeout(typeNextCharacter, nextInterval);
        }
      };
      
      intervalRef.current = setTimeout(typeNextCharacter, interval);
    }, startDelay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, text, speed, startDelay, onComplete, plainText.length]);

  // Function to build partial HTML while preserving structure
  const buildPartialHtml = (fullHtml: string, targetLength: number): string => {
    let result = '';
    let plainTextCount = 0;
    let i = 0;
    let inTag = false;
    let currentTag = '';

    while (i < fullHtml.length && plainTextCount < targetLength) {
      const char = fullHtml[i];
      
      if (char === '<') {
        inTag = true;
        currentTag = char;
      } else if (char === '>') {
        inTag = false;
        currentTag += char;
        result += currentTag;
        currentTag = '';
      } else if (inTag) {
        currentTag += char;
      } else {
        // This is visible text
        result += char;
        plainTextCount++;
      }
      
      i++;
    }

    return result;
  };

  return (
    <div 
      className={className}
      style={style}
      dir={dir}
    >
      {isActive ? (
        <div dangerouslySetInnerHTML={{ __html: displayedText }} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: text }} />
      )}
      
      {/* Typing cursor */}
      {isAnimating && (
        <span 
          className="inline-block typewriter-cursor"
          style={{
            color: 'currentColor',
            fontSize: '1.2em',
            lineHeight: '1',
            marginLeft: dir === 'rtl' ? '0' : '2px',
            marginRight: dir === 'rtl' ? '2px' : '0',
            textShadow: 'inherit',
            fontWeight: 'bold'
          }}
        >
          |
        </span>
      )}
    </div>
  );
}