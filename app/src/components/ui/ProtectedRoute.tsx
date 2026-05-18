import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types/database'

interface Props {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

const Spinner = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d1f0d', gap: '16px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid rgba(217,119,6,0.2)', borderTopColor: '#d97706', animation: 'spin 0.8s linear infinite' }} />
    <p style={{ color: '#d97706', fontSize: '0.875rem' }}>Loading...</p>
  </div>
)

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, role, loading, profileLoading } = useAuth()
  const location = useLocation()

  // Still doing initial session check
  if (loading) return <Spinner />

  // Not logged in → send to auth
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />

  // Logged in but profile/role not yet fetched → wait
  if (profileLoading || (requiredRole && role === null)) return <Spinner />

  // Role check
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowed.includes(role!)) return <Navigate to="/" replace />
  }

  return <>{children}</>
}
