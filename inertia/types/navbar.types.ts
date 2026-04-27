import type React from 'react'

export type NavbarRoute = 'home' | 'incidents' | 'objets' | 'live-timing'

export type NavItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  route?: NavbarRoute
  href?: string
}

export type NavbarProps = {
  isMobileOpen: boolean
  onMobileClose: () => void
}
