# AGENTS.md — @treecombinator/sdk-server-analytics

> Guide for AI agents. Analytics domain of the Tree Combinator SDK for Cloudflare Workers.
> One factory; pass the Analytics Engine dataset binding via config.

## Use

```ts
import { createAnalytics } from "@treecombinator/sdk-server-analytics";
const analytics = createAnalytics({ dataset: env.ANALYTICS });
analytics.track({ name: "signup", props: { plan: "pro" } });
```

`createAnalytics({ dataset })` → `track({ name, props?, index? })`. Adapter: Workers Analytics Engine.

## Notes

- `props` is `Record<string, string | number>`: numbers → metrics (`doubles`, in sorted-key order + a `doubles=<keys>` blob right after the name naming exactly the columns written), strings → `key=value` labels (`blobs`). `index` → fast query-time filtering.
- `track` is fire-and-forget — Analytics Engine limits (20 blobs / 20 doubles / ~5KB blob data / 96-byte index) are capped, not thrown; a missing or wrong dataset binding still throws from `writeDataPoint`. Zero runtime dependencies; the dataset binding is declared structurally via `@cloudflare/workers-types`.
