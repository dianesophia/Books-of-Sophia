import React, { useEffect, useState } from 'react'

/* ---------- Books you can write about ---------- */
// Add `image` (an imported cover) to a book to use real artwork instead of the drawn cover.

const BOOKS = [
  { id: 'midnight-library', title: 'The Midnight Library', bg: '#1f2a44', fg: '#f3d27a' },
  { id: 'atomic-habits', title: 'Atomic Habits', bg: '#f6efdc', fg: '#c96a2b' },
  { id: 'dune', title: 'Dune', bg: 'linear-gradient(#3a2418, #b5622a 70%, #e8a24a)', fg: '#f3d9a8' },
  { id: 'pride', title: 'Pride and Prejudice', bg: '#6b7d48', fg: '#fbf6ea' },
  { id: 'hobbit', title: 'The Hobbit', bg: '#4f6b6b', fg: '#fbf6ea' },
  { id: 'little-women', title: 'Little Women', bg: '#b5766f', fg: '#fbf6ea' },
  { id: 'jane-eyre', title: 'Jane Eyre', bg: '#5e4632', fg: '#f3d9a8' },
]

const SAMPLE_ENTRIES = [
  { id: 'e1', bookId: 'midnight-library', date: '2025-10-05', text: 'Sometimes the best way to find yourself is to lose yourself in a book.', rating: 5 },
  { id: 'e2', bookId: 'atomic-habits', date: '2025-09-28', text: 'Small changes, remarkable results.', rating: 4.5 },
  { id: 'e3', bookId: 'dune', date: '2025-09-15', text: 'Fear is the mind-killer.', rating: 4.5 },
]

const STORAGE_KEY = 'readingJournalEntries'

/* ---------- Helpers ---------- */

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved
  } catch {
    // Storage can be unavailable; fall back to the sample entries
  }
  return SAMPLE_ENTRIES
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const clampStyle = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }

/* ---------- Pieces ---------- */

const STAR_POINTS = '12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9'

function StarShape({ color, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points={STAR_POINTS} fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

// Read-only stars; supports halves like 4.5
function Stars({ value, size = 'h-3.5 w-3.5' }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i))
        return (
          <span key={i} className={`relative inline-block ${size}`}>
            <StarShape color="#e3d8bf" className="absolute inset-0 h-full w-full" />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarShape color="#e0a43a" className={size} />
            </span>
          </span>
        )
      })}
    </div>
  )
}

