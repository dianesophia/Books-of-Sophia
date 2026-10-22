
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase';
import BookLove from '../../../assets/badge/badge_book_love.png';
import Book from '@/assets/badge/badge_book.png';
import Flower from '@/assets/badge/badge_flower.png';
import Garden from '@/assets/badge/badge_garden.png';
import Key from '@/assets/badge/badge_key.png';
import Moon from '@/assets/badge/badge_moon.png';
import Mountain from '@/assets/badge/badge_mountain.png';
import Quotes from '@/assets/badge/badge_quotes.png';
import Sprout from '@/assets/badge/badge_sprout.png';
import Star from '@/assets/badge/badge_star.png';
import Streak from '@/assets/badge/badge_streak.png';
import Trophy from '@/assets/badge/badge_trophy.png';

/* ---------- Badge Icons ---------- */

function BookIcon() {
  return (
    <g
      stroke="#6b4a2f"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path
        d="M28 38 q11 -5 22 2 q11 -7 22 -2 v26 q-11 -4 -22 2 q-11 -6 -22 -2 z"
        fill="#fbf6ea"
      />
      <line x1="50" y1="40" x2="50" y2="66" />
    </g>
  )
}

function MoonIcon() {
  return (
    <g>
      <path
        d="M57 30 a21 21 0 1 0 10 32 a17 17 0 0 1 -10 -32 z"
        fill="#f3d27a"
      />
      <circle cx="66" cy="40" r="1.8" fill="#f3d27a" />
      <circle cx="70" cy="52" r="1.2" fill="#f3d27a" />
    </g>
  )
}

function GenreIcon() {
  return (
    <g stroke="rgba(0,0,0,0.25)" strokeWidth="1">
      <rect x="31" y="38" width="11" height="28" rx="1.5" fill="#6b7d48" />
      <rect x="44" y="33" width="11" height="33" rx="1.5" fill="#b5766f" />
      <rect x="57" y="40" width="11" height="26" rx="1.5" fill="#d8b27a" />
    </g>
  )
}

function WormIcon() {
  return (
    <g stroke="#7a4a2a" strokeWidth="1.5">
      <circle cx="32" cy="62" r="6.5" fill="#e8b27a" />
      <circle cx="43" cy="54" r="6.5" fill="#e8b27a" />
      <circle cx="55" cy="54" r="6.5" fill="#e8b27a" />
      <circle cx="66" cy="45" r="8" fill="#f0c28f" />
      <circle cx="68" cy="43" r="1.6" fill="#2f2a22" stroke="none" />
    </g>
  )
}

function ShieldIcon() {
  return (
    <g>
      <path
        d="M50 29 L68 36 V52 Q68 65 50 73 Q32 65 32 52 V36 Z"
        fill="#d98f5c"
        stroke="#8a4a2a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M50 40 q9 8 0 18 q-9 -10 0 -18" fill="#fbe3a3" />
    </g>
  )
}

function QuoteIcon() {
  return (
    <g>
      <path
        d="M32 36 h36 a4 4 0 0 1 4 4 v18 a4 4 0 0 1 -4 4 h-20 l-8 8 v-8 h-8 a4 4 0 0 1 -4 -4 v-18 a4 4 0 0 1 4 -4 z"
        fill="#fbf6ea"
        stroke="#8a6a4a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="59"
        textAnchor="middle"
        fontSize="26"
        fontFamily="Georgia, serif"
        fill="#8a6a4a"
      >
        “”
      </text>
    </g>
  )
}

function FlowerIcon() {
  return (
    <g>
      <line
        x1="50"
        y1="48"
        x2="50"
        y2="72"
        stroke="#6b7d48"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M50 64 q-12 -2 -14 -12 q12 0 14 12" fill="#8a9a63" />
      <path d="M50 60 q12 -2 14 -12 q-12 0 -14 12" fill="#8a9a63" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="50"
          cy="35"
          rx="5"
          ry="8"
          fill="#e8a89a"
          transform={`rotate(${a} 50 44)`}
        />
      ))}
      <circle cx="50" cy="44" r="4.5" fill="#e0b64a" />
    </g>
  )
}

