import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AmberButton from '../components/shared/AmberButton'
import { Field, StyledInput, StyledSelect } from '../components/shared/FormUtils'

const steps = [
  { id: 'core', title: 'General Info', category: null },
  { id: 'drivetrain', title: 'Drivetrain', category: 'Drivetrain' },
  { id: 'brakes', title: 'Brakes', category: 'Brakes' },
  { id: 'wheels', title: 'Wheels & Tires', category: 'Wheels/Tires' },
]

const TIME_DEGRADING_PARTS = ['Tubeless Sealant', 'Suspension Fluid', 'Brake Fluid']

const COMPONENT_TYPES = {
  'Drivetrain': ['Chain', 'Cassette', 'Chainring', 'Derailleur Pulley', 'Bottom Bracket'],
  'Brakes': ['Front Brake Pads', 'Rear Brake Pads', 'Brake Fluid', 'Brake Rotors'],
  'Wheels/Tires': ['Front Tire', 'Rear Tire', 'Tubeless Sealant', 'Wheel Bearings']
}

function ComponentCard({ comp, updateComp, removeComp, bikeCondition }) {
  const isTimeDegrading = TIME_DEGRADING_PARTS.includes(comp.componentType)

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
        <Field label="Component Type">
          <StyledSelect value={comp.componentType} onChange={e => updateComp({ componentType: e.target.value })}>
            <option value="" disabled>Select a part...</option>
            {COMPONENT_TYPES[comp.category].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </StyledSelect>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Brand">
            <StyledInput placeholder="e.g. Shimano" value={comp.brand} onChange={e => updateComp({ brand: e.target.value })} />
          </Field>
          <Field label="Model">
            <StyledInput placeholder="e.g. 105" value={comp.model} onChange={e => updateComp({ model: e.target.value })} />
          </Field>
        </div>

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
            <Field label="Estimated Miles Used">
              <StyledInput type="number" placeholder="e.g. 500" value={comp.estimatedMilesUsed} onChange={e => updateComp({ estimatedMilesUsed: e.target.value })} />
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
  const [fuelType, setFuelType] = useState('Premium (91)')
  
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
        estimatedMilesUsed: '',
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
  } else {
    const categoryComponents = components.filter(c => c.category === activeCategory)
    
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>{activeCategory} Components</h2>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--ds-text-secondary)' }}>
            Add any specific {activeCategory.toLowerCase()} parts you want to track for wear and upgrades.
          </p>
        </div>

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
