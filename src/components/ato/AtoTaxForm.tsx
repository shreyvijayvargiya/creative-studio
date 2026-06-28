import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import type { AtoTaxpayerInfo } from '#/types'

interface AtoTaxFormProps {
  value: AtoTaxpayerInfo
  onChange: (value: AtoTaxpayerInfo) => void
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={label}
            checked={value}
            onChange={() => onChange(true)}
          />
          Yes
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={label}
            checked={!value}
            onChange={() => onChange(false)}
          />
          No
        </label>
      </div>
    </fieldset>
  )
}

export function AtoTaxForm({ value, onChange }: AtoTaxFormProps) {
  const update = (partial: Partial<AtoTaxpayerInfo>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="tfn">Tax File Number (TFN)</Label>
        <Input
          id="tfn"
          inputMode="numeric"
          maxLength={9}
          placeholder="123 456 789"
          value={value.tfn}
          onChange={(event) =>
            update({ tfn: event.target.value.replace(/\D/g, '').slice(0, 9) })
          }
        />
      </div>

      <YesNoField
        label="Are you an Australian resident?"
        value={value.isAustralianResident}
        onChange={(isAustralianResident) => update({ isAustralianResident })}
      />

      <YesNoField
        label="Has any part of your name changed since completing your last tax return?"
        value={value.nameChanged}
        onChange={(nameChanged) => update({ nameChanged })}
      />

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Mr / Ms / Mrs"
          value={value.title}
          onChange={(event) => update({ title: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="surname">Surname or family name</Label>
        <Input
          id="surname"
          value={value.surname}
          onChange={(event) => update({ surname: event.target.value })}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="firstName">First given name</Label>
        <Input
          id="firstName"
          value={value.firstName}
          onChange={(event) => update({ firstName: event.target.value })}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="postalAddress">Postal address</Label>
        <Input
          id="postalAddress"
          value={value.postalAddress}
          onChange={(event) => update({ postalAddress: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="suburb">Suburb / Town</Label>
        <Input
          id="suburb"
          value={value.suburb}
          onChange={(event) => update({ suburb: event.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            maxLength={3}
            placeholder="NSW"
            value={value.state}
            onChange={(event) =>
              update({ state: event.target.value.toUpperCase().slice(0, 3) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            inputMode="numeric"
            maxLength={4}
            value={value.postcode}
            onChange={(event) =>
              update({ postcode: event.target.value.replace(/\D/g, '').slice(0, 4) })
            }
          />
        </div>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <YesNoField
          label="Is your home address different from your postal address?"
          value={value.homeAddressDifferent}
          onChange={(homeAddressDifferent) => update({ homeAddressDifferent })}
        />
      </div>

      {value.homeAddressDifferent ? (
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="homeAddress">Home address</Label>
          <Input
            id="homeAddress"
            value={value.homeAddress}
            onChange={(event) => update({ homeAddress: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  )
}

export function isAtoTaxFormValid(value: AtoTaxpayerInfo): boolean {
  return (
    value.tfn.length >= 8 &&
    value.surname.trim().length > 0 &&
    value.firstName.trim().length > 0 &&
    value.postalAddress.trim().length > 0 &&
    value.suburb.trim().length > 0 &&
    value.state.trim().length > 0 &&
    value.postcode.length === 4
  )
}
