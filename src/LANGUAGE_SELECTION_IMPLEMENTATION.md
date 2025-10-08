# Language Selection Screen Implementation

## Overview

The app now features a beautiful language selection screen that appears when users first open the app, allowing them to choose between Persian (Farsi) and English.

## User Experience Flow

### First-Time Users
1. App loads → Language selection screen appears
2. User chooses Persian or English
3. Preference saved to localStorage
4. Content loads in selected language

### Returning Users (Not Logged In)
1. App loads → Checks localStorage
2. Finds saved language preference
3. Automatically loads content in saved language
4. No language selection screen shown

### Logged-In Users
1. App loads → Checks localStorage first
2. Then checks server for saved preference
3. Server preference overrides localStorage (if different)
4. Content loads in preferred language
5. All language changes saved to both localStorage and server

## Technical Implementation

### Components Created

#### `/components/LanguageSelectionScreen.tsx`
- Beautiful full-screen overlay with gradient background
- Animated particles for visual interest
- Two interactive cards (Farsi and English)
- Glassmorphic design with hover effects
- Motion animations using Framer Motion
- Bilingual labels (Persian and English)

### Context Updates

#### `/contexts/LanguageContext.tsx`
**New Features:**
- `hasSelectedLanguage` - tracks if user has chosen a language
- `saveLanguagePreference(language, userId?)` - saves to localStorage and server
- Language state starts as `null` to detect first-time users
- Automatic localStorage loading on mount

**State Flow:**
```typescript
null (first load) 
  → user selects language 
  → saves to localStorage 
  → hasSelectedLanguage = true
```

### Server Endpoints

#### `POST /make-server-c192d0ee/user-preference`
Saves user preferences (language, theme, etc.)

**Request:**
```json
{
  "userId": "user-id",
  "preference": "language",
  "value": "fa" | "en"
}
```

**Response:**
```json
{
  "success": true
}
```

#### `GET /make-server-c192d0ee/user-preference/:userId/:preference`
Retrieves saved user preference

**Response:**
```json
{
  "value": "fa" | "en"
}
```

### Storage Strategy

1. **localStorage** - Used for all users (logged in or not)
   - Key: `app-language`
   - Value: `'fa'` or `'en'`

2. **Server KV Store** - Only for logged-in users
   - Key: `user:{userId}:language`
   - Value: `'fa'` or `'en'`
   - Persists across devices

### App.tsx Updates

**Loading States:**
1. `loadingLanguagePreference` - Checking for saved preferences
2. `!hasSelectedLanguage` - User needs to select language
3. `loading` - Loading content

**Preference Loading:**
```typescript
useEffect(() => {
  if (user?.id) {
    // Fetch saved language from server
    // Override localStorage if different
  }
  setLoadingLanguagePreference(false);
}, [user?.id]);
```

**Event Listener Fix:**
- Event listeners only set up after language selection
- Prevents "Container ref not found" error
- Conditions: `!loadingLanguagePreference && hasSelectedLanguage && !loading`

## User Interface

### Language Selection Screen

**Layout:**
- Full-screen gradient background (dark purple to black)
- Centered content with max-width constraint
- Responsive grid (1 column mobile, 2 columns desktop)

**Cards:**
- **Farsi Card:**
  - Icon: 📖 (book)
  - Title: "فارسی"
  - Description: "شعر فارسی کلاسیک"
  - Hover color: Purple gradient

- **English Card:**
  - Icon: 🌍 (globe)
  - Title: "English"
  - Description: "Persian Poetry Translated"
  - Hover color: Blue gradient

**Animations:**
- Title fades in from top (0.8s delay)
- Cards slide in from left/right (0.6s delay)
- Hover states with scale and glow effects
- Animated background particles

### Footer Note
Bilingual message informing users they can change language later:
- English: "You can change this later in settings"
- Persian: "می‌توانید بعداً در تنظیمات تغییر دهید"

## Benefits

### User Experience
- ✅ Clear language choice on first use
- ✅ Preference remembered across sessions
- ✅ Synced across devices (for logged-in users)
- ✅ Smooth, beautiful animations
- ✅ No confusion about default language

### Technical
- ✅ Prevents "Container ref not found" error
- ✅ Clean separation of concerns
- ✅ Backward compatible with existing code
- ✅ Works for both logged-in and anonymous users
- ✅ Graceful fallback if server unavailable

## Future Enhancements

Possible improvements:
1. Add more language options (Arabic, Urdu, etc.)
2. Show language name in native script on button
3. Add preview of content in each language
4. Remember last viewed poem per language
5. Add language-specific font preferences
6. Sync with system language settings (optional)

## Testing Checklist

- [x] First-time user sees language selection
- [x] Language preference saved to localStorage
- [x] Returning user doesn't see selection screen
- [x] Logged-in user preference syncs from server
- [x] Language change updates both localStorage and server
- [x] Event listeners work correctly after selection
- [x] No console errors about missing container ref
- [x] Animations smooth on mobile and desktop
- [x] Works in both RTL and LTR modes
- [x] Handles server unavailability gracefully
