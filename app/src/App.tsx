import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { AdminLayout } from './components/layout/AdminLayout'
import { ProtectedRoute } from './components/ui/ProtectedRoute'

import { Home } from './pages/Home'
import { About } from './pages/About'
import { Sermons } from './pages/Sermons'
import { SermonDetail } from './pages/SermonDetail'
import { Events } from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import { Give } from './pages/Give'
import { Prayer } from './pages/Prayer'
import { Announcements } from './pages/Announcements'
import { Gallery } from './pages/Gallery'
import { Auth } from './pages/Auth'
import { Profile } from './pages/Profile'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { PastorDashboard } from './pages/pastor/PastorDashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/sermons" element={<Sermons />} />
              <Route path="/sermons/:id" element={<SermonDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/give" element={<Give />} />
              <Route path="/prayer" element={<Prayer />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin & Pastor — own layout, no public header/footer */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/pastor/*" element={
                <ProtectedRoute requiredRole={['pastor', 'admin']}>
                  <PastorDashboard />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
