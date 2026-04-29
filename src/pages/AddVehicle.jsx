import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AmberButton from '../components/shared/AmberButton'
import { Field, StyledInput, StyledSelect, FormGroup } from '../components/shared/FormUtils'
import Cropper from 'react-easy-crop'

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


const makes = [
  'Yamaha', 'Ducati', 'Honda', 'Kawasaki', 'Suzuki', 'BMW', 'Triumph', 'KTM', 'Harley-Davidson', 'Indian', 'Aprilia', 'Other'
]

const categories = [
  'Naked / Streetfighter', 'Sportbike', 'Cruiser', 'Adventure / Touring', 'Scrambler', 'Cafe Racer', 'Dirt / Enduro', 'Scooter', 'Other'
]

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
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000000', // Test user ID
          make,
          model,
          year: parseInt(year),
          category,
          odometer: parseInt(odometer) || 0,
          imageUrl: image, 
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add vehicle')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        navigate(`/setup-vehicle/${data.data.id}`)
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
            <Field label="Make">
              <StyledSelect value={make} onChange={(e) => setMake(e.target.value)}>
                <option value="" disabled style={{ background: 'var(--ds-surface)' }}>Select make…</option>
                {makes.map((m) => (
                  <option key={m} value={m} style={{ background: 'var(--ds-surface)' }}>{m}</option>
                ))}
              </StyledSelect>
            </Field>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <Field label="Model">
                <StyledInput placeholder="e.g. MT-07" value={model} onChange={(e) => setModel(e.target.value)} />
              </Field>
              <Field label="Year">
                <StyledInput type="number" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} />
              </Field>
            </div>
          </FormGroup>

          <FormGroup title="Specifications">
            <Field label="Category / Style">
              <StyledSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="" disabled style={{ background: 'var(--ds-surface)' }}>Select category…</option>
                {categories.map((c) => (
                  <option key={c} value={c} style={{ background: 'var(--ds-surface)' }}>{c}</option>
                ))}
              </StyledSelect>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <Field label="Initial Odometer">
                <StyledInput type="number" placeholder="e.g. 4500" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
              </Field>
            </div>
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
