import { absoluteUrl } from '#/lib/blog/site-url'
import type { BlogPostMeta } from '#/lib/blog/types'

interface PageSeoInput {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedAt?: string
  tags?: string[]
}

export function buildPageMetaTags({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedAt,
  tags,
}: PageSeoInput) {
  const url = absoluteUrl(path)
  const imageUrl = image ?? absoluteUrl('/manifest.json')

  const meta: Array<Record<string, string>> = [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ]

  if (publishedAt) {
    meta.push({ property: 'article:published_time', content: publishedAt })
  }

  if (tags?.length) {
    tags.forEach((tag) => {
      meta.push({ property: 'article:tag', content: tag })
    })
  }

  return meta
}

export function buildBlogPostMeta(post: BlogPostMeta) {
  return buildPageMetaTags({
    title: `${post.title} | Finance CRM Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    publishedAt: post.publishedAt,
    tags: post.tags,
  })
}
