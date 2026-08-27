import type { LucideIcon } from 'lucide-react'
import {
  HardDrive,
  LayoutDashboard,
  Settings,
  Sparkles,
  TableProperties,
  Users,
} from 'lucide-react'

export interface NavChildItem {
  label: string
  href: string
  badge?: string
  phaseTwo?: boolean
}

export interface NavGroupItem {
  label: string
  icon: LucideIcon
  href?: string
  badge?: string
  phaseTwo?: boolean
  children?: NavChildItem[]
}

export interface NavSection {
  label: string
  items: NavGroupItem[]
}

export const navSections: NavSection[] = [
  {
    label: 'Platform',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      {
        label: 'Finance',
        icon: TableProperties,
        children: [
          { label: 'Budget Planner', href: '/grid' },
          { label: 'Bank Statements', href: '/bank-statements' },
          { label: 'Documents', href: '/documents' },
          { label: 'Payees', href: '/payees' },
          { label: 'PDF Viewer', href: '/pdf' },
        ],
      },
      {
        label: 'Kixi',
        icon: Sparkles,
        children: [
          { label: 'Landing', href: '/ai-landing-page-creator' },
          { label: 'Images', href: '/ai-image-designer' },
          { label: 'Video', href: '/ai-product-video-generator' },
          { label: 'Logo', href: '/ai-logo-designer' },
        ],
      },
      {
        label: 'Workspace',
        icon: HardDrive,
        children: [
          {
            label: 'Storage',
            href: '/storage',
          },
          {
            label: 'Messages',
            href: '/messages',
            badge: 'Soon',
            phaseTwo: true,
          },
          {
            label: 'Invoices',
            href: '/invoices',
            badge: 'Soon',
            phaseTwo: true,
          },
        ],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', icon: Settings, href: '/settings' },
      {
        label: 'Users & Roles',
        icon: Users,
        href: '/users',
        badge: 'Soon',
        phaseTwo: true,
      },
    ],
  },
]

/** @deprecated Use navSections — kept for search command compatibility */
export const mainNavItems = navSections[0].items.flatMap((item) =>
  item.children
    ? item.children.map((child) => ({
        label: child.label,
        href: child.href,
        icon: item.icon,
        badge: child.badge,
        phaseTwo: child.phaseTwo,
      }))
    : [{ label: item.label, href: item.href!, icon: item.icon, badge: item.badge }],
)

/** @deprecated Use navSections */
export const settingsNavItems = navSections[1].items.map((item) => ({
  label: item.label,
  href: item.href!,
  icon: item.icon,
  badge: item.badge,
  phaseTwo: item.phaseTwo,
}))

export type NavItem = (typeof mainNavItems)[number]

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isNavGroupActive(
  pathname: string,
  item: NavGroupItem,
): boolean {
  if (item.href && isNavItemActive(pathname, item.href)) {
    return true
  }

  return (
    item.children?.some((child) => isNavItemActive(pathname, child.href)) ??
    false
  )
}
