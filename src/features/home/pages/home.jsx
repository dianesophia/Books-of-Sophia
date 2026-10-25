import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/* ---------- Daily quest ---------- */

const QUEST_LABEL = 'Read 10 pages'
const QUEST_GOAL = 10

/* ---------- Helpers ---------- */

// Today's date in the reader's own time zone (YYYY-MM-DD)
function todayIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

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

const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const focusRing = 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]'

/* ---------- Pieces ---------- */

function Cover({ book, className = '', large = false }) {
  if (book.cover) {
    return (
      <img
        src={book.cover}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        className={`rounded-[3px] object-cover ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center rounded-[3px] bg-[#4f6a4c] p-2 text-center font-semibold leading-tight text-[#faf3e6] ${
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
      className="h-3 w-full overflow-hidden rounded-full bg-[#e3d8bf]/80"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-[#6b8a7a] transition-all duration-700" style={{ width: `${percent}%` }} />
    </div>
  )
}

function QuestRing({ percent, done, goal }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg
        viewBox="0 0 80 80"
        className="h-full w-full -rotate-90"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Today's quest progress"
      >
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e8dcc0" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#6b8a7a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl leading-none">{done}</span>
        <span className="mt-0.5 text-[0.65rem] text-[#6f6556]">of {goal}</span>
      </div>
    </div>
  )
}

function Avatar({ name, src }) {
  if (src) return <img src={src} alt={name} className="h-10 w-10 rounded-full border-2 border-[#d9b867] object-cover" />
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d9b867] bg-[#e8cfa6] text-base text-[#6b4a2f]">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function Chip({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1e8d0] px-3 py-1 text-xs text-[#6b4a2f] ring-1 ring-[#e3d8bf]">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...iconProps} aria-hidden="true">
        {icon}
      </svg>
      {children}
    </span>
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

/* ---------- Page ---------- */

function Home() {
  const navigate = useNavigate()
  const [now] = useState(() => new Date())

  const [profile, setProfile] = useState(null)
  const [shelf, setShelf] = useState([])
  const [pagesToday, setPagesToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [userId, setUserId] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const bellRef = useRef(null)

  /* ---------- Load profile, shelf, quest and notifications ---------- */

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        const user = auth?.user
        if (!user) return // signed out: show the page with no saved data

        const [profileResult, shelfResult, logResult, notifyResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('name, avatar_url, level, level_title, day_streak, books_read')
            .eq('id', user.id)
            .single(),
          supabase
            .from('shelf_books')
            .select('book_id, title, book, status')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase.from('reading_log').select('pages').eq('user_id', user.id).eq('read_date', todayIso()),
          supabase
            .from('notifications')
            .select('id, title, body, is_read, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),
        ])

        if (shelfResult.error) throw shelfResult.error
        if (cancelled) return

        // A missing profile row is not fatal; the page falls back to "Reader".
        setUserId(user.id)
        setProfile(profileResult.data ?? null)
        setShelf(shelfResult.data.map(toBook))

        // A problem with the reading log only affects the quest, so it is not fatal.
        if (!logResult.error) {
          setPagesToday(logResult.data.reduce((sum, row) => sum + Number(row.pages ?? 0), 0))
        }

        // Same for notifications: the bell just stays empty if they fail to load.
        if (!notifyResult.error) {
          setNotifications(
            notifyResult.data.map((row) => ({
              id: row.id,
              title: row.title,
              body: row.body,
              date: row.created_at,
              isNew: !row.is_read,
            }))
          )
          setUnreadCount(notifyResult.data.filter((row) => !row.is_read).length)
        }
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

  // Close the notification panel when clicking elsewhere or pressing Esc
  useEffect(() => {
    if (!panelOpen) return

    const onPointerDown = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) setPanelOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setPanelOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [panelOpen])

  const togglePanel = async () => {
    const opening = !panelOpen
    setPanelOpen(opening)

    // Opening the panel marks everything as read
    if (opening && unreadCount > 0 && userId) {
      setUnreadCount(0)
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      if (error) console.error('Could not mark notifications as read:', error)
    }
  }

  const clearNotifications = async () => {
    if (!userId) return
    const { error } = await supabase.from('notifications').delete().eq('user_id', userId)
    if (error) {
      console.error('Could not clear notifications:', error)
      return
    }
    setNotifications([])
    setUnreadCount(0)
  }

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

  const questDone = Math.min(QUEST_GOAL, Math.max(0, pagesToday))
  const questComplete = questDone >= QUEST_GOAL
  const questPercent = Math.round((questDone / QUEST_GOAL) * 100)

  const dateText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const dayStreak = Number(profile?.day_streak ?? 0)
  const booksRead = Number(profile?.books_read ?? 0)

  return (
    <section
      className="min-h-screen w-full px-6 py-8 font-serif text-[#2f2a22] md:px-12 md:py-10"
      style={{ background: 'radial-gradient(ellipse 90% 45% at 50% 0%, #fffaf0 0%, #faf3e6 70%)' }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* ---------- Header ---------- */}
        <header className="mb-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-sm text-[#8a7f66]">{dateText}</p>
            <h1 className="text-4xl font-normal leading-tight tracking-tight md:text-5xl">
              {greeting(now.getHours())}, {name}.
            </h1>
            <p className="mt-2 text-base text-[#6f6556]">Another day, another chapter.</p>

            {profile && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip icon={<path d="M12 3q6 6 0 18q-6-12 0-18M12 12q3 3 0 6q-3-3 0-6" />}>
                  {dayStreak} day streak
                </Chip>
                <Chip icon={<path d="M4 5 q5 -2 8 1 q3 -3 8 -1 v13 q-5 -2 -8 1 q-3 -3 -8 -1 z M12 6 v13" />}>
                  {booksRead} {booksRead === 1 ? 'book' : 'books'} read
                </Chip>
                <Chip icon={<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />}>
                  Level {profile.level ?? 1}
                  {profile.level_title ? `, ${profile.level_title}` : ''}
                </Chip>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#fffaf0]/80 p-1.5 pl-3 shadow-sm ring-1 ring-[#e3d8bf]">
            <div ref={bellRef} className="relative">
              <button
                type="button"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} new` : 'Notifications'}
                aria-expanded={panelOpen}
                aria-haspopup="true"
                onClick={togglePanel}
                className={`relative rounded-full p-2 text-[#6f6556] transition-colors hover:text-[#2f2a22] ${focusRing}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconProps} aria-hidden="true">
                  <path d="M6 16 v-5 a6 6 0 0 1 12 0 v5 l2 2 H4 z M10 20 a2 2 0 0 0 4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c96b4a] px-1 text-[10px] leading-none text-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {panelOpen && (
                <div
                  role="region"
                  aria-label="Notifications"
                  className="absolute right-0 top-full z-30 mt-3 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-[#e3d8bf] bg-[#fdf9ef] text-left shadow-[0_16px_36px_rgba(60,45,30,0.2)]"
                >
                  <div className="flex items-center justify-between border-b border-[#e3d8bf] px-4 py-3">
                    <h2 className="text-sm font-semibold">Notifications</h2>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearNotifications}
                        className={`rounded text-xs text-[#6f6556] hover:text-[#2f2a22] hover:underline ${focusRing}`}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-[#6f6556]">
                      Nothing new yet. Badges you earn will show up here.
                    </p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.map((item) => (
                        <li key={item.id} className="border-b border-[#e3d8bf] last:border-b-0">
                          <button
                            type="button"
                            onClick={() => navigate('/achievements')}
                            className={`block w-full px-4 py-3 text-left transition-colors hover:bg-[#f3ecd8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#b9c79a] ${
                              item.isNew ? 'bg-[#f6efd8]' : ''
                            }`}
                          >
                            <span className="block text-sm font-semibold">{item.title}</span>
                            {item.body && <span className="block text-xs text-[#6f6556]">{item.body}</span>}
                            <span className="mt-1 block text-[0.7rem] text-[#8a7f66]">
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Open profile"
              onClick={() => navigate('/profile')}
              className={`rounded-full ${focusRing}`}
            >
              <Avatar name={name} src={profile?.avatar_url} />
            </button>
          </div>
        </header>

        {loadError && (
          <p role="alert" className="mb-6 rounded-xl border border-[#e3c98f] bg-[#fbf1d6] p-4 text-sm text-[#6b5320]">
            {loadError}
          </p>
        )}

        {/* ---------- Currently reading + quest ---------- */}
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-8">
          <article className="relative overflow-hidden rounded-3xl border border-[#e3d8bf] bg-gradient-to-br from-[#fffaf0] to-[#f6ecd2] p-6 shadow-[0_18px_40px_-24px_rgba(80,60,30,0.45)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm text-[#6f6556]">Currently reading</h2>
              {current && (
                <button
                  type="button"
                  aria-label={`Open ${current.title}`}
                  onClick={() => openBook(current)}
                  className={`rounded-full p-1.5 text-[#6f6556] transition-colors hover:bg-[#efe4c9] hover:text-[#2f2a22] ${focusRing}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" {...iconProps} aria-hidden="true">
                    <path d="M7 17 L17 7 M9 7 h8 v8" />
                  </svg>
                </button>
              )}
            </div>

            {loading ? (
              <p className="py-10 text-sm text-[#6f6556]">Loading your books...</p>
            ) : current ? (
              <div className="flex flex-col items-center gap-8 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openBook(current)}
                  aria-label={`Open ${current.title}`}
                  className={`group relative shrink-0 rounded-sm ${focusRing}`}
                >
                  <span
                    className="absolute -bottom-3 left-2 right-2 h-4 rounded-[50%] bg-[#5b4128]/25 blur-md"
                    aria-hidden="true"
                  />
                  <Cover
                    book={current}
                    large
                    className="relative h-52 w-36 -rotate-2 shadow-[6px_10px_22px_rgba(60,40,20,0.38)] transition-transform duration-300 group-hover:rotate-0"
                  />
                </button>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-semibold leading-snug md:text-3xl">{current.title}</h3>
                  <p className="mt-1 text-[#6f6556]">{current.authors.join(', ')}</p>

                  {percent !== null && (
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs text-[#6f6556]">
                        <span>
                          Page {pagesRead} of {totalPages}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <ProgressBar percent={percent} label={`${current.title} reading progress`} />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openBook(current)}
                    className={`mt-6 rounded-xl bg-[#6b7d48] px-6 py-2.5 text-sm text-white shadow-sm transition-colors hover:bg-[#586a3a] ${focusRing}`}
                  >
                    Continue reading
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <p className="mb-4 max-w-sm text-[#6f6556]">
                  You aren&apos;t reading anything yet. Pick a book and set it to Currently Reading.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/library')}
                  className={`rounded-xl bg-[#6b7d48] px-6 py-2.5 text-sm text-white shadow-sm transition-colors hover:bg-[#586a3a] ${focusRing}`}
                >
                  Find a book
                </button>
              </div>
            )}
          </article>

          {/* Quest, written on a paper note */}
          <div className="relative">
            <Cat className="absolute -top-[3.1rem] right-8 z-10 hidden h-14 w-28 sm:block" />

            <article className="relative h-full rotate-[0.6deg] rounded-md bg-[#fffdf6] p-6 shadow-[0_14px_30px_-14px_rgba(80,60,30,0.45)] ring-1 ring-[#e6d9bb]">
              <span
                className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 bg-[#d9c58a]/60"
                aria-hidden="true"
              />

              <h2 className="mb-5 mt-1 text-sm text-[#6f6556]">Today&apos;s quest</h2>

              <div className="flex items-center gap-5">
                <QuestRing percent={questPercent} done={questDone} goal={QUEST_GOAL} />

                <div className="min-w-0 flex-1">
                  <p className="text-lg leading-snug">{QUEST_LABEL}</p>
                  {questComplete ? (
                    <p className="mt-1 text-sm text-[#586a3a]">Quest complete. Nice reading today!</p>
                  ) : (
                    <p className="mt-1 text-sm text-[#6f6556]">
                      {QUEST_GOAL - questDone} more {QUEST_GOAL - questDone === 1 ? 'page' : 'pages'} to go
                    </p>
                  )}
                </div>
              </div>

              <PottedPlant className="absolute bottom-3 right-4 h-10 w-10 opacity-90" />
            </article>
          </div>
        </div>

        {/* ---------- Continue your journey, on a wooden shelf ---------- */}
        <section className="mt-12 rounded-3xl bg-[#f3e8cc]/55 px-5 pb-8 pt-6 ring-1 ring-[#e6d9bb]/70 sm:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-normal">Continue your journey</h2>
            <button
              type="button"
              onClick={() => navigate('/library')}
              className={`flex items-center gap-1 rounded text-sm text-[#586a3a] hover:underline ${focusRing}`}
            >
              View all
              <svg viewBox="0 0 24 24" className="h-4 w-4" {...iconProps} aria-hidden="true">
                <path d="M4 12 h16 M14 6 l6 6 l-6 6" />
              </svg>
            </button>
          </div>

          {!loading && journey.length === 0 ? (
            <p className="text-sm text-[#6f6556]">Books you are reading or want to read will show up here.</p>
          ) : (
            <div className="relative">
              <Plant className="absolute -top-10 right-0 z-10 hidden h-20 w-20 lg:block" />

              <ul className="grid grid-cols-2 items-end gap-x-0 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {journey.map((book) => (
                  <li key={book.id} className="flex flex-col">
                    <div className="px-3">
                      <button
                        type="button"
                        onClick={() => openBook(book)}
                        aria-label={`Open ${book.title}`}
                        className={`group block w-full rounded-sm ${focusRing}`}
                      >
                        <Cover
                          book={book}
                          large
                          className="aspect-[2/3] w-full shadow-[3px_6px_14px_rgba(60,40,20,0.35)] transition-transform duration-300 group-hover:-translate-y-1.5"
                        />
                      </button>
                    </div>

                    {/* wooden plank under the books */}
                    <div
                      className="h-3 bg-gradient-to-b from-[#c79a6b] to-[#a37649] shadow-[0_3px_6px_rgba(60,40,20,0.25)]"
                      aria-hidden="true"
                    />

                    <div className="px-3 pt-2.5">
                      <p className="line-clamp-1 text-sm">{book.title}</p>
                      <p className="text-xs text-[#8a7f66]">{book.status === 'reading' ? 'Reading' : 'Up next'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default Home