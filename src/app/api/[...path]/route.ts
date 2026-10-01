import { NextResponse, type NextRequest } from "next/server";

const API_ORIGIN = process.env.API_PROXY_TARGET || "https://api.590stcafe.shop";

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const url = new URL(`${API_ORIGIN}/api/${path.join("/")}`);
  url.search = req.nextUrl.search;

  const headers = new Headers();
  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("ngrok-skip-browser-warning", "true");

  const hasBody = !["GET", "HEAD"].includes(req.method);
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
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    console.log(`[api-proxy] ${req.method} /api/${path.join("/")} -> ${upstream.status}`);

    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (err) {
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
