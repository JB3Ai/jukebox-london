# client/public/assets

This directory holds all static assets served by the Next.js frontend.

## Structure

```
assets/
├── models/      # 3D models (.glb / .gltf) for the player and stage visuals
├── skins/       # Anyma artist skin packs (JSON + texture maps)
└── fonts/       # Web font files (.woff2) — Neue Montreal, JetBrains Mono
```

### Adding a new 3D model
Place `.glb` or `.gltf` files under `models/` and reference them via
`/assets/models/<filename>` in your components.

### Adding an Anyma skin
Each skin is a folder inside `skins/` containing:
- `skin.json`  — token overrides (colours, blur levels, glow intensity)
- `preview.webp` — 400 × 400 thumbnail shown in the Skin Picker

### Adding fonts
Place `.woff2` files under `fonts/` and register them in
`client/styles/globals.css` using `@font-face`.
