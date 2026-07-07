import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Mail, UserRound } from 'lucide-react'

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
import { listPayees } from '#/lib/server/payees'
import { cn } from '#/lib/utils'
import type { Payee } from '#/types/payee'

export const Route = createFileRoute('/payees/')({
  validateSearch: (search: Record<string, unknown>) => ({
    highlight: typeof search.highlight === 'string' ? search.highlight : undefined,
  }),
  component: PayeesPage,
})

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function PayeesPage() {
  const { highlight } = Route.useSearch()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { openLoginModal } = useLoginModal()
  const listPayeesFn = useServerFn(listPayees)
  const [payees, setPayees] = useState<Payee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const highlightRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setPayees([])
      return
    }

    setIsLoading(true)
    void listPayeesFn()
      .then(setPayees)
      .catch(() => setPayees([]))
      .finally(() => setIsLoading(false))
  }, [isAuthenticated, listPayeesFn])

  useEffect(() => {
    if (!highlight || !highlightRef.current) return
    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlight, payees])

  const highlightedPayee = useMemo(
    () => payees.find((payee) => payee.id === highlight),
    [highlight, payees],
  )

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Payees</h1>
          <p className="text-sm text-muted-foreground">
            Clients and vendors created by you or the AI assistant
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      {highlightedPayee ? (
        <Card className="border-violet-200 bg-violet-50/50 dark:border-violet-900/50 dark:bg-violet-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Highlighted payee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{highlightedPayee.name}</p>
            {highlightedPayee.email ? (
              <p className="text-muted-foreground">{highlightedPayee.email}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">All payees</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {isAuthLoading || isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading payees...
            </p>
          ) : !isAuthenticated ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Alert className="max-w-md border-dashed">
                <AlertDescription>
                  Sign in to view payees saved under your account.
                </AlertDescription>
              </Alert>
              <Button onClick={openLoginModal}>Sign in</Button>
            </div>
          ) : payees.length === 0 ? (
            <div className="py-12 text-center">
              <Alert className="border-dashed">
                <AlertDescription>
                  No payees yet — ask the dashboard assistant to create one.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ABN</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payees.map((payee) => (
                  <TableRow
                    key={payee.id}
                    ref={payee.id === highlight ? highlightRef : undefined}
                    className={cn(
                      payee.id === highlight &&
                        'bg-violet-50 dark:bg-violet-950/30',
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserRound className="size-4 text-muted-foreground" />
                        {payee.name}
                        {payee.id === highlight ? (
                          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300">
                            New
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payee.email ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="size-3.5" />
                          {payee.email}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{payee.abn ?? '—'}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(payee.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
