import { initializeApp, type FirebaseApp } from 'firebase/app'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // authDomain всегда выводим из projectId: опечатка в переменной окружения
  // (например firebaseapp.co вместо firebaseapp.com) уводит вход на чужой
  // припаркованный домен, и попап/redirect молча умирает.
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(cfg.apiKey && cfg.projectId && cfg.appId)

export const firebaseApp: FirebaseApp | null = firebaseConfigured ? initializeApp(cfg) : null
