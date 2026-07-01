import { describe, expect, it } from 'vitest'

import { isAtoTaxFormValid } from '#/components/ato/AtoTaxForm'
import { DEFAULT_ATO_TAXPAYER, type AtoTaxpayerInfo } from '#/types'

const validTaxpayer: AtoTaxpayerInfo = {
  ...DEFAULT_ATO_TAXPAYER,
  tfn: '12345678',
  surname: 'Taxpayer',
  firstName: 'Jane',
  postalAddress: '1 Main St',
  suburb: 'Sydney',
  state: 'NSW',
  postcode: '2000',
}

describe('isAtoTaxFormValid', () => {
  it('accepts a complete taxpayer form', () => {
    expect(isAtoTaxFormValid(validTaxpayer)).toBe(true)
  })

  it('rejects missing TFN', () => {
    expect(isAtoTaxFormValid({ ...validTaxpayer, tfn: '1234567' })).toBe(false)
  })

  it('rejects missing name fields', () => {
    expect(isAtoTaxFormValid({ ...validTaxpayer, surname: ' ' })).toBe(false)
    expect(isAtoTaxFormValid({ ...validTaxpayer, firstName: '' })).toBe(false)
  })

  it('rejects invalid postcode length', () => {
    expect(isAtoTaxFormValid({ ...validTaxpayer, postcode: '200' })).toBe(false)
    expect(isAtoTaxFormValid({ ...validTaxpayer, postcode: '20000' })).toBe(
      false,
    )
  })
})
