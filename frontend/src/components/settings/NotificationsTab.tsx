'use client'

import { useState } from 'react'
import { CYAN, sansFont } from '../../theme'

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState(true)

  return (
    <div>
      <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
        Notification Preferences
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(180,200,255,0.1)' }}>
        <span style={{ fontFamily: sansFont, fontSize: 13, color: '#fff' }}>
          Enable Notifications
        </span>
        <button
          onClick={() => setNotifications(!notifications)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: notifications ? CYAN : 'rgba(180,200,255,0.2)',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: notifications ? 23 : 3,
            transition: 'left 0.2s',
          }} />
        </button>
      </div>
    </div>
  )
}