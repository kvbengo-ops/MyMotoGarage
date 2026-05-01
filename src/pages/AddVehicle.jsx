import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AmberButton from '../components/shared/AmberButton'
import { Field, StyledInput, StyledSelect, FormGroup } from '../components/shared/FormUtils'
import Cropper from 'react-easy-crop'
import { BRAND_META, MAKES } from '../data/brandLogos'
import { searchModels, getSpec, getYearsForModel } from '../data/bikeSpecs'

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') 
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      blob.name = 'cropped.jpg'
      resolve(blob)
    }, 'image/jpeg')
  })
}


const categories = [
  'Naked / Streetfighter', 'Sportbike', 'Cruiser', 'Adventure / Touring', 'Scrambler', 'Cafe Racer', 'Dirt / Enduro', 'Scooter', 'Other'
]

/* ── Brand Picker Grid ── */
function BrandPickerGrid({ value, onChange }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--ds-text-secondary)', marginBottom: '10px',
      }}>Make</label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
      }}>
        {MAKES.map((make) => {
          const meta = BRAND_META[make]
          const isSelected = value === make
          return (
            <button
              key={make}
              type="button"
              onClick={() => onChange(make)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 8px 10px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: isSelected ? meta.bgColor : 'var(--ds-surface)',
                border: isSelected
                  ? `2px solid ${meta.color}`
                  : '1.5px solid var(--ds-border)',
                transition: 'all 0.18s ease',
                boxShadow: isSelected
                  ? `0 0 18px ${meta.bgColor}`
                  : 'none',
                minHeight: '84px',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = meta.color
                  e.currentTarget.style.background = meta.bgColor
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--ds-border)'
                  e.currentTarget.style.background = 'var(--ds-surface)'
                }
              }}
            >
              {/* Brand logo */}
              <div style={{
                width: '100%', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {meta.logo ? (
                  <img
                    src={meta.logo}
                    alt={make}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      filter: isSelected ? 'none' : 'brightness(0.6) invert(0.5)',
                      transition: 'filter 0.2s ease',
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined" style={{
                    fontSize: '26px',
                    color: isSelected ? meta.color : 'var(--ds-text-muted)',
                  }}>two_wheeler</span>
                )}
              </div>
              {/* Make name */}
              <span style={{
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isSelected ? meta.color : 'var(--ds-text-secondary)',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1,
              }}>
                {meta.shortName}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Image Upload Component ── */
function ImageUploadField({ image, onFileSelect }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      onFileSelect(imageUrl)
    }
  }

  // Ensure we show local blob preview or server uploaded image
  const previewUrl = image

  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--ds-text-secondary)', marginBottom: '8px',
      }}>Vehicle Photo</label>
      
      <div 
        onClick={() => fileInputRef.current.click()}
        style={{
          width: '100%', height: '200px',
          background: 'var(--ds-surface)',
          border: '1.5px dashed var(--ds-border-heavy)',
          borderRadius: '12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--ds-amber)'
          e.currentTarget.style.background = 'var(--ds-surface-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--ds-border-heavy)'
          e.currentTarget.style.background = 'var(--ds-surface)'
        }}
      >
        {image ? (
          <>
            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 onMouseEnter={e => e.currentTarget.style.opacity = 1}
                 onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#fff' }}>edit</span>
            </div>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--ds-text-muted)', marginBottom: '8px' }}>add_a_photo</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ds-text-secondary)' }}>Tap to upload photo</span>
            <span style={{ fontSize: '11px', color: 'var(--ds-text-muted)', marginTop: '4px' }}>PNG, JPG up to 5MB</span>
          </>
        )}
      </div>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
    </div>
  )
}


