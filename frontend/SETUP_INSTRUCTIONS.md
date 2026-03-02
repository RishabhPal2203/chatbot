# 🎨 Glassmorphism UI Setup Instructions

## Installation Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `framer-motion` - For smooth animations
- `lucide-react` - For modern, clean icons
- `tailwindcss` - For utility-first styling
- `autoprefixer` & `postcss` - For CSS processing

### 2. Start the Development Server

```bash
npm start
```

The app will run on `http://localhost:3000`

### 3. Ensure Backend is Running

Make sure your FastAPI backend is running on `http://localhost:8000`

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🎯 Features Implemented

### ✅ Glassmorphism Design
- Frosted glass effects with `backdrop-filter: blur(20px)`
- Semi-transparent backgrounds
- Subtle borders and shadows
- Dark gradient background (slate/purple tones)

### ✅ Sidebar (Conversation History)
- "New Chat" button with rotating plus icon
- Scrollable conversation list
- Active conversation highlighting
- Delete conversation with 3-dot menu
- User profile section at bottom
- Smooth slide-in/out animation
- Responsive (collapsible on mobile)

### ✅ Chat Window
- Scrollable message area
- User messages (right, blue gradient)
- Bot messages (left, frosted glass)
- Intent detection badges
- Confidence scores
- Typing indicator animation
- Auto-scroll to newest message
- Empty state with welcome message

### ✅ Message Bubbles
- Glassmorphism styling
- Avatar icons (user/bot)
- Timestamps
- Audio playback button for bot messages
- Smooth fade-in animations

### ✅ Input Bar
- Floating glass container
- Auto-expanding textarea
- Voice recording button with pulse animation
- Send button with gradient (enabled when text present)
- Recording state (red pulse, square icon)
- Helper text for keyboard shortcuts

### ✅ Icons (Lucide React)
- `Plus` - New chat
- `MessageSquare` - Conversations
- `Trash2` - Delete
- `User` - Profile
- `Menu` - Toggle sidebar
- `Send` - Send message
- `Mic` - Voice input
- `Square` - Stop recording
- `Volume2` - Play audio
- `Pause/Play` - Audio controls

### ✅ Animations (Framer Motion)
- Sidebar slide-in/out
- Message fade-in with slide-up
- Button hover scale effects
- Recording pulse animation
- Typing indicator dots
- Smooth transitions (0.2-0.3s)

### ✅ Responsive Design
- Desktop: Fixed sidebar (280px)
- Tablet/Mobile: Collapsible sidebar
- Flexbox layout
- Mobile-friendly touch targets

## 🎨 Design Tokens

### Colors
- Background: `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`
- Glass Light: `rgba(255, 255, 255, 0.1)`
- Glass Medium: `rgba(255, 255, 255, 0.05)`
- User Bubble: `from-blue-500 to-cyan-500`
- Bot Avatar: `from-purple-500 to-blue-500`

### Border Radius
- Small: `rounded-xl` (12px)
- Medium: `rounded-2xl` (16px)
- Large: `rounded-3xl` (24px)

### Typography
- Font: Inter (Google Fonts)
- Fallback: System font stack

## 🔧 Component Structure

```
src/
├── components/
│   ├── Sidebar.jsx           # Left sidebar with conversations
│   ├── ConversationItem.jsx  # Individual conversation item
│   ├── ChatWindow.jsx        # Main chat area
│   ├── MessageBubble.jsx     # Individual message
│   └── InputBar.jsx          # Bottom input with voice
├── services/
│   └── api.js                # API calls (existing)
├── App.js                    # Main layout
├── index.js                  # Entry point
└── index.css                 # Global styles + Tailwind

```

## 🚀 Usage

### Text Chat
1. Type message in input bar
2. Press Enter or click Send button
3. View bot response with intent detection

### Voice Chat
1. Click microphone button
2. Speak your message
3. Click stop (square icon) when done
4. Message auto-transcribes and sends

### Audio Playback
1. Click "Play Audio" button on bot messages
2. Listen to TTS response

### Conversation Management
1. Click "New Chat" to start fresh conversation
2. Click conversation in sidebar to switch
3. Click 3-dot menu → Delete to remove

## 🎯 Integration with Existing Backend

The UI is fully integrated with your existing FastAPI backend:

- `POST /api/chat` - Text messages
- `POST /api/transcribe` - Voice transcription
- `POST /api/tts` - Text-to-speech

All API calls are handled in `src/services/api.js` (unchanged).

## 📱 Responsive Breakpoints

- Desktop: `lg:` (1024px+) - Fixed sidebar
- Tablet: `md:` (768px-1023px) - Collapsible sidebar
- Mobile: `< 768px` - Slide-in drawer

## 🎨 Customization

### Change Theme Colors

Edit `src/App.js`:
```jsx
className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
```

### Adjust Glass Blur

Edit `src/index.css`:
```css
.glass {
  backdrop-filter: blur(20px); /* Increase for more blur */
}
```

### Modify Animations

Edit component files with Framer Motion props:
```jsx
transition={{ duration: 0.3, ease: 'easeInOut' }}
```

## 🐛 Troubleshooting

**Issue**: Styles not applying
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Icons not showing
```bash
# Ensure lucide-react is installed
npm install lucide-react
```

**Issue**: Animations not smooth
- Check browser supports `backdrop-filter`
- Enable hardware acceleration in browser

## 🎉 Result

You now have a production-ready, Apple-inspired glassmorphism UI that looks like a premium SaaS product!

**Key Features:**
- ✅ Modern glass design
- ✅ Smooth animations
- ✅ Voice + text input
- ✅ Conversation history
- ✅ Fully responsive
- ✅ Production-ready code
