import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GardenBackground from "@/assets/background/reading_garden.jpg"

/* ---------- Your data (replace with real values from your app) ---------- */


/* ---------- Plant and decoration icons (simple SVG, 48x48) ---------- */

function PotIcon() {
  return (
    <g>
      <path d="M17 32 h14 l-2 11 h-10 z" fill="#c98a5a" stroke="#8a5a34" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 32 v-10" stroke="#6b7d48" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 26 q-9 0 -10 -9 q9 0 10 9" fill="#8a9a63" />
      <path d="M24 22 q9 0 10 -9 q-9 0 -10 9" fill="#a9b58a" />
    </g>
  )
}

function DaisyIcon() {
  return (
    <g>
      <path d="M24 24 v20" stroke="#6b7d48" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 38 q-8 0 -9 -6 q8 0 9 6" fill="#8a9a63" />
      <path d="M24 34 q8 0 9 -6 q-8 0 -9 6" fill="#8a9a63" />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="24" cy="10" rx="3.4" ry="7" fill="#fff" stroke="#d8cdb0" strokeWidth="0.8" transform={`rotate(${i * 45} 24 18)`} />
      ))}
      <circle cx="24" cy="18" r="4.5" fill="#e8b84a" />
    </g>
  )
}

function SunflowerIcon() {
  return (
    <g>
      <path d="M24 26 v18" stroke="#6b7d48" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 38 q-9 0 -10 -7 q9 0 10 7" fill="#8a9a63" />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="24" cy="9" rx="3" ry="6.5" fill="#f0c04a" transform={`rotate(${i * 30} 24 18)`} />
      ))}
      <circle cx="24" cy="18" r="6" fill="#7a4a2a" />
    </g>
  )
}

function LavenderIcon() {
  return (
    <g>
      <path d="M24 14 v30" stroke="#6b7d48" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 36 q-7 -1 -9 -7 q7 0 9 7" fill="#8a9a63" />
      {[8, 14, 20, 26].map((y) => (
        <g key={y}>
          <ellipse cx="20.5" cy={y + 3} rx="2.6" ry="3.6" fill="#a58bc9" />
          <ellipse cx="27.5" cy={y + 3} rx="2.6" ry="3.6" fill="#a58bc9" />
          <ellipse cx="24" cy={y} rx="2.6" ry="3.6" fill="#b79ddb" />
        </g>
      ))}
    </g>
  )
}

function TulipIcon() {
  return (
    <g>
      <path d="M24 24 v20" stroke="#6b7d48" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 42 q-10 -2 -11 -12 q9 2 11 12" fill="#8a9a63" />
      <path d="M24 38 q9 -2 10 -10 q-8 1 -10 10" fill="#a9b58a" />
      <path d="M14 10 q10 3 20 0 q2 10 -5 15 q-5 3 -10 0 q-7 -5 -5 -15 z" fill="#e8849a" stroke="#c96b82" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M24 10 q-3 7 0 15" fill="none" stroke="#c96b82" strokeWidth="1" />
    </g>
  )
}

function LanternIcon() {
  return (
    <g stroke="#4a3524" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M20 10 q4 -6 8 0" fill="none" />
      <path d="M18 14 h12 l2 4 h-16 z" fill="#6b5a44" />
      <rect x="17" y="18" width="14" height="16" fill="#f3d27a" />
      <path d="M24 18 v16 M17 26 h14" fill="none" />
      <path d="M16 34 h16 l2 6 h-20 z" fill="#6b5a44" />
    </g>
  )
}

function BenchIcon() {
  return (
    <g stroke="#6b4a2f" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M10 16 h28 v8 h-28 z" fill="#d8b27a" />
      <path d="M12 28 h24 v5 h-24 z" fill="#c9a064" />
      <path d="M13 33 v8 M35 33 v8 M12 24 v4 M36 24 v4" fill="none" />
      <path d="M17 16 v8 M24 16 v8 M31 16 v8" fill="none" />
    </g>
  )
}

function WateringCanIcon() {
  return (
    <g stroke="#4f6b6b" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 20 h18 l-1 18 h-16 z" fill="#8fb0a6" />
      <path d="M30 26 l10 -8 v4 l-10 8" fill="#8fb0a6" />
      <path d="M12 24 q-6 0 -6 6 q0 4 6 4" fill="none" />
      <path d="M16 20 q6 -8 12 0" fill="none" />
    </g>
  )
}

function PlanterIcon() {
  return (
    <g>
      <path d="M13 32 h22 l-2 11 h-18 z" fill="#c98a5a" stroke="#8a5a34" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 32 v-14 M24 28 q-8 -2 -9 -9 M24 24 q8 -2 9 -9" stroke="#6b7d48" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="15" cy="17" r="3.2" fill="#e8849a" />
      <circle cx="33" cy="13" r="3.2" fill="#f0c04a" />
      <circle cx="24" cy="14" r="3.2" fill="#fff" stroke="#d8cdb0" strokeWidth="0.8" />
    </g>
  )
}

/* ---------- Data ---------- */

const PLANTS = [
  { id: 'daisy', name: 'Daisy', count: 5, Icon: DaisyIcon },
  { id: 'sunflower', name: 'Sunflower', count: 3, Icon: SunflowerIcon },
  { id: 'lavender', name: 'Lavender', count: 2, Icon: LavenderIcon },
  { id: 'tulip', name: 'Tulip', count: 1, Icon: TulipIcon },
]

