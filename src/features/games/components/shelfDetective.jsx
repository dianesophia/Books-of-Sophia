import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveGameResult } from '@/lib/gameResults'

/* ---------- Scene: a bookshelf built once from a fixed seed ---------- */

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SHELF_BOTTOMS = [150, 280, 410, 540]
const PALETTE = ['#8b5e3c', '#a46b5c', '#6b7d48', '#8a9a63', '#b08a5b', '#5e4632', '#7a6a8a', '#4f6b6b', '#b5766f', '#c9a24a']

function buildBooks() {
  const rand = mulberry32(42)
  const books = []
  SHELF_BOTTOMS.forEach((bottom, s) => {
    let x = 30
    while (x < 765) {
      const w = 16 + rand() * 18
      const h = 70 + rand() * 45
      if (x + w > 770) break
      books.push({
        key: `${s}-${Math.round(x)}`,
        x,
        y: bottom - h,
        w,
        h,
        color: PALETTE[Math.floor(rand() * PALETTE.length)],
      })
      x += w + (rand() < 0.15 ? 4 + rand() * 8 : 0.5)
    }
  })
  return books
}

const BOOKS = buildBooks()

/* Decoys: shiny bits and ribbons that look like clues but are not */
function buildDecoys() {
  const rand = mulberry32(7)
  const decoys = []
  for (let i = 0; i < 45; i++) {
    const shelf = Math.floor(rand() * SHELF_BOTTOMS.length)
    const kind = rand() < 0.5 ? 'coin' : 'ribbon'
    decoys.push({
      key: `d${i}`,
      kind,
      x: 35 + rand() * 730,
      y: SHELF_BOTTOMS[shelf] - 15 - rand() * 90,
      rot: rand() * 60 - 30,
      color: kind === 'coin' ? ['#e0b64a', '#c9a24a', '#d8b27a'][Math.floor(rand() * 3)] : ['#b5766f', '#8a9a63', '#f3ece0'][Math.floor(rand() * 3)],
    })
  }
  return decoys
}

const DECOYS = buildDecoys()

/* Difficulty: more objects, smaller objects, less time, fewer hints */
const LEVELS = [
  { name: 'Apprentice', count: 6, scale: 0.9, time: 150, hints: 3 },
  { name: 'Sleuth', count: 8, scale: 0.7, time: 120, hints: 2 },
  { name: 'Master Detective', count: 10, scale: 0.55, time: 100, hints: 1 },
]
const MISS_PENALTY = 5

/* Places where an object can be hidden (all land on top of books) */
const SPOTS = [
  { x: 95, y: 110 }, { x: 230, y: 70 }, { x: 380, y: 120 }, { x: 520, y: 100 }, { x: 660, y: 75 }, { x: 740, y: 125 },
  { x: 60, y: 250 }, { x: 180, y: 230 }, { x: 330, y: 215 }, { x: 470, y: 245 }, { x: 610, y: 205 }, { x: 720, y: 250 },
  { x: 110, y: 365 }, { x: 260, y: 335 }, { x: 420, y: 375 }, { x: 580, y: 345 }, { x: 700, y: 385 },
  { x: 90, y: 490 }, { x: 240, y: 465 }, { x: 400, y: 505 }, { x: 550, y: 475 }, { x: 690, y: 510 },
]

/* ---------- Hidden objects (drawn around 0,0, roughly 28px wide) ---------- */

function KeyIcon() {
  return (
    <g fill="none" stroke="#e0b64a" strokeWidth="3" strokeLinecap="round">
      <circle cx="-8" cy="0" r="5" />
      <line x1="-3" y1="0" x2="13" y2="0" />
      <line x1="8" y1="0" x2="8" y2="5" />
      <line x1="12" y1="0" x2="12" y2="4" />
    </g>
  )
}

function GlassesIcon() {
  return (
    <g fill="rgba(255,255,255,0.35)" stroke="#2f2a22" strokeWidth="2" strokeLinecap="round">
      <circle cx="-8" cy="0" r="6" />
      <circle cx="8" cy="0" r="6" />
      <line x1="-2" y1="-1" x2="2" y2="-1" />
      <line x1="-14" y1="-1" x2="-17" y2="-4" />
      <line x1="14" y1="-1" x2="17" y2="-4" />
    </g>
  )
}

function TeacupIcon() {
  return (
    <g stroke="#6f6556" strokeWidth="1.5">
      <ellipse cx="0" cy="12" rx="12" ry="3" fill="#f3ece0" />
      <path d="M-10 -6 h18 v8 a9 9 0 0 1 -18 0 z" fill="#f3ece0" />
      <path d="M8 -3 a5 5 0 0 1 0 9" fill="none" />
    </g>
  )
}

