const MAX_BODY_BYTES = 4_096;

/** Reads JSON with an enforced byte ceiling, including chunked requests without Content-Length. */
export async function readScanBody(request: Request): Promise<{ url?: unknown }> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) throw new RangeError("Request body is too large.");
  if (!request.body) throw new SyntaxError("A JSON request body is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new RangeError("Request body is too large."); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes)) as { url?: unknown };
}