function StarIcon() {
  return (
    <polygon
      points="50,30 57,44 72,46 61,56 64,71 50,63 36,71 39,56 28,46 43,44"
      fill="#fbf6ea"
      stroke="#8a6a4a"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  )
}

/* ---------- Badge Definitions ---------- */

const BADGES = [
  {
    id: 'first-chapter',
    name: 'First Chapter',
    desc: 'Read your first book',
    Icon: BookIcon,
    ring: '#e3c98c',
    bg: '#f6ecd2',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    desc: 'Read after 12 AM',
    Icon: MoonIcon,
    ring: '#d9b867',
    bg: '#2b3b66',
  },
  {
    id: 'genre-explorer',
    name: 'Genre Explorer',
    desc: 'Read 5 different genres',
    Icon: GenreIcon,
    ring: '#c9cfae',
    bg: '#b9c4a0',
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    desc: 'Read 10 books',
    Icon: WormIcon,
    ring: '#e2a769',
    bg: '#f6e4c4',
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    desc: '7 day reading streak',
    Icon: ShieldIcon,
    ring: '#e2a769',
    bg: '#f6e4c4',
  },
  {
    id: 'quote-collector',
    name: 'Quote Collector',
    desc: 'Save 25 quotes',
    Icon: QuoteIcon,
    ring: '#e3c98c',
    bg: '#f6ecd2',
  },
  {
    id: 'garden-grower',
    name: 'Garden Grower',
    desc: 'Plant 10 flowers',
    Icon: FlowerIcon,
    ring: '#c9cfae',
    bg: '#dfe5cb',
  },
  {
    id: 'secret-reader',
    name: 'Secret Reader',
    desc: '???',
    Icon: StarIcon,
    ring: '#e2a769',
    bg: '#f6e4c4',
  },
]

/* ---------- Badge Medallion ---------- */

