import { motion } from 'framer-motion'

const pulse = { scale: [1, 1.08, 1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
const spin  = { rotate: [0, 360],    transition: { duration: 4, repeat: Infinity, ease: 'linear' } }
const drip  = { y: [0, 6, 0],        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } }
const wave  = { x: [0, 4, -4, 0],   transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }
const blink = { opacity: [1, 0, 1],  transition: { duration: 1, repeat: Infinity } }
const bounce= { y: [0, -6, 0],       transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } }

function IllustrationBase({ bg, children }) {
  return (
    <div style={{
      width: '76px', height: '76px', borderRadius: '10px', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative'
    }}>
      {children}
    </div>
  )
}

// ─── WASH ILLUSTRATIONS ────────────────────────────────────────────────────

export function IllEngineHeat() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a0a00,#2e1200)">
      <motion.span animate={pulse} className="material-symbols-outlined" style={{ fontSize: 36, color: '#ff8c00' }}>local_fire_department</motion.span>
      <motion.span animate={blink} className="material-symbols-outlined" style={{ fontSize: 16, color: '#ffd700', position: 'absolute', top: 8, right: 8 }}>device_thermostat</motion.span>
    </IllustrationBase>
  )
}

export function IllPlugExhaust() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d0d,#1a1a1a)">
      <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#888', position: 'absolute' }}>sports_motorsports</span>
      <motion.span animate={bounce} className="material-symbols-outlined" style={{ fontSize: 22, color: '#00d4ff', zIndex: 1 }}>block</motion.span>
    </IllustrationBase>
  )
}

export function IllCoverElectronics() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001a2e,#002e4a)">
      <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#0066aa', position: 'absolute' }}>developer_board</span>
      <motion.span animate={pulse} className="material-symbols-outlined" style={{ fontSize: 22, color: '#00d4ff', zIndex: 1 }}>shield</motion.span>
    </IllustrationBase>
  )
}

export function IllLowPressureRinse() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001e2e,#003044)">
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 38, color: '#00d4ff' }}>shower</motion.span>
    </IllustrationBase>
  )
}

export function IllSoakBugs() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0a1a00,#1a2e00)">
      <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#4a7c00', position: 'absolute' }}>pest_control</span>
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 22, color: '#00d4ff', zIndex: 1 }}>water_drop</motion.span>
    </IllustrationBase>
  )
}

export function IllAvoidBearings() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a0a00,#2e1a00)">
      <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#555', position: 'absolute' }}>radio_button_unchecked</span>
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 22, color: '#ff6600', zIndex: 1 }}>do_not_disturb_on</motion.span>
    </IllustrationBase>
  )
}

export function IllChainDegreaser() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d0d,#1a1200)">
      <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#333', position: 'absolute' }}>settings</span>
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 22, color: '#c8f500', zIndex: 1 }}>water_drop</motion.span>
    </IllustrationBase>
  )
}

export function IllGrungeBrush() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a0d00,#2e1a00)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 38, color: '#c8f500' }}>cleaning_services</motion.span>
    </IllustrationBase>
  )
}

export function IllCleanWheels() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001a1a,#002e2e)">
      <motion.span animate={spin} className="material-symbols-outlined" style={{ fontSize: 38, color: '#00d4ff' }}>radio_button_unchecked</motion.span>
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff', position: 'absolute' }}>star</span>
    </IllustrationBase>
  )
}

export function IllTwoBucket() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001e2e,#002a3a)">
      <motion.span animate={bounce} className="material-symbols-outlined" style={{ fontSize: 30, color: '#00d4ff', marginRight: 4 }}>water_drop</motion.span>
      <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#888' }}>water_drop</span>
    </IllustrationBase>
  )
}

export function IllTopToBottom() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001020,#002030)">
      <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#555', position: 'absolute' }}>two_wheeler</span>
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 20, color: '#00d4ff', zIndex: 1 }}>arrow_downward</motion.span>
    </IllustrationBase>
  )
}

export function IllDetailBrush() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d1a,#1a1a2e)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 36, color: '#9b59b6' }}>brush</motion.span>
    </IllustrationBase>
  )
}

export function IllSoapRinse() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001828,#002038)">
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 38, color: '#00d4ff' }}>waves</motion.span>
    </IllustrationBase>
  )
}

export function IllAirBlower() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#101020,#1a1a2e)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 38, color: '#99ccff' }}>air</motion.span>
    </IllustrationBase>
  )
}

export function IllMicrofiber() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001a10,#002a18)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 36, color: '#00cc88' }}>gesture</motion.span>
    </IllustrationBase>
  )
}

export function IllSprayWax() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a1000,#2e1e00)">
      <motion.span animate={pulse} className="material-symbols-outlined" style={{ fontSize: 36, color: '#ffd700' }}>auto_awesome</motion.span>
    </IllustrationBase>
  )
}

