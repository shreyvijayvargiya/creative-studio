import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/creative-studio/landing')({
  beforeLoad: () => {
    throw redirect({ to: '/ai-landing-page-creator' })
  },
  component: () => null,
})
