export type Language = 'fa' | 'en';

export interface Translations {
  // Header
  languagePicker: string;
  
  // Auth
  welcome: string;
  login: string;
  signup: string;
  logout: string;
  loginSignup: string;
  lists: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  name: string;
  verificationCode: string;
  sendCode: string;
  verifyCode: string;
  resendCode: string;
  back: string;
  contactMethod: string;
  
  // Main App
  appTitle: string;
  appSubtitle: string;
  poemFeed: string;
  favorites: string;
  myLists: string;
  searchAndFilter: string;
  searchPlaceholder: string;
  selectPoet: string;
  selectCategory: string;
  randomPoems: string;
  clearFilters: string;
  addToList: string;
  createNewList: string;
  manageLists: string;
  noPoems: string;
  loading: string;
  
  // Messages
  loginRequired: string;
  addedToFavorites: string;
  removedFromFavorites: string;
  loggedOut: string;
  loginError: string;
  signupError: string;
  
  // Mock data notice
  mockDataTitle: string;
  mockDataSubtitle: string;
  
  // Placeholders
  emailPlaceholder: string;
  phonePlaceholder: string;
  phoneHint: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  namePlaceholder: string;
  verificationCodePlaceholder: string;
  
  // States
  sending: string;
  verifying: string;
  loggingIn: string;
  signingUp: string;
  
  // Errors
  nameRequired: string;
  emailRequired: string;
  phoneRequired: string;
  passwordMinLength: string;
  passwordMismatch: string;
  invalidCode: string;
  sendCodeError: string;
  verifyCodeError: string;
  resendCodeError: string;
  
  // Success messages
  codeSent: string;
  codeResent: string;
  signupSuccess: string;
  loginSuccess: string;
  
  // Lists
  noLists: string;
  noFavorites: string;
  listName: string;
  listDescription: string;
  createList: string;
  updateList: string;
  deleteList: string;
  addPoemToList: string;
  removePoemFromList: string;
  
  // Poem display
  poems: string;
  unknown: string;
  audioNotSupported: string;
  loadingPoems: string;
  sampleMode: string;
  apiUnavailable: string;

  // Profile and Settings
  userProfile: string;
  manageAccountSettings: string;
  editProfile: string;
  darkMode: string;
  profileImageUpdated: string;
  profileImageError: string;
  fileSizeError: string;
  fileTypeError: string;
  pleaseLoginAgain: string;
  imageProcessingError: string;
  signOutFromAccount: string;
  dragging: string;
  dragToResize: string;

  // Auth translations
  signInToAccount: string;
  createNewAccount: string;
  resetPassword: string;
  accessToFavorites: string;
  createNewUserAccount: string;
  enterYourEmail: string;
  enterName: string;
  enterEmail: string;
  enterPassword: string;
  enterPasswordAgain: string;
  processing: string;
  signIn: string;
  signInWithGoogle: string;
  orContinueWith: string;
  createAccount: string;
  sendResetLink: string;
  dontHaveAccount: string;
  createAccountLink: string;
  haveAccount: string;
  signInLink: string;
  forgotPassword: string;
  backToSignIn: string;
  resetLinkSent: string;
  orContinueWith: string;
  signInWithGoogle: string;
  useEmailInstead: string;
  continueWithGoogle: string;

  // Password validation
  passwordRequirements: string;
  minCharacters: string;
  upperCase: string;
  lowerCase: string;
  oneNumber: string;
  specialCharacter: string;
  passwordsMatch: string;
  passwordsDontMatch: string;
  nameRequired: string;
  emailAlreadyExists: string;
  signInNow: string;
  invalidCredentials: string;
  emailNotConfirmed: string;
  tooManyRequests: string;
  unexpectedError: string;

  // Favorites
  loadingFavorites: string;
  noFavoritesYet: string;
  addFavoritesPrompt: string;
  goBack: string;
  addedOn: string;
  removedFromFavorites: string;
  favoritePoems: string;

  // More sheet
  more: string;
  close: string;
  poemDetails: string;
  poemDetailsSubtitle: string;
  title: string;
  poet: string;
  poemText: string;
  poemExplanation: string;
  lines: string;
  characters: string;
  noPoemSelected: string;
  noPoemSelectedSubtitle: string;
  generatingExplanation: string;
  generatingAIExplanation: string;
  explanationError: string;
  explanationTimeout: string;
  tryAgain: string;
  noExplanationGenerated: string;
  explanationNote: string;
  aiExplanationTag: string;
  aiDisclaimer: string;
  
