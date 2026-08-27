import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/creative-studio/video')({
  beforeLoad: () => {
    throw redirect({ to: '/ai-product-video-generator' })
  },
  component: () => null,
})
