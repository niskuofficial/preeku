import * as OTPAuth from "otpauth";

const API_KEY = process.env.ANGEL_API_KEY!;
const CLIENT_ID = process.env.ANGEL_CLIENT_ID!;
const PASSWORD = process.env.ANGEL_PASSWORD!;
const TOTP_SECRET = process.env.ANGEL_TOTP_SECRET!;

const BASE_URL = "https://apiconnect.angelone.in";

interface AngelSession {
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
  expiresAt: number;
}

let session: AngelSession | null = null;
let loginPromise: Promise<AngelSession> | null = null;

function generateTOTP(): string {
  const secret = OTPAuth.Secret.fromBase32(TOTP_SECRET.toUpperCase().trim());
  const totp = new OTPAuth.TOTP({ secret, algorithm: "SHA1", digits: 6, period: 30 });
  return totp.generate();
}

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "X-UserType": "USER",
  "X-SourceID": "WEB",
  "X-ClientLocalIP": "127.0.0.1",
  "X-ClientPublicIP": "35.197.48.114",
  "X-MACAddress": "00:00:00:00:00:00",
  "X-PrivateKey": API_KEY,
};

async function angelPost(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

async function angelGet(path: string, token: string) {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` };
  const res = await fetch(`${BASE_URL}${path}`, { method: "GET", headers });
  return res.json();
}

export async function login(): Promise<AngelSession> {
  const totp = generateTOTP();
  const data = await angelPost("/rest/auth/angelbroking/user/v1/loginByPassword", {
    clientcode: CLIENT_ID,
    password: PASSWORD,
    totp,
  });

  if (!data?.data?.jwtToken) {
    throw new Error(`Angel login failed: ${data?.message ?? JSON.stringify(data)}`);
  }

  session = {
    jwtToken: data.data.jwtToken,
    refreshToken: data.data.refreshToken,
    feedToken: data.data.feedToken,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };
  return session;
}

export async function getSession(): Promise<AngelSession> {
  if (session && Date.now() < session.expiresAt) return session;
  if (loginPromise) return loginPromise;
  loginPromise = login().finally(() => { loginPromise = null; });
  return loginPromise;
}

export interface QuoteData {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getMarketQuotes(
  nseTokens: string[],
  bseTokens: string[] = []
): Promise<Record<string, QuoteData>> {
  const sess = await getSession();
  const exchangeTokens: Record<string, string[]> = {};
  if (nseTokens.length > 0) exchangeTokens["NSE"] = nseTokens;
  if (bseTokens.length > 0) exchangeTokens["BSE"] = bseTokens;

  const data = await angelPost(
    "/rest/secure/angelbroking/market/v1/quote/",
    { mode: "FULL", exchangeTokens },
    sess.jwtToken
  );

  const result: Record<string, QuoteData> = {};
  const fetched = data?.data?.fetched ?? [];
  for (const item of fetched) {
    result[item.tradingSymbol] = {
      ltp: parseFloat(item.ltp ?? 0),
      open: parseFloat(item.open ?? 0),
      high: parseFloat(item.high ?? 0),
      low: parseFloat(item.low ?? 0),
      close: parseFloat(item.close ?? 0),
      volume: parseInt(item.tradeVolume ?? item.volume ?? "0", 10),
    };
  }
  return result;
}

export async function searchSymbol(symbol: string, exchange = "NSE"): Promise<string | null> {
  const sess = await getSession();
  const data = await angelPost(
    "/rest/secure/angelbroking/order/v1/searchScrip",
    { exchange, searchscrip: symbol },
    sess.jwtToken
  );
  const match = (data?.data ?? []).find(
    (d: { tradingsymbol: string }) => d.tradingsymbol === symbol + "-EQ" || d.tradingsymbol === symbol
  );
  return match?.symboltoken ?? null;
}
