type Listener<T> = (payload: T) => void | Promise<void>
type SubscribeHook = (event: string) => void

export class EventBus<TEventMap extends Record<string, unknown> = Record<string, unknown>> {
  private listeners = new Map<string, Set<Listener<unknown>>>()
  private subscribeHooks = new Set<SubscribeHook>()

  // Known event names (declared as literal keys in TEventMap) get their real
  // payload type checked here - a mismatched listener is a compile error, not
  // a silent fallback. Anything else (e.g. a Plugin's own event name) resolves
  // through TEventMap's own index signature, same as the untyped default.
  on<K extends keyof TEventMap & string>(event: K, listener: Listener<TEventMap[K]>): () => void {
    let set = this.listeners.get(event)
    const isFirstListener = !set
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener as Listener<unknown>)

    if (isFirstListener) for (const hook of this.subscribeHooks) hook(event)

    return () => set.delete(listener as Listener<unknown>)
  }

  // Lets a module (e.g. the Streamer.bot Adapter) lazily activate an external
  // subscription only once something on the bus actually cares, instead of
  // eagerly wiring up every possible source at startup. Replays every event
  // that already has a listener so registration order never matters.
  onSubscribe(hook: SubscribeHook): () => void {
    this.subscribeHooks.add(hook)
    for (const event of this.listeners.keys()) hook(event)

    return () => this.subscribeHooks.delete(hook)
  }

  emit<K extends keyof TEventMap & string>(event: K, payload: TEventMap[K]): void {
    const set = this.listeners.get(event)
    if (!set) return

    for (const listener of set) {
      try {
        void Promise.resolve(listener(payload)).catch(error => {
          console.error(`[events] listener for "${event}" failed`, error)
        })
      } catch(error) {
        console.error(`[events] listener for "${event}" failed`, error)
      }
    }
  }
}
