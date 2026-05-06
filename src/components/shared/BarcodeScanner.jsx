/**
 * BarcodeScanner — camera-based barcode scanner with UPC product lookup.
 *
 * Props:
 *   onDetected({ barcode, brand, model, title }) — called when a product is found
 *   onClose()  — called when the user cancels
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

// ── Design tokens (match the rest of the app) ─────────────────────────────────
const CYAN  = 'var(--ds-cyan, #00e5ff)'
const LIME  = 'var(--ds-lime, #c6ff00)'
const GOOD  = 'var(--ds-good, #69ff47)'
const CRIT  = 'var(--ds-crit, #ff4444)'
const TEXT1 = 'var(--ds-text-primary, #f0f0f0)'
const TEXT2 = 'var(--ds-text-secondary, #a0a0a0)'
const DIM   = 'var(--ds-dim, #666)'
const BORDER= 'var(--ds-border, rgba(255,255,255,0.08))'
const SURFACE = 'var(--ds-surface, #1a1a1a)'
const BG    = 'var(--ds-bg, #111)'

// ── UPC product lookup (free tier — 100 req/day, no API key) ─────────────────
async function lookupBarcode(upc) {
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.items || data.items.length === 0) return null
    const item = data.items[0]
    return {
      brand: item.brand  || '',
      model: item.model  || '',
      title: item.title  || '',
    }
  } catch {
    return null
  }
}

// ── Status stages ─────────────────────────────────────────────────────────────
const STAGE = {
  SCANNING: 'scanning',
  LOOKING_UP: 'looking_up',
  FOUND: 'found',
  NOT_FOUND: 'not_found',
  ERROR: 'error',
}

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef    = useRef(null)
  const readerRef   = useRef(null)
  const detectedRef = useRef(false) // prevent double-trigger

  const [stage, setStage]         = useState(STAGE.SCANNING)
  const [barcode, setBarcode]     = useState('')
  const [result, setResult]       = useState(null)  // { brand, model, title }
  const [cameras, setCameras]     = useState([])
  const [cameraIdx, setCameraIdx] = useState(0)

  // ── Stop scanner cleanly ──────────────────────────────────────────────────
  const stopReader = useCallback(() => {
    try { readerRef.current?.reset() } catch {}
  }, [])

  // ── Start scanning with the given camera ─────────────────────────────────
  const startScanner = useCallback(async (deviceId) => {
    if (!videoRef.current) return
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader
    detectedRef.current = false
    setStage(STAGE.SCANNING)

    try {
      await reader.decodeFromVideoDevice(
        deviceId || undefined,
        videoRef.current,
        async (scanResult, err) => {
          if (detectedRef.current) return
          if (!scanResult) return  // no barcode in this frame — ignore

          // ── Barcode detected ──────────────────────────────────────────────
          detectedRef.current = true
          stopReader()
          const code = scanResult.getText()
          setBarcode(code)
          setStage(STAGE.LOOKING_UP)

          const product = await lookupBarcode(code)
          if (product) {
            setResult(product)
            setStage(STAGE.FOUND)
          } else {
            setStage(STAGE.NOT_FOUND)
          }
        }
      )
    } catch (e) {
      console.error('Scanner error:', e)
      setStage(STAGE.ERROR)
    }
  }, [stopReader])

  // ── Enumerate cameras on mount ────────────────────────────────────────────
  useEffect(() => {
    BrowserMultiFormatReader.listVideoInputDevices()
      .then(devices => {
        setCameras(devices)
        // Prefer rear camera
        const rearIdx = devices.findIndex(d =>
          /back|rear|environment/i.test(d.label)
        )
        const idx = rearIdx >= 0 ? rearIdx : 0
        setCameraIdx(idx)
        startScanner(devices[idx]?.deviceId)
      })
      .catch(() => setStage(STAGE.ERROR))

    return () => stopReader()
  }, []) // eslint-disable-line

  // ── Switch camera ─────────────────────────────────────────────────────────
  const switchCamera = () => {
    if (cameras.length < 2) return
    const next = (cameraIdx + 1) % cameras.length
    setCameraIdx(next)
    stopReader()
    setStage(STAGE.SCANNING)
    detectedRef.current = false
    startScanner(cameras[next].deviceId)
  }

  // ── Confirm detected product ──────────────────────────────────────────────
  const confirm = () => {
    onDetected({
      barcode,
      brand: result?.brand || '',
      model: result?.model || result?.title || '',
    })
    stopReader()
    onClose()
  }

  // ── Use just the barcode (product not in DB) ──────────────────────────────
  const useBarcode = () => {
    onDetected({ barcode, brand: '', model: '' })
    stopReader()
    onClose()
  }

  // ── Retry scanning ────────────────────────────────────────────────────────
  const retry = () => {
    detectedRef.current = false
    setBarcode('')
    setResult(null)
    startScanner(cameras[cameraIdx]?.deviceId)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { stopReader(); onClose() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          animation: 'bsFadeIn 0.15s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: SURFACE,
        borderRadius: '20px 20px 0 0',
        border: `1px solid ${BORDER}`, borderBottom: 'none',
        maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
        animation: 'bsSlideUp 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: CYAN }}>barcode_scanner</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT1 }}>Scan Part Barcode</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {cameras.length > 1 && stage === STAGE.SCANNING && (
              <button onClick={switchCamera} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: TEXT2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>flip_camera_ios</span>
              </button>
            )}
            <button onClick={() => { stopReader(); onClose() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, display: 'flex', padding: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>
        <div style={{ height: '1px', background: BORDER }} />

        {/* Camera viewport */}
        <div style={{ position: 'relative', background: '#000', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            style={{
              width: '100%', display: 'block',
              maxHeight: '55dvh', objectFit: 'cover',
              opacity: stage === STAGE.SCANNING ? 1 : 0.35,
              transition: 'opacity 0.3s',
            }}
            playsInline
            muted
          />

          {/* Scan frame overlay */}
          {stage === STAGE.SCANNING && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ position: 'relative', width: '220px', height: '120px' }}>
                {/* Corner markers */}
                {[
                  { top: 0, left: 0, borderTop: `2px solid ${CYAN}`, borderLeft: `2px solid ${CYAN}` },
                  { top: 0, right: 0, borderTop: `2px solid ${CYAN}`, borderRight: `2px solid ${CYAN}` },
                  { bottom: 0, left: 0, borderBottom: `2px solid ${CYAN}`, borderLeft: `2px solid ${CYAN}` },
                  { bottom: 0, right: 0, borderBottom: `2px solid ${CYAN}`, borderRight: `2px solid ${CYAN}` },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: '20px', height: '20px', borderRadius: '2px', ...s }} />
                ))}
                {/* Scan line animation */}
                <div style={{
                  position: 'absolute', left: '4px', right: '4px', height: '1.5px',
                  background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
                  animation: 'scanLine 1.8s ease-in-out infinite',
                  boxShadow: `0 0 6px ${CYAN}`,
                }} />
              </div>
            </div>
          )}

          {/* Status overlay */}
          {stage !== STAGE.SCANNING && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}>
              {stage === STAGE.LOOKING_UP && (
                <>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: `3px solid ${BORDER}`, borderTop: `3px solid ${CYAN}`, animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: '12px', color: TEXT2 }}>Looking up product…</span>
                  <span style={{ fontSize: '10px', color: DIM, fontFamily: 'monospace' }}>{barcode}</span>
                </>
              )}
              {stage === STAGE.FOUND && (
                <span className="material-symbols-outlined" style={{ fontSize: '56px', color: GOOD }}>check_circle</span>
              )}
              {stage === STAGE.NOT_FOUND && (
                <span className="material-symbols-outlined" style={{ fontSize: '56px', color: TEXT2 }}>search_off</span>
              )}
              {stage === STAGE.ERROR && (
                <span className="material-symbols-outlined" style={{ fontSize: '56px', color: CRIT }}>no_photography</span>
              )}
            </div>
          )}
        </div>

        {/* Result panel */}
        <div style={{ padding: '16px 20px 36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {stage === STAGE.SCANNING && (
            <p style={{ fontSize: '11px', color: DIM, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              Point the camera at the barcode on the part's packaging.<br />
              It will scan automatically.
            </p>
          )}

          {stage === STAGE.LOOKING_UP && (
            <p style={{ fontSize: '11px', color: DIM, textAlign: 'center', margin: 0 }}>
              Checking product database…
            </p>
          )}

          {stage === STAGE.FOUND && result && (
            <>
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: `color-mix(in srgb, ${GOOD} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${GOOD} 22%, transparent)` }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: GOOD, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>Product Found</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT1 }}>{result.title || [result.brand, result.model].filter(Boolean).join(' ')}</div>
                {result.brand && <div style={{ fontSize: '11px', color: TEXT2, marginTop: '3px' }}>Brand: <b style={{ color: TEXT1 }}>{result.brand}</b></div>}
                {result.model && <div style={{ fontSize: '11px', color: TEXT2 }}>Model: <b style={{ color: TEXT1 }}>{result.model}</b></div>}
                <div style={{ fontSize: '9px', color: DIM, marginTop: '6px', fontFamily: 'monospace' }}>UPC: {barcode}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={retry} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Scan Again</button>
                <button onClick={confirm} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: LIME, color: '#000', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                  Use This Product
                </button>
              </div>
            </>
          )}

          {stage === STAGE.NOT_FOUND && (
            <>
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: `color-mix(in srgb, ${TEXT2} 8%, transparent)`, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: TEXT2, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '4px' }}>Not in Database</div>
                <div style={{ fontSize: '12px', color: TEXT1 }}>Product not found — fill in brand &amp; model manually.</div>
                <div style={{ fontSize: '9px', color: DIM, marginTop: '6px', fontFamily: 'monospace' }}>UPC: {barcode}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={retry} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Scan Again</button>
                <button onClick={useBarcode} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: 'transparent', color: CYAN, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Fill Manually</button>
              </div>
            </>
          )}

          {stage === STAGE.ERROR && (
            <>
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: `color-mix(in srgb, ${CRIT} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${CRIT} 22%, transparent)` }}>
                <div style={{ fontSize: '12px', color: CRIT }}>Camera not available. Please allow camera access and try again.</div>
              </div>
              <button onClick={() => { stopReader(); onClose() }} style={{ padding: '11px', borderRadius: '10px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT2, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </>
          )}
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 8px; opacity: 0.3; }
          50%  { opacity: 1; }
          100% { top: calc(100% - 8px); opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
