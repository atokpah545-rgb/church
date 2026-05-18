import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  pulse: number
  pulseSpeed: number
}

export function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = ['#d97706', '#f59e0b', '#166534', '#15803d', '#fbbf24', '#ffffff']

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    function initParticles() {
      if (!canvas) return
      particles.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.1,
        size: Math.random() * 3 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      }))
    }

    function drawLightBeams(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
      const beams = [
        { x: w * 0.2, angle: 0.3, color: 'rgba(217,119,6,0.04)' },
        { x: w * 0.5, angle: 0, color: 'rgba(217,119,6,0.06)' },
        { x: w * 0.8, angle: -0.3, color: 'rgba(22,101,52,0.04)' },
      ]
      beams.forEach(({ x, angle, color }) => {
        ctx.save()
        ctx.translate(x + Math.sin(t * 0.0003) * 30, 0)
        ctx.rotate(angle + Math.sin(t * 0.0002) * 0.05)
        const grad = ctx.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, color)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(-80, 0, 160, h)
        ctx.restore()
      })
    }

    function draw(t: number) {
      if (!canvas || !ctx) return
      const w = canvas.width
      const h = canvas.height

      // Dark gradient base
      const bg = ctx.createLinearGradient(0, 0, w, h)
      bg.addColorStop(0, '#0a1a0a')
      bg.addColorStop(0.5, '#0d1f0d')
      bg.addColorStop(1, '#111a0a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Subtle vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9)
      vig.addColorStop(0, 'transparent')
      vig.addColorStop(1, 'rgba(0,0,0,0.5)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)

      drawLightBeams(ctx, w, h, t)

      // Particles
      particles.current.forEach(p => {
        p.pulse += p.pulseSpeed
        const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // Glow for gold particles
        if (p.color === '#d97706' || p.color === '#f59e0b') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = p.color + '15'
          ctx.fill()
        }

        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      })

      // Connect nearby particles
      particles.current.forEach((a, i) => {
        particles.current.slice(i + 1).forEach(b => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(217,119,6,${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