// Clickable stars for the form
function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
          onClick={() => onChange(value === n ? 0 : n)}
          onMouseEnter={() => setHover(n)}
          className="rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <polygon
              points={STAR_POINTS}
              fill={n <= shown ? '#e0a43a' : 'none'}
              stroke={n <= shown ? '#e0a43a' : '#c9b98f'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

function Cover({ book }) {
  if (book.image) {
    return <img src={book.image} alt={book.title} className="h-[72px] w-12 shrink-0 rounded-sm object-cover shadow-md" />
  }
  return (
    <div
      className="flex h-[72px] w-12 shrink-0 items-center justify-center rounded-sm p-1 text-center text-[0.5rem] font-semibold leading-tight shadow-md"
      style={{ background: book.bg, color: book.fg }}
      aria-label={`Cover of ${book.title}`}
    >
      {book.title}
    </div>
  )
}

function EntryCard({ entry, book, open, onToggle, onDelete }) {
  return (
    <article className="rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-4">
        <Cover book={book} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[0.95rem] font-semibold">{book.title}</h2>
          <p className="mb-1.5 text-xs text-[#6f6556]">{formatDate(entry.date)}</p>
          <p className="mb-1.5 text-[0.8rem] italic" style={open ? undefined : clampStyle}>
            “{entry.text}”
          </p>
          <Stars value={entry.rating} />
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? 'Show less' : 'Show more'}
          className="rounded p-1 text-[#6f6556] hover:text-[#2f2a22] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
        >
          <svg
            viewBox="0 0 20 20"
            className={`h-5 w-5 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 10 h12 M11 5 l5 5 l-5 5" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="mt-3 flex justify-end border-t border-[#e3d8bf] pt-3">
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-[#9a5a50] underline hover:text-[#7a3f36]"
          >
            Delete entry
          </button>
        </div>
      )}
    </article>
  )
}

function Sprig({ className = '' }) {
  return (
    <svg viewBox="0 0 40 60" className={`pointer-events-none ${className}`} aria-hidden="true">
      <path d="M20 58 Q18 30 24 4" fill="none" stroke="#8a9a63" strokeWidth="2" strokeLinecap="round" />
      {[[20, 46, -40], [21, 36, 40], [20, 26, -40], [22, 16, 40]].map(([x, y, rot], i) => (
        <ellipse key={i} cx={x + (rot > 0 ? 7 : -7)} cy={y} rx="8" ry="3.8" fill="#a9b58a" transform={`rotate(${rot} ${x} ${y})`} />
      ))}
    </svg>
  )
}

function Flower({ className = '' }) {
  return (
    <svg viewBox="0 0 50 70" className={`pointer-events-none ${className}`} aria-hidden="true">
      <path d="M25 68 Q23 50 25 30" fill="none" stroke="#8a9a63" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 56 q-10 -2 -12 -9 q10 0 12 9" fill="#a9b58a" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="25" cy="14" rx="6" ry="9" fill="#e8a0b0" stroke="#c96b82" strokeWidth="0.8" transform={`rotate(${a} 25 24)`} />
      ))}
      <circle cx="25" cy="24" r="4.5" fill="#e8b84a" />
    </svg>
  )
}

function Paperclip({ className = '' }) {
  return (
    <svg viewBox="0 0 30 70" className={`pointer-events-none ${className}`} fill="none" stroke="#b9a86a" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M10 22 V50 a6 6 0 0 0 12 0 V14 a9 9 0 0 0 -18 0 V52 a11 11 0 0 0 22 0 V28" />
    </svg>
  )
}

/* ---------- Page ---------- */

function Journal() {
  const [entries, setEntries] = useState(loadEntries)
  const [openId, setOpenId] = useState(null)

  const [bookId, setBookId] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // Ignore storage problems; the journal still works for this visit
    }
  }, [entries])

  const bookById = (id) => BOOKS.find((b) => b.id === id) || { title: 'Unknown book', bg: '#8a7a64', fg: '#fbf6ea' }

  const handleSave = (e) => {
    e.preventDefault()
    const cleanText = text.trim()
    const nextErrors = {}
    if (!bookId) nextErrors.book = 'Please choose a book.'
    if (!cleanText) nextErrors.text = 'Write a few thoughts first.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    // TODO: send the new entry to your API here
    const entry = { id: `e${Date.now()}`, bookId, date: todayIso(), text: cleanText, rating }
    setEntries((list) => [entry, ...list])
    setBookId('')
    setText('')
    setRating(0)
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const field =
    'w-full rounded-lg border border-[#d9ccaa] bg-[#fdf9ef] px-3 py-2 text-sm outline-none focus:border-[#6b7d48] focus:ring-4 focus:ring-[#b9c79a]/60'

  return (
    <section className="min-h-screen w-full bg-[#faf3e6] px-6 py-8 font-serif text-[#2f2a22] md:px-12 md:py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(300px,380px)]">
        {/* Entries */}
        <div className="min-w-0">
          <div className="relative mb-6">
            <h1 className="mb-1 text-4xl font-normal">Reading Journal</h1>
            <p className="text-base">Thoughts, quotes, and moments that stay with me.</p>
          </div>

          {sorted.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#e3d8bf] p-8 text-center text-[#6f6556]">
              No entries yet. Write your first one!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {sorted.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  book={bookById(entry.bookId)}
                  open={openId === entry.id}
                  onToggle={() => setOpenId(openId === entry.id ? null : entry.id)}
                  onDelete={() => {
                    setEntries((list) => list.filter((x) => x.id !== entry.id))
                    setOpenId(null)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* New entry form on a sheet of paper */}
        <div className="relative flex lg:self-stretch">
          <Flower className="absolute -left-14 -top-1 z-10 hidden h-20 w-14 lg:block" />
          <div className="absolute inset-0 -rotate-1 rounded-lg border border-[#c9b98f]" aria-hidden="true" />
          <div className="absolute inset-0 rotate-[0.6deg] rounded-lg border border-[#d9ccaa]" aria-hidden="true" />
          <Paperclip className="absolute -top-7 right-4 z-10 h-[4.5rem] w-8" />

          <form onSubmit={handleSave} noValidate className="relative flex w-full flex-col rounded-lg border border-[#d9ccaa] bg-[#fdf9ef] p-6 pb-24 shadow-sm">
            <h2 className="mb-5 mt-1 text-sm font-semibold">Write a new entry</h2>

            <label htmlFor="journal-book" className="mb-1.5 block text-[0.8rem] text-[#6f6556]">Book</label>
            <select
              id="journal-book"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className={`${field} mb-1`}
              aria-invalid={Boolean(errors.book)}
            >
              <option value="" disabled>Select a book</option>
              {BOOKS.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            {errors.book && <p className="mb-2 text-xs text-[#9a5a50]">{errors.book}</p>}

            <label htmlFor="journal-text" className="mb-1.5 mt-4 block text-[0.8rem] text-[#6f6556]">Your thoughts...</label>
            <textarea
              id="journal-text"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${field} mb-1 resize-y`}
              aria-invalid={Boolean(errors.text)}
            />
            {errors.text && <p className="mb-2 text-xs text-[#9a5a50]">{errors.text}</p>}

            <div className="mb-1.5 mt-4 text-[0.8rem] text-[#6f6556]">Rating</div>
            <div className="mb-6">
              <RatingInput value={rating} onChange={setRating} />
            </div>

            <button
              type="submit"
              className="w-fit rounded-lg bg-[#6b7d48] px-12 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
            >
              Save Entry
            </button>

            <Sprig className="absolute -bottom-3 right-2 hidden h-24 w-16 sm:block" />
          </form>
        </div>
      </div>
    </section>
  )
}

export default Journal