import { useState, useEffect, useRef } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit-react'
import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import { dAppKit } from '../../dapp-kit'
import './ConnectWallet.css'

export default function ConnectWallet() {
  const account = useCurrentAccount()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleDisconnect = async () => {
    await dAppKit.disconnectWallet()
    setShowDropdown(false)
  }

  // Disconnected state - use ConnectButton
  if (!account) {
    return (
      <div className="connect-wallet">
        <ConnectButton />
      </div>
    )
  }

  // Connected state - like "More" button style
  return (
    <div className="connect-wallet" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          padding: '8px 14px',
          background: showDropdown ? 'rgba(255,255,255,0.08)' : 'transparent',
          border: '1px solid transparent',
          borderRadius: 10,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!showDropdown) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          }
        }}
        onMouseLeave={(e) => {
          if (!showDropdown) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: 'rgba(180,200,255,0.6)',
            letterSpacing: '0.02em',
          }}
        >
          {truncateAddress(account.address)}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="rgba(180,200,255,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {showDropdown && (
        <div className="wallet-dropdown">
          <button className="wallet-dropdown-item" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}