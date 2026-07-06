import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { readBlogPostBySlugCore } from '#/lib/server/read-blogs-core'

const getBlogPostSchema = z.object({
  slug: z.string().min(1),
})

export const getBlogPost = createServerFn({ method: 'GET' })
  .validator((data: unknown) => getBlogPostSchema.parse(data))
  .handler(async ({ data }) => readBlogPostBySlugCore(data.slug))
