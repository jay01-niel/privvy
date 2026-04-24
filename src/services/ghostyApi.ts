// Ghosty API wrapper — all calls go through the Vite proxy to avoid CORS.
const BASE = '/api/ghosty/v1/swap';

export interface Currency {
  name: string;
  param: string;
  network: string;
  img: string;
  color: string;
  maintenance: boolean;
  newToken: boolean;
  isStable: boolean;
  isNative: boolean;
}

export interface PriceQuote {
  amount_from: number;
  amount_to: number;
  min_amount: number;
  max_amount: number;
}

let currencyCache: Currency[] | null = null;

export async function getCurrencies(): Promise<Currency[]> {
  if (currencyCache) return currencyCache;
  const res = await fetch(`${BASE}/currency`);
  const json = await res.json();
  if (json.code === 200) {
    currencyCache = json.data.filter((c: Currency) => !c.maintenance);
    return currencyCache!;
  }
  throw new Error(json.message || 'Failed to fetch currencies');
}

export async function getPrice(
  currencyFrom: string,
  currencyTo: string,
  amountFrom: number,
  isAnonym: boolean = true
): Promise<PriceQuote> {
  const params = new URLSearchParams({
    currency_from: currencyFrom,
    currency_to: currencyTo,
    amount_from: String(amountFrom),
    is_anonym: String(isAnonym),
  });
  const res = await fetch(`${BASE}/price?${params}`);
  const json = await res.json();
  if (json.code === 200) return json.data;
  // Friendly error for min amount issues
  const msg = json.message || 'Failed to get price';
  if (msg.toLowerCase().includes('min amount')) {
    throw new Error('Amount too low');
  }
  throw new Error(msg);
}

// ---- Create Swap Order ----
const API_KEY = 'MW8D5nfhcrQ_FX_Qq29fOAGe4mV5esP3I4kk9lDK0H8';

export async function createSwap(params: {
  currency_from: string;
  currency_to: string;
  amount_from: number;
  address_to: string;
  receiver_memo_tag?: string;
  is_anonym?: boolean;
  fixed?: boolean;
}): Promise<string> {
  const res = await fetch(`${BASE}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ghostycash-api-key': API_KEY,
    },
    body: JSON.stringify({
      currency_from: params.currency_from,
      currency_to: params.currency_to,
      amount_from: params.amount_from,
      address_to: params.address_to,
      receiver_memo_tag: params.receiver_memo_tag || '',
      is_anonym: params.is_anonym ?? true,
      fixed: params.fixed ?? false,
    }),
  });
  const json = await res.json();
  if (json.message === 'success' && json.order_info) {
    return json.order_info; // This is the order ID string
  }
  throw new Error(json.message || 'Failed to create swap');
}

// ---- Get Swap Status ----
export interface SwapStatus {
  order_id: string;
  creation_time: number;
  currency_from: string;
  amount_from: number;
  currency_to: string;
  amount_to: number;
  address_to: string;
  address_from: string;
  sender_memo_tag: string;
  receiver_memo_tag: string;
  is_anonym: boolean;
  fixed: boolean;
  status: number; // 0=Waiting, 1=Received, 2=Anonymizing, 3=Sending, 4=Complete, 5=Expired, 6=Failed, 7=Refund
}

export const STATUS_LABELS: Record<number, string> = {
  0: 'Waiting for payment',
  1: 'Payment received',
  2: 'Anonymizing transaction',
  3: 'Sending funds',
  4: 'Complete',
  5: 'Expired',
  6: 'Failed',
  7: 'Refund initiated',
};

export async function getSwapStatus(orderId: string): Promise<SwapStatus> {
  const params = new URLSearchParams({ order_id: orderId });
  const res = await fetch(`${BASE}/status?${params}`);
  const json = await res.json();
  if (json.message === 'success' && json.order_info) {
    return json.order_info;
  }
  throw new Error(json.message || 'Failed to get status');
}
