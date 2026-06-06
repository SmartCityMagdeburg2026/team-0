import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import common from './locales/common'
import home from './locales/home'
import map from './locales/map'
import matrix from './locales/matrix'
import fifteen from './locales/fifteen'
import hidden from './locales/hidden'
import future from './locales/future'
import compare from './locales/compare'
import ai from './locales/ai'

const pages = { home, map, matrix, fifteen, hidden, future, compare, ai }

type Lng = 'en' | 'de'

function build(lng: Lng) {
  const p: Record<string, unknown> = {}
  for (const [key, mod] of Object.entries(pages)) p[key] = (mod as any)[lng]
  return { ...(common as any)[lng], pages: p }
}

const resources = {
  en: { translation: build('en') },
  de: { translation: build('de') },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => localStorage.setItem('lang', lng))

export default i18n