  // Password reset
  passwordUpdated: string;
}

export const translations: Record<Language, Translations> = {
  fa: {
    // Header
    languagePicker: 'زبان',
    
    // Auth
    welcome: 'خوش آمدید',
    login: 'ورود',
    signup: 'ثبت‌نام',
    logout: 'خروج',
    loginSignup: 'ورود / ثبت‌نام',
    lists: 'لیست‌ها',
    email: 'ایمیل',
    phone: 'شماره تلفن',
    password: 'رمز عبور',
    confirmPassword: 'تکرار رمز عبور',
    name: 'نام',
    verificationCode: 'کد تأیید',
    sendCode: 'ارسال کد تأیید',
    verifyCode: 'تأیید کد',
    resendCode: 'ارسال مجدد کد',
    back: 'بازگشت',
    contactMethod: 'روش تماس',
    
    // Main App
    appTitle: 'گنجور',
    appSubtitle: 'کتابخانه دیجیتال شعر فارسی',
    poemFeed: 'خوراک اشعار',
    favorites: 'علاقه‌مندی‌ها',
    myLists: 'لیست‌های من',
    searchAndFilter: 'جستجو و فیلتر',
    searchPlaceholder: 'جستجو در اشعار...',
    selectPoet: 'انتخاب شاعر',
    selectCategory: 'انتخاب موضوع',
    randomPoems: 'اشعار تصادفی',
    clearFilters: 'پاک کردن فیلترها',
    addToList: 'افزودن به لیست',
    createNewList: 'ایجاد لیست جدید',
    manageLists: 'مدیریت لیست‌ها',
    noPoems: 'هیچ شعری یافت نشد',
    loading: 'در حال بارگذاری...',
    
    // Messages
    loginRequired: 'برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید',
    addedToFavorites: 'به علاقه‌مندی‌ها اضافه شد',
    removedFromFavorites: 'از علاقه‌مندی‌ها حذف شد',
    loggedOut: 'با موفقیت خارج شدید',
    loginError: 'خطا در ورود',
    signupError: 'خطا در ثبت‌نام',
    
    // Mock data notice
    mockDataTitle: '📚 در حال نمایش اشعار نمونه از شاعران بزرگ فارسی',
    mockDataSubtitle: 'تمامی ویژگی‌ها شامل جستجو، فیلتر و علاقه‌مندی‌ها فعال هستند',
    
    // Placeholders
    emailPlaceholder: 'example@email.com',
    phonePlaceholder: '+989123456789',
    phoneHint: 'شماره تلفن باید با کد کشور شروع شود (مثال: +98)',
    passwordPlaceholder: 'حداقل ۶ کاراکتر',
    confirmPasswordPlaceholder: 'تکرار رمز عبور',
    namePlaceholder: 'نام خود را وارد کنید',
    verificationCodePlaceholder: '123456',
    
    // States
    sending: 'در حال ارسال...',
    verifying: 'در حال تأیید...',
    loggingIn: 'در حال ورود...',
    signingUp: 'در حال ثبت‌نام...',
    
    // Errors
    nameRequired: 'نام الزامی است',
    emailRequired: 'ایمیل الزامی است',
    phoneRequired: 'شماره تلفن الزامی است',
    passwordMinLength: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    passwordMismatch: 'رمز عبور و تکرار آن مطابقت ندارند',
    invalidCode: 'کد تأیید نامعتبر است',
    sendCodeError: 'خطا در ارسال کد',
    verifyCodeError: 'خطا در تأیید کد',
    resendCodeError: 'خطا در ارسال مجدد کد',
    
    // Success messages
    codeSent: 'کد تأیید ارسال شد',
    codeResent: 'کد تأیید مجدداً ارسال شد',
    signupSuccess: 'ثبت‌نام با موفقیت انجام شد',
    loginSuccess: 'با موفقیت وارد شدید',
    
    // Lists
    noLists: 'هیچ لیستی وجود ندارد',
    noFavorites: 'هنوز هیچ شعری به علاقه‌مندی‌ها اضافه نکرده‌اید',
    listName: 'نام لیست',
    listDescription: 'توضیحات',
    createList: 'ایجاد لیست',
    updateList: 'به‌روزرسانی لیست',
    deleteList: 'حذف لیست',
    addPoemToList: 'افزودن شعر به لیست',
    removePoemFromList: 'حذف شعر از لیست',
    
    // Poem display
    poems: 'شعر',
    unknown: 'نامشخص',
    audioNotSupported: 'مرورگر شما از پخش صوت پشتیبانی نمی‌کند.',
    loadingPoems: 'در حال بارگذاری اشعار...',
    sampleMode: 'حالت نمونه',
    apiUnavailable: 'API در دسترس نیست',

    // Profile and Settings
    userProfile: 'پروفایل کاربری',
    manageAccountSettings: 'مدیریت حساب کاربری و تنظیمات',
    editProfile: 'ویرایش پروفایل',
    darkMode: 'حالت شب',
    profileImageUpdated: 'تصویر پروفایل با موفقیت بروزرسانی شد',
    profileImageError: 'خطا در بروزرسانی تصویر پروفایل',
    fileSizeError: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد',
    fileTypeError: 'لطفاً یک فایل تصویری انتخاب کنید',
    pleaseLoginAgain: 'لطفاً دوباره وارد شوید',
    imageProcessingError: 'خطا در پردازش تصویر',
    signOutFromAccount: 'خروج از حساب کاربری',
    dragging: 'در حال جابجایی',
    dragToResize: 'بکشید تا تغییر اندازه دهید',

    // Auth translations
    signInToAccount: 'ورود به حساب کاربری',
    createNewAccount: 'ایجاد حساب کاربری',
    resetPassword: 'بازیابی رمز عبور',
    accessToFavorites: 'برای دسترسی به علاقه‌مندی‌ها وارد شوید',
    accessToExplanation: 'برای دسترسی به تفسیر وارد شوید',
    createNewUserAccount: 'حساب کاربری جدید ایجاد کنید',
    enterYourEmail: 'ایمیل خود را وارد کنید',
    enterName: 'نام خود را وارد کنید',
    enterEmail: 'ایمیل خود را وارد کنید',
    enterPassword: 'رمز عبور خود را وارد کنید',
    enterPasswordAgain: 'رمز عبور خود را مجدداً وارد کنید',
    processing: 'در حال پردازش...',
    signIn: 'ورود',
    signInWithGoogle: 'ورود با Google',
    orContinueWith: 'یا ادامه با',
    createAccount: 'ایجاد حساب',
    sendResetLink: 'ارسال لینک بازیابی',
    dontHaveAccount: 'حساب کاربری ندارید؟',
    createAccountLink: 'ایجاد حساب',
    haveAccount: 'حساب کاربری دارید؟',
    signInLink: 'ورود',
    forgotPassword: 'فراموشی رمز عبور',
    backToSignIn: 'بازگشت به ورود',
    resetLinkSent: 'لینک تغییر رمز عبور به ایمیل شما ارسال شد',
    useEmailInstead: 'استفاده از ایمیل',
    continueWithGoogle: 'ادامه با Google',

    // Password validation
    passwordRequirements: 'رمز عبور باید شامل موارد زیر باشد:',
    minCharacters: '• حداقل ۸ کاراکتر',
    upperCase: '• یک حرف بزرگ انگلیسی',
    lowerCase: '• یک حرف کوچک انگلیسی',
    oneNumber: '• یک عدد',
    specialCharacter: '• یک کاراکتر خاص (!@#$%^&*)',
    passwordsMatch: '✓ رمز عبور مطابقت دارد',
    passwordsDontMatch: '✗ رمز عبور مطابقت ندارد',
    emailAlreadyExists: 'این ایمیل قبلاً ثبت شده است. آیا می‌خواهید وارد شوید؟',
    signInNow: 'اکنون وارد شوم',
    invalidCredentials: 'ایمیل یا رمز عبور اشتباه است',
    emailNotConfirmed: 'لطفاً ایمیل خود را تأیید کنید',
    tooManyRequests: 'تعداد درخواست‌ها زیاد است. لطفاً کمی صبر کنید',
    unexpectedError: 'خطای غیرمنتظره رخ داد',

    // Favorites
    loadingFavorites: 'در حال بارگذاری علاقه‌مندی‌ها...',
    noFavoritesYet: 'هنوز شعری علاقه‌مند نشده‌اید',
    addFavoritesPrompt: 'اشعار مورد علاقه‌تان را با ضربه بر قلب اضافه کنید',
    goBack: 'بازگشت',
    addedOn: 'افزوده شده در',
    favoritePoems: 'اشعار علاقه‌مندی',

    // More sheet
    more: 'بیشتر',
    close: 'بستن',
    poemDetails: 'جزئیات شعر',
    poemDetailsSubtitle: 'نمایش متن ساده شعر فعلی',
    title: 'عنوان',
    poet: 'شاعر',
    poemText: 'متن شعر',
    poemExplanation: 'تفسیر',
    lines: 'بیت',
    characters: 'کاراکتر',
    noPoemSelected: 'شعری انتخاب نشده',
    noPoemSelectedSubtitle: 'برای مشاهده جزئیات، شعری را انتخاب کنید',
    generatingExplanation: 'در حال تولید تفسیر...',
    generatingAIExplanation: 'در حال تولید تفسیر با هوش مصنوعی...',
    explanationError: 'خطا در تولید تفسیر',
    explanationTimeout: 'درخواست به دلیل طولانی شدن لغو شد. لطفاً دوباره تلاش کنید',
    tryAgain: 'تلاش مجدد',
    noExplanationGenerated: 'تفسیری تولید نشد',
    explanationNote: 'این تفسیر بر اساس تحلیل ادبی کلاسیک تولید شده است',
    aiExplanationTag: 'تفسیر با هوش مصنوعی',
    aiDisclaimer: 'تفسیر زیر توسط هوش مصنوعی تولید شده و ممکن است حاوی خطا باشد',
    noContentForTab: 'محتوایی برای این بخش تولید نشده است',
    
    // Password reset
    passwordUpdated: 'رمز عبور با موفقیت بروزرسانی شد!',
  },
  
  en: {
    // Header
    languagePicker: 'Language',
    
    // Auth
    welcome: 'Welcome',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    loginSignup: 'Login / Sign Up',
    lists: 'Lists',
    email: 'Email',
    phone: 'Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Name',
    verificationCode: 'Verification Code',
    sendCode: 'Send Verification Code',
    verifyCode: 'Verify Code',
    resendCode: 'Resend Code',
    back: 'Back',
    contactMethod: 'Contact Method',
    
    // Main App
    appTitle: 'Ganjoor',
    appSubtitle: 'Persian Poetry Digital Library',
    poemFeed: 'Poem Feed',
    favorites: 'Favorites',
    myLists: 'My Lists',
    searchAndFilter: 'Search & Filter',
    searchPlaceholder: 'Search poems...',
    selectPoet: 'Select Poet',
    selectCategory: 'Select Category',
    randomPoems: 'Random Poems',
    clearFilters: 'Clear Filters',
    addToList: 'Add to List',
    createNewList: 'Create New List',
    manageLists: 'Manage Lists',
    noPoems: 'No poems found',
    loading: 'Loading...',
    
    // Messages
    loginRequired: 'Please login to add to favorites',
    addedToFavorites: 'Added to favorites',
    removedFromFavorites: 'Removed from favorites',
    loggedOut: 'Successfully logged out',
    loginError: 'Login error',
    signupError: 'Signup error',
    
    // Mock data notice
    mockDataTitle: '📚 Displaying sample poems from great Persian poets',
    mockDataSubtitle: 'All features including search, filter and favorites are active',
    
    // Placeholders
    emailPlaceholder: 'example@email.com',
    phonePlaceholder: '+989123456789',
    phoneHint: 'Phone number must start with country code (example: +98)',
    passwordPlaceholder: 'At least 6 characters',
    confirmPasswordPlaceholder: 'Repeat password',
    namePlaceholder: 'Enter your name',
    verificationCodePlaceholder: '123456',
    
    // States
    sending: 'Sending...',
    verifying: 'Verifying...',
    loggingIn: 'Logging in...',
    signingUp: 'Signing up...',
    
    // Errors
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    phoneRequired: 'Phone number is required',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    invalidCode: 'Invalid verification code',
    sendCodeError: 'Error sending code',
    verifyCodeError: 'Error verifying code',
    resendCodeError: 'Error resending code',
    
    // Success messages
    codeSent: 'Verification code sent',
    codeResent: 'Verification code resent',
    signupSuccess: 'Successfully signed up',
    loginSuccess: 'Successfully logged in',
    
    // Lists
    noLists: 'No lists exist',
    noFavorites: 'You haven\'t added any poems to favorites yet',
    listName: 'List Name',
    listDescription: 'Description',
    createList: 'Create List',
    updateList: 'Update List',
    deleteList: 'Delete List',
    addPoemToList: 'Add Poem to List',
    removePoemFromList: 'Remove Poem from List',
    
    // Poem display
    poems: 'poem',
    unknown: 'Unknown',
    audioNotSupported: 'Your browser does not support audio playback.',
    loadingPoems: 'Loading poems...',
    sampleMode: 'Sample Mode',
    apiUnavailable: 'API Unavailable',

    // Profile and Settings
    userProfile: 'User Profile',
    manageAccountSettings: 'Manage account and settings',
    editProfile: 'Edit Profile',
    darkMode: 'Dark Mode',
    profileImageUpdated: 'Profile image updated successfully',
    profileImageError: 'Error updating profile image',
    fileSizeError: 'File size should not exceed 5MB',
    fileTypeError: 'Please select an image file',
    pleaseLoginAgain: 'Please login again',
    imageProcessingError: 'Error processing image',
    signOutFromAccount: 'Sign out of account',
    dragging: 'Dragging',
    dragToResize: 'Drag to resize',

    // Auth translations
    signInToAccount: 'Sign in to account',
    createNewAccount: 'Create new account',
    resetPassword: 'Reset password',
    accessToFavorites: 'Sign in to access favorites',
    accessToExplanation: 'Sign in to access explanation',
    createNewUserAccount: 'Create a new user account',
    enterYourEmail: 'Enter your email',
    enterName: 'Enter your name',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    enterPasswordAgain: 'Enter your password again',
    processing: 'Processing...',
    signIn: 'Sign In',
    signInWithGoogle: 'Sign in with Google',
    orContinueWith: 'Or continue with',
    createAccount: 'Create Account',
    sendResetLink: 'Send Reset Link',
    dontHaveAccount: 'Don\'t have an account?',
    createAccountLink: 'Create Account',
    haveAccount: 'Have an account?',
    signInLink: 'Sign In',
    forgotPassword: 'Forgot Password',
    backToSignIn: 'Back to Sign In',
    resetLinkSent: 'Reset link sent to your email',
    useEmailInstead: 'Use email instead',
    continueWithGoogle: 'Continue with Google',

    // Password validation
    passwordRequirements: 'Password must include:',
    minCharacters: '• At least 8 characters',
    upperCase: '• One uppercase letter',
    lowerCase: '• One lowercase letter',
    oneNumber: '• One number',
    specialCharacter: '• One special character (!@#$%^&*)',
    passwordsMatch: '✓ Passwords match',
    passwordsDontMatch: '✗ Passwords don\'t match',
    emailAlreadyExists: 'This email is already registered. Would you like to sign in?',
    signInNow: 'Sign in now',
    invalidCredentials: 'Invalid email or password',
    emailNotConfirmed: 'Please confirm your email',
    tooManyRequests: 'Too many requests. Please wait a moment',
    unexpectedError: 'An unexpected error occurred',

    // Favorites
    loadingFavorites: 'Loading favorites...',
    noFavoritesYet: 'You haven\'t favorited any poems yet',
    addFavoritesPrompt: 'Add your favorite poems by tapping the heart',
    goBack: 'Go Back',
    addedOn: 'Added on',
    favoritePoems: 'Favorite Poems',

    // More sheet
    more: 'More',
    close: 'Close',
    poemDetails: 'Poem Details',
    poemDetailsSubtitle: 'Plain text view of the current poem',
    title: 'Title',
    poet: 'Poet',
    poemText: 'Poem Text',
    poemExplanation: 'Explanation',
    lines: 'Lines',
    characters: 'Characters',
    noPoemSelected: 'No poem selected',
    noPoemSelectedSubtitle: 'View a poem to see its details here',
    generatingExplanation: 'Generating explanation...',
    generatingAIExplanation: 'Generating AI explanation...',
    explanationError: 'Error generating explanation',
    explanationTimeout: 'Request timed out. Please try again',
    tryAgain: 'Try again',
    noExplanationGenerated: 'No explanation generated',
    explanationNote: 'This explanation is based on classical literary analysis',
    aiExplanationTag: 'AI Explanation',
    aiDisclaimer: 'The following explanation is generated by AI and may contain errors',
    noContentForTab: 'No content generated for this section',
    
    // Password reset
    passwordUpdated: 'Password updated successfully!',
  }
};

export const getTranslation = (language: Language) => translations[language];