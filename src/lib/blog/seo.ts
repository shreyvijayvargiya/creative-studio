import { APP_NAME } from '#/lib/brand'
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
  const imageUrl = image?.startsWith('http') ? image : absoluteUrl(image ?? '/hero-banner.png')

  const meta: Array<Record<string, string>> = [
    { title },
    { name: 'description', content: description },
    { name: 'application-name', content: APP_NAME },
    { name: 'author', content: APP_NAME },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:site_name', content: APP_NAME },
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

export function buildPageHead(input: PageSeoInput) {
  return {
    meta: buildPageMetaTags(input),
    links: [
      { rel: 'canonical', href: absoluteUrl(input.path) },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        href: absoluteUrl('/rss.xml'),
        title: `${APP_NAME} RSS`,
      },
    ],
  }
}

export function buildBlogPostMeta(post: BlogPostMeta) {
  return buildPageMetaTags({
    title: `${post.title} | ${APP_NAME} Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    publishedAt: post.publishedAt,
    tags: post.tags,
  })
}

export function buildSoftwareJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: APP_NAME,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: absoluteUrl('/'),
    description:
      'Kixi is a creative studio for designers with an AI logo designer, AI product video generator, and AI image generator.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  })
}
