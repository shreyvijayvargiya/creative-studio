import { createFileRoute } from '@tanstack/react-router'

import { PhaseTwoPlaceholder } from '#/components/layout/phase-two-placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/invoices/')({
  component: InvoicesPage,
})

function InvoicesPage() {
  return (
    <PhaseTwoPlaceholder>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Billing and invoice management
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            Invoice management will be available in Phase 2.
          </CardContent>
        </Card>
      </div>
    </PhaseTwoPlaceholder>
  )
}
