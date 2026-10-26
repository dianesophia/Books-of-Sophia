import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { syncProgress } from '@/lib/progress'

/* ---------- Helpers ---------- */

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Turn a database row into the shape the page uses
function toEntry(row) {
  return {
    id: row.id,
    bookId: row.book_id,
    title: row.book_title,
    cover: row.book_cover || '',
    date: row.entry_date,
    text: row.entry_text,
    rating: Number(row.rating ?? 0),
  }
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

function Cover({ title, cover }) {
  if (cover) {
    return (
      <img
        src={cover}
        alt={`Cover of ${title}`}
        loading="lazy"
        className="h-[72px] w-12 shrink-0 rounded-sm object-cover shadow-md"
      />
    )
  }
  return (
    <div
      className="flex h-[72px] w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#4f6a4c] p-1 text-center text-[0.5rem] font-semibold leading-tight text-[#faf3e6] shadow-md"
      aria-label={`Cover of ${title}`}
    >
      {title}
    </div>
  )
}

function EntryCard({ entry, open, onToggle, onDelete, deleting }) {
  return (
    <article className="rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-4">
        <Cover title={entry.title} cover={entry.cover} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[0.95rem] font-semibold">{entry.title}</h2>
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
            disabled={deleting}
            className="text-xs text-[#9a5a50] underline hover:text-[#7a3f36] disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete entry'}
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
  const navigate = useNavigate()

  const [status, setStatus] = useState('loading') // loading | ready | signedout | error
  const [userId, setUserId] = useState(null)
  const [entries, setEntries] = useState([])
  const [shelfBooks, setShelfBooks] = useState([])
  const [openId, setOpenId] = useState(null)

  const [bookId, setBookId] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState('')

  /* ---------- Load entries and the books on your shelf ---------- */

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        const user = auth?.user
        if (!user) {
          if (!cancelled) setStatus('signedout')
          return
        }

        const [entriesResult, shelfResult] = await Promise.all([
          supabase
            .from('journal_entries')
            .select('id, book_id, book_title, book_cover, entry_text, rating, entry_date')
            .eq('user_id', user.id)
            .order('entry_date', { ascending: false })
            .order('created_at', { ascending: false }),
          supabase
            .from('shelf_books')
            .select('book_id, title, book')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ])

        if (entriesResult.error) throw entriesResult.error
        if (shelfResult.error) throw shelfResult.error
        if (cancelled) return

        setUserId(user.id)
        setEntries(entriesResult.data.map(toEntry))
        setShelfBooks(
          shelfResult.data.map((row) => ({
            id: row.book_id,
            title: row.title || row.book?.title || 'Untitled',
            cover: row.book?.cover || '',
          }))
        )
        setStatus('ready')
      } catch (error) {
        console.error('Could not load journal:', error)
        if (!cancelled) setStatus('error')
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  /* ---------- Save a new entry ---------- */

  const handleSave = async (e) => {
    e.preventDefault()
    const cleanText = text.trim()
    const nextErrors = {}
    if (!bookId) nextErrors.book = 'Please choose a book.'
    if (!cleanText) nextErrors.text = 'Write a few thoughts first.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const book = shelfBooks.find((b) => b.id === bookId)
    if (!book || !userId) return

    setSaving(true)
    setActionError('')

    // The title and cover are saved with the entry, so it still looks right
    // if the book is later removed from your shelf.
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        book_id: book.id,
        book_title: book.title,
        book_cover: book.cover || null,
        entry_text: cleanText,
        rating,
        entry_date: todayIso(),
      })
      .select('id, book_id, book_title, book_cover, entry_text, rating, entry_date')
      .single()

    setSaving(false)

    if (error) {
      console.error('Could not save entry:', error)
      setActionError("Couldn't save your entry. Please try again.")
      return
    }

    setEntries((list) => [toEntry(data), ...list])
    syncProgress(userId).catch(() => {})
    setBookId('')
    setText('')
    setRating(0)
  }

  /* ---------- Delete an entry ---------- */

  const handleDelete = async (id) => {
    setDeletingId(id)
    setActionError('')

    const { error } = await supabase.from('journal_entries').delete().eq('id', id)

    setDeletingId(null)

    if (error) {
      console.error('Could not delete entry:', error)
      setActionError("Couldn't delete that entry. Please try again.")
      return
    }

    setEntries((list) => list.filter((x) => x.id !== id))
    setOpenId(null)
    syncProgress(userId).catch(() => {})
  }

  /* ---------- Loading, signed-out and error states ---------- */

  if (status === 'loading') {
    return (
      <section className="flex min-h-screen w-full items-center justify-center bg-[#faf3e6] font-serif text-[#6f6556]">
        Loading your journal...
      </section>
    )
  }

  if (status === 'signedout') {
    return (
      <section className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#faf3e6] px-6 text-center font-serif text-[#2f2a22]">
        <p>Please sign in to see your journal.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white hover:bg-[#586a3a]"
        >
          Sign in
        </button>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#faf3e6] px-6 text-center font-serif text-[#9a5a50]">
        <p>We couldn&apos;t load your journal. Please try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white"
        >
          Retry
        </button>
      </section>
    )
  }

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

          {actionError && (
            <p role="alert" className="mb-4 rounded-xl border border-[#e3c98f] bg-[#fbf1d6] p-3 text-sm text-[#6b5320]">
              {actionError}
            </p>
          )}

          {entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#e3d8bf] p-8 text-center text-[#6f6556]">
              No entries yet. Write your first one!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  open={openId === entry.id}
                  deleting={deletingId === entry.id}
                  onToggle={() => setOpenId(openId === entry.id ? null : entry.id)}
                  onDelete={() => handleDelete(entry.id)}
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

            {shelfBooks.length === 0 ? (
              <div className="rounded-lg bg-[#f3ecd8] p-4 text-sm text-[#6b6450]">
                <p className="mb-3">Add a book to your shelf first, then you can write about it here.</p>
                <button
                  type="button"
                  onClick={() => navigate('/library')}
                  className="rounded-lg bg-[#6b7d48] px-4 py-2 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
                >
                  Go to My Library
                </button>
              </div>
            ) : (
              <>
                <label htmlFor="journal-book" className="mb-1.5 block text-[0.8rem] text-[#6f6556]">Book</label>
                <select
                  id="journal-book"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className={`${field} mb-1`}
                  aria-invalid={Boolean(errors.book)}
                >
                  <option value="" disabled>Select a book</option>
                  {shelfBooks.map((b) => (
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
                  disabled={saving}
                  className="w-fit rounded-lg bg-[#6b7d48] px-12 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </>
            )}

            <Sprig className="absolute -bottom-3 right-2 hidden h-24 w-16 sm:block" />
          </form>
        </div>
      </div>
    </section>
  )
}

export default Journal