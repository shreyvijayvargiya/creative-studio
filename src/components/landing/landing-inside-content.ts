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
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    cardHoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
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
