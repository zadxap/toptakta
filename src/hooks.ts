import { useEffect, useState } from 'react'

/**
 * Firestore/localStorage тыңдаушысын React-күйімен байланыстырады.
 * Subscribe функциясы stabil болуы керек — deps өзгерсе қайта жазыламыз.
 */
export function useListen<T>(subscribe: (cb: (v: T) => void) => () => void, deps: unknown[]): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined)
  useEffect(() => subscribe(setValue), deps) // eslint-disable-line react-hooks/exhaustive-deps
  return value
}
