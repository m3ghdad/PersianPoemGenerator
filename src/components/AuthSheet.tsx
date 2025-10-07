import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Theme-aware iOS-style grabber component
const ThemedGrabber = ({ shouldPulse = false }: { shouldPulse?: boolean }) => (
  <div className="flex flex-col items-center py-1 px-0 relative">
    <div className={`bg-muted-foreground h-[6px] rounded-full shrink-0 w-[40px] shadow-lg border border-muted-foreground/20 ${
      shouldPulse ? 'animate-pulse' : ''
    }`} />
  </div>
);

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthSheet({ open, onOpenChange }: AuthSheetProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();
  const { t, isRTL } = useLanguage();

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [initialHeight, setInitialHeight] = useState(85);
  const [currentHeight, setCurrentHeight] = useState(85); // Start at 85%
  const [showPulse, setShowPulse] = useState(true);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  
  // Snap points (as percentages of viewport height)
  const SNAP_POINTS = [60, 75, 85];
  const CLOSE_THRESHOLD = 20; // Below this percentage, the sheet closes

  // Check if we're on a wide screen
  const [isWideScreen, setIsWideScreen] = useState(false);

  // Load initial state when sheet opens
  useEffect(() => {
    if (open) {
      setCurrentHeight(85); // Reset to max height when opening
      setInitialHeight(85);
      setShowPulse(true);
      
      // Stop pulsing after 3 seconds
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowPulse(false);
    }
  }, [open]);

  // Handle responsive positioning
  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideScreen(window.innerWidth > 743);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  // Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t.passwordMinLength;
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setError(t.nameRequired);
          return;
        }

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        // Check password confirmation
        if (password !== confirmPassword) {
          setError(t.passwordMismatch);
          return;
        }

        result = await signUp(email, password, name);
      } else if (mode === 'reset') {
        result = await resetPassword(email);
        if (!result.error) {
          setSuccess(t.resetLinkSent);
          return;
        }
      }

      if (result?.error) {
        // Handle specific error cases with translated messages
        if (result.error.includes('email address has already been registered') || 
            result.error.includes('email_exists')) {
          setError(t.emailAlreadyExists);
          // Auto-suggest switching to sign-in mode after showing the error
          setTimeout(() => {
            if (mode === 'signup') {
              setMode('signin');
              setError('');
              setEmail(email); // Keep the email for convenience
              setPassword('');
              setConfirmPassword('');
            }
          }, 3000);
        } else if (result.error.includes('Invalid login credentials')) {
          setError(t.invalidCredentials);
        } else if (result.error.includes('Email not confirmed')) {
          setError(t.emailNotConfirmed);
        } else if (result.error.includes('Too many requests')) {
          setError(t.tooManyRequests);
        } else {
          // Fallback to original error message
          setError(result.error);
        }
      } else if (mode !== 'reset') {
        onOpenChange(false);
        // Reset form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
      }
    } catch (err) {
      setError(t.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

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
        initial={{ y: "100%", height: "85vh" }}
        animate={{ y: 0, height: `${currentHeight}vh` }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`fixed bottom-0 z-50 bg-background/95 border-t border-border backdrop-blur-xl rounded-t-xl overflow-hidden flex flex-col ${
          isDragging ? 'shadow-2xl' : ''
        }`}
        style={{ 
          height: `${currentHeight}vh`,
          maxHeight: '95vh',
          minHeight: '20vh',
          left: isWideScreen ? '50%' : 0,
          right: isWideScreen ? 'auto' : 0,
          width: isWideScreen ? '743px' : '100vw',
          transform: isWideScreen 
            ? `translateX(-50%) ${isDragging ? 'scale(1.02)' : 'scale(1)'}`
            : isDragging ? 'scale(1.02)' : 'scale(1)',
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
        data-sheet-content
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
              {mode === 'signin' && t.signInToAccount}
              {mode === 'signup' && t.createNewAccount}
              {mode === 'reset' && t.resetPassword}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'signin' && t.accessToFavorites}
              {mode === 'signup' && t.createNewUserAccount}
              {mode === 'reset' && t.enterYourEmail}
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
            <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t.name}</Label>
                    <div className="relative">
                      <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`} size={16} />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`bg-input border-border text-foreground ${isRTL ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'}`}
                        placeholder={t.enterName}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t.email}</Label>
                  <div className="relative">
                    <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`} size={16} />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`bg-input border-border text-foreground ${isRTL ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'}`}
                      placeholder={t.enterEmail}
                      required
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t.password}</Label>
                    <div className="relative">
                      <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`} size={16} />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`bg-input border-border text-foreground ${isRTL ? 'pl-10 pr-10 text-right' : 'pr-10 pl-10 text-left'}`}
                        placeholder={t.enterPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <div className={`text-xs text-white/60 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p>{t.passwordRequirements}</p>
                        <ul className={`space-y-0.5 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                          <li className={password.length >= 8 ? 'text-green-400' : 'text-white/60'}>
                            {t.minCharacters}
                          </li>
                          <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-white/60'}>
                            {t.upperCase}
                          </li>
                          <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-white/60'}>
                            {t.lowerCase}
                          </li>
                          <li className={/[0-9]/.test(password) ? 'text-green-400' : 'text-white/60'}>
                            {t.oneNumber}
                          </li>
                          <li className={/[!@#$%^&*(),.?\":{}|<>]/.test(password) ? 'text-green-400' : 'text-white/60'}>
                            {t.specialCharacter}
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className={`text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`} size={16} />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`bg-input border-border text-foreground ${isRTL ? 'pl-10 pr-10 text-right' : 'pr-10 pl-10 text-left'}`}
                        placeholder={t.enterPasswordAgain}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className={`text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                        {password === confirmPassword ? (
                          <p className="text-green-400">{t.passwordsMatch}</p>
                        ) : (
                          <p className="text-red-400">{t.passwordsDontMatch}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className={`text-red-400 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
                    {error.includes(isRTL ? 'این ایمیل قبلاً ثبت شده است' : 'already registered') && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          setError('');
                          setPassword('');
                          setConfirmPassword('');
                        }}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
                      >
                        {t.signInNow}
                      </button>
                    )}
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className={`text-green-400 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{success}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {loading ? t.processing : (
                    mode === 'signin' ? t.signIn :
                    mode === 'signup' ? t.createAccount :
                    t.sendResetLink
                  )}
                </Button>

                <div className="flex flex-col space-y-2 text-center">
                  {mode === 'signin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors text-right"
                      >
                        {t.dontHaveAccount} {t.createAccountLink}
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors text-right"
                      >
                        {t.forgotPassword}
                      </button>
                    </>
                  )}

                  {mode === 'signup' && (
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors text-right"
                    >
                      {t.haveAccount} {t.signInLink}
                    </button>
                  )}

                  {mode === 'reset' && (
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors text-right"
                    >
                      {t.backToSignIn}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </>
  );
}