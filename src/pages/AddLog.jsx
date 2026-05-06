import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import BarcodeScanner from '../components/shared/BarcodeScanner'

const serviceTypes = [
  { label: 'Engine Oil', icon: 'oil_barrel', match: ['oil'] },
  { label: 'Tire Replacement', icon: 'tire_repair', match: ['tire'] },
  { label: 'Brake Service', icon: 'disc_full', match: ['brake', 'pad', 'rotor', 'fluid'] },
  { label: 'Air Filter', icon: 'air', match: ['air filter'] },
  { label: 'Spark Plugs', icon: 'bolt', match: ['spark plug'] },
  { label: 'Chain & Sprocket', icon: 'sync_alt', match: ['chain', 'sprocket', 'belt', 'cvt'] },
  { label: 'Valve Clearance', icon: 'settings', match: ['valve'] },
  { label: 'Coolant Flush', icon: 'water_drop', match: ['coolant', 'radiator'] },
  { label: 'Other', icon: 'build_circle', match: [] },
]

/* ── Shared input style ── */
const inputStyle = {
  width: '100%',
  background: 'var(--ds-input)',
  border: '1px solid var(--ds-border)',
  borderRadius: '10px',
  padding: '13px 14px',
  color: 'var(--ds-text-primary)',
  fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-text-muted)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

function GlassGroup({ title, children }) {
  return (
    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ds-neon-cyan)', opacity: 0.7 }}>
        {title}
      </span>
      {children}
    </div>
  )
}

