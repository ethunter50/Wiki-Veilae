import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom'
import './App.css'
import api from './lib/axios'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import UsersManager from './components/UsersManager'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './components/AdminDashboard'
import UserDashboard from './components/UserDashboard'
import WikiEditor from './components/WikiEditor'
import PagesManager from './components/PagesManager'
import CategoriesManager from './components/CategoriesManager'
import GlobalManager from './components/GlobalManager'
import PageView from './components/PageView'
import SystemSettings from './components/SystemSettings'
import MaintenancePage from './components/MaintenancePage'






function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkUser = async () => {
      // Check maintenance status first
      try {
        const maintRes = await api.get('/maintenance');
        // Store in window or state (using window for quick dirty global access, but state is better if we wrap)
        // For this single file component, let's just use a window property or a local state variable if we hoisted checking?
        // Actually, let's just use checking here.
        if (maintRes.data.maintenance) {
          (window as any).maintenanceMode = true;
          (window as any).maintenanceMessage = maintRes.data.message;
        }
      } catch (e) { console.error(e); }

      try {
        const response = await api.get('/user')
        setUser(response.data)
      } catch (err) {
        console.log('Not logged in')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    navigate('/')
  }

  const handleLogout = async () => {
    try {
      await api.post('/logout')
      setUser(null)
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fbfbfa] dark:bg-[#191919]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Maintenance Check - Strict Admin Only, but allow access to Login page
  // If user is stuck in maintenance (e.g. non-admin logged in), they should probably see maintenance, 
  // but if they explicitly go to /login (which redirects to / usually) it might be tricky.
  // Actually, if they are logged in, /login redirects to /.
  // So if they are non-admin and logged in, they are blocked on / (Maintenance).
  // But maybe they want to Logout?
  // We should pass a logout handler to MaintenancePage.

  const isLoginPage = location.pathname === '/login';

  if (!isLoginPage && user && user.role !== 'admin' && (window as any).maintenanceMode) {
    return <MaintenancePage message={(window as any).maintenanceMessage} onLogout={handleLogout} />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
      />

      <Route element={<ProtectedRoute user={user} />}>
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          {/* Default User View */}
          <Route path="/" element={<UserDashboard user={user} />} />
          <Route path="/pages/:slug" element={<PageView />} />

          {/* Strict Admin Routes */}
          <Route element={<ProtectedRoute user={user} requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/admin/users" element={<UsersManager onBack={() => navigate('/admin')} />} />
            <Route path="/admin/settings" element={<SystemSettings onBack={() => navigate('/admin')} />} />
          </Route>

          {/* Shared Admin/Documentaliste Routes */}
          <Route element={<ProtectedRoute user={user} requiredRole={user?.role === 'admin' || user?.role === 'documentaliste' ? user.role : 'admin'} />}>
            <Route path="/admin/categories" element={<CategoriesManager onBack={() => navigate(user.role === 'admin' ? '/admin' : '/')} />} />
            <Route path="/admin/global" element={<GlobalManager onBack={() => navigate(user.role === 'admin' ? '/admin' : '/')} />} />
            <Route path="/admin/pages" element={<PagesManager onBack={() => navigate(user.role === 'admin' ? '/admin' : '/')} onEditPage={(slug: string) => navigate(`/admin/pages/edit/${slug}`)} />} />
            <Route path="/admin/pages/create" element={<WikiEditor onBack={() => navigate(user.role === 'admin' ? '/admin' : '/')} />} />
            <Route path="/admin/pages/edit/:slug" element={<WikiEditor onBack={() => navigate('/admin/pages')} />} />
          </Route>





        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Layout helper to wrap protected content with Sidebar
const Layout = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  return (
    <div className="app-container">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="main-content custom-scrollbar">
        <Outlet />
      </main>
    </div>
  )
}

export default App
