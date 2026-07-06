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
- `props` — arbitrary properties. Each entry is split by value type: numbers become metrics (Analytics Engine `doubles`), everything else becomes a `key=value` label (`blobs`). Keys are iterated sorted, so the same event shape always lands numbers in the same double columns, and a `doubles=<key,key,...>` blob records which key each column holds.
- `index` — an optional index for fast filtering at query time (e.g. the user or tenant id).

## Notes

- The dataset binding is declared structurally via `@cloudflare/workers-types` (`AnalyticsEngineDataset`) — pass the Workers Analytics Engine binding from your environment.
- `track` is fire-and-forget and never throws; Analytics Engine's per-point limits (20 blobs, 20 doubles, ~5KB of blob data, 96-byte index) are enforced by capping/truncating the write instead of erroring.
