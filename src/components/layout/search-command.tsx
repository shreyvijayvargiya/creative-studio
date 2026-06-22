import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  Eye,
  FileText,
  LayoutDashboard,
  Search,
  TableProperties,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  mainNavItems,
  settingsNavItems,
} from '#/components/layout/nav-config'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { listDocuments } from '#/lib/server/list-documents'
import { cn } from '#/lib/utils'
import type { DocumentListItem } from '#/types'

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  id: string
  label: string
  description?: string
  href: string
  params?: Record<string, string>
  icon: LucideIcon
  group: 'Documents' | 'Navigation' | 'Features'
}

const featureItems: SearchResult[] = [
  {
    id: 'feature-budget',
    label: 'Create Budget',
    description: 'Open the budget planner grid',
    href: '/grid',
    icon: TableProperties,
    group: 'Features',
  },
  {
    id: 'feature-documents',
    label: 'Browse Documents',
    description: 'View saved budgets and PDFs',
    href: '/documents',
    icon: FileText,
    group: 'Features',
  },
  {
    id: 'feature-pdf',
    label: 'PDF Viewer',
    description: 'Open signed PDF documents',
    href: '/pdf',
    icon: Eye,
    group: 'Features',
  },
  {
    id: 'feature-dashboard',
    label: 'Dashboard',
    description: 'Overview and activity',
    href: '/',
    icon: LayoutDashboard,
    group: 'Features',
  },
]

function matchesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase())
}

function documentToResult(doc: DocumentListItem): SearchResult {
  const isBudget = doc.kind === 'budget'

  return {
    id: `doc-${doc.id}`,
    label: doc.name,
    description: isBudget ? 'Saved budget' : 'Generated PDF',
    href: isBudget ? '/documents/$id' : '/pdf/view/$filename',
    params: isBudget ? { id: doc.id } : { filename: doc.storagePath },
    icon: isBudget ? TableProperties : FileText,
    group: 'Documents',
  }
}

function navToResult(item: (typeof mainNavItems)[number]): SearchResult {
  return {
    id: `nav-${item.href}`,
    label: item.label,
    description: item.phaseTwo ? 'Coming soon' : item.href,
    href: item.href,
    icon: item.icon,
    group: 'Navigation',
  }
}

function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult
  onSelect: () => void
}) {
  const Icon = result.icon

  return (
    <Link
      to={result.href}
      params={result.params}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{result.label}</p>
        {result.description ? (
          <p className="truncate text-xs text-muted-foreground">
            {result.description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

function SearchGroup({
  title,
  results,
  onSelect,
}: {
  title: string
  results: SearchResult[]
  onSelect: () => void
}) {
  if (results.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {results.map((result) => (
        <SearchResultItem key={result.id} result={result} onSelect={onSelect} />
      ))}
    </div>
  )
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const listDocumentsFn = useServerFn(listDocuments)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    setIsLoading(true)

    void listDocumentsFn()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setIsLoading(false))

    return () => window.clearTimeout(timer)
  }, [open, listDocumentsFn])

  const filteredResults = useMemo(() => {
    const navResults = [...mainNavItems, ...settingsNavItems].map(navToResult)
    const documentResults = documents.map(documentToResult)
    const allResults = [...documentResults, ...navResults, ...featureItems]

    if (!query.trim()) {
      return {
        documents: documentResults.slice(0, 5),
        navigation: navResults,
        features: featureItems,
      }
    }

    const filtered = allResults.filter(
      (item) =>
        matchesQuery(item.label, query) ||
        matchesQuery(item.description ?? '', query) ||
        matchesQuery(item.href, query),
    )

    return {
      documents: filtered.filter((item) => item.group === 'Documents'),
      navigation: filtered.filter((item) => item.group === 'Navigation'),
      features: filtered.filter((item) => item.group === 'Features'),
    }
  }, [documents, query])

  const hasResults =
    filteredResults.documents.length > 0 ||
    filteredResults.navigation.length > 0 ||
    filteredResults.features.length > 0

  const handleSelect = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search documents, pages, and app features
        </DialogDescription>

        <div className="flex items-center border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documents, pages, features..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>

        <div
          className={cn(
            'max-h-80 overflow-y-auto p-2',
            !hasResults && !isLoading && 'py-8',
          )}
        >
          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading...
            </p>
          ) : hasResults ? (
            <div className="space-y-4">
              <SearchGroup
                title="Documents"
                results={filteredResults.documents}
                onSelect={handleSelect}
              />
              <SearchGroup
                title="Navigation"
                results={filteredResults.navigation}
                onSelect={handleSelect}
              />
              <SearchGroup
                title="Features"
                results={filteredResults.features}
                onSelect={handleSelect}
              />
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
