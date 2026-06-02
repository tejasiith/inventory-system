import React, { useEffect, useState } from 'react'
import { getDashboard } from '../api'

const s = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  num:  { fontSize: '2.5rem', fontWeight: 700, color: '#e94560' },
  label:{ color: '#666', marginTop: '0.25rem', fontSize: '0.95rem' },
  table:{ width: '100%', borderCollapse: 'collapse' },
  th:   { textAlign: 'left', padding: '0.6rem 1rem', background: '#f7f8fa', color: '#555', fontSize: '0.85rem' },
  td:   { padding: '0.6rem 1rem', borderTop: '1px solid #f0f0f0' },
  badge:{ background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' },
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState('')

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => setErr('Could not load dashboard'))
  }, [])

  if (err)   return <p style={{ color: 'red' }}>{err}</p>
  if (!data) return <p>Loading…</p>

  const stats = [
    { label: 'Total Products',  value: data.total_products  },
    { label: 'Total Customers', value: data.total_customers },
    { label: 'Total Orders',    value: data.total_orders    },
    { label: 'Low Stock Items', value: data.low_stock_products.length },
  ]

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={s.grid}>
        {stats.map(({ label, value }) => (
          <div key={label} style={s.card}>
            <div style={s.num}>{value}</div>
            <div style={s.label}>{label}</div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>⚠️ Low Stock Products (≤ 5 units)</h2>
        {data.low_stock_products.length === 0
          ? <p style={{ color: '#666' }}>All products are well-stocked.</p>
          : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'SKU', 'Stock'].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>{p.name}</td>
                    <td style={s.td}>{p.sku}</td>
                    <td style={s.td}><span style={s.badge}>{p.quantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  )
}