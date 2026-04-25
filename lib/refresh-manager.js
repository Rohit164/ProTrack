// Global utility for handling page refreshes
class RefreshManager {
  constructor() {
    this.listeners = [];
  }
  
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  triggerRefresh() {
    this.listeners.forEach(callback => callback());
  }
  
  notifyServerAction() {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('server-action-complete');
      window.dispatchEvent(event);
    }
  }
}

export const refreshManager = new RefreshManager();