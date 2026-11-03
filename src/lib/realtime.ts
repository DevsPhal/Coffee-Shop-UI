import { Client, ReconnectionTimeMode, StompSocketState, type StompSubscription } from "@stomp/stompjs";

import { getAccessToken, onAccessTokenChange } from "@/lib/authStorage";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "wss://api.590stcafe.shop/ws";
// The API closes a socket with this code once the token it signed in with expires or is revoked.
const TOKEN_INVALID_CLOSE_CODE = 4001;

type Handler = (message: unknown) => void;

interface Topic {
  handlers: Set<Handler>;
  subscription: StompSubscription | null;
}

// One socket per tab shared by every component: each destination is subscribed once and fanned out.
const topics = new Map<string, Topic>();
// The API closes the whole session over one refused SUBSCRIBE, so asking again would only loop.
const refusedDestinations = new Set<string>();
const resyncListeners = new Set<() => void>();
let client: Client | null = null;
let connectedToken: string | null = null;
let rejectedToken: string | null = null;
let hasConnected = false;
let preparing = 0;
let refreshSession: () => Promise<unknown> = () => Promise.resolve();

function tokenExpiresAt(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function needsRefresh(token: string): boolean {
  if (token === rejectedToken) return true;
  const expiresAt = tokenExpiresAt(token);
  return expiresAt !== null && expiresAt <= Date.now();
}

// Per-user queues need a signed-in socket; topics are public, so guests get menu updates too.
function isAllowed(destination: string, token: string | null): boolean {
  if (refusedDestinations.has(destination)) return false;
  return token !== null || !destination.startsWith("/user/");
}

function wantsConnection(): boolean {
  const token = getAccessToken();
  for (const destination of topics.keys()) {
    if (isAllowed(destination, token)) return true;
  }
  return false;
}

function deliver(destination: string, body: string) {
  const topic = topics.get(destination);
  if (!topic) return;
  let message: unknown;
  try {
    message = JSON.parse(body);
  } catch {
    return;
  }
  for (const handler of [...topic.handlers]) {
    try {
      handler(message);
    } catch (error) {
      console.error(`[realtime] handler for ${destination} failed`, error);
    }
  }
}

function unsubscribeQuietly(topic: Topic) {
  try {
    topic.subscription?.unsubscribe();
  } catch {
    // The connection is already gone, and the subscription with it.
  }
  topic.subscription = null;
}

function syncSubscriptions() {
  if (!client?.connected) return;
  for (const [destination, topic] of topics) {
    const allowed = isAllowed(destination, connectedToken);
    if (allowed && !topic.subscription) {
      try {
        topic.subscription = client.subscribe(destination, (frame) => deliver(destination, frame.body));
      } catch {
        // Dropped mid-way; onConnect subscribes again.
      }
    } else if (!allowed && topic.subscription) {
      unsubscribeQuietly(topic);
    }
  }
}

function ensureConnection() {
  const stomp = getClient();
  if (!wantsConnection()) {
    if (stomp.active) void stomp.deactivate();
  } else if (!stomp.active) {
    stomp.activate();
  }
}

// Drops the current socket and dials again straight away, skipping any back-off wait.
function restart() {
  if (!client) return;
  void client.deactivate();
  ensureConnection();
}

function handleAccessTokenChange() {
  // Another account may be allowed what this one was refused.
  refusedDestinations.clear();
  // A connect in progress reads the token after its own refresh, so it already has the new one.
  if (!client || preparing > 0) return;
  if (client.connected && getAccessToken() === connectedToken) return;
  restart();
}

// Phones drop sockets in the background; when the page comes back, dial at once instead of waiting out the back-off.
function wake() {
  if (!client?.active || client.connected || preparing > 0) return;
  const state = client.webSocket?.readyState;
  if (state === StompSocketState.CONNECTING || state === StompSocketState.OPEN) return;
  restart();
}

async function prepareConnect(stomp: Client) {
  preparing++;
  try {
    const token = getAccessToken();
    if (token && needsRefresh(token)) {
      // Go through the REST client: refresh tokens are single-use, so refreshing here as well would race it and
      // sign the customer out.
      await refreshSession();
    }
  } catch {
    // Offline: dial anyway and let the back-off retry.
  } finally {
    preparing--;
  }
  connectedToken = getAccessToken();
  stomp.connectHeaders = connectedToken ? { Authorization: `Bearer ${connectedToken}` } : {};
  if (!wantsConnection()) await stomp.deactivate();
}

function getClient(): Client {
  if (client) return client;
  const stomp = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 1000,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    maxReconnectDelay: 30_000,
    connectionTimeout: 10_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
  });
  stomp.beforeConnect = prepareConnect;
  stomp.onConnect = () => {
    rejectedToken = null;
    syncSubscriptions();
    // Anything pushed while the socket was down never arrives, so have the pages refetch what they show.
    if (hasConnected) resyncListeners.forEach((listener) => listener());
    hasConnected = true;
  };
  stomp.onStompError = (frame) => {
    if (stomp.connected) {
      // A refused SUBSCRIBE ("Not allowed to subscribe to /topic/x"): reconnect without it.
      const refused = /subscribe to (\S+)/.exec(frame.headers.message ?? "")?.[1];
      if (refused) refusedDestinations.add(refused);
      return;
    }
    // A refused CONNECT is almost always the token: refresh it on the next try, which backs off.
    rejectedToken = connectedToken;
    stomp.forceDisconnect();
  };
  stomp.onWebSocketClose = (event) => {
    if (event.code === TOKEN_INVALID_CLOSE_CODE) rejectedToken = connectedToken;
    topics.forEach((topic) => {
      topic.subscription = null;
    });
  };
  client = stomp;
  onAccessTokenChange(handleAccessTokenChange);
  window.addEventListener("online", wake);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") wake();
  });
  return stomp;
}

/** Listens on a STOMP destination over the tab's shared socket. Returns the unsubscribe function. */
export function subscribeRealtime(destination: string, handler: Handler): () => void {
  if (typeof window === "undefined") return () => {};
  let topic = topics.get(destination);
  if (!topic) {
    topic = { handlers: new Set(), subscription: null };
    topics.set(destination, topic);
  }
  topic.handlers.add(handler);
  ensureConnection();
  syncSubscriptions();

  return () => {
    const current = topics.get(destination);
    if (!current?.handlers.delete(handler)) return;
    if (current.handlers.size === 0) {
      unsubscribeQuietly(current);
      topics.delete(destination);
    }
    ensureConnection();
  };
}

/** Runs after the socket reconnects, when anything pushed while it was down has been missed. */
export function onRealtimeResync(listener: () => void): () => void {
  resyncListeners.add(listener);
  return () => {
    resyncListeners.delete(listener);
  };
}

/** How the socket gets a fresh access token; the app points this at the REST client so both share one refresh. */
export function setRealtimeSessionRefresher(refresh: () => Promise<unknown>): void {
  refreshSession = refresh;
}
