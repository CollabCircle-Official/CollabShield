import Link from "next/link";

export default function NotFound() {
  return <main className="legal-page shell"><span className="eyebrow">404</span><h1>Page not found</h1><p>The requested resource does not exist.</p><Link className="text-link" href="/">Return to CollabShield</Link></main>;
}
