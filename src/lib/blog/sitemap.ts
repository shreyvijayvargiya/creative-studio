import { listBlogPostsCore } from '#/lib/server/read-blogs-core'
import { absoluteUrl } from '#/lib/blog/site-url'
import { escapeXml } from '#/lib/blog/xml'

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/features', priority: '0.9', changefreq: 'weekly' },
  { path: '/ai-landing-page-creator', priority: '0.9', changefreq: 'weekly' },
  { path: '/ai-logo-designer', priority: '0.9', changefreq: 'weekly' },
  { path: '/ai-product-video-generator', priority: '0.9', changefreq: 'weekly' },
  { path: '/ai-image-designer', priority: '0.9', changefreq: 'weekly' },
  { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.4', changefreq: 'yearly' },
] as const

function formatLastmod(date: string): string {
  return new Date(date).toISOString().split('T')[0] ?? date
}

export async function generateSitemapXml(): Promise<string> {
  const posts = await listBlogPostsCore()
  const today = formatLastmod(new Date().toISOString())

  const staticUrls = STATIC_PAGES.map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${escapeXml(absoluteUrl(path))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )

  const blogUrls = posts.map(
    (post) => `  <url>
    <loc>${escapeXml(absoluteUrl(`/blog/${post.slug}`))}</loc>
    <lastmod>${formatLastmod(post.publishedAt)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...blogUrls].join('\n')}
</urlset>`
}
