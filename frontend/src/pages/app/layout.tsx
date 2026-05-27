import { Outlet } from 'react-router-dom'
import { AppProvider } from '../../context/AppProvider'
import Navbar from '../../components/layout/Navbar'
import { NAVY } from '../../theme'

export default function AppLayout() {
  return (
    <AppProvider>
      <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
        {/* Global Navbar */}
        <Navbar />
        
        {/* Main Content */}
        <main style={{ 
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
          paddingTop: 80,
        }}>
          <Outlet />
        </main>
      </div>
    </AppProvider>
  )
}