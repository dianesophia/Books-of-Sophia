import { useEffect, useMemo, useRef, useState } from "react";
import Bookshelves from "../../../assets/background/bookshelves.jpg";

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";
const GUTENDEX_URL = "https://gutendex.com/books/";

async function fetchGoogleBooks(query) {
  const url = new URL(GOOGLE_BOOKS_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("printType", "books");

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error(
      "Google Books is busy right now. Please wait a minute and try again."
    );
  }

  if (!response.ok) {
    throw new Error("Google Books is temporarily unavailable.");
  }

  const data = await response.json();

  return (data.items ?? []).map((item) => {
    const info = item.volumeInfo ?? {};
    const access = item.accessInfo ?? {};

    const fullText =
      access.viewability === "ALL_PAGES" &&
      (access.webReaderLink || info.previewLink);

    return {
      id: `google-${item.id}`,
      title: info.title || "Untitled",
      authors: info.authors ?? ["Unknown author"],
      cover:
        info.imageLinks?.thumbnail?.replace("http://", "https://") || "",
      description: info.description || "No description available.",
      provider: "Google Books",
      readUrl: access.webReaderLink || info.previewLink || "",
      fullText: Boolean(fullText),
      categories: info.categories ?? [],
    };
  });
}

// Gutendex is free and sometimes slow, so give it a time limit and one retry
async function fetchWithRetry(url, tries = 2) {
  for (let i = 0; i < tries; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) return response;
    } catch {
      // timed out or failed, try again
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("Gutendex is temporarily unavailable.");
}

async function fetchGutendexBooks(query) {
  const url = new URL(GUTENDEX_URL);
  url.searchParams.set("search", query);
  url.searchParams.set("page_size", "20");

  const response = await fetchWithRetry(url);

  if (!response.ok) {
    throw new Error("Gutendex is temporarily unavailable.");
  }

  const data = await response.json();

  return (data.results ?? []).map((book) => {
    const formats = book.formats ?? {};

    const readUrl =
      formats["text/html"] ||
      formats["text/html; charset=utf-8"] ||
      formats["text/plain; charset=utf-8"] ||
      formats["text/plain"] ||
      "";

    return {
      id: `gutenberg-${book.id}`,
      title: book.title || "Untitled",
      authors: book.authors?.length
        ? book.authors.map((author) => author.name)
        : ["Unknown author"],
      cover: formats["image/jpeg"] || "",
      description: "A free ebook from Project Gutenberg.",
      provider: "Project Gutenberg",
      readUrl,
      fullText: Boolean(readUrl),
      categories: book.subjects ?? [],
    };
  });
}

const SERIF = '"Fraunces", "Playfair Display", Georgia, serif';
const SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Your saved books are kept in this browser.
const SHELF_KEY = "my-library-shelf";

const STATUSES = [
  { id: "want", label: "Want to Read" },
  { id: "reading", label: "Currently Reading" },
  { id: "finished", label: "Finished" },
];

const TABS = [{ id: "all", label: "All Books" }, ...STATUSES];

