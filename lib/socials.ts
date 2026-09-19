export interface SocialLink { label: string; href: string }

const SOCIAL_VARIABLES = ["Website", "Facebook", "Instagram", "Linkedin", "X", "YouTube"] as const;

/** Reads social URLs only on the server and excludes malformed or non-HTTPS links. */
export function getSocialLinks(): SocialLink[] {
  return SOCIAL_VARIABLES.flatMap((label) => {
    const raw = process.env[label]?.trim();
    if (!raw) return [];
    try {
      const url = new URL(raw);
      return url.protocol === "https:" ? [{ label, href: url.toString() }] : [];
    } catch { return []; }
  });
}
