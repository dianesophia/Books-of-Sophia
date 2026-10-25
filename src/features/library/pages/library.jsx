import { useEffect, useMemo, useRef, useState } from "react";
import Bookshelves from "../../../assets/background/bookshelves.jpg";
import { supabase } from "@/lib/supabase";
import BookDetails from "@/components/layout/bookDetails";

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
      pageCount: info.pageCount || 0,
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


const SERIF = '"Fraunces", Georgia, "Times New Roman", serif';
const SANS =
  '"Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const FONTS = `@import url("https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap");`;

const STATUSES = [
  { id: "want", label: "Want to Read" },
  { id: "reading", label: "Currently Reading" },
  { id: "finished", label: "Finished" },
];

const TABS = [{ id: "all", label: "All Books" }, ...STATUSES];

function scrollToRef(ref) {
  requestAnimationFrame(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  });
}

function BookCard({ book, shelfStatus, onSetStatus, onRemove, onRead, onOpen }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#fffaf0] shadow-[0_1px_2px_rgba(80,60,30,0.08),0_8px_24px_-12px_rgba(80,60,30,0.25)] ring-1 ring-[#e6d9bb]/70">
      {/* The cover stands on a small wooden ledge */}
      <div className="flex h-60 flex-col bg-gradient-to-b from-[#f3e8cc] to-[#ead9b4]">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View details for ${book.title}`}
          className="flex min-h-0 flex-1 items-end justify-center px-6 pt-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4f6a4c]/50"
        >
          {book.cover ? (
            <img
              src={book.cover}
              alt={`Cover of ${book.title}`}
              loading="lazy"
              className="max-h-full max-w-full rounded-[3px] object-contain shadow-[3px_5px_12px_rgba(60,40,20,0.4)]"
            />
          ) : (
            <div
              className="flex h-40 w-28 flex-col justify-between rounded-[3px] bg-[#4f6a4c] p-3 text-[#faf3e6] shadow-[3px_5px_12px_rgba(60,40,20,0.4)]"
              role="img"
              aria-label={`No cover available for ${book.title}`}
            >
              <span
                className="line-clamp-4 text-sm leading-snug"
                style={{ fontFamily: SERIF }}
              >
                {book.title}
              </span>
              <span className="h-px w-8 bg-[#faf3e6]/50" aria-hidden="true" />
            </div>
          )}
        </button>
        <div
          className="h-2 shrink-0 bg-gradient-to-b from-[#c79a6b] to-[#a37649]"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium text-[#5f7a62]">
          {book.provider}
        </span>

        <h3
          className="mt-1 line-clamp-2 text-lg font-medium leading-snug text-[#2b3a30]"
          style={{ fontFamily: SERIF }}
        >
          <button
            type="button"
            onClick={onOpen}
            className="text-left hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/40"
          >
            {book.title}
          </button>
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-[#7a705a]">
          {book.authors.join(", ")}
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#5d5646]">
          {book.description.replace(/<[^>]*>/g, "")}
        </p>

        <div className="mt-auto space-y-2 pt-5">
          <div className="flex items-center gap-2">
            <select
              value={shelfStatus ?? ""}
              onChange={(event) => onSetStatus(event.target.value)}
              aria-label={`Shelf for ${book.title}`}
              className={
                "min-w-0 flex-1 rounded-lg border px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6a4c]/30 " +
                (shelfStatus
                  ? "border-[#bccbb4] bg-[#eef3e8] font-medium text-[#3f5a3d]"
                  : "border-[#dccfae] bg-white text-[#3b3a2f]")
              }
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
            <button
              type="button"
              onClick={onRead}
              className="block w-full rounded-lg bg-[#4f6a4c] px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#3f5a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf0]"
            >
              {book.provider === "Google Books"
                ? book.fullText
                  ? "Read Book"
                  : "Read Preview"
                : "Read Free Ebook"}
            </button>
          ) : (
            <p className="rounded-lg bg-[#f1e8d0] px-3 py-2.5 text-center text-sm text-[#8a7f66]">
              No reading link available
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

// Where the book opens inside the page. Google Books has an embeddable viewer.
function embedUrl(book) {
  if (book.id.startsWith("google-")) {
    const volumeId = book.id.replace("google-", "");
    return `https://books.google.com/books?id=${volumeId}&pg=PP1&output=embed`;
  }
  return (book.readUrl || "").replace("http://", "https://");
}

