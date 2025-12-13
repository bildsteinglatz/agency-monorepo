#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const nextDir = path.join(projectRoot, '.next');

const ROUTES = [
  {
    label: '/pdf-test',
    budgetKb: Number(process.env.BUNDLE_BUDGET_PDF_TEST_KB ?? 420),
  },
  {
    label: '/new-work',
    budgetKb: Number(process.env.BUNDLE_BUDGET_NEW_WORK_KB ?? 220),
  },
];

async function readJson(filePath) {
  const absolute = path.join(nextDir, filePath);
  const data = await fs.readFile(absolute, 'utf8');
  return JSON.parse(data);
}

async function fileSizeBytes(relativePath) {
  const absolute = path.join(nextDir, relativePath);
  const stats = await fs.stat(absolute);
  return stats.size;
}

function formatKb(bytes) {
  return Math.round((bytes / 1024) * 10) / 10;
}

async function main() {
  const appManifest = await readJson('app-build-manifest.json');
  const pathRoutes = await readJson('app-path-routes-manifest.json');

  const routeChunks = new Map();
  for (const route of ROUTES) {
    const manifestKeyEntry = Object.entries(pathRoutes).find(([, value]) => value === route.label);
    if (!manifestKeyEntry) {
      console.warn(`⚠️  Skipping ${route.label}: no manifest entry`);
      continue;
    }
    const manifestKey = manifestKeyEntry[0];
    const chunks = appManifest.pages[manifestKey];
    if (!Array.isArray(chunks) || chunks.length === 0) {
      console.warn(`⚠️  ${route.label} has no chunks listed in manifest.`);
      continue;
    }
    routeChunks.set(route.label, chunks);
  }

  if (routeChunks.size === 0) {
    throw new Error('No bundle metrics recorded. Did you run `next build` first?');
  }

  const chunkUsage = new Map();
  for (const chunks of routeChunks.values()) {
    for (const chunk of chunks) {
      chunkUsage.set(chunk, (chunkUsage.get(chunk) || 0) + 1);
    }
  }

  const chunkSizeCache = new Map();
  async function getChunkSize(chunk) {
    if (!chunkSizeCache.has(chunk)) {
      chunkSizeCache.set(chunk, await fileSizeBytes(chunk));
    }
    return chunkSizeCache.get(chunk);
  }

  const rows = [];
  let hasError = false;

  for (const route of ROUTES) {
    const chunks = routeChunks.get(route.label);
    if (!chunks) continue;
    let totalBytes = 0;
    let sharedBytes = 0;
    for (const chunk of chunks) {
      try {
        const size = await getChunkSize(chunk);
        totalBytes += size;
        if (chunkUsage.get(chunk) === routeChunks.size) {
          sharedBytes += size;
        }
      } catch (error) {
        console.warn(`⚠️  Missing chunk ${chunk} for ${route.label}:`, error.message);
      }
    }
    const uniqueBytes = Math.max(totalBytes - sharedBytes, 0);
    const uniqueKb = formatKb(uniqueBytes);
    const status = uniqueKb <= route.budgetKb ? 'ok' : 'over-budget';
    if (status !== 'ok') {
      hasError = true;
    }
    rows.push({
      route: route.label,
      chunks: chunks.length,
      uniqueKb,
      budgetKb: route.budgetKb,
      sharedKb: formatKb(sharedBytes),
      totalKb: formatKb(totalBytes),
      status,
    });
  }

  if (rows.length === 0) {
    throw new Error('No bundle metrics recorded. Did you run `next build` first?');
  }

  const output = {
    generatedAt: new Date().toISOString(),
    rows,
  };

  await fs.mkdir(path.join(projectRoot, 'docs'), { recursive: true });
  await fs.writeFile(path.join(projectRoot, 'docs', 'bundle-metrics.json'), JSON.stringify(output, null, 2));

  console.table(rows);

  if (hasError) {
    throw new Error('One or more routes exceeded their bundle budget.');
  }
}

main().catch((error) => {
  console.error('Bundle metrics failed:', error.message);
  process.exit(1);
});
