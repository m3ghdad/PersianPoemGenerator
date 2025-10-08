import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  profileImage: string;
  setProfileImage: (image: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string>('');

  // Automatically load Google profile picture when user changes
  useEffect(() => {
    if (user) {
      // Check for Google OAuth avatar URL
      const googleAvatarUrl = user.user_metadata?.avatar_url;
      const providerId = user.app_metadata?.provider;
      
      if (providerId === 'google' && googleAvatarUrl) {
        console.log('Loading Google profile picture:', googleAvatarUrl);
        setProfileImage(googleAvatarUrl);
      } else {
        // Try to load from localStorage for non-Google users
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        if (savedImage) {
          setProfileImage(savedImage);
        }
      }
    } else {
      setProfileImage('');
    }
  }, [user]);

  // Save to localStorage when profile image changes (for non-Google users)
  useEffect(() => {
    if (user && profileImage && user.app_metadata?.provider !== 'google') {
      localStorage.setItem(`profile_image_${user.id}`, profileImage);
    }
  }, [profileImage, user]);

  const value = {
    profileImage,
    setProfileImage,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}