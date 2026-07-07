export interface AiSuggestedPrompt {
  label: string
  prompt: string
}

export interface AiPromptCategory {
  label: string
  prompts: AiSuggestedPrompt[]
}

export const AI_PROMPT_CATEGORIES: AiPromptCategory[] = [
  {
    label: 'Tax & calculations',
    prompts: [
      { label: 'GST on $1,100', prompt: 'What is the GST on $1,100?' },
      { label: 'GST inclusive breakdown', prompt: 'Extract GST from $1,100 inclusive' },
      { label: 'Income tax estimate', prompt: 'Estimate income tax on $85,000' },
      { label: 'GST on $50,000', prompt: 'What is the GST on $50,000?' },
    ],
  },
  {
    label: 'Payees',
    prompts: [
      {
        label: 'Create payee',
        prompt: 'Create payee Acme Accounting with email billing@acme.com.au',
      },
      { label: 'List my payees', prompt: 'List my payees' },
      { label: 'Update payee email', prompt: 'Update payee Acme Accounting email to accounts@acme.com.au' },
      { label: 'Workspace payee count', prompt: 'How many payees do I have?' },
    ],
  },
  {
    label: 'Documents & workspace',
    prompts: [
      { label: 'Document count', prompt: 'How many documents do I have?' },
      { label: 'List recent documents', prompt: 'List my recent documents' },
      { label: 'Workspace summary', prompt: 'Give me a workspace summary' },
    ],
  },
  {
    label: 'Budget & ATO PDFs',
    prompts: [
      { label: 'How to plan a budget', prompt: 'How do I create a budget in Finance CRM?' },
      { label: 'Generate ATO PDF', prompt: 'How do I generate an ATO tax PDF?' },
      { label: 'Budget planner location', prompt: 'Where is the budget planner?' },
    ],
  },
  {
    label: 'E-signing',
    prompts: [
      { label: 'Does CRM support e-sign?', prompt: 'Does Finance CRM support e-signatures?' },
      { label: 'How to sign a document', prompt: 'How do I sign a tax return PDF?' },
      { label: 'DocuSeal workflow', prompt: 'Walk me through the DocuSeal signing workflow' },
    ],
  },
  {
    label: 'Google Drive & storage',
    prompts: [
      { label: 'Connect Google Drive', prompt: 'How do I connect Google Drive?' },
      { label: 'Where signed PDFs go', prompt: 'Where are signed PDFs stored after signing?' },
      { label: 'Drive vs workspace storage', prompt: 'What is the difference between workspace storage and Google Drive backup?' },
    ],
  },
  {
    label: 'Sharing & security',
    prompts: [
      { label: 'PIN-protected sharing', prompt: 'How does PIN-protected PDF sharing work?' },
      { label: 'Share a document', prompt: 'How do I share a PDF with a client?' },
    ],
  },
  {
    label: 'Account & product',
    prompts: [
      { label: 'What is Finance CRM?', prompt: 'What is Finance CRM and who is it for?' },
      { label: 'Pricing plans', prompt: 'What are the pricing plans?' },
      { label: 'Coming soon features', prompt: 'What features are coming in Phase 2?' },
      { label: 'Open settings', prompt: 'Where do I manage my account settings?' },
    ],
  },
]

export const AI_SUGGESTED_PROMPTS = AI_PROMPT_CATEGORIES.flatMap(
  (category) => category.prompts.map((item) => item.prompt),
)
