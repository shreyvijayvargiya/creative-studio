import type { LucideIcon } from 'lucide-react'

import { MARKETING_TOOLS, type MarketingTool } from '#/lib/marketing/tools'

export interface HomeInsideFeature {
  number: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  cardHoverBg: string
  title: string
  description: string
  href?: MarketingTool['path']
}

export const HOME_INSIDE_FEATURES: HomeInsideFeature[] = MARKETING_TOOLS.map(
  (tool, index) => ({
    number: String(index + 1).padStart(2, '0'),
    icon: tool.icon,
    iconBg: tool.iconBg,
    iconColor: tool.iconColor,
    cardHoverBg: tool.cardHoverBg,
    title: tool.name,
    description: tool.description,
    href: tool.path,
  }),
)
