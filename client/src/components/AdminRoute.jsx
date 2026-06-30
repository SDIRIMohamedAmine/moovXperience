import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { verifyAdminToken } from '../services/adminService'

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('checking') // 'checking' | 'valid' | 'invalid'

  useEffect(() => {
    verifyAdminToken().then((valid) => {
      setStatus(valid ? 'valid' : 'invalid')
    })
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (status === 'invalid') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