function FeatherIcon() {
  return (
    <g>
      <path d="M-12 12 Q-14 -8 12 -12 Q10 8 -12 12 Z" fill="#e9eed7" stroke="#6b7d48" strokeWidth="1.5" />
      <line x1="-12" y1="12" x2="8" y2="-8" stroke="#6b7d48" strokeWidth="1.5" />
    </g>
  )
}

function CandleIcon() {
  return (
    <g>
      <rect x="-5" y="-4" width="10" height="18" rx="1" fill="#f3ead0" stroke="#b8a77a" strokeWidth="1.5" />
      <path d="M0 -15 q6 6 0 11 q-6 -5 0 -11" fill="#e8a23a" />
    </g>
  )
}

function MagnifierIcon() {
  return (
    <g fill="none" stroke="#2f2a22" strokeWidth="3" strokeLinecap="round">
      <circle cx="-3" cy="-3" r="8" fill="rgba(255,255,255,0.35)" />
      <line x1="3" y1="3" x2="12" y2="12" />
    </g>
  )
}

function EnvelopeIcon() {
  return (
    <g stroke="#6f6556" strokeWidth="1.5" fill="none">
      <rect x="-12" y="-8" width="24" height="16" rx="1" fill="#f3ece0" />
      <path d="M-12 -8 L0 2 L12 -8" />
    </g>
  )
}

function PocketWatchIcon() {
  return (
    <g>
      <path d="M0 -10 q-8 -8 -12 -2" fill="none" stroke="#8a6a1a" strokeWidth="1.5" />
      <circle cx="0" cy="3" r="9" fill="#e0b64a" stroke="#8a6a1a" strokeWidth="1.5" />
      <circle cx="0" cy="3" r="6" fill="#fbf6ea" />
      <path d="M0 3 V-1 M0 3 L3 5" stroke="#2f2a22" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  )
}

function ScissorsIcon() {
  return (
    <g strokeLinecap="round">
      <line x1="-6" y1="4" x2="6" y2="-12" stroke="#2f2a22" strokeWidth="2" />
      <line x1="6" y1="4" x2="-6" y2="-12" stroke="#2f2a22" strokeWidth="2" />
      <circle cx="-7" cy="9" r="4" fill="none" stroke="#b5766f" strokeWidth="2.5" />
      <circle cx="7" cy="9" r="4" fill="none" stroke="#b5766f" strokeWidth="2.5" />
    </g>
  )
}

