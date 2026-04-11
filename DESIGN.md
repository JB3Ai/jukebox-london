# DESIGN.md — JukeBox London Master Design Token File

> **Commit origin:** `init: Launching JukeBox v1.0 [London Legend Edition]. Initializing Lyria 3 Audio Engine, Liquid Glass UI, and Artist-Seeded Model architecture. Ready for the first Conduct.`

---

## 1. Brand Identity

| Token | Value | Notes |
|-------|-------|-------|
| Brand Name | JukeBox London | Full product name |
| Tagline | *"The Sound of Now"* | Used in hero copy |
| Domain | app.jb3ai.com | Primary app URL |

---

## 2. Colour Palette

### Primary Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-primary` | `#0a0a0f` | Page background |
| `--color-bg-glass` | `rgba(255,255,255,0.06)` | Glass panel fill |
| `--color-border-glass` | `rgba(255,255,255,0.12)` | Glass panel border |

### Accent Colours
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-gold` | `#d4af37` | CTAs, active states, London Legend skin |
| `--color-accent-electric` | `#00d4ff` | Electric Blue skin, waveform highlights |
| `--color-accent-coral` | `#ff6b6b` | Error states, energy indicators |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#f0ece4` | Body text |
| `--color-text-muted` | `rgba(240,236,228,0.55)` | Secondary / placeholder text |

---

## 3. Typography

| Token | Value |
|-------|-------|
| `--font-display` | `'Neue Montreal', 'Inter', sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` |
| `--font-size-base` | `16px` |

### Type Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | `72px` | 700 | Hero headlines |
| H1 | `48px` | 700 | Page titles |
| H2 | `32px` | 600 | Section headings |
| H3 | `24px` | 600 | Card headings |
| Body | `16px` | 400 | Paragraphs |
| Caption | `12px` | 400 | Meta, timestamps |
| Mono | `14px` | 400 | BPM, key, technical readouts |

---

## 4. Spacing System (4px base grid)

| Token | Value |
|-------|-------|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `32px` |
| `--space-xl` | `64px` |

---

## 5. Liquid Glass System

| Token | Value | Notes |
|-------|-------|-------|
| `--glass-blur` | `12px` | Standard panel backdrop blur |
| `--glass-saturation` | `180%` | Colour saturation boost behind glass |
| `--glass-border-radius` | `16px` | Default rounded corners |
| Elevated blur | `24px` | Modals, sticky player bar |

### Glow Classes
| Class | Colour | Use Case |
|-------|--------|----------|
| `.glow--gold` | `rgba(212,175,55,0.35)` | Active / selected |
| `.glow--electric` | `rgba(0,212,255,0.35)` | Waveform, progress |
| `.glow--coral` | `rgba(255,107,107,0.35)` | Alert, energy peak |

---

## 6. Motion & Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease` | Hover states |
| `--transition-med` | `300ms ease` | Panel open/close |
| `--transition-slow` | `600ms ease` | Page transitions, skin changes |

---

## 7. Artist Skins

Each skin overrides a subset of the tokens above.  
Skins live in `client/public/assets/skins/` and are configured in `stitch/stitch.config.json`.

| Skin ID | Label | Accent | Blur |
|---------|-------|--------|------|
| `london-legend` | London Legend | `#d4af37` (Gold) | `12px` |
| `electric-blue` | Electric Blue | `#00d4ff` (Cyan) | `16px` |

---

## 8. Audio Engine Defaults (Lyria 3)

| Parameter | Default | Range |
|-----------|---------|-------|
| BPM | 120 | 60–200 |
| Key | C Major | Chromatic |
| Style | `afrobeats` | See `/api/lyria/styles` |
| Output Format | WAV 24-bit / 44.1 kHz | — |

---

*This file is the single source of truth for all design decisions.  
When Stitch syncs a new skin, it appends a row to the Artist Skins table above.*
