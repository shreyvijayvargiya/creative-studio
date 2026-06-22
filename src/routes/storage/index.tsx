import { createFileRoute } from '@tanstack/react-router'

import { PhaseTwoPlaceholder } from '#/components/layout/phase-two-placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/storage/')({
  component: StoragePage,
})

function StoragePage() {
  return (
    <PhaseTwoPlaceholder>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
          <p className="text-sm text-muted-foreground">
            Manage uploaded files and quotas
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>File Storage</CardTitle>
          </CardHeader>
          <CardContent>
            Storage management will be available in Phase 2.
          </CardContent>
        </Card>
      </div>
    </PhaseTwoPlaceholder>
  )
}
