/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpRequest } from '../types';

// Let's create an offline-first mock database that coordinates with local storage.
// This supports a Simulation of offline syncing and offline queues!

class DarasaStorage {
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialize default keys if not present
    if (!localStorage.getItem('darasa_requests')) {
      localStorage.setItem('darasa_requests', JSON.stringify([]));
    }
    if (!localStorage.getItem('darasa_sync_queue')) {
      localStorage.setItem('darasa_sync_queue', JSON.stringify([]));
    }
    if (!localStorage.getItem('darasa_offline_mode')) {
      localStorage.setItem('darasa_offline_mode', 'false');
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Offline status management
  public isOffline(): boolean {
    return localStorage.getItem('darasa_offline_mode') === 'true';
  }

  public setOfflineMode(offline: boolean) {
    localStorage.setItem('darasa_offline_mode', offline ? 'true' : 'false');
    this.notify();
    
    if (!offline) {
      // Trigger sync if we went back online
      this.triggerSync();
    }
  }

  // Help Requests Management
  public getRequests(): HelpRequest[] {
    try {
      return JSON.parse(localStorage.getItem('darasa_requests') || '[]');
    } catch {
      return [];
    }
  }

  public getSyncQueue(): HelpRequest[] {
    try {
      return JSON.parse(localStorage.getItem('darasa_sync_queue') || '[]');
    } catch {
      return [];
    }
  }

  public saveRequest(request: HelpRequest): { savedOffline: boolean } {
    const isOffline = this.isOffline();
    if (isOffline) {
      // Add to sync queue
      const queue = this.getSyncQueue();
      queue.push(request);
      localStorage.setItem('darasa_sync_queue', JSON.stringify(queue));
      this.notify();
      return { savedOffline: true };
    } else {
      // Save directly to main requests
      const requests = this.getRequests();
      requests.unshift(request);
      localStorage.setItem('darasa_requests', JSON.stringify(requests));
      this.notify();
      return { savedOffline: false };
    }
  }

  // Clear or overwrite all requests (e.g., seeding)
  public setRequests(requests: HelpRequest[]) {
    localStorage.setItem('darasa_requests', JSON.stringify(requests));
    this.notify();
  }

  // Triggering the sync process simulation
  private isSyncing = false;
  private syncLogs: string[] = [];
  private syncListeners: Set<(logs: string[]) => void> = new Set();

  public subscribeSync(listener: (logs: string[]) => void) {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  public getSyncLogs(): string[] {
    return this.syncLogs;
  }

  public isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  public async triggerSync() {
    const queue = this.getSyncQueue();
    if (queue.length === 0 || this.isSyncing) return;

    this.isSyncing = true;
    this.syncLogs = ['🔌 Network reconnected. Initiating cell tower handshake...'];
    this.syncListeners.forEach((l) => l(this.syncLogs));

    // Simulate stepping through transmission queue to respect 3G limits
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      await new Promise((resolve) => setTimeout(resolve, 800));
      this.syncLogs.push(`📤 Syncing request for ${item.studentName} (${item.requestType}) - Retrying packet...`);
      this.syncListeners.forEach((l) => l(this.syncLogs));

      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Save to main list
      const requests = this.getRequests();
      requests.unshift({ ...item, status: 'assigned' }); // Auto assign tutor during sync simulation
      localStorage.setItem('darasa_requests', JSON.stringify(requests));
      
      this.syncLogs.push(`✅ Successfully synced: ${item.studentName} is registered on central grid!`);
      this.syncListeners.forEach((l) => l(this.syncLogs));
    }

    // Clear sync queue
    localStorage.setItem('darasa_sync_queue', JSON.stringify([]));
    this.syncLogs.push('🎉 Sync complete. All offline records are now secured in the cloud DB.');
    this.isSyncing = false;
    this.notify();
    this.syncListeners.forEach((l) => l(this.syncLogs));
  }
}

export const darasaStorage = new DarasaStorage();
