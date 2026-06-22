export type AuthProviderKind = 'email' | 'google' | 'unknown'

export interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  authProvider: AuthProviderKind
  createdAt: string
  updatedAt: string
}

export interface EmailSignUpInput {
  username: string
  email: string
  password: string
}

export interface EmailSignInInput {
  identifier: string
  password: string
}
