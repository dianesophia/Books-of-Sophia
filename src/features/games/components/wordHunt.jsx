import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveGameResult } from '@/lib/gameResults'

/* ---------- Config ---------- */

const WORD_BANK = [
  'NOVEL', 'AUTHOR', 'CHAPTER', 'LIBRARY', 'STORY', 'PLOT', 'POEM', 'SHELF', 'PAGE', 'VERSE',
  'PROSE', 'READER', 'FICTION', 'ESSAY', 'BOOKMARK', 'SPINE', 'COVER', 'MYSTERY', 'FANTASY',
  'CLASSIC', 'EPILOGUE', 'PROLOGUE', 'LEGEND', 'FABLE', 'SAGA', 'DRAMA', 'WRITER', 'EDITOR',
  'QUILL', 'TOME', 'ATLAS', 'SCRIBE', 'MEMOIR', 'SONNET', 'COMIC', 'THRILLER',
]

// Directions as [rowStep, colStep]
const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]

const LEVELS = [
  { name: 'Easy', size: 10, count: 6, maxLen: 7, dirs: ALL_DIRS.slice(0, 2), note: 'Words run across or down.' },
  { name: 'Medium', size: 12, count: 8, maxLen: 8, dirs: ALL_DIRS.slice(0, 4), note: 'Words can also run diagonally.' },
  { name: 'Hard', size: 14, count: 10, maxLen: 9, dirs: ALL_DIRS, note: 'Words can run in any direction, even backwards.' },
]

const FOUND_COLORS = [
  '#cfdcae', '#f0cfc4', '#f3e0a8', '#c9d9d9', '#dccbe0',
  '#e6c9a8', '#d4e0c0', '#f2c9d0', '#cfd8ec', '#e8d9b5',
]

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/* ---------- Puzzle generation ---------- */

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function placeWord(grid, word, size, dirs) {
  for (let tries = 0; tries < 300; tries++) {
    const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)]
    const r = Math.floor(Math.random() * size)
    const c = Math.floor(Math.random() * size)
    const endR = r + dr * (word.length - 1)
    const endC = c + dc * (word.length - 1)
    if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue

    let fits = true
    for (let i = 0; i < word.length; i++) {
      const cell = grid[r + dr * i][c + dc * i]
      if (cell !== '' && cell !== word[i]) {
        fits = false
        break
      }
    }
    if (!fits) continue

    for (let i = 0; i < word.length; i++) grid[r + dr * i][c + dc * i] = word[i]
    return { r, c, dr, dc }
  }
  return null
}

function generatePuzzle(level) {
  const { size, count, maxLen, dirs } = level
  const grid = Array.from({ length: size }, () => Array(size).fill(''))
  const picked = shuffle(WORD_BANK.filter((w) => w.length <= maxLen)).slice(0, count)
  const placements = {}

  // Place long words first so they have room
  ;[...picked].sort((a, b) => b.length - a.length).forEach((word) => {
    const spot = placeWord(grid, word, size, dirs)
    if (spot) placements[word] = spot
  })

  // Fill the empty cells with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)]
    }
  }

  return { grid, words: Object.keys(placements).sort(), placements }
}

/* Cells on the straight line from a to b, or null if they are not in line */
function getLine(a, b) {
  const dr = b.r - a.r
  const dc = b.c - a.c
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null
  const steps = Math.max(Math.abs(dr), Math.abs(dc))
  const sr = Math.sign(dr)
  const sc = Math.sign(dc)
  return Array.from({ length: steps + 1 }, (_, i) => ({ r: a.r + sr * i, c: a.c + sc * i }))
}

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

const key = (r, c) => `${r}-${c}`

/* ---------- Game ---------- */

