'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, LineSeries, LineStyle } from 'lightweight-charts'
import type { UTCTimestamp, IChartApi, IPriceLine } from 'lightweight-charts'
import { useMarketPrices, type Market } from '../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'
const UPPER_COLOR = '#EC4899' // pink for upper bound (range mode)

const DRAG_THRESHOLD_PX = 8
export type MarketMode = 'binary' | 'range'

export interface StrikeValues {
  strike: number
  strikeUpper?: number
}

interface PriceChart2Props {
  market: Market
  timeRange?: number
  mode?: MarketMode
  onStrikeChange?: (values: StrikeValues) => void
}

export function PriceChart2({
  market,
  timeRange = 1800,
  mode = 'binary',
  onStrikeChange,
}: PriceChart2Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ReturnType<IChartApi['addSeries']> | null>(null)

  const strikeLine1Ref = useRef<IPriceLine | null>(null)
  const strikeLine2Ref = useRef<IPriceLine | null>(null)
  // Track if lines have been initialized
  const linesInitializedRef = useRef(false)


  // null = not dragging, 1 = dragging line1, 2 = dragging line2
  const draggingRef = useRef<null | 1 | 2>(null)
  // track pointer down state independently — not cleared by price-scale clicks
  const pointerDownRef = useRef(false)

  const [strike1, setStrike1] = useState<number | null>(null)
  const [strike2, setStrike2] = useState<number | null>(null)

  const { history, loading } = useMarketPrices(market.oracle_id, timeRange, 9000)

  // Get initial strike from market data
  const initialStrike = market.odds?.strikeK ?? 0


  const getLinePrice = (line: IPriceLine | null): number | null => {
    if (!line) return null
    try { return (line as any).options().price ?? null } catch { return null }
  }

  const notifyParent = useCallback(
    (s1: number | null, s2: number | null) => {
      if (!onStrikeChange || s1 === null) return
      onStrikeChange(
        mode === 'range' && s2 !== null
          ? { strike: Math.min(s1, s2), strikeUpper: Math.max(s1, s2) }
          : { strike: s1 },
      )
    },
    [mode, onStrikeChange],
  )

  // ── Create chart once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: MUTED,
        fontFamily: "'Space Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 280,
    })

    const lineSeries = chart.addSeries(LineSeries, {
      color: WHITE,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = lineSeries
    chart.timeScale().fitContent()

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize); chart.remove() }
  }, [])

  // ── Load series data ───────────────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !history?.prices?.length) return
    const data = history.prices.map(p => ({
      time: (p.time / 1000) as UTCTimestamp,
      value: Number(p.price),
    }))
    seriesRef.current.setData(data)
    chartRef.current?.timeScale().fitContent()
  }, [history])

  // ── Create / recreate price lines when data or mode changes ───────────
  useEffect(() => {
    const series = seriesRef.current
    if (!series || !history?.prices?.length  || linesInitializedRef.current) return

    if (strikeLine1Ref.current) {
      try { series.removePriceLine(strikeLine1Ref.current) } catch (_) {}
      strikeLine1Ref.current = null
    }
    if (strikeLine2Ref.current) {
      try { series.removePriceLine(strikeLine2Ref.current) } catch (_) {}
      strikeLine2Ref.current = null
    }

    // Use strikeK from market data, fallback to calculated value
    const useStrike = initialStrike > 0 
      ? initialStrike 
      : (() => {
          const prices = history.prices.map(p => Number(p.price))
          const midPrice = prices[Math.floor(prices.length / 2)]
          return parseFloat((midPrice * 0.99).toFixed(2))
        })()

    strikeLine1Ref.current = series.createPriceLine({
      price: useStrike,
      color: CYAN,
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: mode === 'binary' ? 'Strike' : 'Lower',
    })
    setStrike1(useStrike)

    if (mode === 'range') {
      // Calculate upper bound: strike + 100
      const init2 = parseFloat((useStrike + 100).toFixed(2))

      strikeLine2Ref.current = series.createPriceLine({
        price: init2,
        color: UPPER_COLOR,
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'Upper',
      })
      setStrike2(init2)
      notifyParent(useStrike, init2)
    } else {
      setStrike2(null)
      notifyParent(useStrike, null)
    }

    linesInitializedRef.current = true
  }, [history, mode, initialStrike]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag via pointer events on the wrapper div ─────────────────────────
  // We listen on the OUTER wrapper (not just the chart canvas) so that
  // dragging into the price-scale area doesn't kill the drag.
  // We use pointerdown/pointermove/pointerup so we can call setPointerCapture,
  // which means ALL pointer events go to this element until release — no
  // mouseup-on-price-scale problem.
  useEffect(() => {
    const wrapper = chartContainerRef.current?.parentElement as HTMLElement | null
    if (!wrapper) return

    const hitTest = (clientY: number): null | 1 | 2 => {
      const series = seriesRef.current
      const container = chartContainerRef.current
      if (!series || !container) return null

      const rect = container.getBoundingClientRect()
      const y = clientY - rect.top

      const p1 = getLinePrice(strikeLine1Ref.current)
      const p2 = getLinePrice(strikeLine2Ref.current)

      const c1 = p1 !== null ? series.priceToCoordinate(p1) : null
      const c2 = p2 !== null ? series.priceToCoordinate(p2) : null

      const d1 = c1 !== null ? Math.abs(y - (c1 as number)) : Infinity
      const d2 = c2 !== null ? Math.abs(y - (c2 as number)) : Infinity

      if (d1 < DRAG_THRESHOLD_PX && d1 <= d2) return 1
      if (d2 < DRAG_THRESHOLD_PX) return 2
      return null
    }

    const onPointerDown = (e: PointerEvent) => {
      const hit = hitTest(e.clientY)
      if (!hit) return

      draggingRef.current = hit
      pointerDownRef.current = true
      // Capture: all future pointer events come here until pointerup
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      wrapper.style.cursor = 'ns-resize'
      e.preventDefault()
    }

    const onPointerMove = (e: PointerEvent) => {
      const series = seriesRef.current
      const container = chartContainerRef.current
      if (!series || !container) return

      // Hover hint (when not dragging)
      if (!pointerDownRef.current) {
        const hit = hitTest(e.clientY)
        wrapper.style.cursor = hit ? 'ns-resize' : 'default'
        return
      }

      if (draggingRef.current === null) return

      // Convert clientY → price using chart pane bounding rect
      const rect = container.getBoundingClientRect()
      const y = e.clientY - rect.top
      const newPrice = series.coordinateToPrice(y as any)
      if (newPrice === null) return
      const rounded = parseFloat(newPrice.toFixed(2))

      if (draggingRef.current === 1 && strikeLine1Ref.current) {
        strikeLine1Ref.current.applyOptions({ price: rounded })
        setStrike1(rounded)
        notifyParent(rounded, getLinePrice(strikeLine2Ref.current))
      } else if (draggingRef.current === 2 && strikeLine2Ref.current) {
        strikeLine2Ref.current.applyOptions({ price: rounded })
        setStrike2(rounded)
        notifyParent(getLinePrice(strikeLine1Ref.current), rounded)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDownRef.current) return
      draggingRef.current = null
      pointerDownRef.current = false
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      wrapper.style.cursor = 'default'
    }

    wrapper.addEventListener('pointerdown', onPointerDown)
    wrapper.addEventListener('pointermove', onPointerMove)
    wrapper.addEventListener('pointerup', onPointerUp)
    wrapper.addEventListener('pointercancel', onPointerUp)

    return () => {
      wrapper.removeEventListener('pointerdown', onPointerDown)
      wrapper.removeEventListener('pointermove', onPointerMove)
      wrapper.removeEventListener('pointerup', onPointerUp)
      wrapper.removeEventListener('pointercancel', onPointerUp)
    }
  }, [mode, notifyParent])

  const fmt = (v: number | null) =>
    v === null ? '—' : v.toLocaleString(undefined, { maximumFractionDigits: 4 })

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        // wrapper needs position so pointer events from the price-scale
        // area still bubble up to it
        position: 'relative',
      }}
    >
      {/* Strike labels */}
      {!loading && history?.prices?.length ? (
        <div
          style={{
            display: 'flex',
            gap: 16,
            padding: '8px 16px 0',
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            userSelect: 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 24, height: 2, background: CYAN, display: 'inline-block', borderRadius: 1 }} />
            <span style={{ color: MUTED }}>{mode === 'binary' ? 'Strike' : 'Lower'}</span>
            <span style={{ color: CYAN, fontWeight: 600 }}>{fmt(strike1)}</span>
          </span>

          {mode === 'range' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 24, height: 2, background: UPPER_COLOR, display: 'inline-block', borderRadius: 1 }} />
              <span style={{ color: MUTED }}>Upper</span>
              <span style={{ color: UPPER_COLOR, fontWeight: 600 }}>{fmt(strike2)}</span>
            </span>
          )}

          <span style={{ marginLeft: 'auto', color: MUTED, fontSize: 11 }}>
            drag lines to set price
          </span>
        </div>
      ) : null}

      {/* Chart */}
      <div style={{ height: 280, position: 'relative' }}>
        {loading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, gap: 16 }}>
            <div style={{ width: 24, height: 24, border: '2px solid rgba(62,196,192,0.2)', borderTopColor: CYAN, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 12 }}>Loading chart</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !history?.prices?.length ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 13 }}>
            No chart data available
          </div>
        ) : null}

        <div
          ref={chartContainerRef}
          style={{
            width: '100%',
            height: '100%',
            opacity: loading || !history?.prices?.length ? 0.3 : 1,
          }}
        />
      </div>
    </div>
  )
}