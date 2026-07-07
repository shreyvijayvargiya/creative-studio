import type {
  CreatePayeeInput,
  Payee,
  UpdatePayeeInput,
} from '#/types/payee'
import { getSupabaseAdmin } from '#/lib/supabase/admin'
import { formatPayeesError } from '#/lib/server/payees-errors'

function mapPayeeRow(row: Record<string, unknown>): Payee {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string | null) ?? null,
    abn: (row.abn as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function listPayeesForUser(userId: string): Promise<Payee[]> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('payees')
    .select('*')
    .eq('owner_id', userId)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(formatPayeesError(error))
  }

  return (data ?? []).map(mapPayeeRow)
}

export async function findPayeeForUser(
  userId: string,
  identifier: string,
): Promise<Payee | null> {
  const trimmed = identifier.trim()
  const supabase = getSupabaseAdmin()

  const byId = await supabase
    .from('payees')
    .select('*')
    .eq('owner_id', userId)
    .eq('id', trimmed)
    .maybeSingle()

  if (byId.error) {
    throw new Error(formatPayeesError(byId.error))
  }

  if (byId.data) {
    return mapPayeeRow(byId.data)
  }

  const { data, error } = await supabase
    .from('payees')
    .select('*')
    .eq('owner_id', userId)
    .ilike('name', trimmed)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(formatPayeesError(error))
  }

  return data ? mapPayeeRow(data) : null
}

export async function createPayeeForUser(
  userId: string,
  input: CreatePayeeInput,
): Promise<Payee> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('payees')
    .insert({
      owner_id: userId,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      abn: input.abn?.trim() || null,
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(formatPayeesError(error ?? new Error('Unknown error')))
  }

  return mapPayeeRow(data)
}

export async function updatePayeeForUser(
  userId: string,
  payeeId: string,
  input: UpdatePayeeInput,
): Promise<Payee> {
  const supabase = getSupabaseAdmin()
  const patch: Record<string, string | null> = {}

  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.email !== undefined) patch.email = input.email?.trim() || null
  if (input.abn !== undefined) patch.abn = input.abn?.trim() || null
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null

  const { data, error } = await supabase
    .from('payees')
    .update(patch)
    .eq('id', payeeId)
    .eq('owner_id', userId)
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(formatPayeesError(error ?? new Error('Payee not found')))
  }

  return mapPayeeRow(data)
}

export async function deletePayeeForUser(
  userId: string,
  payeeId: string,
): Promise<{ id: string; name: string }> {
  const supabase = getSupabaseAdmin()

  const { data: existing, error: fetchError } = await supabase
    .from('payees')
    .select('id, name')
    .eq('id', payeeId)
    .eq('owner_id', userId)
    .single()

  if (fetchError) {
    throw new Error(formatPayeesError(fetchError))
  }

  if (!existing) {
    throw new Error('Payee not found')
  }

  const { error } = await supabase
    .from('payees')
    .delete()
    .eq('id', payeeId)
    .eq('owner_id', userId)

  if (error) {
    throw new Error(formatPayeesError(error))
  }

  return { id: existing.id as string, name: existing.name as string }
}
