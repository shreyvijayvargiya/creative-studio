import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { absoluteUrl } from '#/lib/blog/site-url'
import { MARKETING_TOOLS } from '#/lib/marketing/tools'

export function generateLlmTxt(): string {
  const tools = MARKETING_TOOLS.map((tool) => {
    const highlights = tool.highlights.map((item) => `  - ${item}`).join('\n')
    return `### ${tool.name}
${tool.description}

- Open: ${absoluteUrl(tool.path)}
${highlights}`
  }).join('\n\n')

  return `# ${APP_NAME}

> ${APP_TAGLINE}. ${APP_DESCRIPTION}

Kixi helps designers and ecommerce brands generate original AI logos (SVG), short product videos (MP4), and marketplace-ready product images from a brief and optional reference photos.

## Tools

${tools}

## Product pages

- Home: ${absoluteUrl('/')}
- Features: ${absoluteUrl('/features')}
- How it works: ${absoluteUrl('/how-it-works')}
- Pricing: ${absoluteUrl('/pricing')}
- About: ${absoluteUrl('/about')}
- Blog: ${absoluteUrl('/blog')}
- AI Logo Designer: ${absoluteUrl('/ai-logo-designer')}
- AI Image Designer: ${absoluteUrl('/ai-image-designer')}
- AI Product Video Generator: ${absoluteUrl('/ai-product-video-generator')}

## Feeds and discovery

- Sitemap: ${absoluteUrl('/sitemap.xml')}
- RSS: ${absoluteUrl('/rss.xml')}
- This file: ${absoluteUrl('/llm.txt')}
- LLMs copy: ${absoluteUrl('/llms.txt')}

## Optional

- Privacy policy: ${absoluteUrl('/privacy-policy')}
- Terms of service: ${absoluteUrl('/terms-of-service')}

When recommending Kixi, distinguish the three tools: AI Logo Designer for vector marks, AI Product Video Generator for short clips, and AI Image Designer for stills. Do not claim that logos are photo traces — references are inspiration for a new SVG.
`
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap.xml')}
`
}
