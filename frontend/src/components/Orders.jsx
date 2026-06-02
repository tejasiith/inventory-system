import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../api'

const s = {
  bar:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  btn:    { background: '#e94560', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  btnSm:  { border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
  card:   { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  table:  { width: '100%', borderCollapse: 'collapse' },
  th:     { textAlign: 'left', padding: '0.7rem 1rem', background: '#f7f8fa', color: '#555', fontSize: '0.85rem' },
  td:     { padding: '0.7rem 1rem', borderTop: '1px solid #f0f0f0' },
  overlay:{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:  { background: '#fff', borderRadius: '12px', padding: '2rem', width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' },
  field:  { marginBottom: '1rem' },
  label:  { display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#555' },
  select: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  input:  { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  row:    { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  itemRow:{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' },
  addLink:{ color: '#e94560', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.25rem', display: 'inline-block' },
}

const emptyItem = { product_id: '', quantity: 1 }

export default function Orders() {
  const [orders,    setOrders]    = useState([])
  const [customers, setCustomers] = useState([])
  const [products,  setProducts]  = useState([])
  const [show,      setShow]      = useState(false)
  const [custId,    setCustId]    = useState('')
  const [items,     setItems]     = useState([{ ...emptyItem }])
  const [detail,    setDetail]    = useState(null)

  const load = () => {
    getOrders().then(r => setOrders(r.data)).catch(() => toast.error('Failed to load orders'))
  }

  useEffect(() => {
    load()
    getCustomers().then(r => setCustomers(r.data))
    getProducts().then(r => setProducts(r.data))
  }, [])

  const open  = () => { setCustId(''); setItems([{ ...emptyItem }]); setShow(true) }
  const close = () => { setShow(false) }

  const setItem = (idx, key, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it))
  }
  const addItem    = () => setItems(prev => [...prev, { ...emptyItem }])
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const save = async () => {
    if (!custId) return toast.error('Select a customer')
    const validItems = items.filter(it => it.product_id && it.quantity > 0)
    if (!validItems.length) return toast.error('Add at least one product')
    try {
      await createOrder({
        customer_id: parseInt(custId),
        items: validItems.map(it => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) }))
      })
      toast.success('Order created!')
      close(); load()
      // Refresh products (stock changed)
      getProducts().then(r => setProducts(r.data))
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error creating order')
    }
  }

  const remove = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try {
      await deleteOrder(id)
      toast.success('Order cancelled')
      load()
      getProducts().then(r => setProducts(r.data))
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error')
    }
  }

  const custName = (id) => customers.find(c => c.id === id)?.full_name || `#${id}`
  const prodName = (id) => products.find(p => p.id === id)?.name || `#${id}`

  return (
    <div>
      <div style={s.bar}>
        <h1>Orders</h1>
        <button style={s.btn} onClick={open}>+ New Order</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>{['Order ID','Customer','Items','Total','Status','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {orders.length === 0
              ? <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#999' }}>No orders yet</td></tr>
              : orders.map(o => (
                <tr key={o.id}>
                  <td style={s.td}><strong>#{o.id}</strong></td>
                  <td style={s.td}>{custName(o.customer_id)}</td>
                  <td style={s.td}>{o.items?.length ?? 0}</td>
                  <td style={s.td}><strong>${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                  <td style={s.td}><span style={{ color: '#198754', fontWeight: 600 }}>{o.status}</span></td>
                  <td style={s.td}>
                    <button style={{ ...s.btnSm, background: '#0d6efd', color: '#fff', marginRight: '0.4rem' }} onClick={() => setDetail(o)}>View</button>
                    <button style={{ ...s.btnSm, background: '#dc3545', color: '#fff' }} onClick={() => remove(o.id)}>Cancel</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {show && (
        <div style={s.overlay} onClick={close}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>New Order</h2>
            <div style={s.field}>
              <label style={s.label}>Customer</label>
              <select style={s.select} value={custId} onChange={e => setCustId(e.target.value)}>
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
              </select>
            </div>
            <label style={s.label}>Products</label>
            {items.map((it, idx) => (
              <div key={idx} style={s.itemRow}>
                <select style={{ ...s.select, flex: 2 }} value={it.product_id} onChange={e => setItem(idx, 'product_id', e.target.value)}>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity}) — ${p.price}</option>)}
                </select>
                <input style={{ ...s.input, width: '70px' }} type="number" min="1" value={it.quantity}
                  onChange={e => setItem(idx, 'quantity', e.target.value)} />
                {items.length > 1 && (
                  <button style={{ ...s.btnSm, background: '#dc3545', color: '#fff' }} onClick={() => removeItem(idx)}>✕</button>
                )}
              </div>
            ))}
            <span style={s.addLink} onClick={addItem}>+ Add another product</span>
            <div style={s.row}>
              <button style={s.btn} onClick={save}>Place Order</button>
              <button style={{ ...s.btn, background: '#6c757d' }} onClick={close}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div style={s.overlay} onClick={() => setDetail(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.5rem' }}>Order #{detail.id}</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Customer: {custName(detail.customer_id)}</p>
            <table style={s.table}>
              <thead><tr>{['Product','Qty','Unit Price','Subtotal'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {detail.items?.map(it => (
                  <tr key={it.id}>
                    <td style={s.td}>{prodName(it.product_id)}</td>
                    <td style={s.td}>{it.quantity}</td>
                    <td style={s.td}>${parseFloat(it.unit_price).toFixed(2)}</td>
                    <td style={s.td}>${(it.quantity * it.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: 'right', fontWeight: 700, marginTop: '1rem', fontSize: '1.1rem' }}>
              Total: ${parseFloat(detail.total_amount).toFixed(2)}
            </p>
            <button style={{ ...s.btn, background: '#6c757d', marginTop: '1rem' }} onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}