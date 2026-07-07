export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_call_id?: string
  name?: string
}

export interface AiToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface AiAssistantToolAction {
  label: string
  kind: 'payee' | 'document' | 'documents' | 'payees'
  to: string
  params?: Record<string, string>
  search?: Record<string, string>
}

export interface AiAssistantToolTrace {
  toolName: string
  summary: string
  success: boolean
  action?: AiAssistantToolAction
}

export interface AiAssistantResponse {
  reply: string
  toolTraces: AiAssistantToolTrace[]
}

export { AI_PROMPT_CATEGORIES, AI_SUGGESTED_PROMPTS } from '#/lib/ai/ai-prompts'
export type { AiPromptCategory, AiSuggestedPrompt } from '#/lib/ai/ai-prompts'
