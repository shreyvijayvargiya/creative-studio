import type {
  CreativeFormatId,
  CreativeFormatMeta,
  CreativePaletteId,
  CreativePaletteMeta,
  CreativePlatformId,
  CreativePlatformMeta,
  CreativeStyleId,
  CreativeStyleMeta,
} from '#/types/creative-studio'

export const MIN_ASSET_COUNT = 3
export const MAX_ASSET_COUNT = 10
export const DEFAULT_ASSET_COUNT = 3
export const COST_PER_IMAGE_INR = 2.5
export const DEFAULT_PALETTE_ID: CreativePaletteId = 'studio-neutral'

/** Ten searchable colour palettes for Creative Studio */
export const COLOR_PALETTES: CreativePaletteMeta[] = [
  {
    id: 'studio-neutral',
    label: 'Studio Neutral',
    description: 'Clean whites and soft greys for catalog shots',
    colors: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#9CA3AF', '#1A1A1A'],
    keywords: ['white', 'grey', 'minimal', 'catalog', 'clean'],
  },
  {
    id: 'warm-linen',
    label: 'Warm Linen',
    description: 'Creamy neutrals with soft beige warmth',
    colors: ['#FAF7F2', '#E8DCC8', '#C4B7A6', '#8B7355', '#3D3429'],
    keywords: ['beige', 'cream', 'linen', 'neutral', 'cozy'],
  },
  {
    id: 'forest-earth',
    label: 'Forest Earth',
    description: 'Deep greens and natural wood tones',
    colors: ['#E8F0E6', '#7BA05B', '#4A6741', '#8B5E3C', '#2F3E2C'],
    keywords: ['green', 'nature', 'wood', 'outdoor', 'organic'],
  },
  {
    id: 'ocean-breeze',
    label: 'Ocean Breeze',
    description: 'Cool blues and sandy coastal accents',
    colors: ['#E8F4F8', '#7EB8C9', '#2E6F8E', '#F5E6D3', '#1B3A4B'],
    keywords: ['blue', 'coastal', 'fresh', 'water', 'calm'],
  },
  {
    id: 'blush-rose',
    label: 'Blush Rose',
    description: 'Soft pinks and dusty mauve for feminine brands',
    colors: ['#FDF2F4', '#F5C6CE', '#D4A5A5', '#9B6B6B', '#4A2C2C'],
    keywords: ['pink', 'rose', 'blush', 'soft', 'romantic'],
  },
  {
    id: 'midnight-ink',
    label: 'Midnight Ink',
    description: 'Dark navy and charcoal with gold highlights',
    colors: ['#0F172A', '#1E293B', '#334155', '#D4AF37', '#F8FAFC'],
    keywords: ['navy', 'dark', 'luxury', 'gold', 'premium'],
  },
  {
    id: 'citrus-pop',
    label: 'Citrus Pop',
    description: 'Bright citrus accents on a clean base',
    colors: ['#FFFBEB', '#FDE68A', '#F59E0B', '#10B981', '#1F2937'],
    keywords: ['yellow', 'orange', 'bright', 'fun', 'summer'],
  },
  {
    id: 'terracotta-clay',
    label: 'Terracotta Clay',
    description: 'Earthy clay reds and sun-baked tones',
    colors: ['#FDF6F0', '#E07A5F', '#C45C26', '#81B29A', '#3D2C29'],
    keywords: ['terracotta', 'clay', 'warm', 'rustic', 'earth'],
  },
  {
    id: 'lavender-mist',
    label: 'Lavender Mist',
    description: 'Gentle purples and soft lilac haze',
    colors: ['#F5F3FF', '#DDD6FE', '#A78BFA', '#7C3AED', '#2E1065'],
    keywords: ['purple', 'lavender', 'lilac', 'calm', 'spa'],
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    description: 'Strict black-and-white contrast',
    colors: ['#FFFFFF', '#E5E5E5', '#A3A3A3', '#525252', '#0A0A0A'],
    keywords: ['black', 'white', 'bw', 'contrast', 'editorial'],
  },
]

export const CREATIVE_STYLES: CreativeStyleMeta[] = [
  {
    id: 'studio',
    label: 'Studio White',
    description: 'Clean ecommerce catalog look with soft shadows',
    colorPalette: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#1A1A1A'],
    lighting: 'soft three-point studio lighting, gentle rim light',
    mood: 'premium, minimal, trustworthy',
    backgroundNotes: 'seamless white or light grey infinity cove',
  },
  {
    id: 'cozy',
    label: 'Cozy Home',
    description: 'Warm lifestyle scene that feels lived-in',
    colorPalette: ['#F4EDE4', '#D4A574', '#8B5E3C', '#2C1810', '#C9B8A8'],
    lighting: 'warm window light, soft shadows, golden hour indoors',
    mood: 'inviting, handmade, hygge',
    backgroundNotes: 'wood surfaces, linen textiles, ceramic props',
  },
  {
    id: 'festive',
    label: 'Festive',
    description: 'Seasonal gift-ready presentation',
    colorPalette: ['#8B1E3F', '#0F3D2E', '#D4AF37', '#F7F1E8', '#2A1A12'],
    lighting: 'sparkle highlights, soft glow, celebratory ambience',
    mood: 'gift-worthy, celebratory, premium seasonal',
    backgroundNotes: 'tasteful ribbons, greenery, or subtle festive accents — never cluttered',
  },
  {
    id: 'outdoor',
    label: 'Outdoor Lifestyle',
    description: 'Natural light product story outdoors',
    colorPalette: ['#E8F0E6', '#7BA05B', '#4A6741', '#F5F0E6', '#2F3E2C'],
    lighting: 'bright natural daylight, soft open shade',
    mood: 'fresh, active, authentic',
    backgroundNotes: 'blurred nature, stone, or picnic-style surfaces',
  },
  {
    id: 'flatlay',
    label: 'Flat Lay',
    description: 'Top-down styled composition for social & Pinterest',
    colorPalette: ['#FAF7F2', '#C4B7A6', '#6B5B4F', '#2D2A26', '#E6D5C3'],
    lighting: 'even overhead softbox, minimal harsh shadows',
    mood: 'editorial, organized, aspirational',
    backgroundNotes: 'styled props around the product, generous negative space for text overlays',
  },
]

