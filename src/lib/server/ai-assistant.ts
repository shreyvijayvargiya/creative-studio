import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { AI_TOOL_DEFINITIONS, executeAiTool } from '#/lib/ai/execute-tool'
import {
  AI_SYSTEM_PROMPT,
  callOpenRouter,
  type OpenRouterConversationMessage,
} from '#/lib/ai/openrouter'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import type { AiAssistantResponse, AiAssistantToolTrace } from '#/types/ai'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

const runAiAssistantSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
})

const MAX_TOOL_ROUNDS = 6

export const runAiAssistant = createServerFn({ method: 'POST' })
  .validator((data: unknown) => runAiAssistantSchema.parse(data))
  .handler(async ({ data }): Promise<AiAssistantResponse> => {
    const user = await requireAuthUser()

    const conversation: OpenRouterConversationMessage[] = [
      { role: 'system', content: AI_SYSTEM_PROMPT },
      ...data.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ]

    const toolTraces: AiAssistantToolTrace[] = []

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const response = await callOpenRouter(conversation, AI_TOOL_DEFINITIONS)
      const { content, toolCalls, rawToolCalls } = response

      if (toolCalls.length === 0) {
        return {
          reply: content?.trim() || 'Done.',
          toolTraces,
        }
      }

      conversation.push({
        role: 'assistant',
        content,
        tool_calls: rawToolCalls,
      })

      for (const toolCall of toolCalls) {
        const { result, trace } = await executeAiTool(
          user.id,
          toolCall.name,
          toolCall.arguments,
        )

        toolTraces.push(trace)

        conversation.push({
          role: 'tool',
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
          name: toolCall.name,
        })
      }
    }

    const { content } = await callOpenRouter(conversation, AI_TOOL_DEFINITIONS)

    return {
      reply:
        content?.trim() ||
        'I completed the requested actions. Let me know if you need anything else.',
      toolTraces,
    }
  })
