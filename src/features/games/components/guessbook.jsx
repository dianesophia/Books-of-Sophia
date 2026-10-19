import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveGameResult } from '@/lib/gameResults'

/* ---------- Book bank: three clues each, from vague to obvious ---------- */

const BOOKS = [
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    clues: [
      'A clever second daughter in a family of five sisters has to deal with first impressions that turn out to be wrong.',
      'The story is set in Regency-era England and is all about marriage, money and class.',
      'Elizabeth Bennet and the proud Mr. Darcy are the central pair.',
    ],
  },
  {
    title: 'Moby-Dick',
    author: 'Herman Melville',
    clues: [
      'A sailor who asks to be called Ishmael joins a long voyage at sea.',
      'The ship\'s captain is driven by revenge for the leg he lost.',
      'Captain Ahab hunts a giant white whale.',
    ],
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    clues: [
      'In the 1920s, a narrator watches his wealthy neighbor throw lavish parties on Long Island.',
      'The neighbor stares at a green light across the bay.',
      'Jay Gatsby pines for Daisy Buchanan.',
    ],
  },
  {
    title: '1984',
    author: 'George Orwell',
    clues: [
      'A low-level worker rewrites old newspaper articles for a government that controls the truth.',
      'Telescreens watch everyone, and posters say someone is always watching you.',
      'Winston Smith lives under the rule of Big Brother.',
    ],
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    clues: [
      'A homebody is dragged into an adventure by a wizard and thirteen dwarves.',
      'In a dark cave, he wins a riddle game and finds a magic ring.',
      'Bilbo Baggins and the dragon Smaug.',
    ],
  },
  {
    title: 'Frankenstein',
    author: 'Mary Shelley',
    clues: [
      'A young scientist is horrified by what he has made.',
      'The story began during a stormy summer in 1816, when friends challenged each other to write ghost stories.',
      'The creature is often wrongly called by its maker\'s name.',
    ],
  },
  {
    title: 'Alice\'s Adventures in Wonderland',
    author: 'Lewis Carroll',
    clues: [
      'A bored girl follows a hurrying animal down a hole.',
      'She meets a grinning cat, a very strange tea party and a queen who shouts about heads.',
      'Alice falls down the rabbit hole.',
    ],
  },
  {
    title: 'Romeo and Juliet',
    author: 'William Shakespeare',
    clues: [
      'A play about two teenagers whose families are bitter rivals in the Italian city of Verona.',
      'It includes a famous balcony scene and a secret wedding.',
      'The Montagues and the Capulets.',
    ],
  },
  {
    title: 'Little Women',
    author: 'Louisa May Alcott',
    clues: [
      'Four sisters grow up in New England while their father is away during the American Civil War.',
      'One sister is a writer with ink-stained fingers who dreams of publishing her stories.',
      'Meg, Jo, Beth and Amy March.',
    ],
  },
  {
    title: 'The Adventures of Tom Sawyer',
    author: 'Mark Twain',
    clues: [
      'A mischievous boy lives beside the Mississippi River.',
      'He famously tricks his friends into doing his chores with a bucket of whitewash.',
      'Tom Sawyer and his friend Huckleberry Finn.',
    ],
  },
  {
    title: 'Don Quixote',
    author: 'Miguel de Cervantes',
    clues: [
      'A retired gentleman reads so many adventure stories that he loses touch with reality.',
      'He sets out with a farmer named Sancho Panza as his companion.',
      'He charges at windmills, thinking they are giants.',
    ],
  },
  {
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    clues: [
      'An orphan grows up and becomes a governess at a mysterious house.',
      'Strange laughter is heard at night, and a secret is hidden in the attic.',
      'The brooding Mr. Rochester of Thornfield Hall.',
    ],
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    clues: [
      'The story is told through letters, diary entries and newspaper clippings.',
      'A lawyer travels to a castle in Transylvania.',
      'The most famous vampire count of all.',
    ],
  },
  {
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    clues: [
      'A pilot stranded in a desert meets a golden-haired child.',
      'The child travels from planet to planet and cares for a single rose.',
      'Its best-known idea is that the most important things cannot be seen with the eyes.',
    ],
  },
  {
    title: 'Charlotte\'s Web',
    author: 'E. B. White',
    clues: [
      'A farm story about an unlikely friendship.',
      'A clever spider saves a pig by weaving words into her web.',
      'Wilbur the pig and his friend Charlotte.',
    ],
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J. D. Salinger',
    clues: [
      'A teenage narrator wanders New York City after leaving his boarding school.',
      'He complains about "phony" people and feels alone.',
      'Holden Caulfield.',
    ],
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    clues: [
      'A girl nicknamed Scout looks back on her childhood in a small 1930s Alabama town.',
      'Her father, a lawyer, defends a man he believes is innocent.',
      'Atticus Finch and the neighbor Boo Radley.',
    ],
  },
  {
    title: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    clues: [
      'A boy finds a map in the sea chest of a guest at his family\'s inn.',
      'A friendly one-legged cook turns out to be a dangerous pirate.',
      'Jim Hawkins and Long John Silver.',
    ],
  },
  {
    title: 'The Odyssey',
    author: 'Homer',
    clues: [
      'An ancient Greek epic poem about a very long journey home after a war.',
      'The hero blinds a one-eyed giant and resists the song of the sirens.',
      'Odysseus is trying to get back to Ithaca.',
    ],
  },
  {
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    clues: [
      'A gloomy story set on the windswept moors of Yorkshire.',
      'A foundling raised in a family home grows up and holds a lifelong grudge.',
      'Heathcliff and Catherine.',
    ],
  },
  {
    title: 'Anne of Green Gables',
    author: 'L. M. Montgomery',
    clues: [
      'An orphan with a big imagination is sent to a farm on Prince Edward Island.',
      'A brother and sister there had asked for a boy to help on the farm.',
      'Anne Shirley, the red-haired girl.',
    ],
  },
]

