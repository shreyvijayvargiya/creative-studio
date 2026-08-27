import { createFileRoute } from '@tanstack/react-router'

import { CreativeStudioLandingDashboard } from '#/components/creative-studio/creative-studio-landing-dashboard'
import { APP_NAME } from '#/lib/brand'
import { buildPageHead } from '#/lib/blog/seo'
import { getMarketingTool } from '#/lib/marketing/tools'
import { listLandingThemesFn } from '#/lib/server/creative-studio-landing'

const tool = getMarketingTool('landing')

export const Route = createFileRoute('/ai-landing-page-creator')({
  loader: () => listLandingThemesFn(),
  head: () =>
    buildPageHead({
      title: `${tool.name} | ${APP_NAME}`,
      description: tool.description,
      path: tool.path,
      image: '/hero-banner.png',
    }),
  component: AiLandingPageCreatorPage,
})

function AiLandingPageCreatorPage() {
  const themes = Route.useLoaderData()
  return <CreativeStudioLandingDashboard themes={themes} />
}
