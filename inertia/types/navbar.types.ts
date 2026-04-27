import type React from 'react'

export type NavbarRoute = 'home' | 'profile.edit' | 'incidents' | 'objets'

export type UserRole = 'simple' | 'complexe' | 'admin'

export type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  route?: NavbarRoute
  href?: string
}

export type RoleNavItem = NavItem & {
  minRole?: UserRole
}

export type NavbarProps = {
  isMobileOpen: boolean
  onMobileClose: () => void
}
