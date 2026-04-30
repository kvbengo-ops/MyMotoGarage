import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AmberButton from '../components/shared/AmberButton'
import { Field, StyledInput, StyledSelect } from '../components/shared/FormUtils'

const steps = [
  { id: 'core', title: 'General Info', category: null, image: null },
  { id: 'drivetrain', title: 'Drivetrain', category: 'Drivetrain', image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&q=80' },
  { id: 'tires', title: 'Tires', category: 'Tires', image: 'https://images.unsplash.com/photo-1629858718617-6d60ed6d3f2d?auto=format&fit=crop&q=80' },
  { id: 'brakes', title: 'Brakes', category: 'Brakes', image: 'https://images.unsplash.com/photo-1598402685715-db1485a3dc8f?auto=format&fit=crop&q=80' },
  { id: 'oils', title: 'Oils & Fluids', category: 'Oils', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80' },
]

const TIME_DEGRADING_PARTS = ['Tubeless Sealant', 'Suspension Fluid', 'Brake Fluid']

const CATEGORY_HINTS = {
  'Drivetrain': 'Hint: Add parts you want to monitor like your Drive Chain, Front/Rear Sprockets, or Clutch Cable.',
  'Tires': 'Hint: Track your Front and Rear Tires for tread life and replacement intervals.',
  'Brakes': 'Hint: Monitor your Front Brake Pads, Rear Brake Pads, Rotors, or Brake Fluid lifespan.',
  'Oils': 'Hint: Add fluids like Engine Oil, Gear Oil, or Coolant to stay on top of regular maintenance.'
}

const CATEGORY_PLACEHOLDERS = {
  'Drivetrain': { name: 'e.g. Drive Chain', brand: 'e.g. DID, Sunstar', model: 'e.g. 525 VX3' },
  'Tires': { name: 'e.g. Rear Tire', brand: 'e.g. Michelin', model: 'e.g. Road 6' },
  'Brakes': { name: 'e.g. Front Brake Pads', brand: 'e.g. Brembo, EBC', model: 'e.g. Sintered Double-H' },
  'Oils': { name: 'e.g. Engine Oil', brand: 'e.g. Motul, Liqui Moly', model: 'e.g. 7100 10W-40' }
}

function ComponentCard({ comp, updateComp, removeComp, bikeCondition }) {
  const isTimeDegrading = TIME_DEGRADING_PARTS.includes(comp.componentType)
  const ph = CATEGORY_PLACEHOLDERS[comp.category] || { name: 'e.g. Part Name', brand: 'e.g. Brand', model: 'e.g. Model' }

  return (
    <div style={{
      background: 'var(--ds-surface)', border: '1px solid var(--ds-border)', 
      borderRadius: '12px', padding: '16px', position: 'relative'
    }}>
      <button 
        onClick={removeComp}
        style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: 'var(--ds-red)', cursor: 'pointer' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
      </button>

      <div className="flex flex-col gap-4 mt-2">
        <Field label="Component Name">
          <StyledInput placeholder={ph.name} value={comp.componentType} onChange={e => updateComp({ componentType: e.target.value })} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Brand">
            <StyledInput placeholder={ph.brand} value={comp.brand} onChange={e => updateComp({ brand: e.target.value })} />
          </Field>
          <Field label="Model">
            <StyledInput placeholder={ph.model} value={comp.model} onChange={e => updateComp({ model: e.target.value })} />
          </Field>
        </div>

        <Field label="Replacement Threshold (km)">
          <StyledInput type="number" placeholder="e.g. 24000" value={comp.replacementThreshold} onChange={e => updateComp({ replacementThreshold: e.target.value })} />
        </Field>

        <Field label="Wear State">
          <div style={{ display: 'flex', background: 'var(--ds-bg)', borderRadius: '8px', padding: '4px' }}>
            {['Brand New', 'Currently Used'].map(state => (
              <button
                key={state}
                onClick={() => updateComp({ wearState: state })}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  background: comp.wearState === state ? 'var(--ds-surface-active)' : 'transparent',
                  color: comp.wearState === state ? 'var(--ds-text-primary)' : 'var(--ds-text-secondary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {state}
              </button>
            ))}
          </div>
          {bikeCondition === 'Brand New' && comp.wearState === 'Brand New' && (
            <div style={{ fontSize: '10px', color: 'var(--ds-green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>auto_awesome</span>
              Defaulted to new because bike is new.
            </div>
          )}
        </Field>

        {comp.wearState === 'Currently Used' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Field label="Current Usage (km)">
              <StyledInput type="number" placeholder="e.g. 500" value={comp.estimatedKmUsed} onChange={e => updateComp({ estimatedKmUsed: e.target.value })} />
            </Field>
          </motion.div>
        )}

        {isTimeDegrading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Field label="Last Service Date">
              <StyledInput type="date" value={comp.lastServiceDate} onChange={e => updateComp({ lastServiceDate: e.target.value })} />
            </Field>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function VehicleSetupWizard() {
  const { bikeId } = useParams()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 1: Core Specs
  const [bikeCondition, setBikeCondition] = useState('Used') // 'Brand New' or 'Used'
  const [ridingHabit, setRidingHabit] = useState('Weekend Warrior')
  const [engineDisplacement, setEngineDisplacement] = useState('')
  const [weight, setWeight] = useState('')
  const [fuelType, setFuelType] = useState('Standard (87)')
  const [fuelCapacity, setFuelCapacity] = useState('')
  const [fuelConsumption, setFuelConsumption] = useState('')
  
  // Steps 2+: Components
  const [components, setComponents] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const activeCategory = steps[step].category

  const addComponent = () => {
    setComponents(prev => [
      ...prev, 
      { 
        id: Math.random().toString(36).substring(2, 9), 
        category: activeCategory,
        componentType: '',
        brand: '',
        model: '',
        wearState: bikeCondition === 'Brand New' ? 'Brand New' : 'Currently Used',
        estimatedKmUsed: '',
        lastServiceDate: ''
      }
    ])
  }

  const updateComponent = (id, updates) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const removeComponent = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id))
  }

  const goToNext = async () => {
    if (step < steps.length - 1) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      setIsSubmitting(true)
      setError(null)
      try {
        const response = await fetch(`/api/vehicles/${bikeId}/setup`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engineDisplacement: parseInt(engineDisplacement) || null,
            weight: parseInt(weight) || null,
            fuelType: fuelType || null,
            fuelCapacity: parseFloat(fuelCapacity) || null,
            fuelConsumption: parseFloat(fuelConsumption) || null,
            bikeCondition,
            ridingHabit,
            components: components.filter(c => c.componentType && c.brand && c.model) // only send filled ones
          }),
        })

        const data = await response.json()
        if (!response.ok || !data.success) throw new Error(data.error || 'Failed to complete setup')
        
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
      setStep(s => s - 1)
    } else {
      navigate('/')
    }
  }

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0 }),
  }

  let StepContent = null
  if (step === 0) {
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>General Information</h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--ds-text-secondary)' }}>
            Tell us about the condition of your bike and your riding habits.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Bike Condition">
            <div style={{ display: 'flex', background: 'var(--ds-surface)', border: '1px solid var(--ds-border)', borderRadius: '8px', padding: '4px' }}>
              {['Brand New', 'Used'].map(cond => (
                <button
                  key={cond}
                  onClick={() => setBikeCondition(cond)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                    background: bikeCondition === cond ? 'var(--ds-amber)' : 'transparent',
                    color: bikeCondition === cond ? '#000' : 'var(--ds-text-secondary)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {cond}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Riding Habit">
            <StyledSelect value={ridingHabit} onChange={e => setRidingHabit(e.target.value)}>
              <option value="Daily Commuter">Daily Commuter (High mileage, steady pace)</option>
              <option value="Weekend Warrior">Weekend Warrior (Moderate mileage, aggressive)</option>
              <option value="Track Day Enthusiast">Track Day Enthusiast (Low mileage, maximum stress)</option>
              <option value="Occasional Cruiser">Occasional Cruiser (Low mileage, relaxed)</option>
            </StyledSelect>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <Field label="Displacement (cc)">
              <StyledInput type="number" placeholder="e.g. 689" value={engineDisplacement} onChange={e => setEngineDisplacement(e.target.value)} />
            </Field>
            <Field label="Weight (kg)">
              <StyledInput type="number" placeholder="e.g. 195" value={weight} onChange={e => setWeight(e.target.value)} />
            </Field>
          </div>
          <Field label="Fuel Type">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                key="Standard (87)"
                onClick={() => setFuelType('Standard (87)')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                  background: fuelType === 'Standard (87)' ? 'color-mix(in srgb, var(--ds-green) 15%, transparent)' : 'var(--ds-surface)',
                  border: `2px solid ${fuelType === 'Standard (87)' ? 'var(--ds-green)' : 'var(--ds-border)'}`
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: fuelType === 'Standard (87)' ? 'var(--ds-green)' : 'var(--ds-text-muted)' }}>local_gas_station</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: fuelType === 'Standard (87)' ? 'var(--ds-green)' : 'var(--ds-text-secondary)' }}>Standard (87)</span>
              </button>
              <button
                key="Premium (91+)"
                onClick={() => setFuelType('Premium (91+)')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                  background: fuelType === 'Premium (91+)' ? 'color-mix(in srgb, var(--ds-amber) 15%, transparent)' : 'var(--ds-surface)',
                  border: `2px solid ${fuelType === 'Premium (91+)' ? 'var(--ds-amber)' : 'var(--ds-border)'}`
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: fuelType === 'Premium (91+)' ? 'var(--ds-amber)' : 'var(--ds-text-muted)' }}>ev_station</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: fuelType === 'Premium (91+)' ? 'var(--ds-amber)' : 'var(--ds-text-secondary)' }}>Premium (91+)</span>
              </button>
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
            <Field label="Fuel Capacity (Liters)">
              <StyledInput type="number" step="0.1" placeholder="e.g. 14" value={fuelCapacity} onChange={e => setFuelCapacity(e.target.value)} />
            </Field>
            <Field label="Consumption (km/L)">
              <StyledInput type="number" step="0.1" placeholder="e.g. 20" value={fuelConsumption} onChange={e => setFuelConsumption(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>
    )
  } else {
    const categoryComponents = components.filter(c => c.category === activeCategory)
    const currentStepConfig = steps[step]
    
    StepContent = (
      <div className="flex flex-col gap-6">
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '140px', border: '1px solid var(--ds-border)' }}>
          {currentStepConfig.image && <img src={currentStepConfig.image} alt={activeCategory} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--ds-bg) 0%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
            <h2 className="text-[24px] font-bold" style={{ color: 'var(--ds-text-primary)' }}>{activeCategory} Components</h2>
            <p className="text-[12px] opacity-80" style={{ color: 'var(--ds-text-secondary)' }}>Add parts to track wear and upgrades.</p>
          </div>
        </div>

        {CATEGORY_HINTS[activeCategory] && (
          <div style={{ display: 'flex', gap: '10px', padding: '14px', background: 'color-mix(in srgb, var(--ds-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--ds-amber) 25%, transparent)', borderRadius: '12px', color: 'var(--ds-amber)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lightbulb</span>
            <span style={{ fontSize: '12px', fontWeight: 500, lineHeight: 1.5 }}>{CATEGORY_HINTS[activeCategory]}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {categoryComponents.map(comp => (
              <motion.div key={comp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                <ComponentCard comp={comp} updateComp={(u) => updateComponent(comp.id, u)} removeComp={() => removeComponent(comp.id)} bikeCondition={bikeCondition} />
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={addComponent}
            style={{
              width: '100%', padding: '16px', background: 'var(--ds-surface-hover)', border: '1.5px dashed var(--ds-border-heavy)',
              borderRadius: '12px', color: 'var(--ds-text-primary)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_circle</span>
            ADD {activeCategory.toUpperCase()} PART
          </button>
        </div>

        {error && step === steps.length - 1 && (
          <div style={{ color: 'var(--ds-red)', fontSize: '12px', fontWeight: 600, padding: '8px', background: 'color-mix(in srgb, var(--ds-red) 10%, transparent)', borderRadius: '8px', marginTop: '16px' }}>
            Error: {error}
          </div>
        )}
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
          <div style={{ width: '32px' }} />
        </div>

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
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            style={{ width: '100%', position: 'absolute', left: 0, padding: '0 20px', boxSizing: 'border-box' }}
          >
            {StepContent}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Sticky Action Button ── */}
      <div className="p-5" style={{ background: 'var(--ds-bg)', zIndex: 50 }}>
        <AmberButton onClick={goToNext} icon={step === steps.length - 1 ? 'task_alt' : 'arrow_forward'} disabled={isSubmitting}>
          {step === steps.length - 1 ? (isSubmitting ? 'SAVING...' : 'COMPLETE SETUP') : 'CONTINUE'}
        </AmberButton>
      </div>

    </div>
  )
}
