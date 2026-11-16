import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppUser } from './types'
import { store } from './store'

interface AuthCtx {
  user: AppUser | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(store.auth.user())
  const [loading, setLoading] = useState(true)

  useEffect(() => store.auth.onUser((u) => {
    setUser(u)
    setLoading(false)
  }), [])

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        signIn: () => store.auth.signIn(),
        signOut: () => store.auth.signOut(),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside provider')
  return ctx
}
