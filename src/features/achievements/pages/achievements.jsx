
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

import BookLove from '@/assets/badge/badge_book_love.png'
import Book from '@/assets/badge/badge_book.png'
import Flower from '@/assets/badge/badge_flower.png'
import Key from '@/assets/badge/badge_key.png'
import Moon from '@/assets/badge/badge_moon.png'
import Quotes from '@/assets/badge/badge_quotes.png'
import Star from '@/assets/badge/badge_star.png'
import Streak from '@/assets/badge/badge_streak.png'

/* ---------- Badge Definitions ---------- */

const BADGES = [
  {
    id: 'first-chapter',
    name: 'First Chapter',
    desc: 'Read your first book',
    image: Book,
    ring: '#e3c98c',
    bg: '#f6ecd2',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    desc: 'Read after 12 AM',
    image: Moon,
    ring: '#d9b867',
    bg: '#2b3b66',
  },
  {
    id: 'genre-explorer',
    name: 'Genre Explorer',
    desc: 'Read 5 different genres',
    image: Key,
    ring: '#c9cfae',
    bg: '#dfe5cb',
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    desc: 'Read 10 books',
    image: BookLove,
    ring: '#e2a769',
    bg: '#f6e4c4',
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    desc: 'Maintain a 7-day reading streak',
    image: Streak,
    ring: '#e2a769',
    bg: '#f6e4c4',
  },
  {
    id: 'quote-collector',
    name: 'Quote Collector',
    desc: 'Save 25 quotes',
    image: Quotes,
    ring: '#e3c98c',
    bg: '#f6ecd2',
  },
  {
    id: 'garden-grower',
    name: 'Garden Grower',
    desc: 'Plant 10 flowers',
    image: Flower,
    ring: '#c9cfae',
    bg: '#dfe5cb',
  },
  {
    id: 'secret-reader',
    name: 'Secret Reader',
    desc: 'Discover a hidden achievement',
    image: Star,
    ring: '#e2a769',
    bg: '#f6e4c4',
  },
]

/* ---------- Paper Texture ---------- */

// Browser-generated paper grain; no external image needed.
const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.36 0 0 0 0 0.25 0 0 0 0.25 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`

function PaperBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
    >
      {/* Base paper color */}
      <div className="absolute inset-0 bg-[#faf3e6]" />

      {/* Natural paper grain */}
      <div
        className="absolute inset-0 opacity-50 mix-blend-multiply"
        style={{ backgroundImage: grain }}
      />

      {/* Aged and darker paper corners */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(150,115,70,0.10) 78%, rgba(120,85,50,0.22) 100%)',
        }}
      />

      {/* Soft inset paper shading */}
      <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_35px_rgba(170,140,95,0.18)]" />
    </div>
  )
}

/* ---------- Badge Medallion ---------- */

function Medallion({ badge }) {
  return (
    <div
      className={`relative flex h-24 w-24 items-center justify-center rounded-full border-[5px] shadow-sm transition duration-300 ${
        badge.unlocked
          ? 'border-[#d9bd79] bg-[#f6ecd2]'
          : 'border-[#d8d0c0] bg-[#eee8db]'
      }`}
      style={{
        boxShadow: badge.unlocked
          ? '0 4px 12px rgba(138, 106, 74, 0.15)'
          : 'none',
      }}
    >
      <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-white/70">
        <img
          src={badge.image}
          alt={badge.name}
          className={`h-16 w-16 object-contain ${
            badge.unlocked ? '' : 'grayscale opacity-50'
          }`}
        />
      </div>

      {!badge.unlocked && (
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#faf3e6] bg-[#b9ad98] text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
      )}
    </div>
  )
}

/* ---------- Badge Card ---------- */

function BadgeCard({ badge }) {
  return (
    <article
      className={`flex min-h-[245px] flex-col items-center justify-center rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] px-3 py-6 text-center transition duration-300 ${
        badge.unlocked
          ? 'hover:-translate-y-1 hover:shadow-md'
          : 'opacity-85'
      }`}
    >
      <div className="mb-4">
        <Medallion badge={badge} />
      </div>

      <h2 className="mb-1.5 text-sm font-semibold text-[#2f2a22]">
        {badge.name}
      </h2>

      <p className="max-w-[150px] text-xs leading-relaxed text-[#6f6556]">
        {badge.desc}
      </p>

      <span
        className={`mt-3 rounded-full px-3 py-1 text-[10px] font-medium ${
          badge.unlocked
            ? 'bg-[#e3eadb] text-[#496444]'
            : 'bg-[#eee7d8] text-[#817665]'
        }`}
      >
        {badge.unlocked ? '✓ Unlocked' : '🔒 Locked'}
      </span>
    </article>
  )
}

/* ---------- Progress Icon ---------- */

function StatIcon({ children }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e3d8bf] bg-[#f3e9d2]">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="#8a6a4a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
  )
}

/* ---------- Statistics ---------- */

function Stat({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 border-t border-[#e3d8bf] py-3 first:border-t-0">
      <StatIcon>{icon}</StatIcon>

      <div>
        <div className="text-xs text-[#6f6556]">{label}</div>
        <div className="text-2xl leading-tight text-[#2f2a22]">
          {value}
        </div>
      </div>
    </div>
  )
}

/* ---------- Decorative Sprig ---------- */

function Sprig({ className = '' }) {
  return (
    <svg
      viewBox="0 0 60 80"
      className={`pointer-events-none absolute hidden md:block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M30 78 Q28 40 36 6"
        fill="none"
        stroke="#8a9a63"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {[
        [30, 62, -40],
        [31, 50, 40],
        [30, 38, -40],
        [33, 26, 40],
        [35, 14, -35],
      ].map(([x, y, rot], i) => (
        <ellipse
          key={i}
          cx={x + (rot > 0 ? 8 : -8)}
          cy={y}
          rx="9"
          ry="4.5"
          fill="#a9b58a"
          transform={`rotate(${rot} ${x} ${y})`}
        />
      ))}
    </svg>
  )
}

