import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { CheckCircle } from 'lucide-react'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const canvasRef = useRef<SignatureCanvas>(null)
  const [applied, setApplied] = useState(false)

  const handleApply = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png')
    if (!dataUrl || canvasRef.current?.isEmpty()) return

    onSave(dataUrl)
    setApplied(true)
  }

  const handleClear = () => {
    canvasRef.current?.clear()
    setApplied(false)
    onSave('')
  }

  return (
    <div className="space-y-4">
      <div className="w-full max-w-[500px] overflow-hidden rounded-xl border bg-white">
        <SignatureCanvas
          ref={canvasRef}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 120,
            className: 'h-[120px] w-full max-w-[500px]',
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleApply}>
          Apply Signature
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      {applied ? (
        <Alert variant="success">
          <CheckCircle />
          <AlertDescription>
            Signature applied — ready to generate PDF
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