function WordHunt() {
  const navigate = useNavigate()

  const [level, setLevel] = useState(0)
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(LEVELS[0]))
  const [found, setFound] = useState([]) // [{ word, cells: [key], color }]
  const [selection, setSelection] = useState([])
  const [misses, setMisses] = useState(0)
  const [hints, setHints] = useState(0)
  const [hintCell, setHintCell] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [reward, setReward] = useState(null)

  const gridRef = useRef(null)
  const startRef = useRef(null)

  const config = LEVELS[level]
  const won = found.length === puzzle.words.length
  const isLastLevel = level === LEVELS.length - 1

  // Save the result once when the puzzle is solved
  useEffect(() => {
    if (!won) return
    saveGameResult({ game: 'word_hunt', level, won: true, seconds, misses, hints }).then(setReward)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won])

  // Timer
  useEffect(() => {
    if (won) return
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [won])

  // Hint highlight fades after a moment
  useEffect(() => {
    if (!hintCell) return
    const t = setTimeout(() => setHintCell(null), 2500)
    return () => clearTimeout(t)
  }, [hintCell])

  const startLevel = (lv) => {
    setLevel(lv)
    setReward(null)
    setPuzzle(generatePuzzle(LEVELS[lv]))
    setFound([])
    setSelection([])
    setMisses(0)
    setHints(0)
    setHintCell(null)
    setSeconds(0)
    startRef.current = null
  }

  /* ----- Selecting letters (works for mouse and touch) ----- */

  const cellFromEvent = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const cell = el && el.closest('[data-cell]')
    if (!cell || !gridRef.current || !gridRef.current.contains(cell)) return null
    return { r: Number(cell.dataset.r), c: Number(cell.dataset.c) }
  }

  const handleDown = (e) => {
    if (won) return
    const cell = cellFromEvent(e)
    if (!cell) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = cell
    setSelection([cell])
  }

  const handleMove = (e) => {
    if (!startRef.current) return
    const cell = cellFromEvent(e)
    if (!cell) return
    const line = getLine(startRef.current, cell)
    if (line) setSelection(line)
  }

  const handleUp = () => {
    if (!startRef.current) return
    startRef.current = null

    if (selection.length >= 2) {
      const word = selection.map(({ r, c }) => puzzle.grid[r][c]).join('')
      const reversed = [...word].reverse().join('')
      const foundWords = found.map((f) => f.word)
      const match = puzzle.words.find((w) => !foundWords.includes(w) && (w === word || w === reversed))

      if (match) {
        setFound((f) => [
          ...f,
          { word: match, cells: selection.map(({ r, c }) => key(r, c)), color: FOUND_COLORS[f.length % FOUND_COLORS.length] },
        ])
      } else {
        setMisses((m) => m + 1)
      }
    }
    setSelection([])
  }

  const handleHint = () => {
    if (won) return
    const foundWords = found.map((f) => f.word)
    const next = puzzle.words.find((w) => !foundWords.includes(w))
    if (!next) return
    const { r, c } = puzzle.placements[next]
    setHints((h) => h + 1)
    setHintCell(key(r, c))
  }

  /* ----- Derived data for rendering ----- */

  const foundColorByCell = {}
  found.forEach((f) => f.cells.forEach((k) => (foundColorByCell[k] = f.color)))
  const selectedKeys = new Set(selection.map(({ r, c }) => key(r, c)))
  const foundByWord = Object.fromEntries(found.map((f) => [f.word, f]))

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
          <h1 className="mb-1 text-4xl font-normal">Word Hunt</h1>
          <p className="text-lg">
            Level {level + 1} of {LEVELS.length}: {config.name}
          </p>
          <p className="text-sm text-[#6f6556]">
            Drag across the letters to select a word. {config.note}
          </p>
        </div>

        <div className="flex gap-3 text-center">
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Time</div>
            <div className="text-xl">{formatTime(seconds)}</div>
          </div>
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Found</div>
            <div className="text-xl">{found.length}/{puzzle.words.length}</div>
          </div>
          <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
            <div className="text-xs text-[#6f6556]">Misses</div>
            <div className="text-xl">{misses}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:items-start">
        {/* Letter grid */}
        <div
          ref={gridRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          className="grid w-full max-w-[600px] touch-none select-none gap-1 rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] p-3 shadow-sm"
          style={{ gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))` }}
        >
          {puzzle.grid.map((row, r) =>
            row.map((letter, c) => {
              const k = key(r, c)
              const isSelected = selectedKeys.has(k)
              const foundColor = foundColorByCell[k]
              const isHint = hintCell === k
              return (
                <div
                  key={k}
                  data-cell
                  data-r={r}
                  data-c={c}
                  className={`flex aspect-square items-center justify-center rounded-md text-sm font-semibold sm:text-base md:text-lg ${
                    isSelected ? 'bg-[#6b7d48] text-white' : 'text-[#2f2a22]'
                  } ${isHint && !isSelected ? 'animate-pulse ring-2 ring-[#e0b64a]' : ''}`}
                  style={!isSelected && foundColor ? { backgroundColor: foundColor } : undefined}
                >
                  {letter}
                </div>
              )
            })
          )}
        </div>

        {/* Word list and controls */}
        <div className="w-full lg:max-w-xs">
          <h2 className="mb-3 text-xl font-normal">Words to find</h2>
          <ul className="mb-6 flex flex-wrap gap-2">
            {puzzle.words.map((word) => {
              const f = foundByWord[word]
              return (
                <li
                  key={word}
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    f ? 'border-transparent text-[#586a3a] line-through opacity-80' : 'border-[#e3d8bf] bg-[#fbf6ea]'
                  }`}
                  style={f ? { backgroundColor: f.color } : undefined}
                >
                  {word}
                </li>
              )
            })}
          </ul>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleHint}
              disabled={won}
              className="rounded-lg border border-[#6b7d48] px-5 py-2.5 text-sm text-[#586a3a] transition-colors hover:bg-[#e4ebd0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hint {hints > 0 && `(${hints})`}
            </button>
            <button
              type="button"
              onClick={() => startLevel(level)}
              className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
            >
              New puzzle
            </button>
          </div>

          {/* Win message */}
          {won && (
            <div className="mt-6 rounded-2xl border border-[#b9c79a] bg-[#e4ebd0] p-6 text-center">
              <h2 className="mb-2 text-2xl font-normal">
                {isLastLevel ? 'Word master!' : 'Puzzle solved!'}
              </h2>
              <p className="mb-4">
                You found all {puzzle.words.length} words in {formatTime(seconds)} with {misses}{' '}
                {misses === 1 ? 'miss' : 'misses'} and {hints} {hints === 1 ? 'hint' : 'hints'}.
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
      </div>
    </section>
  )
}

export default WordHunt