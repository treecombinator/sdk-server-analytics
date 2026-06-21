import type { Analytics, AnalyticsEvent } from "../port";

/** Wraps a Cloudflare Workers Analytics Engine binding. */
export interface CloudflareAnalyticsConfig {
  dataset: AnalyticsEngineDataset;
}

export function createCloudflareAnalytics(config: CloudflareAnalyticsConfig): Analytics {
  return {
    track(event: AnalyticsEvent) {
      const blobs: string[] = [event.name];
      const doubles: number[] = [];
      if (event.props) {
        for (const [key, value] of Object.entries(event.props)) {
          if (typeof value === "number") doubles.push(value);
          else blobs.push(`${key}=${value}`);
        }
      }
      config.dataset.writeDataPoint({
        blobs,
        doubles,
        indexes: event.index ? [event.index] : [],
      });
    },
  };
}
