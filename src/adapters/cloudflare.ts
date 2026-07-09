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

/**
 * Caps the write to the Analytics Engine blob limits. The doubles mapping is only meaningful
 * whole — a cut key would claim the wrong column — so it goes right after the name and is
 * included in full or not at all; labels then fill whatever count and byte budget remain.
 */
function capBlobs(name: string, mapping: string | undefined, labels: string[]): string[] {
  let budget = MAX_BLOB_BYTES;
  const cappedName = truncateBytes(name, budget);
  budget -= encoder.encode(cappedName).length;
  const out: string[] = [cappedName];
  if (mapping !== undefined) {
    const size = encoder.encode(mapping).length;
    if (size <= budget) {
      out.push(mapping);
      budget -= size;
    }
  }
  for (const label of labels) {
    if (out.length >= MAX_BLOBS) break;
    const trimmed = truncateBytes(label, budget);
    if (!trimmed) break;
    out.push(trimmed);
    budget -= encoder.encode(trimmed).length;
  }
  return out;
}

export function createCloudflareAnalytics(config: CloudflareAnalyticsConfig): Analytics {
  return {
    track(event: AnalyticsEvent) {
      const labels: string[] = [];
      const doubles: number[] = [];
      const doubleKeys: string[] = [];
      if (event.props) {
        // Doubles are positional in Analytics Engine: iterate keys sorted so the same event
        // shape always lands numbers in the same columns, and record which key each column is.
        // Numeric props beyond the doubles cap are dropped, so the mapping names exactly the
        // columns written.
        for (const key of Object.keys(event.props).sort()) {
          const value = event.props[key]!;
          if (typeof value === "number") {
            if (doubles.length < MAX_DOUBLES) {
              doubleKeys.push(key);
              doubles.push(value);
            }
          } else {
            labels.push(`${key}=${value}`);
          }
        }
      }
      const mapping = doubleKeys.length > 0 ? `doubles=${doubleKeys.join(",")}` : undefined;
      config.dataset.writeDataPoint({
        blobs: capBlobs(event.name, mapping, labels),
        doubles,
        indexes: event.index ? [truncateBytes(event.index, MAX_INDEX_BYTES)] : [],
      });
    },
  };
}
