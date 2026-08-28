import {
  Clapperboard,
  Hexagon,
  ImageIcon,
  LayoutTemplate,
  Palette,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* DEMO: original nav
export const LANDING_NAV_LINKS = [
  { label: 'Feature', href: '/features' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/pricing' },
] as const
*/
export const LANDING_NAV_LINKS = [
  { label: 'Tools', href: '/', hash: 'tools' },
  { label: 'How it works', href: '/', hash: 'how-it-works' },
  { label: 'Pricing', href: '/pricing' },
] as const

export const LANDING_LEGAL_LINKS = [
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Terms of service', href: '/terms-of-service' },
] as const

export const HERO_HOME_STATS = [
  { value: '4 tools', label: 'Landing · logo · video · image' },
  { value: '24', label: 'Logo styles at once' },
  { value: '1 brief', label: 'In → files you can ship' },
] as const

export const LANDING_STATS = [
  { value: 'Landing', label: 'Themed React pages' },
  { value: 'Logo', label: 'AI vector designer' },
  { value: 'Video', label: 'Product clips' },
  { value: 'Image', label: 'Listing stills' },
] as const

export interface LandingFeature {
  icon: LucideIcon
  title: string
  description: string
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: LayoutTemplate,
    title: 'AI landing page creator',
    description:
      'Describe the product, upload 3–10 photos, pick a design theme, and generate one React + Tailwind page. Refine it in chat, then download a Vite or Next.js repo or HTML.',
  },
  {
    icon: Hexagon,
    title: 'AI logo designer',
    description:
      'Generate original SVG logos in 24 styles from a brand name, a brief, or optional inspiration images — then download SVG, PNG, or JPEG.',
  },
  {
    icon: Clapperboard,
    title: 'AI product video generator',
    description:
      'Turn product stills into a short clip for storefronts, UGC-style ads, and lifestyle stories. Pick a format, generate once, download MP4.',
  },
  {
    icon: ImageIcon,
    title: 'AI image designer',
    description:
      'Upload 1–3 product photos and generate marketplace creatives for Etsy, Shopify, Instagram, and Pinterest with palettes and exact canvas sizes.',
  },
  {
    icon: Palette,
    title: 'Colour and canvas control',
    description:
      'Steer output with palettes, platform sizes, and custom dimensions so assets match the listing or social slot you need.',
  },
  {
    icon: Sparkles,
    title: 'Variants, not one-offs',
    description:
      'Compare 24 logo styles or 3–10 image variants, then refine a landing page in chat until it fits the brand.',
  },
  {
    icon: WandSparkles,
    title: 'Files designers already use',
    description:
      'Download landing pages as Vite, Next.js, or HTML; logos as SVG or raster; stills as PNG/JPEG/GIF/SVG; and videos as MP4 — without a separate export pipeline.',
  },
]

export const LANDING_STEPS = [
  {
    step: '01',
    title: 'Open a studio',
    description:
      'Choose AI landing pages, logo designer, product video, or image generation — same workspace, same Kixi theme.',
  },
  {
    step: '02',
    title: 'Add a brief',
    description:
      'Write a prompt, add a brand name, and drop in reference photos (3–10 for landing pages).',
  },
  {
    step: '03',
    title: 'Generate',
    description:
      'Kixi runs the selected tool — one themed landing page you can chat-update, 24 logo styles, a short product clip, or a set of marketplace stills.',
  },
  {
    step: '04',
    title: 'Download and ship',
    description:
      'Export a landing-page repo, SVG, PNG, JPEG, GIF, or MP4 and drop the files into your listing, brand kit, or edit stack.',
  },
] as const

export interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export const LANDING_PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'per month',
    description: 'Try every Kixi studio with the live demo.',
    features: [
      'AI landing page creator (React / HTML)',
      'AI logo designer (SVG styles)',
      'AI product video generator',
      'AI image designer for listings',
    ],
    cta: 'Open Kixi',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For designers who generate every week.',
    features: [
      'Everything in Free',
      'Higher generation limits',
      'Priority rendering',
      'Email support',
    ],
    highlighted: true,
    cta: 'Start Pro trial',
  },
  {
    name: 'Team',
    price: '$79',
    period: 'per month',
    description: 'For studios sharing a creative workspace.',
    features: [
      'Everything in Pro',
      'Shared brand briefs (coming soon)',
      'Multi-user workspace (coming soon)',
      'Dedicated onboarding',
    ],
    cta: 'Contact sales',
  },
]

export const LANDING_FAQ = [
  {
    question: 'What is Kixi?',
    answer:
      'Kixi is a creative studio for designers. It includes an AI landing page creator, an AI logo designer, an AI product video generator, and an AI image designer in one workspace.',
  },
  {
    question: 'Do I need a credit card to try it?',
    answer:
      'No. Open the live demo and generate landing pages, logos, product videos, or images. Paid plans will unlock higher limits when checkout ships.',
  },
  {
    question: 'Can I upload images as logo inspiration?',
    answer:
      'Yes. The logo tool accepts up to three optional references. They steer colour, subject, or an existing mark — Kixi redraws a new vector logo rather than tracing a photo.',
  },
  {
    question: 'What files can I download?',
    answer:
      'Landing pages as a Vite or Next.js repo, or a Tailwind HTML file. Logos as SVG, PNG, JPEG, or a simple mark. Stills as PNG, JPEG, GIF, or SVG. Product videos as MP4.',
  },
] as const
