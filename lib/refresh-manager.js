"use client";

// Global utility for handling page refreshes
class RefreshManager {
  constructor() {
    this.listeners = [];
    
    // Create a global event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('server-action-complete', () => this.triggerRefresh());
    }
  }
  
  // Add a listener for refresh events
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  // Trigger a refresh
  triggerRefresh() {
    console.log("Triggering refresh for all listeners");
    this.listeners.forEach(callback => callback());
    
    // Force reload as a fallback
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        console.log("Forcing page reload");
        window.location.reload();
      }
    }, 500);
  }
  
  // Notify that a server action completed
  notifyServerAction() {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('server-action-complete');
      window.dispatchEvent(event);
    }
  }
}

// Create a singleton instance
export const refreshManager = new RefreshManager();

// Hook to use in components
export function useRefreshOnAction() {
  return {
    refreshNow: () => refreshManager.triggerRefresh(),
    notifyServerAction: () => refreshManager.notifyServerAction()
  };
} 