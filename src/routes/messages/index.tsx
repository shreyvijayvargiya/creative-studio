import { createFileRoute } from '@tanstack/react-router'

import { PhaseTwoPlaceholder } from '#/components/layout/phase-two-placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/messages/')({
  component: MessagesPage,
})

function MessagesPage() {
  return (
    <PhaseTwoPlaceholder>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Client communication inbox
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent>Messaging will be available in Phase 2.</CardContent>
        </Card>
      </div>
    </PhaseTwoPlaceholder>
  )
}
