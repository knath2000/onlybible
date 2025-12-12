# Component Library: Liquid Glass UI Components

## Core Components

### GlassCard
Premium glassmorphic surface container with elevation variants.

**Props:**
```typescript
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'liquid';
  elevation?: 'low' | 'mid' | 'high';
  hover?: boolean;
  onClick?: () => void;
}
```

**Usage:**
```jsx
// Basic card
<GlassCard>
  <h3>Card Title</h3>
  <p>Card content</p>
</GlassCard>

// Interactive liquid card
<GlassCard variant="liquid" elevation="mid" hover>
  <div>Hoverable content</div>
</GlassCard>
```

**Styling:**
- **Default**: Standard glassmorphism with blur and border
- **Liquid**: Enhanced with specular highlights and gradient borders
- **Elevation**: Low/Mid/High shadow and opacity variants

### GlassButton
Versatile button component with multiple visual variants.

**Props:**
```typescript
interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'gold' | 'outline' | 'ghost' | 'liquid';
  size?: 'sm' | 'md' | 'lg';
  elevation?: 'low' | 'mid' | 'high';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}
```

**Variants:**
- **Default**: Semi-transparent background with subtle border
- **Gold**: Gradient gold background with enhanced shadows
- **Outline**: Transparent with gold border
- **Ghost**: Minimal styling for subtle actions
- **Liquid**: Glassmorphic with specular highlights

**Sizes:**
- **sm**: Compact (px-3 py-1.5, text-sm)
- **md**: Standard (px-4 py-2, text-base)
- **lg**: Large (px-6 py-3, text-lg)

### GlassInput
Glassmorphic form input component.

**Props:**
```typescript
interface GlassInputProps {
  value?: string | number;
  onChange?: (value: any) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  label?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'liquid';
  elevation?: 'low' | 'mid' | 'high';
}
```

**Usage:**
```jsx
// Text input
<GlassInput
  label="Search"
  placeholder="Enter search term"
  variant="liquid"
/>

// Select dropdown
<GlassInput variant="liquid">
  <select>
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
</GlassInput>
```

## Specialized Components

### VerseItem
Complex component for displaying Bible verses with translations and alignment.

**Props:**
```typescript
interface VerseItemProps {
  verse: BibleVerse;
  isCurrentVerse?: boolean;
}
```

**Structure:**
```jsx
<VerseItem verse={verse} isCurrentVerse={true}>
  {/* Verse number pill */}
  {/* TTS button */}
  {/* Spanish text container */}
  {/* Word translation tooltips */}
  {/* Expandable English translation */}
  {/* Alignment overlay */}
</VerseItem>
```

**Features:**
- **Current verse highlighting**: Ring and scale effects
- **Translation toggle**: Smooth expand/collapse
- **Word tooltips**: Liquid glass popovers
- **TTS integration**: Play/pause verse audio

### WordTranslationTooltip
Interactive tooltip for word translations with liquid glass styling.

**Props:**
```typescript
interface WordTranslationTooltipProps {
  word: string;
  children: React.ReactNode;
  onHover?: () => void;
  onHoverEnd?: () => void;
}
```

**States:**
- **Loading**: Shows translation fetch progress
- **Translation**: Displays original → translated word
- **Same**: Indicates identical meaning
- **Error**: Shows fallback message

### AlignmentOverlay
SVG-based visualization of word alignments between languages.

**Props:**
```typescript
interface AlignmentOverlayProps {
  active: boolean;
  sourceRect: DOMRect | null;
  targetRects: DOMRect[];
  containerRect: DOMRect | null;
}
```

**Features:**
- **Gradient strokes**: Luminous color transitions
- **Animated drawing**: Progressive line reveal
- **Glow effects**: Softened outer glow
- **Reduced motion**: Respects user preferences

### InfiniteVerseList
Virtualized list component for seamless verse scrolling.

**Props:**
```typescript
interface InfiniteVerseListProps {
  // Uses global state from BibleContext
}
```

**Features:**
- **IntersectionObserver**: Automatic loading trigger
- **Current verse detection**: Automatic highlighting
- **Smooth scrolling**: Anchor-based navigation
- **Loading states**: Spinner and end-of-chapter indicators

## Layout Components

### SpanishBibleReader
Main application layout component with multiple views.

**Views:**
- **Home**: Welcome screen with verse of the day
- **Reader**: Main Bible reading interface
- **Settings**: Configuration panel

**Structure:**
```jsx
<SpanishBibleReader>
  {/* Aurora background layers */}
  {/* Reader stage surface */}
  {/* Conditional view rendering */}
  {/* Modal overlays */}
</SpanishBibleReader>
```

### SettingsPanel
Comprehensive settings modal with accessibility options.

**Sections:**
- **Typography**: Font size controls
- **Theme**: Visual theme selection
- **Translation**: Mode and behavior settings
- **Performance**: Reduce effects toggle
- **Audio**: TTS preferences

### SearchPanel
Advanced search interface with history and results.

**Features:**
- **Query input**: Real-time search suggestions
- **History**: Recent searches with quick access
- **Results**: Card-based result display
- **Navigation**: Direct verse jumping

## Utility Components

### LoadingSpinner
Animated loading indicator with size variants.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### GlassmorphicDivider
Elegant separator with gold accent styling.

```jsx
<GlassmorphicDivider />
```

## Animation System

### Keyframe Definitions
```css
@keyframes aurora-drift {
  0% { transform: translateX(-5%) translateY(-3%) scale(1); }
  100% { transform: translateX(5%) translateY(3%) scale(1.05); }
}

@keyframes draw-line {
  to { stroke-dashoffset: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Animation Classes
```css
.animate-fade-in        /* Standard entrance */
.animate-fade-in-up     /* Upward slide entrance */
.animate-pulse-gold     /* Gold accent pulsing */
```

### Reduced Motion Support
All animations respect `prefers-reduced-motion: reduce` and can be disabled via user settings.

## Accessibility Features

### Focus Management
- **Focus rings**: Visible focus indicators for keyboard navigation
- **Tab order**: Logical navigation flow
- **Focus trapping**: Modal focus containment

### ARIA Support
- **Labels**: Comprehensive aria-label attributes
- **Live regions**: Dynamic content announcements
- **Roles**: Semantic role assignments

### Motion Preferences
- **Reduced motion**: Automatic detection and adaptation
- **User controls**: Manual override options
- **Progressive enhancement**: Core functionality without animations

## Performance Optimizations

### Rendering Strategies
- **Memoization**: React.memo for expensive components
- **Virtualization**: Windowing for large verse lists
- **Lazy loading**: Dynamic imports for modals

### Bundle Optimization
- **Code splitting**: Route-based chunking
- **Tree shaking**: Unused code elimination
- **Compression**: Gzip and Brotli optimization

### Runtime Performance
- **GPU acceleration**: Transform-based animations
- **Efficient selectors**: Class-based styling
- **Memory management**: Proper cleanup and unmounting
