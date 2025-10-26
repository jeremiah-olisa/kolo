/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorageEvent, StorageEventDataMap, EventListener } from './event-types';

/**
 * Storage Event Emitter
 * Handles event listening and emission for storage operations
 */
export class StorageEventEmitter {
  private readonly listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * Register an event listener
   * @param event - The event to listen for
   * @param listener - The listener function
   * @returns A function to unregister the listener
   */
  on<K extends keyof StorageEventDataMap>(
    event: K,
    listener: EventListener<StorageEventDataMap[K]>,
  ): () => void {
    const eventKey = event as string;
    
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, new Set());
    }

    const listeners = this.listeners.get(eventKey)!;
    listeners.add(listener as EventListener);

    // Return unsubscribe function
    return () => {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventKey);
      }
    };
  }

  /**
   * Register a one-time event listener
   * @param event - The event to listen for
   * @param listener - The listener function
   * @returns A function to unregister the listener
   */
  once<K extends keyof StorageEventDataMap>(
    event: K,
    listener: EventListener<StorageEventDataMap[K]>,
  ): () => void {
    const wrappedListener = async (data: StorageEventDataMap[K]) => {
      unsubscribe();
      await listener(data);
    };

    const unsubscribe = this.on(event, wrappedListener);
    return unsubscribe;
  }

  /**
   * Remove an event listener
   * @param event - The event to remove the listener from
   * @param listener - The listener function to remove
   */
  off<K extends keyof StorageEventDataMap>(
    event: K,
    listener: EventListener<StorageEventDataMap[K]>,
  ): void {
    const eventKey = event as string;
    const listeners = this.listeners.get(eventKey);
    
    if (listeners) {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventKey);
      }
    }
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified
   * @param event - Optional event to clear listeners for
   */
  removeAllListeners(event?: StorageEvent): void {
    if (event) {
      this.listeners.delete(event as string);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param event - The event to emit
   * @param data - The event data
   */
  async emit<K extends keyof StorageEventDataMap>(
    event: K,
    data: StorageEventDataMap[K],
  ): Promise<void> {
    const eventKey = event as string;
    const listeners = this.listeners.get(eventKey);

    if (!listeners || listeners.size === 0) {
      return;
    }

    // Execute all listeners (in parallel for async listeners)
    const promises = Array.from(listeners).map((listener) => {
      try {
        return Promise.resolve(listener(data));
      } catch (error) {
        console.error(`Error in event listener for ${eventKey}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Get the number of listeners for an event
   * @param event - The event to count listeners for
   */
  listenerCount(event: StorageEvent): number {
    const listeners = this.listeners.get(event as string);
    return listeners ? listeners.size : 0;
  }

  /**
   * Get all events that have registered listeners
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if an event has any listeners
   * @param event - The event to check
   */
  hasListeners(event: StorageEvent): boolean {
    const listeners = this.listeners.get(event as string);
    return listeners ? listeners.size > 0 : false;
  }
}
