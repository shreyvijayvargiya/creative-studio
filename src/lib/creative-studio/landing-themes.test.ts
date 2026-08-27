import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { extractLandingPayload } from '#/lib/creative-studio/generate-landing'
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
