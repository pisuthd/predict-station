'use client'

import PageWrapper from '../PageWrapper'
import { MUTED, monoFont } from '../../theme'

export default function CronJobs() {
  return (
    <PageWrapper title="Cron Jobs">
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: monoFont, fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Coming Soon
        </p>
        <h2 style={{ fontFamily: monoFont, fontSize: 20, color: '#fff', marginTop: 8 }}>
          Scheduled Tasks
        </h2>
        <p style={{ color: MUTED, fontSize: 13, marginTop: 12 }}>
          Configure automated tasks and cron jobs here.
        </p>
      </div>
    </PageWrapper>
  )
}