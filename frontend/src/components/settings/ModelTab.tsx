'use client'

import { useState } from 'react'
import { MUTED, monoFont, sansFont } from '../../theme'

export default function ModelTab() {
  const [modelType, setModelType] = useState('1.7B')
  const [temperature, setTemperature] = useState('0.7')

  return (
    <div>
      <h3 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>
        AI Model Configuration
      </h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
          Model Type
        </label>
        <select
          value={modelType}
          onChange={e => setModelType(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(180,200,255,0.2)',
            borderRadius: 6,
            fontFamily: sansFont,
            fontSize: 13,
            color: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="1.7B">Qwen3-1.7B (Fast)</option>
          <option value="4B">Qwen3-4B (High Quality)</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: MUTED, marginBottom: 8, fontFamily: monoFont }}>
          Temperature: {temperature}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={e => setTemperature(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}