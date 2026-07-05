import type { LucideIcon } from 'lucide-react'
import { Cloud, FileText, PenLine, TableProperties } from 'lucide-react'

export interface HomeInsideFeature {
  number: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  cardHoverBg: string
  title: string
  description: string
}

export const HOME_INSIDE_FEATURES: HomeInsideFeature[] = [
  {
    number: '01',
    icon: TableProperties,
    iconBg: 'bg-violet-100 dark:bg-violet-950/50',
    iconColor: 'text-violet-600 dark:text-violet-400',
    cardHoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-950/30',
    title: 'Budget planner',
    description:
      'Spreadsheet-style grid for income, expenses, and net position — built for small business accounting workflows.',
  },
  {
    number: '02',
    icon: FileText,
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/50',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    cardHoverBg: 'hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30',
    title: 'ATO tax PDFs',
    description:
      'Generate structured tax return PDFs from budget data and taxpayer details in a few guided steps.',
  },
  {
    number: '03',
    icon: PenLine,
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    cardHoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
    title: 'E-signing',
    description:
      'Embedded DocuSeal signing so clients complete documents without leaving your workspace.',
  },
  {
    number: '04',
    icon: Cloud,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    cardHoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    title: 'Drive & storage',
    description:
      'Private document library with optional Google Drive backup and PIN-protected sharing.',
  },
]
