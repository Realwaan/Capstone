/**
 * CapStoneFlow Optimistic Mutation Engine (Phase 3 Scalability)
 * Provides zero-latency UI updates with automatic snapshot rollbacks on server errors.
 */

export interface OptimisticMutation<T> {
  id: string;
  type: string;
  previousState: T;
  optimisticState: T;
  timestamp: number;
}

export class OptimisticStore<T> {
  private currentState: T;
  private history: OptimisticMutation<T>[] = [];
  private listeners: Array<(state: T) => void> = [];

  constructor(initialState: T) {
    this.currentState = initialState;
  }

  public getState(): T {
    return this.currentState;
  }

  public subscribe(listener: (state: T) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.currentState));
  }

  /**
   * Execute an optimistic mutation immediately on client state,
   * then fire the asynchronous server action. If the server action rejects,
   * rollback automatically to the previous snapshot.
   */
  public async mutate<R>(
    mutationType: string,
    optimisticTransform: (prev: T) => T,
    serverAction: () => Promise<R>,
    onErrorRollback?: (error: any, rollbackState: T) => void
  ): Promise<R> {
    const mutationId = `mut_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const previousState = this.currentState;
    const optimisticState = optimisticTransform(previousState);

    // 1. Immediately apply optimistic state to UI (0ms latency)
    this.currentState = optimisticState;
    this.history.push({
      id: mutationId,
      type: mutationType,
      previousState,
      optimisticState,
      timestamp: Date.now()
    });
    this.notify();

    // 2. Perform async server operation in background
    try {
      const result = await serverAction();
      // On success, prune this mutation from pending history
      this.history = this.history.filter(m => m.id !== mutationId);
      return result;
    } catch (error) {
      // 3. On failure, rollback immediately to previous snapshot
      console.error(`[OptimisticEngine] Mutation failed: ${mutationType}. Rolling back.`, error);
      this.currentState = previousState;
      this.history = this.history.filter(m => m.id !== mutationId);
      this.notify();

      if (onErrorRollback) {
        onErrorRollback(error, previousState);
      }
      throw error;
    }
  }

  public setState(newState: T) {
    this.currentState = newState;
    this.notify();
  }
}
