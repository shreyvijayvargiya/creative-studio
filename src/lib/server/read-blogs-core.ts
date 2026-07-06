import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { BlogIndexFile, BlogPost, BlogPostMeta } from '#/lib/blog/types'

function getBlogsDirectory(): string {
  return join(process.cwd(), 'blogs')
}

export async function readBlogIndexFile(): Promise<BlogIndexFile> {
  const raw = await readFile(join(getBlogsDirectory(), 'index.json'), 'utf-8')
  return JSON.parse(raw) as BlogIndexFile
}

export async function listBlogPostsCore(): Promise<BlogPostMeta[]> {
  const index = await readBlogIndexFile()

  return [...index.posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export async function readBlogPostBySlugCore(
  slug: string,
): Promise<BlogPost | null> {
  const posts = await listBlogPostsCore()
  const meta = posts.find((post) => post.slug === slug)

  if (!meta) {
    return null
  }

  const content = await readFile(
    join(getBlogsDirectory(), meta.filePath),
    'utf-8',
  )

  return { ...meta, content }
}
