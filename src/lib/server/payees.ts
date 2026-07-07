import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { requireAuthUser } from '#/lib/server/require-auth-user'
import {
  createPayeeForUser,
  deletePayeeForUser,
  findPayeeForUser,
  listPayeesForUser,
  updatePayeeForUser,
} from '#/lib/server/payees-core'

const payeeFieldsSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  abn: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const listPayees = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireAuthUser()
  return listPayeesForUser(user.id)
})

export const createPayee = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        name: z.string().min(1),
        email: z.string().email().nullable().optional(),
        abn: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireAuthUser()
    return createPayeeForUser(user.id, data)
  })

export const updatePayee = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        payeeId: z.string().uuid().optional(),
        payeeName: z.string().min(1).optional(),
        ...payeeFieldsSchema.shape,
      })
      .refine((value) => value.payeeId || value.payeeName, {
        message: 'payeeId or payeeName is required',
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireAuthUser()

    let payeeId = data.payeeId

    if (!payeeId && data.payeeName) {
      const found = await findPayeeForUser(user.id, data.payeeName)
      if (!found) {
        throw new Error(`No payee found matching "${data.payeeName}"`)
      }
      payeeId = found.id
    }

    if (!payeeId) {
      throw new Error('Payee not found')
    }

    const { payeeId: _id, payeeName: _name, ...fields } = data
    return updatePayeeForUser(user.id, payeeId, fields)
  })

export const deletePayee = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        payeeId: z.string().uuid().optional(),
        payeeName: z.string().min(1).optional(),
      })
      .refine((value) => value.payeeId || value.payeeName, {
        message: 'payeeId or payeeName is required',
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireAuthUser()

    let payeeId = data.payeeId

    if (!payeeId && data.payeeName) {
      const found = await findPayeeForUser(user.id, data.payeeName)
      if (!found) {
        throw new Error(`No payee found matching "${data.payeeName}"`)
      }
      payeeId = found.id
    }

    if (!payeeId) {
      throw new Error('Payee not found')
    }

    return deletePayeeForUser(user.id, payeeId)
  })
