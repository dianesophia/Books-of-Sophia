import { useEffect, useRef, useState } from "react";
// Put your background picture at this path (or change the import).
import ModalBackground from "@/assets/background/bookshelves.jpg";

const SERIF = '"Fraunces", Georgia, "Times New Roman", serif';

const TABS = [
  { id: "details", label: "Details" },
  { id: "notes", label: "Notes" },
  { id: "quotes", label: "Quotes" },
  { id: "reviews", label: "Reviews" },
];

// Project Gutenberg subjects look like "Love stories -- Fiction", so keep the first part.
function cleanCategories(list = []) {
  const result = [];
  for (const item of list) {
    const first = String(item).split(/ -- | \/ /)[0].trim();
    if (first && first.length <= 28 && !result.includes(first)) result.push(first);
    if (result.length === 3) break;
  }
  return result;
}

function Cover({ book }) {
  if (book.cover) {
    return (
      <img
        src={book.cover}
        alt={`Cover of ${book.title}`}
        className="mx-auto max-h-72 w-auto rounded-[4px] object-contain shadow-[4px_8px_20px_rgba(60,40,20,0.45)] md:max-h-none md:w-full"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`No cover available for ${book.title}`}
      className="mx-auto flex aspect-[2/3] w-44 flex-col justify-between rounded-[4px] bg-[#4f6a4c] p-4 text-[#faf3e6] shadow-[4px_8px_20px_rgba(60,40,20,0.45)] md:w-full"
    >
      <span className="line-clamp-5 text-xl leading-snug" style={{ fontFamily: SERIF }}>
        {book.title}
      </span>
      <span className="h-px w-10 bg-[#faf3e6]/50" aria-hidden="true" />
    </div>
  );
}

function Sprig({ className = "" }) {
  return (
    <svg viewBox="0 0 48 56" className={className} fill="none" stroke="#7d8f58" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M24 54 V12" />
      <path d="M24 40 q-12 -2 -13 -12 q11 0 13 12 M24 30 q12 -2 13 -12 q-11 0 -13 12 M24 20 q-9 -2 -10 -10 q9 0 10 10" />
    </svg>
  );
}

const buttonBase =
  "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf6ea]";

