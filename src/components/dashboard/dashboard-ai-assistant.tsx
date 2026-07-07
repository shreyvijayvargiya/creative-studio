import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { motion, AnimatePresence } from 'motion/react'
import {
  AlertTriangle,
  ArrowUp,
  Bot,
  Loader2,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import {
  DashboardAiActionLink,
  navigateToAiAction,
} from '#/components/dashboard/dashboard-ai-actions'
import { AiChatMessageContent } from '#/components/dashboard/ai-chat-message-content'
import { AiSuggestedPromptsDropdown } from '#/components/dashboard/ai-suggested-prompts-dropdown'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { runAiAssistant } from '#/lib/server/ai-assistant'
import { checkPayeesTable } from '#/lib/server/check-payees-table'
import { cn } from '#/lib/utils'
import type { AiAssistantToolTrace } from '#/types/ai'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolTraces?: AiAssistantToolTrace[]
}

function formatAssistantError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Assistant request failed'

  if (message.includes('OPENROUTER_API_KEY')) {
    return `${message} Server env vars load when the dev server starts — restart \`npm run dev\` after editing .env.`
  }

  if (message.includes('signed in') || message.includes('JWT') || message.includes('session')) {
    return `${message} Try refreshing the page — your session may still be syncing.`
  }

  if (message.includes('OpenRouter request failed')) {
    return `${message} This is usually a temporary API issue — wait a moment and try again.`
  }

  return message
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function notifyToolTraces(
  traces: AiAssistantToolTrace[],
  navigate: ReturnType<typeof useNavigate>,
) {
  for (const trace of traces) {
    if (!trace.success) {
      toast.error(trace.summary)
      continue
    }

    if (trace.action) {
      toast.success(trace.summary, {
        action: {
          label: 'Open',
          onClick: () => navigateToAiAction(navigate, trace.action!),
        },
      })
      continue
    }

    toast.success(trace.summary)
  }
}

function ToolTraceList({ traces }: { traces: AiAssistantToolTrace[] }) {
  if (traces.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {traces.map((trace, index) => (
          <Badge
            key={`${trace.toolName}-${index}`}
            variant="secondary"
            className={cn(
              'gap-1 font-normal',
              trace.success
                ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            <Wrench className="size-3" />
            {trace.summary}
          </Badge>
        ))}
      </div>

      {traces.some((trace) => trace.success && trace.action) ? (
        <div className="flex flex-wrap gap-2">
          {traces.map((trace, index) =>
            trace.success && trace.action ? (
              <DashboardAiActionLink
                key={`action-${trace.toolName}-${index}`}
                action={trace.action}
              />
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  )
}

interface DashboardAiAssistantProps {
  variant?: 'card' | 'panel'
}

export function DashboardAiAssistant({ variant = 'card' }: DashboardAiAssistantProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openLoginModal } = useLoginModal()
  const runAiAssistantFn = useServerFn(runAiAssistant)
  const checkPayeesTableFn = useServerFn(checkPayeesTable)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [payeesSetup, setPayeesSetup] = useState<
    { ready: true } | { ready: false; missingTable: boolean; message: string } | null
  >(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isPanel = variant === 'panel'

  useEffect(() => {
    if (!isAuthenticated) {
      setPayeesSetup(null)
      return
    }

    void checkPayeesTableFn()
      .then(setPayeesSetup)
      .catch(() => setPayeesSetup(null))
  }, [checkPayeesTableFn, isAuthenticated])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isLoading])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    if (!isAuthenticated) {
      openLoginModal()
      return
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)

    try {
      const result = await runAiAssistantFn({
        data: {
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        },
      })

      if (result.toolTraces.length > 0) {
        notifyToolTraces(result.toolTraces, navigate)
      }

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: 'assistant',
          content: result.reply,
          toolTraces: result.toolTraces,
        },
      ])
    } catch (error) {
      const message = formatAssistantError(error)
      toast.error(message)
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: 'assistant',
          content: `Sorry, I could not complete that request.\n\n${message}`,
        },
      ])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void sendMessage(input)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  const setupBanner =
    payeesSetup?.ready === false && payeesSetup.missingTable ? (
      <div
        className={cn(
          'rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
          isPanel ? 'mx-4 mt-4' : 'mx-4 mt-4 sm:mx-5',
        )}
      >
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">Payees database setup required</p>
            <p className="text-amber-900/90 dark:text-amber-100/90">
              {payeesSetup.message} Run the payees migration in Supabase SQL Editor.
            </p>
          </div>
        </div>
      </div>
    ) : null

  const messagesArea = (
    <div
      ref={scrollRef}
      className={cn(
        'space-y-4 overflow-y-auto px-4 py-4 sm:px-5',
        isPanel
          ? 'min-h-0 flex-1'
          : 'max-h-[min(52vh,28rem)] min-h-[12rem]',
      )}
    >
      {messages.length === 0 ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4 px-2 text-center',
            isPanel ? 'h-full min-h-[12rem]' : 'h-full min-h-[10rem]',
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/80">
            <Bot className="size-7 text-muted-foreground" />
          </div>
          <div className="max-w-xs space-y-1">
            <p className="text-sm text-muted-foreground">
              {isPanel
                ? 'Ask about tax, payees, and documents. Pick a prompt below or send a message to start.'
                : 'What can I help you with today?'}
            </p>
            {!isPanel ? (
              <p className="text-xs text-muted-foreground">
                Try a quick command like calculating GST or creating a payee.
              </p>
            ) : null}
          </div>
          {!isPanel ? (
            <div className="flex flex-wrap justify-center gap-2">
              <AiSuggestedPromptsDropdown
                disabled={isLoading}
                onSelect={(prompt) => void sendMessage(prompt)}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {message.role === 'assistant' ? (
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                  <Bot className="size-4" />
                </div>
              ) : null}

              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6',
                  message.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-muted/60 text-foreground',
                )}
              >
                {message.role === 'assistant' ? (
                  <AiChatMessageContent content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                {message.toolTraces ? (
                  <ToolTraceList traces={message.toolTraces} />
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-violet-600" />
          Thinking and running tools...
        </div>
      ) : null}
    </div>
  )

  const inputArea = (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'border-t border-border/60 bg-background p-4',
        isPanel && 'mt-auto',
      )}
    >
      {isPanel ? (
        <AiSuggestedPromptsDropdown
          disabled={isLoading}
          onSelect={(prompt) => void sendMessage(prompt)}
        />
      ) : null}

      <div className="relative rounded-xl border border-border/70 bg-muted/20 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={isPanel ? 3 : 2}
          placeholder={
            isAuthenticated
              ? isPanel
                ? 'Message AI assistant...'
                : 'Ask anything — e.g. “What is the GST on $1,100?” or “Create payee John Smith”'
              : 'Sign in to use the AI assistant'
          }
          disabled={isLoading}
          className="block w-full resize-none bg-transparent px-4 py-3 pr-14 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 bottom-2 size-9 rounded-lg bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUp className="size-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </div>
      {!isPanel ? (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          AI estimates only — not tax advice. Actions run securely on the server
          while you are signed in.
        </p>
      ) : null}
    </form>
  )

  if (isPanel) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {setupBanner}
        {messagesArea}
        {inputArea}
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-linear-to-r from-violet-50/80 via-background to-background pb-4 dark:from-violet-950/30">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                <Sparkles className="size-4" />
              </span>
              Finance CRM Assistant
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask about tax, payees, or your workspace — powered by AI with secure
              server tools.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            Claude via OpenRouter
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        {setupBanner}
        {messagesArea}
        {inputArea}
      </CardContent>
    </Card>
  )
}
