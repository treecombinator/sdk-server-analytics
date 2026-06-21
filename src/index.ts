import type { Analytics } from "./port";
import { createCloudflareAnalytics, type CloudflareAnalyticsConfig } from "./adapters/cloudflare";

export type { Analytics, AnalyticsEvent } from "./port";
export type { CloudflareAnalyticsConfig } from "./adapters/cloudflare";

/** Analytics domain factory. Primary adapter: Cloudflare Analytics Engine. */
export function createAnalytics(config: CloudflareAnalyticsConfig): Analytics {
  return createCloudflareAnalytics(config);
}
