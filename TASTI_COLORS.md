# Tasti Brand Colors & Customization Guide

## 🎨 Vanilla Cream Color Palette

### Primary Colors
- **Vanilla Cream (Background)**: `#f5f1ed` - Soft, warm cream
- **Ice Cream White (Card Background)**: `#faf7f3` - Light off-white
- **Card Foreground**: `#fff9f5` - Warmest cream tone

### Accent Colors (Chocolate & Caramel)
- **Tasti Brown (Primary Accent)**: `#d4794f` - Rich chocolate brown
- **Caramel (Secondary Accent)**: `#e8956a` - Warm caramel/toffee

### Supporting Colors
- **Vanilla Bean**: `#f5deb3` - Light vanilla
- **Chocolate Dark**: `#8b6f47` - Deep chocolate
- **Chocolate Medium**: `#a89968` - Medium chocolate
- **Mocha Text**: `#2b2520` - Dark brown text (replaces white)

### Status Colors (Updated for Tasti)
- **Not Contacted**: `rgba(212,121,79,0.08)` with text `#8b6f47`
- **Request Sent**: `rgba(139,111,71,0.08)` with text `#8b6f47`
- **Accepted / DM Sent**: `rgba(212,121,79,0.12)` with text `#d4794f`
- **Following Up**: `rgba(232,149,106,0.08)` with text `#e8956a`
- **Replied / Follow Up**: `rgba(184,149,106,0.10)` with text `#b8956a`
- **Booked**: `rgba(212,121,79,0.15)` with text `#c85a54`
- **2nd Call**: `rgba(184,149,106,0.12)` with text `#b8956a`
- **Not Interested**: `rgba(200,90,84,0.08)` with text `#c85a54`
- **Closed**: `rgba(139,111,71,0.08)` with text `#8b6f47`

## 🎯 Persona Colors (Tasti)

```javascript
const PC = {
  "Fitness Coach": "#d4794f",      // Chocolate brown
  "Nutritionist": "#e8956a",       // Caramel
  "Gym Owner": "#8b6f47",          // Deep chocolate
  "Health Brand": "#b8956a",       // Vanilla brown
  "Influencer": "#c85a54",         // Warmth/Berry
  "Affiliate": "#a89968",          // Chocolate medium
  "Other": "#9d8b7e"              // Muted taupe
};
```

## 🔄 Where to Customize in `app/page.js`

### Color Palette (Line 7)
```javascript
const C = {
  navy: "#f5f1ed",              // Vanilla Cream background
  deep: "#faf7f3",              // Ice Cream White
  card: "#fff9f5",              // Card foreground
  border: "rgba(0,0,0,0.08)",   // Subtle borders
  bL: "rgba(0,0,0,0.04)",       // Light borders
  teal: "#d4794f",              // Tasti Brown (primary)
  teal2: "#e8956a",             // Caramel (secondary)
  blue: "#8b6f47",              // Chocolate Dark
  blue2: "#a89968",             // Chocolate Medium
  gold: "#f5deb3",              // Vanilla Bean
  white: "#2b2520",             // Text color (dark brown)
  soft: "rgba(43,37,32,0.75)",  // Soft text
  muted: "#9d8b7e",             // Muted taupe
  red: "#c85a54",               // Warmth
  purple: "#b8956a"             // Vanilla brown
};
```

### Gradient (Line 12)
```javascript
const GRAD = "linear-gradient(90deg,#d4794f,#e8956a)";
// Chocolate brown → Caramel gradient
```

### Persona Colors (Line 47-48)
```javascript
const PERSONAS = ["Fitness Coach","Nutritionist","Gym Owner","Health Brand","Influencer","Affiliate","Other"];
const PC = {
  "Fitness Coach": "#d4794f",
  "Nutritionist": "#e8956a",
  "Gym Owner": "#8b6f47",
  "Health Brand": "#b8956a",
  "Influencer": "#c85a54",
  "Affiliate": "#a89968",
  Other: C.muted
};
```

## 🎨 Visual Examples

### Light Mode (Current)
- Cream/vanilla background feels premium and food-focused
- Chocolate/caramel accents tie to ice cream product
- Dark brown text is readable and professional
- Soft borders maintain elegant spacing

### Dark Mode Alternative (Optional)
If you want to add dark mode in the future:
- Background: `#3a3430` (dark chocolate)
- Cards: `#4a403a` (lighter chocolate)
- Text: `#f5f1ed` (vanilla cream)
- Accents: Same as light mode

## 🎭 Application

These colors are used for:
- **UI Backgrounds**: Vanilla/cream (approachable, food-related)
- **Cards & Components**: Light off-white with subtle shadows
- **Buttons & CTAs**: Chocolate brown to caramel gradient
- **Status Badges**: Semi-transparent chocolate tones
- **Text**: Dark brown for contrast and readability
- **Accent Highlights**: Caramel for interactive states

## 📱 Responsive Design

Colors look great on all screen sizes due to:
- High contrast ratios (brown text on cream background)
- Subtle shadows for depth
- Semi-transparent overlays that feel elegant
- Consistent color usage across components

## 🚀 How to Update Colors

To change any color throughout the app:

1. Edit the color value in the `C` object (line 7)
2. Update corresponding status colors if needed (line 17)
3. Update persona colors if desired (line 48)
4. Test on both light and dark backgrounds
5. Check contrast ratios with color checker tool

## ✨ Tasti Brand Alignment

This color palette aligns with Tasti's brand:
- **Vanilla/Cream**: Premium, natural, clean eating
- **Chocolate/Caramel**: Delicious, indulgent, ice cream
- **Warm tones**: Approachable, friendly, health-focused
- **Professional look**: B2B partnership credibility

---

**All customizations are in `app/page.js` - easy to modify if brand colors change!**
