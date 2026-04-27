/**
 * Normalizes a URL for duplicate detection.
 *
 * IMPORTANT: This function intentionally contains a known bug for the course:
 * it does NOT remove trailing slashes (e.g., https://example.com vs https://example.com/).
 * Learners will fix this later using log-driven debugging and regression tests.
 */
export function normalizeUrl(input: string): string {
  const url = new URL(input);
  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }

  const host = url.host.toLowerCase();
  const pathname = url.pathname || "/"; // BUG: does not normalize trailing slash
  const search = url.search || "";

  return `${protocol}//${host}${pathname}${search}`;
}
