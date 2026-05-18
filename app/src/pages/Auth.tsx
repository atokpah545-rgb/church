import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Enter your full name'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

const field: React.CSSProperties = {
  width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', outline: 'none', fontSize: '0.875rem',
  background: 'rgba(22,101,52,0.1)', border: '1px solid rgba(217,119,6,0.2)', color: '#f0fdf4', boxSizing: 'border-box',
}

export function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPw, setShowPw] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const { user, role, signIn, signUp } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) })

  if (user) {
    const dest = role === 'admin' ? '/admin' : role === 'pastor' ? '/pastor' : (from === '/auth' ? '/' : from)
    return <Navigate to={dest} replace />
  }

  async function handleLogin(data: LoginData) {
    setServerError('')
    const { error } = await signIn(data.email, data.password)
    if (error) setServerError(error.message)
  }

  async function handleRegister(data: RegisterData) {
    setServerError('')
    const { error } = await signUp(data.email, data.password, data.fullName)
    if (error) setServerError(error.message)
    else setSuccess('Account created! Please check your email to verify your account.')
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px 80px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#166534,#d97706)', color: '#fff', margin: '0 auto 16px' }}>F</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#f0fdf4', marginBottom: '4px' }}>Fruit of Africa</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Member Portal</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderRadius: '12px', padding: '4px', marginBottom: '24px', background: 'rgba(22,101,52,0.1)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setServerError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', textTransform: 'capitalize', border: 'none', transition: 'all 0.2s',
                  background: mode === m ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'transparent',
                  color: mode === m ? '#0d1f0d' : '#9ca3af',
                }}>
                {m === 'login' ? 'Sign In' : 'Join Us'}
              </button>
            ))}
          </div>

          <div className="glass" style={{ borderRadius: '20px', padding: '36px' }}>
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                  onSubmit={loginForm.handleSubmit(handleLogin)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input {...loginForm.register('email')} type="email" placeholder="Email address" style={field} />
                    {loginForm.formState.errors.email && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{loginForm.formState.errors.email.message}</p>}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6b7280' }} />
                    <input {...loginForm.register('password')} type={showPw ? 'text' : 'password'} placeholder="Password" style={{ ...field, paddingRight: '44px' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '14px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {loginForm.formState.errors.password && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{loginForm.formState.errors.password.message}</p>}
                  </div>

                  {serverError && <p style={{ fontSize: '0.75rem', padding: '10px 14px', borderRadius: '10px', background: 'rgba(220,38,38,0.1)', color: '#fca5a5' }}>{serverError}</p>}

                  <button type="submit" disabled={loginForm.formState.isSubmitting}
                    style={{ padding: '13px', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d', border: 'none', opacity: loginForm.formState.isSubmitting ? 0.6 : 1 }}>
                    {loginForm.formState.isSubmitting ? <><Loader size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
                  </button>
                </motion.form>
              ) : (
                <motion.form key="register" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  onSubmit={registerForm.handleSubmit(handleRegister)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {success ? (
                    <p style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.9rem', lineHeight: 1.7, color: '#86efac' }}>{success}</p>
                  ) : (
                    <>
                      <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6b7280' }} />
                        <input {...registerForm.register('fullName')} placeholder="Full name" style={field} />
                        {registerForm.formState.errors.fullName && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{registerForm.formState.errors.fullName.message}</p>}
                      </div>

                      <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6b7280' }} />
                        <input {...registerForm.register('email')} type="email" placeholder="Email address" style={field} />
                        {registerForm.formState.errors.email && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{registerForm.formState.errors.email.message}</p>}
                      </div>

                      <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6b7280' }} />
                        <input {...registerForm.register('password')} type={showPw ? 'text' : 'password'} placeholder="Password (min 6 chars)" style={{ ...field, paddingRight: '44px' }} />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '14px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        {registerForm.formState.errors.password && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{registerForm.formState.errors.password.message}</p>}
                      </div>

                      <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6b7280' }} />
                        <input {...registerForm.register('confirmPassword')} type={showPw ? 'text' : 'password'} placeholder="Confirm password" style={field} />
                        {registerForm.formState.errors.confirmPassword && <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>{registerForm.formState.errors.confirmPassword.message}</p>}
                      </div>

                      {serverError && <p style={{ fontSize: '0.75rem', padding: '10px 14px', borderRadius: '10px', background: 'rgba(220,38,38,0.1)', color: '#fca5a5' }}>{serverError}</p>}

                      <button type="submit" disabled={registerForm.formState.isSubmitting}
                        style={{ padding: '13px', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#0d1f0d', border: 'none', opacity: registerForm.formState.isSubmitting ? 0.6 : 1 }}>
                        {registerForm.formState.isSubmitting ? <><Loader size={16} className="animate-spin" /> Creating Account...</> : 'Create Account'}
                      </button>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
