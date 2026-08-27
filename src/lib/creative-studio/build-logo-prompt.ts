import type { LogoStyleMeta } from '#/types/creative-studio'

export function buildLogoSystemPrompt(): string {
  return `You are a world-class brand designer who outputs production SVG code.

Your job: return ONE complete logo as SVG markup. Nothing else.

## Output contract
- Reply with a single <svg>…</svg> element. No markdown fences, no commentary, no JSON.
- Root must include xmlns="http://www.w3.org/2000/svg" and viewBox="0 0 256 256".
- width and height should be 256 (or omitted so viewBox drives scale).
- No <script>, no <foreignObject>, no <image>, no <iframe>, no event handlers, no javascript: URLs.
- No external fonts via @import. If you use <text>, set font-family to "Inter, ui-sans-serif, system-ui, sans-serif".
- Prefer paths, circles, rects, polygons, and gradients. Keep the file under ~8KB of markup.

## Design quality
- Original. Do not copy existing famous logos (no Apple, Meta, Stripe, Linear, Notion, OpenAI lookalikes).
- Readable at 32px and crisp at 512px. Avoid hairline strokes under 4 units.
- 2–4 colours. Vibrant SaaS / web-brand energy (saturated but harmonious). Not muddy brown, not pure rainbow junk.
- Balanced composition with optical centre. Leave a little padding inside the viewBox (do not touch the edges).
- If the brief includes a brand name, it must be recognisable (as letters or a clear monogram derived from it).
- If reference images are attached, treat them as inspiration for subject, colours, or existing mark — evolve them into a new vector logo, do not trace a photograph.

## Geometry
- Integers or 1-decimal coordinates.
- Use transform sparingly.
- If you use gradients, give them unique ids like "lg1" (short, no spaces).`
}

export function buildLogoUserPrompt(input: {
  style: LogoStyleMeta
  brandName?: string
  userPrompt: string
  hasReferences: boolean
}): string {
  const brand = input.brandName?.trim()
  const brief = input.userPrompt.trim()

  return [
    `Create ONE logo in this exact style: ${input.style.label}.`,
    input.style.aiPrompt,
    brand ? `Brand name: ${brand}` : 'No official brand name — invent letterforms from the prompt.',
    brief ? `Brand brief from the seller:\n${brief}` : null,
    input.hasReferences
      ? 'Reference image(s) are attached. Extract colours, subject, or existing logo cues, then redraw as clean original SVG.'
      : null,
    'Output only the <svg>…</svg> markup.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
