export type NetworkingUser = {
  id: number
  pseudo: string
  fullName: string | null
  email: string
  avatarUrl: string | null
  followedTeam: string | null
  jobTitle: string | null
  isCurrentUser: boolean
}

export type NetworkingPageProps = {
  users: NetworkingUser[]
}