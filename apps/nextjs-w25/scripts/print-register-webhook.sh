#!/usr/bin/env bash
cat <<'EOF'
# Replace <PROJECT_ID> and <TOKEN> and <URL> before running.
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  "https://api.sanity.io/v2021-06-07/projects/<PROJECT_ID>/hooks" \
  -d '{
    "name": "dominant-color-extract",
    "dataset": "production",
    "url": "<URL>/api/dominant-color",
    "includeBody": true,
    "trigger": {
      "onCreate": ["artwork"],
      "onPublish": ["artwork"]
    }
  }'
EOF

echo "This prints a curl command to register a webhook. Replace placeholders before running."
