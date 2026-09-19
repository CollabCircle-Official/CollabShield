import type { SocialLink } from "@/lib/socials";
import { Brand } from "./brand";
import { ExternalIcon } from "./icons";
import Link from "next/link";

export function SiteFooter({ links }: { links: SocialLink[] }) {
  return <footer><div className="shell footer-grid">
    <div><Brand /></div>
    <div><h2>Connect with CollabCircle</h2><div className="socials">
      {links.length ? links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}<ExternalIcon /></a>) : <span>Social links coming soon.</span>}
    </div></div>
  </div><div className="shell policy-links"><Link href="/methodology">Methodology</Link><Link href="/faq">FAQ</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div><div className="shell copyright"><span>© {new Date().getFullYear()} CollabCircle. All rights reserved.</span><span>Built to make the web safer.</span></div></footer>;
}
