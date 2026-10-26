import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWinningResults, saveGameResult } from '@/lib/gameResults'

/* ---------- Config ---------- */

// Each pair is a book title and the author who wrote it
const PAIRS = [
  { id: 'pride', title: 'Pride and Prejudice', author: 'Jane Austen' },
  { id: 'moby', title: 'Moby-Dick', author: 'Herman Melville' },
  { id: 'gatsby', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { id: '1984', title: '1984', author: 'George Orwell' },
  { id: 'hobbit', title: 'The Hobbit', author: 'J.R.R. Tolkien' },
  { id: 'frankenstein', title: 'Frankenstein', author: 'Mary Shelley' },
  { id: 'romeo', title: 'Romeo and Juliet', author: 'William Shakespeare' },
  { id: 'women', title: 'Little Women', author: 'Louisa May Alcott' },
  { id: 'dracula', title: 'Dracula', author: 'Bram Stoker' },
  { id: 'eyre', title: 'Jane Eyre', author: 'Charlotte Brontë' },
  { id: 'wuthering', title: 'Wuthering Heights', author: 'Emily Brontë' },
  { id: 'quixote', title: 'Don Quixote', author: 'Miguel de Cervantes' },
  { id: 'odyssey', title: 'The Odyssey', author: 'Homer' },
  { id: 'treasure', title: 'Treasure Island', author: 'Robert Louis Stevenson' },
  { id: 'anne', title: 'Anne of Green Gables', author: 'L. M. Montgomery' },
]

// Column classes are written out in full so Tailwind can find them
const LEVELS = [
  { name: 'Easy', pairs: 6, cols: 'grid-cols-3 sm:grid-cols-4' },
  { name: 'Medium', pairs: 8, cols: 'grid-cols-4' },
  { name: 'Hard', pairs: 12, cols: 'grid-cols-4 sm:grid-cols-6' },
]

const MISMATCH_DELAY = 900

/* ---------- Helpers ---------- */

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(pairCount) {
  const chosen = shuffle(PAIRS).slice(0, pairCount)
  const cards = chosen.flatMap((p) => [
    { key: `${p.id}-title`, pairId: p.id, kind: 'Title', text: p.title },
    { key: `${p.id}-author`, pairId: p.id, kind: 'Author', text: p.author },
  ])
  return shuffle(cards)
}

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

/* ---------- Card ---------- */

function BookIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-1/2 w-1/2" aria-hidden="true">
      <path
        d="M8 10 q8 -3 16 2 q8 -5 16 -2 v26 q-8 -3 -16 2 q-8 -5 -16 -2 z"
        fill="none"
        stroke="#fbf6ea"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="24" y1="12" x2="24" y2="38" stroke="#fbf6ea" strokeWidth="2.5" />
    </svg>
  )
}

