import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/map', icon: 'map', label: 'Map' },
  { to: '/matrix', icon: 'grid_view', label: 'Value Matrix' },
  { to: '/fifteen', icon: 'timer_10_alt_1', label: '15-Min City' },
  { to: '/hidden', icon: 'monetization_on', label: 'Hidden Cost' },
  { to: '/future', icon: 'auto_awesome', label: 'Future' },
  { to: '/compare', icon: 'compare_arrows', label: 'Compare' },
  { to: '/ai', icon: 'psychology', label: 'AI Assistant' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const map = pathname === '/map'
  const home = pathname === '/'
  const bleed = map || home
  return (
    <div className="min-h-screen bg-page text-body font-body">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-line z-50 flex items-center px-6 gap-3">
        <div className="w-9 h-9 rounded-full bg-brick text-white grid place-items-center font-headline font-bold">M</div>
        <div className="font-headline font-bold text-ink text-lg hidden sm:block">Magdeburg Smart Living Navigator</div>
        <div className="ml-auto text-sm text-muted">magdeburg.de</div>
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
              <span className="hidden lg:block">{n.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="p-6 border-t border-line">
          <button className="w-full bg-sun text-white py-2 rounded font-label font-bold hover:bg-opacity-90 transition mb-2">
            <span className="hidden lg:inline">Expert View</span>
            <span className="lg:hidden material-symbols-outlined">tune</span>
          </button>
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
