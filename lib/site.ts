export function siteUrl(): URL {
  try { return new URL(process.env.SITE_URL ?? "https://collabshield.dev"); }
  catch { return new URL("https://collabshield.dev"); }
}
