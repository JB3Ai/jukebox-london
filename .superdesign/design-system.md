# JukeBox London — Design System v1.0
## Cyber-Noir London Edition

---

## Product Context

**JukeBox** is a premium AI-native electronic music app for iOS (SwiftUI / Metal), targeting professional DJs and serious music enthusiasts in UK rave culture. It is powered by Google Lyria 3 / Producer.ai and transforms passive consumption into active "Vibe Conducting" — users shape real-time, infinite AI-generated music streams.

**London Legend Edition**: Pre-loaded AI seed models trained on 1990s Jungle, 2-Step Garage, and UK Dubstep. Integrated with Google Stitch for studio-grade production.

### Key Screens
1. Dashboard (Phase Selector) — Phase Wheel rotary dial
2. Genre Explorer — 2-column glassmorphic grid
3. Now Playing — Full-screen hardware interface with waveform visualiser
4. Smart Mixer — Split-screen phase transition with cross-fade slider
5. The Afters Zone (Phase 4) — Minimalist dark mode, 60 BPM breath pulse
6. Search & Discover — Vibe Tags (#Warehouse, #RainyAfternoon, #SunrisePatio)
7. History / The Vault — Vertical timeline with glass tiles
8. Settings & Hardware Sync — Pioneer CDJ-3000 / Allen & Heath Xone:96

### 4 Energy Phases (50 Sub-Genres)
| Phase | Code | Vibe | Key Genres |
|-------|------|------|------------|
| 1 | PEAK-BASS | Peak Hour & Heavy Bass | Techno, Neurofunk, Hard Techno, Bass House, Dubstep, Jungle, Acid Techno, Psytrance, Hardstyle |
| 2 | MAIN-FLOOR | Groove & Flow | Deep House, Tech House, UK Garage, Afro House, Amapiano, Nu-Disco, Liquid D&B |
| 3 | SUNRISE | The Transition | Organic House, Balearic Beat, Breakbeat, Future Garage, Dub Techno, Lo-Fi House |
| 4 | ZONED-OUT | Chilled After-Party | Trip-Hop, Downtempo, Lo-Fi Hip Hop, Ambient Dub, Chillwave, Vaporwave, IDM, Dark Ambient |

---

## Colour System

| Token | Hex | Usage |
|-------|-----|-------|
| `cyber-peak-bg` | `#0A0A0F` | Background — Phases 1 & 2 (Club/Peak) |
| `hyper-magenta` | `#7B00CC` | Primary accent / AI shimmer / CTA — deep violet-purple, not neon pink |
| `electric-cyan` | `#00E6F2` | Secondary accent / rack glow / highlights |
| `parchment` | `#F2E6CE` | Background — Phase 4 (Afters) |
| `mist-blue` | `#A7C7E7` | Sunrise accents — Phase 3 |
| `muted-salmon` | `#E9967A` | Dawn highlights — Phase 3/4 |
| `surface-glass` | `rgba(255,255,255,0.05)` | Glass panel background |
| `border-glass` | `rgba(255,255,255,0.08)` | Glass panel border |
| `text-primary` | `#FFFFFF` | Primary text on dark |
| `text-secondary` | `rgba(255,255,255,0.6)` | Secondary/muted text |

### Glow Effects
- **Violet glow**: `box-shadow: 0 0 30px rgba(123, 0, 204, 0.4), 0 0 60px rgba(123, 0, 204, 0.2)`
- **Cyan glow**: `box-shadow: 0 0 30px rgba(0, 230, 242, 0.4), 0 0 60px rgba(0, 230, 242, 0.2)`
- **Combined neon halo**: `radial-gradient(ellipse at center, rgba(123,0,204,0.15) 0%, rgba(0,230,242,0.15) 50%, transparent 70%)`

---

## Typography

| Role | Typeface | Weight/Style | Usage |
|------|----------|-------------|-------|
| Display/Hero | Druk Wide | Heavy (900); width scales with BPM | Phase labels, artist names, hero headlines |
| UI/System | SF Pro Rounded | Regular (400) / Bold (700) | All interactive elements, buttons, nav |
| Editorial/Docs | Neue Montreal | Regular (400) / Medium (500) | History cards, liner notes, descriptions |
| Technical Data | SF Mono | Regular (400) | BPM readout, cost monitor, technical stats |

**Typography Rules:**
- Typography scales rhythmically with the BPM meta-tag
- Large Titles: 34pt SF Pro Rounded following iOS hierarchy
- Hero headlines: Druk Wide at 72–120px
- Line-height: 1.0–1.1 for display, 1.5–1.6 for body

---

## Liquid Glass UI System

The core visual language is **Liquid Glass** — high-refraction blurs + neon accents.

```css
/* Standard Glass Panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

/* Elevated Glass (Cards) */
.glass-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Neon Accent Border */
.neon-border-cyan {
  border: 1px solid rgba(0, 230, 242, 0.4);
  box-shadow: 0 0 20px rgba(0, 230, 242, 0.15), inset 0 0 20px rgba(0, 230, 242, 0.05);
}

.neon-border-magenta {
  border: 1px solid rgba(123, 0, 204, 0.4);
  box-shadow: 0 0 20px rgba(123, 0, 204, 0.15), inset 0 0 20px rgba(123, 0, 204, 0.05);
}
```

---

## Spacing & Layout

- **Base unit**: 8px grid
- **Standard margins**: 16px
- **Component padding**: 16–24px
- **Border radius**: 6–8px for cards, 4px for buttons, 2px for pills
- **Touch targets**: minimum 44×44pt (HIG compliant)
- **Sections**: 80–120px vertical padding

---

## Motion & Animation

- **Spring timing**: Response 0.45s, Damping 0.8 (Apple HIG Fluid Interfaces)
- **Standard transitions**: 300–500ms ease-in-out
- **Phase transition**: Full UI colour profile shift in 0.45s spring
- **Pinch-to-Expand**: Screen flexes inward → metal seam opens → EQ sliders peek → Heavy Impact haptic
- **BPM pulse**: Elements can pulse at current track BPM (60–180 BPM)
- **Breath pulse (Phase 4)**: UI elements pulse at 60 BPM for relaxation

### Scroll Animation: "Exploded View" Assembly
Key hero interaction for landing/onboarding:
1. **Pinned central product mockup** — the JukeBox hardware face / Now Playing screen
2. **On scroll**: Internal components (UI layers, waveform, phase dial, genre tiles, EQ sliders) explode outwards in different directions with staggered timing
3. **Continue scrolling**: Components fly back together with spring physics and lock into a final, different layout (e.g., the Pro Studio Rack or Genre Explorer)
- Use `transform: translate()` with staggered `transition-delay` per component
- Spring easing: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- Each component exits/enters on its own axis (horizontal, diagonal, vertical)

---

## Component Patterns

### Phase Wheel
- Haptic-feedback rotary dial (SVG or Canvas)
- Rotation shifts entire UI colour profile
- Real-time waveform displaying Global Energy Level

### Genre Cards
- Translucent glass tiles with glow borders keyed to phase colour
- Long-press: preview 10-second audio snippet
- Loading: skeleton screens pulsing at last played track BPM
- 2-column grid layout

### Now Playing — Hardware Interface
- Full-screen immersive view replicating physical JukeBox unit
- Blue LED frequency bar spectrum visualiser
- Swipe left/right: skip tracks
- Pinch-to-Expand: reveal Pro Studio Rack
- Bass/Treble knobs: Face-level rotary controls

### Pro Studio Rack (Pinch-to-Expand Modules)
- 10-Band Graphic EQ with draw-curve gesture
- Stem Splitter (4 faders: Drums, Bass, Vocal, Lead)
- FX Matrix X/Y Pad (Filter Cutoff × Resonance/Delay Feedback)
- Stream Stats

### Buttons
- Primary CTA: Deep violet (#7B00CC) fill, 4px radius, violet glow, haptic feedback trigger
- Secondary: Glass background, cyan border, 4px radius — no pill shapes
- Haptic feedback triggers for iOS on all interactive buttons

---

## Iconography & Brand
- **Lucide** icon set or custom SVG icons
- Hardware-inspired iconography (knobs, faders, VU meters, waveforms)
- Blue LED frequency bars as signature visual motif
- Waveform thumbnail as track identity

---

## Platform & Accessibility
- Platform: iOS 19/20 (Swift / SwiftUI / Metal), 120 Hz ProMotion
- Metal shaders for all visualisers
- WCAG 2.1 AA compliant
- VoiceOver + Dynamic Type support
- High-contrast text option for low-light (Phase 4)
