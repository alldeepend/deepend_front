import { useEffect, useRef, useState } from 'react'
import { Quote, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import { C } from '../../styles/colors'
import { testimonials } from '../../data/testimonials'

const body = { fontFamily: 'Montserrat, sans-serif', color: C.textMuted }

function AudioPlayer({ src, color }: { src: string; color: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    const a = ref.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play().catch(() => {}); setPlaying(true) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current
    if (!a || !a.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const pct  = duration ? (current / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 mt-4 pt-4 border-t" style={{ borderColor: color + '30' }}>
      <audio
        ref={ref}
        src={src}
        onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); setCurrent(0) }}
      />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
        style={{ background: color + '25' }}
      >
        {playing
          ? <Pause size={13} style={{ color }} />
          : <Play  size={13} style={{ color, marginLeft: 1 }} />
        }
      </button>
      <div
        className="flex-1 h-1 rounded-full cursor-pointer relative"
        style={{ background: color + '25' }}
        onClick={seek}
      >
        <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: '#6B6460' }}>
        {fmt(current)} / {fmt(duration)}
      </span>
    </div>
  )
}

export function TestimonialCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const pausedRef = useRef(false)

  const stepBy = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * dir, behavior: 'smooth' })
  }

  const goNext = () => {
    const el = scrollerRef.current
    if (!el) return
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      stepBy(1)
    }
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      setAtStart(el.scrollLeft <= 4)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    }
    onScroll()
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => { if (!pausedRef.current) goNext() }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="relative mt-12"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <div className="px-8 sm:px-10">
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto no-scrollbar"
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {testimonials.map(t => (
          <div
            key={t.name}
            data-card
            className="rounded-2xl border overflow-hidden flex flex-col flex-shrink-0 w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            style={{ background: C.surface1, borderColor: C.border, scrollSnapAlign: 'start' }}
          >
            {/* Imagen */}
            <div className="relative h-44 bg-surface2 flex-shrink-0" style={{ background: C.surface2 }}>
              <img
                src={t.img}
                alt={t.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 37%' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              {/* Gradiente para leer el texto encima si se superpone */}
              <div className="absolute bottom-0 inset-x-0 h-10" style={{ background: `linear-gradient(to top, ${C.surface1}, transparent)` }} />
            </div>

            {/* Contenido */}
            <div className="p-5 flex flex-col flex-1">
              <Quote size={18} style={{ color: t.color }} />
              <p className="text-sm mt-3 leading-relaxed flex-1" style={{ color: C.text + 'd9' }}>
                "{t.text}"
              </p>
              <div className="mt-4">
                <p className="text-sm font-bold" style={{ color: C.text }}>{t.name}</p>
                <p className="text-xs" style={body}>{t.role}</p>
              </div>
              <AudioPlayer src={t.audio} color={t.color} />
            </div>
          </div>
        ))}
      </div>
      </div>

      <button
        onClick={() => stepBy(-1)}
        disabled={atStart}
        aria-label="Testimonio anterior"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-0 disabled:pointer-events-none"
        style={{ background: C.surface1, borderColor: C.border, color: C.text }}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => (atEnd ? scrollerRef.current?.scrollTo({ left: 0, behavior: 'smooth' }) : stepBy(1))}
        aria-label="Siguiente testimonio"
        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-opacity hover:opacity-90"
        style={{ background: C.surface1, borderColor: C.border, color: C.text }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
