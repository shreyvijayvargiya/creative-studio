import { createFileRoute } from '@tanstack/react-router'

import { CreativeStudioLogoDashboard } from '#/components/creative-studio/creative-studio-logo-dashboard'
import { APP_NAME } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'
import { getMarketingTool } from '#/lib/marketing/tools'

const tool = getMarketingTool('logo')

export const Route = createFileRoute('/ai-logo-designer')({
  head: () =>
    buildPageHead({
      title: `${tool.name} | ${APP_NAME}`,
      description: tool.description,
      path: tool.path,
      image: '/hero-banner.png',
    }),
  component: AiLogoDesignerPage,
})

function AiLogoDesignerPage() {
  return <CreativeStudioLogoDashboard />
}
