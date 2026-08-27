import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/creative-studio/')({
  beforeLoad: () => {
    throw redirect({ to: '/ai-image-designer' })
  },
  component: () => null,
})
