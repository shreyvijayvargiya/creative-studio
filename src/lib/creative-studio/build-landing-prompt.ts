import type { LandingLayoutMeta, LandingThemeMeta } from '#/types/creative-studio'

export function buildLandingSystemPrompt(): string {
  return `You are a world-class product designer and frontend engineer.

Your job: design ONE complete marketing landing page as production code.

## Output contract
Return ONLY a JSON object. No markdown fences, no commentary, no extra keys.
{
  "title": "short variant name (2–5 words)",
  "reactCode": "full React + Tailwind + lucide-react component file",
  "htmlCode": "full standalone HTML document",
  "chatReply": "optional 1–2 sentences describing what changed (required when revising)"
}

### reactCode
- A single TSX file that default-exports one component (e.g. export default function LandingPage).
- Tailwind utility classes only. No CSS modules, no styled-components, no shadcn imports.
- Icons: only lucide-react named imports (e.g. import { ArrowRight, Check } from 'lucide-react').
- No next/image, no next/link, no react-router. Use <a> and <img>.
- No fetch, no env, no API keys, no placeholders like TODO.
- Semantic HTML, keyboard-focusable controls, alt text on images, sufficient contrast.
- Responsive: mobile first, then md/lg. Real nav, hero, at least 4 sections, footer.
- Reference photographs are required. Use EVERY listed /images/ref-N.ext path as real <img src> photography (hero, product shots, gallery, social proof). Do not skip any.
- Do not invent Unsplash, picsum, placeholder.com, or other stock URLs.
- Google fonts: add a comment at the top listing font families used; load them in htmlCode via <link>.

### htmlCode
- Complete HTML5 document: <!DOCTYPE html>, html, head, body.
- Include <script src="https://cdn.tailwindcss.com"></script> in head.
- Load Google fonts in head if the design uses them.
- Recreate the SAME visual design as reactCode.
- Icons must be inline SVG (Lucide-style 24x24 strokes). Do not load lucide from a CDN.
- Self-contained. No React. Same /images/ref-N.ext paths as reactCode.

## Design quality
- Follow the injected design-system prompt exactly: colour tokens, type, radius, borders, motion, personality.
- Do not produce a generic Tailwind SaaS template if the theme is Swiss, Bauhaus, Newsprint, etc.
- Invent plausible but original brand copy from the user brief (name, product, claims). Never copy Apple, Stripe, Linear, Notion, or OpenAI sites.
- One page, production-ready, visually distinctive.`
}

export function buildLandingUserPrompt(input: {
  theme: LandingThemeMeta
  themePrompt: string
  layout: LandingLayoutMeta
  userPrompt: string
  imagePaths: string[]
}): string {
  const images = `Product / brand photographs (use ALL of these as <img src>, in this order):\n${input.imagePaths
    .map((path, index) => `- ${path} (reference ${index + 1})`)
    .join('\n')}`

  return [
    `Theme: ${input.theme.name} (id: ${input.theme.id}).`,
    `Layout: ${input.layout.label}.`,
    input.layout.aiPrompt,
    `User brief:\n${input.userPrompt.trim()}`,
    images,
    'Injected design-system prompt (follow this as law):',
    input.themePrompt,
    'Return only the JSON object with title, reactCode, and htmlCode.',
  ].join('\n\n')
}

export function buildLandingRevisePrompt(input: {
  theme: LandingThemeMeta
  themePrompt: string
  layout: LandingLayoutMeta
  userPrompt: string
  editPrompt: string
  previousTitle?: string
  previousReactCode?: string
  previousHtmlCode?: string
  imagePaths: string[]
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
}): string {
  const images = `Product / brand photographs (keep using ALL of these as <img src>):\n${input.imagePaths
    .map((path, index) => `- ${path} (reference ${index + 1})`)
    .join('\n')}`

  const history =
    input.chatHistory && input.chatHistory.length > 0
      ? `Recent update chat:\n${input.chatHistory
          .slice(-6)
          .map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`)
          .join('\n')}`
      : null

  return [
    `Revise the EXISTING landing page. Apply the user's update. Keep the brand, theme, and overall structure unless they ask to change them.`,
    `Theme: ${input.theme.name} (id: ${input.theme.id}).`,
    `Layout: ${input.layout.label}.`,
    input.layout.aiPrompt,
    `Original brief:\n${input.userPrompt.trim()}`,
    images,
    history,
    `User update (highest priority):\n${input.editPrompt.trim()}`,
    `Current title: ${input.previousTitle?.trim() || input.layout.label}`,
    input.previousReactCode
      ? `Current reactCode:\n${clipCode(input.previousReactCode)}`
      : 'No current reactCode.',
    input.previousHtmlCode
      ? `Current htmlCode:\n${clipCode(input.previousHtmlCode)}`
      : 'No current htmlCode.',
    'Injected design-system prompt (follow this as law):',
    input.themePrompt,
    'Return only a JSON object with title, reactCode, htmlCode, and chatReply (1–2 sentences on what you changed).',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function clipCode(code: string, max = 24000): string {
  if (code.length <= max) return code
  return `${code.slice(0, max)}\n/* truncated for context */`
}
