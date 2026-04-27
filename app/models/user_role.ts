export const USER_ROLES = ['simple', 'complexe', 'admin'] as const

export type UserRole = (typeof USER_ROLES)[number]

const ROLE_RANKS: Record<UserRole, number> = {
  simple: 0,
  complexe: 1,
  admin: 2,
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  simple: 'Simple',
  complexe: 'Complexe',
  admin: 'Admin',
}

export const parseUserRole = (role: unknown): UserRole | null => {
  const normalized = String(typeof role === 'string' ? role : '').trim().toLowerCase()

  return USER_ROLES.includes(normalized as UserRole) ? (normalized as UserRole) : null
}

export const normalizeUserRole = (role: unknown): UserRole => {
  return parseUserRole(role) ?? 'simple'
}

export const hasMinimumRole = (role: unknown, required: UserRole) => {
  return ROLE_RANKS[normalizeUserRole(role)] >= ROLE_RANKS[required]
}
