import { describe, expect, it } from 'vitest'

import { generateLlmTxt, generateRobotsTxt } from '#/lib/blog/llm-txt'
import { generateRssXml } from '#/lib/blog/rss'
import { generateSitemapXml } from '#/lib/blog/sitemap'

describe('seo feeds', () => {
  it('includes Kixi tools in llm.txt', () => {
    const text = generateLlmTxt()
    expect(text).toContain('# Kixi')
    expect(text).toContain('AI Logo Designer')
    expect(text).toContain('AI Product Video Generator')
    expect(text).toContain('AI Image Designer')
    expect(text).toContain('/ai-logo-designer')
    expect(text).toContain('/ai-image-designer')
  })

  it('points robots.txt at the sitemap', () => {
    expect(generateRobotsTxt()).toContain('Sitemap:')
    expect(generateRobotsTxt()).toContain('/sitemap.xml')
  })

  it('lists tool pages in the sitemap', async () => {
    const xml = await generateSitemapXml()
    expect(xml).toContain('/ai-logo-designer')
    expect(xml).toContain('/ai-product-video-generator')
    expect(xml).toContain('/ai-image-designer')
    expect(xml).not.toContain('/creative-studio/logo')
  })

  it('emits an rss channel for Kixi', async () => {
    const xml = await generateRssXml()
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('Kixi')
    expect(xml).toContain('/rss.xml')
  })
})
