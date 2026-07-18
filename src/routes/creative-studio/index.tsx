import { createFileRoute } from '@tanstack/react-router'

import { CreativeStudioDashboard } from '#/components/creative-studio/creative-studio-dashboard'

export const Route = createFileRoute('/creative-studio/')({
  component: CreativeStudioPage,
})

function CreativeStudioPage() {
  return <CreativeStudioDashboard />
}
