# Glassmorphism UI Design System

## Overview
Updated KhojDu frontend with modern glassmorphism design and proper dark mode support.

## Color Palette

### Light Mode
- **Background:** Soft blue-gray (`220 25% 97%`)
- **Foreground:** Deep navy (`222 47% 11%`)
- **Primary:** Vibrant orange (`24 95% 53%`)
- **Card:** Pure white with transparency
- **Border:** Subtle gray (`220 13% 91%`)

### Dark Mode
- **Background:** Deep navy (`222 47% 6%`)
- **Foreground:** Soft white (`210 40% 98%`)
- **Primary:** Vibrant orange (`24 95% 53%`)
- **Card:** Dark with transparency (`222 47% 11%`)
- **Border:** Subtle dark (`217 33% 17%`)

## Glassmorphism Classes

### Glass Effects

#### `.glass`
Basic glass effect with backdrop blur:
```tsx
<div className="glass p-6 rounded-xl">
  Content here
</div>
```
- Background: 70% opacity
- Backdrop blur: xl
- Border: Semi-transparent
- Shadow: xl

#### `.glass-card`
Enhanced glass card for important content:
```tsx
<Card className="glass-card">
  <CardContent>Premium content</CardContent>
</Card>
```
- Background: 80% opacity
- Backdrop blur: 2xl
- Border: Semi-transparent with color
- Shadow: 2xl
- Border radius: 2xl

#### `.glass-frosted`
Heavy frosted glass effect:
```tsx
<div className="glass-frosted p-8">
  Heavily blurred background
</div>
```
- Background: 60% opacity
- Backdrop blur: 3xl
- Border: More transparent

#### `.glass-subtle`
Subtle glass for backgrounds:
```tsx
<div className="glass-subtle">
  Subtle overlay
</div>
```
- Background: 50% opacity
- Backdrop blur: lg
- Border: Very transparent

### Gradients

#### `.gradient-orange`
Orange gradient for buttons and highlights:
```tsx
<Button className="gradient-orange">
  Click me
</Button>
```

#### `.gradient-bg`
Page background gradient:
```tsx
<div className="min-h-screen gradient-bg">
  Page content
</div>
```

#### `.text-gradient`
Gradient text effect:
```tsx
<h1 className="text-4xl font-bold text-gradient">
  KhojDu
</h1>
```

#### `.animated-gradient`
Animated gradient background:
```tsx
<div className="animated-gradient p-8 text-white">
  Animated content
</div>
```

### Effects

#### `.hover-lift`
Lift effect on hover:
```tsx
<Card className="glass-card hover-lift">
  Hover to lift
</Card>
```

#### `.smooth-shadow`
Soft orange shadow:
```tsx
<div className="smooth-shadow rounded-xl">
  Content with glow
</div>
```

## Component Examples

### Glassmorphism Card
```tsx
<Card className="glass-card hover-lift smooth-shadow">
  <CardHeader>
    <CardTitle className="text-gradient">Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content with beautiful glass effect
  </CardContent>
</Card>
```

### Login/Signup Forms
```tsx
<div className="min-h-screen gradient-bg flex items-center justify-center p-4">
  <Card className="glass-card max-w-md w-full">
    <CardHeader>
      <CardTitle className="text-2xl text-gradient">Welcome Back</CardTitle>
    </CardHeader>
    <CardContent>
      <form className="space-y-4">
        {/* Form fields */}
      </form>
    </CardContent>
  </Card>
</div>
```

### Dashboard Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card className="glass-card hover-lift">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-2xl font-bold text-gradient">1,234</p>
        </div>
        <Eye className="h-8 w-8 text-orange-500" />
      </div>
    </CardContent>
  </Card>
</div>
```

### Navigation/Sidebar
```tsx
<div className="glass-frosted border-r border-border/50">
  <nav className="space-y-2 p-4">
    <button className="w-full glass-subtle hover:glass-card transition-all">
      Menu Item
    </button>
  </nav>
