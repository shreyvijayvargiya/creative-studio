import { createFileRoute } from '@tanstack/react-router'

import { PhaseTwoPlaceholder } from '#/components/layout/phase-two-placeholder'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <PhaseTwoPlaceholder>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Application configuration
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>Settings will be available in Phase 2.</CardContent>
        </Card>
      </div>
    </PhaseTwoPlaceholder>
  )
}