function Medallion({ badge }) {
  const { name, image, Icon, ring, bg, unlocked } = badge
  const lockedStyle = unlocked ? '' : 'opacity-60 grayscale'

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`h-20 w-20 object-contain ${lockedStyle}`}
      />
    )
  }

  const bumps = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2

    return {
      x: 50 + Math.cos(a) * 44,
      y: 50 + Math.sin(a) * 44,
    }
  })

  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-20 w-20 ${lockedStyle}`}
      role="img"
      aria-label={name}
    >
      {bumps.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="5" fill={ring} />
      ))}

      <circle cx="50" cy="50" r="43" fill={ring} />

      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.2"
        strokeDasharray="1.5 3"
      />

      <circle
        cx="50"
        cy="50"
        r="33"
        fill={bg}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1.5"
      />

      <Icon />

      <ellipse
        cx="34"
        cy="89"
        rx="7"
        ry="3"
        fill="#8a9a63"
        transform="rotate(-25 34 89)"
      />
      <ellipse
        cx="66"
        cy="89"
        rx="7"
        ry="3"
        fill="#8a9a63"
        transform="rotate(25 66 89)"
      />
    </svg>
  )
}

/* ---------- Badge Card ---------- */

function BadgeCard({ badge }) {
  return (
    <article
      className={`flex flex-col items-center justify-center rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] px-2 py-8 text-center transition-shadow ${
        badge.unlocked ? 'hover:shadow-md' : ''
      }`}
    >
      <div className="mb-5">
        <Medallion badge={badge} />
      </div>

      <h2 className="mb-1.5 text-sm font-semibold">
        {badge.name}
      </h2>

      <p className="text-[0.7rem] leading-snug text-[#6f6556]">
        {badge.desc}
      </p>

      <span
        className={`mt-3 rounded-full px-3 py-1 text-[0.65rem] ${
          badge.unlocked
            ? 'bg-[#e3eadb] text-[#496444]'
            : 'bg-[#eee7d8] text-[#817665]'
        }`}
      >
        {badge.unlocked ? 'Unlocked' : 'Locked'}
      </span>
    </article>
  )
}

/* ---------- Progress Icons ---------- */

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

function Stat({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 border-t border-[#e3d8bf] py-3 first:border-t-0">
      <StatIcon>{icon}</StatIcon>

      <div>
        <div className="text-xs text-[#6f6556]">{label}</div>
        <div className="text-2xl leading-tight">{value}</div>
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
          if (isMounted) {
            setError('Please log in to view your achievements.')
          }
          return
        }

        // Load the user's profile and reading progress.
        const { data: profileData, error: profileError } =
          await supabase
            .from('profiles')
            .select(
              'level, level_title, xp, xp_needed, books_read, day_streak'
            )
            .eq('id', user.id)
            .single()

        if (profileError) throw profileError

        // Load earned badges for the current user.
        const { data: badgeData, error: badgeError } =
          await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', user.id)

        if (badgeError) throw badgeError

        if (!isMounted) return

        setProfile({
          level: profileData.level ?? 1,
          title: profileData.level_title ?? 'Beginner',
          xp: profileData.xp ?? 0,
          xpNeeded: profileData.xp_needed ?? 200,
          booksRead: profileData.books_read ?? 0,
          dayStreak: profileData.day_streak ?? 0,
        })

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

  const safeXpNeeded = Math.max(1, xpNeeded)

  const xpPercent = Math.min(
    100,
    Math.max(0, Math.round((xp / safeXpNeeded) * 100))
  )

  const badges = BADGES.map((badge) => ({
    ...badge,
    unlocked: earnedBadgeIds.includes(badge.id),
  }))

  const badgesEarned = badges.filter(
    (badge) => badge.unlocked
  ).length

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#faf3e6] font-serif text-[#2f2a22]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#e3d8bf] border-t-[#6b7d48]" />
          <p className="text-lg">Loading your achievements...</p>
        </div>
      </section>
    )
  }

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

  return (
    <section className="relative flex min-h-screen w-full flex-col bg-[#faf3e6] px-6 py-8 font-serif text-[#2f2a22] md:px-12 md:py-12 lg:px-16">
      <Sprig className="right-4 top-4 h-20 w-16" />
      <Sprig className="bottom-4 right-6 h-20 w-16 -scale-x-100" />

      <div className="flex w-full flex-1 flex-col gap-8 lg:flex-row">
        {/* Badges */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="mb-1 text-4xl font-normal">
            Achievements
          </h1>

          <p className="mb-8 text-base">
            Collect badges. Unlock new stories.
          </p>

          <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-5 sm:grid-cols-4">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          <p className="mt-5 text-sm text-[#6f6556]">
            You have unlocked {badgesEarned} of {BADGES.length} badges.
            Keep reading to collect more!
          </p>
        </div>

        {/* Progress panel */}
        <aside className="h-fit w-full rounded-2xl border border-[#e3d8bf] bg-[#fdf9ef] p-6 shadow-lg lg:mt-14 lg:w-80 lg:shrink-0">
          <h2 className="mb-4 border-b border-[#e3d8bf] pb-3 text-base font-semibold">
            Your Progress
          </h2>

          {/* Level */}
          <div className="mb-3 flex items-center gap-3">
            <StatIcon>
              <path d="M4 6 q4 -2 8 1 q4 -3 8 -1 v12 q-4 -2 -8 1 q-4 -3 -8 -1 z" />
              <line x1="12" y1="7" x2="12" y2="19" />
            </StatIcon>

            <div>
              <div className="text-xs text-[#6f6556]">
                Level {level}
              </div>

              <div className="text-sm">{title}</div>
            </div>
          </div>

          {/* XP progress */}
          <div
            className="mb-1 h-3 w-full overflow-hidden rounded-full bg-[#e3d8bf]"
            role="progressbar"
            aria-valuenow={xp}
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
            {xp} / {xpNeeded} XP
          </p>

          {/* Reading statistics */}
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
                <path d="M12 3 q6 6 0 18 q-6 -12 0 -18 M12 12 q3 3 0 6 q-3 -3 0 -6" />
              }
            />

            <Stat
              label="Badges"
              value={`${badgesEarned} / ${BADGES.length}`}
              icon={
                <>
                  <circle cx="12" cy="10" r="5" />
                  <path d="M9 14 l-2 7 l5 -3 l5 3 l-2 -7" />
                </>
              }
            />
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Achievements
