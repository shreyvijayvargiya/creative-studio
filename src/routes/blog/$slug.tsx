import { createFileRoute, notFound } from '@tanstack/react-router'

import { BlogMarkdown } from '#/components/blog/blog-markdown'
import { BlogPostActions } from '#/components/blog/blog-post-actions'
import { formatBlogDate } from '#/lib/blog/format-date'
import { getBlogPost } from '#/lib/server/get-blog-post'
import { buildBlogPostMeta } from '#/lib/blog/seo'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getBlogPost({ data: { slug: params.slug } })

    if (!post) {
      throw notFound()
    }

    return post
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: 'Article not found | Kixi Blog' }] }
    }

    return { meta: buildBlogPostMeta(loaderData) }
  },
  component: BlogPostPage,
})

function BlogPostPage() {
  const post = Route.useLoaderData()

  return (
    <article className="bg-background pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <BlogPostActions slug={post.slug} markdown={post.content} className="mb-8" />

        {post.image ? (
          <img
            src={post.image}
            alt=""
            className="mb-8 aspect-[16/9] w-full rounded-2xl border border-border/60 object-cover"
          />
        ) : null}

        <header className="mb-8">
          <p className="text-sm text-muted-foreground">{formatBlogDate(post.publishedAt)}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            {post.description}
          </p>
          {post.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <BlogMarkdown content={post.content} />
      </div>
    </article>
  )
}
