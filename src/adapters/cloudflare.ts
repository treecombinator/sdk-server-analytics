import type { Analytics, AnalyticsEvent } from "../port";

/** Wraps a Cloudflare Workers Analytics Engine binding. */
export interface CloudflareAnalyticsConfig {
  dataset: AnalyticsEngineDataset;
}

/** Analytics Engine caps: 20 blobs, 20 doubles, ~5KB of blob data, index ≤ 96 bytes. Cap instead of throwing. */
const MAX_BLOBS = 20;
const MAX_DOUBLES = 20;
const MAX_BLOB_BYTES = 5120;
const MAX_INDEX_BYTES = 96;

const encoder = new TextEncoder();

function truncateBytes(value: string, maxBytes: number): string {
  let out = value;
  while (encoder.encode(out).length > maxBytes) out = out.slice(0, -1);
  return out;
}

function capBlobs(blobs: string[]): string[] {
  const out: string[] = [];
  let budget = MAX_BLOB_BYTES;
  for (const blob of blobs.slice(0, MAX_BLOBS)) {
    const trimmed = truncateBytes(blob, budget);
    if (!trimmed) break;
    out.push(trimmed);
    budget -= encoder.encode(trimmed).length;
  }
  return out;
}

export function createCloudflareAnalytics(config: CloudflareAnalyticsConfig): Analytics {
  return {
    track(event: AnalyticsEvent) {
      const blobs: string[] = [event.name];
      const doubles: number[] = [];
      if (event.props) {
        // Doubles are positional in Analytics Engine: iterate keys sorted so the same event
        // shape always lands numbers in the same columns, and record which key each column is.
        const doubleKeys: string[] = [];
        for (const key of Object.keys(event.props).sort()) {
          const value = event.props[key]!;
          if (typeof value === "number") {
            doubleKeys.push(key);
            doubles.push(value);
          } else {
            blobs.push(`${key}=${value}`);
          }
        }
        if (doubleKeys.length > 0) blobs.push(`doubles=${doubleKeys.join(",")}`);
      }
      config.dataset.writeDataPoint({
        blobs: capBlobs(blobs),
        doubles: doubles.slice(0, MAX_DOUBLES),
        indexes: event.index ? [truncateBytes(event.index, MAX_INDEX_BYTES)] : [],
      });
    },
  };
}
