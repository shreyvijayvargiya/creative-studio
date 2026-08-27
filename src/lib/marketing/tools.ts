import {
  Clapperboard,
  Hexagon,
  ImageIcon,
  Palette,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type StudioToolPath =
  | '/ai-logo-designer'
  | '/ai-image-designer'
  | '/ai-product-video-generator'

export const STUDIO_PATHS = {
  logo: '/ai-logo-designer',
  image: '/ai-image-designer',
  video: '/ai-product-video-generator',
} as const satisfies Record<'logo' | 'image' | 'video', StudioToolPath>

export function isStudioRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return (Object.values(STUDIO_PATHS) as string[]).includes(normalized)
}

export interface MarketingTool {
  id: 'logo' | 'video' | 'image'
  name: string
  shortName: string
  eyebrow: string
  headline: string
  description: string
  path: StudioToolPath
  ctaLabel: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  cardHoverBg: string
  highlights: string[]
}

export const MARKETING_TOOLS: MarketingTool[] = [
  {
    id: 'logo',
    name: 'AI Logo Designer',
    shortName: 'Logo',
    eyebrow: 'Vector marks in 24 styles',
    headline: 'Original SVG logos from a brief, a sketch, or a name',
    description:
      'Describe the brand or drop in up to three reference images. Kixi redraws a new vector logo across 24 styles — not a photo trace — ready to download as SVG, PNG, or JPEG.',
    path: STUDIO_PATHS.logo,
    ctaLabel: 'Design a logo',
    icon: Hexagon,
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/50',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    cardHoverBg: 'hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30',
    highlights: [
      '24 styles generated in parallel',
      'Optional inspiration images',
      'Download SVG, PNG, JPEG, or a simple mark',
    ],
  },
  {
    id: 'video',
    name: 'AI Product Video Generator',
    shortName: 'Video',
    eyebrow: 'Short product clips',
    headline: 'Turn stills into a product video in one pass',
    description:
      'Upload product photos, pick a format, and generate a short AI clip for storefronts, UGC-style ads, and lifestyle stories — without a camera crew.',
    path: STUDIO_PATHS.video,
    ctaLabel: 'Generate a video',
    icon: Clapperboard,
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    cardHoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
    highlights: [
      'Product hero, UGC, lifestyle, and storefront formats',
      'Reference frames from your photos',
      'Download a ready MP4 clip',
    ],
  },
  {
    id: 'image',
    name: 'AI Image Designer',
    shortName: 'Images',
    eyebrow: 'Marketplace-ready stills',
    headline: 'One product photo into listing and social creatives',
    description:
      'Upload 1–3 product shots, write a prompt, and generate variants sized for Etsy, Shopify, Instagram, Pinterest, and custom canvases — with palettes, styles, and instant downloads.',
    path: STUDIO_PATHS.image,
    ctaLabel: 'Design images',
    icon: ImageIcon,
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    cardHoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
    highlights: [
      'Exact canvas sizes for listings and social',
      'Colour palettes and 3–10 variants per run',
      'Download PNG, JPEG, GIF, or SVG',
    ],
  },
]

export function getMarketingTool(id: MarketingTool['id']): MarketingTool {
  const tool = MARKETING_TOOLS.find((item) => item.id === id)
  if (!tool) {
    throw new Error(`Unknown marketing tool: ${id}`)
  }
  return tool
}

export const MARKETING_CAPABILITIES: Array<{
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    icon: Sparkles,
    title: 'Three studios, one workspace',
    description:
      'Jump between logo, video, and image tools without leaving Kixi. Same theme, same downloads, same brief.',
  },
  {
    icon: Palette,
    title: 'Direction you control',
    description:
      'Prompts, reference images, palettes, formats, and canvas sizes steer the model so output matches the brand — not a generic template.',
  },
  {
    icon: WandSparkles,
    title: 'Files you can ship',
    description:
      'Vector logos, marketplace stills, and short product clips download in the formats designers already use.',
  },
]
