import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { LandingThemeMeta } from '#/types/creative-studio'

const THEME_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/

/**
 * Vite inlines these at build time so Vercel / Nitro do not need a prompts/
 * folder on disk (process.cwd() is /var/task there).
 */
const bundledPromptFiles = import.meta.glob('../../../prompts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function getPromptsDirectory(): string {
  return join(process.cwd(), 'prompts')
}

export function isLandingThemeId(id: string): boolean {
  return THEME_ID_PATTERN.test(id)
}

function titleCaseSlug(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function extractName(id: string, markdown: string): string {
  const styleMatch = markdown.match(/^# Design Style:\s*(.+)$/m)
  if (styleMatch?.[1]) {
    return styleMatch[1].replace(/\s*\([^)]*\)\s*$/, '').trim()
  }

  const systemHeading = markdown.match(
    /<design-system>\s*\n+#\s+(?!Design Philosophy)(.+)/,
  )
  if (systemHeading?.[1]) {
    return systemHeading[1]
      .replace(/\s*Design System\s*$/i, '')
      .replace(/^High-Fidelity\s+/i, '')
      .trim()
  }

  return titleCaseSlug(id)
}

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/\*+/g, '')
    .replace(/^[-:]\s*/, '')
    .replace(/["“”]/g, '')
    .trim()
    .slice(0, 110)
}

function extractTagline(markdown: string): string {
  const vibeHeading =
    /\*\*(?:The )?(?:Visual |Sensory )?Vibe(?:\s*&\s*Emotional Tone)?\*\*/i

  const sameLine = markdown.match(
    new RegExp(`${vibeHeading.source}[:\\s]+([^\\n]+)`, 'i'),
  )
  if (sameLine?.[1] && cleanInlineMarkdown(sameLine[1]).length >= 8) {
    return cleanInlineMarkdown(sameLine[1])
  }

  const nextLine = markdown.match(
    new RegExp(`${vibeHeading.source}[:\\s]*\\n+([^\\n]+)`, 'i'),
  )
  if (nextLine?.[1] && cleanInlineMarkdown(nextLine[1]).length >= 8) {
    return cleanInlineMarkdown(nextLine[1])
  }

  const core = markdown.match(
    /\*\*Core (?:Concept|Principle|Principles)\*\*[:\s]+([^\n]{10,160})/i,
  )
  if (core?.[1]) {
    return cleanInlineMarkdown(core[1])
  }

  const philosophy = markdown.match(
    /## Design Philosophy[^\n]*\n+([\s\S]{24,280}?)(?:\n\n|\n## )/,
  )
  if (philosophy?.[1]) {
    const sentence = cleanInlineMarkdown(philosophy[1].replace(/\s+/g, ' '))
    const first = sentence.split(/(?<=\.)\s/)[0] ?? sentence
    if (first.length >= 16) {
      return first.slice(0, 110)
    }
  }

  const italicLine = markdown.match(/\n\*([^*\n]{16,120})\*\n/)
  if (italicLine?.[1]) {
    return italicLine[1].trim()
  }

  return 'Design-system landing page'
}

function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function pickPreviewColors(hexes: string[]): string[] {
  const unique = [...new Set(hexes.map((hex) => hex.toUpperCase()))]
  const accents = unique.filter((hex) => {
    const lum = luminance(hex)
    return lum > 0.08 && lum < 0.92
  })
  const picks = (accents.length >= 2 ? accents : unique).slice(0, 4)
  if (picks.length === 0) {
    return ['#111111', '#3B82F6']
  }
  if (picks.length === 1) {
    picks.push('#111111')
  }
  return picks
}

export function extractDesignSystemPrompt(markdown: string): string {
  const block = markdown.match(/<design-system>([\s\S]*?)<\/design-system>/i)
  if (block?.[1]?.trim()) {
    return block[1].trim()
  }

  return markdown.replace(/<role>[\s\S]*?<\/role>/gi, '').trim()
}

export function parseLandingThemeMarkdown(
  id: string,
  fileName: string,
  markdown: string,
): LandingThemeMeta {
  const hexes = markdown.match(/#(?:[0-9A-Fa-f]{6})\b/g) ?? []

  return {
    id,
    name: extractName(id, markdown),
    tagline: extractTagline(markdown),
    previewColors: pickPreviewColors(hexes),
    fileName,
  }
}

function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

function loadBundledPrompts(): Array<{ id: string; fileName: string; markdown: string }> {
  return Object.entries(bundledPromptFiles)
    .map(([path, markdown]) => {
      const fileName = fileNameFromPath(path)
      const id = fileName.replace(/\.md$/i, '')
      return { id, fileName, markdown }
    })
    .filter((item) => isLandingThemeId(item.id) && item.markdown.trim().length > 0)
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
}

async function loadDiskPrompts(): Promise<
  Array<{ id: string; fileName: string; markdown: string }>
> {
  const directory = getPromptsDirectory()
  const entries = await readdir(directory)
  const files = entries.filter((name) => name.endsWith('.md')).sort()

  const themes = await Promise.all(
    files.map(async (fileName) => {
      const id = fileName.replace(/\.md$/i, '')
      if (!isLandingThemeId(id)) {
        return null
      }
      const markdown = await readFile(join(directory, fileName), 'utf-8')
      return { id, fileName, markdown }
    }),
  )

  return themes.filter(
    (item): item is { id: string; fileName: string; markdown: string } => item !== null,
  )
}

async function loadPromptFiles(): Promise<
  Array<{ id: string; fileName: string; markdown: string }>
> {
  const bundled = loadBundledPrompts()
  if (bundled.length > 0) {
    return bundled
  }

  try {
    const fromDisk = await loadDiskPrompts()
    if (fromDisk.length > 0) {
      return fromDisk
    }
  } catch {
    // Vercel cwd is /var/task and does not include prompts/.
  }

  throw new Error(
    'Landing themes not found. Add markdown files to prompts/ and rebuild.',
  )
}

export async function listLandingThemes(): Promise<LandingThemeMeta[]> {
  const files = await loadPromptFiles()
  return files.map((file) =>
    parseLandingThemeMarkdown(file.id, file.fileName, file.markdown),
  )
}

export async function readLandingThemePrompt(id: string): Promise<{
  meta: LandingThemeMeta
  prompt: string
}> {
  if (!isLandingThemeId(id)) {
    throw new Error('Unknown landing theme')
  }

  const files = await loadPromptFiles()
  const match = files.find((file) => file.id === id)
  if (!match) {
    throw new Error(`Theme "${id}" was not found in prompts/`)
  }

  return {
    meta: parseLandingThemeMarkdown(match.id, match.fileName, match.markdown),
    prompt: extractDesignSystemPrompt(match.markdown),
  }
}
