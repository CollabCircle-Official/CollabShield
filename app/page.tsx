import { Scanner } from "@/components/scanner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AlertIcon, CheckIcon, GlobeIcon, ShieldIcon } from "@/components/icons";
import { getSocialLinks } from "@/lib/socials";

export default function Home() {
  const socialLinks = getSocialLinks();
  return <>
    <SiteHeader links={socialLinks} />
    <main>
      <section className="hero shell">
        <h1>Know what protects<br />your <span>website.</span></h1>
        <p className="hero-copy">Instantly inspect HTTP security headers, uncover exposed attack surfaces, and get a clear, actionable security grade.</p>
        <Scanner />
        <div className="trust-row"><span><CheckIcon /> OWASP aligned</span><span><CheckIcon /> Zero data retention</span><span><CheckIcon /> Free to scan</span></div>
      </section>

      <section id="how-it-works" className="process shell">
        <h2 className="visually-hidden">How it works</h2>
        <div className="section-intro"><span className="eyebrow">HOW IT WORKS</span><p>CollabShield turns complex response headers into a report you can act on in seconds.</p></div>
        <div className="steps">
          <article><span className="step-number">01</span><GlobeIcon /><h3>Enter a domain</h3><p>Submit any publicly accessible HTTP or HTTPS website.</p></article>
          <article><span className="step-number">02</span><ShieldIcon /><h3>We inspect safely</h3><p>Our server-side scanner evaluates six critical security controls.</p></article>
          <article><span className="step-number">03</span><AlertIcon /><h3>Act on the report</h3><p>Review your grade, risks, attack vectors, and clear remediation steps.</p></article>
        </div>
      </section>

      <section className="checks"><div className="shell checks-inner">
        <div><span className="eyebrow">WHAT WE CHECK</span><h2>Six headers.<br /><span>A stronger perimeter.</span></h2></div>
        <div className="check-list">{[
          ["Content-Security-Policy", "XSS & injection"], ["Strict-Transport-Security", "MitM & SSL stripping"],
          ["X-Frame-Options", "Clickjacking"], ["X-Content-Type-Options", "MIME sniffing"],
          ["Referrer-Policy", "Information leakage"], ["Permissions-Policy", "Browser capability abuse"],
        ].map(([header, risk], index) => <div key={header}><span>0{index + 1}</span><strong>{header}</strong><small>{risk}</small></div>)}</div>
      </div></section>
    </main>
    <SiteFooter links={socialLinks} />
  </>;
}
