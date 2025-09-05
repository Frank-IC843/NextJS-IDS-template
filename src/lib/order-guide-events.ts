/**
 * Global event system for order guide updates
 * Enables real-time communication between chat and order guides
 */

type OrderGuideEventType = 'order-guide-created' | 'order-guide-deleted' | 'order-guide-updated';

export interface OrderGuideEvent {
  type: OrderGuideEventType;
  data: {
    orderGuideId?: string;
    name?: string;
    retailerId?: string;
    description?: string;
  };
  timestamp: number;
}

class OrderGuideEventEmitter extends EventTarget {
  emit(event: OrderGuideEvent) {
    this.dispatchEvent(new CustomEvent('order-guide-change', { detail: event }));
  }

  subscribe(callback: (event: OrderGuideEvent) => void) {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<OrderGuideEvent>;
      callback(customEvent.detail);
    };
    this.addEventListener('order-guide-change', handler);
    return () => this.removeEventListener('order-guide-change', handler);
  }
}

// Singleton instance
export const orderGuideEvents = new OrderGuideEventEmitter();
