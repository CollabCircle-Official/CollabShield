import { ShieldIcon } from "./icons";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand" aria-label="ShieldCircle home">
    <span className="brand-mark"><ShieldIcon /></span>
    <span><strong>Shield</strong><b>Circle</b>{!compact && <small>by CollabCircle</small>}</span>
  </div>;
}
