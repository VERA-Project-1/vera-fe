import { createLogger } from "@/lib/logger";
import { PREDICTION_NUMBER_FIELDS, type PredictionResponse } from "@/types";

// Proxies audio uploads to the FastAPI server. BACKEND_URL is read server-side only,
// so it never ships to the browser, and every request is logged in the Next.js terminal.
export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const log = createLogger("predict", requestId);
  const start = performance.now();
  const elapsed = () => `${Math.round(performance.now() - start)} ms`;

  const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");
  if (!backendUrl) {
    log.error("BACKEND_URL is not set — add it to .env and restart `npm run dev`");
    return Response.json({ detail: "Backend URL not configured on the server." }, { status: 500 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    log.warn("Request had no 'file' field");
    return Response.json({ detail: "No audio file in request." }, { status: 400 });
  }
  log.info(`Upload '${file.name}' (${file.type || "unknown type"}, ${(file.size / 1024).toFixed(1)} KB) → ${backendUrl}/predict`);

  let upstream: Response;
  try {
    upstream = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: form,
      headers: { "X-Request-ID": requestId },
    });
  } catch (err) {
    const cause = err instanceof Error ? (err.cause as Error | undefined)?.message ?? err.message : String(err);
    log.error(`Backend unreachable at ${backendUrl} after ${elapsed()}: ${cause}. Is uvicorn running?`);
    return Response.json({ detail: `Cannot reach the analysis server at ${backendUrl}.` }, { status: 502 });
  }

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    const detail = body?.detail ?? upstream.statusText;
    log.warn(`Backend responded ${upstream.status} in ${elapsed()}: ${detail}`);
    return Response.json({ detail }, { status: upstream.status });
  }

  // Catch contract drift here instead of rendering NaN in the UI.
  const missing = PREDICTION_NUMBER_FIELDS.filter((key) => typeof body?.[key] !== "number");
  if (typeof body?.emotion !== "string" || missing.length > 0) {
    log.error(`Unexpected response shape — missing/invalid: ${["emotion", ...missing].join(", ")} | got keys: ${Object.keys(body ?? {}).join(", ")}`);
    return Response.json({ detail: "Analysis server returned an unexpected response." }, { status: 502 });
  }

  const result = body as PredictionResponse;
  log.info(
    `${upstream.status} in ${elapsed()} | ${result.emotion} (${Math.round(result.emotion_confidence * 100)}%) ` +
      `trust=${result.trust.toFixed(2)} confidence=${result.confidence.toFixed(2)}`
  );
  return Response.json(result, { headers: { "X-Request-ID": requestId } });
}
