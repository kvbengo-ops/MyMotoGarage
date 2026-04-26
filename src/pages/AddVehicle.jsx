import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AmberButton from '../components/shared/AmberButton'
import { Field, StyledInput, StyledSelect, FormGroup } from '../components/shared/FormUtils'

const makes = [
  'Yamaha', 'Ducati', 'Honda', 'Kawasaki', 'Suzuki', 'BMW', 'Triumph', 'KTM', 'Harley-Davidson', 'Indian', 'Aprilia', 'Other'
]

const categories = [
  'Naked / Streetfighter', 'Sportbike', 'Cruiser', 'Adventure / Touring', 'Scrambler', 'Cafe Racer', 'Dirt / Enduro', 'Scooter', 'Other'
]

/* ── Image Upload Component ── */
function ImageUploadField({ image, onImageChange }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      // Create a local object URL to preview the image
      const imageUrl = URL.createObjectURL(file)
      onImageChange(imageUrl)
    }
  }

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
            <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
  const [engine, setEngine] = useState('')
  const [odometer, setOdometer] = useState('')
  const [image, setImage] = useState(null)
  
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate API call to save vehicle
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      navigate('/')
    }, 2000)
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

          <ImageUploadField image={image} onImageChange={setImage} />

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Displacement (cc)">
                <StyledInput type="number" placeholder="e.g. 689" value={engine} onChange={(e) => setEngine(e.target.value)} />
              </Field>
              <Field label="Initial Odometer">
                <StyledInput type="number" placeholder="e.g. 4500" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
              </Field>
            </div>
          </FormGroup>

          <div style={{ marginTop: '8px' }}>
            <AmberButton icon="garage">ADD TO GARAGE</AmberButton>
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
    </div>
  )
}
