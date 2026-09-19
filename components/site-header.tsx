import Link from "next/link";
import type { SocialLink } from "@/lib/socials";
import { Brand } from "./brand";
import { ExternalIcon } from "./icons";
import { ScoreGuide } from "./score-guide";

export function SiteHeader({ links }: { links: SocialLink[] }) {
  const website = links.find((link) => link.label === "Website");
  return <header className="site-header"><div className="shell nav-inner">
    <Link href="/"><Brand /></Link>
    <nav aria-label="Primary navigation">
      <a href="#scanner">Scanner</a><a href="#how-it-works">How it works</a><ScoreGuide />
      {website && <a className="company-link" href={website.href} target="_blank" rel="noreferrer">A Product of CollabCircle <ExternalIcon /></a>}
    </nav>
  </div></header>;
}
