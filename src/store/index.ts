import { firebaseConfigured } from '../firebase'
import type { Store } from './api'
import { fbStore } from './fb'
import { mockStore } from './mock'

export const store: Store = firebaseConfigured ? fbStore : mockStore
/** Firebase кілттері көрсетілмесе — құрылғыдағы демо-режим */
export const isDemo = !firebaseConfigured
export { CodeNotFoundError } from './api'
