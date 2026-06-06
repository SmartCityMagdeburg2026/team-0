import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/', icon: 'home', key: 'home' },
  { to: '/map', icon: 'map', key: 'map' },
  { to: '/matrix', icon: 'grid_view', key: 'matrix' },
  { to: '/fifteen', icon: 'timer_10_alt_1', key: 'fifteen' },
  { to: '/hidden', icon: 'monetization_on', key: 'hidden' },
  { to: '/future', icon: 'auto_awesome', key: 'future' },
  { to: '/compare', icon: 'compare_arrows', key: 'compare' },
  { to: '/ai', icon: 'psychology', key: 'ai' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language
  return (
    <div className="ml-auto flex items-center rounded-full border border-line overflow-hidden text-sm font-bold">
      {(['en', 'de'] as const).map((lng) => (
        <button
          key={lng}
          onClick={() => i18n.changeLanguage(lng)}
          className={`px-3 py-1 transition-colors ${
            lang === lng ? 'bg-petrol text-white' : 'text-muted hover:text-petrol'
          }`}
          aria-pressed={lang === lng}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const map = pathname === '/map'
  const home = pathname === '/'
  const bleed = map || home
  return (
    <div className="min-h-screen bg-page text-body font-body">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-line z-50 flex items-center px-6 gap-3">
        <img src={logo} alt="KiezKompass MD" className="w-9 h-9 rounded-full object-cover" />
        <div className="font-headline font-bold text-ink text-lg hidden sm:block">KiezKompass <span className="text-brick">MD</span></div>
        <LanguageSwitcher />
      </header>

      {/* Side nav */}
      <nav className="fixed left-0 top-16 h-[calc(100vh-64px)] w-20 lg:w-64 bg-white border-r border-line z-40 flex flex-col pt-2">
        <div className="flex-1 overflow-y-auto py-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-3 font-label text-sm font-medium transition-colors border-l-4 ${
                  isActive
                    ? 'text-petrol font-bold border-petrol bg-page'
                    : 'text-muted border-transparent hover:bg-[#F0F0F0] hover:text-petrol'
                }`
              }
            >
              <span className="material-symbols-outlined">{n.icon}</span>
              <span className="hidden lg:block">{t(`nav.${n.key}`)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main
        className={
          bleed
            ? `ml-20 lg:ml-64 mt-16 ${map ? 'h-[calc(100vh-64px)] overflow-hidden' : 'min-h-[calc(100vh-64px)]'}`
            : 'ml-20 lg:ml-64 pt-24 px-8 pb-12'
        }
      >
        {bleed ? children : <div className="max-w-7xl mx-auto">{children}</div>}
      </main>
    </div>
  )
}
