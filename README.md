# @treecombinator/sdk-server-analytics

---

> Developed by Danthur Lice.\
> Copyright © 2026 Tree Combinator.\
> Contact: dev (at) treecombinator.com

---

The **analytics** domain of the Tree Combinator SDK — a thin, typed writer over the Cloudflare Workers Analytics Engine. It records product events (`name`, `props`, `index`) with zero runtime dependencies, declaring its dataset binding structurally.

## Install

```bash
npm install github:treecombinator/sdk-server-analytics
```

## Use

```ts
import { createAnalytics } from "@treecombinator/sdk-server-analytics";

const analytics = createAnalytics({ dataset: env.ANALYTICS });

analytics.track({ name: "signup", props: { plan: "pro" } });
analytics.track({ name: "purchase", props: { sku: "book-01", amount: 49.9 }, index: userId });
```

`createAnalytics({ dataset })` returns an `Analytics` instance:

- `track(event)` — record an event. Fire-and-forget: it writes a data point synchronously and returns `void`, no `await` needed.

An `AnalyticsEvent` is `{ name, props?, index? }`:

- `name` — the event name, e.g. `"signup"`, `"purchase"`.
- `props` — arbitrary properties. Each entry is split by value type: numbers become metrics (Analytics Engine `doubles`), everything else becomes a `key=value` label (`blobs`).
- `index` — an optional index for fast filtering at query time (e.g. the user or club id).

## Notes

- The dataset binding is declared structurally via `@cloudflare/workers-types` (`AnalyticsEngineDataset`) — pass the Workers Analytics Engine binding from your environment.
- `track` is fire-and-forget and never throws; there is no provider to configure beyond the dataset.
