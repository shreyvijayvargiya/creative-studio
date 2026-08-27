import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/ai-image-generator')({
  beforeLoad: () => {
    throw redirect({ to: '/ai-image-designer' })
  },
  component: () => null,
})
