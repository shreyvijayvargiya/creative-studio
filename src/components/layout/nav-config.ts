import type { LucideIcon } from 'lucide-react'
import {
  Eye,
  FileText,
  HardDrive,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
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
      { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
      {
        label: 'Finance',
        icon: TableProperties,
        children: [
          { label: 'Budget Planner', href: '/grid' },
          { label: 'Documents', href: '/documents' },
          { label: 'PDF Viewer', href: '/pdf' },
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
  if (href === '/') {
    return pathname === '/'
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
