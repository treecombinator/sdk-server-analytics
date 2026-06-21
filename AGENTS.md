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

- `props` split by value type: numbers → metrics (`doubles`), other values → `key=value` labels (`blobs`). `index` → fast query-time filtering.
- `track` is fire-and-forget and never throws. Zero runtime dependencies; the dataset binding is declared structurally via `@cloudflare/workers-types`.
