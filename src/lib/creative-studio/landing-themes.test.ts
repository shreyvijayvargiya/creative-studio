import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { extractLandingPayload } from '#/lib/creative-studio/generate-landing'
import { buildLandingRevisePrompt } from '#/lib/creative-studio/build-landing-prompt'
import {
  imagePublicPath,
  isLandingStoragePath,
  landingStoragePath,
} from '#/lib/creative-studio/landing-images'
import { getLandingLayout } from '#/lib/creative-studio/landing-layouts'
import {
  extractDesignSystemPrompt,
  getPromptsDirectory,
  listLandingThemes,
  parseLandingThemeMarkdown,
  pickPreviewColors,
} from '#/lib/creative-studio/landing-themes'

describe('landing themes', () => {
  it('parses name, tagline, and preview colours from a prompt file', async () => {
    const markdown = await readFile(join(getPromptsDirectory(), 'swiss.md'), 'utf-8')
    const theme = parseLandingThemeMarkdown('swiss', 'swiss.md', markdown)

    expect(theme.name).toContain('Swiss')
    expect(theme.tagline.length).toBeGreaterThan(8)
    expect(theme.tagline).not.toBe('Design-system landing page')
    expect(theme.previewColors.length).toBeGreaterThanOrEqual(2)
    expect(theme.previewColors.every((hex) => /^#[0-9A-F]{6}$/.test(hex))).toBe(true)
    expect(extractDesignSystemPrompt(markdown)).toContain('International Typographic Style')
    expect(extractDesignSystemPrompt(markdown)).not.toContain('Ask the user focused questions')
  })

  it('lists every markdown theme in prompts/', async () => {
    const themes = await listLandingThemes()
    expect(themes.length).toBeGreaterThanOrEqual(20)
    expect(themes.some((theme) => theme.id === 'saas')).toBe(true)
    expect(themes.some((theme) => theme.id === 'swiss')).toBe(true)
    expect(themes.every((theme) => theme.name.length > 0)).toBe(true)
    expect(themes.every((theme) => theme.tagline.length >= 8)).toBe(true)
  })

  it('picks accent colours over pure black and white when possible', () => {
    expect(pickPreviewColors(['#FFFFFF', '#000000', '#FF3000', '#111111'])).toContain(
      '#FF3000',
    )
  })
})

describe('extractLandingPayload', () => {
  it('reads JSON with react and html code', () => {
    const payload = extractLandingPayload(
      JSON.stringify({
        title: 'Hero CTA',
        reactCode: 'export default function Page() { return <main /> }',
        htmlCode: '<!DOCTYPE html><html></html>',
      }),
    )

    expect(payload.title).toBe('Hero CTA')
    expect(payload.reactCode).toContain('export default')
    expect(payload.htmlCode).toContain('<!DOCTYPE html>')
  })

  it('reads an optional chatReply from JSON', () => {
    const payload = extractLandingPayload(
      JSON.stringify({
        title: 'Hero CTA',
        reactCode: 'export default function Page() { return <main /> }',
        htmlCode: '<!DOCTYPE html><html></html>',
        chatReply: 'Darkened the hero and added a pricing table.',
      }),
    )

    expect(payload.chatReply).toBe('Darkened the hero and added a pricing table.')
  })

  it('falls back to fenced tsx and html', () => {
    const payload = extractLandingPayload(`
\`\`\`tsx
export default function A() { return null }
\`\`\`

\`\`\`html
<html></html>
\`\`\`
`)

    expect(payload.reactCode).toContain('function A')
    expect(payload.htmlCode).toContain('<html>')
  })
})

describe('buildLandingRevisePrompt', () => {
  it('asks for a chatReply and includes the user update', () => {
    const layout = getLandingLayout('docs-saas')
    expect(layout).toBeDefined()

    const prompt = buildLandingRevisePrompt({
      theme: {
        id: 'saas',
        fileName: 'saas.md',
        name: 'SaaS',
        tagline: 'Clean product marketing',
        previewColors: ['#111111', '#FFFFFF'],
      },
      themePrompt: 'Use a restrained SaaS palette.',
      layout: layout!,
      userPrompt: 'Northloop climate analytics for manufacturers.',
      editPrompt: 'Add a pricing table',
      previousTitle: 'Hero CTA',
      previousReactCode: 'export default function Page() { return <main /> }',
      previousHtmlCode: '<!DOCTYPE html><html></html>',
      imagePaths: ['/images/ref-1.jpg', '/images/ref-2.png', '/images/ref-3.webp'],
      chatHistory: [{ role: 'user', content: 'Make the hero darker' }],
    })

    expect(prompt).toContain('Add a pricing table')
    expect(prompt).toContain('chatReply')
    expect(prompt).toContain('Make the hero darker')
    expect(prompt).toContain('Northloop climate analytics')
    expect(prompt).toContain('/images/ref-1.jpg')
    expect(prompt).toContain('/images/ref-3.webp')
  })
})

describe('landing image storage paths', () => {
  it('builds a documents-bucket key and a portable public path', () => {
    expect(
      landingStoragePath({
        ownerId: 'user-1',
        batchId: 'abc123',
        index: 0,
        fileName: 'hero.JPG',
        mimeType: 'image/jpeg',
      }),
    ).toBe('landing/user-1/abc123/ref-1.jpg')
    expect(imagePublicPath(0, 'hero.JPG', 'image/jpeg')).toBe('/images/ref-1.jpg')
    expect(isLandingStoragePath('landing/user-1/abc123/ref-1.jpg')).toBe(true)
    expect(isLandingStoragePath('documents/secret.pdf')).toBe(false)
  })
})
