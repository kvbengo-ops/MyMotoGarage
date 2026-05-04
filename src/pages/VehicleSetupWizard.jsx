import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AmberButton from '../components/shared/AmberButton'
import { Field, StyledInput, StyledSelect, FormGroup } from '../components/shared/FormUtils'
import { getPresetsForCategory, applyCleanSlate } from '../data/componentPresets'

const SETUP_MODE_STEP = { id: 'setupMode', title: 'Setup Mode', category: null, image: null }

const MANUAL_STEPS = [
  { id: 'core',        title: 'General Info',   category: null,          image: null },
  { id: 'drivetrain',  title: 'Drivetrain',      category: 'Drivetrain',  image: '/banner_drivetrain.png' },
  { id: 'tires',       title: 'Tires',           category: 'Tires',       image: '/banner_tires.png' },
  { id: 'brakes',      title: 'Brakes',          category: 'Brakes',      image: '/banner_brakes.png' },
  { id: 'oils',        title: 'Oils & Fluids',   category: 'Oils',        image: '/banner_oils.png' },
  { id: 'electronics', title: 'Electronics',     category: 'Electronics', image: '/banner_electronics.png' },
]

const QUICK_STEPS = [
  { id: 'core',       title: 'General Info',   category: null, image: null },
  { id: 'setupMode',  title: 'Setup Mode',     category: null, image: null },
  { id: 'review',     title: 'Review Parts',   category: null, image: null },
]

const TIME_DEGRADING_PARTS = ['Tubeless Sealant', 'Suspension Fluid', 'Brake Fluid', 'Battery']

const CATEGORY_HINTS = {
  'Drivetrain':   'Hint: Add parts you want to monitor like your Drive Chain, Front/Rear Sprockets, or Clutch Cable.',
  'Tires':        'Hint: Track your Front and Rear Tires for tread life and replacement intervals.',
  'Brakes':       'Hint: Monitor your Front Brake Pads, Rear Brake Pads, Rotors, or Brake Fluid lifespan.',
  'Oils':         'Hint: Add fluids like Engine Oil, Gear Oil, or Coolant to stay on top of regular maintenance.',
  'Electronics':  'Hint: Track components like your Battery, Headlight bulb, Tail Light, Fuse Box, or Indicators.',
}

const CATEGORY_PLACEHOLDERS = {
  'Drivetrain':  { name: 'e.g. Drive Chain',      brand: 'e.g. DID, Sunstar',       model: 'e.g. 525 VX3' },
  'Tires':       { name: 'e.g. Rear Tire',         brand: 'e.g. Michelin',            model: 'e.g. Road 6' },
  'Brakes':      { name: 'e.g. Front Brake Pads',  brand: 'e.g. Brembo, EBC',        model: 'e.g. Sintered Double-H' },
  'Oils':        { name: 'e.g. Engine Oil',         brand: 'e.g. Motul, Liqui Moly',  model: 'e.g. 7100 10W-40' },
  'Electronics': { name: 'e.g. Battery',            brand: 'e.g. Yuasa, Motobatt',    model: 'e.g. YTZ10S' },
}

