import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom'
import './App.css'
import api from './lib/axios'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import UsersManager from './pages/UsersManager'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import WikiEditor from './pages/WikiEditor'
import PagesManager from './pages/PagesManager'
import CategoriesManager from './pages/CategoriesManager'
import GlobalManager from './pages/GlobalManager'
import PageView from './pages/PageView'
import SystemSettings from './pages/SystemSettings'
import MaintenancePage from './pages/MaintenancePage'






function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkUser = async () => {
      // Check maintenance status first
      try {
        const maintRes = await api.get('/maintenance');
        if (maintRes.data.maintenance) {
          setMaintenanceMode(true);
          setMaintenanceMessage(maintRes.data.message);
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

  const isLoginPage = location.pathname === '/login';

  // Maintenance Check: Block if maintenance is ON, NOT on login page, AND (User is NOT admin OR User is Guest)
  if (maintenanceMode && !isLoginPage && (!user || user.role !== 'admin')) {
    return <MaintenancePage message={maintenanceMessage} onLogout={user ? handleLogout : () => navigate('/login')} />;
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