function loadShelf() {
  try {
    const saved = JSON.parse(localStorage.getItem(SHELF_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function scrollToRef(ref) {
  requestAnimationFrame(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  });
}

function BookCard({ book, shelfStatus, onSetStatus, onRemove }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e3d7b8] bg-[#fffdf7] shadow-sm">
      <div className="flex h-56 items-center justify-center bg-[#efe6cf] p-3 sm:h-64">
        {book.cover ? (
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="h-full max-w-full object-contain"
          />
        ) : (
          <div className="px-4 text-center text-[#8a7f66]">
            <span className="text-4xl" aria-hidden="true">
              📖
            </span>
            <p className="mt-2 text-sm">No cover available</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 text-xs font-medium text-[#5f7a62]">
          {book.provider}
        </span>

        <h3
          className="line-clamp-2 font-semibold leading-snug"
          style={{ fontFamily: SERIF }}
        >
          {book.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-[#7a705a]">
          {book.authors.join(", ")}
        </p>

        <p className="mt-3 line-clamp-3 text-sm text-[#5d5646]">
          {book.description.replace(/<[^>]*>/g, "")}
        </p>

        <div className="mt-auto space-y-2 pt-5">
          <div className="flex items-center gap-2">
            <select
              value={shelfStatus ?? ""}
              onChange={(event) => onSetStatus(event.target.value)}
              aria-label={`Shelf for ${book.title}`}
              className="min-w-0 flex-1 rounded-lg border border-[#d8cdb2] bg-white px-2 py-2 text-sm text-[#3b3a2f] focus:border-[#6b8268] focus:outline-none focus:ring-2 focus:ring-[#6b8268]/25"
            >
              {!shelfStatus && <option value="">+ Add to shelf</option>}
              {STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>

            {shelfStatus && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg px-2 py-2 text-sm text-[#8a5a4a] transition hover:bg-[#f3e3dc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8a5a4a]/40"
              >
                Remove
              </button>
            )}
          </div>

          {book.readUrl ? (
            <a
              href={book.readUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-[#6b8268] px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#5a7057]"
            >
              {book.provider === "Google Books"
                ? book.fullText
                  ? "Read Book"
                  : "Read Preview"
                : "Read Free Ebook"}
            </a>
          ) : (
            <p className="rounded-lg bg-[#efe6cf] px-3 py-3 text-center text-sm text-[#8a7f66]">
              No reading link available
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Library() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [shelf, setShelf] = useState(loadShelf);
  const [tab, setTab] = useState("all");

  const searchInput = useRef(null);
  const resultsRef = useRef(null);
  const shelfRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(SHELF_KEY, JSON.stringify(shelf));
    } catch {
      // storage is full or blocked, so the shelf just won't be remembered
    }
  }, [shelf]);

  const statusById = useMemo(
    () => new Map(shelf.map((book) => [book.id, book.status])),
    [shelf]
  );

  const visibleShelf = useMemo(
    () => (tab === "all" ? shelf : shelf.filter((book) => book.status === tab)),
    [shelf, tab]
  );

  function setBookStatus(book, status) {
    if (!status) return;

    setShelf((current) => {
      if (current.some((item) => item.id === book.id)) {
        return current.map((item) =>
          item.id === book.id ? { ...item, status } : item
        );
      }
      return [{ ...book, status }, ...current];
    });
  }

  function removeBook(id) {
    setShelf((current) => current.filter((item) => item.id !== id));
  }

  function clearSearch() {
    setQuery("");
    setBooks([]);
    setError("");
    setSearched(false);
    searchInput.current?.focus();
  }

  function chooseTab(id) {
    setTab(id);
    scrollToRef(shelfRef);
  }

  async function handleSearch(event) {
    event.preventDefault();

    const searchTerm = query.trim();
    if (!searchTerm) return;

    setLoading(true);
    setError("");
    setSearched(true);
    setBooks([]);
    scrollToRef(resultsRef);

    const results = await Promise.allSettled([
      fetchGoogleBooks(searchTerm),
      fetchGutendexBooks(searchTerm),
    ]);

    const googleBooks =
      results[0].status === "fulfilled" ? results[0].value : [];

    const gutenbergBooks =
      results[1].status === "fulfilled" ? results[1].value : [];

    // Merge results and remove likely duplicates by title.
    const combined = [...googleBooks, ...gutenbergBooks];
    const seen = new Set();

    const uniqueBooks = combined.filter((book) => {
      const normalizedTitle = book.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      if (seen.has(normalizedTitle)) return false;

      seen.add(normalizedTitle);
      return true;
    });

    setBooks(uniqueBooks);

    if (results.every((result) => result.status === "rejected")) {
      setError(
        "Unable to load books. Please check your connection and try again."
      );
    } else if (uniqueBooks.length === 0) {
      setError("No books found. Try another title or author.");
    } else if (results[0].status === "rejected") {
      setError(
        `${results[0].reason.message} Showing Project Gutenberg results only.`
      );
    } else if (results[1].status === "rejected") {
      setError("Project Gutenberg is unavailable. Showing Google Books only.");
    }

    setLoading(false);
  }

  const activeTabLabel = TABS.find((item) => item.id === tab)?.label;
  const showShelfSection = shelf.length > 0 || tab !== "all";

  return (
    <main
      className="min-h-screen bg-[#f5ecd7] text-[#3b3a2f]"
      style={{ fontFamily: SANS }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="px-4 pt-6 sm:px-6">
        {/* Title and buttons */}
        <header className="mb-5 flex items-center justify-between gap-3">
          <h1
            className="text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ fontFamily: SERIF }}
          >
            My Library
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => searchInput.current?.focus()}
              className="rounded-lg bg-[#6b8268] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a7057] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8268]/50"
            >
              + Add Book
            </button>

            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search and results"
              title="Clear search and results"
              className="rounded-lg border border-[#d8cdb2] bg-white/60 p-2 text-[#6b6450] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8268]/50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        </header>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6450]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>

          <input
            ref={searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search books, authors, genres..."
            aria-label="Search books by title or author"
            className="w-full rounded-xl border border-[#d8cdb2] bg-white/60 py-3 pl-11 pr-28 text-[#3b3a2f] placeholder-[#8a7f66] shadow-sm outline-none transition focus:border-[#6b8268] focus:bg-white focus:ring-2 focus:ring-[#6b8268]/25"
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-4 py-1.5 text-sm font-semibold text-[#4f6a4c] transition hover:bg-[#e3ecd9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8268]/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Tabs */}
        <nav aria-label="Shelf filter" className="mb-6 flex flex-wrap gap-2">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseTab(item.id)}
                aria-pressed={active}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8268]/50 " +
                  (active
                    ? "bg-[#6b8268] text-white shadow-sm"
                    : "text-[#4a4638] hover:bg-white/60")
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        </div>

        {/* Your bookshelves picture, always shown whole, edge to edge with no padding */}
        <img
          src={Bookshelves}
          alt="Three wooden bookshelves filled with books, with a cat, a ladder and potted plants"
          draggable={false}
          className="block h-auto w-full select-none mix-blend-multiply"
        />

        <div className="px-4 pb-10 sm:px-6">
        {/* Search results appear below the shelves */}
        {searched && (
          <section
            ref={resultsRef}
            aria-live="polite"
            className="mt-12 scroll-mt-6"
          >
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h2
                className="text-2xl font-medium"
                style={{ fontFamily: SERIF }}
              >
                Search results
              </h2>
              {books.length > 0 && (
                <span className="text-sm text-[#7a705a]">
                  {books.length} books found
                </span>
              )}
            </div>

            {loading && (
              <div className="py-16 text-center text-[#6b6450]">
                Searching both book collections...
              </div>
            )}

            {!loading && error && (
              <div
                role="status"
                className="mb-5 rounded-2xl border border-[#e3c98f] bg-[#fbf1d6] p-5 text-[#6b5320]"
              >
                {error}
              </div>
            )}

            {!loading && books.length > 0 && (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    shelfStatus={statusById.get(book.id)}
                    onSetStatus={(status) => setBookStatus(book, status)}
                    onRemove={() => removeBook(book.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Your saved books, filtered by the tab you picked */}
        {showShelfSection && (
          <section ref={shelfRef} className="mt-12 scroll-mt-6">
            <div className="mb-5 flex items-baseline justify-between gap-3">
              <h2
                className="text-2xl font-medium"
                style={{ fontFamily: SERIF }}
              >
                {tab === "all" ? "On my shelf" : activeTabLabel}
              </h2>
              {visibleShelf.length > 0 && (
                <span className="text-sm text-[#7a705a]">
                  {visibleShelf.length}{" "}
                  {visibleShelf.length === 1 ? "book" : "books"}
                </span>
              )}
            </div>

            {visibleShelf.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#cdbf9b] bg-white/50 px-6 py-10 text-center text-[#7a705a]">
                Nothing in {activeTabLabel} yet. Search for a book and choose
                “Add to shelf” to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {visibleShelf.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    shelfStatus={book.status}
                    onSetStatus={(status) => setBookStatus(book, status)}
                    onRemove={() => removeBook(book.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="mt-12 text-center text-sm text-[#7a705a]">
          Book information provided by Google Books and Project Gutenberg.
        </footer>
        </div>
      </div>
    </main>
  );
}