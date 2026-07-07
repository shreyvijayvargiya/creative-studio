import type { AiAssistantToolAction } from '#/types/ai'

export function payeeAction(payee: {
  id: string
  name: string
}): AiAssistantToolAction {
  return {
    label: `View ${payee.name}`,
    to: '/payees',
    search: { highlight: payee.id },
    kind: 'payee',
  }
}

export function documentAction(document: {
  id: string
  name: string
  kind: string
}): AiAssistantToolAction {
  if (document.kind === 'budget') {
    return {
      label: `View ${document.name}`,
      to: '/documents/$id',
      params: { id: document.id },
      kind: 'document',
    }
  }

  return {
    label: `View ${document.name}`,
    to: '/documents/pdf/$id',
    params: { id: document.id },
    kind: 'document',
  }
}
