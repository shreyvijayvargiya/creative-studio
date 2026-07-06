import { Link } from '@tanstack/react-router'
import { ArrowLeft, Check, Copy, Link2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { absoluteUrl } from '#/lib/blog/site-url'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface BlogPostActionsProps {
  slug: string
  markdown: string
  className?: string
}

export function BlogPostActions({ slug, markdown, className }: BlogPostActionsProps) {
  const [copied, setCopied] = useState<'markdown' | 'link' | null>(null)
  const postUrl = absoluteUrl(`/blog/${slug}`)

  async function copyValue(value: string, type: 'markdown' | 'link') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(type)
      toast.success(type === 'markdown' ? 'Markdown copied' : 'Link copied')
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/blog">
          <ArrowLeft className="size-4" />
          Back to blogs
        </Link>
      </Button>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => void copyValue(markdown, 'markdown')}
        >
          {copied === 'markdown' ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
          Copy markdown
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => void copyValue(postUrl, 'link')}
        >
          {copied === 'link' ? <Check className="size-4" /> : <Link2 className="size-4" />}
          Copy link
        </Button>
      </div>
    </div>
  )
}
