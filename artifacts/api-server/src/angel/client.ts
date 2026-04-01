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

function generateTOTP(): string {
  try {
    const secret = OTPAuth.Secret.fromBase32(TOTP_SECRET.toUpperCase());
    const totp = new OTPAuth.TOTP({ secret, algorithm: "SHA1", digits: 6, period: 30 });
    return totp.generate();
  } catch {
    try {
      const secret = new OTPAuth.Secret({ buffer: Buffer.from(TOTP_SECRET, "hex") });
      const totp = new OTPAuth.TOTP({ secret, algorithm: "SHA1", digits: 6, period: 30 });
      return totp.generate();
    } catch {
      const secret = new OTPAuth.Secret({ buffer: Buffer.from(TOTP_SECRET, "utf8") });
      const totp = new OTPAuth.TOTP({ secret, algorithm: "SHA1", digits: 6, period: 30 });
      return totp.generate();
    }
  }
}

async function angelPost(path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": "127.0.0.1",
    "X-ClientPublicIP": "35.197.48.114",
    "X-MACAddress": "00:00:00:00:00:00",
    "X-PrivateKey": API_KEY,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
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
  return login();
}

export async function getLTP(exchange: string, symbolToken: string): Promise<number | null> {
  const sess = await getSession();
  const data = await angelPost(
    "/rest/secure/angelbroking/order/v1/getLtpData",
    { exchange, tradingsymbol: symbolToken, symboltoken: symbolToken },
    sess.jwtToken
  );
  if (data?.data?.ltp) return parseFloat(data.data.ltp);
  return null;
}

export async function getMarketQuote(
  tokens: { exchange: string; symboltoken: string }[]
): Promise<Record<string, { ltp: number; open: number; high: number; low: number; close: number; volume: number }>> {
  const sess = await getSession();
  const data = await angelPost(
    "/rest/secure/angelbroking/market/v1/quote/",
    {
      mode: "FULL",
      exchangeTokens: {
        NSE: tokens.filter((t) => t.exchange === "NSE").map((t) => t.symboltoken),
        BSE: tokens.filter((t) => t.exchange === "BSE").map((t) => t.symboltoken),
      },
    },
    sess.jwtToken
  );

  const result: Record<string, { ltp: number; open: number; high: number; low: number; close: number; volume: number }> = {};
  const fetched = data?.data?.fetched ?? [];
  for (const item of fetched) {
    result[item.tradingSymbol] = {
      ltp: parseFloat(item.ltp),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.tradeVolume ?? item.volume ?? "0"),
    };
  }
  return result;
}
