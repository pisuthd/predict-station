'use client'

import { AppProvider, useApp } from '../../context/AppProvider'
import Sidebar from '../../components/sidebar/Sidebar'
import TopNavBar from '../../components/TopNavBar'
import ConnectNodeModal from '../../components/ConnectNodeModal'
import ModelSelectorModal from '../../components/ModelSelectorModal'
import LoadingScreenModal from '../../components/LoadingScreenModal'
import { NAVY } from '../../theme'

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { step } = useApp()

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: NAVY }}>
      <TopNavBar />
      <Sidebar />
      
      {/* Modals based on step */}
      {step === 'select-model' && <ModelSelectorModal />}
      {step === 'loading-model' && <LoadingScreenModal />}
      
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AppProvider>
  )
}