import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'

import { formatBlogDate } from '#/lib/blog/format-date'
import type { BlogPostMeta } from '#/lib/blog/types'
import { FollowerPointerCard } from '#/components/ui/following-pointer'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'

function BlogListItem({
  post,
  index,
}: {
  post: BlogPostMeta
  index: number
}) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group relative z-10 block rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-blue-500/30 hover:bg-blue-50/40 hover:shadow-md sm:p-6 dark:hover:bg-blue-950/20"
    >
      <FollowerPointerCard
        className="block"
        title={<span className="font-medium">Read</span>}
      >
        <div className="flex items-start gap-5 sm:gap-8">
          <span
            aria-hidden
            className="w-12 shrink-0 text-4xl font-bold leading-none text-muted-foreground/25 transition-colors group-hover:text-blue-500/40 sm:w-16 sm:text-5xl"
          >
            {number}
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-blue-700 sm:text-xl dark:group-hover:text-blue-300">
              {post.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {post.description}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {formatBlogDate(post.publishedAt)}
            </p>
          </div>
        </div>
      </FollowerPointerCard>
    </Link>
  )
}

interface BlogSearchListProps {
  posts: BlogPostMeta[]
  className?: string
}

export function BlogSearchList({ posts, className }: BlogSearchListProps) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ['title', 'description', 'tags', 'slug'],
        threshold: 0.35,
      }),
    [posts],
  )

  const filteredPosts = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      return posts
    }

    return fuse.search(trimmed).map((result) => result.item)
  }, [fuse, posts, query])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles..."
          className="h-11 rounded-full border-border/60 bg-card pl-10"
          aria-label="Search blog articles"
        />
      </div>

      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <BlogListItem key={post.slug} post={post} index={index} />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            No articles match your search.
          </p>
        )}
      </div>
    </div>
  )
}
