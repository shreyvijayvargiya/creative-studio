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

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  phaseTwo?: boolean
}

export const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Budget Planner', icon: TableProperties, href: '/grid' },
  { label: 'Documents', icon: FileText, href: '/documents' },
  { label: 'PDF Viewer', icon: Eye, href: '/pdf' },
  {
    label: 'Storage',
    icon: HardDrive,
    href: '/storage',
    badge: 'Soon',
    phaseTwo: true,
  },
  {
    label: 'Messages',
    icon: MessageSquare,
    href: '/messages',
    badge: 'Soon',
    phaseTwo: true,
  },
  {
    label: 'Invoices',
    icon: Receipt,
    href: '/invoices',
    badge: 'Soon',
    phaseTwo: true,
  },
]

export const settingsNavItems: NavItem[] = [
  {
    label: 'Users & Roles',
    icon: Users,
    href: '/users',
    badge: 'Soon',
    phaseTwo: true,
  },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
