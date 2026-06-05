import { createHash } from "crypto";

const PAYNOW_URL = "https://www.paynow.co.zw/interface/remotetransaction";

function sha512Upper(input: string) {
  return createHash("sha512").update(input, "utf8").digest("hex").toUpperCase();
}

export function paynowHash(values: Record<string, string>, key: string) {
  const concat = Object.values(values).join("") + key;
  return sha512Upper(concat);
}

export function verifyPaynowHash(payload: Record<string, string>, key: string) {
  const { hash, ...rest } = payload;
  if (!hash) return false;
  return sha512Upper(Object.values(rest).join("") + key) === hash.toUpperCase();
}

function parseUrlEncoded(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of text.split("&")) {
    const [k, v] = pair.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent((v ?? "").replace(/\+/g, " "));
  }
  return out;
}

function toUrlEncoded(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export interface InitiateParams {
  reference: string;
  amount: number; // in dollars
  email: string;
  phone: string;
  method: "ecocash" | "onemoney";
  additionalInfo: string;
  returnUrl: string;
  resultUrl: string;
}

export interface PaynowInitiateResult {
  status: string;
  pollurl?: string;
  instructions?: string;
  error?: string;
  raw: Record<string, string>;
}

export async function initiatePaynowMobile(p: InitiateParams): Promise<PaynowInitiateResult> {
  const id = process.env.PAYNOW_INTEGRATION_ID!;
  const key = process.env.PAYNOW_INTEGRATION_KEY!;
  if (!id || !key) throw new Error("Paynow credentials are not configured");

  // Field order matters for hash
  const fields: Record<string, string> = {
    id,
    reference: p.reference,
    amount: p.amount.toFixed(2),
    additionalinfo: p.additionalInfo,
    returnurl: p.returnUrl,
    resulturl: p.resultUrl,
    authemail: p.email,
    phone: p.phone,
    method: p.method,
    status: "Message",
  };
  const hash = paynowHash(fields, key);
  const body = toUrlEncoded({ ...fields, hash });

  const res = await fetch(PAYNOW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  const parsed = parseUrlEncoded(text);
  return {
    status: parsed.status ?? "Error",
    pollurl: parsed.pollurl,
    instructions: parsed.instructions,
    error: parsed.error,
    raw: parsed,
  };
}

export async function pollPaynow(pollUrl: string): Promise<Record<string, string>> {
  const res = await fetch(pollUrl, { method: "POST" });
  const text = await res.text();
  return parseUrlEncoded(text);
}

export function mapPaynowStatus(s?: string): "paid" | "pending" | "failed" | "cancelled" {
  const v = (s ?? "").toLowerCase();
  if (v === "paid" || v === "awaiting delivery" || v === "delivered") return "paid";
  if (v === "cancelled") return "cancelled";
  if (v === "failed" || v === "disputed" || v === "refunded") return "failed";
  return "pending";
}