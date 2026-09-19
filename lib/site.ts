export function siteUrl(): URL {
  try { return new URL(process.env.SITE_URL ?? "https://shieldcircle.dev"); }
  catch { return new URL("https://shieldcircle.dev"); }
}
