// @vitest-environment jsdom

import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DocuSealForm } from '#/components/signature/DocuSealForm'

describe('DocuSealForm', () => {
  beforeEach(() => {
    if (!customElements.get('docuseal-form')) {
      customElements.define(
        'docuseal-form',
        class extends HTMLElement {},
      )
    }

    const originalQuerySelector = document.querySelector.bind(document)

    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === 'script[src="https://cdn.docuseal.com/js/form.js"]') {
        return {} as Element
      }

      return originalQuerySelector(selector)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fires onCompleted only once when completed fires multiple times', async () => {
    const onCompleted = vi.fn()

    render(
      <DocuSealForm
        embedSrc="https://docuseal.example/embed/1"
        onCompleted={onCompleted}
      />,
    )

    await waitFor(() => {
      expect(document.querySelector('docuseal-form')).toBeTruthy()
    })

    await Promise.resolve()

    const form = document.querySelector('docuseal-form') as HTMLElement
    expect(form).toBeTruthy()

    form.dispatchEvent(new CustomEvent('completed', { detail: { ok: true } }))
    form.dispatchEvent(new CustomEvent('completed', { detail: { ok: true } }))

    expect(onCompleted).toHaveBeenCalledTimes(1)
    expect(onCompleted).toHaveBeenCalledWith({ ok: true })
  })
})
