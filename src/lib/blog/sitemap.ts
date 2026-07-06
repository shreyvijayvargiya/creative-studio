import { listBlogPostsCore } from '#/lib/server/read-blogs-core'
import { absoluteUrl } from '#/lib/blog/site-url'

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/features', priority: '0.9', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'daily' },
  { path: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
] as const

function formatLastmod(date: string): string {
  return new Date(date).toISOString().split('T')[0] ?? date
}

export async function generateSitemapXml(): Promise<string> {
  const posts = await listBlogPostsCore()
  const today = formatLastmod(new Date().toISOString())

  const staticUrls = STATIC_PAGES.map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${absoluteUrl(path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )

  const blogUrls = posts.map(
    (post) => `  <url>
    <loc>${absoluteUrl(`/blog/${post.slug}`)}</loc>
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
