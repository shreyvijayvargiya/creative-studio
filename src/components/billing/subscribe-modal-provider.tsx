import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

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

const SubscribeModalContext = createContext<SubscribeModalContextValue | null>(null)

export function SubscribeModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const openSubscribeModal = useCallback(() => setOpen(true), [])
  const closeSubscribeModal = useCallback(() => setOpen(false), [])

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
          <SubscribeModal open={open} onOpenChange={setOpen} />
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
