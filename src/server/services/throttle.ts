type ThrottleState = {
  count: number;
  blockedUntil?: number;
};

const WINDOW_SECONDS = 60 * 10;
const MAX_ATTEMPTS = 5;
const BLOCK_SECONDS = 60 * 15;

export async function checkLoginThrottle(kv: KVNamespace, email: string, ip: string) {
  const key = throttleKey(email, ip);
  const state = await kv.get<ThrottleState>(key, "json");

  if (!state?.blockedUntil) {
    return null;
  }

  if (state.blockedUntil <= Date.now()) {
    await kv.delete(key);
    return null;
  }

  return state.blockedUntil;
}

export async function recordLoginFailure(kv: KVNamespace, email: string, ip: string) {
  const key = throttleKey(email, ip);
  const current = (await kv.get<ThrottleState>(key, "json")) ?? { count: 0 };
  const nextCount = current.count + 1;
  const state: ThrottleState = {
    count: nextCount
  };

  if (nextCount >= MAX_ATTEMPTS) {
    state.blockedUntil = Date.now() + BLOCK_SECONDS * 1000;
  }

  await kv.put(key, JSON.stringify(state), {
    expirationTtl: WINDOW_SECONDS
  });
}

export async function resetLoginThrottle(kv: KVNamespace, email: string, ip: string) {
  await kv.delete(throttleKey(email, ip));
}

function throttleKey(email: string, ip: string) {
  return `throttle:login:${email.toLowerCase()}:${ip}`;
}
