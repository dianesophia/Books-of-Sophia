
const GOOGLE_BOOKS_URL =
  "https://www.googleapis.com/books/v1/volumes";
const GUTENDEX_URL = "https://gutendex.com/books/";

export async function searchBooks(query) {
  if (!query.trim()) return [];

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  const googleUrl = new URL(GOOGLE_BOOKS_URL);
  googleUrl.searchParams.set("q", query);
  googleUrl.searchParams.set("maxResults", "20");

  if (apiKey) {
    googleUrl.searchParams.set("key", apiKey);
  }

  const gutenbergUrl = new URL(GUTENDEX_URL);
  gutenbergUrl.searchParams.set("search", query);
  gutenbergUrl.searchParams.set("page_size", "20");

  const results = await Promise.allSettled([
    fetch(googleUrl).then((res) => {
      if (!res.ok) throw new Error("Google Books request failed");
      return res.json();
    }),
    fetch(gutenbergUrl).then((res) => {
      if (!res.ok) throw new Error("Gutendex request failed");
      return res.json();
    }),
  ]);

  const books = [];

  // Google Books
  if (results[0].status === "fulfilled") {
    const data = results[0].value;

    for (const item of data.items ?? []) {
      const info = item.volumeInfo ?? {};
      const access = item.accessInfo ?? {};

      books.push({
        id: `google-${item.id}`,
        provider: "Google Books",
        title: info.title ?? "Untitled",
        authors: info.authors ?? [],
        cover: info.imageLinks?.thumbnail ?? "",
        description: info.description ?? "",
        previewUrl: info.previewLink ?? "",
        readUrl:
          access.webReaderLink ??
          (access.viewability === "ALL_PAGES"
            ? info.previewLink
            : ""),
        viewability: access.viewability ?? "UNKNOWN",
      });
    }
  }

  // Project Gutenberg via Gutendex
  if (results[1].status === "fulfilled") {
    const data = results[1].value;

    for (const item of data.results ?? []) {
      const formats = item.formats ?? {};

      const htmlUrl =
        formats["text/html"] ??
        formats["text/html; charset=utf-8"] ??
        "";

      const textUrl =
        formats["text/plain; charset=utf-8"] ??
        formats["text/plain"] ??
        "";

      books.push({
        id: `gutenberg-${item.id}`,
        provider: "Project Gutenberg",
        title: item.title ?? "Untitled",
        authors: (item.authors ?? []).map((a) => a.name),
        cover: formats["image/jpeg"] ?? "",
        description: "",
        previewUrl: "",
        readUrl: htmlUrl || textUrl,
        viewability: htmlUrl || textUrl ? "FULL_TEXT" : "UNKNOWN",
      });
    }
  }

  return books;
}
