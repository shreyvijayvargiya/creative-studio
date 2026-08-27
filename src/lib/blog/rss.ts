import { listBlogPostsCore } from '#/lib/server/read-blogs-core'
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '#/lib/brand'
import { absoluteUrl, getSiteUrl } from '#/lib/blog/site-url'
import { escapeXml } from '#/lib/blog/xml'
import { MARKETING_TOOLS } from '#/lib/marketing/tools'

function rfc822(date: string): string {
  return new Date(date).toUTCString()
}

export async function generateRssXml(): Promise<string> {
  const posts = await listBlogPostsCore()
  const now = rfc822(new Date().toISOString())

  const blogItems = posts.map((post) => {
    const link = absoluteUrl(`/blog/${post.slug}`)
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(post.publishedAt)}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
  })

  const toolItems = MARKETING_TOOLS.map((tool) => {
    const link = absoluteUrl(tool.path)
    return `    <item>
      <title>${escapeXml(`${tool.name} — ${APP_NAME}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${now}</pubDate>
      <description>${escapeXml(tool.description)}</description>
    </item>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${APP_NAME} — ${APP_TAGLINE}`)}</title>
    <link>${getSiteUrl()}</link>
    <description>${escapeXml(APP_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />
${[...toolItems, ...blogItems].join('\n')}
  </channel>
</rss>`
}
