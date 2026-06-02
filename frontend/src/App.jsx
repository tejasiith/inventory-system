import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Customers from './components/Customers'
import Orders from './components/Orders'

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '2rem', marginLeft: '220px' },
}

export default function App() {
  return (
    <div style={styles.layout}>
      <Navbar />
      <main style={styles.main}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/products"  element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders"    element={<Orders />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}