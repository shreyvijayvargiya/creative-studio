import { createFileRoute } from '@tanstack/react-router'

import { CreativeStudioDashboard } from '#/components/creative-studio/creative-studio-dashboard'
import { APP_NAME } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'
import { getMarketingTool } from '#/lib/marketing/tools'

const tool = getMarketingTool('image')

export const Route = createFileRoute('/ai-image-designer')({
  head: () =>
    buildPageHead({
      title: `${tool.name} | ${APP_NAME}`,
      description: tool.description,
      path: tool.path,
      image: '/hero-banner.png',
    }),
  component: AiImageDesignerPage,
})

function AiImageDesignerPage() {
  return <CreativeStudioDashboard />
}
