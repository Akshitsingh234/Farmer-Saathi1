// /app/api/imageSearch/route.ts
import { NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

if (!GOOGLE_API_KEY || !GOOGLE_CX) {
  // When running locally without .env, you'll get a helpful error server-side
  console.warn("Missing GOOGLE_API_KEY or GOOGLE_CX env variables.");   
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const num = Math.min(Number(searchParams.get("num") || "1"), 10); // clamp max to 10

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    return NextResponse.json({ error: "Server not configured with API key / CX" }, { status: 500 });
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(
    GOOGLE_API_KEY
  )}&cx=${encodeURIComponent(GOOGLE_CX)}&searchType=image&q=${encodeURIComponent(
    q
  )}&num=${num}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: "Google API error", details: txt }, { status: 502 });
    }
    const data = await res.json();

    // data.items is an array of image result objects
    // Each item typically has .link and .image (details)
    const imageUrls = (data.items || []).map((it: any) => ({
      link: it.link,
      contextLink: it.image?.contextLink || null,
      mime: it.mime || null,
      title: it.title || null,
    }));

    return NextResponse.json({ imageUrls });
  } catch (err: any) {
    return NextResponse.json({ error: "Fetch failed", details: err.message }, { status: 500 });
  }
}