function Reader({ book, onClose }) {
  const closeButton = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const src = embedUrl(book);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Reading ${book.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-[#faf3e6]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#e3d8bf] bg-[#fffaf0] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2
            className="truncate text-lg font-medium text-[#2b3a30]"
            style={{ fontFamily: SERIF }}
          >
            {book.title}
          </h2>
          <p className="truncate text-sm text-[#7a705a]">
            {book.authors.join(", ")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {book.readUrl && (
            <a
              href={book.readUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg px-3 py-2 text-sm text-[#5f7a62] transition hover:bg-[#eef3e8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50 sm:block"
            >
              Not loading? Open in a new tab
            </a>
          )}
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#4f6a4c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3f5a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50 focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>

      {src ? (
        <iframe
          key={book.id}
          src={src}
          title={`Reader for ${book.title}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className="min-h-0 w-full flex-1 border-0 bg-white"
        />
      ) : (
        <p className="m-auto px-6 text-center text-[#7a705a]">
          This book has no reading link.
        </p>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-[#fffaf0] ring-1 ring-[#e6d9bb]/70 motion-safe:animate-pulse"
      aria-hidden="true"
    >
      <div className="h-60 bg-[#efe3c4]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-[#eadfc4]" />
        <div className="h-5 w-4/5 rounded bg-[#eadfc4]" />
        <div className="h-3 w-1/2 rounded bg-[#eadfc4]" />
        <div className="h-10 rounded-lg bg-[#eadfc4]" />
      </div>
    </div>
  );
}

export default function Library() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [shelf, setShelf] = useState([]);
  const [userId, setUserId] = useState(null);
  const [shelfError, setShelfError] = useState("");
  const [tab, setTab] = useState("all");
  const [readerBook, setReaderBook] = useState(null);
  const [detailsBook, setDetailsBook] = useState(null);

  const searchInput = useRef(null);
  const resultsRef = useRef(null);
  const shelfRef = useRef(null);

  // Load the saved shelf from the database when the page opens
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const user = auth?.user;

        if (!user) {
          if (!cancelled) {
            setShelfError("Please sign in to save books to your shelf.");
          }
          return;
        }

        const { data, error } = await supabase
          .from("shelf_books")
          .select("book, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (cancelled) return;

        setUserId(user.id);
        setShelf(data.map((row) => ({ ...row.book, status: row.status })));
      } catch {
        if (!cancelled) {
          setShelfError("Couldn't load your shelf. Please refresh.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Opens a book's details from the home page link (/library?book=BOOK_ID)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("book");
    if (!id) return;
    const match = shelf.find((item) => item.id === id);
    if (match) setDetailsBook(match);
  }, [shelf]);

  function closeReader() {
    setReaderBook(null);
  }

  function closeDetails() {
    setDetailsBook(null);
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  // Saves extra details (pages read, notes, quotes, review) inside the book's saved data
  async function saveBookExtras(id, patch) {
    const item = shelf.find((book) => book.id === id);
    if (!item || !userId) return;

    setShelfError("");

    const updated = { ...item, ...patch };
    setShelf((current) => current.map((book) => (book.id === id ? updated : book)));

    // eslint-disable-next-line no-unused-vars
    const { status: _ignored, ...bookData } = updated;

    const { error } = await supabase
      .from("shelf_books")
      .update({ book: bookData })
      .eq("user_id", userId)
      .eq("book_id", id);

    if (error) setShelfError("Couldn't save that change. Please try again.");
  }

  const statusById = useMemo(
    () => new Map(shelf.map((book) => [book.id, book.status])),
    [shelf]
  );

  const visibleShelf = useMemo(
    () => (tab === "all" ? shelf : shelf.filter((book) => book.status === tab)),
    [shelf, tab]
  );

  const counts = useMemo(() => {
    const result = { all: shelf.length, want: 0, reading: 0, finished: 0 };
    shelf.forEach((book) => {
      if (result[book.status] !== undefined) result[book.status] += 1;
    });
    return result;
  }, [shelf]);

  async function setBookStatus(book, status) {
    if (!status || !userId) return;

    setShelfError("");

    // update the screen right away, then save
    setShelf((current) => {
      if (current.some((item) => item.id === book.id)) {
        return current.map((item) =>
          item.id === book.id ? { ...item, status } : item
        );
      }
      return [{ ...book, status }, ...current];
    });

    // eslint-disable-next-line no-unused-vars
    const { status: _ignored, ...bookData } = book;

    const { error } = await supabase.from("shelf_books").upsert(
      {
        user_id: userId,
        book_id: book.id,
        title: book.title,
        status,
        book: bookData,
      },
      { onConflict: "user_id,book_id" }
    );

    if (error) setShelfError("Couldn't save that change. Please try again.");
  }

  async function removeBook(id) {
    setShelfError("");
    setShelf((current) => current.filter((item) => item.id !== id));

    const { error } = await supabase
      .from("shelf_books")
      .delete()
      .eq("book_id", id);

    if (error) setShelfError("Couldn't remove that book. Please try again.");
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

  // Show the saved version of the book if it is on the shelf
  const detailsView = detailsBook
    ? shelf.find((item) => item.id === detailsBook.id) ?? detailsBook
    : null;

  return (
    <main
      className="min-h-screen text-[#2b3a30]"
      style={{
        fontFamily: SANS,
        background:
          "radial-gradient(ellipse 80% 40% at 50% 0%, #fffaf0 0%, #faf3e6 70%)",
      }}
    >
      <style>{FONTS}</style>

      {detailsView && (
        <BookDetails
          book={detailsView}
          shelfStatus={statusById.get(detailsView.id)}
          suspended={Boolean(readerBook)}
          onClose={closeDetails}
          onRead={() => {
            const current = statusById.get(detailsView.id);
            if (current !== "reading" && current !== "finished") {
              setBookStatus(detailsView, "reading");
            }
            setReaderBook(detailsView);
          }}
          onSetStatus={(status) => setBookStatus(detailsView, status)}
          onRemove={() => removeBook(detailsView.id)}
          onSaveExtras={(patch) => saveBookExtras(detailsView.id, patch)}
        />
      )}

      {readerBook && <Reader book={readerBook} onClose={closeReader} />}

      <div className="w-full px-4 pb-14 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        {/* Title and buttons */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-4xl font-medium tracking-tight sm:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              My Library
            </h1>
            <p className="mt-2 max-w-md text-[#7a705a]">
              Search Google Books and Project Gutenberg, then save what you
              want to read.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => searchInput.current?.focus()}
              className="rounded-full bg-[#4f6a4c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f5a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf3e6]"
            >
              + Add Book
            </button>

            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search and results"
              title="Clear search and results"
              className="rounded-full border border-[#dccfae] bg-white/60 p-2.5 text-[#6b6450] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50"
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
        <form onSubmit={handleSearch} className="relative mb-6">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#7a705a]"
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
            className="w-full rounded-full border border-[#dccfae] bg-white/80 py-4 pl-12 pr-32 text-[#2b3a30] placeholder-[#8a7f66] shadow-[0_8px_24px_-14px_rgba(80,60,30,0.35)] outline-none transition focus:border-[#4f6a4c] focus:bg-white focus:ring-4 focus:ring-[#4f6a4c]/15"
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#4f6a4c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3f5a3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cdd6c6] disabled:text-white/80"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Shelf error */}
        {shelfError && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-[#e3c98f] bg-[#fbf1d6] p-4 text-[#6b5320]"
          >
            {shelfError}
          </div>
        )}

        {/* Tabs */}
        <nav
          aria-label="Shelf filter"
          className="mb-10 inline-flex max-w-full flex-wrap gap-1 rounded-full bg-[#efe4c9]/70 p-1"
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseTab(item.id)}
                aria-pressed={active}
                className={
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50 " +
                  (active
                    ? "bg-white text-[#2b3a30] shadow-sm"
                    : "text-[#6b6450] hover:text-[#2b3a30]")
                }
              >
                {item.label}
                <span
                  className={
                    "rounded-full px-1.5 text-xs " +
                    (active
                      ? "bg-[#4f6a4c] text-white"
                      : "bg-[#e3d6b4] text-[#6b6450]")
                  }
                >
                  {counts[item.id]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Search results */}
        {searched && (
          <section
            ref={resultsRef}
            aria-live="polite"
            className="mb-14 scroll-mt-6"
          >
            <div className="mb-6 flex items-baseline justify-between gap-3">
              <h2
                className="text-2xl font-medium sm:text-3xl"
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
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-[#e3c98f] bg-[#fbf1d6] p-5 text-[#6b5320]"
              >
                {error}
              </div>
            )}

            {!loading && books.length > 0 && (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    shelfStatus={statusById.get(book.id)}
                    onSetStatus={(status) => setBookStatus(book, status)}
                    onRemove={() => removeBook(book.id)}
                    onRead={() => setReaderBook(book)}
                    onOpen={() => setDetailsBook(book)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Your saved books, with the bookshelves picture as the background */}
        {showShelfSection && (
          <section ref={shelfRef} className="scroll-mt-6">
            <div className="mb-6 flex items-baseline justify-between gap-3">
              <h2
                className="text-2xl font-medium sm:text-3xl"
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

            <div
              role="img"
              aria-label="Wooden bookshelves"
              className="rounded-3xl bg-cover bg-center p-4 shadow-[inset_0_0_0_1px_rgba(120,85,50,0.25),0_20px_40px_-24px_rgba(80,60,30,0.5)] sm:p-6"
              style={{
                backgroundImage: `url(${Bookshelves})`,
                minHeight: "24rem",
              }}
            >
              {visibleShelf.length === 0 ? (
                <p className="mx-auto max-w-md rounded-2xl bg-[#faf3e6]/95 px-6 py-10 text-center text-[#6b6450] shadow-sm">
                  Nothing in {activeTabLabel} yet. Search for a book and choose
                  “Add to shelf” to save it here.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {visibleShelf.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      shelfStatus={book.status}
                      onSetStatus={(status) => setBookStatus(book, status)}
                      onRemove={() => removeBook(book.id)}
                      onRead={() => setReaderBook(book)}
                      onOpen={() => setDetailsBook(book)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-14 text-center text-sm text-[#7a705a]">
          Book information provided by Google Books and Project Gutenberg.
        </footer>
      </div>
    </main>
  );
}