export default function BookDetails({
  book,
  shelfStatus,
  suspended = false,
  onClose,
  onRead,
  onSetStatus,
  onRemove,
  onSaveExtras,
}) {
  const [tab, setTab] = useState("details");
  const closeButton = useRef(null);
  const onCloseRef = useRef(onClose);
  const suspendedRef = useRef(suspended);

  useEffect(() => {
    onCloseRef.current = onClose;
    suspendedRef.current = suspended;
  }, [onClose, suspended]);

  const onShelf = Boolean(shelfStatus);
  const pageCount = Number(book.pageCount ?? 0);
  const pagesRead = Number(book.pagesRead ?? 0);
  const percent = pageCount > 0 ? Math.min(100, Math.round((pagesRead / pageCount) * 100)) : null;
  const quotes = book.quotes ?? [];
  const categories = cleanCategories(book.categories);

  const [pagesDraft, setPagesDraft] = useState(String(pagesRead));
  const [notesDraft, setNotesDraft] = useState(book.notes ?? "");
  const [quoteDraft, setQuoteDraft] = useState("");
  const [rating, setRating] = useState(book.review?.rating ?? 0);
  const [reviewText, setReviewText] = useState(book.review?.text ?? "");

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !suspendedRef.current) onCloseRef.current();
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

  const readLabel =
    shelfStatus === "reading" ? "Continue Reading" : shelfStatus === "finished" ? "Read Again" : "Start Reading";

  function commitPages() {
    if (!onShelf) return;
    const max = pageCount > 0 ? pageCount : 100000;
    const value = Math.max(0, Math.min(max, Math.round(Number(pagesDraft) || 0)));
    setPagesDraft(String(value));
    if (value !== pagesRead) onSaveExtras({ pagesRead: value });
  }

  function addQuote(event) {
    event.preventDefault();
    const text = quoteDraft.trim();
    if (!text) return;
    onSaveExtras({ quotes: [text, ...quotes] });
    setQuoteDraft("");
  }

  const needShelf = (
    <p className="rounded-xl bg-[#f3ecd8] px-4 py-3 text-sm text-[#6b6450]">
      Add this book to your shelf to keep notes, quotes and a review.
    </p>
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-cover bg-center p-3 sm:p-6"
      style={{ backgroundImage: `url(${ModalBackground})`, backgroundColor: "#6b5a3e" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[#2b2418]/35" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${book.title}`}
        className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-[#fbf6ea]/95 shadow-[0_30px_80px_-20px_rgba(30,20,5,0.6)] ring-1 ring-[#e6d9bb] backdrop-blur-sm"
      >
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#6b6450] transition hover:bg-[#efe4c9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6 l12 12 M18 6 l-12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto">
          {/* Top section */}
          <div className="grid gap-6 p-6 pt-12 sm:p-8 sm:pt-10 md:grid-cols-[11rem_1fr] lg:grid-cols-[11rem_1fr_14rem]">
            <div className="md:self-start">
              <Cover book={book} />
            </div>

            <div className="min-w-0">
              <h2 className="text-3xl font-medium leading-tight text-[#2b3a30]" style={{ fontFamily: SERIF }}>
                {book.title}
              </h2>
              <p className="mt-1 text-[#7a705a]">{book.authors.join(", ")}</p>

              {categories.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <li key={category} className="rounded-full bg-[#e9efdf] px-3 py-1 text-xs font-medium text-[#4f6a4c]">
                      {category}
                    </li>
                  ))}
                </ul>
              )}

              {/* Progress */}
              {onShelf && percent !== null && (
                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[#6f6556]">
                    <label className="flex items-center gap-2">
                      Read
                      <input
                        type="number"
                        min="0"
                        max={pageCount}
                        value={pagesDraft}
                        onChange={(event) => setPagesDraft(event.target.value)}
                        onBlur={commitPages}
                        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
                        aria-label="Pages read"
                        className="w-16 rounded-md border border-[#dccfae] bg-white px-2 py-1 text-xs text-[#2b3a30] focus:outline-none focus:ring-2 focus:ring-[#4f6a4c]/30"
                      />
                      / {pageCount} pages
                    </label>
                    <span>{percent}%</span>
                  </div>
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-full bg-[#e3d8bf]"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Reading progress"
                  >
                    <div className="h-full rounded-full bg-[#6b8a7a] transition-all duration-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )}

              {/* Pages read, for books with no page count */}
              {onShelf && percent === null && (
                <label className="mt-5 flex items-center gap-2 text-xs text-[#6f6556]">
                  Pages read
                  <input
                    type="number"
                    min="0"
                    value={pagesDraft}
                    onChange={(event) => setPagesDraft(event.target.value)}
                    onBlur={commitPages}
                    onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
                    className="w-20 rounded-md border border-[#dccfae] bg-white px-2 py-1 text-xs text-[#2b3a30] focus:outline-none focus:ring-2 focus:ring-[#4f6a4c]/30"
                  />
                </label>
              )}

              {/* Actions */}
              <div className="mt-6 max-w-sm space-y-2.5">
                {book.readUrl ? (
                  <button
                    type="button"
                    onClick={onRead}
                    className={`${buttonBase} bg-[#6b7d48] text-white hover:bg-[#586a3a]`}
                  >
                    {readLabel}
                  </button>
                ) : (
                  <p className="rounded-xl bg-[#f1e8d0] px-3 py-2.5 text-center text-sm text-[#8a7f66]">
                    No reading link available
                  </p>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {(!onShelf || shelfStatus === "want") && (
                    <button
                      type="button"
                      onClick={() => (shelfStatus === "want" ? onRemove() : onSetStatus("want"))}
                      aria-pressed={shelfStatus === "want"}
                      className={`${buttonBase} w-auto border ${
                        shelfStatus === "want"
                          ? "border-[#bccbb4] bg-[#eef3e8] text-[#3f5a3d]"
                          : "border-[#dccfae] bg-white/70 text-[#3b3a2f] hover:bg-white"
                      }`}
                    >
                      <span aria-hidden="true">{shelfStatus === "want" ? "♥" : "♡"}</span>
                      {shelfStatus === "want" ? "On Wishlist" : "Add to Wishlist"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSetStatus("finished")}
                    disabled={shelfStatus === "finished"}
                    className={`${buttonBase} w-auto border border-[#dccfae] bg-white/70 text-[#3b3a2f] hover:bg-white disabled:cursor-default disabled:border-[#bccbb4] disabled:bg-[#eef3e8] disabled:text-[#3f5a3d]`}
                  >
                    <span aria-hidden="true">{shelfStatus === "finished" ? "✓" : "♡"}</span>
                    {shelfStatus === "finished" ? "Finished" : "Mark as Finished"}
                  </button>
                </div>

                {onShelf && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-lg px-1 py-1 text-sm text-[#8a5a4a] transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8a5a4a]/40"
                  >
                    Remove from shelf
                  </button>
                )}
              </div>
            </div>

            {/* Quote note */}
            <aside className="relative hidden lg:block">
              <Sprig className="absolute -left-3 -top-8 h-14 w-12" />
              <div className="rotate-1 rounded-md bg-[#fffdf6] p-5 shadow-[0_6px_18px_-8px_rgba(80,60,30,0.45)] ring-1 ring-[#e6d9bb]">
                {quotes[0] ? (
                  <p className="line-clamp-6 text-[0.95rem] leading-relaxed text-[#4a4538]" style={{ fontFamily: SERIF }}>
                    &ldquo;{quotes[0]}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-[#8a7f66]" style={{ fontFamily: SERIF }}>
                    Save a favorite line in the Quotes tab and it will rest here.
                  </p>
                )}
              </div>
            </aside>
          </div>

          {/* Tabs */}
          <div className="border-t border-[#e3d8bf] px-6 sm:px-8">
            <div role="tablist" aria-label="Book sections" className="flex gap-6">
              {TABS.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    aria-controls="book-panel"
                    onClick={() => setTab(item.id)}
                    className={`-mb-px border-b-2 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/40 ${
                      active
                        ? "border-[#4f6a4c] text-[#2b3a30]"
                        : "border-transparent text-[#7a705a] hover:text-[#2b3a30]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id="book-panel"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="min-h-[10rem] px-6 pb-8 pt-5 sm:px-8"
          >
            {tab === "details" && (
              <div className="space-y-3">
                <p className="max-w-2xl text-sm leading-relaxed text-[#5d5646]">
                  {book.description.replace(/<[^>]*>/g, "")}
                </p>
                <p className="text-xs text-[#7a705a]">
                  Source: {book.provider}
                  {pageCount > 0 ? ` · ${pageCount} pages` : ""}
                </p>
              </div>
            )}

            {tab === "notes" &&
              (onShelf ? (
                <div className="max-w-2xl">
                  <label htmlFor="book-notes" className="mb-2 block text-sm text-[#6b6450]">
                    Your notes
                  </label>
                  <textarea
                    id="book-notes"
                    value={notesDraft}
                    onChange={(event) => setNotesDraft(event.target.value)}
                    onBlur={() => notesDraft !== (book.notes ?? "") && onSaveExtras({ notes: notesDraft })}
                    rows={6}
                    placeholder="Thoughts, questions, favorite characters..."
                    className="w-full rounded-xl border border-[#dccfae] bg-white/80 p-3 text-sm text-[#2b3a30] placeholder-[#8a7f66] focus:border-[#4f6a4c] focus:outline-none focus:ring-4 focus:ring-[#4f6a4c]/15"
                  />
                  <p className="mt-1 text-xs text-[#7a705a]">Saved when you click away.</p>
                </div>
              ) : (
                needShelf
              ))}

            {tab === "quotes" &&
              (onShelf ? (
                <div className="max-w-2xl">
                  <form onSubmit={addQuote} className="mb-4 flex gap-2">
                    <input
                      value={quoteDraft}
                      onChange={(event) => setQuoteDraft(event.target.value)}
                      aria-label="New quote"
                      placeholder="Type a line you loved"
                      className="min-w-0 flex-1 rounded-xl border border-[#dccfae] bg-white/80 px-3 py-2 text-sm text-[#2b3a30] placeholder-[#8a7f66] focus:border-[#4f6a4c] focus:outline-none focus:ring-4 focus:ring-[#4f6a4c]/15"
                    />
                    <button
                      type="submit"
                      disabled={!quoteDraft.trim()}
                      className="rounded-xl bg-[#6b7d48] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#586a3a] disabled:cursor-not-allowed disabled:bg-[#cdd6c6]"
                    >
                      Add quote
                    </button>
                  </form>

                  {quotes.length === 0 ? (
                    <p className="text-sm text-[#7a705a]">No quotes saved yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {quotes.map((quote, index) => (
                        <li key={`${index}-${quote.slice(0, 12)}`} className="flex items-start justify-between gap-3 rounded-xl bg-[#fffdf6] p-3 ring-1 ring-[#e6d9bb]">
                          <p className="text-sm leading-relaxed text-[#4a4538]" style={{ fontFamily: SERIF }}>
                            &ldquo;{quote}&rdquo;
                          </p>
                          <button
                            type="button"
                            onClick={() => onSaveExtras({ quotes: quotes.filter((_, i) => i !== index) })}
                            className="shrink-0 rounded px-1 text-xs text-[#8a5a4a] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8a5a4a]/40"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                needShelf
              ))}

            {tab === "reviews" &&
              (onShelf ? (
                <div className="max-w-2xl">
                  <div role="radiogroup" aria-label="Your rating" className="mb-3 flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        onClick={() => setRating(value === rating ? 0 : value)}
                        className={`rounded text-2xl leading-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6a4c]/40 ${
                          value <= rating ? "text-[#d9a441]" : "text-[#d8ccb0]"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <label htmlFor="book-review" className="sr-only">
                    Your review
                  </label>
                  <textarea
                    id="book-review"
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    rows={4}
                    placeholder="What did you think?"
                    className="w-full rounded-xl border border-[#dccfae] bg-white/80 p-3 text-sm text-[#2b3a30] placeholder-[#8a7f66] focus:border-[#4f6a4c] focus:outline-none focus:ring-4 focus:ring-[#4f6a4c]/15"
                  />
                  <button
                    type="button"
                    onClick={() => onSaveExtras({ review: { rating, text: reviewText.trim() } })}
                    className="mt-2 rounded-xl bg-[#6b7d48] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#586a3a]"
                  >
                    Save review
                  </button>
                </div>
              ) : (
                needShelf
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}