'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, LineSeries, LineStyle } from 'lightweight-charts'
import type { UTCTimestamp, IChartApi, IPriceLine, MouseEventParams } from 'lightweight-charts'
import { useMarketPrices, type Market } from '../../../hooks'

const WHITE = '#ffffff'
const MUTED = 'rgba(180,200,255,0.6)'
const CYAN = '#3EC4C0'
const UPPER_COLOR = '#EC4899' // pink for upper bound (range mode)

// How many pixels away from the line counts as "close enough to grab"
const DRAG_THRESHOLD_PX = 6

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

  // Which line is being dragged: null | 1 | 2
  const draggingRef = useRef<null | 1 | 2>(null)

  const [strike1, setStrike1] = useState<number | null>(null)
  const [strike2, setStrike2] = useState<number | null>(null)

  const { history, loading } = useMarketPrices(market.oracle_id, timeRange, 9000)

  // Get initial strike from market data
  const initialStrike = market.odds?.strikeK ?? 0

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
      crosshair: { mode: 0 }, // disabled
      rightPriceScale: { 
        borderColor: 'rgba(255,255,255,0.08)' 
      },
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
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // ── Load series data ───────────────────────────────────────────────────
  useEffect(() => {
    if (!seriesRef.current || !history?.prices?.length) return
    const chartData = history.prices.map(p => ({
      time: (p.time / 1000) as UTCTimestamp,
      value: Number(p.price),
    }))
    seriesRef.current.setData(chartData)
    chartRef.current?.timeScale().fitContent()
  }, [history])

  // ── Create price lines only once (use initial strike from market) ────
  useEffect(() => {
    const series = seriesRef.current
    if (!series || !history?.prices?.length || linesInitializedRef.current) return

    // Remove existing lines if any
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

  // ── Drag logic via chart mouse events ─────────────────────────────────
  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series) return

    const getLinePrice = (line: IPriceLine | null): number | null => {
      if (!line) return null
      return (line as any).options?.()?.price ?? null
    }

    const onMouseDown = (params: MouseEventParams) => {
      if (!params.point) return
      const priceToCoord = series.priceToCoordinate.bind(series)

      const p1 = getLinePrice(strikeLine1Ref.current)
      const p2 = getLinePrice(strikeLine2Ref.current)

      const coord1 = p1 !== null ? priceToCoord(p1) : null
      const coord2 = p2 !== null ? priceToCoord(p2) : null

      const dist1 = coord1 !== null ? Math.abs(params.point.y - coord1) : Infinity
      const dist2 = coord2 !== null ? Math.abs(params.point.y - coord2) : Infinity

      if (dist1 < DRAG_THRESHOLD_PX && dist1 <= dist2) {
        draggingRef.current = 1
      } else if (dist2 < DRAG_THRESHOLD_PX) {
        draggingRef.current = 2
      }

      if (draggingRef.current && chartContainerRef.current) {
        chartContainerRef.current.style.cursor = 'ns-resize'
      }
    }

    const onMouseMove = (params: MouseEventParams) => {
      if (!params.point) return
      const priceToCoord = series.priceToCoordinate.bind(series)
      const coordToPrice = series.coordinateToPrice.bind(series)

      // Hover cursor hint
      if (draggingRef.current === null) {
        const p1 = getLinePrice(strikeLine1Ref.current)
        const p2 = getLinePrice(strikeLine2Ref.current)
        const c1 = p1 !== null ? priceToCoord(p1) : null
        const c2 = p2 !== null ? priceToCoord(p2) : null
        const near =
          (c1 !== null && Math.abs(params.point.y - c1) < DRAG_THRESHOLD_PX) ||
          (c2 !== null && Math.abs(params.point.y - c2) < DRAG_THRESHOLD_PX)
        if (chartContainerRef.current) {
          chartContainerRef.current.style.cursor = near ? 'ns-resize' : 'default'
        }
        return
      }

      const newPrice = coordToPrice(params.point.y)
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

    const onMouseUp = () => {
      draggingRef.current = null
      if (chartContainerRef.current) {
        chartContainerRef.current.style.cursor = 'default'
      }
    }

    chart.subscribeClick(onMouseDown)
    chart.subscribeCrosshairMove(onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // For actual drag (mousedown + move without click), attach to container
    const container = chartContainerRef.current
    const handleMouseDown = (e: MouseEvent) => {
      // Convert raw mouse coords to chart point via bounding rect
      if (!container || !series) return
      const rect = container.getBoundingClientRect()
      const y = e.clientY - rect.top
      const priceToCoord = series.priceToCoordinate.bind(series)

      const p1 = getLinePrice(strikeLine1Ref.current)
      const p2 = getLinePrice(strikeLine2Ref.current)
      const c1 = p1 !== null ? priceToCoord(p1) : null
      const c2 = p2 !== null ? priceToCoord(p2) : null
      const d1 = c1 !== null ? Math.abs(y - c1) : Infinity
      const d2 = c2 !== null ? Math.abs(y - c2) : Infinity

      if (d1 < DRAG_THRESHOLD_PX && d1 <= d2) draggingRef.current = 1
      else if (d2 < DRAG_THRESHOLD_PX) draggingRef.current = 2

      if (draggingRef.current) {
        container.style.cursor = 'ns-resize'
        e.preventDefault() // prevent chart pan while dragging line
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current === null || !container || !series) return
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

    container?.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      chart.unsubscribeClick(onMouseDown)
      chart.unsubscribeCrosshairMove(onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      container?.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
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