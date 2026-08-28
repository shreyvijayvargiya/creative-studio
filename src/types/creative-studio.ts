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

export type CreativeDimensionId =
  | 'thumbnail'
  | 'logo'
  | 'poster'
  | 'magazine'
  | 'banner'
  | 'reel'
  | 'short'
  | 'custom'

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

export interface CreativeDimensionMeta {
  id: CreativeDimensionId
  label: string
  description: string
  widthPx: number
  heightPx: number
  aspectRatio: string
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
  dimensionId: CreativeDimensionId
  widthPx: number
  heightPx: number
  url: string
  mediaType: string
}

export interface GenerateCreativesResult {
  variants: CreativeVariant[]
  model: string
  platformId: CreativePlatformId
  styleId: CreativeStyleId
  formatId: CreativeFormatId
  dimensionId: CreativeDimensionId
  widthPx: number
  heightPx: number
  count: number
}

export type VideoAspectRatio = '16:9' | '9:16' | '1:1'
export type VideoResolution = '720p' | '1080p'

export interface VideoFormatMeta {
  id: string
  label: string
  tagline: string
  description: string
  aspectRatio: VideoAspectRatio
  durationSeconds: number
  resolution: VideoResolution
  generateAudio: boolean
  /** Storyboard labels shown on the format card so sellers can picture the clip. */
  beats: [string, string, string]
  previewFrom: string
  previewTo: string
  /**
   * Injected into the model as the format brief.
   * Edit this markdown (or add a new VIDEO_FORMATS entry) to change AI behaviour.
   */
  aiPrompt: string
}

export interface GenerateCreativeVideoResult {
  url: string
  mediaType: string
  model: string
  formatId: string
  durationSeconds: number
  aspectRatio: VideoAspectRatio
}

export interface LogoStyleMeta {
  id: string
  label: string
  tagline: string
  previewFrom: string
  previewTo: string
  /** Injected into the model for this one mark. Add a new LOGO_STYLES entry to ship another style. */
  aiPrompt: string
}

export interface GeneratedLogoVariant {
  styleId: string
  label: string
  svg?: string
  error?: string
}

export interface GenerateCreativeLogosResult {
  logos: GeneratedLogoVariant[]
  model: string
  count: number
}

export interface LandingThemeMeta {
  id: string
  name: string
  tagline: string
  previewColors: string[]
  fileName: string
}

export interface LandingLayoutMeta {
  id: string
  label: string
  tagline: string
  aiPrompt: string
}

export interface GeneratedLandingVariant {
  index: number
  layoutId: string
  label: string
  title?: string
  reactCode?: string
  htmlCode?: string
  error?: string
}

export interface LandingStoredImage {
  storagePath: string
  publicPath: string
  fileName: string
  mimeType: string
}

export interface GenerateLandingPagesResult {
  variants: GeneratedLandingVariant[]
  model: string
  themeId: string
  themeName: string
  count: number
  imagePaths: string[]
  storedImages: LandingStoredImage[]
}
