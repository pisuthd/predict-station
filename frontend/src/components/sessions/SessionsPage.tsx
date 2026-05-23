'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../../theme'
import { api } from '../../lib/api'
import { useApp } from '../../context/AppProvider'
import PageWrapper from '../PageWrapper'

interface Session {
  slug: string
  name: string
  agentSlug: string
  created: string
  lastActive?: string
  messagesCount?: number
}

interface Agent {
  slug: string
  name: string
}

export default function SessionsPage() {
  const router = useRouter()
  const { agents, isConnected } = useApp()
  const [sessions, setSessions] = useState<Session[]>([])
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [filter, setFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected) {
      loadAllSessions()
    }
  }, [isConnected])

  const loadAllSessions = async () => {
    setIsLoading(true)
    try {
      const all: Session[] = []
      for (const agent of agents) {
        const agentSessions = await api.agents.listSessions(agent.slug)
        all.push(...agentSessions.map(s => ({ ...s, agentSlug: agent.slug })))
      }
      // Sort by created date, newest first
      all.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      setAllSessions(all)
      setSessions(all)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (filter.trim()) {
      const lowerFilter = filter.toLowerCase()
      setSessions(allSessions.filter(s => 
        s.name.toLowerCase().includes(lowerFilter) ||
        s.agentSlug.toLowerCase().includes(lowerFilter)
      ))
    } else {
      setSessions(allSessions)
    }
  }, [filter, allSessions])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getAgentName = (agentSlug: string) => {
    const agent = agents.find(a => a.slug === agentSlug)
    return agent?.name || agentSlug
  }

  return (
    <PageWrapper title="Sessions">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Filter */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 12,
          padding: 16,
        }}>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter sessions..."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(180,200,255,0.2)',
              borderRadius: 8,
              fontFamily: sansFont,
              fontSize: 13,
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Sessions List */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(180,200,255,0.08)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 120px 80px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(180,200,255,0.08)',
          }}>
            <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Session</span>
            <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Agent</span>
            <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Last Active</span>
            <span style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>Actions</span>
          </div>

          {/* Sessions */}
          {isLoading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>No sessions found</p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={`${session.agentSlug}-${session.slug}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 120px 80px',
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(180,200,255,0.06)',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>📝</span>
                  <span style={{ fontFamily: sansFont, fontSize: 13, color: '#fff' }}>{session.name}</span>
                  {session.slug === 'main' && (
                    <span style={{ fontSize: 8, color: CYAN, background: 'rgba(62,196,192,0.15)', padding: '2px 6px', borderRadius: 4 }}>default</span>
                  )}
                </div>
                <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>{getAgentName(session.agentSlug)}</span>
                <span style={{ fontFamily: monoFont, fontSize: 11, color: MUTED }}>{formatTimeAgo(session.created)}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      // Navigate to chat page with selected agent/session
                      router.push(`/app/chat`)
                    }}
                    style={{
                      padding: '6px 12px',
                      background: CYAN,
                      border: 'none',
                      borderRadius: 4,
                      fontFamily: monoFont,
                      fontSize: 10,
                      fontWeight: 600,
                      color: NAVY,
                      cursor: 'pointer',
                    }}
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Count */}
        <p style={{ fontFamily: monoFont, fontSize: 10, color: MUTED, letterSpacing: '0.06em' }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>
    </PageWrapper>
  )
}