export default function AddLog() {
  const navigate   = useNavigate()
  const { bikeId } = useParams()

  const [customTitle, setCustomTitle] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [date,        setDate]        = useState('')
  const [odometer,    setOdometer]    = useState('')
  const [notes,       setNotes]       = useState('')
  const [cost,        setCost]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState(null)
  // QA-3: store the File object locally; upload only happens during submit
  const [imageFile,   setImageFile]   = useState(null)   // raw File
  const [imagePreview, setImagePreview] = useState(null) // object URL for preview
  const [uploadingImage, setUploadingImage] = useState(false)
  // QA-8: prevent double-back navigation after success auto-redirect
  const didNavigateRef = useRef(false)

  const [components, setComponents] = useState([])
  // QA-9: track which component IDs were auto-selected by a tag (so we can reverse on deselect)
  const autoSelectedByTag = useRef({}) // { [tagLabel]: [compId, ...] }
  const [selectedComponentsData, setSelectedComponentsData] = useState({}) // { [id]: { brand, model } }
  const [newModifications, setNewModifications] = useState([]) // [{ id: uuid, category, componentType, brand, model }]
  const [currentBikeOdo, setCurrentBikeOdo] = useState(null)
  const [odoFetchFailed, setOdoFetchFailed] = useState(false)
  const [odoMode, setOdoMode] = useState('current') // 'current' | 'manual'
  const [scanningModId, setScanningModId] = useState(null) // which new-part row is being scanned

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/vehicles/${bikeId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          if (d.data.components) setComponents(d.data.components)
          setCurrentBikeOdo(d.data.odometer)
          if (d.data.odometer != null) setOdometer(d.data.odometer.toString())
        }
      })
      .catch(e => {
        if (e.name !== 'AbortError') {
          console.error('Failed to fetch vehicle:', e)
          setOdoFetchFailed(true)
        }
      })
    return () => controller.abort()
  }, [bikeId])

  // QA-8: only navigate back if we haven't already (prevents double-back on device back button)
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        if (!didNavigateRef.current) {
          didNavigateRef.current = true
          navigate(-1)
        }
      }, 1800)
    }
    return () => clearTimeout(timer)
  }, [success, navigate])

  // QA-3: preview only — actual upload deferred to handleSubmit
  const handleImagePick = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.')
      return
    }
    // Revoke previous object URL to avoid memory leaks
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    const finalTitle = [...selectedTags, customTitle].filter(Boolean).join(' + ')
    if (!finalTitle || !date) return

    // QA-2 frontend: block submission if manual odo is below the known current reading
    if (odoMode === 'manual' && odometer && currentBikeOdo != null && Number(odometer) < currentBikeOdo) {
      setError(`Odometer cannot be less than current reading (${currentBikeOdo.toLocaleString()} km).`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      // QA-3: upload image NOW (at submit time), not when the file was picked
      let committedImageUrl = undefined
      if (imageFile) {
        setUploadingImage(true)
        const formData = new FormData()
        formData.append('image', imageFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const upData = await upRes.json()
        setUploadingImage(false)
        if (!upData.success) throw new Error(upData.error || 'Image upload failed')
        committedImageUrl = upData.imageUrl
      }

      const res = await fetch(`/api/vehicles/${bikeId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          logType: 'service',
          date,
          odometerAtLog: odoMode === 'current' && currentBikeOdo != null ? currentBikeOdo : (odometer ? Number(odometer) : undefined),
          description: notes || undefined,
          cost: cost ? Number(cost) : undefined,
          updatedComponents: Object.keys(selectedComponentsData).length > 0
            ? Object.entries(selectedComponentsData).map(([id, data]) => ({ id, brand: data.brand || null, model: data.model || null }))
            : undefined,
          newComponents: newModifications.length > 0 ? newModifications : undefined,
          imageUrl: committedImageUrl,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to save log')
      setSuccess(true)
    } catch (err) {
      // QA-10: surface a user-friendly message and allow retry
      const msg = err.message === 'Failed to fetch'
        ? 'Network error — check your connection and try again.'
        : err.message
      setError(msg)
      setUploadingImage(false)
    } finally {
      setSubmitting(false)
    }
  }

  const focusBorder = (e) => {
    e.target.style.borderColor = 'var(--ds-neon-cyan)'
    e.target.style.boxShadow = '0 0 0 3px var(--ds-neon-cyan-dim)'
  }
  const blurBorder = (e) => {
    e.target.style.borderColor = 'var(--ds-border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="fade-in cockpit-grid" style={{ minHeight: '100dvh', background: 'var(--ds-bg)' }}>

      {/* App Bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: '12px',
        height: '56px', padding: '0 20px',
        background: 'var(--ds-glass-bg)',
        borderBottom: '1px solid var(--ds-glass-border)',
        backdropFilter: 'blur(24px)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ds-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-primary)', lineHeight: 1 }}>
            Log Service
          </h1>
          <p style={{ fontSize: '10px', color: 'var(--ds-text-muted)', marginTop: '2px' }}>Commit a maintenance record</p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--ds-text-muted)' }}>build_circle</span>
      </header>

      <main style={{ padding: '20px 16px 120px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── Log Title & Quick Tags ── */}
          <GlassGroup title="Service Title">
            <Field label="Log Title / Custom Note">
              <input
                type="text" placeholder="e.g. Used premium synthetic oil"
                value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                maxLength={255}
                required={selectedTags.length === 0}
                style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}
              />
            </Field>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-text-muted)' }}>
                Quick Tags
              </span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
                {serviceTypes.map(({ label, icon, match }) => {
                  const active = selectedTags.includes(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        if (active) {
                          // QA-9: deselect tag AND remove only the components that were auto-added by this tag
                          setSelectedTags(prev => prev.filter(t => t !== label))
                          const autoIds = autoSelectedByTag.current[label] || []
                          if (autoIds.length > 0) {
                            setSelectedComponentsData(prev => {
                              const next = { ...prev }
                              autoIds.forEach(id => delete next[id])
                              return next
                            })
                            delete autoSelectedByTag.current[label]
                          }
                        } else {
                          setSelectedTags(prev => [...prev, label])
                          // Auto-select matching components and remember which ones we touched
                          if (match && match.length > 0) {
                            const idsToSelect = components
                              .filter(c => {
                                const typeStr = (c.component_type || '').toLowerCase()
                                const catStr  = (c.category || '').toLowerCase()
                                return match.some(w => typeStr.includes(w) || catStr.includes(w))
                              })
                              .map(c => c.id)
                            if (idsToSelect.length > 0) {
                              // Only remember IDs that weren't already manually selected
                              setSelectedComponentsData(prev => {
                                const next = { ...prev }
                                const newlyAdded = []
                                idsToSelect.forEach(id => {
                                  if (!next[id]) {
                                    const comp = components.find(c => c.id === id)
                                    next[id] = { brand: comp?.brand || '', model: comp?.model || '' }
                                    newlyAdded.push(id)
                                  }
                                })
                                autoSelectedByTag.current[label] = newlyAdded
                                return next
                              })
                            }
                          }
                        }
                      }}
                      style={{
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '999px',
                        border: `1px solid ${active ? 'var(--ds-neon-cyan)' : 'var(--ds-border)'}`,
                        background: active ? 'var(--ds-neon-cyan-dim)' : 'transparent',
                        color: active ? 'var(--ds-neon-cyan)' : 'var(--ds-text-secondary)',
                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
                        cursor: 'pointer',
                        boxShadow: active ? '0 0 10px var(--ds-neon-cyan-glow)' : 'none',
                        transition: 'all 0.18s',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </GlassGroup>

          {/* ── Date & Odometer ── */}
          <GlassGroup title="Date & Mileage">
            <Field label="Date of Service">
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)} required
                max={new Date().toISOString().split('T')[0]}
                style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}
              />
            </Field>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ds-text-muted)' }}>
                Mileage at Service
              </span>
              
              <div style={{ display: 'flex', gap: '8px', background: 'var(--ds-surface)', padding: '4px', borderRadius: '12px', border: '1px solid var(--ds-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOdoMode('current');
                    if (currentBikeOdo != null) setOdometer(currentBikeOdo.toString());
                  }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    background: odoMode === 'current' ? 'var(--ds-surface-active)' : 'transparent',
                    color: odoMode === 'current' ? 'var(--ds-text-primary)' : 'var(--ds-text-secondary)',
                    fontWeight: 800, fontSize: '11px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: odoMode === 'current' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  CURRENT ({currentBikeOdo ?? '...'} km)
                </button>
                <button
                  type="button"
                  onClick={() => setOdoMode('manual')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    background: odoMode === 'manual' ? 'var(--ds-surface-active)' : 'transparent',
                    color: odoMode === 'manual' ? 'var(--ds-text-primary)' : 'var(--ds-text-secondary)',
                    fontWeight: 800, fontSize: '11px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: odoMode === 'manual' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  MANUAL ENTRY
                </button>
              </div>

              {odoMode === 'manual' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                  <input
                    type="number" placeholder="e.g. 12440" min="0" step="any"
                    value={odometer} onChange={e => setOdometer(e.target.value)}
                    style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', marginTop: '4px' }}
                    onFocus={focusBorder} onBlur={blurBorder}
                    autoFocus
                  />
                  {/* QA-2: inline warning before hitting the network */}
                  {odometer && currentBikeOdo != null && Number(odometer) < currentBikeOdo && (
                    <p style={{ fontSize: '11px', color: 'var(--ds-amber)', marginTop: '6px', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span>
                      Reading is below current odometer ({currentBikeOdo.toLocaleString()} km)
                    </p>
                  )}
                  {/* QA-12: warn if the vehicle data failed to load */}
                  {odoFetchFailed && (
                    <p style={{ fontSize: '11px', color: 'var(--ds-amber)', marginTop: '6px', lineHeight: 1.4 }}>
                      ⚠ Could not load current odometer — enter manually.
                    </p>
                  )}
                  <p style={{ fontSize: '10px', color: 'var(--ds-text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                    Enter the exact odometer reading from when the service was performed (e.g. last week).
                  </p>
                </motion.div>
              )}
            </div>
          </GlassGroup>

          {/* ── Component Resets (Upgrades) ── */}
          {components.length > 0 && (
            <GlassGroup title="Reset Lifeline (Replaced Parts)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {components.map(c => {
                  const selected = !!selectedComponentsData[c.id]
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: '8px',
                        padding: '10px 14px', borderRadius: '8px',
                        background: selected ? 'var(--ds-neon-cyan-dim)' : 'var(--ds-surface)',
                        border: `1px solid ${selected ? 'var(--ds-neon-cyan)' : 'var(--ds-border)'}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        onClick={() => {
                          const compName = c.component_type;
                          setSelectedComponentsData(prev => {
                            const next = { ...prev }
                            if (next[c.id]) {
                              setSelectedTags(tags => tags.filter(t => t !== compName));
                              delete next[c.id];
                            } else {
                              setSelectedTags(tags => tags.includes(compName) ? tags : [...tags, compName]);
                              next[c.id] = { brand: c.brand || '', model: c.model || '' };
                            }
                            return next;
                          });
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: selected ? 'var(--ds-neon-cyan)' : 'var(--ds-text-primary)' }}>{c.component_type}</div>
                          <div style={{ fontSize: '10px', color: 'var(--ds-text-muted)' }}>{c.brand} · {c.category}</div>
                        </div>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                          border: `1.5px solid ${selected ? 'var(--ds-neon-cyan)' : 'var(--ds-text-muted)'}`,
                          background: selected ? 'var(--ds-neon-cyan)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {selected && <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#000', fontWeight: 800 }}>check</span>}
                        </div>
                      </div>
                      
                      {selected && (
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0, 238, 255, 0.2)' }}>
                          <input
                            type="text" placeholder="Brand" value={selectedComponentsData[c.id].brand}
                            onChange={e => setSelectedComponentsData(prev => ({ ...prev, [c.id]: { ...prev[c.id], brand: e.target.value } }))}
                            style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.2)' }}
                          />
                          <input
                            type="text" placeholder="Model" value={selectedComponentsData[c.id].model}
                            onChange={e => setSelectedComponentsData(prev => ({ ...prev, [c.id]: { ...prev[c.id], model: e.target.value } }))}
                            style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px', background: 'rgba(0,0,0,0.2)' }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </GlassGroup>
          )}

          {/* ── New Modifications ── */}
          <GlassGroup title="New Modifications / Accessories">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {newModifications.map((mod) => (
                <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '8px', background: 'var(--ds-surface)', border: '1px solid var(--ds-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ds-text-primary)' }}>New Part / Accessory</span>
                    <button type="button" onClick={() => setNewModifications(prev => prev.filter(m => m.id !== mod.id))} style={{ background: 'none', border: 'none', color: 'var(--ds-red)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={mod.category}
                      onChange={e => setNewModifications(prev => prev.map(m => m.id === mod.id ? { ...m, category: e.target.value } : m))}
                      style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px', flex: 1, color: mod.category === 'Accessory' ? 'var(--ds-text-muted)' : 'var(--ds-text-primary)' }}
                    >
                      <option value="Accessory">Accessory (Permanent)</option>
                      <option value="Engine">Engine</option>
                      <option value="Tires">Tires</option>
                      <option value="Brakes">Brakes</option>
                      <option value="Oils">Oils & Fluids</option>
                      <option value="Electronics">Electronics</option>
                    </select>
                    <input type="text" placeholder="Part Type (e.g. LED Lights)" value={mod.componentType} onChange={e => setNewModifications(prev => prev.map(m => m.id === mod.id ? { ...m, componentType: e.target.value } : m))} style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px', flex: 2 }} required />
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanningModId(mod.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '8px 12px', borderRadius: '8px',
                      border: '1px solid var(--ds-neon-cyan, #00e5ff)30',
                      background: 'color-mix(in srgb, var(--ds-neon-cyan, #00e5ff) 5%, transparent)',
                      color: 'var(--ds-neon-cyan, #00e5ff)', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>barcode_scanner</span>
                    Scan Barcode
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Brand" value={mod.brand} onChange={e => setNewModifications(prev => prev.map(m => m.id === mod.id ? { ...m, brand: e.target.value } : m))} style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px' }} />
                    <input type="text" placeholder="Model" value={mod.model} onChange={e => setNewModifications(prev => prev.map(m => m.id === mod.id ? { ...m, model: e.target.value } : m))} style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px' }} />
                  </div>
                  {mod.category !== 'Accessory' && (
                    <input
                      type="number" placeholder="Lifespan / Replace Every (km) - Optional" value={mod.threshold}
                      onChange={e => setNewModifications(prev => prev.map(m => m.id === mod.id ? { ...m, threshold: e.target.value } : m))}
                      style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px' }}
                    />
                  )}
                </div>
              ))}
              {/* QA-7: use crypto.randomUUID() to prevent millisecond collisions */}
              <button
                type="button"
                disabled={newModifications.length >= 20}
                onClick={() => setNewModifications(prev => [...prev, { id: crypto.randomUUID(), category: 'Accessory', componentType: '', brand: '', model: '', threshold: '' }])}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px', borderRadius: '8px', border: '1px dashed var(--ds-border)',
                  background: 'transparent', color: 'var(--ds-text-secondary)', fontSize: '11px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
                ADD NEW PART
              </button>
            </div>
          </GlassGroup>

          {/* ── Receipt / Part Image — QA-3 & QA-4 ── */}
          <GlassGroup title="Part / Receipt Photo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {imagePreview ? (
                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ds-border)' }}>
                  <img src={imagePreview} alt="Selected part" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '8px', left: '10px', background: 'rgba(0,0,0,0.55)', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>
                    STAGED — uploads on commit
                  </div>
                  <button type="button" onClick={clearImage} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              ) : (
                // QA-4: two separate triggers — camera (mobile) and file-browse (desktop)
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '20px 12px', border: '1px dashed var(--ds-border)', borderRadius: '12px', background: 'var(--ds-surface)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'var(--ds-neon-cyan)' }}>photo_camera</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Camera</span>
                    {/* capture="environment" restricts to camera only on mobile */}
                    <input type="file" accept="image/*" capture="environment" onChange={handleImagePick} style={{ display: 'none' }} />
                  </label>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '20px 12px', border: '1px dashed var(--ds-border)', borderRadius: '12px', background: 'var(--ds-surface)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'var(--ds-neon-cyan)' }}>attach_file</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Browse Files</span>
                    {/* No capture attr — opens normal file picker on all platforms */}
                    <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
                  </label>
                </div>
              )}
            </div>
          </GlassGroup>

          {/* ── Details ── */}
          <GlassGroup title="Details">
            <Field label="Parts / Notes">
              <textarea
                placeholder="Describe the work done, parts used…"
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={3}
                maxLength={5000}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={focusBorder} onBlur={blurBorder}
              />
            </Field>
            <Field label="Cost (PHP)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--ds-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>₱</span>
                <input
                  type="number" placeholder="0.00" min="0" step="0.01"
                  value={cost} onChange={e => setCost(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 30, fontFamily: "'JetBrains Mono', monospace" }}
                  onFocus={focusBorder} onBlur={blurBorder}
                />
              </div>
            </Field>
          </GlassGroup>

          {/* Error — QA-10: Retry button + friendly message */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--ds-red)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ flex: 1 }}>{error}</span>
              <button
                type="button"
                onClick={() => handleSubmit(null)}
                style={{ flexShrink: 0, padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: 'var(--ds-red)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}
              >
                RETRY
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || (!customTitle && selectedTags.length === 0) || !date}
            className="glow-pulse"
            style={{
              width: '100%', height: '54px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              borderRadius: '12px', border: 'none', cursor: (!customTitle && selectedTags.length === 0) || !date ? 'not-allowed' : 'pointer',
              background: success ? 'var(--ds-green)' : ((customTitle || selectedTags.length > 0) && date) ? 'var(--ds-primary)' : 'var(--ds-surface-active)',
              color: ((customTitle || selectedTags.length > 0) && date) ? '#000' : 'var(--ds-text-muted)',
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
              fontFamily: "'Barlow Condensed', sans-serif",
              transition: 'background 0.3s',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {success ? (
              <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>LOG COMMITTED</>
            ) : submitting ? (
              'COMMITTING...'
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>COMMIT LOG</>
            )}
          </button>
        </form>
      </main>

      {/* ── Barcode Scanner Modal — applies to the active new-part row ── */}
      {scanningModId && (
        <BarcodeScanner
          onDetected={({ brand, model }) => {
            setNewModifications(prev => prev.map(m =>
              m.id === scanningModId
                ? { ...m, brand: brand || m.brand, model: model || m.model }
                : m
            ))
            setScanningModId(null)
          }}
          onClose={() => setScanningModId(null)}
        />
      )}

    </div>
  )
}
