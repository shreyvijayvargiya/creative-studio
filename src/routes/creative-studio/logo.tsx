import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/creative-studio/logo')({
  beforeLoad: () => {
    throw redirect({ to: '/ai-logo-designer' })
  },
  component: () => null,
})
