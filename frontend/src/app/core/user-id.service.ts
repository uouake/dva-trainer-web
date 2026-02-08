import { Injectable } from '@angular/core';

// Anonymous user id persisted on the client.
//
// We intentionally avoid authentication for now.
// This UUID is enough to persist attempts and compute stats locally.

const STORAGE_KEY = 'dva.userId';

@Injectable({
  providedIn: 'root',
})
export class UserIdService {
  getOrCreate(): string {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  }

  // Dev-only helper.
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
