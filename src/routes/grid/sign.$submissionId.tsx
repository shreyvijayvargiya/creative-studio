import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ArrowLeft, Info, Loader2, PenLine } from 'lucide-react'
import { toast } from 'sonner'

import { DocuSealForm } from '#/components/signature/DocuSealForm'
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { completePdfSigning } from '#/lib/server/complete-pdf-signing'
import { getSigningSession } from '#/lib/server/get-signing-session'

export const Route = createFileRoute('/grid/sign/$submissionId')({
  component: SigningPage,
})

function SigningPage() {
  const { submissionId } = Route.useParams()
  const navigate = useNavigate()
  const getSigningSessionFn = useServerFn(getSigningSession)
  const completePdfSigningFn = useServerFn(completePdfSigning)

  const [embedSrc, setEmbedSrc] = useState('')
  const [title, setTitle] = useState('ATO Tax Return 2025')
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const completingRef = useRef(false)

  useEffect(() => {
    void getSigningSessionFn({
      data: { submissionId: Number(submissionId) },
    })
      .then((session) => {
        setEmbedSrc(session.embedSrc)
        setTitle(session.title)
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to load signing form'
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }, [getSigningSessionFn, submissionId])

  const handleSigningCompleted = useCallback(async () => {
    if (completingRef.current) {
      return
    }

    completingRef.current = true
    setIsCompleting(true)

    try {
      const result = await completePdfSigningFn({
        data: { submissionId: Number(submissionId) },
      })

      if (result.driveUrl) {
        toast.success('Signed PDF saved to Google Drive and Documents')
      } else {
        toast.success('Signed PDF saved to Documents')
      }

      await navigate({
        to: '/documents/pdf/$id',
        params: { id: result.id },
        search: { generated: true },
      })
    } catch (error) {
      completingRef.current = false
      const message =
        error instanceof Error ? error.message : 'Failed to save signed PDF'
      toast.error(message)
    } finally {
      setIsCompleting(false)
    }
  }, [completePdfSigningFn, navigate, submissionId])

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading signing form...
      </p>
    )
  }

  if (!embedSrc) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Unable to load the signing form for this submission.
        </p>
        <Button asChild variant="outline">
          <Link to="/grid">Back to Budget Planner</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
      {isCompleting ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border bg-card p-8 shadow-lg">
            <Loader2 className="size-10 animate-spin text-primary" />
            <div className="space-y-1 text-center">
              <p className="font-medium text-foreground">Saving signed document</p>
              <p className="text-sm text-muted-foreground">
                Uploading to app storage and Google Drive. Please wait...
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/grid">Budget Planner</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sign Document</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button asChild variant="ghost" className="w-fit gap-2 px-0">
        <Link to="/grid">
          <ArrowLeft className="size-4" />
          Back to Budget Planner
        </Link>
      </Button>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PenLine className="size-5" />
            DocuSeal E-Signature
          </CardTitle>
          <CardDescription>
            {title} — review and sign below. Your signed PDF will be saved to
            Documents and Google Drive when complete.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              {isCompleting
                ? 'Saving signed document...'
                : 'Complete all fields and apply your signature to finalise the tax return'}
            </AlertDescription>
          </Alert>

          <DocuSealForm
            embedSrc={embedSrc}
            disabled={isCompleting}
            onCompleted={() => {
              void handleSigningCompleted()
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
