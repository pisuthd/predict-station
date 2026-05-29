'use client'

import { type OrderBook as OrderBookType } from '../../../hooks'
import { getCoinIcon } from '../../../lib/coinIcons'

const GREEN = '#22c55e'
const RED = '#ef4444'
const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'

interface OrderBookProps {
  orderBook: OrderBookType | null
  loading: boolean
  baseAsset?: string
  quoteAsset?: string
}

export function OrderBook({ orderBook, loading, baseAsset, quoteAsset }: OrderBookProps) {
  const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(4)
    return price.toFixed(6)
  }

  const formatQuantity = (qty: number): string => {
    if (qty >= 1000) return qty.toFixed(0)
    if (qty >= 1) return qty.toFixed(2)
    return qty.toFixed(4)
  }

  // Calculate max total for depth visualization
  const maxTotal = Math.max(
    ...(orderBook?.bids.map(b => b.total) || []),
    ...(orderBook?.asks.map(a => a.total) || [])
  )

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        color: MUTED,
        gap: 16,
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: `2px solid rgba(62,196,192,0.2)`,
          borderTopColor: CYAN,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
          Loading order book
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!orderBook) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        color: MUTED,
        fontSize: 13,
      }}>
        Select a trading pair
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header with icons and name */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left: Icons + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {baseAsset && quoteAsset && (
            <div style={{ position: 'relative', width: 40, height: 20 }}>
              <img 
                src={getCoinIcon(baseAsset)} 
                alt={baseAsset}
                style={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%',
                  border: '2px solid #0a0a1a',
                  position: 'absolute',
                  left: 0,
                  zIndex: 2,
                }}
              />
              <img 
                src={getCoinIcon(quoteAsset)} 
                alt={quoteAsset}
                style={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%',
                  border: '2px solid #0a0a1a',
                  position: 'absolute',
                  left: 10,
                  zIndex: 1,
                }}
              />
            </div>
          )}
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: WHITE,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {baseAsset}/{quoteAsset}
          </span>
        </div>
        
        {/* Right: Spread */}
        <span style={{
          fontSize: 10,
          color: MUTED,
          fontFamily: "'Space Mono', monospace",
        }}>
          Spread: {orderBook.spreadPercent.toFixed(3)}%
        </span>
      </div>

      {/* Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        padding: '8px 16px',
        fontSize: 10,
        color: MUTED,
        fontFamily: "'Space Mono', monospace",
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span>Price</span>
        <span style={{ textAlign: 'right' }}>Size</span>
        <span style={{ textAlign: 'right' }}>Total</span>
      </div>

      {/* Asks (reversed, lowest at bottom) */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Asks section */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          {orderBook.asks.slice().reverse().map((ask, idx) => (
            <OrderBookRow
              key={`ask-${idx}`}
              price={ask.price}
              quantity={ask.quantity}
              total={ask.total}
              maxTotal={maxTotal}
              type="ask"
              formatPrice={formatPrice}
              formatQuantity={formatQuantity}
            />
          ))}
        </div>

        {/* Mid Price */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(62,196,192,0.1)',
          borderTop: '1px solid rgba(62,196,192,0.2)',
          borderBottom: '1px solid rgba(62,196,192,0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            color: WHITE,
            fontFamily: "'Space Mono', monospace",
          }}>
            {formatPrice(orderBook.midPrice)}
          </span>
        </div>

        {/* Bids section */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {orderBook.bids.map((bid, idx) => (
            <OrderBookRow
              key={`bid-${idx}`}
              price={bid.price}
              quantity={bid.quantity}
              total={bid.total}
              maxTotal={maxTotal}
              type="bid"
              formatPrice={formatPrice}
              formatQuantity={formatQuantity}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface OrderBookRowProps {
  price: number
  quantity: number
  total: number
  maxTotal: number
  type: 'bid' | 'ask'
  formatPrice: (price: number) => string
  formatQuantity: (qty: number) => string
}

function OrderBookRow({ price, quantity, total, maxTotal, type, formatPrice, formatQuantity }: OrderBookRowProps) {
  const color = type === 'bid' ? GREEN : RED
  const depthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8,
      padding: '4px 16px',
      fontSize: 11,
      fontFamily: "'Space Mono', monospace",
      position: 'relative',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent'
    }}
    >
      {/* Depth bar background */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: `${depthPercent}%`,
        background: type === 'bid' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        pointerEvents: 'none',
      }} />
      
      {/* Price */}
      <span style={{ color, position: 'relative', zIndex: 1 }}>
        {formatPrice(price)}
      </span>
      
      {/* Size */}
      <span style={{ color: WHITE, textAlign: 'right', position: 'relative', zIndex: 1 }}>
        {formatQuantity(quantity)}
      </span>
      
      {/* Total */}
      <span style={{ color: MUTED, textAlign: 'right', position: 'relative', zIndex: 1 }}>
        {formatQuantity(total)}
      </span>
    </div>
  )
}