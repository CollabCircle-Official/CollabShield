"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="legal-page shell"><span className="eyebrow">SYSTEM ERROR</span><h1>Something went wrong</h1><p>The request could not be completed. No scan data was retained.</p><button className="retry-button" onClick={reset}>Try again</button></main></body></html>;
}
