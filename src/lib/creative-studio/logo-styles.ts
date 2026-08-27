import type { LogoStyleMeta } from '#/types/creative-studio'

/**
 * Logo styles for Creative Studio.
 *
 * To add another style: copy an object, unique `id`, client-facing label/tagline,
 * and a drawing brief in `aiPrompt`. The generate API runs every entry in parallel.
 */
export const LOGO_STYLES: LogoStyleMeta[] = [
  {
    id: 'wordmark-geometric',
    label: 'Geometric wordmark',
    tagline: 'Custom letterforms, tight tracking',
    previewFrom: '#0f172a',
    previewTo: '#38bdf8',
    aiPrompt:
      'Geometric custom wordmark. Stylize the brand letters as constructed shapes (circles, bars, cuts). Tight tracking, 2 colours, no icon. The type IS the logo.',
  },
  {
    id: 'monogram',
    label: 'Monogram',
    tagline: '1–2 letter mark in a bold glyph',
    previewFrom: '#1e1b4b',
    previewTo: '#a78bfa',
    aiPrompt:
      'Monogram of the brand initials (1–2 letters) as a single dense glyph. Overlapping or nested letterforms. Square-friendly. No full word.',
  },
  {
    id: 'abstract-mark',
    label: 'Abstract mark',
    tagline: 'Unique symbol, no letters',
    previewFrom: '#083344',
    previewTo: '#22d3ee',
    aiPrompt:
      'Abstract brand symbol with no letters. 3–8 path shapes suggesting the industry. Memorable silhouette that works at 24px. Vibrant but not childish.',
  },
  {
    id: 'app-icon',
    label: 'App icon',
    tagline: 'Rounded square SaaS icon',
    previewFrom: '#4c1d95',
    previewTo: '#f472b6',
    aiPrompt:
      'iOS/Android style app icon: rounded square (rx ~48 on 256 viewBox) with a simple inner mark. Gradient or duotone fill. Feels like a modern SaaS launcher icon.',
  },
  {
    id: 'lockup-horizontal',
    label: 'Horizontal lockup',
    tagline: 'Icon + wordmark side by side',
    previewFrom: '#0c4a6e',
    previewTo: '#34d399',
    aiPrompt:
      'Horizontal lockup: symbol on the left, brand word on the right, optically centred. Generous gap. Both parts share one colour system. Website header ready.',
  },
  {
    id: 'lockup-stacked',
    label: 'Stacked lockup',
    tagline: 'Icon above the name',
    previewFrom: '#134e4a',
    previewTo: '#5eead4',
    aiPrompt:
      'Stacked lockup: mark centred on top, brand name below in a clean geometric sans. Balanced padding. Works as a splash / about page logo.',
  },
  {
    id: 'line-icon',
    label: 'Monoline icon',
    tagline: 'Single-weight strokes',
    previewFrom: '#171717',
    previewTo: '#f97316',
    aiPrompt:
      'Monoline icon. One stroke weight (about 10–14 on 256 viewBox), round caps/joins, no fills except maybe one accent dot. Elegant and technical.',
  },
  {
    id: 'negative-space',
    label: 'Negative space',
    tagline: 'A hidden shape inside the mark',
    previewFrom: '#111827',
    previewTo: '#fbbf24',
    aiPrompt:
      'Negative-space logo. A solid primary shape with a clever cut-out that reveals a second idea related to the brand. One or two colours only.',
  },
  {
    id: 'badge-seal',
    label: 'Badge seal',
    tagline: 'Circular emblem / stamp',
    previewFrom: '#7f1d1d',
    previewTo: '#fbbf24',
    aiPrompt:
      'Circular seal or badge. Outer ring, inner icon, optional tiny brand letters along the arc using <textPath> or short caps on a curve. Premium, not clip-art.',
  },
  {
    id: 'hex-tech',
    label: 'Hex tech',
    tagline: 'Faceted, startup-infrastructure feel',
    previewFrom: '#082f49',
    previewTo: '#38bdf8',
    aiPrompt:
      'Hexagon or isometric facet mark. Tech/infrastructure SaaS energy. Sharp angles, 2–3 colours, slight inner geometry. No clip-art circuits.',
  },
  {
    id: 'gradient-orb',
    label: 'Gradient orb',
    tagline: 'Soft 3D blob, AI/SaaS vibe',
    previewFrom: '#581c87',
    previewTo: '#22d3ee',
    aiPrompt:
      'Soft gradient orb or blob with an inner glyph. Use SVG linear/radial gradients. Vibrant (violet, cyan, magenta). Feels like 2020s AI/SaaS brands, still original.',
  },
  {
    id: 'origami',
    label: 'Origami fold',
    tagline: 'Folded planes, paper geometry',
    previewFrom: '#9a3412',
    previewTo: '#fb923c',
    aiPrompt:
      'Origami / folded-plane mark. Overlapping polygons with light and dark faces suggesting paper. 2–3 related hues. Distinct silhouette.',
  },
  {
    id: 'spark',
    label: 'Spark burst',
    tagline: 'Energy, launch, motion',
    previewFrom: '#9a3412',
    previewTo: '#facc15',
    aiPrompt:
      'Spark, burst, or comet mark implying speed and launch. Dynamic but balanced. Not a generic starburst. Pair optional tiny wordmark underneath.',
  },
  {
    id: 'orbit',
    label: 'Orbit',
    tagline: 'Rings, nodes, connection',
    previewFrom: '#1e3a8a',
    previewTo: '#67e8f9',
    aiPrompt:
      'Orbit / node network mark: rings, a core, 2–4 satellites. Connectivity, platform, cloud. Clean geometry, not a molecule clip-art.',
  },
  {
    id: 'wave-organic',
    label: 'Organic wave',
    tagline: 'Fluid ribbon or leaf',
    previewFrom: '#14532d',
    previewTo: '#86efac',
    aiPrompt:
      'Organic ribbon, wave, or leaf-like path. Smooth cubic beziers. Fresh, alive, still suitable for a SaaS or consumer brand. 2 colours.',
  },
  {
    id: 'block-type',
    label: 'Bold block type',
    tagline: 'Heavy condensed letters',
    previewFrom: '#18181b',
    previewTo: '#fb7185',
    aiPrompt:
      'Ultra-bold condensed wordmark. Chunks of the letters may share strokes or knock out. High contrast, poster-like, still readable as the brand name.',
  },
  {
    id: 'split-letter',
    label: 'Split letter',
    tagline: 'Broken / sliced initial',
    previewFrom: '#312e81',
    previewTo: '#c4b5fd',
    aiPrompt:
      'A single hero letter sliced, offset, or halved with a contrasting colour in the gap. Super simple, super iconic. Optional tiny word under it.',
  },
  {
    id: 'dot-grid',
    label: 'Dot grid',
    tagline: 'Modular dots forming a glyph',
    previewFrom: '#0f172a',
    previewTo: '#2dd4bf',
    aiPrompt:
      'Logo built from a regular grid of circles (or rounded squares). The dots form the initials or a symbol. Modular, digital, friendly.',
  },
  {
    id: 'neon-outline',
    label: 'Neon outline',
    tagline: 'Glowing stroke on dark',
    previewFrom: '#020617',
    previewTo: '#22d3ee',
    aiPrompt:
      'Dark rounded-rect background with a neon-like outline mark (bright stroke, maybe a faint second stroke for glow using lower opacity). Night / cyber feel without being gamer-cliché.',
  },
  {
    id: 'crest',
    label: 'Modern crest',
    tagline: 'Shield without the dusty look',
    previewFrom: '#1c1917',
    previewTo: '#d6d3d1',
    aiPrompt:
      'Contemporary crest or shield. Simplified geometry, one inner symbol, no excessive ornament. Trust/fintech/education energy, 2020s not 1890s.',
  },
  {
    id: 'ribbon',
    label: 'Ribbon fold',
    tagline: 'A letter or loop from one ribbon',
    previewFrom: '#831843',
    previewTo: '#fb7185',
    aiPrompt:
      'A continuous ribbon that folds into the brand initial or an infinity-like loop. 3D-ish shading with 2–3 values of one hue. Fluid and premium.',
  },
  {
    id: 'pixel',
    label: 'Pixel craft',
    tagline: 'Chunky pixels, still classy',
    previewFrom: '#0a0a0a',
    previewTo: '#a3e635',
    aiPrompt:
      'Pixel / mosaic mark using aligned squares. Suggests the initials or a mascot-like icon. Fun but usable as a favicon. Limited palette (2–3).',
  },
  {
    id: 'stamp',
    label: 'Ink stamp',
    tagline: 'Imperfect circle, handmade',
    previewFrom: '#44403c',
    previewTo: '#fecaca',
    aiPrompt:
      'Rubber-stamp aesthetic: slightly imperfect circle, inner mark, maybe the brand in small caps. Texture suggested with simple shapes (no filters/bitmaps). Warm and human.',
  },
  {
    id: 'minimal-combo',
    label: 'Minimal combo',
    tagline: 'Tiny mark + light word',
    previewFrom: '#fafafa',
    previewTo: '#2563eb',
    aiPrompt:
      'Very minimal: a tiny precise symbol plus a light, widely tracked wordmark. Lots of whitespace inside the 256 canvas. Nordic / Linear / Stripe quiet-luxury, still original and more colourful than grey.',
  },
]

export const LOGO_STYLE_IDS = LOGO_STYLES.map((style) => style.id) as [
  string,
  ...string[],
]

export const LOGO_GENERATE_COUNT = LOGO_STYLES.length
export const LOGO_PARALLELISM = 8

export function getLogoStyle(id: string): LogoStyleMeta {
  const style = LOGO_STYLES.find((item) => item.id === id)
  if (!style) throw new Error(`Unknown logo style: ${id}`)
  return style
}
