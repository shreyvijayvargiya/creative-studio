import { describe, expect, it } from 'vitest'

import {
  isAuthExemptRoute,
  isPublicRoute,
  requiresAuth,
} from '#/lib/routes/public-paths'

describe('public-paths', () => {
  it('marks marketing routes as public', () => {
    expect(isPublicRoute('/')).toBe(true)
    expect(isPublicRoute('/features')).toBe(true)
    expect(isPublicRoute('/blog')).toBe(true)
    expect(isPublicRoute('/pricing')).toBe(true)
    expect(isPublicRoute('/ai-logo-designer')).toBe(false)
    expect(isPublicRoute('/ai-product-video-generator')).toBe(false)
    expect(isPublicRoute('/ai-image-designer')).toBe(false)
  })

  it('marks auth callbacks and pin pdf views as exempt', () => {
    expect(isAuthExemptRoute('/auth/callback')).toBe(true)
    expect(isAuthExemptRoute('/auth/drive-callback')).toBe(true)
    expect(isAuthExemptRoute('/api/stripe/webhook')).toBe(true)
    expect(isAuthExemptRoute('/api/paypal/webhook')).toBe(true)
    expect(isAuthExemptRoute('/api/email/send')).toBe(true)
    expect(isAuthExemptRoute('/api/upload')).toBe(true)
    expect(isAuthExemptRoute('/pdf/view/report.pdf')).toBe(true)
    expect(isAuthExemptRoute('/sitemap.xml')).toBe(true)
    expect(isAuthExemptRoute('/rss.xml')).toBe(true)
    expect(isAuthExemptRoute('/llm.txt')).toBe(true)
    expect(isAuthExemptRoute('/llms.txt')).toBe(true)
    expect(isAuthExemptRoute('/robots.txt')).toBe(true)
  })

  it('requires auth for dashboard and app routes', () => {
    expect(requiresAuth('/dashboard')).toBe(true)
    expect(requiresAuth('/grid')).toBe(true)
    expect(requiresAuth('/documents')).toBe(true)
    expect(requiresAuth('/')).toBe(false)
    expect(requiresAuth('/auth/callback')).toBe(false)
    expect(requiresAuth('/api/stripe/webhook')).toBe(false)
    expect(requiresAuth('/pdf/view/file.pdf')).toBe(false)
  })
})
