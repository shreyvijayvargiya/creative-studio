import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { toast } from 'sonner'

const SubscribeModal = lazy(() =>
  import('#/components/billing/subscribe-modal').then((module) => ({
    default: module.SubscribeModal,
  })),
)

interface SubscribeModalContextValue {
  open: boolean
  openSubscribeModal: () => void
  closeSubscribeModal: () => void
}

const SubscribeModalContext = createContext<SubscribeModalContextValue | null>(
  null,
)

function readSubscriptionSearch(
  search: Record<string, unknown>,
): string | undefined {
  return typeof search.subscription === 'string' ? search.subscription : undefined
}

export function SubscribeModalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const subscriptionSearch = useRouterState({
    select: (state) =>
      readSubscriptionSearch(state.location.search as Record<string, unknown>),
  })

  const [manualOpen, setManualOpen] = useState(false)
  const [routeDismissed, setRouteDismissed] = useState(false)

  // Derive open from the URL so PayPal/Stripe return (?subscription=success)
  // opens the modal without a useEffect. Dashboard must not clear this search
  // before the modal can open.
  const successOnDashboard =
    pathname.startsWith('/dashboard') && subscriptionSearch === 'success'

  // Allow a fresh success redirect to reopen after the previous one was cleared.
  if (!successOnDashboard && routeDismissed) {
    setRouteDismissed(false)
  }

  const open = manualOpen || (successOnDashboard && !routeDismissed)

  const clearSubscriptionSearch = useCallback(() => {
    void navigate({
      to: '.',
      search: (prev) => {
        const next = { ...(prev as Record<string, unknown>) }
        delete next.subscription
        delete next.subscription_id
        delete next.ba_token
        delete next.token
        return next
      },
      replace: true,
    })
  }, [navigate])

  const openSubscribeModal = useCallback(() => {
    setManualOpen(true)
  }, [])

  const closeSubscribeModal = useCallback(() => {
    setManualOpen(false)
    if (successOnDashboard) {
      setRouteDismissed(true)
      toast.success('Subscription updated! Your plan will reflect shortly.')
      clearSubscriptionSearch()
    }
  }, [clearSubscriptionSearch, successOnDashboard])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setManualOpen(true)
        return
      }
      closeSubscribeModal()
    },
    [closeSubscribeModal],
  )

  const value = useMemo(
    () => ({
      open,
      openSubscribeModal,
      closeSubscribeModal,
    }),
    [open, openSubscribeModal, closeSubscribeModal],
  )

  return (
    <SubscribeModalContext.Provider value={value}>
      {children}
      {open ? (
        <Suspense fallback={null}>
          <SubscribeModal open={open} onOpenChange={handleOpenChange} />
        </Suspense>
      ) : null}
    </SubscribeModalContext.Provider>
  )
}

export function useSubscribeModal(): SubscribeModalContextValue {
  const context = useContext(SubscribeModalContext)

  if (!context) {
    throw new Error('useSubscribeModal must be used within SubscribeModalProvider')
  }

  return context
}