export default function AddVehicle() {
  const navigate = useNavigate()

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [category, setCategory] = useState('')
  const [odometer, setOdometer] = useState('')
  const [image, setImage] = useState(null)
  
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Model search state
  const [modelQuery, setModelQuery] = useState('')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [matchedSpec, setMatchedSpec] = useState(null)
  const modelRef = useRef(null)

  const modelSuggestions = searchModels(make, modelQuery)
  const availableYears = getYearsForModel(make, model)

  const handleMakeChange = (newMake) => {
    setMake(newMake)
    setModel('')
    setModelQuery('')
    setYear('')
    setCategory('')
    setMatchedSpec(null)
  }

  const handleModelSelect = (selectedModel) => {
    setModel(selectedModel)
    setModelQuery(selectedModel)
    setShowModelDropdown(false)
    const spec = getSpec(make, selectedModel)
    setMatchedSpec(spec)
    if (spec) {
      setCategory(spec.category)
      const years = getYearsForModel(make, selectedModel)
      if (years.length > 0) setYear(years[0].toString())
    }
  }

  const handleModelQueryChange = (e) => {
    const val = e.target.value
    setModelQuery(val)
    setShowModelDropdown(val.length > 0)
    if (!val) {
      setModel('')
      setMatchedSpec(null)
    }
  }

  // Cropper States
  const [tempImageSrc, setTempImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = (imageUrl) => {
    setTempImageSrc(imageUrl)
    setShowCropper(true)
  }

  const handleCropSave = async () => {
    try {
      setIsUploading(true)
      const croppedBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels)
      
      // Upload to backend
      const formData = new FormData()
      formData.append('image', croppedBlob, 'bike.jpg')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Image upload failed')
      }
      
      setImage(data.imageUrl)
      setShowCropper(false)
    } catch (err) {
      console.error('Error saving crop:', err)
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        userId: '00000000-0000-0000-0000-000000000000',
        make,
        model: model || modelQuery,
        year: parseInt(year),
        category,
        odometer: parseInt(odometer) || 0,
        imageUrl: image,
      }
      // Pass factory specs if we have a matched spec from the database
      if (matchedSpec) {
        payload.engineDisplacement = matchedSpec.cc
        payload.weight = matchedSpec.weight
        payload.fuelType = matchedSpec.fuelType
        payload.fuelCapacity = matchedSpec.fuelCapacity
        payload.fuelConsumption = matchedSpec.fuelConsumption
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add vehicle')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        navigate(`/`)
      }, 2000)
    } catch (err) {
      console.error('Add vehicle error:', err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ds-bg)' }}>

      {/* ── App Bar — 56px ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: '12px',
        height: '56px', padding: '0 20px',
        background: 'var(--ds-glass-bg)',
        borderBottom: `1px solid var(--ds-glass-border)`,
        backdropFilter: 'blur(20px)',
        transition: 'background-color 0.3s'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ds-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back</span>
        </button>
        <h1 style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-amber)' }}>
          Add Vehicle
        </h1>
      </header>

      {/* ── Form — 16px sides, 24px top, 16px between groups ── */}
      <main style={{ padding: '24px 16px 40px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <ImageUploadField image={image} onFileSelect={handleFileSelect} />

          <FormGroup title="Identification">
            <BrandPickerGrid value={make} onChange={handleMakeChange} />
            
            {/* Model search */}
            <div style={{ position: 'relative' }} ref={modelRef}>
              <Field label="Model">
                <StyledInput
                  placeholder={make ? `Search ${make} models…` : 'Select a brand first'}
                  value={modelQuery}
                  onChange={handleModelQueryChange}
                />
              </Field>
              {showModelDropdown && modelSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'var(--ds-surface)', border: '1px solid var(--ds-border)',
                  borderRadius: '0 0 12px 12px', maxHeight: '200px', overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                  {modelSuggestions.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleModelSelect(m)}
                      style={{
                        width: '100%', padding: '12px 16px', border: 'none',
                        background: 'transparent', color: 'var(--ds-text-primary)',
                        fontSize: '14px', textAlign: 'left', cursor: 'pointer',
                        borderBottom: '1px solid var(--ds-border)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--ds-surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontWeight: 700 }}>{m}</span>
                      {(() => { const s = getSpec(make, m); return s ? ` — ${s.cc}cc, ${s.category}` : '' })()}
                    </button>
                  ))}
                </div>
              )}
              {/* Allow custom model if not found */}
              {make && modelQuery && modelSuggestions.length === 0 && showModelDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'var(--ds-surface)', border: '1px solid var(--ds-border)',
                  borderRadius: '0 0 12px 12px', padding: '12px 16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                  <button
                    type="button"
                    onClick={() => { setModel(modelQuery); setShowModelDropdown(false); setMatchedSpec(null) }}
                    style={{
                      width: '100%', padding: '8px 0', border: 'none',
                      background: 'transparent', color: 'var(--ds-amber)',
                      fontSize: '13px', textAlign: 'left', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    + Use "{modelQuery}" as custom model
                  </button>
                </div>
              )}
            </div>

            {/* Year — dropdown if spec matched, manual input otherwise */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Year">
                {availableYears.length > 0 ? (
                  <StyledSelect value={year} onChange={(e) => setYear(e.target.value)}>
                    {availableYears.map(y => (
                      <option key={y} value={y} style={{ background: 'var(--ds-surface)' }}>{y}</option>
                    ))}
                  </StyledSelect>
                ) : (
                  <StyledInput type="number" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} />
                )}
              </Field>
              <Field label="Category / Style">
                {matchedSpec ? (
                  <div style={{
                    padding: '14px 16px', background: 'var(--ds-input)', border: '1.5px solid var(--ds-border)',
                    borderRadius: '8px', fontSize: '14px', color: 'var(--ds-text-primary)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--ds-green)' }}>check_circle</span>
                    {category}
                  </div>
                ) : (
                  <StyledSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="" disabled style={{ background: 'var(--ds-surface)' }}>Select…</option>
                    {categories.map((c) => (
                      <option key={c} value={c} style={{ background: 'var(--ds-surface)' }}>{c}</option>
                    ))}
                  </StyledSelect>
                )}
              </Field>
            </div>

            {/* Auto-filled specs badge */}
            {matchedSpec && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px',
                background: 'color-mix(in srgb, var(--ds-green) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ds-green) 25%, transparent)',
                borderRadius: '10px',
              }}>
                <span style={{ width: '100%', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-green)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
                  Factory specs auto-filled
                </span>
                {[`${matchedSpec.cc}cc`, `${matchedSpec.weight}kg`, matchedSpec.fuelType, `${matchedSpec.fuelCapacity}L tank`, `${matchedSpec.fuelConsumption} km/L`].map(tag => (
                  <span key={tag} style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    background: 'var(--ds-surface)', color: 'var(--ds-text-secondary)',
                    border: '1px solid var(--ds-border)',
                  }}>{tag}</span>
                ))}
              </div>
            )}
          </FormGroup>

          <FormGroup title="Odometer">
            <Field label="Initial Odometer (km)">
              <StyledInput type="number" placeholder="e.g. 4500" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
            </Field>
          </FormGroup>

          {error && (
            <div style={{ color: 'var(--ds-red)', fontSize: '12px', fontWeight: 600, padding: '8px', background: 'color-mix(in srgb, var(--ds-red) 10%, transparent)', borderRadius: '8px' }}>
              Error: {error}
            </div>
          )}

          <div style={{ marginTop: '8px' }}>
            <AmberButton icon="garage" disabled={isSubmitting}>
              {isSubmitting ? 'ADDING...' : 'ADD TO GARAGE'}
            </AmberButton>
          </div>

        </form>
      </main>

      {/* ── Toast ── */}
      {success && (
        <div style={{
          position: 'fixed', bottom: '96px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 20px', borderRadius: '9999px',
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
          color: '#4ade80', fontSize: '13px', fontWeight: 600,
          backdropFilter: 'blur(12px)', whiteSpace: 'nowrap', zIndex: 50,
        }}>
          <span className="material-symbols-filled" style={{ fontSize: '16px' }}>check_circle</span>
          Vehicle added successfully!
        </div>
      )}

      {/* ── Cropper Modal ── */}
      {showCropper && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '500px', background: 'var(--ds-surface)',
            borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--ds-border)'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 900, color: 'var(--ds-text-primary)', letterSpacing: '0.05em' }}>
              ADJUST PHOTO
            </h2>
            
            {/* Cropper Container */}
            <div style={{ position: 'relative', width: '100%', height: '250px', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Slider for Zoom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ds-text-secondary)', fontWeight: 600 }}>
                <span>ZOOM</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  width: '100%', accentColor: 'var(--ds-amber)',
                  background: 'var(--ds-surface-hover)', height: '6px', borderRadius: '3px',
                  appearance: 'none', cursor: 'pointer'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowCropper(false)}
                style={{
                  padding: '12px', background: 'transparent', border: '1px solid var(--ds-border)',
                  borderRadius: '12px', color: 'var(--ds-text-primary)', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ds-surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                CANCEL
              </button>
              <AmberButton
                type="button"
                onClick={handleCropSave}
                disabled={isUploading}
                icon="check"
              >
                {isUploading ? 'UPLOADING...' : 'CONFIRM CROP'}
              </AmberButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