</div>
```

## Dark Mode Support

All glassmorphism classes automatically adapt to dark mode:

```tsx
// Automatically switches between light and dark
<Card className="glass-card">
  {/* Light mode: white/70 with light border */}
  {/* Dark mode: gray-900/70 with dark border */}
</Card>
```

## Best Practices

### 1. Layer Glass Elements
```tsx
<div className="gradient-bg min-h-screen">
  <div className="glass-subtle p-8">
    <Card className="glass-card">
      Content
    </Card>
  </div>
</div>
```

### 2. Combine with Animations
```tsx
<Card className="glass-card hover-lift smooth-shadow transition-all duration-300">
  Interactive card
</Card>
```

### 3. Use Gradients Sparingly
```tsx
{/* Good - accent */}
<h1 className="text-gradient">Main Title</h1>

{/* Good - CTA */}
<Button className="gradient-orange">Sign Up</Button>

{/* Avoid - too much */}
<div className="gradient-orange">
  <p className="text-gradient">Overkill</p>
</div>
```

### 4. Maintain Contrast
```tsx
{/* Good - readable */}
<Card className="glass-card">
  <p className="text-foreground">Clear text</p>
</Card>

{/* Bad - low contrast */}
<Card className="glass-subtle">
  <p className="text-muted-foreground/50">Hard to read</p>
</Card>
```

## Accessibility

### Ensure Sufficient Contrast
- Text on glass: Use `text-foreground` for main content
- Muted text: Use `text-muted-foreground` sparingly
- Test with dark mode enabled

### Focus States
All interactive elements have visible focus states:
```tsx
<Button className="focus-visible:ring-2 ring-orange-500">
  Accessible button
</Button>
```

## Performance

### Backdrop Blur Considerations
- Backdrop blur is GPU-intensive
- Limit number of blurred elements on screen
- Use `glass-subtle` for less critical elements
- Consider disabling blur on low-end devices

### Optimization Tips
```tsx
// Good - single blur container
<div className="glass-card">
  <div>Child 1</div>
  <div>Child 2</div>
</div>

// Avoid - multiple blur layers
<div className="glass-card">
  <div className="glass-card">Nested blur</div>
</div>
```

## Migration Guide

### Update Existing Components

**Before:**
```tsx
<Card className="bg-white dark:bg-gray-900 border shadow-lg">
  Content
</Card>
```

**After:**
```tsx
<Card className="glass-card hover-lift">
  Content
</Card>
```

### Update Backgrounds

**Before:**
```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  Content
</div>
```

**After:**
```tsx
<div className="min-h-screen gradient-bg">
  Content
</div>
```

### Update Buttons

**Before:**
```tsx
<Button className="bg-orange-500 hover:bg-orange-600">
  Click
</Button>
```

**After:**
```tsx
<Button className="gradient-orange hover-lift">
  Click
</Button>
```

## Examples by Page

### Login Page
- Background: `gradient-bg`
- Card: `glass-card`
- Title: `text-gradient`
- Button: `gradient-orange`

### Dashboard
- Background: `gradient-bg`
- Sidebar: `glass-frosted`
- Stats cards: `glass-card hover-lift smooth-shadow`
- Active nav: `glass-card`

### Property Listings
- Card: `glass-card hover-lift`
- Image overlay: `glass-subtle`
- Price badge: `gradient-orange`

## Color Reference

```css
/* Orange Shades */
orange-50: #fff7ed
orange-500: #f97316  /* Primary */
orange-600: #ea580c
orange-700: #c2410c

/* Gray Shades (Light Mode) */
gray-50: #f9fafb
gray-100: #f3f4f6
gray-200: #e5e7eb

/* Gray Shades (Dark Mode) */
gray-800: #1f2937
gray-900: #111827
```

## Summary

✅ **Glassmorphism effects** - Modern, premium look
✅ **Dark mode support** - Automatic theme switching
✅ **Vibrant colors** - Orange primary with gradients
✅ **Smooth animations** - Hover effects and transitions
✅ **Accessibility** - Proper contrast and focus states
✅ **Performance** - Optimized blur usage

Use these classes throughout the app for a consistent, modern glassmorphism design!
