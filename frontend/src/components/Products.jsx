import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api'

const empty = { name: '', sku: '', price: '', quantity: '' }

const s = {
  bar:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  btn:    { background: '#e94560', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  btnSm:  { border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, marginRight: '0.4rem' },
  card:   { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  table:  { width: '100%', borderCollapse: 'collapse' },
  th:     { textAlign: 'left', padding: '0.7rem 1rem', background: '#f7f8fa', color: '#555', fontSize: '0.85rem' },
  td:     { padding: '0.7rem 1rem', borderTop: '1px solid #f0f0f0' },
  overlay:{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:  { background: '#fff', borderRadius: '12px', padding: '2rem', width: '400px', maxWidth: '90vw' },
  field:  { marginBottom: '1rem' },
  label:  { display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#555' },
  input:  { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  row:    { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm]         = useState(empty)
  const [editing, setEditing]   = useState(null)
  const [show, setShow]         = useState(false)

  const load = () => getProducts().then(r => setProducts(r.data)).catch(() => toast.error('Failed to load'))
  useEffect(() => { load() }, [])

  const open  = (p = null) => { setEditing(p); setForm(p ? { name: p.name, sku: p.sku, price: p.price, quantity: p.quantity } : empty); setShow(true) }
  const close = () => { setShow(false); setEditing(null); setForm(empty) }

  const save = async () => {
    const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
    try {
      editing ? await updateProduct(editing.id, payload) : await createProduct(payload)
      toast.success(editing ? 'Product updated' : 'Product created')
      close(); load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error saving product')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); toast.success('Deleted'); load() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error deleting') }
  }

  return (
    <div>
      <div style={s.bar}>
        <h1>Products</h1>
        <button style={s.btn} onClick={() => open()}>+ Add Product</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>{['Name','SKU','Price','Stock','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.length === 0
              ? <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#999' }}>No products yet</td></tr>
              : products.map(p => (
                <tr key={p.id}>
                  <td style={s.td}>{p.name}</td>
                  <td style={s.td}><code>{p.sku}</code></td>
                  <td style={s.td}>${parseFloat(p.price).toFixed(2)}</td>
                  <td style={s.td}>
                    <span style={{ color: p.quantity <= 5 ? '#dc3545' : '#198754', fontWeight: 600 }}>
                      {p.quantity}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={{ ...s.btnSm, background: '#0d6efd', color: '#fff' }} onClick={() => open(p)}>Edit</button>
                    <button style={{ ...s.btnSm, background: '#dc3545', color: '#fff' }} onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {show && (
        <div style={s.overlay} onClick={close}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editing ? 'Edit Product' : 'New Product'}</h2>
            {[
              { label: 'Product Name', key: 'name',     type: 'text'   },
              { label: 'SKU',          key: 'sku',      type: 'text'   },
              { label: 'Price ($)',    key: 'price',    type: 'number' },
              { label: 'Quantity',     key: 'quantity', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key} style={s.field}>
                <label style={s.label}>{label}</label>
                <input
                  style={s.input} type={type} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={s.row}>
              <button style={s.btn} onClick={save}>Save</button>
              <button style={{ ...s.btn, background: '#6c757d' }} onClick={close}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}