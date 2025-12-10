# Bible Reading App with Spanish Translation

A modern Next.js web application for reading the Bible in Spanish (Reina-Valera version) with instant translation capabilities to English.

## 🚀 Features

- **Spanish Bible Reading**: Access any chapter and verse from the Reina-Valera Bible
- **Verse Translation**: Translate entire verses from Spanish to English
- **Word Translation**: Hover over individual words for instant translation
- **Beautiful UI**: Glassmorphic design with smooth animations
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Performance Optimized**: Built-in caching for fast loading
- **Easy Navigation**: Quick chapter and verse selection
- **Infinite Scrolling**: Seamless verse loading as you scroll, with chapter transitions and prefetching.

## 📁 Project Structure

```
.
├── app/                  # Next.js app pages
├── components/           # React components
│   ├── ui/                # Glassmorphic UI components
│   ├── BibleReader.tsx    # Main reading interface
│   └── WordTranslationTooltip.tsx
├── lib/                  # Core functionality
│   ├── api.ts             # API service layer
│   ├── context/           # State management
│   ├── services/          # API services
│   └── demo/              # Demo functionality
├── memory-bank/          # Project documentation
└── public/               # Static assets
```

## 🛠️ Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React with Tailwind CSS
- **State Management**: React Context + useReducer
- **API**: Bible API (bible-api.com) + Mock Translation Service
- **Design**: Glassmorphic CSS with custom animations

## 📖 How to Use

1. **Select a Book**: Choose from the dropdown list of Bible books
2. **Choose Chapter**: Select the chapter you want to read
3. **Pick a Verse**: Select the specific verse
4. **Read in Spanish**: The verse appears in Spanish
5. **Translate Verse**: Click "Traducir Versículo" to see English translation
6. **Translate Words**: Hover over individual Spanish words for instant translation

## Infinite Scrolling

The reader now supports infinite scrolling for verses, loading in chunks (configurable in settings: 10/20/50). Select book/chapter to start, scroll down to load more. Translations and alignments work per verse. Jump via search or URL anchors (#BookChapter:Verse).

## 🔧 Installation

```bash
npm install
npm run dev
```

## 🔊 Text-to-Speech (Audio)

To enable tap-to-listen audio for verses via a cloud TTS provider (Azure Speech):

```
TTS_PROVIDER=azure
TTS_API_KEY=your-azure-speech-key
TTS_REGION=your-azure-region
TTS_VOICE=es-ES-AlvaroNeural
```

If these variables are not set, audio requests will return an error. The app remains fully functional for reading and translation without TTS.

## 🎨 Design Features

- **Glassmorphic UI**: Modern frosted glass effect with blur
- **Smooth Animations**: Fade-ins, transitions, and hover effects
- **Responsive Layout**: Adapts to all screen sizes
- **Dark Theme**: Optimized for night reading
- **Accessible**: Keyboard navigation and screen reader support

## 🔄 Translation System

- **Verse Translation**: Full verse translation with caching
- **Word Translation**: Individual word tooltips with hover effects
- **Mock Service**: Built-in Spanish-English translation dictionary
- **Cache System**: 1-hour caching for translations, 24-hour for Bible content

## 🚀 Future Enhancements

- Real translation API integration (Google Translate/DeepL)
- Multiple Bible versions
- Bookmarking and notes
- Audio reading
- Search functionality
- User accounts and preferences

## 📝 API Information

- **Bible API**: [biblia-api.vercel.app](https://biblia-api.vercel.app/) (Reina-Valera 1960 Spanish)
- **Translation**: Mock service (replaceable with real API)

### 🔐 CORS Solutions for Production

The app currently uses mock data to avoid CORS issues in development. For production deployment, you have several options:

1. **Server-Side Proxy**: Create Next.js API routes that proxy requests
2. **CORS Proxy**: Use a service like https://cors-anywhere.herokuapp.com/
3. **Vercel Deployment**: Deploy to Vercel where CORS is automatically handled
4. **Backend Service**: Create a simple Node.js backend to handle API requests

### 🛠️ Production Setup

To switch to real API in production:

```typescript
// In BibleService.ts
const bibleService = new BibleService(cacheService);
bibleService.setUseMockData(false); // Disable mock data
```

### 📚 Mock Data

The app includes comprehensive mock data for:
- 66 Bible books in Spanish
- Chapter and verse structure
- Sample verses from key passages
- Full navigation support

## 🎯 Project Goals

✅ Create a beautiful, functional Bible reading app
✅ Implement Spanish to English translation features
✅ Build responsive glassmorphic UI
✅ Add performance optimizations with caching
✅ Provide comprehensive documentation

## 📚 Usage

1. Start the development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Select a Bible book, chapter, and verse
4. Read and translate as needed

## 💡 Tips

- Use the navigation buttons for quick verse browsing
- Hover over words to see translations
- Toggle translation mode for different views
- The app works offline after initial load (cached content)

## 📈 Performance

- **Caching**: Bible verses cached for 24 hours
- **Translation Cache**: 1-hour cache for translations
- **Lazy Loading**: Components load as needed
- **Optimized**: Minimal API calls with smart caching

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## 📱 Mobile Features

- Touch-friendly controls
- Responsive typography
- Optimized layout
- Fast loading

## 🔒 Security

- No user data collection
- Client-side only
- Secure API calls
- Privacy-focused design

## 🎓 Learning Spanish

This app is perfect for:
- Spanish language learners
- Bible study in both languages
- Pastors preparing bilingual sermons
- Missionaries and translators

## 🙏 Contributing

Contributions welcome! Focus areas:
- Real translation API integration
- Additional Bible versions
- Enhanced mobile features
- Accessibility improvements
- Performance optimizations

## 📜 License

MIT License - Free for personal and commercial use
