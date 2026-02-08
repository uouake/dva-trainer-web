// Central place for reading environment variables.
//
// Why?
// - Keeps configuration in one place.
// - Makes it easy to migrate between environments (dev, CI, prod).
// - Helps us avoid sprinkling `process.env.X` all over the codebase.

export function requireEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`Env var ${name} must be a number; got: ${raw}`);
  }
  return n;
}
