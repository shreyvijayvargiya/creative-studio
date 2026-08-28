import type { LandingLayoutMeta } from '#/types/creative-studio'

/**
 * Layout briefs injected per variant so one prompt + one theme yields distinct pages.
 */
export const LANDING_LAYOUTS: LandingLayoutMeta[] = [
  {
    id: 'hero-cta',
    label: 'Hero + CTA',
    tagline: 'Bold headline, one primary action',
    aiPrompt:
      'Hero-forward landing page. Full-viewport hero with a massive headline, one supporting sentence, a single primary CTA, and a secondary text link. Logo row of social proof under the fold, then 3 feature cards, a short testimonial, and a closing CTA band. Navigation is minimal.',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    tagline: 'Magazine layout, type-led',
    aiPrompt:
      'Editorial / magazine landing page. Oversized typography, pull quotes, a 12-column magazine grid, an article-like intro, image-led feature spreads, and a newsletter capture. Feels like a publication, not a SaaS template.',
  },
  {
    id: 'product',
    label: 'Product grid',
    tagline: 'Features, pricing, proof',
    aiPrompt:
      'Classic product landing: sticky nav, hero with product visual, logo cloud, 6-feature bento or grid, how-it-works steps, pricing table (3 tiers), FAQ accordion, footer. Conversion-focused and complete.',
  },
  {
    id: 'story',
    label: 'Story scroll',
    tagline: 'Narrative sections, social proof',
    aiPrompt:
      'Story-driven long scroll. Alternating full-bleed chapters: origin, problem, solution, proof, team or maker note, and a final invitation. Strong section titles. Social proof is woven in as quotes, not a bolted-on block.',
  },
  {
    id: 'split',
    label: 'Split hero',
    tagline: 'Copy left, visual right',
    aiPrompt:
      'Split-hero landing. Left: identity, headline, paragraph, CTA, tiny trust line. Right: product or brand visual. Below: horizontal stats, two-column features, a comparison strip, and a compact footer. Desktop-first but stacks on mobile.',
  },
  {
    id: 'bento',
    label: 'Bento',
    tagline: 'Modular feature mosaic',
    aiPrompt:
      'Bento / mosaic landing. Compact top nav, short hero, then a large asymmetric bento board of features, metrics, quotes, and visuals. Follow with a single pricing or waitlist module and a dense footer. High craft in the grid.',
  },
  {
    id: 'pricing-first',
    label: 'Pricing first',
    tagline: 'Plans above the fold',
    aiPrompt:
      'Pricing-led landing. Brief hero (headline + one line), then a prominent 3-tier pricing comparison above the fold. Below: feature checklist, FAQ, and a guarantee or objection-handling strip. Honest and commercial.',
  },
  {
    id: 'waitlist',
    label: 'Waitlist',
    tagline: 'Launch tease + email capture',
    aiPrompt:
      'Launch / waitlist landing. Atmospheric hero, countdown or “opening soon” language, email capture as the only CTA, 3 teaser features, a founders note, and a quiet footer. Scarcity without cheap gimmicks.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    tagline: 'Work showcase, case studies',
    aiPrompt:
      'Portfolio / studio landing. Name and discipline in the header, a curated work grid (case-study cards with title, role, year), a selected case study highlight, about/services, and contact CTA. Gallery-quality spacing.',
  },
  {
    id: 'docs-saas',
    label: 'SaaS classic',
    tagline: 'Nav, hero, logos, features, FAQ',
    aiPrompt:
      'Full SaaS marketing site in one page: announcement bar, nav with product links, hero with dual CTAs, customer logos, features, integrations row, testimonials carousel-style grid, pricing, FAQ, and a rich footer with sitemap columns.',
  },
]

export function getLandingLayouts(count: number): LandingLayoutMeta[] {
  return LANDING_LAYOUTS.slice(0, count)
}

export function getLandingLayout(id: string): LandingLayoutMeta | undefined {
  return LANDING_LAYOUTS.find((layout) => layout.id === id)
}
