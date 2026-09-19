import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";

export function DocumentPage({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <><header className="document-header"><div className="shell"><Link href="/"><Brand /></Link><Link href="/">Back to scanner</Link></div></header>
    <main className="legal-page shell"><span className="eyebrow">{label}</span><h1>{title}</h1>{children}</main></>;
}
