import {
  Calculator,
  Cloud,
  FileCheck,
  FileText,
  PenLine,
  Shield,
  TableProperties,
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
  { label: 'Try demo', href: '/creative-studio' },
  { label: 'Pricing', href: '/pricing' },
] as const

export const LANDING_LEGAL_LINKS = [
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Terms of service', href: '/terms-of-service' },
] as const

/* DEMO: original stats
export const HERO_HOME_STATS = [
  { value: 'Free', label: 'To get started' },
  { value: 'ATO', label: 'PDF templates' },
  { value: '100%', label: 'Secure storage' },
] as const
*/
export const HERO_HOME_STATS = [
  { value: '1 photo', label: 'In → multi-platform out' },
  { value: 'Etsy+', label: 'Shopify · IG · Pinterest' },
  { value: '3–10', label: 'Assets per run' },
] as const

export const LANDING_STATS = [
  { value: 'ATO-ready', label: 'Tax PDF templates' },
  { value: 'E-sign', label: 'Built-in DocuSeal' },
  { value: 'Drive', label: 'Per-user backup' },
  { value: 'Secure', label: 'PIN-protected shares' },
] as const

export interface LandingFeature {
  icon: LucideIcon
  title: string
  description: string
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: TableProperties,
    title: 'Budget planner',
    description:
      'Spreadsheet-style budget grid with income, expenses, and net position — built for small business accounting workflows.',
  },
  {
    icon: FileText,
    title: 'ATO tax PDFs',
    description:
      'Generate structured tax return PDFs from your budget data and taxpayer details in a few guided steps.',
  },
  {
    icon: PenLine,
    title: 'E-signing',
    description:
      'Send documents to DocuSeal for embedded signing. Completed PDFs are saved automatically to your workspace.',
  },
  {
    icon: Cloud,
    title: 'Google Drive backup',
    description:
      'Connect your own Google account and sync signed PDFs to Drive using your storage quota — not a shared service account.',
  },
  {
    icon: Shield,
    title: 'Secure document storage',
    description:
      'Private Supabase storage with optional PIN protection when sharing PDF links with clients or advisers.',
  },
  {
    icon: Calculator,
    title: 'Finance workspace',
    description:
      'Dashboard, document library, and settings in one calm interface designed for accountants and bookkeepers.',
  },
]

export const LANDING_STEPS = [
  {
    step: '01',
    title: 'Create your account',
    description:
      'Sign up with email or Google. Your workspace is ready in seconds.',
  },
  {
    step: '02',
    title: 'Plan your budget',
    description:
      'Use the budget grid and taxpayer form to capture figures and client details.',
  },
  {
    step: '03',
    title: 'Generate & sign',
    description:
      'Create an ATO PDF, sign in the embedded DocuSeal flow, and finalize the document.',
  },
  {
    step: '04',
    title: 'Store & share',
    description:
      'Documents save to your library. Optionally back up to Google Drive or share with a PIN.',
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
    description: 'For solo practitioners getting started with digital workflows.',
    features: [
      'Budget planner & ATO PDF generation',
      'Document library',
      'E-sign via DocuSeal',
      '100MB storage',
    ],
    cta: 'Get started free',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'For growing practices that need more volume and Drive sync.',
    features: [
      'Everything in Free',
      'Google Drive backup',
      'Priority document storage',
      'Email support',
    ],
    highlighted: true,
    cta: 'Start Pro trial',
  },
  {
    name: 'Team',
    price: '$79',
    period: 'per month',
    description: 'For small firms coordinating multiple clients and users.',
    features: [
      'Everything in Pro',
      'Multi-user workspace (coming soon)',
      'Shared document folders',
      'Dedicated onboarding',
    ],
    cta: 'Contact sales',
  },
]

export const LANDING_FAQ = [
  {
    question: 'Is this built for Australian accounting?',
    answer:
      'Yes. The budget planner and ATO tax PDF workflow are designed for Australian small business and tax preparation use cases.',
  },
  {
    question: 'When will payments be available?',
    answer:
      'Pricing shown is indicative. Stripe and PayPal checkout will be added in a future release. You can use the free tier today.',
  },
  {
    question: 'Where are my documents stored?',
    answer:
      'Documents are stored in your private Supabase workspace. Signed PDFs can optionally sync to your own Google Drive.',
  },
  {
    question: 'Do I need to connect Google Drive?',
    answer:
      'No. Drive backup is optional. Connect it once in Settings to automatically upload signed PDFs.',
  },
] as const
