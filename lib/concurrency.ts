const MAX_CONCURRENT_SCANS = 4;
let activeScans = 0;

export function acquireScanSlot(): (() => void) | null {
  if (activeScans >= MAX_CONCURRENT_SCANS) return null;
  activeScans += 1;
  let released = false;
  return () => { if (!released) { activeScans -= 1; released = true; } };
}
