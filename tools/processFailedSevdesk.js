#!/usr/bin/env node
const fetch = require('node-fetch');
const token = process.env.SEVDESK_ADMIN_TOKEN;
if (!token) {
  console.error('Please set SEVDESK_ADMIN_TOKEN in environment');
  process.exit(1);
}
const API = process.env.SEVDESK_ADMIN_URL || 'http://localhost:3000/api/admin/sevdesk/reprocess';

(async () => {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify({ limit: 20 }),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
