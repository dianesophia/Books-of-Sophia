import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/* ---------- Placeholder (not in the database yet) ---------- */

const QUEST = { label: 'Read 10 pages', done: 0, goal: 10 }

/* ---------- Helpers ---------- */

function greeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Shelf rows are saved as { book, status, title }. Flatten them for the page.
function toBook(row) {
  const book = row.book ?? {}
  return {
    ...book,
    id: book.id ?? row.book_id,
    title: row.title || book.title || 'Untitled',
    authors: book.authors ?? [],
    status: row.status,
  }
}

/* ---------- Pieces ---------- */

function Cover({ book, className = '', large = false }) {
  if (book.cover) {
    return (
      <img
        src={book.cover}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        className={`rounded-sm object-cover shadow-md ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center rounded-sm bg-[#4f6a4c] p-2 text-center font-semibold leading-tight text-[#faf3e6] shadow-md ${
        large ? 'text-base' : 'text-[0.6rem]'
      } ${className}`}
      aria-label={`Cover of ${book.title}`}
    >
      <span className="line-clamp-4">{book.title}</span>
    </div>
  )
}

function ProgressBar({ percent, label }) {
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-[#e3d8bf]"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-[#6b8a7a] transition-all" style={{ width: `${percent}%` }} />
    </div>
  )
}

function Avatar({ name, src }) {
  if (src) return <img src={src} alt={name} className="h-9 w-9 rounded-full border-2 border-[#d9b867] object-cover" />
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#d9b867] bg-[#e8cfa6] text-sm text-[#6b4a2f]">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function Cat({ className = '' }) {
  return (
    <svg viewBox="0 0 130 70" className={`pointer-events-none ${className}`} aria-hidden="true">
      {/* tail */}
      <path d="M12 52 q-12 -2 -8 -14 q4 -8 12 -2" fill="none" stroke="#e8a468" strokeWidth="8" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="55" cy="50" rx="46" ry="17" fill="#f6ead8" />
      <ellipse cx="38" cy="42" rx="18" ry="10" fill="#e8a468" />
      <ellipse cx="68" cy="56" rx="10" ry="6" fill="#e8a468" />
      {/* head */}
      <circle cx="100" cy="42" r="17" fill="#f6ead8" />
      <path d="M86 32 l-2 -14 l12 8 z" fill="#e8a468" />
      <path d="M114 32 l2 -14 l-12 8 z" fill="#f6ead8" stroke="#e3d0b4" strokeWidth="1" />
      <path d="M92 28 q6 -6 14 -2" fill="none" stroke="#e8a468" strokeWidth="6" strokeLinecap="round" />
      <path d="M92 42 q3 3 6 0 M104 42 q3 3 6 0" fill="none" stroke="#4a3524" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="101" cy="48" rx="2.2" ry="1.6" fill="#d98a8a" />
    </svg>
  )
}

function Plant({ className = '' }) {
  return (
    <svg viewBox="0 0 80 90" className={`pointer-events-none ${className}`} aria-hidden="true">
      <path d="M30 88 Q26 50 40 8" fill="none" stroke="#7d8f58" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 88 Q56 55 66 22" fill="none" stroke="#7d8f58" strokeWidth="2.5" strokeLinecap="round" />
      {[[29, 72, -40], [28, 58, 40], [30, 44, -40], [34, 30, 40], [38, 18, -35]].map(([x, y, rot], i) => (
        <ellipse key={`a${i}`} cx={x + (rot > 0 ? 9 : -9)} cy={y} rx="10" ry="4.5" fill="#8a9a63" transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      {[[54, 74, 40], [55, 60, -40], [58, 46, 40], [62, 32, -35]].map(([x, y, rot], i) => (
        <ellipse key={`b${i}`} cx={x + (rot > 0 ? 8 : -8)} cy={y} rx="9" ry="4" fill="#a9b58a" transform={`rotate(${rot} ${x} ${y})`} />
      ))}
    </svg>
  )
}

function PottedPlant({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M16 32 h16 l-2 12 h-12 z" fill="#c98a5a" stroke="#8a5a34" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 32 v-14" stroke="#6b7d48" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 26 q-10 0 -11 -10 q10 0 11 10" fill="#8a9a63" />
      <path d="M24 20 q10 0 11 -10 q-10 0 -11 10" fill="#a9b58a" />
    </svg>
  )
}

const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

/* ---------- Page ---------- */

function Home() {
  const navigate = useNavigate()
  const [now] = useState(() => new Date())

  const [profile, setProfile] = useState(null)
  const [shelf, setShelf] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  /* ---------- Load profile and shelf ---------- */

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        const user = auth?.user
        if (!user) return // signed out: show the page with no saved data

        const [profileResult, shelfResult] = await Promise.all([
          supabase.from('profiles').select('name, avatar_url').eq('id', user.id).single(),
          supabase
            .from('shelf_books')
            .select('book_id, title, book, status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ])

        if (shelfResult.error) throw shelfResult.error
        if (cancelled) return

        // A missing profile row is not fatal; the page falls back to "Reader".
        setProfile(profileResult.data ?? null)
        setShelf(shelfResult.data.map(toBook))
      } catch (error) {
        console.error('Could not load home data:', error)
        if (!cancelled) setLoadError("We couldn't load your books. Please refresh.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const name = profile?.name || 'Reader'

  // Show the book being read first, then the ones waiting to be read.
  const reading = shelf.filter((book) => book.status === 'reading')
  const wantToRead = shelf.filter((book) => book.status === 'want')
  const current = reading[0] ?? null
  const journey = [...reading, ...wantToRead].slice(0, 5)

  // Page progress is only shown if the book has both numbers saved.
  const totalPages = Number(current?.pageCount ?? 0)
  const pagesRead = Number(current?.pagesRead ?? 0)
  const percent = totalPages > 0 ? Math.min(100, Math.round((pagesRead / totalPages) * 100)) : null

  // Opens the book's details on the Library page
  const openBook = (book) => navigate(`/library?book=${encodeURIComponent(book.id)}`)

  const questPercent = Math.min(100, Math.round((QUEST.done / QUEST.goal) * 100))

  const dateText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <section className="min-h-screen w-full bg-[#faf3e6] px-6 py-6 font-serif text-[#2f2a22] md:px-12 md:py-8">
      {/* Top bar */}
      <div className="mb-2 flex items-center justify-end gap-4">
        <span className="text-xs text-[#6f6556]">{dateText}</span>
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => {
            // TODO: open your notifications
          }}
          className="rounded-full p-1.5 text-[#6f6556] hover:text-[#2f2a22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconProps} aria-hidden="true">
            <path d="M6 16 v-5 a6 6 0 0 1 12 0 v5 l2 2 H4 z M10 20 a2 2 0 0 0 4 0" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Open profile"
          onClick={() => navigate('/profile')}
          className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
        >
          <Avatar name={name} src={profile?.avatar_url} />
        </button>
      </div>

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-normal">
          {greeting(now.getHours())}, {name}!
        </h1>
        <p className="text-base text-[#6f6556]">Another day, another chapter.</p>
      </div>

      {loadError && (
        <p role="alert" className="mb-6 rounded-xl border border-[#e3c98f] bg-[#fbf1d6] p-4 text-sm text-[#6b5320]">
          {loadError}
        </p>
      )}

      {/* Currently reading + quest */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_minmax(260px,340px)]">
        <article className="rounded-2xl border border-[#e3d8bf] bg-[#fdf9ef] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Currently Reading</h2>
            {current && (
              <button
                type="button"
                aria-label={`Read ${current.title}`}
                onClick={() => openBook(current)}
                className="rounded p-1 text-[#6f6556] hover:text-[#2f2a22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" {...iconProps} aria-hidden="true">
                  <path d="M7 17 L17 7 M9 7 h8 v8" />
                </svg>
              </button>
            )}
          </div>

          {loading ? (
            <p className="py-6 text-sm text-[#6f6556]">Loading your books...</p>
          ) : current ? (
            <div className="flex items-center gap-5">
              <Cover book={current} className="h-28 w-[4.5rem] shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">{current.title}</h3>
                <p className="mb-4 text-sm text-[#6f6556]">{current.authors.join(', ')}</p>

                {percent !== null ? (
                  <>
                    <p className="mb-1.5 text-xs text-[#6f6556]">
                      Read {pagesRead} / {totalPages} pages
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar percent={percent} label={`${current.title} reading progress`} />
                      </div>
                      <span className="text-xs text-[#6f6556]">{percent}%</span>
                    </div>
                  </>
                ) : (
                  (
                    <button
                      type="button"
                      onClick={() => openBook(current)}
                      className="inline-block rounded-lg bg-[#6b7d48] px-4 py-2 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
                    >
                      Keep reading
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="mb-3 text-sm text-[#6f6556]">
                You aren&apos;t reading anything yet. Pick a book and set it to Currently Reading.
              </p>
              <button
                type="button"
                onClick={() => navigate('/library')}
                className="rounded-lg bg-[#6b7d48] px-4 py-2 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
              >
                Find a book
              </button>
            </div>
          )}
        </article>

        <div className="relative">
          <Plant className="absolute -top-16 -left-16 hidden h-20 w-20 lg:block" />
          <Cat className="absolute -top-[3.1rem] right-6 hidden h-14 w-28 lg:block" />

          <article className="h-full rounded-2xl border border-[#e3d8bf] bg-[#fdf9ef] p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Today&apos;s Quest</h2>
            <div className="flex items-end justify-between gap-4 rounded-xl bg-[#f7f0df] p-4">
              <div className="min-w-0 flex-1">
                <p className="mb-5 mt-2 text-lg">{QUEST.label}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar percent={questPercent} label="Today's quest progress" />
                  </div>
                  <span className="text-xs text-[#6f6556]">{QUEST.done} / {QUEST.goal}</span>
                </div>
              </div>
              <PottedPlant className="h-12 w-12 shrink-0" />
            </div>
          </article>
        </div>
      </div>

      {/* Continue your journey */}
      <article className="rounded-2xl border border-[#e3d8bf] bg-[#fdf9ef] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-normal">Continue Your Journey</h2>
          <button
            type="button"
            onClick={() => navigate('/library')}
            className="flex items-center gap-1 rounded text-sm hover:text-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
          >
            View all
            <svg viewBox="0 0 24 24" className="h-4 w-4" {...iconProps} aria-hidden="true">
              <path d="M4 12 h16 M14 6 l6 6 l-6 6" />
            </svg>
          </button>
        </div>

        {!loading && journey.length === 0 ? (
          <p className="text-sm text-[#6f6556]">
            Books you are reading or want to read will show up here.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {journey.map((book) => (
              <li key={book.id}>
                <button
                  type="button"
                  onClick={() => openBook(book)}
                  aria-label={`Read ${book.title}`}
                  className="block w-full rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] p-3 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
                >
                  <Cover book={book} large className="aspect-[3/4] w-full" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}

export default Home