function ComponentCard({ comp, updateComp, removeComp, bikeCondition, bikeOdometer }) {
  const isTimeDegrading = TIME_DEGRADING_PARTS.includes(comp.componentType)
  const ph = CATEGORY_PLACEHOLDERS[comp.category] || { name: 'e.g. Part Name', brand: 'e.g. Brand', model: 'e.g. Model' }

  // Calculate what the install baseline will be (mirrors backend logic)
  // estimatedKmUsed is set for both 'Currently Used' and 'Brand New' (Brand New Bike mode)
  const installOdo = comp.estimatedKmUsed && parseInt(comp.estimatedKmUsed) > 0
    ? Math.max(0, bikeOdometer - parseInt(comp.estimatedKmUsed))
    : bikeOdometer

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
            <Field label="How many km is already on this part?">
              <StyledInput type="number" placeholder="e.g. 500" value={comp.estimatedKmUsed} onChange={e => updateComp({ estimatedKmUsed: e.target.value })} />
            </Field>
          </motion.div>
        )}

        {/* Odometer baseline preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px', borderRadius: '8px',
          background: 'color-mix(in srgb, var(--ds-neon-cyan) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ds-neon-cyan) 20%, transparent)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--ds-neon-cyan)', flexShrink: 0 }}>my_location</span>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ds-neon-cyan)', textTransform: 'uppercase' }}>Install Baseline</span>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 700, color: 'var(--ds-text-primary)' }}>
              {installOdo.toLocaleString()} km
              <span style={{ fontWeight: 400, fontSize: '11px', color: 'var(--ds-text-secondary)', marginLeft: '6px' }}>
                {comp.wearState === 'Brand New' ? '— installed fresh at this odo' : '— estimated install point'}
              </span>
            </div>
          </div>
        </div>

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

const GUIDE_SLIDES = [
  {
    image: '/guide_track_parts.png',
    title: 'Track Your Parts',
    caption: 'Register components like your chain, tires, and oil so the app can monitor wear for you.'
  },
  {
    image: '/guide_add_component.png',
    title: 'Adding a Component',
    caption: 'Tap the ADD PART button, then fill in the name, brand, and model of the part.'
  },
  {
    image: '/guide_wear_state.png',
    title: 'Brand New vs. Currently Used',
    caption: 'Just installed it? Choose Brand New. Already riding on it? Choose Currently Used and tell us the km.'
  },
  {
    image: '/guide_threshold.png',
    title: 'Replacement Threshold',
    caption: 'Set the km lifespan of each part. We will alert you when it is getting close to replacement time.'
  },
  {
    image: '/guide_optional.png',
    title: 'Everything is Optional',
    caption: 'Skip any section and come back later via the Settings icon on your bike\'s detail page.'
  },
]

function ComponentGuide({ onClose }) {
  const [slide, setSlide] = useState(0)
  const isLast = slide === GUIDE_SLIDES.length - 1
  const current = GUIDE_SLIDES[slide]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.82)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          backdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '430px',
            background: 'var(--ds-surface)',
            borderRadius: '24px 24px 0 0',
            border: '1px solid var(--ds-border)',
            borderBottom: 'none',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Infographic image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
            >
              <img
                src={current.image}
                alt={current.title}
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Content area */}
          <div style={{ padding: '20px 24px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title + caption */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slide}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ds-text-primary)', marginBottom: '6px' }}>
                  {current.title}
                </h3>
                <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--ds-text-secondary)' }}>
                  {current.caption}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
              {GUIDE_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? '22px' : '6px', height: '6px',
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                    background: i === slide ? 'var(--ds-amber)' : 'var(--ds-border)',
                    transition: 'all 0.3s', padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isLast && (
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    border: '1px solid var(--ds-border)', background: 'transparent',
                    color: 'var(--ds-text-secondary)', fontSize: '13px',
                    fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
                  }}
                >
                  SKIP
                </button>
              )}
              <button
                onClick={() => isLast ? onClose() : setSlide(s => s + 1)}
                style={{
                  flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                  background: 'var(--ds-amber)', color: '#000', fontSize: '13px',
                  fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {isLast ? (
                  <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span> GOT IT</>
                ) : (
                  <><span>NEXT</span><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
  
  // Bike identity — fetched on mount, used as component install baseline
  const [bikeOdometer, setBikeOdometer] = useState(0)
  const [bikeName, setBikeName] = useState('')

  // Steps 2+: Components
  const [components, setComponents] = useState([])

  // Setup flow mode: null = not chosen yet, 'quick' or 'custom'
  const [setupMode, setSetupMode] = useState(null)
  const [cleanSlateMode, setCleanSlateMode] = useState(null) // 'brandNew', 'freshService', or null (manual)
  const [bikeCategory, setBikeCategory] = useState('')

  // Default to QUICK_STEPS so the Setup Mode choice screen always shows at step 1.
  // Only switch to MANUAL_STEPS if the user explicitly chose Custom Setup.
  const steps = setupMode === 'custom' ? MANUAL_STEPS : QUICK_STEPS

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [guideShown, setGuideShown] = useState(false)

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const response = await fetch(`/api/vehicles/${bikeId}`)
        const data = await response.json()
        if (data.success && data.data) {
          const v = data.data
          if (v.bike_condition) setBikeCondition(v.bike_condition)
          if (v.riding_habit) setRidingHabit(v.riding_habit)
          if (v.engine_displacement) setEngineDisplacement(v.engine_displacement.toString())
          if (v.weight) setWeight(v.weight.toString())
          if (v.fuel_type) setFuelType(v.fuel_type)
          if (v.fuel_capacity) setFuelCapacity(v.fuel_capacity.toString())
          if (v.fuel_consumption) setFuelConsumption(v.fuel_consumption.toString())
          if (v.category) setBikeCategory(v.category)
          // Store odometer as install baseline for Phase 2 component setup
          setBikeOdometer(v.odometer || 0)
          setBikeName(`${v.year} ${v.make} ${v.model}`)
          
          if (v.components && v.components.length > 0) {
            setComponents(v.components.map(c => ({
              id: c.id || Math.random().toString(36).substring(2, 9),
              category: c.category,
              componentType: c.component_type,
              brand: c.brand,
              model: c.model,
              wearState: 'Currently Used',
              estimatedKmUsed: v.odometer ? v.odometer - c.baseline_install_odometer : '',
              replacementThreshold: c.replacement_threshold || '',
              lastServiceDate: c.last_service_date ? new Date(c.last_service_date).toISOString().split('T')[0] : ''
            })))
          }
        }
      } catch (err) {
        console.error('Error fetching bike:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBike()
  }, [bikeId])

  const activeCategory = steps[step].category

  // Auto-show guide once when user first hits the Drivetrain step in manual mode
  useEffect(() => {
    const isDrivetrainStep = steps[step]?.id === 'drivetrain'
    if (isDrivetrainStep && !guideShown) {
      setShowGuide(true)
      setGuideShown(true)
    }
  }, [step, steps])

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
            components: components.filter(c =>
              // Quick Setup only requires a name; Custom requires brand+model too
              setupMode === 'quick' ? c.componentType : (c.componentType && c.brand && c.model)
            )
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
  } else if (steps[step].id === 'setupMode') {
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>Setup Mode</h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--ds-text-secondary)' }}>
            How do you want to set up your components?
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              setSetupMode('quick')
              // Pre-fill parts for category
              const presets = getPresetsForCategory(bikeCategory || 'Naked / Streetfighter')
              // If we already set clean slate mode, apply it right away
              if (cleanSlateMode) {
                setComponents(applyCleanSlate(cleanSlateMode, presets, bikeOdometer))
              } else {
                setComponents(presets)
              }
            }}
            style={{
              padding: '20px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              background: setupMode === 'quick' ? 'color-mix(in srgb, var(--ds-amber) 15%, transparent)' : 'var(--ds-surface)',
              border: `2px solid ${setupMode === 'quick' ? 'var(--ds-amber)' : 'var(--ds-border)'}`,
            }}
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: setupMode === 'quick' ? 'var(--ds-amber)' : 'var(--ds-text-secondary)' }}>flash_on</span>
              <h3 className="text-[16px] font-bold" style={{ color: setupMode === 'quick' ? 'var(--ds-amber)' : 'var(--ds-text-primary)' }}>Quick Setup (Recommended)</h3>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ds-text-secondary)', marginLeft: '44px' }}>
              We'll pre-fill the most common parts for your bike category with standard replacement thresholds.
            </p>
          </button>

          <button
            onClick={() => {
              setSetupMode('custom')
              // Reset to just one empty part to start custom
              setComponents([])
              setCleanSlateMode(null) // Custom doesn't use the global clean slate
            }}
            style={{
              padding: '20px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              background: setupMode === 'custom' ? 'color-mix(in srgb, var(--ds-text-secondary) 15%, transparent)' : 'var(--ds-surface)',
              border: `2px solid ${setupMode === 'custom' ? 'var(--ds-text-secondary)' : 'var(--ds-border)'}`,
            }}
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--ds-text-secondary)' }}>build</span>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--ds-text-primary)' }}>Custom Setup</h3>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ds-text-secondary)', marginLeft: '44px' }}>
              Add each part manually. You choose exactly what to track and enter custom replacement thresholds.
            </p>
          </button>
        </div>

        <AnimatePresence>
          {setupMode === 'quick' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              <FormGroup title="Wear State modifier">
                <p className="text-[12px] mb-4" style={{ color: 'var(--ds-text-secondary)' }}>
                  Save time by setting initial wear states automatically.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setCleanSlateMode('brandNew')
                      setComponents(applyCleanSlate('brandNew', components, bikeOdometer))
                    }}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                      background: cleanSlateMode === 'brandNew' ? 'color-mix(in srgb, var(--ds-green) 15%, transparent)' : 'var(--ds-surface)',
                      border: `1.5px solid ${cleanSlateMode === 'brandNew' ? 'var(--ds-green)' : 'var(--ds-border)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{ color: cleanSlateMode === 'brandNew' ? 'var(--ds-green)' : 'var(--ds-text-secondary)' }}>two_wheeler</span>
                      <div>
                        <span className="block text-[13px] font-bold" style={{ color: cleanSlateMode === 'brandNew' ? 'var(--ds-green)' : 'var(--ds-text-primary)' }}>Brand New Bike</span>
                        <span className="block text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>All parts set to 0 km wear.</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCleanSlateMode('freshService')
                      setComponents(applyCleanSlate('freshService', components, bikeOdometer))
                    }}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                      background: cleanSlateMode === 'freshService' ? 'color-mix(in srgb, var(--ds-amber) 15%, transparent)' : 'var(--ds-surface)',
                      border: `1.5px solid ${cleanSlateMode === 'freshService' ? 'var(--ds-amber)' : 'var(--ds-border)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{ color: cleanSlateMode === 'freshService' ? 'var(--ds-amber)' : 'var(--ds-text-secondary)' }}>handyman</span>
                      <div>
                        <span className="block text-[13px] font-bold" style={{ color: cleanSlateMode === 'freshService' ? 'var(--ds-amber)' : 'var(--ds-text-primary)' }}>Fresh Service (Used Bike)</span>
                        <span className="block text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>Consumables (oil, pads, chain) set to 0 km. Others flagged for review.</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCleanSlateMode(null)
                      const baseMode = bikeCondition === 'Brand New' ? 'brandNew' : null
                      setComponents(applyCleanSlate(baseMode, components, bikeOdometer))
                    }}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                      background: cleanSlateMode === null ? 'var(--ds-surface-hover)' : 'var(--ds-surface)',
                      border: `1.5px solid ${cleanSlateMode === null ? 'var(--ds-text-secondary)' : 'var(--ds-border)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{ color: 'var(--ds-text-secondary)' }}>edit_note</span>
                      <div>
                        <span className="block text-[13px] font-bold" style={{ color: 'var(--ds-text-primary)' }}>I'll Estimate Myself</span>
                        <span className="block text-[11px]" style={{ color: 'var(--ds-text-secondary)' }}>Review and estimate wear for each part.</span>
                      </div>
                    </div>
                  </button>
                </div>
              </FormGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  } else if (steps[step].id === 'review') {
    // Quick Setup Review Screen
    StepContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--ds-text-primary)' }}>Review Parts</h2>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--ds-text-secondary)' }}>
            We've pre-filled the standard parts for a {bikeCategory || 'Naked / Streetfighter'}. Tap any part to customize brands or adjust wear estimates.
          </p>
          {/* Odometer context for quick setup review */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '8px', marginBottom: '8px',
            background: 'color-mix(in srgb, var(--ds-neon-cyan) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-neon-cyan) 18%, transparent)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--ds-neon-cyan)' }}>speed</span>
            <span style={{ fontSize: '12px', color: 'var(--ds-text-secondary)', fontWeight: 500 }}>
              Parts will be baselined at <strong style={{ color: 'var(--ds-neon-cyan)', fontFamily: "'JetBrains Mono', monospace" }}>{bikeOdometer.toLocaleString()} km</strong> — your current odometer reading.
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {components.map(comp => (
              <motion.div key={comp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                <ComponentCard comp={comp} updateComp={(u) => updateComponent(comp.id, u)} removeComp={() => removeComponent(comp.id)} bikeCondition={bikeCondition} bikeOdometer={bikeOdometer} />
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
            ADD ADDITIONAL PART
          </button>
        </div>

        {error && step === steps.length - 1 && (
          <div style={{ color: 'var(--ds-red)', fontSize: '12px', fontWeight: 600, padding: '8px', background: 'color-mix(in srgb, var(--ds-red) 10%, transparent)', borderRadius: '8px', marginTop: '16px' }}>
            Error: {error}
          </div>
        )}
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
                <ComponentCard comp={comp} updateComp={(u) => updateComponent(comp.id, u)} removeComp={() => removeComponent(comp.id)} bikeCondition={bikeCondition} bikeOdometer={bikeOdometer} />
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

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--ds-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ds-text-secondary)' }}>Loading setup...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ds-bg)', display: 'flex', flexDirection: 'column' }}>
      {showGuide && <ComponentGuide onClose={() => setShowGuide(false)} />}
      
      {/* ── Progress & App Bar ── */}
      <header className="px-5 pt-8 pb-4" style={{ background: 'var(--ds-bg)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={goToPrev} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--ds-surface)', cursor: 'pointer', color: 'var(--ds-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back_ios_new</span>
          </button>
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--ds-amber)' }}>SETUP: {steps[step].title}</span>
          {step > 0 ? (
            <button
              onClick={() => setShowGuide(true)}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--ds-surface)', cursor: 'pointer', color: 'var(--ds-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span>
            </button>
          ) : (
            <div style={{ width: '32px' }} />
          )}
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

        {/* ── Odometer Baseline Banner (shown on component steps) ── */}
        {steps[step].category && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            margin: '12px 0 0', padding: '10px 16px',
            background: 'color-mix(in srgb, var(--ds-neon-cyan) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ds-neon-cyan) 18%, transparent)',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--ds-neon-cyan)' }}>speed</span>
              <span style={{ fontSize: '11px', color: 'var(--ds-text-secondary)', fontWeight: 600 }}>
                Current Odometer
              </span>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 800, color: 'var(--ds-neon-cyan)', letterSpacing: '0.04em' }}>
              {bikeOdometer.toLocaleString()} km
            </span>
          </div>
        )}
      </header>

      {/* ── Slide Viewport ── */}
      <main className="flex-1 relative overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            style={{ width: '100%', height: '100%', overflowY: 'auto', position: 'absolute', top: 0, left: 0, padding: '32px 20px', boxSizing: 'border-box' }}
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
          disabled={isSubmitting || (steps[step].id === 'setupMode' && !setupMode)}
        >
          {step === steps.length - 1 ? (isSubmitting ? 'SAVING...' : 'COMPLETE SETUP') : 'CONTINUE'}
        </AmberButton>
      </div>

    </div>
  )
}
