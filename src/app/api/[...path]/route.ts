import { NextResponse, type NextRequest } from "next/server";

/**
 * Same-origin proxy for the real API. The browser only ever talks to this Next.js server, so
 * its Origin header is always this app's own origin — meaningless (and actively harmful) once
 * forwarded on, since the upstream's CORS allowlist only contains the production storefront
 * domains and rejects anything else with a flat 403.
 *
 * A `next.config.ts` `rewrites()` entry looked like the simpler way to do this, but Next
 * forwards the incoming request's headers verbatim to a rewrite destination — including
 * Origin — so any POST/PUT/PATCH/DELETE (the methods browsers attach Origin to even for
 * same-origin fetches) still got rejected upstream. Handling the proxy explicitly here means
 * only Authorization and Content-Type cross the boundary.
 */
const API_ORIGIN = process.env.API_PROXY_TARGET || "https://api.590stcafe.shop";

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const url = new URL(`${API_ORIGIN}/api/${path.join("/")}`);
  url.search = req.nextUrl.search;

  const headers = new Headers();
  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  // Harmless against the real API; needed when API_PROXY_TARGET is a free ngrok tunnel (a local
  // backend under test), which otherwise answers with its HTML warning page instead of JSON.
  headers.set("ngrok-skip-browser-warning", "true");

  const hasBody = !["GET", "HEAD"].includes(req.method);
  // Buffered rather than streamed: every body this app sends is a small JSON payload or a
  // profile-photo upload, never large enough to need streaming, and buffering sidesteps a
  // `duplex: "half"` / undici combination that threw "expected non-null body source" here.
  const body = hasBody ? await req.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers(upstream.headers);
    // Node decodes the body for us; forwarding these would make the client try to decode again.
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    // The standalone production server (unlike `next dev`) logs nothing per request by
    // default, which made a prior "why did this fail" report undiagnosable after the fact —
    // `docker logs` showed only the startup banner. This is what makes the next one traceable.
    console.log(`[api-proxy] ${req.method} /api/${path.join("/")} -> ${upstream.status}`);

    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (err) {
    // A network-level failure reaching the upstream (DNS, timeout, connection refused) would
    // otherwise surface to the browser as an opaque failed fetch with no server-side trace.
    console.error(`[api-proxy] ${req.method} /api/${path.join("/")} -> FAILED:`, err);
    return NextResponse.json(
      { status: "BAD_GATEWAY", message: "Could not reach the API.", path: `/api/${path.join("/")}` },
      { status: 502 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  return proxy(req, (await params).path);
}
