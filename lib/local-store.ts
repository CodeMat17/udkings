type Listener = () => void;

/**
 * A localStorage-backed store read through useSyncExternalStore.
 *
 * The server snapshot and the first client snapshot are both the fallback, so
 * hydration matches exactly; the stored value is read when the first component
 * subscribes — after hydration — and listeners are notified then. No setState
 * inside an effect, and no flash of the wrong cart count.
 */
export class LocalStore<T> {
  private value: T;
  private readonly listeners = new Set<Listener>();
  private hydrated = false;

  constructor(
    private readonly key: string,
    private readonly fallback: T,
    private readonly parse: (raw: unknown) => T,
    /** Runs once on hydration; anything it returns is surfaced to the UI. */
    private readonly onHydrate?: (value: T) => { value: T; notices: string[] },
  ) {
    this.value = fallback;
  }

  /** Messages produced while validating stored data, for the UI to announce. */
  notices: string[] = [];

  get isHydrated(): boolean {
    return this.hydrated;
  }

  /** Idempotent: safe to call from a write that lands before the first read. */
  private hydrate(): void {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    try {
      const raw = window.localStorage.getItem(this.key);
      if (raw !== null) this.value = this.parse(JSON.parse(raw));
    } catch {
      /* Private mode, or corrupt data. Fall back to empty. */
    }
    if (this.onHydrate) {
      const checked = this.onHydrate(this.value);
      this.value = checked.value;
      this.notices = checked.notices;
    }
  }

  subscribe = (listener: Listener): (() => void) => {
    const first = !this.hydrated;
    this.hydrate();
    this.listeners.add(listener);
    // Tell this subscriber the stored value arrived, once hydration happened.
    if (first) queueMicrotask(() => this.emit());
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): T => this.value;

  getServerSnapshot = (): T => this.fallback;

  set(next: T): void {
    this.value = next;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(next));
    } catch {
      /* The change still applies for this session. */
    }
    this.emit();
  }

  update(fn: (current: T) => T): void {
    // A write before first read must still start from what was stored.
    this.hydrate();
    this.set(fn(this.value));
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}
