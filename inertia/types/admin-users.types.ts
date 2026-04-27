export type UserRole = 'simple' | 'complexe' | 'admin'

export type AdminUser = {
  id: number
  email: string
  fullName: string | null
  pseudo: string | null
  isVerified: boolean
  role: UserRole
  createdAt: string
}

export type AdminUsersPageProps = {
  users: AdminUser[]
}