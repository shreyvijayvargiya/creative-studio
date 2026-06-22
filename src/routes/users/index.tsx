import { createFileRoute } from '@tanstack/react-router'

import { PhaseTwoPlaceholder } from '#/components/layout/phase-two-placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/users/')({
  component: UsersPage,
})

function UsersPage() {
  return (
    <PhaseTwoPlaceholder>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Users & Roles
          </h1>
          <p className="text-sm text-muted-foreground">
            Team access and permissions
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            User and role management will be available in Phase 2.
          </CardContent>
        </Card>
      </div>
    </PhaseTwoPlaceholder>
  )
}
