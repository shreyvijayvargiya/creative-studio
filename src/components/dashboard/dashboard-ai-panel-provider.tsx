import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const STORAGE_KEY = 'finance-crm-ai-panel-open'

interface DashboardAiPanelContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const DashboardAiPanelContext =
  createContext<DashboardAiPanelContextValue | null>(null)

export function DashboardAiPanelProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'false') setIsOpen(false)
    } catch {
      // ignore
    }
  }, [])

  const persist = useCallback((open: boolean) => {
    setIsOpen(open)
    try {
      localStorage.setItem(STORAGE_KEY, String(open))
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      open: () => persist(true),
      close: () => persist(false),
      toggle: () => persist(!isOpen),
    }),
    [isOpen, persist],
  )

  return (
    <DashboardAiPanelContext.Provider value={value}>
      {children}
    </DashboardAiPanelContext.Provider>
  )
}

export function useDashboardAiPanel(): DashboardAiPanelContextValue {
  const context = useContext(DashboardAiPanelContext)
  if (!context) {
    throw new Error('useDashboardAiPanel must be used within DashboardAiPanelProvider')
  }
  return context
}
