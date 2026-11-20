// Petit client HTTP (fetch natif) avec délai maximal et cache mémoire optionnel.
export class HttpClient {
  constructor({ timeoutMs = 8000, cacheTtlMs = 0, userAgent = 'BivySwiss/0.1 (dev)' } = {}) {
    this.timeoutMs = timeoutMs;
    this.cacheTtlMs = cacheTtlMs;
    this.userAgent = userAgent;
    this.cache = new Map();
  }

  async getJson(url) {
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const res = await fetch(url, { headers: { 'User-Agent': this.userAgent, Accept: 'application/json' }, signal: AbortSignal.timeout(this.timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${new URL(url).host}`);
    const value = await res.json();
    if (this.cacheTtlMs > 0) {
      this.cache.set(url, { value, expiresAt: Date.now() + this.cacheTtlMs });
      if (this.cache.size > 500) this.cache.delete(this.cache.keys().next().value);
    }
    return value;
  }

  async getBuffer(url) {
    const res = await fetch(url, { headers: { 'User-Agent': this.userAgent }, signal: AbortSignal.timeout(this.timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status} sur ${new URL(url).host}`);
    return { buffer: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') };
  }
}
