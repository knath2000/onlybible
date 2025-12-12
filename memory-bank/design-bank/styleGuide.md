# Style Guide: Liquid Glass Design System

## CSS Custom Properties (Design Tokens)

```css
:root {
  /* Luminous Verses Color Palette */
  --gold: #f5a623;
  --gold-light: #ffc857;
  --gold-dark: #d4900d;
  --purple-dark: #0d0d1a;
  --purple-mid: #1a1a2e;
  --purple-light: #252542;
  --purple-accent: #3d3d6b;

  /* Aurora Accents for Liquid Glass Enhancement */
  --aurora-magenta: #e91e63;
  --aurora-magenta-light: #ff4081;
  --aurora-magenta-dark: #c2185b;
  --aurora-cyan: #00bcd4;
  --aurora-cyan-light: #26c6da;
  --aurora-cyan-dark: #0097a7;
  --aurora-indigo: #3f51b5;
  --aurora-indigo-light: #7986cb;
  --aurora-indigo-dark: #303f9f;

  /* Glass Elevation Tiers */
  --glass-bg-low: rgba(37, 37, 66, 0.4);
  --glass-bg-mid: rgba(37, 37, 66, 0.6);
  --glass-bg-high: rgba(37, 37, 66, 0.8);
  --glass-border-low: rgba(255, 255, 255, 0.08);
  --glass-border-mid: rgba(255, 255, 255, 0.1);
  --glass-border-high: rgba(255, 255, 255, 0.15);
  --glass-shadow-low: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
  --glass-shadow-mid: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  --glass-shadow-high: 0 16px 64px 0 rgba(0, 0, 0, 0.4);

  /* Specular Highlights for Liquid Glass */
  --specular-highlight: rgba(255, 255, 255, 0.2);
  --specular-rim: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);

  /* Effect Controls */
  --noise-opacity: 0.015;
  --noise-opacity-reduced: 0.005;
  --aurora-blur: 80px;

  /* Focus Rings for Accessibility */
  --focus-ring: 0 0 0 2px rgba(245, 166, 35, 0.5);
  --focus-ring-inset: inset 0 0 0 2px rgba(245, 166, 35, 0.5);

  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);
}
```

## Component Variants

### GlassCard
```typescript
interface GlassCardProps {
  variant?: 'default' | 'liquid';
  elevation?: 'low' | 'mid' | 'high';
  hover?: boolean;
  children: React.ReactNode;
}
```

### GlassButton
```typescript
interface GlassButtonProps {
  variant?: 'default' | 'gold' | 'outline' | 'ghost' | 'liquid';
  elevation?: 'low' | 'mid' | 'high';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

### GlassInput
```typescript
interface GlassInputProps {
  variant?: 'default' | 'liquid';
  elevation?: 'low' | 'mid' | 'high';
  type?: string;
  placeholder?: string;
}
```

## Utility Classes

### Aurora Background System
```css
.aurora-bg          /* Layered mesh gradient background */
.noise-overlay      /* Subtle texture overlay */
.vignette          /* Depth vignette effect */
```

### Liquid Glass Surfaces
```css
.liquid-surface     /* Base liquid glass styling */
.liquid-border      /* Gradient border with specular rim */
.liquid-surface-low  /* Low elevation variant */
.liquid-surface-high /* High elevation variant */
```

### Accessibility & Motion
```css
.reduced-effects    /* Applies reduced motion preferences */
.focus-ring        /* Standard focus ring */
.focus-ring-inset  /* Inset focus ring */
```

## Typography Scale

### Font Families
- **Sacred Text**: `font-[family-name:var(--font-playfair)]` (serif, italic)
- **UI Text**: `font-[family-name:var(--font-sans)]` (sans-serif)
- **English Translation**: `var(--font-serif)` (serif)

### Text Sizes (Responsive)
```css
text-xs   /* 0.75rem  - Small labels */
text-sm   /* 0.875rem - Body text, buttons */
text-base /* 1rem     - Primary content */
text-lg   /* 1.125rem - Large buttons */
text-xl   /* 1.25rem  - Headings */
text-2xl  /* 1.5rem   - Section headers */
text-4xl  /* 2.25rem  - Page titles */
```

### Line Heights
```css
leading-tight   /* 1.25  - Tight spacing */
leading-relaxed /* 1.625 - Comfortable reading */
leading-loose   /* 2     - Generous spacing */
```

## Spacing Scale (Tailwind-based)

### Padding/Margin
```css
p-1  /* 0.25rem */    m-1  /* 0.25rem */
p-2  /* 0.5rem */     m-2  /* 0.5rem */
p-3  /* 0.75rem */    m-3  /* 0.75rem */
p-4  /* 1rem */       m-4  /* 1rem */
p-6  /* 1.5rem */     m-6  /* 1.5rem */
p-8  /* 2rem */       m-8  /* 2rem */
```

### Gaps
```css
gap-2  /* 0.5rem */
gap-3  /* 0.75rem */
gap-4  /* 1rem */
gap-6  /* 1.5rem */
gap-8  /* 2rem */
```

## Border Radius Scale

```css
rounded-lg   /* 0.5rem  - Small elements */
rounded-xl   /* 0.75rem - Cards, inputs */
rounded-2xl  /* 1rem    - Large surfaces */
rounded-3xl  /* 1.5rem  - Hero elements */
```

## Animation Guidelines

### Duration Scale
```css
duration-150   /* 150ms - Micro interactions */
duration-200   /* 200ms - Quick feedback */
duration-300   /* 300ms - Standard transitions */
duration-500   /* 500ms - Content changes */
```

### Easing Functions
```css
ease-out       /* Standard easing */
ease-in-out    /* Smooth bidirectional */
cubic-bezier(0.4, 0, 0.2, 1)  /* Material design */
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Shadow System

### Elevation Levels
```css
shadow-sm     /* Subtle borders */
shadow-md     /* Card shadows */
shadow-lg     /* Modal shadows */
shadow-xl     /* Hero elements */
shadow-2xl    /* Maximum depth */
```

### Glass Shadows
```css
--glass-shadow-low: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
--glass-shadow-mid: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
--glass-shadow-high: 0 16px 64px 0 rgba(0, 0, 0, 0.4);
```

## Responsive Breakpoints

```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Laptops */
2xl: 1536px /* Large screens */
```

## Component-Specific Guidelines

### Verse Cards
- Use `liquid-surface` with `elevation="mid"`
- Apply `hover:scale-[1.02]` for subtle lift
- Current verse gets `ring-2 ring-gold/50`

### Navigation Pills
- Use `nav-pill` class for consistent styling
- Include focus states with `focus-ring`

### Tooltips
- Use `liquid-border` for glassmorphic appearance
- Position with `bottom-full` and custom arrow
- Respect reduced motion preferences

### Buttons
- Primary actions: `variant="liquid"` with gold accents
- Secondary actions: `variant="liquid"` with low elevation
- Ghost actions: `variant="ghost"` for subtle interactions
