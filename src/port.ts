/**
 * The PORT of the analytics domain (product events). The app calls `track`;
 * the sink lives in adapters/. Primary adapter: Cloudflare Workers Analytics Engine.
 */
export interface AnalyticsEvent {
  /** Event name, e.g. "signup", "purchase". */
  name: string;
  /** Arbitrary props: strings become labels, numbers become metrics. */
  props?: Record<string, string | number>;
  /** Optional index for fast filtering at query time (e.g. the user/tenant id). */
  index?: string;
}

export interface Analytics {
  /** Record an event. Fire-and-forget (no await needed). */
  track(event: AnalyticsEvent): void;
}
