"use client";

import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const { isRTL } = useLanguage();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      position="top-center"
      offset="48px"
      richColors
      dir={isRTL ? "rtl" : "ltr"}
      toastOptions={{
        style: {
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr',
          maxWidth: 'calc(100vw - 32px)', // Ensure toast doesn't exceed screen width
          width: 'auto',
          minWidth: '200px',
        },
        className: 'toast-responsive'
      }}
      {...props}
    />
  );
};

export { Toaster };
