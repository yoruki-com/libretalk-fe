/**
 * Persistent in-memory debug log.
 *
 * Metro console disconnects when `openAuthSessionAsync` opens the browser,
 * so `console.log` lines are lost.  This module stores log entries in a
 * module-level array that survives across renders and can be displayed
 * on-screen by any component (via `getDebugLog()`).
 *
 * Import `dbg` in any file — no circular-dependency issues.
 */

const DEBUG_LOG: string[] = [];
const MAX_DEBUG_LINES = 200;

export function dbg(msg: string) {
  const ts = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
  const line = `${ts} ${msg}`;
  DEBUG_LOG.push(line);
  if (DEBUG_LOG.length > MAX_DEBUG_LINES) DEBUG_LOG.shift();
  console.log(msg);
}

/** Read the full in-memory log (for on-screen display). */
export function getDebugLog(): string[] {
  return DEBUG_LOG;
}
