import Sidebar from './Sidebar'

interface MainLayoutProps {
  agentCount: number
  children: React.ReactNode
}

export default function MainLayout({ agentCount, children }: MainLayoutProps) {
  return (
    <div style={{ position: 'relative' }}>
      <Sidebar agentCount={agentCount} />
      <main style={{ 
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}