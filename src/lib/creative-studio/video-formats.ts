import type { VideoFormatMeta } from '#/types/creative-studio'

/**
 * Video formats for Creative Studio.
 *
 * To add another format:
 * 1. Copy an object below and give it a unique `id`.
 * 2. Fill the client preview fields (`label`, `tagline`, `beats`, colours).
 * 3. Write the AI injection markdown in `aiPrompt`.
 * The generate API and UI pick it up automatically — no other files needed
 * unless you also want a new aspect ratio or resolution type.
 *
 * `durationSeconds` is sent to OpenRouter. Most current video models accept
 * 4–8 seconds; raise it only after checking the selected model's limits.
 */
export const VIDEO_FORMATS: VideoFormatMeta[] = [
  {
    id: 'product-hero',
    label: 'Product hero',
    tagline: 'Cinematic slow push-in with the product as the star',
    description:
      'A polished vertical reel: open on the scene, land on the product, hold a hero close-up.',
    aspectRatio: '9:16',
    durationSeconds: 8,
    resolution: '720p',
    generateAudio: true,
    beats: ['Open', 'Reveal', 'Hero hold'],
    previewFrom: '#1a1a1a',
    previewTo: '#d4af37',
    aiPrompt: `## Video format — Product hero (vertical reel)

Goal: one continuous, commercially beautiful product film. Not a collage, not a slideshow of the source photos.

Duration: about 8 seconds. Aspect: 9:16. Photorealistic motion only.

### Structure
1. Beats 0–2s — atmosphere: environment, light, or a hint of the product entering frame.
2. Beats 2–6s — reveal: camera pushes in or orbits so the product becomes undeniable hero.
3. Beats 6–8s — hero hold: stable, sharp, catalogue-ready close-up with room for a caption at the lower third.

### Camera & motion
- Smooth cinematic move (slow dolly-in, gentle orbit, or controlled crane). No handheld shake, no whip pans, no jump cuts.
- Keep the product sharp and fully in frame; do not crop logos, labels, or distinctive edges.
- Shallow-to-medium depth of field; premium studio or lifestyle lighting matching the references.

### From the reference images
- Preserve exact product identity (shape, materials, colour, labels).
- Image 1 is the primary product / first-frame composition. Extra images are angle, material, or styling cues — blend them into ONE shot sequence, never a split screen.

### Audio (if generated)
- Soft, premium, wordless bed. No voiceover, no lyrics, no UI sounds.

### Do not
- Invent text, watermarks, phone UI, or fake brand marks.
- Morph the product into a different object.
- End on an empty frame.`,
  },
  {
    id: 'ugc-handheld',
    label: 'UGC handheld',
    tagline: 'Phone-shot authenticity — like a customer filmed it',
    description:
      'Casual vertical video with natural light, small camera drift, and hands-in-frame energy.',
    aspectRatio: '9:16',
    durationSeconds: 8,
    resolution: '720p',
    generateAudio: true,
    beats: ['Pickup', 'Show', 'React'],
    previewFrom: '#f5e6d3',
    previewTo: '#e07a5f',
    aiPrompt: `## Video format — UGC handheld (vertical)

Goal: look like a real customer filmed this on a phone in one take. Warm, imperfect, trustworthy.

Duration: about 8 seconds. Aspect: 9:16.

### Structure
1. 0–2s — hands or a table reach toward the product (or the product is already in hand).
2. 2–6s — show the product in use or turning it to camera, talking-hands energy even without a face.
3. 6–8s — a satisfied “hold to camera” beat, slightly closer.

### Camera & motion
- Mild handheld micro-movement. Natural window light or indoor practicals. Avoid cinema-grade steadicam.
- Keep faces optional; if a person appears, keep them generic and secondary to the product.
- Vertical 9:16 with phone-native framing (a bit of background mess is ok; never unreadable).

### From the reference images
- Product must match the references exactly.
- Extra photos inform setting, props, or how the item is held — not extra products unless the seller prompt says so.

### Audio (if generated)
- Quiet room tone, faint fabric/object foley. No ads voiceover, no stock-music drop.

### Do not
- Make it look like a TV commercial or a luxury brand film.
- Add captions, stickers, or social-app chrome.`,
  },
  {
    id: 'lifestyle-story',
    label: 'Lifestyle story',
    tagline: 'A tiny day-in-the-life with the product in use',
    description:
      'Narrative vertical clip: a lived-in moment, the product doing its job, a warm ending still.',
    aspectRatio: '9:16',
    durationSeconds: 8,
    resolution: '720p',
    generateAudio: true,
    beats: ['Moment', 'In use', 'Keep'],
    previewFrom: '#e8f0e6',
    previewTo: '#4a6741',
    aiPrompt: `## Video format — Lifestyle story (vertical)

Goal: a miniature story where the product belongs in a real life. Emotional but quiet. Ecommerce-ready.

Duration: about 8 seconds. Aspect: 9:16.

### Structure
1. 0–2.5s — the world: a morning table, a walk, a desk, a kitchen — motivated by the references and seller prompt.
2. 2.5–6s — the product in use (pour, wear, place, open, write — whatever is true to the object).
3. 6–8s — rest on a beautiful still of the product in that world, ready to screenshot as a listing still.

### Camera & motion
- Motivated camera: follow the action, then settle. Soft natural or practical light.
- One location. One product family. No montage of unrelated scenes.

### From the reference images
- Product identity is sacred.
- Extra images may supply the room, outfit, or surface — composite them into one believable space.

### Audio (if generated)
- Gentle environmental bed (room, distant birds, soft cups). No hard-sell music stabs.

### Do not
- Add on-screen text, logos, or fake packaging claims.
- Cut to a white studio unless the references are studio.`,
  },
  {
    id: 'detail-tour',
    label: 'Detail tour',
    tagline: 'Macro craftsmanship — texture, stitch, glaze, hardware',
    description:
      'Close, tactile camera moves across materials so buyers can “feel” the product.',
    aspectRatio: '1:1',
    durationSeconds: 8,
    resolution: '720p',
    generateAudio: false,
    beats: ['Wide-ish', 'Macro', 'Mark'],
    previewFrom: '#e8dcc8',
    previewTo: '#3d3429',
    aiPrompt: `## Video format — Detail tour (square)

Goal: a tactile inspection video. Buyers should feel materials. Square 1:1 for feeds and listing galleries.

Duration: about 8 seconds. Aspect: 1:1.

### Structure
1. 0–2s — a slightly wider product view so orientation is clear.
2. 2–6s — slow macro slide or arc across the most interesting material (glaze, grain, stitch, metal, print).
3. 6–8s — rest on a signature detail (logo stamp, edge, clasp, texture) in sharp focus.

### Camera & motion
- Very slow, locked-off or slider-like. High detail, crisp focus pulls only if motivated.
- Lighting that reveals texture: raking side light, gentle speculars, no blown highlights.

### From the reference images
- Treat extra photos as close-up maps of real details. Do not invent materials that are not in the references.

### Audio
- Prefer silence or barely-there foley (cloth, ceramic tap). No music needed.

### Do not
- Fast cuts, zooms, or social transitions.
- Show a different product mid-clip.`,
  },
  {
    id: 'storefront-ad',
    label: 'Storefront ad',
    tagline: 'Wide 16:9 commercial for site heroes and YouTube',
    description:
      'Landscape spot: establishing scene, product action, a clean end-card style hold (no fake text).',
    aspectRatio: '16:9',
    durationSeconds: 8,
    resolution: '720p',
    generateAudio: true,
    beats: ['Scene', 'Action', 'End hold'],
    previewFrom: '#0f172a',
    previewTo: '#38bdf8',
    aiPrompt: `## Video format — Storefront ad (landscape)

Goal: a short 16:9 commercial that can sit on a Shopify hero or YouTube bumper. Cinematic but product-true.

Duration: about 8 seconds. Aspect: 16:9 widescreen.

### Structure
1. 0–2s — establishing: the world of the brand (studio cove, home, outdoors) with space on the left or right for a future headline.
2. 2–6s — product action: the item is used, turned, or revealed with confident camera grammar (dolly, tracking, or locked beauty).
3. 6–8s — end hold: centred or rule-of-thirds product, clean negative space, no invented typography.

### Camera & motion
- Stable, expensive-looking motion. 16:9 composition with safe margins for later text overlays.
- Colour grade consistent with the reference images; do not recast the product colour.

### From the reference images
- Image 1 is the hero product. Additional images may be environment or supporting props. Combine into one commercial scene.

### Audio (if generated)
- Short, modern, instrumental sting that resolves at the end hold. No voiceover, no spoken claims.

### Do not
- Fake logos, slogans, prices, or UI.
- Vertical phone framing inside the 16:9 canvas (no pillarboxing).`,
  },
]

export const DEFAULT_VIDEO_FORMAT_ID = VIDEO_FORMATS[0]!.id

export type VideoFormatId = (typeof VIDEO_FORMATS)[number]['id']

export const VIDEO_FORMAT_IDS = VIDEO_FORMATS.map((format) => format.id) as [
  VideoFormatId,
  ...VideoFormatId[],
]

export function getVideoFormat(id: string): VideoFormatMeta {
  const format = VIDEO_FORMATS.find((item) => item.id === id)
  if (!format) {
    throw new Error(`Unknown video format: ${id}`)
  }
  return format
}
