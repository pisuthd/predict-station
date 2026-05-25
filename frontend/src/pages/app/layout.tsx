import { Outlet } from 'react-router-dom'
import { AppProvider } from '../../context/AppProvider'
import Sidebar from '../../components/layout/Sidebar'
import { NAVY } from '../../theme'

export default function AppLayout() {
  return (
    <AppProvider>
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}> 
        <Sidebar />
        <main style={{ 
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}>
          <Outlet />
        </main>
      </div>
    </AppProvider>
  )
}