const DECORATIONS = [
  { id: 'lantern', name: 'Lantern', Icon: LanternIcon },
  { id: 'bench', name: 'Garden bench', Icon: BenchIcon },
  { id: 'watering-can', name: 'Watering can', Icon: WateringCanIcon },
  { id: 'planter', name: 'Flower planter', Icon: PlanterIcon },
]

/* ---------- Pieces ---------- */

function Art({ Icon, className = 'h-12 w-12' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <Icon />
    </svg>
  )
}

function Panel({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea]/90 shadow-md backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3 text-left text-base font-semibold"
      >
        {title}
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-[#6f6556] transition-transform ${open ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12 l5 -5 l5 5" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

function SeedCount({ count }) {
  return (
    <span className="flex items-center gap-1 text-xs text-[#6f6556]">
      <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
        <path d="M6 1 q4 4 0 9 q-4 -5 0 -9" fill="#e0903a" />
      </svg>
      {count}
    </span>
  )
}

/* ---------- Page ---------- */


function MyGarden() {
  const [stats, setStats] = useState(null)
  const [signedOut, setSignedOut] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const { data: auth, error: authError } =
          await supabase.auth.getUser()

        if (authError) throw authError

        if (!auth?.user) {
          if (!cancelled) {
            setSignedOut(true)
            setLoading(false)
          }
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('level, level_title, xp, xp_needed')
          .eq('id', auth.user.id)
          .single()

        if (error) throw error

        if (!cancelled) {
          setStats(data)
          setSignedOut(false)
        }
      } catch (error) {
        console.error('Could not load garden XP:', error.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStats()

    return () => {
      cancelled = true
    }
  }, [])

  const xp = Number(stats?.xp ?? 0)
  const xpNeeded = Number(stats?.xp_needed ?? 0)
  const level = stats?.level ?? 1

  const xpPercent =
    xpNeeded > 0
      ? Math.min(100, Math.round((xp / xpNeeded) * 100))
      : 0

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#faf3e6] font-serif text-[#2f2a22]">
      {/* Background scene */}
      <img
        src={GardenBackground}
        alt="A sunny reading garden with a potting shelf, flowers and a cat"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative grid min-h-screen gap-6 px-6 py-8 md:px-12 md:py-10 lg:grid-cols-[1fr_minmax(320px,380px)]">
        {/* Title over the scene */}
        <div className="min-h-[260px]">
          <h1 className="mb-1 text-4xl font-normal [text-shadow:0_1px_3px_rgba(255,255,255,0.9)]">
            My Garden
          </h1>
          <p className="text-base [text-shadow:0_1px_3px_rgba(255,255,255,0.9)]">
            Read more. Grow more.
          </p>
        </div>

        {/* Side panels */}
        <div className="flex flex-col gap-4 lg:mt-16">
          {/* Garden XP — synced with the Games page */}
          <div className="flex items-center gap-4 rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea]/90 p-4 shadow-md backdrop-blur-sm">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f1e8d3]">
              <Art Icon={PotIcon} className="h-11 w-11" />
            </div>

            <div className="min-w-0 flex-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-[#e3d8bf]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#e3d8bf]" />
                  <div className="h-3 w-20 animate-pulse rounded bg-[#e3d8bf]" />
                </div>
              ) : signedOut ? (
                <p className="text-sm text-[#6f6556]">
                  Sign in to earn XP from games.
                </p>
              ) : stats ? (
                <>
                  <div className="mb-1 flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-sm font-semibold">
                      Garden Level {level}
                    </span>
                    <span className="text-xs text-[#6f6556]">
                      {stats.level_title}
                    </span>
                  </div>

                  <div
                    className="mb-1 h-3 w-full overflow-hidden rounded-full bg-[#e3d8bf]"
                    role="progressbar"
                    aria-valuenow={xp}
                    aria-valuemin={0}
                    aria-valuemax={xpNeeded}
                    aria-label="Garden experience points"
                  >
                    <div
                      className="h-full rounded-full bg-[#6b8a7a] transition-all duration-500"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between gap-2 text-[0.7rem] text-[#6f6556]">
                    <span>{xp} / {xpNeeded} XP</span>
                    <span>{Math.max(0, xpNeeded - xp)} XP to next level</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#6f6556]">
                  Unable to load your XP. Please refresh the page.
                </p>
              )}
            </div>
          </div>

          {/* Plants */}
          <Panel title="Your Plants">
            <ul className="grid grid-cols-4 gap-3">
              {PLANTS.map(({ id, name, count, Icon }) => (
                <li
                  key={id}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-[#e3d8bf] bg-[#f1e8d3] transition-transform hover:-translate-y-0.5">
                    <Art Icon={Icon} className="h-3/4 w-3/4" />
                  </div>
                  <span className="text-xs">{name}</span>
                  <SeedCount count={count} />
                </li>
              ))}
            </ul>
          </Panel>

          {/* Decorations */}
          <Panel title="Decorations">
            <ul className="grid grid-cols-4 gap-3">
              {DECORATIONS.map(({ id, name, Icon }) => (
                <li key={id} title={name}>
                  <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-[#e3d8bf] bg-[#f1e8d3] transition-transform hover:-translate-y-0.5">
                    <Art Icon={Icon} className="h-3/4 w-3/4" />
                    <span className="sr-only">{name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  )
}


export default MyGarden