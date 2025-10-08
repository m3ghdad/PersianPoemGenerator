# Persian Poem Generator App (رباعی وتار)

A beautiful, modern web application for discovering and enjoying Persian poetry. Browse randomly generated poems from the Ganjoor API, save your favorites, get AI-powered explanations, and enjoy poems in both Persian and English.

## ✨ Features

### Core Functionality
- **Random Poem Generation**: Discover Persian poems from the comprehensive Ganjoor API
- **English Translation**: Automatically translate Persian poems to English using AI
- **AI-Powered Explanations**: Get detailed interpretations and analysis of poems
- **Favorites System**: Save and manage your favorite poems with cloud sync
- **Audio Playback**: Listen to poems being read aloud

### User Experience
- **Bilingual Support**: Seamlessly switch between Persian (Farsi) and English
- **Dark/Light Themes**: Beautiful theme switching for comfortable reading
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Elegant transitions using Framer Motion
- **Swipe Navigation**: TikTok-style vertical scrolling between poems

### User Management
- **Secure Authentication**: User authentication powered by Supabase
- **User Profiles**: Personalized profile management
- **Cloud Sync**: Favorites and preferences synced across devices

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS for responsive, modern design
- **Animations**: Framer Motion for smooth, performant animations

### Backend & Services
- **Authentication & Database**: Supabase
- **Poetry API**: Ganjoor API for Persian poetry
- **AI Translation**: OpenAI GPT for poem translation and explanations
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/m3ghdad/PersianPoemGenerator.git
cd PersianPoemGenerator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3001`

## 📦 Build for Production

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 🎨 Key Features in Detail

### Poem Discovery
- Vertical swipe navigation (similar to TikTok/Instagram Reels)
- Random poems from the extensive Ganjoor poetry database
- Poet attribution and metadata display
- Typewriter animation for engaging poem display

### Language & Translation
- **Persian Mode**: Original poems in beautiful Persian typography
- **English Mode**: AI-translated poems maintaining poetic quality
- Automatic poet name transliteration (e.g., حافظ → Hafez)
- Context-aware language switching

### AI Explanations
- Line-by-line analysis of poems
- Thematic interpretation
- Symbolism and imagery explanation
- Cultural and historical context

### Favorites & Collections
- Save unlimited favorite poems
- Organize and browse your collection
- Cloud sync across devices
- Quick access to saved poems

## 🌐 API Integration

### Ganjoor API
The app integrates with the [Ganjoor API](https://api.ganjoor.net) to fetch authentic Persian poetry from classical and contemporary poets including:
- Hafez (حافظ)
- Rumi (مولانا)
- Saadi (سعدی)
- Ferdowsi (فردوسی)
- Omar Khayyam (عمر خیام)
- And many more...

### Translation & AI
- Poem translation using OpenAI GPT models
- Scholarly-level explanations (tafsir) in Persian and English
- Caching system for improved performance

## 🎯 Usage

1. **Select Your Language**: Choose Persian or English on the welcome screen
2. **Discover Poems**: Swipe up/down or use arrow keys to navigate
3. **Save Favorites**: Click the heart icon to save poems you love
4. **Get Explanations**: Tap "More" to see detailed AI-powered analysis
5. **Switch Languages**: Use the language toggle to switch between Persian and English
6. **Toggle Theme**: Switch between dark and light modes for comfortable reading

## 📱 Keyboard Shortcuts

- `↑` / `↓` - Navigate between poems
- `←` / `→` - Navigate between poems

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/m3ghdad/PersianPoemGenerator/issues).

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Created by **Meghdad Abbaszadegan**
- Website: [www.meghdad.co](https://www.meghdad.co)
- GitHub: [@m3ghdad](https://github.com/m3ghdad)

---

**Enjoy discovering the beauty of Persian poetry!** 🌟
  