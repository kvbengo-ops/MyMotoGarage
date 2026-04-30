import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useAnimation } from 'framer-motion'
import { BRAND_META } from '../../data/brandLogos'

const statusMap = {
  readyToRide: {
    label:       'READY TO RIDE',
    dot:         '#22C55E',
    ping:        '#22C55E',
    accentColor: '#22C55E',
    glowColor:   'rgba(34, 197, 94, 0.2)',
    actionLabel: 'View Dashboard',
  },
  serviceDue: {
    label:       'SERVICE DUE',
    dot:         '#EF4444',
    ping:        null,
    accentColor: '#EF4444',
    glowColor:   'rgba(239, 68, 68, 0.2)',
    actionLabel: 'View Alerts',
  },
  warning: {
    label:       'CHECK REQUIRED',
    dot:         '#C8FF00',
    ping:        '#C8FF00',
    accentColor: '#C8FF00',
    glowColor:   'rgba(200, 255, 0, 0.2)',
    actionLabel: 'View Alerts',
  },
  needsSetup: {
    label:       'AWAITING SETUP',
    dot:         '#38BDF8',
    ping:        '#38BDF8',
    accentColor: '#38BDF8',
    glowColor:   'rgba(56, 189, 248, 0.2)',
    actionLabel: 'Setup Ride',
  },
}

export default function VehicleCard({ bike, onDelete }) {
  const navigate = useNavigate()
  const controls = useAnimation()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const s = statusMap[bike.status] || statusMap.readyToRide

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100) setShowConfirmModal(true)
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
  }

  const handleDeleteConfirm = () => {
    if (onDelete) onDelete(bike.id)
    setShowConfirmModal(false)
  }

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Delete background ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '10px',
        background: 'linear-gradient(90deg, transparent 20%, rgba(255,45,45,0.15) 60%, rgba(255,45,45,0.35) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingRight: '24px', zIndex: 0,
      }}>
        <span className="material-symbols-outlined" style={{ color: '#FF2D2D', fontSize: '26px' }}>delete</span>
      </div>

      <motion.article
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          position: 'relative', zIndex: 1,
          background: 'var(--ds-surface)',
          borderTop: '1px solid var(--ds-border)',
          borderRight: '1px solid var(--ds-border)',
          borderBottom: '1px solid var(--ds-border)',
          borderLeft: `3px solid ${s.accentColor}`,
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.07)',
        }}
      >
        {/* ── Image — 16:9 ── */}
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
          <img
            src={bike.image} alt={bike.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* Cinematic gradient — always dark over image for readability */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)' }} />
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${s.accentColor}, transparent 70%)` }} />

          {/* Brand Logo Badge — bottom left */}
          {(() => {
            const meta = BRAND_META[bike.make] || null
            if (!meta) return null
            return (
              <div style={{
                position: 'absolute', bottom: '12px', left: '12px',
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 10px 5px 8px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(14px)',
                border: `1px solid ${meta.color}33`,
              }}>
                {meta.logo ? (
                  <img
                    src={meta.logo}
                    alt={bike.make}
                    style={{ height: '16px', width: 'auto', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '13px', fontWeight: 900, letterSpacing: '0.04em',
                    color: meta.color, lineHeight: 1,
                  }}>
                    {meta.abbrev}
                  </span>
                )}
              </div>
            )
          })()}

          {/* Status badge — top right, angular */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '5px 10px', borderRadius: '3px',
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderLeft: `2px solid ${s.accentColor}`,
            }}>
              <span style={{ position: 'relative', display: 'flex', width: '5px', height: '5px', flexShrink: 0 }}>
                {s.ping && <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: s.ping, opacity: 0.9 }} />}
                <span style={{ position: 'relative', width: '5px', height: '5px', borderRadius: '50%', background: s.dot, display: 'block', boxShadow: `0 0 8px ${s.dot}` }} />
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: s.dot, fontFamily: "'DM Sans', sans-serif" }}>
                {s.label}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '14px 18px 18px' }}>

          {/* Category */}
          <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: s.accentColor, marginBottom: '4px', opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}>
            {bike.category}
          </div>

          {/* Bike Name — Barlow Condensed */}
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '26px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--ds-text-primary)', marginBottom: '16px', lineHeight: 1 }}>
            {bike.name}
          </h3>

          {/* CTA Area */}
          {bike.status === 'needsSetup' ? (
            <button
              onClick={() => navigate(`/setup-vehicle/${bike.id}`)}
              style={{
                width: '100%', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                borderRadius: '6px', cursor: 'pointer',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.30)',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#38BDF8', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.14)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.50)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.30)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>build</span>
              COMPLETE SETUP
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* START RIDE */}
              <button
                onClick={() => {}}
                className="glow-pulse"
                style={{
                  width: '100%', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  borderRadius: '6px', cursor: 'pointer',
                  background: 'var(--ds-primary-subtle)',
                  border: '1px solid var(--ds-primary-glow)',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--ds-primary)', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,255,0,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--ds-primary-subtle)' }}
              >
                <span className="material-symbols-filled" style={{ fontSize: '18px' }}>two_wheeler</span>
                START RIDE
              </button>

              {/* VIEW BIKE */}
              <button
                onClick={() => navigate(`/bike/${bike.id}`)}
                style={{
                  width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  borderRadius: '6px', cursor: 'pointer',
                  background: 'transparent', border: '1px solid var(--ds-border)',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--ds-text-secondary)', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ds-surface-hover)'; e.currentTarget.style.color = 'var(--ds-text-primary)'; e.currentTarget.style.borderColor = 'var(--ds-border-heavy)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ds-text-secondary)'; e.currentTarget.style.borderColor = 'var(--ds-border)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                VIEW BIKE
              </button>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--ds-border)' }}>
            <div style={{ display: 'flex', align: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--ds-text-muted)' }}>speed</span>
              {bike.status === 'needsSetup' ? (
                <span style={{ fontSize: '12px', color: 'var(--ds-text-muted)', fontFamily: "'DM Sans', sans-serif" }}>—  km</span>
              ) : (
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--ds-text-secondary)', letterSpacing: '0.03em' }}>
                  {bike.odometer.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400 }}>KM</span>
                </span>
              )}
            </div>
            <button
              onClick={() => bike.status === 'needsSetup' ? navigate(`/setup-vehicle/${bike.id}`) : navigate(`/bike/${bike.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '2px',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: s.accentColor, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {s.actionLabel}
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </motion.article>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
          padding: '20px',
        }}>
          <div className="slide-up" style={{
            width: '100%', maxWidth: '340px',
            background: 'var(--ds-surface)',
            border: '1px solid var(--ds-border)',
            borderLeft: '3px solid #FF2D2D',
            borderRadius: '10px', padding: '28px 24px',
            display: 'flex', flexDirection: 'column', gap: '16px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
          }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FF2D2D', marginBottom: '8px', fontFamily: "'DM Sans', sans-serif" }}>Confirm Action</p>
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ds-text-primary)', lineHeight: 1.1 }}>
                Delete Vehicle?
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ds-text-secondary)', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              <strong style={{ color: 'var(--ds-text-primary)' }}>{bike.name}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '13px', background: 'transparent', border: '1px solid var(--ds-border)',
                  borderRadius: '6px', color: 'var(--ds-text-secondary)', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ds-border-heavy)'; e.currentTarget.style.color = 'var(--ds-text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ds-border)'; e.currentTarget.style.color = 'var(--ds-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '13px', background: 'rgba(255,45,45,0.12)', border: '1px solid rgba(255,45,45,0.4)',
                  borderRadius: '6px', color: '#FF2D2D', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,45,45,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,45,45,0.12)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