function Card({ card, shown, matched, onClick }) {
  const face = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shown ? `${card.kind}: ${card.text}` : 'Hidden card'}
      className="relative aspect-[3/4] w-full rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
      style={{ perspective: '800px' }}
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: shown ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Back of the card */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-[#586a3a] bg-[#6b7d48] shadow-sm"
          style={face}
        >
          <BookIcon />
        </div>

        {/* Front of the card */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 text-center shadow-sm ${
            matched
              ? 'border-[#6b7d48] bg-[#e4ebd0]'
              : card.kind === 'Title'
                ? 'border-[#e3d8bf] bg-[#fbf6ea]'
                : 'border-[#e3d8bf] bg-[#f3e9d2]'
          }`}
          style={{ ...face, transform: 'rotateY(180deg)' }}
        >
          <span className="text-[0.6rem] uppercase tracking-wide text-[#6f6556] sm:text-xs">{card.kind}</span>
          <span className="text-xs font-semibold leading-tight sm:text-sm md:text-base">{card.text}</span>
        </div>
      </div>
    </button>
  )
}

/* ---------- Game ---------- */

function MemoryMatch() {
  const navigate = useNavigate()

  const [level, setLevel] = useState(0)
  const [cards, setCards] = useState(() => buildDeck(LEVELS[0].pairs))
  const [flipped, setFlipped] = useState([]) // indexes of face-up, unmatched cards
  const [matched, setMatched] = useState([]) // pairIds that are done
  const [moves, setMoves] = useState(0)
  const [started, setStarted] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [best, setBest] = useState({}) // lowest moves per level
  const [reward, setReward] = useState(null)

  const config = LEVELS[level]
  const won = matched.length === config.pairs
  const isLastLevel = level === LEVELS.length - 1

  // Timer starts on the first flip and stops when the board is cleared
  useEffect(() => {
    if (!started || won) return
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [started, won])

  // Check the two flipped cards
  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    if (cards[a].pairId === cards[b].pairId) return
    const t = setTimeout(() => setFlipped([]), MISMATCH_DELAY)
    return () => clearTimeout(t)
  }, [flipped, cards])

  // Load this player's best (lowest) moves for each level
  useEffect(() => {
    getWinningResults('memory_match').then((rows) => {
      const map = {}
      rows.forEach((r) => {
        if (r.moves != null && (map[r.level] === undefined || r.moves < map[r.level])) map[r.level] = r.moves
      })
      setBest(map)
    })
  }, [])

  const startLevel = (lv) => {
    setLevel(lv)
    setReward(null)
    setCards(buildDeck(LEVELS[lv].pairs))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setStarted(false)
    setSeconds(0)
  }

  const handleFlip = (i) => {
    if (flipped.length >= 2 || flipped.includes(i) || matched.includes(cards[i].pairId)) return

    if (!started) setStarted(true)

    const nextFlipped = [...flipped, i]
    if (nextFlipped.length === 2) {
      const [a, b] = nextFlipped
      const nextMoves = flipped.length === 1 ? moves + 1 : moves

      if (cards[a].pairId === cards[b].pairId) {
        const nextMatched = [...matched, cards[a].pairId]
        setMatched(nextMatched)
        setFlipped([])

        if (nextMatched.length === config.pairs) {
          setBest((prev) => {
            const currentBest = prev[level]
            return currentBest !== undefined && currentBest <= nextMoves ? prev : { ...prev, [level]: nextMoves }
          })
          saveGameResult({ game: 'memory_match', level, won: true, seconds: seconds + 1, moves: nextMoves }).then(setReward)
        }
        return
      }

      setMoves(nextMoves)
      setFlipped(nextFlipped)
      return
    }

    if (flipped.length === 1) setMoves((m) => m + 1)
    setFlipped(nextFlipped)
  }

  const bestForLevel = best[level]

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
          <h1 className="mb-1 text-4xl font-normal">Memory Match</h1>
          <p className="text-lg">
            Level {level + 1} of {LEVELS.length}: {config.name}
          </p>
          <p className="text-sm text-[#6f6556]">
            Flip two cards to match each book with its author. Fewer moves is better.
          </p>
        </div>

        <div className="flex gap-3 text-center">
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Time</div>
            <div className="text-xl">{formatTime(seconds)}</div>
          </div>
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Moves</div>
            <div className="text-xl">{moves}</div>
          </div>
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Pairs</div>
            <div className="text-xl">{matched.length}/{config.pairs}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {/* Board */}
        <div className={`grid gap-3 ${config.cols}`}>
          {cards.map((card, i) => {
            const isMatched = matched.includes(card.pairId)
            return (
              <Card
                key={card.key}
                card={card}
                matched={isMatched}
                shown={isMatched || flipped.includes(i)}
                onClick={() => handleFlip(i)}
              />
            )
          })}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => startLevel(level)}
            className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
          >
            New game
          </button>
          {bestForLevel !== undefined && (
            <span className="text-sm text-[#6f6556]">Best on {config.name}: {bestForLevel} moves</span>
          )}
        </div>

        {/* Win message */}
        {won && (
          <div className="mt-6 rounded-2xl border border-[#b9c79a] bg-[#e4ebd0] p-6 text-center">
            <h2 className="mb-2 text-2xl font-normal">
              {isLastLevel ? 'Memory master!' : 'All pairs matched!'}
            </h2>
            <p className="mb-4">
              You finished in {formatTime(seconds)} with {moves} {moves === 1 ? 'move' : 'moves'}.
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
      </div>
    </section>
  )
}

export default MemoryMatch