export function IllChainLube() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d0d,#1a1200)">
      <motion.span animate={spin} className="material-symbols-outlined" style={{ fontSize: 32, color: '#888', position: 'absolute' }}>settings</motion.span>
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 20, color: '#c8f500', zIndex: 1 }}>opacity</motion.span>
    </IllustrationBase>
  )
}

export function IllFinalChecks() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001a10,#003020)">
      <motion.span animate={pulse} className="material-symbols-outlined" style={{ fontSize: 38, color: '#00e676' }}>verified</motion.span>
    </IllustrationBase>
  )
}

// ─── INSPECT ILLUSTRATIONS ─────────────────────────────────────────────────

export function IllTirePressure() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a0a00,#2e1800)">
      <motion.span animate={pulse} className="material-symbols-outlined" style={{ fontSize: 32, color: '#888', position: 'absolute' }}>radio_button_unchecked</motion.span>
      <motion.span animate={bounce} className="material-symbols-outlined" style={{ fontSize: 18, color: '#ff8c00', zIndex: 1 }}>compress</motion.span>
    </IllustrationBase>
  )
}

export function IllTreadCheck() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d0d,#1a1a1a)">
      <motion.span animate={spin} className="material-symbols-outlined" style={{ fontSize: 38, color: '#555' }}>radio_button_unchecked</motion.span>
      <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ff6600', position: 'absolute' }}>search</span>
    </IllustrationBase>
  )
}

export function IllWheelBearings() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001020,#002030)">
      <motion.span animate={spin} className="material-symbols-outlined" style={{ fontSize: 38, color: '#00d4ff' }}>motion_blur</motion.span>
    </IllustrationBase>
  )
}

export function IllClutchLever() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001020,#002030)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 36, color: '#00d4ff' }}>back_hand</motion.span>
    </IllustrationBase>
  )
}

export function IllBrakeResistance() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a0000,#2e0000)">
      <motion.span animate={pulse} className="material-symbols-outlined" style={{ fontSize: 36, color: '#ff3333' }}>pan_tool</motion.span>
    </IllustrationBase>
  )
}

export function IllThrottleSnap() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d0d,#1a1a1a)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 36, color: '#c8f500' }}>rotate_right</motion.span>
      <motion.span animate={bounce} className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff', position: 'absolute', bottom: 8, right: 8 }}>arrow_back</motion.span>
    </IllustrationBase>
  )
}

export function IllHeadlight() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0a0a00,#1a1a00)">
      <motion.span animate={pulse} className="material-symbols-outlined" style={{ fontSize: 40, color: '#ffd700' }}>highlight</motion.span>
    </IllustrationBase>
  )
}

export function IllIndicators() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a0800,#2e1400)">
      <motion.span animate={blink} className="material-symbols-outlined" style={{ fontSize: 38, color: '#ff8c00' }}>directions</motion.span>
    </IllustrationBase>
  )
}

export function IllBrakeLight() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#1a0000,#2e0000)">
      <motion.span animate={blink} className="material-symbols-outlined" style={{ fontSize: 38, color: '#ff3333' }}>circle</motion.span>
      <span style={{ fontSize: 9, color: '#fff', fontWeight: 900, position: 'absolute' }}>BRAKE</span>
    </IllustrationBase>
  )
}

export function IllOilLevel() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0800,#1e1400)">
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 38, color: '#cc8800' }}>opacity</motion.span>
    </IllustrationBase>
  )
}

export function IllBrakeFluid() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001a1a,#002e2e)">
      <motion.span animate={bounce} className="material-symbols-outlined" style={{ fontSize: 36, color: '#00d4ff' }}>local_drink</motion.span>
    </IllustrationBase>
  )
}

export function IllLeakCheck() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0a0d00,#141a00)">
      <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#444', position: 'absolute' }}>two_wheeler</span>
      <motion.span animate={drip} className="material-symbols-outlined" style={{ fontSize: 18, color: '#ff6600', zIndex: 1, marginTop: 12 }}>water_drop</motion.span>
    </IllustrationBase>
  )
}

export function IllChainTension() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d0d,#1a1200)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 36, color: '#aaa' }}>linear_scale</motion.span>
    </IllustrationBase>
  )
}

export function IllForkSeal() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#001020,#001828)">
      <motion.span animate={bounce} className="material-symbols-outlined" style={{ fontSize: 36, color: '#00d4ff' }}>expand</motion.span>
    </IllustrationBase>
  )
}

export function IllSideStand() {
  return (
    <IllustrationBase bg="linear-gradient(135deg,#0d0d0d,#1a1a1a)">
      <motion.span animate={wave} className="material-symbols-outlined" style={{ fontSize: 36, color: '#c8f500' }}>rotate_left</motion.span>
    </IllustrationBase>
  )
}
