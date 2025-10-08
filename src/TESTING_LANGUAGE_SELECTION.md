# Testing Language Selection Screen

## How to Test

The language selection screen will only appear for **first-time users** who don't have a saved language preference.

### If You Already Have a Saved Preference

If you've used the app before, you likely have a saved language preference in localStorage. To test the language selection screen:

1. **Open Browser Console** (F12 or Cmd+Option+I on Mac, F12 on Windows)
2. **Clear the saved preference** by running:
   ```javascript
   localStorage.removeItem('app-language');
   ```
3. **Refresh the page** - You should now see the clean, simple language selection screen

### Console Logs to Watch

When the app loads, you should see these console logs:

**If you have a saved preference:**
```
LanguageProvider: Checking localStorage for saved language...
✓ Found saved language in localStorage: fa
```

**If you DON'T have a saved preference:**
```
LanguageProvider: Checking localStorage for saved language...
✗ No saved language found in localStorage
Showing language selection screen - hasSelectedLanguage: false
```

### Expected Behavior

1. **First-time user (no localStorage):**
   - Brief loading screen (checking localStorage)
   - Language selection screen appears
   - User selects language
   - Preference saved to localStorage (and server if logged in)
   - Content loads

2. **Returning user (has localStorage):**
   - Brief loading screen
   - Content loads directly with saved language
   - No language selection screen

3. **Logged-in user (new device):**
   - Checks localStorage (empty)
   - Shows language selection screen
   - OR checks server for saved preference
   - If found on server, auto-loads that language
   - If not found, shows selection screen

## Flow Diagram

```
App Start
    ↓
Check localStorage
    ↓
    ├─ Found? → Load language → Show content
    │
    └─ Not found? → Check server (if logged in)
                        ↓
                        ├─ Found? → Load from server → Show content
                        │
                        └─ Not found? → Show language selection screen
                                            ↓
                                        User selects language
                                            ↓
                                        Save to localStorage + server
                                            ↓
                                        Load content
```

## How to Force Show Language Selection

To always show the language selection screen for testing, temporarily comment out the localStorage check in `/contexts/LanguageContext.tsx`:

```typescript
// Load language from localStorage on mount
useEffect(() => {
  console.log('LanguageProvider: Checking localStorage for saved language...');
  // const savedLanguage = localStorage.getItem('app-language') as Language;
  // if (savedLanguage && ['fa', 'en'].includes(savedLanguage)) {
  //   console.log('✓ Found saved language in localStorage:', savedLanguage);
  //   setLanguageState(savedLanguage);
  //   setHasSelectedLanguage(true);
  // } else {
    console.log('✗ No saved language found in localStorage');
  // }
  setIsLoadingPreference(false);
}, []);
```

Remember to uncomment it after testing!
