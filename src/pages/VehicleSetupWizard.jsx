import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AmberButton from '../components/shared/AmberButton'
import { Field, StyledInput, StyledSelect } from '../components/shared/FormUtils'

const steps = [
  { id: 'specs', title: 'Specifications' },
  { id: 'oil', title: 'Oil Telemetry' },
  { id: 'drive', title: 'Drive Health' },
  { id: 'tires', title: 'Tire Analytics' },
]

export default function VehicleSetupWizard() {
  const { bikeId } = useParams()
  const navigate = useNavigate()
  
  // Custom states for wizard
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  // Form states
  const [engineDisplacement, setEngineDisplacement] = useState('')
  const [weight, setWeight] = useState('')
  const [fuelType, setFuelType] = useState('Premium (91)')
  
  const [lastOilChangeDate, setLastOilChangeDate] = useState('')
  const [oilInterval, setOilInterval] = useState('6000')
  const [chainInterval, setChainInterval] = useState('500')
  const [tireAge, setTireAge] = useState('')
  const [tireLifespan, setTireLifespan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const goToNext = async () => {
    if (step < steps.length - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      // Configuration completed, submit to backend
      setIsSubmitting(true)
      setError(null)
      try {
        const response = await fetch(`/api/vehicles/${bikeId}/setup`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastOilChangeDate: lastOilChangeDate || null,
            oilInterval: parseInt(oilInterval),
            chainInterval: parseInt(chainInterval),
            tireAge: parseInt(tireAge) || null,
            tireLifespan: parseInt(tireLifespan) || null,
            engineDisplacement: parseInt(engineDisplacement) || null,
            weight: parseInt(weight) || null,
            fuelType: fuelType || null,
          }),
        })

        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to complete setup')
        }
        
        // Go to specific bike dashboard after setup
        navigate(`/bike/${bikeId}`)
      } catch (err) {
        console.error('Setup error:', err)
        setError(err.message)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const goToPrev = () => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    } else {
      navigate('/')
    }
  }

  // Animation variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  // The active step component logic
  let StepContent = null
  if (step === 0) {
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>Vehicle Specs</h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--ds-text-secondary)' }}>
            Let's get the core specifications for your machine.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Displacement (cc)">
              <StyledInput type="number" placeholder="e.g. 689" value={engineDisplacement} onChange={e => setEngineDisplacement(e.target.value)} />
            </Field>
            <Field label="Weight (lbs)">
              <StyledInput type="number" placeholder="e.g. 405" value={weight} onChange={e => setWeight(e.target.value)} />
            </Field>
          </div>
          <Field label="Fuel Type">
            <StyledSelect value={fuelType} onChange={e => setFuelType(e.target.value)}>
              <option value="Unleaded (87)">Unleaded (87)</option>
              <option value="Premium (91)">Premium (91)</option>
              <option value="Premium (93)">Premium (93)</option>
            </StyledSelect>
          </Field>
        </div>
      </div>
    )
  } else if (step === 1) {
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>Engine Oil Baseline</h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--ds-text-secondary)' }}>
            Let's dial in the baseline stats for your new machine. When was your last oil change, and what interval do you prefer?
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Last Oil Change Date">
            <StyledInput type="date" value={lastOilChangeDate} onChange={e => setLastOilChangeDate(e.target.value)} />
          </Field>
          <Field label="Ideal Interval">
            <StyledSelect value={oilInterval} onChange={e => setOilInterval(e.target.value)}>
              <option value="3000">Every 3,000 miles</option>
              <option value="4000">Every 4,000 miles</option>
              <option value="5000">Every 5,000 miles</option>
              <option value="6000">Every 6,000 miles (Factory Rec)</option>
            </StyledSelect>
          </Field>
        </div>
      </div>
    )
  } else if (step === 2) {
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>Drive Chain Setup</h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--ds-text-secondary)' }}>
            A clean chain is a happy chain. When do you want us to remind you to clean and lubricate it?
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Cleaning Frequency">
            <StyledSelect value={chainInterval} onChange={e => setChainInterval(e.target.value)}>
              <option value="300">Every 300 miles (Aggressive)</option>
              <option value="500">Every 500 miles (Standard)</option>
              <option value="800">Every 800 miles (Commuter)</option>
            </StyledSelect>
          </Field>
        </div>
      </div>
    )
  } else if (step === 3) {
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>Tire Lifecycle</h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--ds-text-secondary)' }}>
            Rubber side down. Track the age of your current tires to prevent riding on hardened compounds.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Current Tire Age (Months)">
            <StyledInput type="number" placeholder="e.g. 12" value={tireAge} onChange={e => setTireAge(e.target.value)} />
          </Field>
          <Field label="Expected Lifespan (Months)">
            <StyledInput type="number" placeholder="e.g. 36 (Typical Max 5 yrs)" value={tireLifespan} onChange={e => setTireLifespan(e.target.value)} />
          </Field>
          {error && step === steps.length - 1 && (
            <div style={{ color: 'var(--ds-red)', fontSize: '12px', fontWeight: 600, padding: '8px', background: 'color-mix(in srgb, var(--ds-red) 10%, transparent)', borderRadius: '8px', marginTop: '16px' }}>
              Error: {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ds-bg)', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Progress & App Bar ── */}
      <header className="px-5 pt-8 pb-4" style={{ background: 'var(--ds-bg)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={goToPrev} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--ds-surface)', cursor: 'pointer', color: 'var(--ds-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back_ios_new</span>
          </button>
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--ds-amber)' }}>SETUP: {steps[step].title}</span>
          <div style={{ width: '32px' }} /> {/* empty spacer for flex-between */}
        </div>

        {/* Unified Spotify-style segmented progress bar */}
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--ds-surface)' }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: idx < step ? '100%' : idx === step ? '100%' : '0%',
                  background: idx <= step ? 'var(--ds-amber)' : 'transparent',
                }}
              />
            </div>
          ))}
        </div>
      </header>

      {/* ── Slide Viewport ── */}
      <main className="flex-1 relative overflow-hidden px-5 py-8" style={{ display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            style={{ width: '100%', position: 'absolute', left: 0, padding: '0 20px', boxSizing: 'border-box' }}
          >
            {StepContent}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Sticky Action Button ── */}
      <div className="p-5" style={{ background: 'var(--ds-bg)', zIndex: 50 }}>
        <AmberButton
          onClick={goToNext}
          icon={step === steps.length - 1 ? 'task_alt' : 'arrow_forward'}
          disabled={isSubmitting}
        >
          {step === steps.length - 1 ? (isSubmitting ? 'SAVING...' : 'COMPLETE SETUP') : 'CONTINUE'}
        </AmberButton>
      </div>

    </div>
  )
}
