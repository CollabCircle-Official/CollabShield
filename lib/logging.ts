import { createHash, randomUUID } from "node:crypto";

export function requestId(): string { return randomUUID(); }
export function anonymize(value: string): string { return createHash("sha256").update(value).digest("hex").slice(0, 16); }
export function logEvent(event: string, fields: Record<string, string | number | boolean | undefined>): void {
  console.info(JSON.stringify({ timestamp: new Date().toISOString(), event, ...fields }));
}