function AcornIcon() {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="7" ry="9" fill="#c9a24a" />
      <path d="M-9 -1 a9 7 0 0 1 18 0 z" fill="#8b5e3c" />
      <line x1="0" y1="-8" x2="0" y2="-13" stroke="#5e4632" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

const ITEMS = [
  { id: 'key', name: 'Brass key', Icon: KeyIcon },
  { id: 'glasses', name: 'Reading glasses', Icon: GlassesIcon },
  { id: 'teacup', name: 'Teacup', Icon: TeacupIcon },
  { id: 'feather', name: 'Feather quill', Icon: FeatherIcon },
  { id: 'candle', name: 'Candle', Icon: CandleIcon },
  { id: 'magnifier', name: 'Magnifying glass', Icon: MagnifierIcon },
  { id: 'envelope', name: 'Old letter', Icon: EnvelopeIcon },
  { id: 'watch', name: 'Pocket watch', Icon: PocketWatchIcon },
  { id: 'scissors', name: 'Scissors', Icon: ScissorsIcon },
  { id: 'acorn', name: 'Acorn', Icon: AcornIcon },
]

/* ---------- Helpers ---------- */

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function newRound(count) {
  const spots = shuffle(SPOTS).slice(0, count)
  return shuffle(ITEMS)
    .slice(0, count)
    .map((item, i) => ({ ...item, x: spots[i].x, y: spots[i].y, rot: Math.random() * 70 - 35 }))
}

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

/* ---------- Game ---------- */

function ShelfDetective() {
  const navigate = useNavigate()

  const [level, setLevel] = useState(0)
  const [round, setRound] = useState(() => newRound(LEVELS[0].count))
  const [found, setFound] = useState([])
  const [misses, setMisses] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(LEVELS[0].hints)
  const [hintId, setHintId] = useState(null)
  const [missMark, setMissMark] = useState(null)
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time)
  const [reward, setReward] = useState(null)

  const config = LEVELS[level]
  const won = found.length === round.length
  const lost = !won && timeLeft <= 0
  const finished = won || lost
  const isLastLevel = level === LEVELS.length - 1

  // Save the result once when the round ends (win or lose)
  useEffect(() => {
    if (!finished) return
    saveGameResult({
      game: 'shelf_detective',
      level,
      won,
      seconds: config.time - timeLeft,
      misses,
      hints: config.hints - hintsLeft,
    }).then(setReward)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  // Countdown
  useEffect(() => {
    if (finished) return
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(timer)
  }, [finished])

  // Hint highlight fades after a moment
  useEffect(() => {
    if (!hintId) return
    const t = setTimeout(() => setHintId(null), 2000)
    return () => clearTimeout(t)
  }, [hintId])

  // Miss mark fades quickly
  useEffect(() => {
    if (!missMark) return
    const t = setTimeout(() => setMissMark(null), 700)
    return () => clearTimeout(t)
  }, [missMark])

  const startLevel = (lv) => {
    const cfg = LEVELS[lv]
    setLevel(lv)
    setReward(null)
    setRound(newRound(cfg.count))
    setFound([])
    setMisses(0)
    setHintsLeft(cfg.hints)
    setHintId(null)
    setMissMark(null)
    setTimeLeft(cfg.time)
  }

  const handleFind = (e, id) => {
    e.stopPropagation()
    if (finished || found.includes(id)) return
    setFound((f) => [...f, id])
    if (id === hintId) setHintId(null)
  }

  const handleMiss = (e) => {
    if (finished) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) * 800) / rect.width
    const y = ((e.clientY - rect.top) * 560) / rect.height
    setMisses((m) => m + 1)
    setTimeLeft((t) => Math.max(0, t - MISS_PENALTY))
    setMissMark({ x, y, id: Date.now() })
  }

  const handleHint = () => {
    if (finished || hintsLeft <= 0) return
    const next = round.find((item) => !found.includes(item.id))
    if (!next) return
    setHintsLeft((h) => h - 1)
    setHintId(next.id)
  }

  const lowTime = timeLeft <= 15 && !finished

  return (
    <section className="flex min-h-screen w-full flex-col bg-[#faf3e6] px-6 py-6 font-serif text-[#2f2a22] md:px-12 md:py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 text-sm text-[#6f6556] hover:text-[#2f2a22]"
          >
            &larr; Back to games
          </button>
          <h1 className="mb-1 text-4xl font-normal">Shelf Detective</h1>
          <p className="text-lg">
            Level {level + 1} of {LEVELS.length}: {config.name}
          </p>
          <p className="text-sm text-[#6f6556]">
            Every wrong click costs you {MISS_PENALTY} seconds. Beware of shiny decoys!
          </p>
        </div>

        <div className="flex gap-3 text-center">
          <div
            className={`min-w-[84px] rounded-xl border px-4 py-2 ${
              lowTime ? 'animate-pulse border-[#b5766f] bg-[#f6dcd6]' : 'border-[#e3d8bf] bg-[#fbf6ea]'
            }`}
          >
            <div className="text-xs text-[#6f6556]">Time left</div>
            <div className="text-xl">{formatTime(timeLeft)}</div>
          </div>
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Found</div>
            <div className="text-xl">{found.length}/{round.length}</div>
          </div>
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Misses</div>
            <div className="text-xl">{misses}</div>
          </div>
        </div>
      </div>

      {/* Items to find */}
      <ul className="mb-6 flex flex-wrap gap-3">
        {round.map(({ id, name, Icon }) => {
          const isFound = found.includes(id)
          return (
            <li
              key={id}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                isFound
                  ? 'border-[#b9c79a] bg-[#e4ebd0] text-[#586a3a] line-through opacity-80'
                  : 'border-[#e3d8bf] bg-[#fbf6ea]'
              }`}
            >
              <svg viewBox="-18 -18 36 36" className="h-7 w-7 rounded-full bg-[#4a3524]" aria-hidden="true">
                <Icon />
              </svg>
              {name}
            </li>
          )
        })}
      </ul>

      {/* The scene */}
      <div className="mx-auto w-full max-w-4xl">
        <svg
          viewBox="0 0 800 560"
          role="img"
          aria-label="A crowded bookshelf with hidden objects"
          onClick={handleMiss}
          className="w-full cursor-crosshair select-none rounded-2xl border border-[#e3d8bf] shadow-sm"
        >
          {/* Shelf frame */}
          <rect x="0" y="0" width="800" height="560" fill="#4a3524" />
          <rect x="0" y="0" width="20" height="560" fill="#7a5638" />
          <rect x="780" y="0" width="20" height="560" fill="#7a5638" />

          {/* Books */}
          {BOOKS.map((b) => (
            <g key={b.key}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
              <rect x={b.x} y={b.y + b.h * 0.15} width={b.w} height="4" fill="rgba(255,255,255,0.3)" />
              <rect x={b.x} y={b.y + b.h * 0.8} width={b.w} height="3" fill="rgba(255,255,255,0.2)" />
            </g>
          ))}

          {/* Decoys (clicking one counts as a miss) */}
          {DECOYS.map((d) => (
            <g key={d.key} transform={`translate(${d.x} ${d.y}) rotate(${d.rot})`}>
              {d.kind === 'coin' ? (
                <circle r="4" fill={d.color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
              ) : (
                <rect x="-2" y="-9" width="4" height="18" fill={d.color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
              )}
            </g>
          ))}

          {/* Shelf boards */}
          {SHELF_BOTTOMS.map((y) => (
            <rect key={y} x="20" y={y} width="760" height="12" fill="#7a5638" />
          ))}

          {/* Hidden objects: small, tilted, and not obvious */}
          {round.map(({ id, name, x, y, rot, Icon }) => {
            const isFound = found.includes(id)
            return (
              <g
                key={id}
                transform={`translate(${x} ${y})`}
                onClick={(e) => handleFind(e, id)}
                className="cursor-pointer"
                aria-label={isFound ? `${name} (found)` : undefined}
              >
                <g transform={`rotate(${rot}) scale(${config.scale})`} opacity={isFound ? 1 : 0.92}>
                  <Icon />
                </g>
                {isFound && (
                  <circle r="20" fill="rgba(107,125,72,0.25)" stroke="#6b7d48" strokeWidth="3" />
                )}
                {hintId === id && !isFound && (
                  <circle r="34" fill="none" stroke="#e0b64a" strokeWidth="3" className="animate-pulse" />
                )}
                {/* Invisible hit area, kept small on purpose */}
                <circle r={Math.max(14, 20 * config.scale)} fill="transparent" />
              </g>
            )
          })}

          {/* Miss marker */}
          {missMark && (
            <g key={missMark.id} className="pointer-events-none animate-pulse">
              <text
                x={missMark.x}
                y={missMark.y}
                fontSize="26"
                fill="#e58a7f"
                textAnchor="middle"
                dominantBaseline="central"
              >
                ✕
              </text>
              <text x={missMark.x} y={missMark.y - 22} fontSize="14" fill="#e58a7f" textAnchor="middle">
                -{MISS_PENALTY}s
              </text>
            </g>
          )}
        </svg>

        {/* Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleHint}
            disabled={finished || hintsLeft <= 0}
            className="rounded-lg border border-[#6b7d48] px-5 py-2.5 text-sm text-[#586a3a] transition-colors hover:bg-[#e4ebd0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Hint ({hintsLeft} left)
          </button>
          <button
            type="button"
            onClick={() => startLevel(level)}
            className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
          >
            New scene
          </button>
        </div>

        {/* Win message */}
        {won && (
          <div className="mt-6 rounded-2xl border border-[#b9c79a] bg-[#e4ebd0] p-6 text-center">
            <h2 className="mb-2 text-2xl font-normal">
              {isLastLevel ? 'You are a Master Detective!' : 'Case closed!'}
            </h2>
            <p className="mb-4">
              You found all {round.length} objects with {formatTime(timeLeft)} to spare and {misses}{' '}
              {misses === 1 ? 'miss' : 'misses'}.
            </p>
            {reward && reward.xp_earned > 0 && (
                <p className="mb-4 text-sm text-[#586a3a]">
                  +{reward.xp_earned} XP{reward.leveled_up ? ` - Level up! You are now level ${reward.level}` : ''}
                </p>
              )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startLevel(isLastLevel ? 0 : level + 1)}
                className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a]"
              >
                {isLastLevel ? 'Play again from level 1' : `Next level: ${LEVELS[level + 1].name}`}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-[#6b7d48] px-5 py-2.5 text-sm text-[#586a3a] transition-colors hover:bg-[#d6e0bb]"
              >
                Back to games
              </button>
            </div>
          </div>
        )}

        {/* Lose message */}
        {lost && (
          <div className="mt-6 rounded-2xl border border-[#d9b8ad] bg-[#f6dcd6] p-6 text-center">
            <h2 className="mb-2 text-2xl font-normal">Time is up!</h2>
            <p className="mb-4">
              You found {found.length} of {round.length} objects. Give it another go!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => startLevel(level)}
                className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-[#6b7d48] px-5 py-2.5 text-sm text-[#586a3a] transition-colors hover:bg-[#ead0c8]"
              >
                Back to games
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ShelfDetective