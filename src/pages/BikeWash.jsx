import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IllEngineHeat, IllPlugExhaust, IllCoverElectronics,
  IllLowPressureRinse, IllSoakBugs, IllAvoidBearings,
  IllChainDegreaser, IllGrungeBrush, IllCleanWheels,
  IllTwoBucket, IllTopToBottom, IllDetailBrush,
  IllSoapRinse, IllAirBlower, IllMicrofiber,
  IllSprayWax, IllChainLube, IllFinalChecks,
  IllTirePressure, IllTreadCheck, IllWheelBearings,
  IllClutchLever, IllBrakeResistance, IllThrottleSnap,
  IllHeadlight, IllIndicators, IllBrakeLight,
  IllOilLevel, IllBrakeFluid, IllLeakCheck,
  IllChainTension, IllForkSeal, IllSideStand
} from '../components/shared/MaintenanceIllustrations'

export default function BikeWash() {
  const navigate = useNavigate()
  const { bike } = useOutletContext()

  const [activeTab, setActiveTab] = useState('wash') // 'wash' | 'inspect'

  // ======== WASH STATE ========
  const [autoReminder, setAutoReminder] = useState(true)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [intervalKm, setIntervalKm] = useState(500)
  const [intervalDays, setIntervalDays] = useState(14)
  const [tempKm, setTempKm] = useState(500)
  const [tempDays, setTempDays] = useState(14)
  
  const [lastWashOdo, setLastWashOdo] = useState(bike?.odometer || 0)
  const [lastWashDate, setLastWashDate] = useState(new Date().toISOString().split('T')[0])
  const [currentWashStep, setCurrentWashStep] = useState(0)

  // ======== INSPECT STATE ========
  const [autoInspectReminder, setAutoInspectReminder] = useState(true)
  const [isEditingInspectSettings, setIsEditingInspectSettings] = useState(false)
  const [inspectIntervalKm, setInspectIntervalKm] = useState(1000)
  const [inspectIntervalDays, setInspectIntervalDays] = useState(30)
  const [tempInspectKm, setTempInspectKm] = useState(1000)
  const [tempInspectDays, setTempInspectDays] = useState(30)

  const [lastInspectOdo, setLastInspectOdo] = useState(bike?.odometer || 0)
  const [lastInspectDate, setLastInspectDate] = useState(new Date().toISOString().split('T')[0])
  const [currentInspectStep, setCurrentInspectStep] = useState(0)

  // ======== MODAL STATE ========
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [checkedItems, setCheckedItems] = useState([]) // Array of checked checklist indices

  // Wash Calculations
  const kmSinceWash = Math.max(0, (bike?.odometer || 0) - lastWashOdo)
  const daysSinceWash = Math.floor((new Date() - new Date(lastWashDate)) / (1000 * 60 * 60 * 24))
  const kmProgress = Math.min(100, (kmSinceWash / intervalKm) * 100)
  const daysProgress = Math.min(100, (daysSinceWash / intervalDays) * 100)
  const isWashDue = kmProgress >= 100 || daysProgress >= 100

  // Inspect Calculations
  const kmSinceInspect = Math.max(0, (bike?.odometer || 0) - lastInspectOdo)
  const daysSinceInspect = Math.floor((new Date() - new Date(lastInspectDate)) / (1000 * 60 * 60 * 24))
  const inspectKmProgress = Math.min(100, (kmSinceInspect / inspectIntervalKm) * 100)
  const inspectDaysProgress = Math.min(100, (daysSinceInspect / inspectIntervalDays) * 100)
  const isInspectDue = inspectKmProgress >= 100 || inspectDaysProgress >= 100

  const handleWashComplete = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setLastWashOdo(bike?.odometer || 0)
      setLastWashDate(new Date().toISOString().split('T')[0])
      setCurrentWashStep(0)
      setCheckedItems([])
      setIsModalOpen(false)
      setShowSuccess(false)
    }, 3000)
  }

  const handleInspectComplete = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setLastInspectOdo(bike?.odometer || 0)
      setLastInspectDate(new Date().toISOString().split('T')[0])
      setCurrentInspectStep(0)
      setCheckedItems([])
      setIsModalOpen(false)
      setShowSuccess(false)
    }, 3000)
  }

  const saveWashSettings = () => {
    setIntervalKm(tempKm)
    setIntervalDays(tempDays)
    setIsEditingSettings(false)
  }

  const saveInspectSettings = () => {
    setInspectIntervalKm(tempInspectKm)
    setInspectIntervalDays(tempInspectDays)
    setIsEditingInspectSettings(false)
  }

  const openModal = () => {
    setCheckedItems([])
    if (activeTab === 'wash') setCurrentWashStep(0)
    if (activeTab === 'inspect') setCurrentInspectStep(0)
    setIsModalOpen(true)
  }

  const handleNextStep = (setStep, currentStep) => {
    setStep(currentStep + 1)
    setCheckedItems([]) // Reset checklist for next step
  }

  const handlePrevStep = (setStep, currentStep) => {
    setStep(Math.max(0, currentStep - 1))
    setCheckedItems([]) // Reset checklist
  }

  const toggleCheck = (idx) => {
    setCheckedItems(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const washSteps = [
    {
      title: 'Preparation & Cooling',
      icon: 'device_thermostat',
      color: 'var(--ds-amber)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-amber) 15%, transparent) 0%, transparent 100%)',
      desc: 'Wait for the engine to cool. Ensure electronics are safe.',
      proTip: 'Washing a hot engine can cause thermal shock and crack metal parts or leave baked-on water spots.',
      checklist: [
        { title: 'Engine Cool Down',  desc: 'Hover your hand near the engine. If it radiates intense heat, wait 20 minutes.', Illustration: IllEngineHeat },
        { title: 'Plug Exhaust',      desc: 'Insert a wash bung or tightly rolled towel to prevent water from entering the muffler.', Illustration: IllPlugExhaust },
        { title: 'Cover Electronics', desc: 'Use painter\'s tape or plastic bags over exposed intakes or sensitive dash displays.', Illustration: IllCoverElectronics }
      ]
    },
    {
      title: 'Gentle Pre-Rinse',
      icon: 'water_drop',
      color: 'var(--ds-cyan)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-cyan) 15%, transparent) 0%, transparent 100%)',
      desc: 'Loosen heavy dirt without pushing it into seals.',
      proTip: 'Let the water soak for a minute to loosen heavy mud and bugs before scrubbing.',
      checklist: [
        { title: 'Low Pressure Rinse',  desc: 'Use a gentle shower setting. Rinse from the windshield down to the wheels.', Illustration: IllLowPressureRinse },
        { title: 'Soak Bug Splatters',  desc: 'Leave water or dedicated bug-remover sitting on the front fairing for 60 seconds.', Illustration: IllSoakBugs },
        { title: 'Avoid Bearing Spray', desc: 'Never aim water directly at wheel bearings, fork seals, or chain O-rings.', Illustration: IllAvoidBearings }
      ]
    },
    {
      title: 'Degrease Chain & Wheels',
      icon: 'settings',
      color: 'var(--ds-primary)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-primary) 15%, transparent) 0%, transparent 100%)',
      desc: 'Remove grease before it contaminates your wash mitt.',
      proTip: 'Never use the same brush for your painted fairings that you use for your greasy chain!',
      checklist: [
        { title: 'Apply Chain Degreaser',   desc: 'Spray motorcycle-specific degreaser onto chain links while spinning the rear wheel.', Illustration: IllChainDegreaser },
        { title: 'Scrub with Grunge Brush', desc: 'Use a 3-sided chain brush to agitate and break apart the heavy grease buildup.', Illustration: IllGrungeBrush },
        { title: 'Clean Wheels',            desc: 'Spray wheel cleaner and scrub brake dust off the rims. Rinse immediately.', Illustration: IllCleanWheels }
      ]
    },
    {
      title: 'Premium Soap & Scrub',
      icon: 'cleaning_services',
      color: 'var(--ds-neon-cyan)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-neon-cyan) 15%, transparent) 0%, transparent 100%)',
      desc: 'Use safe techniques to lift dirt without scratching.',
      proTip: 'Use a two-bucket method: one with soapy water, one with clean water to rinse your mitt.',
      checklist: [
        { title: 'Two-Bucket Method',   desc: 'Dip wash mitt in soapy water, wash a panel, then rinse it in the clean water bucket.', Illustration: IllTwoBucket },
        { title: 'Top to Bottom Wash',  desc: 'Start with the cleanest parts (tank, windscreen) and end with the belly pan.', Illustration: IllTopToBottom },
        { title: 'Detail Brushing',     desc: 'Use a soft boar-hair detail brush to clean tight engine fins and switchgear.', Illustration: IllDetailBrush }
      ]
    },
    {
      title: 'Final Rinse & Dry',
      icon: 'air',
      color: 'var(--ds-text-primary)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-text-primary) 15%, transparent) 0%, transparent 100%)',
      desc: 'Remove water thoroughly to prevent corrosion and spots.',
      proTip: 'An air blower prevents water from pooling in bolt heads which can cause rust over time.',
      checklist: [
        { title: 'Thorough Soap Rinse',  desc: 'Rinse the bike until water runs completely clear. Don\'t let soap dry on the paint.', Illustration: IllSoapRinse },
        { title: 'Air Blower Crevices',  desc: 'Use a leaf blower or compressed air to force water out from under fairings and bolt heads.', Illustration: IllAirBlower },
        { title: 'Microfiber Pat Dry',   desc: 'Pat (do not drag) a thick, clean microfiber towel over the remaining wet surfaces.', Illustration: IllMicrofiber }
      ]
    },
    {
      title: 'Protect & Lubricate',
      icon: 'shield',
      color: 'var(--ds-green)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-green) 15%, transparent) 0%, transparent 100%)',
      desc: 'Seal the paint and prep the chain for riding.',
      proTip: 'Lube the chain on the inside run (bottom) so centrifugal force pushes it into the o-rings when riding.',
      checklist: [
        { title: 'Apply Spray Wax',   desc: 'Mist a ceramic detailer or spray wax onto the tank and wipe off for a UV-protective shine.', Illustration: IllSprayWax },
        { title: 'Lubricate Chain',   desc: 'Spray fresh chain lube onto the inside of the lower chain run while spinning the wheel.', Illustration: IllChainLube },
        { title: 'Final Checks',      desc: 'Wipe excess lube to prevent fling. Remove the exhaust bung and any tape you applied.', Illustration: IllFinalChecks }
      ]
    }
  ]

  const inspectSteps = [
    {
      title: 'Tires & Wheels',
      icon: 'radio_button_unchecked',
      color: 'var(--ds-amber)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-amber) 15%, transparent) 0%, transparent 100%)',
      desc: 'Check your only contact patch with the road.',
      proTip: 'Tire pressure changes with temperature. Always check pressure when the tires are "cold" before your ride.',
      checklist: [
        { title: 'Check Tire Pressures',   desc: 'Use a digital gauge to verify front and rear pressures match the swingarm sticker spec.', Illustration: IllTirePressure },
        { title: 'Inspect Tread & Debris', desc: 'Roll the bike forward slowly. Look for nails, cracks, or worn flat spots in the center.', Illustration: IllTreadCheck },
        { title: 'Wheel Bearings',         desc: 'Prop the wheels up. Spin them to ensure they turn smoothly without grinding noises.', Illustration: IllWheelBearings }
      ]
    },
    {
      title: 'Controls & Cables',
      icon: 'tune',
      color: 'var(--ds-cyan)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-cyan) 15%, transparent) 0%, transparent 100%)',
      desc: 'Ensure your inputs are smooth and responsive.',
      proTip: 'A sticky throttle is dangerous. If it doesn\'t snap back, check cable routing and grip clearance.',
      checklist: [
        { title: 'Test Clutch Lever',     desc: 'Squeeze the clutch. It should pull smoothly and return quickly without binding.', Illustration: IllClutchLever },
        { title: 'Test Brake Resistance', desc: 'Squeeze the front brake. It should feel rock solid, not squishy or fading to the bar.', Illustration: IllBrakeResistance },
        { title: 'Throttle Snap-Back',    desc: 'Twist throttle to full open and let go. It must instantly snap back to closed position.', Illustration: IllThrottleSnap }
      ]
    },
    {
      title: 'Lights & Electronics',
      icon: 'highlight',
      color: 'var(--ds-primary)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-primary) 15%, transparent) 0%, transparent 100%)',
      desc: 'Verify your visibility to other drivers.',
      proTip: 'If a turn signal blinks rapidly, it usually means a bulb is burnt out on that side.',
      checklist: [
        { title: 'Headlight Beams',     desc: 'Turn ignition ON. Verify the low beam is on, then toggle the high beam switch.', Illustration: IllHeadlight },
        { title: 'Indicators & Horn',   desc: 'Test the left/right signals (check front and rear). Give the horn a quick beep.', Illustration: IllIndicators },
        { title: 'Brake Light Switches',desc: 'Squeeze the front lever—check the red light. Tap the rear pedal—check the light again.', Illustration: IllBrakeLight }
      ]
    },
    {
      title: 'Fluids & Leaks',
      icon: 'water_drop',
      color: 'var(--ds-neon-cyan)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-neon-cyan) 15%, transparent) 0%, transparent 100%)',
      desc: 'Check the vital lifeblood of your engine and brakes.',
      proTip: 'Brake fluid should be clear or honey-colored. If it looks dark like coffee, it\'s time for a flush.',
      checklist: [
        { title: 'Engine Oil Level', desc: 'Hold the bike perfectly upright. Look at the sight glass to ensure oil is between the lines.', Illustration: IllOilLevel },
        { title: 'Brake Fluid Check', desc: 'Check the front master cylinder window and rear reservoir cup. Fluid should be above MIN.', Illustration: IllBrakeFluid },
        { title: 'Inspect for Leaks', desc: 'Look at the ground under the bike for fresh oil drips, green coolant, or brake fluid.', Illustration: IllLeakCheck }
      ]
    },
    {
      title: 'Chassis & Drivetrain',
      icon: 'settings',
      color: 'var(--ds-text-primary)',
      bgGradient: 'linear-gradient(135deg, color-mix(in srgb, var(--ds-text-primary) 15%, transparent) 0%, transparent 100%)',
      desc: 'Ensure the mechanical structure is sound.',
      proTip: 'A loose chain will slap the swingarm, while a tight chain can destroy the output shaft bearing.',
      checklist: [
        { title: 'Chain Tension',   desc: 'Push up on the bottom chain run. It should have about 1.2 inches (30mm) of free play.', Illustration: IllChainTension },
        { title: 'Fork Seal Check', desc: 'Bounce the front suspension hard. Inspect the silver tubes for oily rings (a sign of blown seals).', Illustration: IllForkSeal },
        { title: 'Side-Stand Spring',desc: 'Kick the side-stand up and down. Ensure the spring snaps it up securely into place.', Illustration: IllSideStand }
      ]
    }
  ]

  const renderScheduleBlock = ({ 
    title, icon, isDue, autoRemind, setAutoRemind, isEditing, setIsEditing, saveHandler,
    tempKm, setTempKm, tempDays, setTempDays,
    intervalKm, kmSince, kmProgress,
    intervalDays, daysSince, daysProgress
  }) => (
    <div style={{
      background: 'var(--ds-surface)', border: '1px solid var(--ds-border)',
      borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      {isDue && (
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--ds-amber)', boxShadow: '0 0 10px var(--ds-amber-glow)' }} 
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--ds-cyan)' }}>{icon}</span>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ds-text-primary)' }}>{title}</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              if (isEditing) saveHandler()
              else setIsEditing(true)
            }}
            style={{
              background: 'transparent', border: 'none', color: isEditing ? 'var(--ds-primary)' : 'var(--ds-text-secondary)',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{isEditing ? 'check_circle' : 'tune'}</span>
            {isEditing ? 'SAVE' : 'EDIT'}
          </button>

          {/* Toggle Switch */}
          <div 
            onClick={() => setAutoRemind(!autoRemind)}
            style={{
              width: '44px', height: '24px', borderRadius: '12px',
              background: autoRemind ? 'var(--ds-cyan)' : 'var(--ds-surface-active)',
              position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            <div style={{
              position: 'absolute', top: '2px', left: autoRemind ? '22px' : '2px',
              width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {autoRemind && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--ds-border)' }}>
              
              {isEditing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ds-surface-active)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ds-text-secondary)', textTransform: 'uppercase' }}>Interval (Distance)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="range" min="100" max="5000" step="100" 
                        value={tempKm} onChange={(e) => setTempKm(Number(e.target.value))}
                        style={{ flex: 1, accentColor: 'var(--ds-cyan)' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 800, width: '60px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{tempKm} km</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ds-text-secondary)', textTransform: 'uppercase' }}>Interval (Time)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="range" min="3" max="365" step="1" 
                        value={tempDays} onChange={(e) => setTempDays(Number(e.target.value))}
                        style={{ flex: 1, accentColor: 'var(--ds-cyan)' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 800, width: '60px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{tempDays} d</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* KM Tracking */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance (Every {intervalKm}km)</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: kmProgress >= 100 ? 'var(--ds-amber)' : 'var(--ds-text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {kmSince}/{intervalKm} km
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--ds-surface-active)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, kmProgress)}%`, height: '100%', background: kmProgress >= 100 ? 'var(--ds-amber)' : 'var(--ds-cyan)', borderRadius: '3px', transition: 'width 0.5s ease-out' }} />
                    </div>
                  </div>

                  {/* Time Tracking */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time (Every {intervalDays} days)</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: daysProgress >= 100 ? 'var(--ds-amber)' : 'var(--ds-text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {daysSince}/{intervalDays} days
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--ds-surface-active)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, daysProgress)}%`, height: '100%', background: daysProgress >= 100 ? 'var(--ds-amber)' : 'var(--ds-cyan)', borderRadius: '3px', transition: 'width 0.5s ease-out' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const renderStartCard = (title, subtitle, buttonText, icon, onClick) => (
    <div style={{
      background: 'linear-gradient(135deg, var(--ds-surface) 0%, var(--ds-surface-active) 100%)',
      border: '1px solid var(--ds-border)', borderRadius: '16px', padding: '24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px'
    }}>
      <div style={{ 
        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--ds-bg)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--ds-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--ds-primary)' }}>{icon}</span>
      </div>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ds-text-primary)' }}>{title}</h2>
        <p style={{ fontSize: '13px', color: 'var(--ds-text-secondary)', marginTop: '8px', lineHeight: 1.5, maxWidth: '280px' }}>
          {subtitle}
        </p>
      </div>
      <button
        onClick={onClick}
        style={{
          width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
          background: 'var(--ds-primary)', color: '#000', marginTop: '8px',
          fontSize: '14px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 20px var(--ds-primary-glow)', letterSpacing: '0.05em'
        }}
      >
        {buttonText}
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
      </button>
    </div>
  )

  // Full Screen Modal for Interactive Guide
  const renderInteractiveGuideModal = () => {
    const isWash = activeTab === 'wash'
    const steps = isWash ? washSteps : inspectSteps
    const currentStep = isWash ? currentWashStep : currentInspectStep
    const setStep = isWash ? setCurrentWashStep : setCurrentInspectStep
    const onComplete = isWash ? handleWashComplete : handleInspectComplete
    const completeLabel = isWash ? 'COMPLETE WASH' : 'INSPECTION PASSED'
    const mainTitle = isWash ? 'Wash & Detail Guide' : 'Pre-Ride Inspection'

    const stepData = steps[currentStep]
    const allChecked = stepData?.checklist?.length === checkedItems.length

    if (!isModalOpen) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'var(--ds-bg)', display: 'flex', flexDirection: 'column'
          }}
        >
          {showSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}
            >
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                style={{
                  width: '100px', height: '100px', borderRadius: '50%', background: 'var(--ds-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                  boxShadow: '0 0 60px var(--ds-green-glow)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#000' }}>check</span>
              </motion.div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--ds-text-primary)', marginBottom: '12px' }}>
                {isWash ? 'Spotless!' : 'All Clear!'}
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--ds-text-secondary)', lineHeight: 1.6, maxWidth: '280px' }}>
                {isWash 
                  ? "You've successfully completed the wash routine. Your bike is looking showroom fresh!" 
                  : "Inspection complete. All critical systems have been verified for maximum safety."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'var(--ds-surface)', borderBottom: '1px solid var(--ds-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ds-cyan)', letterSpacing: '0.1em' }}>{mainTitle.toUpperCase()}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {steps.map((_, i) => (
                      <div key={i} style={{ 
                        width: i === currentStep ? '20px' : '8px', height: '4px', 
                        borderRadius: '2px', background: i === currentStep ? 'var(--ds-cyan)' : 'var(--ds-surface-active)',
                        transition: 'all 0.3s ease'
                      }} />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'var(--ds-surface-active)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ds-text-primary)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: '40px' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.98, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                  >
                    
                    {/* Header Intro */}
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ds-text-primary)', marginBottom: '8px' }}>{stepData.title}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--ds-text-secondary)', lineHeight: 1.5 }}>{stepData.desc}</p>
                    </div>

                    {/* Rich Interactive Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {stepData.checklist.map((item, idx) => {
                        const isChecked = checkedItems.includes(idx)
                        return (
                          <div 
                            key={idx}
                            onClick={() => toggleCheck(idx)}
                            style={{ 
                              display: 'flex', gap: '14px', padding: '12px', borderRadius: '16px', cursor: 'pointer',
                              background: isChecked ? 'var(--ds-surface-hover)' : 'var(--ds-surface)',
                              border: `1px solid ${isChecked ? stepData.color : 'var(--ds-border)'}`,
                              transition: 'all 0.3s ease', opacity: isChecked ? 0.6 : 1, position: 'relative', overflow: 'hidden'
                            }}
                          >
                            {/* Cartoon Illustration */}
                            <item.Illustration />
                            
                            {/* Text Content */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <h4 style={{ 
                                fontSize: '14px', fontWeight: 800, color: isChecked ? 'var(--ds-text-secondary)' : 'var(--ds-text-primary)', 
                                marginBottom: '4px', textDecoration: isChecked ? 'line-through' : 'none' 
                              }}>
                                {item.title}
                              </h4>
                              <p style={{ 
                                fontSize: '12px', color: 'var(--ds-text-muted)', lineHeight: 1.4, 
                                textDecoration: isChecked ? 'line-through' : 'none' 
                              }}>
                                {item.desc}
                              </p>
                            </div>

                            {/* Checkbox */}
                            <div style={{ 
                              width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                              border: `2px solid ${isChecked ? stepData.color : 'var(--ds-text-muted)'}`,
                              background: isChecked ? stepData.color : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s ease', alignSelf: 'center'
                            }}>
                              {isChecked && <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#000', fontWeight: 900 }}>check</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{
                      background: 'color-mix(in srgb, var(--ds-amber) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--ds-amber) 20%, transparent)',
                      borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--ds-amber)', flexShrink: 0 }}>lightbulb</span>
                      <div style={{ fontSize: '14px', color: 'var(--ds-text-primary)', lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 900, color: 'var(--ds-amber)', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>PRO TIP</span>
                        {stepData.proTip}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation */}
              <div style={{ padding: '24px', background: 'var(--ds-surface)', borderTop: '1px solid var(--ds-border)', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handlePrevStep(setStep, currentStep)}
                  disabled={currentStep === 0}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid var(--ds-border)',
                    background: 'transparent', color: currentStep === 0 ? 'var(--ds-text-muted)' : 'var(--ds-text-primary)',
                    fontSize: '13px', fontWeight: 800, cursor: currentStep === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                  PREV
                </button>
                
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => handleNextStep(setStep, currentStep)}
                    style={{
                      flex: 2, padding: '16px', borderRadius: '14px', border: 'none',
                      background: allChecked ? 'var(--ds-cyan)' : 'var(--ds-surface-active)', 
                      color: allChecked ? '#000' : 'var(--ds-text-primary)',
                      fontSize: '13px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                      boxShadow: allChecked ? '0 4px 20px var(--ds-cyan-glow)' : 'none'
                    }}
                  >
                    NEXT
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={onComplete}
                    style={{
                      flex: 2, padding: '16px', borderRadius: '14px', border: 'none',
                      background: allChecked ? 'var(--ds-primary)' : 'var(--ds-surface-active)', 
                      color: allChecked ? '#000' : 'var(--ds-text-primary)',
                      fontSize: '13px', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                      boxShadow: allChecked ? '0 4px 20px var(--ds-primary-glow)' : 'none'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
                    {completeLabel}
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="fade-in" style={{ minHeight: '100dvh', background: 'var(--ds-bg)', paddingBottom: '120px' }}>
      
      {/* ── App Bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column',
        background: 'var(--ds-glass-bg)',
        borderBottom: `1px solid var(--ds-glass-border)`,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px', padding: '0 20px' }}>
          <div style={{ width: '32px' }} /> {/* Spacer */}
          <h1 style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ds-cyan)' }}>
            Maintenance & Care
          </h1>
          <div style={{ width: '32px' }} />
        </div>

        {/* ── Top Tabs ── */}
        <div style={{ display: 'flex', padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--ds-surface-active)', padding: '4px', borderRadius: '12px', width: '100%' }}>
            <button 
              onClick={() => setActiveTab('wash')} 
              style={{ 
                flex: 1, padding: '10px', borderRadius: '8px', 
                background: activeTab === 'wash' ? 'var(--ds-surface)' : 'transparent', 
                color: activeTab === 'wash' ? 'var(--ds-text-primary)' : 'var(--ds-text-secondary)', 
                fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', 
                boxShadow: activeTab === 'wash' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_car_wash</span>
              WASH GUIDE
            </button>
            <button 
              onClick={() => setActiveTab('inspect')} 
              style={{ 
                flex: 1, padding: '10px', borderRadius: '8px', 
                background: activeTab === 'inspect' ? 'var(--ds-surface)' : 'transparent', 
                color: activeTab === 'inspect' ? 'var(--ds-text-primary)' : 'var(--ds-text-secondary)', 
                fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', 
                boxShadow: activeTab === 'inspect' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>plumbing</span>
              INSPECT BIKE
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <AnimatePresence mode="wait">
          {activeTab === 'wash' ? (
            <motion.div key="wash" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {renderScheduleBlock({
                title: 'Wash Schedule',
                icon: 'water_drop',
                isDue: isWashDue,
                autoRemind: autoReminder, setAutoRemind: setAutoReminder,
                isEditing: isEditingSettings, setIsEditing: setIsEditingSettings,
                saveHandler: saveWashSettings,
                tempKm: tempKm, setTempKm: setTempKm,
                tempDays: tempDays, setTempDays: setTempDays,
                intervalKm: intervalKm, kmSince: kmSinceWash, kmProgress: kmProgress,
                intervalDays: intervalDays, daysSince: daysSinceWash, daysProgress: daysProgress
              })}

              {renderStartCard(
                'Ready to clean your bike?',
                'Follow our step-by-step interactive detailing guide to get your motorcycle looking showroom fresh without damaging critical components.',
                'START WASH PROCESS',
                'cleaning_services',
                openModal
              )}

            </motion.div>
          ) : (
            <motion.div key="inspect" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {renderScheduleBlock({
                title: 'Inspection Schedule',
                icon: 'fact_check',
                isDue: isInspectDue,
                autoRemind: autoInspectReminder, setAutoRemind: setAutoInspectReminder,
                isEditing: isEditingInspectSettings, setIsEditing: setIsEditingInspectSettings,
                saveHandler: saveInspectSettings,
                tempKm: tempInspectKm, setTempKm: setTempInspectKm,
                tempDays: tempInspectDays, setTempDays: setTempInspectDays,
                intervalKm: inspectIntervalKm, kmSince: kmSinceInspect, kmProgress: inspectKmProgress,
                intervalDays: inspectIntervalDays, daysSince: daysSinceInspect, daysProgress: inspectDaysProgress
              })}

              {renderStartCard(
                'Pre-Ride Inspection',
                'A systematic check of your motorcycle\'s critical systems to ensure maximum safety and performance before you hit the road.',
                'START INSPECTION',
                'plumbing',
                openModal
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Full Screen Guide Overlay */}
      {renderInteractiveGuideModal()}

    </div>
  )
}
