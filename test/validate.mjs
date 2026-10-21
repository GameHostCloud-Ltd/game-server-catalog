#!/usr/bin/env node
/**
 * Validates games.json against the catalog contract — no external deps,
 * so it runs anywhere Node 18+ does (CI, clones, scripts).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const games = JSON.parse(readFileSync(join(root, 'games.json'), 'utf8'));

const CATEGORIES = new Set(['game-server', 'mod-service', 'bot-hosting', 'non-standard-service']);
const errors = [];
const ids = new Set();

games.forEach((g, i) => {
  const where = `games[${i}] (${g?.id ?? '?'})`;
  for (const key of Object.keys(g)) {
    if (!['id', 'name', 'category', 'family', 'steamAppId', 'defaultPort'].includes(key)) {
      errors.push(`${where}: unexpected field "${key}"`);
    }
  }
  if (typeof g.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(g.id)) {
    errors.push(`${where}: bad id ${JSON.stringify(g.id)}`);
  } else if (ids.has(g.id)) {
    errors.push(`${where}: duplicate id "${g.id}"`);
  } else {
    ids.add(g.id);
  }
  if (typeof g.name !== 'string' || !g.name.trim()) errors.push(`${where}: empty name`);
  if (!CATEGORIES.has(g.category)) errors.push(`${where}: bad category "${g.category}"`);
  if (typeof g.family !== 'string' || !g.family.trim()) errors.push(`${where}: empty family`);
  if (g.steamAppId !== null && (!Number.isInteger(g.steamAppId) || g.steamAppId < 1)) {
    errors.push(`${where}: bad steamAppId ${g.steamAppId}`);
  }
  if (g.defaultPort !== null && (!Number.isInteger(g.defaultPort) || g.defaultPort < 0 || g.defaultPort > 65535)) {
    errors.push(`${where}: bad defaultPort ${g.defaultPort}`);
  }
});

if (games.length < 50) errors.push(`catalog shrank unexpectedly: ${games.length} games`);

if (errors.length) {
  console.error(`games.json: ${errors.length} problem(s)`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`games.json OK — ${games.length} entries, ${ids.size} unique ids`);
