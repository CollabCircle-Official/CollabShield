export type CspPolicy = Map<string, string[]>;

/** Parses one or more serialized CSP policies. Commas delimit separately enforced policies. */
export function parseCsp(value: string): CspPolicy[] {
  return value.split(/,(?=\s*[a-z][a-z0-9-]*\s)/i).map((serialized) => {
    const policy: CspPolicy = new Map();
    for (const segment of serialized.split(";")) {
      const [rawName, ...sources] = segment.trim().split(/\s+/);
      if (rawName) policy.set(rawName.toLowerCase(), sources.map((source) => source.toLowerCase()));
    }
    return policy;
  }).filter((policy) => policy.size > 0);
}

const contains = (sources: string[], token: string) => sources.includes(token);

export interface CspAnalysis {
  strong: boolean;
  hasNonceOrHash: boolean;
  hasStrictDynamic: boolean;
  unsafeInlineEffective: boolean;
  hasUnsafeEval: boolean;
  protectsObjects: boolean;
  protectsBaseUri: boolean;
  frameAncestors: string[] | null;
  evidence: string[];
}

/** Models important CSP3 semantics instead of treating every unsafe-inline token as active. */
export function analyzeCsp(value: string): CspAnalysis {
  const policies = parseCsp(value);
  let hasNonceOrHash = false;
  let hasStrictDynamic = false;
  let unsafeInlineEffective = false;
  let hasUnsafeEval = false;
  let protectsObjects = false;
  let protectsBaseUri = false;
  let frameAncestors: string[] | null = null;

  for (const policy of policies) {
    const scripts = policy.get("script-src") ?? policy.get("default-src") ?? [];
    const nonceOrHash = scripts.some((source) => /^'(nonce-|sha(256|384|512)-)/.test(source));
    const strictDynamic = contains(scripts, "'strict-dynamic'");
    hasNonceOrHash ||= nonceOrHash;
    hasStrictDynamic ||= strictDynamic;
    hasUnsafeEval ||= contains(scripts, "'unsafe-eval'");
    // CSP3 ignores unsafe-inline for scripts when a nonce/hash or strict-dynamic is present.
    unsafeInlineEffective ||= contains(scripts, "'unsafe-inline'") && !nonceOrHash && !strictDynamic;
    protectsObjects ||= contains(policy.get("object-src") ?? [], "'none'");
    const base = policy.get("base-uri") ?? [];
    protectsBaseUri ||= contains(base, "'none'") || contains(base, "'self'");
    if (policy.has("frame-ancestors")) frameAncestors = policy.get("frame-ancestors") ?? [];
  }

  const evidence = [
    hasNonceOrHash ? "Nonce or hash-based script authorization detected." : "No script nonce or hash detected.",
    hasStrictDynamic ? "strict-dynamic is enabled for modern browsers." : "strict-dynamic is not present.",
    protectsObjects ? "object-src 'none' blocks plugin content." : "object-src 'none' is not present.",
    protectsBaseUri ? "base-uri is restricted." : "base-uri is not restricted.",
  ];
  if (hasUnsafeEval) evidence.push("unsafe-eval remains active and weakens script execution controls.");
  if (!unsafeInlineEffective && /'unsafe-inline'/i.test(value)) evidence.push("unsafe-inline is a compatibility token and is ignored by modern CSP3 script processing here.");

  return {
    strong: hasNonceOrHash && hasStrictDynamic && protectsObjects && protectsBaseUri && !hasUnsafeEval,
    hasNonceOrHash, hasStrictDynamic, unsafeInlineEffective, hasUnsafeEval,
    protectsObjects, protectsBaseUri, frameAncestors, evidence,
  };
}
