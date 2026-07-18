export type CreativePlatformId = 'etsy' | 'shopify' | 'instagram' | 'pinterest'

export type CreativeStyleId =
  | 'studio'
  | 'cozy'
  | 'festive'
  | 'outdoor'
  | 'flatlay'

export type CreativePaletteId =
  | 'studio-neutral'
  | 'warm-linen'
  | 'forest-earth'
  | 'ocean-breeze'
  | 'blush-rose'
  | 'midnight-ink'
  | 'citrus-pop'
  | 'terracotta-clay'
  | 'lavender-mist'
  | 'monochrome'

export type CreativeFormatId =
  | 'etsy-listing'
  | 'etsy-thumbnail'
  | 'shopify-hero'
  | 'shopify-collection'
  | 'instagram-feed'
  | 'instagram-story'
  | 'pinterest-pin'

export interface CreativeFormatMeta {
  id: CreativeFormatId
  platformId: CreativePlatformId
  label: string
  ratio: string
  aspectRatio: string
  widthPx: number
  heightPx: number
  description: string
  useCase: string
}

export interface CreativeStyleMeta {
  id: CreativeStyleId
  label: string
  description: string
  colorPalette: string[]
  lighting: string
  mood: string
  backgroundNotes: string
}

export interface CreativePaletteMeta {
  id: CreativePaletteId
  label: string
  description: string
  colors: string[]
  keywords: string[]
}

export interface CreativePlatformMeta {
  id: CreativePlatformId
  label: string
  description: string
  formats: CreativeFormatId[]
}

export interface CreativeVariant {
  index: number
  formatId: CreativeFormatId
  url: string
  mediaType: string
}

export interface GenerateCreativesResult {
  variants: CreativeVariant[]
  model: string
  platformId: CreativePlatformId
  styleId: CreativeStyleId
  formatId: CreativeFormatId
  count: number
}