/* ---------- Achievements Page ---------- */

function Achievements() {
  const [profile, setProfile] = useState({
    level: 1,
    title: 'Beginner',
    xp: 0,
    xpNeeded: 200,
    booksRead: 0,
    dayStreak: 0,
  })

  const [earnedBadgeIds, setEarnedBadgeIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAchievements() {
      setLoading(true)
      setError('')

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError

        if (!user) {
          throw new Error(
            'Please log in to view your achievements.'
          )
        }

        // Load the logged-in user's profile.
        const { data: profileData, error: profileError } =
          await supabase
            .from('profiles')
            .select(
              'level, level_title, xp, xp_needed, books_read, day_streak'
            )
            .eq('id', user.id)
            .maybeSingle()

        if (profileError) throw profileError

        // Load only this user's earned badges.
        const { data: badgeData, error: badgeError } =
          await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', user.id)

        if (badgeError) throw badgeError

        if (!isMounted) return

        if (profileData) {
          setProfile({
            level: profileData.level ?? 1,
            title: profileData.level_title ?? 'Beginner',
            xp: profileData.xp ?? 0,
            xpNeeded: profileData.xp_needed ?? 200,
            booksRead: profileData.books_read ?? 0,
            dayStreak: profileData.day_streak ?? 0,
          })
        }

        setEarnedBadgeIds(
          (badgeData ?? []).map((badge) => badge.badge_id)
        )
      } catch (err) {
        console.error('Error loading achievements:', err)

        if (isMounted) {
          setError(
            err.message || 'Unable to load your achievements.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAchievements()

    return () => {
      isMounted = false
    }
  }, [])

  const {
    level,
    title,
    xp,
    xpNeeded,
    booksRead,
    dayStreak,
  } = profile

  const safeXpNeeded = Math.max(1, xpNeeded || 200)
  const safeXp = Math.max(0, xp || 0)

  const xpPercent = Math.min(
    100,
    Math.round((safeXp / safeXpNeeded) * 100)
  )

  const badges = BADGES.map((badge) => ({
    ...badge,
    unlocked: earnedBadgeIds.includes(badge.id),
  }))

  const badgesEarned = badges.filter(
    (badge) => badge.unlocked
  ).length

  /* ---------- Loading State ---------- */

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#faf3e6] font-serif text-[#2f2a22]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#e3d8bf] border-t-[#6b7d48]" />
          <p className="text-lg">
            Loading your achievements...
          </p>
        </div>
      </section>
    )
  }

  /* ---------- Error State ---------- */

  if (error) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf3e6] px-6 font-serif text-[#2f2a22]">
        <h1 className="text-3xl">Achievements</h1>

        <p className="max-w-md text-center text-[#8a4a2a]">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#6b7d48] px-5 py-2 text-white transition hover:bg-[#56673a]"
        >
          Try again
        </button>
      </section>
    )
  }

  /* ---------- Main Page ---------- */

  return (
    <section className="relative flex min-h-screen w-full flex-col bg-[#faf3e6] px-6 py-8 font-serif text-[#2f2a22] md:px-12 md:py-12 lg:px-16">
      <Sprig className="right-4 top-4 h-20 w-16" />
      <Sprig className="bottom-4 right-6 h-20 w-16 -scale-x-100" />

      <div className="flex w-full flex-1 flex-col gap-8 lg:flex-row">
        {/* Badges Section */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="mb-1 text-4xl font-normal">
            Achievements
          </h1>

          <p className="mb-8 text-base text-[#6f6556]">
            Collect badges. Unlock new stories.
          </p>

          <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          <p className="mt-5 text-sm text-[#6f6556]">
            You have unlocked {badgesEarned} of {BADGES.length}{' '}
            badges. Keep reading to collect more!
          </p>
        </div>

        {/* Progress Panel with Paper Background */}
        <aside className="relative isolate h-fit w-full overflow-hidden rounded-2xl border border-[#e3d8bf] shadow-[0_12px_30px_rgba(60,45,30,0.10)] lg:mt-14 lg:w-80 lg:shrink-0">
          {/* Background must be behind all panel content */}
          <PaperBackground />

          {/* Foreground content */}
          <div className="relative z-10 p-6">
            <h2 className="mb-4 border-b border-[#e3d8bf] pb-3 text-base font-semibold">
              Your Progress
            </h2>

            {/* Level */}
            <div className="mb-4 flex items-center gap-3">
              <StatIcon>
                <path d="M4 6q4-2 8 1q4-3 8-1v12q-4-2-8 1q-4-3-8-1z" />
                <line x1="12" y1="7" x2="12" y2="19" />
              </StatIcon>

              <div>
                <div className="text-xs text-[#6f6556]">
                  Level {level}
                </div>

                <div className="text-sm font-semibold">
                  {title}
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mb-1 flex items-center justify-between text-xs text-[#6f6556]">
              <span>Experience Points</span>
              <span>{xpPercent}%</span>
            </div>

            <div
              className="mb-2 h-3 w-full overflow-hidden rounded-full bg-[#e3d8bf]"
              role="progressbar"
              aria-valuenow={Math.min(safeXp, safeXpNeeded)}
              aria-valuemin={0}
              aria-valuemax={safeXpNeeded}
              aria-label="Experience points"
            >
              <div
                className="h-full rounded-full bg-[#6b7d48] transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            <p className="mb-5 text-center text-xs text-[#6f6556]">
              {safeXp} / {safeXpNeeded} XP
            </p>

            {/* Reading Statistics */}
            <div>
              <Stat
                label="Books Read"
                value={booksRead}
                icon={
                  <>
                    <rect
                      x="5"
                      y="4"
                      width="14"
                      height="16"
                      rx="2"
                    />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                  </>
                }
              />

              <Stat
                label="Day Streak"
                value={dayStreak}
                icon={
                  <path d="M12 3q6 6 0 18q-6-12 0-18M12 12q3 3 0 6q-3-3 0-6" />
                }
              />

              <Stat
                label="Experience Points"
                value={safeXp}
                icon={
                  <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
                }
              />

              <Stat
                label="Badges Earned"
                value={`${badgesEarned} / ${BADGES.length}`}
                icon={
                  <>
                    <circle cx="12" cy="10" r="5" />
                    <path d="M9 14l-2 7 5-3 5 3-2-7" />
                  </>
                }
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Achievements