export const CREATIVE_FORMATS: CreativeFormatMeta[] = [
  {
    id: 'etsy-listing',
    platformId: 'etsy',
    label: 'Listing photo',
    ratio: '1:1',
    aspectRatio: '1:1',
    widthPx: 2000,
    heightPx: 2000,
    description: 'Primary Etsy listing image buyers see first',
    useCase: 'Main product hero for the Etsy listing gallery',
  },
  {
    id: 'etsy-thumbnail',
    platformId: 'etsy',
    label: 'Search thumbnail',
    ratio: '1:1',
    aspectRatio: '1:1',
    widthPx: 570,
    heightPx: 570,
    description: 'Crops cleanly in Etsy search results',
    useCase: 'High-contrast product focus that reads small in search grids',
  },
  {
    id: 'shopify-hero',
    platformId: 'shopify',
    label: 'Store banner',
    ratio: '16:9',
    aspectRatio: '16:9',
    widthPx: 1920,
    heightPx: 1080,
    description: 'Wide homepage / collection hero banner',
    useCase: 'Shopify theme hero with room for headline overlays on the left third',
  },
  {
    id: 'shopify-collection',
    platformId: 'shopify',
    label: 'Product card',
    ratio: '4:5',
    aspectRatio: '4:5',
    widthPx: 1600,
    heightPx: 2000,
    description: 'Collection grid and PDP gallery card',
    useCase: 'Shopify product card with consistent framing across a collection',
  },
  {
    id: 'instagram-feed',
    platformId: 'instagram',
    label: 'Feed post',
    ratio: '4:5',
    aspectRatio: '4:5',
    widthPx: 1080,
    heightPx: 1350,
    description: 'Instagram feed portrait that maximises screen space',
    useCase: 'Organic feed post with lifestyle storytelling',
  },
  {
    id: 'instagram-story',
    platformId: 'instagram',
    label: 'Story / Reel cover',
    ratio: '9:16',
    aspectRatio: '9:16',
    widthPx: 1080,
    heightPx: 1920,
    description: 'Full-bleed vertical story or reel cover',
    useCase: 'Stories with safe margins away from UI chrome top/bottom',
  },
  {
    id: 'pinterest-pin',
    platformId: 'pinterest',
    label: 'Standard pin',
    ratio: '2:3',
    aspectRatio: '2:3',
    widthPx: 1000,
    heightPx: 1500,
    description: 'Tall pin optimised for Pinterest feed ranking',
    useCase: 'Scroll-stopping vertical pin with clear product silhouette',
  },
]

export const CREATIVE_PLATFORMS: CreativePlatformMeta[] = [
  {
    id: 'etsy',
    label: 'Etsy',
    description: 'Handmade & marketplace listing creatives',
    formats: ['etsy-listing', 'etsy-thumbnail'],
  },
  {
    id: 'shopify',
    label: 'Shopify',
    description: 'Storefront banners and product cards',
    formats: ['shopify-hero', 'shopify-collection'],
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Feed posts and vertical stories',
    formats: ['instagram-feed', 'instagram-story'],
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    description: 'Tall pins for discovery traffic',
    formats: ['pinterest-pin'],
  },
]

export function getStyle(id: CreativeStyleId): CreativeStyleMeta {
  const style = CREATIVE_STYLES.find((s) => s.id === id)
  if (!style) throw new Error(`Unknown style: ${id}`)
  return style
}

export function getPalette(id: CreativePaletteId): CreativePaletteMeta {
  const palette = COLOR_PALETTES.find((p) => p.id === id)
  if (!palette) throw new Error(`Unknown palette: ${id}`)
  return palette
}

export function getFormat(id: CreativeFormatId): CreativeFormatMeta {
  const format = CREATIVE_FORMATS.find((f) => f.id === id)
  if (!format) throw new Error(`Unknown format: ${id}`)
  return format
}

export function getPlatform(id: CreativePlatformId): CreativePlatformMeta {
  const platform = CREATIVE_PLATFORMS.find((p) => p.id === id)
  if (!platform) throw new Error(`Unknown platform: ${id}`)
  return platform
}

export function formatsForPlatform(platformId: CreativePlatformId): CreativeFormatMeta[] {
  return CREATIVE_FORMATS.filter((f) => f.platformId === platformId)
}
