import type { AiToolCall } from '#/types/ai'
import { buildAiSystemPrompt } from '#/lib/ai/product-knowledge'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface OpenRouterToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export type OpenRouterConversationMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: OpenRouterToolCallPayload[] }
  | {
      role: 'tool'
      content: string
      tool_call_id: string
      name?: string
    }

interface OpenRouterToolCallPayload {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Add it to .env and restart `npm run dev`.',
    )
  }

  return {
    apiKey,
    model: process.env.OPENROUTER_MODEL?.trim() ?? 'google/gemini-2.5-flash-lite-preview-09-2025',
    siteUrl: process.env.APP_URL?.trim() ?? 'http://localhost:3000',
    siteName: 'Finance CRM',
  }
}

export async function callOpenRouter(
  messages: OpenRouterConversationMessage[],
  tools: OpenRouterToolDefinition[],
): Promise<{
  content: string | null
  toolCalls: AiToolCall[]
  rawToolCalls: OpenRouterToolCallPayload[]
}> {
  const config = getOpenRouterConfig()

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.siteUrl,
      'X-Title': config.siteName,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 1536,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter request failed (${response.status}): ${errorText}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null
        tool_calls?: OpenRouterToolCallPayload[]
      }
    }>
  }

  const message = payload.choices?.[0]?.message
  const toolCalls: AiToolCall[] = []

  for (const call of message?.tool_calls ?? []) {
    let parsedArgs: Record<string, unknown> = {}

    try {
      parsedArgs = JSON.parse(call.function.arguments) as Record<string, unknown>
    } catch {
      parsedArgs = {}
    }

    toolCalls.push({
      id: call.id,
      name: call.function.name,
      arguments: parsedArgs,
    })
  }

  return {
    content: message?.content ?? null,
    toolCalls,
    rawToolCalls: message?.tool_calls ?? [],
  }
}

export const AI_SYSTEM_PROMPT = buildAiSystemPrompt()

