import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getCustomers, createCustomer, deleteCustomer } from '../api'

const empty = { full_name: '', email: '', phone: '' }

const s = {
  bar:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  btn:    { background: '#e94560', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  btnSm:  { border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
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

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [form, setForm]           = useState(empty)
  const [show, setShow]           = useState(false)

  const load  = () => getCustomers().then(r => setCustomers(r.data)).catch(() => toast.error('Failed to load'))
  useEffect(() => { load() }, [])

  const open  = () => { setForm(empty); setShow(true) }
  const close = () => { setShow(false); setForm(empty) }

  const save = async () => {
    try {
      await createCustomer(form)
      toast.success('Customer added')
      close(); load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error saving customer')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this customer?')) return
    try { await deleteCustomer(id); toast.success('Deleted'); load() }
    catch (e) { toast.error(e.response?.data?.detail || 'Error deleting') }
  }

  return (
    <div>
      <div style={s.bar}>
        <h1>Customers</h1>
        <button style={s.btn} onClick={open}>+ Add Customer</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>{['Name','Email','Phone','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {customers.length === 0
              ? <tr><td colSpan={4} style={{ ...s.td, textAlign: 'center', color: '#999' }}>No customers yet</td></tr>
              : customers.map(c => (
                <tr key={c.id}>
                  <td style={s.td}>{c.full_name}</td>
                  <td style={s.td}>{c.email}</td>
                  <td style={s.td}>{c.phone}</td>
                  <td style={s.td}>
                    <button style={{ ...s.btnSm, background: '#dc3545', color: '#fff' }} onClick={() => remove(c.id)}>Delete</button>
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
            <h2 style={{ marginBottom: '1.5rem' }}>New Customer</h2>
            {[
              { label: 'Full Name', key: 'full_name', type: 'text'  },
              { label: 'Email',     key: 'email',     type: 'email' },
              { label: 'Phone',     key: 'phone',     type: 'tel'   },
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