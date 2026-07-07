export interface Payee {
  id: string
  name: string
  email: string | null
  abn: string | null
  phone: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePayeeInput {
  name: string
  email?: string | null
  abn?: string | null
  phone?: string | null
  notes?: string | null
}

export interface UpdatePayeeInput {
  name?: string
  email?: string | null
  abn?: string | null
  phone?: string | null
  notes?: string | null
}
