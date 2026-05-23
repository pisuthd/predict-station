'use client'

import { useApp } from '../context/AppProvider'
import ConnectNodeModal from './ConnectNodeModal'

export default function TopNavBar() {
  const { step } = useApp()

  // Hide when connected (model loaded)
  if (step === 'connected') {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 100,
      }}
    >
      <ConnectNodeModal />
    </div>
  )
}