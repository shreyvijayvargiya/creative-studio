import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { LoginModal } from '#/components/auth/login-modal'

interface LoginModalContextValue {
  open: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null)

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const openLoginModal = useCallback(() => setOpen(true), [])
  const closeLoginModal = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({
      open,
      openLoginModal,
      closeLoginModal,
    }),
    [open, openLoginModal, closeLoginModal],
  )

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal open={open} onOpenChange={setOpen} />
    </LoginModalContext.Provider>
  )
}

export function useLoginModal(): LoginModalContextValue {
  const context = useContext(LoginModalContext)

  if (!context) {
    throw new Error('useLoginModal must be used within LoginModalProvider')
  }

  return context
}
