/**
 * Reproduces the seeded bug around URL normalization (trailing slash duplicates).
 *
 * How to use:
 * 1) In one terminal: npm run gp:dev
 * 2) In another terminal: npm run gp:repro
 *
 * Output:
 * - Prints the API responses
 * - Writes structured logs to ./logs/app.log (from the API routes)
 */
const base = process.env.BASE_URL ?? "http://localhost:3000";

async function postResource(url: string, title: string) {
  const res = await fetch(`${base}/api/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log("Reproducing URL normalization bug...");
  const a = await postResource("https://example.com", "Example (no slash)");
  const b = await postResource("https://example.com/", "Example (with slash)");

  console.log("1) POST https://example.com ->", a.status, a.body);
  console.log("2) POST https://example.com/ ->", b.status, b.body);

  console.log("\nIf both were created, duplicates slipped through (expected for the course).");
  console.log("Check logs at: ./logs/app.log");
}

main().catch((e) => {
  console.error("Repro failed:", e);
  console.error("Make sure the dev server is running: npm run gp:dev");
  process.exit(1);
});