const ROUND_LENGTH = 10
const MAX_CLUES = 3
const MAX_POINTS = 3

/* ---------- Helpers ---------- */

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRound() {
  return shuffle(BOOKS)
    .slice(0, ROUND_LENGTH)
    .map((book) => {
      const others = shuffle(BOOKS.filter((b) => b.title !== book.title)).slice(0, 3)
      return { book, options: shuffle([book, ...others]).map((b) => b.title) }
    })
}

function rating(score, max) {
  const ratio = score / max
  if (ratio >= 0.8) return 'Bookworm extraordinaire!'
  if (ratio >= 0.5) return 'Avid reader!'
  return 'Keep reading, you are getting there!'
}

/* ---------- Game ---------- */

function GuessBook() {
  const navigate = useNavigate()

  const [questions, setQuestions] = useState(buildRound)
  const [index, setIndex] = useState(0)
  const [clueCount, setClueCount] = useState(1)
  const [wrong, setWrong] = useState([])
  const [status, setStatus] = useState('playing') // 'playing' | 'correct' | 'revealed'
  const [results, setResults] = useState([]) // [{ title, author, points }]
  const [reward, setReward] = useState(null)

  const finished = index >= questions.length
  const score = results.reduce((sum, r) => sum + r.points, 0)
  const maxScore = questions.length * MAX_POINTS
  const current = questions[index]

  // Save the score once when the round is over
  useEffect(() => {
    if (!finished) return
    saveGameResult({ game: 'guess_book', level: 0, won: true, score }).then(setReward)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const handleGuess = (title) => {
    if (status !== 'playing' || wrong.includes(title)) return
    const { book } = current

    if (title === book.title) {
      const points = MAX_POINTS - (clueCount - 1)
      setStatus('correct')
      setResults((r) => [...r, { title: book.title, author: book.author, points }])
      return
    }

    setWrong((w) => [...w, title])
    if (clueCount >= MAX_CLUES) {
      setStatus('revealed')
      setResults((r) => [...r, { title: book.title, author: book.author, points: 0 }])
    } else {
      setClueCount((c) => c + 1)
    }
  }

  const handleGiveUp = () => {
    if (status !== 'playing') return
    const { book } = current
    setStatus('revealed')
    setResults((r) => [...r, { title: book.title, author: book.author, points: 0 }])
  }

  const handleNext = () => {
    setIndex((i) => i + 1)
    setClueCount(1)
    setWrong([])
    setStatus('playing')
  }

  const handleRestart = () => {
    setQuestions(buildRound())
    setIndex(0)
    setClueCount(1)
    setWrong([])
    setStatus('playing')
    setResults([])
    setReward(null)
  }

  /* ----- Results screen ----- */

  if (finished) {
    return (
      <section className="flex min-h-screen w-full flex-col bg-[#faf3e6] px-6 py-6 font-serif text-[#2f2a22] md:px-12 md:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="mb-1 text-4xl font-normal">Guess the Book</h1>
          <div className="mb-8 rounded-2xl border border-[#b9c79a] bg-[#e4ebd0] p-8 text-center">
            <p className="mb-1 text-sm text-[#586a3a]">Final score</p>
            <p className="mb-2 text-5xl">
              {score} <span className="text-2xl text-[#6f6556]">/ {maxScore}</span>
            </p>
            <p className="mb-2 text-lg">{rating(score, maxScore)}</p>
            {reward && reward.xp_earned > 0 ? (
              <p className="mb-6 text-sm text-[#586a3a]">
                +{reward.xp_earned} XP{reward.leveled_up ? ` - Level up! You are now level ${reward.level}` : ''}
              </p>
            ) : (
              <div className="mb-4" />
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a]"
              >
                Play again
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

          <h2 className="mb-3 text-xl font-normal">Your books</h2>
          <ul className="flex flex-col gap-2">
            {results.map((r, i) => (
              <li
                key={`${r.title}-${i}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate">{r.title}</div>
                  <div className="truncate text-sm text-[#6f6556]">{r.author}</div>
                </div>
                <div
                  className={`shrink-0 rounded-full px-3 py-1 text-sm ${
                    r.points > 0 ? 'bg-[#e4ebd0] text-[#586a3a]' : 'bg-[#f6dcd6] text-[#9a5a50]'
                  }`}
                >
                  {r.points > 0 ? `+${r.points}` : 'Missed'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  /* ----- Question screen ----- */

  const { book, options } = current
  const answered = status !== 'playing'
  const pointsNow = MAX_POINTS - (clueCount - 1)
  const isLastQuestion = index === questions.length - 1

  return (
    <section className="flex min-h-screen w-full flex-col bg-[#faf3e6] px-6 py-6 font-serif text-[#2f2a22] md:px-12 md:py-10">
      <div className="mx-auto w-full max-w-3xl">
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
            <h1 className="mb-1 text-4xl font-normal">Guess the Book</h1>
            <p className="text-lg">Read the clues and pick the right book. Fewer clues means more points.</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
              <div className="text-xs text-[#6f6556]">Question</div>
              <div className="text-xl">{index + 1}/{questions.length}</div>
            </div>
            <div className="min-w-[84px] rounded-xl border border-[#e3d8bf] bg-[#fbf6ea] px-4 py-2">
              <div className="text-xs text-[#6f6556]">Score</div>
              <div className="text-xl">{score}</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[#e3d8bf]">
          <div
            className="h-full rounded-full bg-[#6b7d48] transition-all"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>

        {/* Clues */}
        <ul className="mb-6 flex flex-col gap-3">
          {book.clues.map((clue, i) => {
            const revealed = i < clueCount || answered
            return (
              <li
                key={i}
                className={`rounded-xl border px-5 py-4 ${
                  revealed
                    ? 'border-[#e3d8bf] bg-[#fbf6ea]'
                    : 'border-dashed border-[#e3d8bf] text-[#9a8f7c]'
                }`}
              >
                <span className="mb-1 block text-xs uppercase tracking-wide text-[#6f6556]">Clue {i + 1}</span>
                {revealed ? clue : 'Locked. Guess wrong to unlock the next clue.'}
              </li>
            )
          })}
        </ul>

        {!answered && (
          <p className="mb-3 text-sm text-[#6f6556]">
            Worth {pointsNow} {pointsNow === 1 ? 'point' : 'points'} right now.
          </p>
        )}

        {/* Options */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((title) => {
            const isWrong = wrong.includes(title)
            const isAnswer = title === book.title
            let style = 'border-[#e3d8bf] bg-[#fbf6ea] hover:bg-[#f1e8d3]'
            if (answered && isAnswer) style = 'border-[#6b7d48] bg-[#e4ebd0]'
            else if (isWrong) style = 'border-[#d9b8ad] bg-[#f6dcd6] line-through opacity-70'
            else if (answered) style = 'border-[#e3d8bf] bg-[#fbf6ea] opacity-60'

            return (
              <button
                key={title}
                type="button"
                disabled={answered || isWrong}
                onClick={() => handleGuess(title)}
                className={`rounded-xl border px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9c79a] ${style}`}
              >
                {title}
              </button>
            )
          })}
        </div>

        {/* Feedback and controls */}
        {!answered && (
          <button
            type="button"
            onClick={handleGiveUp}
            className="text-sm text-[#6f6556] underline hover:text-[#2f2a22]"
          >
            I give up, show the answer
          </button>
        )}

        {answered && (
          <div
            className={`rounded-2xl border p-6 text-center ${
              status === 'correct' ? 'border-[#b9c79a] bg-[#e4ebd0]' : 'border-[#d9b8ad] bg-[#f6dcd6]'
            }`}
          >
            <h2 className="mb-1 text-2xl font-normal">
              {status === 'correct'
                ? `Correct! +${results[results.length - 1].points}`
                : 'Not this time'}
            </h2>
            <p className="mb-4">
              It was <strong className="font-semibold">{book.title}</strong> by {book.author}.
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-[#6b7d48] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#586a3a]"
            >
              {isLastQuestion ? 'See results' : 'Next book'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default GuessBook