import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { MAX_LANDING_EDIT_CHARS } from '#/lib/creative-studio/landing-config'

export interface LandingChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Make the hero darker and bolder',
  'Add a pricing table',
  'Shorten the copy',
  'Swap in a testimonials strip',
]

interface LandingUpdateChatProps {
  messages: LandingChatMessage[]
  pending: boolean
  disabled?: boolean
  onSend: (text: string) => void
}

export function LandingUpdateChat({
  messages,
  pending,
  disabled = false,
  onSend,
}: LandingUpdateChatProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, pending])

  const submit = (text: string) => {
    const next = text.trim()
    if (!next || pending || disabled) return
    onSend(next)
    setDraft('')
  }

  return (
    <div className="flex h-[min(720px,calc(100vh-8rem))] min-h-[420px] flex-col overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-medium">Update with AI</p>
        <p className="text-xs text-muted-foreground">
          Ask for copy, layout, colour, or section changes.
        </p>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-6',
              message.role === 'user'
                ? 'ml-auto bg-blue-600 text-white'
                : 'bg-muted text-foreground',
            )}
          >
            {message.content}
          </div>
        ))}
        {pending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Updating the page…
          </div>
        ) : null}
      </div>

      {messages.length <= 1 && !pending ? (
        <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              disabled={disabled || pending}
              onClick={() => submit(item)}
              className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(event) => {
          event.preventDefault()
          submit(draft)
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit(draft)
            }
          }}
          placeholder="e.g. Add a FAQ and make the CTA green"
          maxLength={MAX_LANDING_EDIT_CHARS}
          rows={2}
          disabled={disabled || pending}
          className="min-h-12 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || pending || draft.trim().length < 2}
          aria-label="Send update"
        >
          {pending ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </Button>
      </form>
    </div>
  )
}

export function createLandingChatId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function landingReadyMessage(): LandingChatMessage {
  return {
    id: createLandingChatId(),
    role: 'assistant',
    content:
      'Your landing page is ready. Tell me what to change — copy, layout, colours, or sections.',
  }
}
