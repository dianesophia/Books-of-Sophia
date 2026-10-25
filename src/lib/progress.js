import { supabase } from '@/lib/supabase'

/* ---------- XP and level rules ---------- */

const XP_PER_PAGE = 1
const XP_PER_FINISHED_BOOK = 50
const XP_PER_JOURNAL_ENTRY = 10
const XP_PER_QUOTE = 5

const LEVEL_TITLES = [
  'Beginner',
  'Page Turner',
  'Bookworm',
  'Story Seeker',
  'Bibliophile',
  'Scholar',
  'Literary Sage',
]

// Level 1 needs 200 XP, level 2 needs 300, level 3 needs 400, and so on.
function levelFromXp(totalXp) {
  let level = 1
  let remaining = totalXp
  let needed = 200

  while (remaining >= needed) {
    remaining -= needed
    level += 1
    needed = 200 + 100 * (level - 1)
  }

  return {
    level,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
    xp: remaining,
    xpNeeded: needed,
  }
}

/* ---------- Badge text for notifications ---------- */

const BADGE_INFO = {
  'first-chapter': { name: 'First Chapter', desc: 'You read your first book.' },
  'night-owl': { name: 'Night Owl', desc: 'You read after midnight.' },
  'genre-explorer': { name: 'Genre Explorer', desc: 'You read 5 different genres.' },
  bookworm: { name: 'Bookworm', desc: 'You read 10 books.' },
  'streak-master': { name: 'Streak Master', desc: 'You kept a 7-day reading streak.' },
  'quote-collector': { name: 'Quote Collector', desc: 'You saved 25 quotes.' },
}

/* ---------- Date helpers ---------- */

function dateKey(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function dayNumber(key) {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86400000)
}

// Returns the streak that is still running today (or ended yesterday) and the best streak ever.
function calculateStreaks(days) {
  const sorted = [...new Set(days)].map(dayNumber).sort((a, b) => a - b)

  let longest = 0
  let run = 0
  sorted.forEach((day, i) => {
    run = i > 0 && day === sorted[i - 1] + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  })

  const today = dayNumber(dateKey(new Date()))
  const set = new Set(sorted)
  let cursor = set.has(today) ? today : today - 1
  let current = 0
  while (set.has(cursor)) {
    current += 1
    cursor -= 1
  }

  return { current, longest }
}

// Project Gutenberg subjects look like "Love stories -- Fiction", so keep the first part.
function genreOf(category) {
  return String(category).split(/ -- | \/ /)[0].trim().toLowerCase()
}

/* ---------- Main function ---------- */

// Reads the user's activity, works out stats and badges, saves them, and returns them.
export async function syncProgress(userId) {
  const [shelfResult, logResult, journalResult] = await Promise.all([
    supabase.from('shelf_books').select('status, book').eq('user_id', userId),
    supabase.from('reading_log').select('pages, read_date, created_at').eq('user_id', userId),
    supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  if (shelfResult.error) throw shelfResult.error
  if (logResult.error) throw logResult.error
  if (journalResult.error) throw journalResult.error

  const shelf = shelfResult.data ?? []
  const log = logResult.data ?? []
  const journalCount = journalResult.count ?? 0

  /* ---------- Totals ---------- */

  const booksRead = shelf.filter((row) => row.status === 'finished').length

  const quotesSaved = shelf.reduce((sum, row) => sum + (row.book?.quotes?.length ?? 0), 0)

  const pagesByDay = new Map()
  let totalPages = 0
  let nightReading = false

  log.forEach((row) => {
    const pages = Number(row.pages ?? 0)
    totalPages += pages
    pagesByDay.set(row.read_date, (pagesByDay.get(row.read_date) ?? 0) + pages)

    // Reading logged between midnight and 5 AM
    if (pages > 0 && new Date(row.created_at).getHours() < 5) nightReading = true
  })

  const readingDays = [...pagesByDay.entries()].filter(([, pages]) => pages > 0).map(([day]) => day)
  const { current: dayStreak, longest: bestStreak } = calculateStreaks(readingDays)

  const genres = new Set()
  shelf
    .filter((row) => row.status === 'reading' || row.status === 'finished')
    .forEach((row) => (row.book?.categories ?? []).forEach((c) => genreOf(c) && genres.add(genreOf(c))))

  /* ---------- XP and level ---------- */

  const totalXp =
    Math.max(0, totalPages) * XP_PER_PAGE +
    booksRead * XP_PER_FINISHED_BOOK +
    journalCount * XP_PER_JOURNAL_ENTRY +
    quotesSaved * XP_PER_QUOTE

  const level = levelFromXp(totalXp)

  /* ---------- Badges ---------- */

  const progress = {
    'first-chapter': { current: booksRead, target: 1 },
    'night-owl': { current: nightReading ? 1 : 0, target: 1 },
    'genre-explorer': { current: genres.size, target: 5 },
    bookworm: { current: booksRead, target: 10 },
    'streak-master': { current: bestStreak, target: 7 },
    'quote-collector': { current: quotesSaved, target: 25 },
    // "garden-grower" and "secret-reader" are not tracked yet.
  }

  const earnedNow = Object.entries(progress)
    .filter(([, { current, target }]) => current >= target)
    .map(([id]) => id)

  const { data: existing, error: existingError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  if (existingError) throw existingError

  const alreadyEarned = (existing ?? []).map((row) => row.badge_id)
  const newlyEarned = earnedNow.filter((id) => !alreadyEarned.includes(id))

  if (newlyEarned.length > 0) {
    const { error: insertError } = await supabase
      .from('user_badges')
      .insert(newlyEarned.map((badge_id) => ({ user_id: userId, badge_id })))

    if (insertError) {
      console.error('Could not save new badges:', insertError)
    } else {
      // One notification for every badge earned
      const { error: notifyError } = await supabase.from('notifications').insert(
        newlyEarned.map((badge_id) => ({
          user_id: userId,
          type: 'badge',
          badge_id,
          title: `Badge unlocked: ${BADGE_INFO[badge_id]?.name ?? badge_id}`,
          body: BADGE_INFO[badge_id]?.desc ?? null,
        }))
      )

      if (notifyError) console.error('Could not save notifications:', notifyError)
    }
  }

  // Badges are never taken away once earned.
  const earnedIds = [...new Set([...alreadyEarned, ...earnedNow])]

  /* ---------- Save to the profile ---------- */

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      level: level.level,
      level_title: level.title,
      xp: level.xp,
      xp_needed: level.xpNeeded,
      books_read: booksRead,
      day_streak: dayStreak,
      badges: earnedIds.length,
    })
    .eq('id', userId)

  if (profileError) console.error('Could not save profile progress:', profileError)

  return {
    profile: {
      level: level.level,
      title: level.title,
      xp: level.xp,
      xpNeeded: level.xpNeeded,
      booksRead,
      dayStreak,
    },
    earnedIds,
    newlyEarned,
    progress,
  }
}