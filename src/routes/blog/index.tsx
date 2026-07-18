import { createFileRoute } from '@tanstack/react-router'

import { BlogSearchList } from '#/components/blog/blog-search-list'
import { LandingGradientText } from '#/components/landing/landing-section-heading'
import { listBlogPosts } from '#/lib/server/list-blog-posts'
import { buildPageMetaTags } from '#/lib/blog/seo'

export const Route = createFileRoute('/blog/')({
  loader: async () => listBlogPosts(),
  head: () => ({
    meta: buildPageMetaTags({
      title: 'Blog | Creative Studio — Ecommerce Creative Insights',
      description:
        'Articles on AI product photography, marketplace creatives, Etsy and Shopify assets, and ecommerce brand workflows.',
      path: '/blog',
      image: '/hero-banner.png',
    }),
  }),
  component: BlogPage,
})

function BlogPage() {
  const posts = Route.useLoaderData()

  return (
    <section className="bg-background pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Insights on AI product creatives, marketplace assets, and product
            updates from{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Creative Studio
            </span>
            .
          </p>
        </div>

        <BlogSearchList posts={posts} />

        <p className="mt-12 text-center text-sm text-muted-foreground">
          More guides on{' '}
          <LandingGradientText>modern practice delivery</LandingGradientText> coming
          soon.
        </p>
      </div>
    </section>
  )
}
