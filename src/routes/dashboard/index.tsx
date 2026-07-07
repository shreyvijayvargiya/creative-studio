import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Eye, FileText, HardDrive, PenLine, Users } from 'lucide-react'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import { listDocuments } from '#/lib/server/list-documents'
import type { DocumentListItem } from '#/types'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(value: string): string {
  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function DocumentPinBadge({ pinProtected }: { pinProtected: boolean }) {
  if (pinProtected) {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300">
        PIN
      </Badge>
    )
  }

  return <Badge variant="secondary">Draft</Badge>
}

function RecentDocumentCard({ document }: { document: DocumentListItem }) {
  const viewPath =
    document.kind === 'budget' ? '/documents/$id' : '/documents/pdf/$id'

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {document.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateShort(document.createdAt)}
        </p>
        <DocumentPinBadge pinProtected={document.pinProtected} />
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link to={viewPath} params={{ id: document.id }}>
          <Eye className="size-4" />
          View
        </Link>
      </Button>
    </div>
  )
}

function RecentDocumentTableRow({ document }: { document: DocumentListItem }) {
  const viewPath =
    document.kind === 'budget' ? '/documents/$id' : '/documents/pdf/$id'

  return (
    <TableRow>
      <TableCell className="max-w-[220px] font-medium">
        <span className="line-clamp-2">{document.name}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatDate(document.createdAt)}
      </TableCell>
      <TableCell>
        <DocumentPinBadge pinProtected={document.pinProtected} />
      </TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="sm">
          <Link to={viewPath} params={{ id: document.id }}>
            <Eye className="size-4" />
            View
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function DashboardPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { openLoginModal } = useLoginModal()
  const listDocumentsFn = useStableServerFn(listDocuments)
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const hasLoadedDocumentsRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedDocumentsRef.current = false
      setDocuments([])
      setIsLoadingDocuments(false)
      return
    }

    if (hasLoadedDocumentsRef.current) {
      return
    }

    hasLoadedDocumentsRef.current = true
    setIsLoadingDocuments(true)

    void listDocumentsFn()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setIsLoadingDocuments(false))
  }, [isAuthenticated, listDocumentsFn])

  const pdfCount = useMemo(
    () => documents.filter((document) => document.kind === 'pdf').length,
    [documents],
  )

  const recentDocuments = useMemo(() => documents.slice(0, 5), [documents])

  const statCards = useMemo(
    () => [
      {
        title: 'Documents Generated',
        value: String(documents.length),
        hint: isAuthenticated ? 'Your workspace' : 'Sign in to track',
        icon: FileText,
      },
      {
        title: 'PDFs Signed',
        value: String(pdfCount),
        hint: isAuthenticated ? 'Generated PDFs' : 'Sign in to track',
        icon: PenLine,
      },
      {
        title: 'Storage Used',
        value: '0 MB',
        hint: 'of 100MB',
        icon: HardDrive,
      },
      {
        title: 'Active Users',
        value: isAuthenticated ? '1' : '0',
        hint: isAuthenticated ? '(you)' : 'Sign in',
        icon: Users,
      },
    ],
    [documents.length, isAuthenticated, pdfCount],
  )

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your finance documents and activity
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid w-full gap-6 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Documents</CardTitle>
          </CardHeader>
            <CardContent className="min-w-0">
            {isAuthLoading || isLoadingDocuments ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Loading your documents...
              </p>
            ) : !isAuthenticated ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Alert className="max-w-md border-dashed">
                  <AlertDescription>
                    Sign in to see documents saved under your account.
                  </AlertDescription>
                </Alert>
                <Button onClick={openLoginModal}>Sign in</Button>
              </div>
            ) : (
              <>
                {recentDocuments.length === 0 ? (
                  <div className="py-12 text-center">
                    <Alert className="border-dashed">
                      <AlertDescription>
                        No documents yet — go to Budget Planner to generate your
                        first PDF
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 md:hidden">
                      {recentDocuments.map((document) => (
                        <RecentDocumentCard
                          key={document.id}
                          document={document}
                        />
                      ))}
                    </div>

                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>PIN Protected</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentDocuments.map((document) => (
                            <RecentDocumentTableRow
                              key={document.id}
                              document={document}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/grid">New Budget Document</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/documents">View All Documents</Link>
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Upload File
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Upload coming in Phase 2
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
