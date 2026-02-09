#!/usr/bin/env node
// Agent script - can be run standalone to check script status and notify
// Usage: ts-node check-script-agent.ts

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

interface ScriptState {
  name: string;
  total: number;
  current: number;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  updatedAt: string;
  message?: string;
}

const STATE_FILE = resolve(process.cwd(), '..', '..', '.script-monitor-state.json');

function checkStatus(): { ok: boolean; message: string; alert?: boolean } {
  if (!existsSync(STATE_FILE)) {
    return { ok: true, message: 'No active script' };
  }

  const state: ScriptState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  const pct = Math.round((state.current / state.total) * 100);
  const duration = Date.now() - new Date(state.startedAt).getTime();
  const mins = Math.floor(duration / 60000);
  const lastUpdate = Date.now() - new Date(state.updatedAt).getTime();
  const minsSinceUpdate = Math.floor(lastUpdate / 60000);

  // Completed
  if (state.status === 'completed') {
    return { 
      ok: true, 
      message: `✅ Script "${state.name}" completed in ${mins}m (${state.total} items)` 
    };
  }

  // Failed
  if (state.status === 'failed') {
    return { 
      ok: false, 
      message: `❌ Script "${state.name}" FAILED: ${state.message}`,
      alert: true 
    };
  }

  // Stuck detection (>30min without update)
  if (state.status === 'running' && minsSinceUpdate > 30) {
    return { 
      ok: false, 
      message: `⚠️ Script "${state.name}" STUCK: No update for ${minsSinceUpdate}min (was at ${pct}%)`,
      alert: true 
    };
  }

  // Running normally
  return { 
    ok: true, 
    message: `🔄 "${state.name}" running: ${state.current}/${state.total} (${pct}%) - ${minsSinceUpdate}min since update` 
  };
}

// Run check
const result = checkStatus();
console.log(result.message);

// Exit with error if alert needed (for cron/job systems)
if (result.alert) {
  process.exit(1);
}
