// Simple script progress monitor - can be removed later
// Usage: import { monitor } from './script-monitor';
//        monitor.start('my-script', 1000);
//        monitor.update(100);
//        monitor.finish();

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const STATE_FILE = resolve(process.cwd(), '..', '..', '.script-monitor-state.json');

interface ScriptState {
  name: string;
  total: number;
  current: number;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  updatedAt: string;
  message?: string;
}

export const monitor = {
  start(name: string, total: number, message?: string) {
    const state: ScriptState = {
      name,
      total,
      current: 0,
      status: 'running',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      message,
    };
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`[MONITOR] Started: ${name} (${total} items)`);
  },

  update(current: number, message?: string) {
    if (!existsSync(STATE_FILE)) return;
    const state: ScriptState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    state.current = current;
    state.updatedAt = new Date().toISOString();
    if (message) state.message = message;
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  },

  finish(message?: string) {
    if (!existsSync(STATE_FILE)) return;
    const state: ScriptState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    state.current = state.total;
    state.status = 'completed';
    state.updatedAt = new Date().toISOString();
    if (message) state.message = message;
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`[MONITOR] Completed: ${state.name}`);
  },

  fail(error: string) {
    if (!existsSync(STATE_FILE)) return;
    const state: ScriptState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    state.status = 'failed';
    state.updatedAt = new Date().toISOString();
    state.message = error;
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`[MONITOR] Failed: ${state.name} - ${error}`);
  },
};

// CLI usage: ts-node script-monitor.ts status
if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'status') {
    if (!existsSync(STATE_FILE)) {
      console.log('No active script');
      process.exit(0);
    }
    const state: ScriptState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    const pct = Math.round((state.current / state.total) * 100);
    const duration = Date.now() - new Date(state.startedAt).getTime();
    const mins = Math.floor(duration / 60000);
    
    console.log(`Script: ${state.name}`);
    console.log(`Status: ${state.status}`);
    console.log(`Progress: ${state.current}/${state.total} (${pct}%)`);
    console.log(`Duration: ${mins}m`);
    if (state.message) console.log(`Message: ${state.message}`);
    
    // Alert if stuck (>30min without update)
    const lastUpdate = Date.now() - new Date(state.updatedAt).getTime();
    if (state.status === 'running' && lastUpdate > 30 * 60 * 1000) {
      console.log(`⚠️ ALERT: No update for ${Math.floor(lastUpdate/60000)} minutes!`);
      process.exit(1);
    }
  }
}
