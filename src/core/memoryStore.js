/**
 * Default in-process store. Bounded + self-cleaning.
 * Custom stores (Redis, etc.) need: get(id), set(id, record, ttlMs), delete(id)
 * — each may be async. Use one shared `secret` across instances.
 */
export class MemoryStore {
  constructor({ maxEntries = 10000, sweepIntervalMs = 60000 } = {}) {
    this.map = new Map();
    this.maxEntries = maxEntries;
    this.timer = setInterval(() => this.sweep(), sweepIntervalMs);
    this.timer.unref?.();
  }
  async get(id) { return this.map.get(id); }
  async set(id, record) {
    if (!this.map.has(id)) {
      while (this.map.size >= this.maxEntries) this.map.delete(this.map.keys().next().value);
    }
    this.map.set(id, record);
  }
  async delete(id) { this.map.delete(id); }
  sweep() {
    const cutoff = Date.now() - 60000; // keep briefly so users see "expired"
    for (const [id, r] of this.map) if (r.expiresAt < cutoff) this.map.delete(id);
  }
  close() { clearInterval(this.timer); this.map.clear(); }
}
