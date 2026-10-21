# Contributing

Help keep the catalog accurate.

## Ground rules

- One entry per game, keyed by a stable lowercase `id` (used in public URLs).
- Only public facts: `id`, `name`, `category`, `family`, `steamAppId`, `defaultPort`.
  No pricing, infrastructure details, or internal identifiers.
- `games.json` must stay valid against `schema.json`.

## Validate locally

```bash
node test/validate.mjs
```

CI runs the same check on every PR.

## Adding a game

Append an object, keep the file sorted sensibly, run the validator, open a PR.
