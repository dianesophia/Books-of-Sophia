import React from 'react'
import GuessGame from "../../../assets/badge/game_guess_the_book.png";
import MemoryMatch from "../../../assets/badge/game_memory_match.png";
import ShelfDetective from "@/assets/badge/game_shelf_detective.png";
import WordHunt from "@/assets/badge/game_word_hunt.png";

const GAMES = [
  { id: 'word-hunt', name: 'Word Hunt', desc: 'Find hidden words in a grid.', image: WordHunt },
  { id: 'guess-the-book', name: 'Guess the Book', desc: 'Identify the book from a clue.', image: GuessGame },
  { id: 'shelf-detective', name: 'Shelf Detective', desc: 'Find hidden objects in the scene.', image: ShelfDetective },
  { id: 'memory-match', name: 'Memory Match', desc: 'Match book pairs.', image: MemoryMatch },
]

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

function Games() {
  const handlePlay = (game) => {
    // TODO: replace with navigation, e.g. navigate(`/games/${game.id}`)
    console.log('Play', game.id)
  }

  return (
    <section className="flex min-h-screen w-full flex-col bg-[#faf3e6] px-6 py-1 font-serif text-[#2f2a22] md:px-12 md:py-14">
      <h1 className="mb-2 text-4xl font-normal">Mini Games</h1>
      <p className="mb-8 text-lg">Take a break. Play a little. Keep reading.</p>
      <div className="grid flex-1 grid-cols-1 content-start gap-6 min-[720px]:grid-cols-2">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} onPlay={handlePlay} />
        ))}
      </div>
    </section>
  )
}

export default Games