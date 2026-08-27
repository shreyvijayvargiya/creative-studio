import { getVideoFormat } from '#/lib/creative-studio/video-formats'

export function buildCreativeVideoPrompt(input: {
  formatId: string
  userPrompt: string
  referenceCount: number
}): string {
  const format = getVideoFormat(input.formatId)
  const seller = input.userPrompt.trim()
  const n = Math.max(1, input.referenceCount)

  return `You are generating ONE short product video for an ecommerce Creative Studio.

Output a single clip only. Duration about ${format.durationSeconds} seconds. Aspect ratio ${format.aspectRatio}. Resolution ${format.resolution}.

You are given ${n} reference image${n > 1 ? 's' : ''}.
- Image 1 is the primary product and (when used as a first frame) the opening composition.
- Extra images are additional angles, materials, or scene cues. Combine them into one continuous video — never a collage, split screen, or photo slideshow.

## Hard rules
- Preserve exact product identity from the references.
- Do not invent on-screen text, watermarks, UI chrome, or fake brand marks.
- Photorealistic live-action look unless the seller prompt clearly asks otherwise.
- The whole clip must be commercially usable on its own.

${format.aiPrompt}

## Seller prompt (follow closely; this is the specific video they want)
${seller || '(No extra seller prompt — follow the format brief and the reference images.)'}
`
}
