import { ShieldIcon } from "./icons";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand" aria-label="CollabShield home">
    <span className="brand-mark"><ShieldIcon /></span>
    <span><strong>Collab</strong><b>Shield</b>{!compact && <small>by CollabCircle</small>}</span>
  </div>;
}
