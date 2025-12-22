#!/usr/bin/env node
const { downloadAndExtract } = require('../apps/next-h5/src/lib/vmobilGtfs');

(async () => {
  try {
    const url = process.env.VMOBIL_GTFS_URL || 'https://data.opentransportdata.swiss/en/dataset/timetable-2025-gtfs2020/permalink';
    // Note: the lib uses global fetch - Node 18+ has it
    const res = await downloadAndExtract(url);
    console.log('Done', res);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
