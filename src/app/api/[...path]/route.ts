import { NextResponse, type NextRequest } from "next/server";

const API_ORIGIN = process.env.API_PROXY_TARGET || "https://api.590stcafe.shop";
const FORWARDED_HEADERS = ["authorization", "content-type"];

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: RouteContext): Promise<Response> {
  const apiPath = `/api/${(await params).path.join("/")}`;
  const url = new URL(API_ORIGIN + apiPath);
  url.search = req.nextUrl.search;

  const headers = new Headers({ "ngrok-skip-browser-warning": "true" });
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (err) {
    console.error(`[api-proxy] ${req.method} ${apiPath} -> FAILED:`, err);
    return NextResponse.json(
      { status: "BAD_GATEWAY", message: "Could not reach the API.", path: apiPath },
      { status: 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
