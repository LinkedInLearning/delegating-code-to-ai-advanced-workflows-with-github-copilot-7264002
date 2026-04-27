import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        // Return fallback data instead of erroring
        return NextResponse.json({
          title: parsedUrl.hostname,
          description: "",
        });
      }

      const html = await response.text();

      // Extract metadata
      const title = extractTitle(html);
      const description = extractDescription(html);

      return NextResponse.json({
        title: title || parsedUrl.hostname,
        description: description || "",
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("Fetch error:", fetchError.message);
      // Return fallback data on network errors
      return NextResponse.json({
        title: parsedUrl.hostname,
        description: "",
      });
    }
  } catch (error: any) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

function extractTitle(html: string): string | null {
  // Try Open Graph title
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (ogTitle?.[1]) return decodeHtml(ogTitle[1]);

  // Try Twitter title
  const twitterTitle = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (twitterTitle?.[1]) return decodeHtml(twitterTitle[1]);

  // Try regular title tag
  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleTag?.[1]) return decodeHtml(titleTag[1]);

  return null;
}

function extractDescription(html: string): string | null {
  // Try Open Graph description
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (ogDesc?.[1]) return decodeHtml(ogDesc[1]);

  // Try Twitter description
  const twitterDesc = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (twitterDesc?.[1]) return decodeHtml(twitterDesc[1]);

  // Try meta description
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (metaDesc?.[1]) return decodeHtml(metaDesc[1]);

  return null;
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}
