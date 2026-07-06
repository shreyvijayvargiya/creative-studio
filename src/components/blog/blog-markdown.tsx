import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '#/lib/utils'

const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ''}
      className="my-6 w-full rounded-2xl border border-border/60 object-cover"
      loading="lazy"
    />
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[32rem] border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border px-4 py-3 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
      {children}
    </td>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-blue-500/40 pl-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border/60" />,
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight text-foreground">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-4 text-base leading-7 text-muted-foreground">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
}

interface BlogMarkdownProps {
  content: string
  className?: string
}

export function BlogMarkdown({ content, className }: BlogMarkdownProps) {
  return (
    <div className={cn('blog-markdown', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
