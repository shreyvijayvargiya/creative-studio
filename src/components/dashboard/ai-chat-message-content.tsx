import { Link } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'

import { cn } from '#/lib/utils'

function isInternalPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//')
}

export function AiChatMessageContent({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div className={cn('text-sm', className)}>
      <ReactMarkdown
        components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-6">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-6">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        a: ({ href, children }) => {
          if (!href) return <span>{children}</span>

          if (isInternalPath(href)) {
            return (
              <Link
                to={href}
                className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {children}
              </Link>
            )
          }

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
