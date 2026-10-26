import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

import GuessBook from "@/assets/badge/game_guess_the_book.png";
import MemoryMatch from "@/assets/badge/game_memory_match.png";
import ShelfDetective from "@/assets/badge/game_shelf_detective.png";
import WordHunt from "@/assets/badge/game_word_hunt.png";

const GAMES = [
  { id: 'word-hunt', name: 'Word Hunt', desc: 'Find hidden words in a grid.', image: WordHunt, url: '/word-hunt' },
  { id: 'guess-the-book', name: 'Guess the Book', desc: 'Identify the book from a clue.', image: GuessBook, url: '/guess-book' },
  { id: 'shelf-detective', name: 'Shelf Detective', desc: 'Find hidden objects in the scene.', image: ShelfDetective, url: '/shelf-detective' },
  { id: 'memory-match', name: 'Memory Match', desc: 'Match book pairs.', image: MemoryMatch, url: '/memory-match' },
]

/* ---------- XP card ---------- */

function XpCard({ stats, signedOut }) {
  if (signedOut) {
    return (
      <div className="w-full rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] p-4 text-sm text-[#6f6556] sm:w-72">
        Sign in to earn XP from games.
      </div>
    )
  }

  if (!stats) {
    // Placeholder while the numbers load
    return <div className="h-[104px] w-full animate-pulse rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] sm:w-72" />
  }

  const percent = Math.min(100, Math.round((stats.xp / stats.xp_needed) * 100))

  return (
    <div className="w-full rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] p-4 shadow-sm sm:w-72">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-base font-semibold">Level {stats.level}</span>
        <span className="truncate text-xs text-[#6f6556]">{stats.level_title}</span>
      </div>

      <div
        className="mb-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[#e3d8bf]"
        role="progressbar"
        aria-valuenow={stats.xp}
        aria-valuemin={0}
        aria-valuemax={stats.xp_needed}
        aria-label="Experience points"
      >
        <div className="h-full rounded-full bg-[#6b8a7a] transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="flex justify-between text-[0.7rem] text-[#6f6556]">
        <span>{stats.xp} / {stats.xp_needed} XP</span>
        <span>{stats.xp_needed - stats.xp} XP to next level</span>
      </div>
    </div>
  )
}

/* ---------- Game card ---------- */

function GameCard({ game, onPlay }) {
  const { name, desc, image } = game
  return (
    <article className="flex flex-col items-center gap-5 rounded-2xl border border-[#e3d8bf] bg-[#fbf6ea] text-center min-[420px]:flex-row min-[420px]:text-left p-10">
      <div className="h-[180px] w-[180px] shrink-0">
        <img src={image} alt={name} className="h-full w-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="mb-1.5 text-lg font-normal">{name}</h2>
        <p className="mb-3.5 text-[0.8rem] leading-normal text-[#6f6556]">{desc}</p>
        <button
          type="button"
          aria-label={`Play ${name}`}
          onClick={() => onPlay(game)}
          className="w-full rounded-lg bg-[#6b7d48] py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a]"
        >
          Play
        </button>
      </div>
    </article>
  )
}

/* ---------- Page ---------- */

function Games() {
  const navigate = useNavigate()

  const [stats, setStats] = useState(null) // { level, level_title, xp, xp_needed }
  const [signedOut, setSignedOut] = useState(false)

  // Load the player's level and XP. This runs each time the page opens,
  // so the numbers are up to date when you come back from a game.
  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) {
        if (!cancelled) setSignedOut(true)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('level, level_title, xp, xp_needed')
        .eq('id', auth.user.id)
        .single()

      if (error) {
        console.error('Could not load XP:', error.message)
        return
      }
      if (!cancelled) setStats(data)
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  const handlePlay = (game) => {
    navigate(game.url)
  }

  return (
    <section className="flex min-h-screen w-full flex-col bg-[#faf3e6] px-6 py-1 font-serif text-[#2f2a22] md:px-12 md:py-14">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-4xl font-normal">Mini Games</h1>
          <p className="text-lg">Take a break. Play a little. Keep reading.</p>
          <p className="mt-1 text-sm text-[#6f6556]">Win games to earn XP and level up.</p>
        </div>
        <XpCard stats={stats} signedOut={signedOut} />
      </div>

      <div className="grid flex-1 grid-cols-1 content-start gap-6 min-[720px]:grid-cols-2">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} onPlay={handlePlay} />
        ))}
      </div>
    </section>
  )
}

export default Games