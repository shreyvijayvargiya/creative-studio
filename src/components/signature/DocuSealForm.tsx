import { useEffect, useId, useRef } from 'react'

import { cn } from '#/lib/utils'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'docuseal-form': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          id?: string
          'data-src': string
          'data-email'?: string
          'data-with-download-button'?: string
        },
        HTMLElement
      >
    }
  }
}

interface DocuSealFormProps {
  embedSrc: string
  email?: string
  disabled?: boolean
  onCompleted: (detail: unknown) => void
}

const DOCUSEAL_SCRIPT_SRC = 'https://cdn.docuseal.com/js/form.js'

function loadDocusealScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (document.querySelector(`script[src="${DOCUSEAL_SCRIPT_SRC}"]`)) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = DOCUSEAL_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load DocuSeal form script'))
    document.body.appendChild(script)
  })
}

export function DocuSealForm({
  embedSrc,
  email,
  disabled = false,
  onCompleted,
}: DocuSealFormProps) {
  const formId = useId().replace(/:/g, '')
  const onCompletedRef = useRef(onCompleted)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    onCompletedRef.current = onCompleted
  }, [onCompleted])

  useEffect(() => {
    hasCompletedRef.current = false
  }, [embedSrc])

  useEffect(() => {
    let disposed = false
    let formElement: HTMLElement | null = null

    const handleCompleted = (event: Event) => {
      if (disposed || hasCompletedRef.current) {
        return
      }

      hasCompletedRef.current = true
      const customEvent = event as CustomEvent
      onCompletedRef.current(customEvent.detail)
    }

    void loadDocusealScript().then(() => {
      if (disposed) {
        return
      }

      formElement = document.getElementById(formId)
      formElement?.addEventListener('completed', handleCompleted)
    })

    return () => {
      disposed = true
      formElement?.removeEventListener('completed', handleCompleted)
    }
  }, [embedSrc, formId])

  return (
    <div
      className={cn(
        'min-h-[70vh] overflow-hidden rounded-xl border bg-card',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <docuseal-form
        id={formId}
        data-src={embedSrc}
        data-email={email}
        data-with-download-button="false"
        className="min-h-[70vh] w-full"
      />
    </div>
  )
}
