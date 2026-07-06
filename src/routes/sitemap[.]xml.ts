import { createFileRoute } from '@tanstack/react-router'

import { generateSitemapXml } from '#/lib/blog/sitemap'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const xml = await generateSitemapXml()

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
