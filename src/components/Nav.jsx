import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 flex items-center gap-3">
        <img src="/logo.png" alt="99 Market" className="h-12 md:h-14 w-auto object-contain" loading="eager" decoding="async"/>
        <nav className="ml-2 flex items-center gap-2 md:gap-4">
          {['/', '/payments', '/analytics', '/profile'].map((path, idx) => (
            <NavLink key={path} to={path} end className={({isActive}) =>
              `px-3 py-2 rounded-xl text-sm font-semibold text-white/90 hover:bg-bg-soft border border-transparent ${isActive ? 'border-accent-red shadow-[0_0_0_3px_var(--tw-color-accent-ring)]' : ''}`
            }>
              {['POS','Payments','Analytics','Profile'][idx]}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
