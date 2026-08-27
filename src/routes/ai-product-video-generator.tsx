import { createFileRoute } from '@tanstack/react-router'

import { CreativeStudioVideoDashboard } from '#/components/creative-studio/creative-studio-video-dashboard'
import { APP_NAME } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'
import { getMarketingTool } from '#/lib/marketing/tools'

const tool = getMarketingTool('video')

export const Route = createFileRoute('/ai-product-video-generator')({
  head: () =>
    buildPageHead({
      title: `${tool.name} | ${APP_NAME}`,
      description: tool.description,
      path: tool.path,
      image: '/hero-banner.png',
    }),
  component: AiProductVideoGeneratorPage,
})

function AiProductVideoGeneratorPage() {
  return <CreativeStudioVideoDashboard />
}
