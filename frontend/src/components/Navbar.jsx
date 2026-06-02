import React from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',          label: '📊 Dashboard'  },
  { to: '/products',  label: '📦 Products'   },
  { to: '/customers', label: '👥 Customers'  },
  { to: '/orders',    label: '🛒 Orders'     },
]

const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, height: '100vh', width: '220px',
    background: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)',
    display: 'flex', flexDirection: 'column', padding: '2rem 1rem',
    boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
  },
  title: { color: '#e94560', fontSize: '1.2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' },
  link: {
    display: 'block', color: '#a8b2d8', textDecoration: 'none',
    padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.5rem',
    transition: 'all 0.2s',
  },
  active: { background: '#e94560', color: '#fff' },
}

export default function Navbar() {
  return (
    <nav style={s.nav}>
      <div style={s.title}>⚙️ InventoryOS</div>
      {links.map(({ to, label }) => (
        <NavLink
          key={to} to={to}
          style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}