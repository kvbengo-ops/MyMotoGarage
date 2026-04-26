import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBikeById } from '../data/fleet'

export default function AiMechanic() {
  const { bikeId } = useParams()
  const navigate = useNavigate()
  const bike = getBikeById(bikeId)

  const [input, setInput] = useState('')
  const [showToast, setShowToast] = useState(false)

  if (!bike) return null

  const activeThread = bike.chatThread || []

  const handleSend = () => {
    if (!input.trim()) return
    setInput('')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    /* Full-height column, fixed inside the phone shell */
    <div
      className="flex flex-col"
      style={{
        height: 'calc(100dvh - 72px)',
        background: 'var(--ds-bg)',
        overflow: 'hidden',
      }}
    >
      {/* ── App Bar ── */}
      <header
        className="flex-shrink-0 flex items-center gap-3 px-5 h-14"
        style={{
          background: 'var(--ds-glass-bg)',
          borderBottom: '1px solid var(--ds-glass-border)',
          backdropFilter: 'blur(16px)',
          transition: 'background-color 0.3s'
        }}
      >
        <button onClick={() => navigate('/')} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ds-text-secondary)', marginRight: '-4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back</span>
        </button>
        <span className="material-symbols-filled text-[20px] transition-colors" style={{ color: 'var(--ds-amber)' }}>smart_toy</span>
        <div className="flex-1">
          <h1 className="text-[15px] font-black uppercase tracking-[0.1em] transition-colors leading-tight" style={{ color: 'var(--ds-amber)' }}>
            {bike.model} AI
          </h1>
          <p className="text-[10px] tracking-wide transition-colors" style={{ color: 'var(--ds-text-muted)' }}>Digital Garage Intelligence</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[11px] text-green-400 font-semibold">Online</span>
        </div>
      </header>

      {/* ── Chat Thread ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Date chip */}
        <div className="flex items-center gap-3 mb-1">
          <div className="flex-1 h-px transition-colors" style={{ background: 'var(--ds-border)' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: 'var(--ds-text-secondary)' }}>Today</span>
          <div className="flex-1 h-px transition-colors" style={{ background: 'var(--ds-border)' }} />
        </div>

        {activeThread.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI avatar */}
            {!msg.isUser && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 transition-colors"
                style={{ background: 'color-mix(in srgb, var(--ds-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--ds-amber) 25%, transparent)' }}
              >
                <span className="material-symbols-filled text-[14px] transition-colors" style={{ color: 'var(--ds-amber)' }}>smart_toy</span>
              </div>
            )}

            {/* Bubble */}
            <div
              className="text-[14px] leading-relaxed"
              style={{
                maxWidth: '78%',
                padding: '12px 14px',
                borderRadius: msg.isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                ...(msg.isUser
                  ? { background: 'var(--ds-amber)', color: '#000' }
                  : {
                      background: 'var(--ds-surface)',
                      color: 'var(--ds-text-primary)',
                      border: '1px solid var(--ds-border)',
                    }),
              }}
            >
              {msg.text}
              <div
                className="text-[10px] mt-1.5"
                style={{ color: msg.isUser ? 'rgba(0,0,0,0.45)' : '#555', textAlign: msg.isUser ? 'right' : 'left' }}
              >
                {msg.time}
              </div>
            </div>

            {/* User avatar */}
            {msg.isUser && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 text-[12px] font-bold transition-colors"
                style={{ background: 'color-mix(in srgb, var(--ds-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--ds-amber) 25%, transparent)', color: 'var(--ds-amber)' }}
              >
                R
              </div>
            )}
          </div>
        ))}

        {/* Typing dots */}
        <div className="flex items-end gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, var(--ds-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--ds-amber) 25%, transparent)' }}
          >
            <span className="material-symbols-filled text-[14px]" style={{ color: 'var(--ds-amber)' }}>smart_toy</span>
          </div>
          <div
            className="px-4 py-3 rounded-[16px] rounded-bl-[4px]"
            style={{ background: 'var(--ds-surface)', border: '1px solid var(--ds-border)' }}
          >
            <div className="flex items-center gap-1.5">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-neutral-500"
                  style={{ animation: `bounce 1.2s ease-in-out ${delay}s infinite` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Input Bar ── */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
        style={{
          background: 'var(--ds-glass-bg)',
          borderTop: '1px solid var(--ds-glass-border)',
          backdropFilter: 'blur(16px)',
          transition: 'background-color 0.3s'
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your AI Mechanic…"
          className="flex-1 text-[14px] outline-none transition-all placeholder:text-[var(--ds-text-muted)] focus:placeholder:opacity-50"
          style={{
            background: 'var(--ds-surface)',
            border: '1.5px solid var(--ds-border)',
            borderRadius: '10px',
            padding: '12px 14px',
            color: 'var(--ds-text-primary)',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--ds-amber)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--ds-border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={handleSend}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
          style={{ background: 'var(--ds-amber)', boxShadow: '0 4px 14px color-mix(in srgb, var(--ds-amber) 30%, transparent)' }}
        >
          <span className="material-symbols-filled text-[20px] text-black">send</span>
        </button>
      </div>

      {/* ── Toast ── */}
      {showToast && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-semibold z-50 whitespace-nowrap"
          style={{
            background: 'rgba(30,30,30,0.95)',
            border: '1px solid rgba(255,140,0,0.3)',
            color: '#ddc1ae',
            backdropFilter: 'blur(12px)',
          }}
        >
          🔧 This is a static UI mockup
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
