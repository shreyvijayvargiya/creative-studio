import { createServerFn } from '@tanstack/react-start'

import { listBlogPostsCore } from '#/lib/server/read-blogs-core'

export const listBlogPosts = createServerFn({ method: 'GET' }).handler(
  async () => listBlogPostsCore(),
)
