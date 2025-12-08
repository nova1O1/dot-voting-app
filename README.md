# Dot Poll – Vercel Blob Version

This project is a minimal dot-voting app with:

- Public voting page (\`index.html\`)
- Admin page (\`admin.html\`) to add/remove contestants and see total votes
- Serverless API using Vercel Blob for persistent storage
- One-vote-per-IP enforcement (IP is hashed with a salt)

## Files

- \`index.html\` – public voting UI (no framework)
- \`admin.html\` – admin UI (no framework)
- \`api/_state.js\` – shared helpers for loading/saving state to Vercel Blob
- \`api/state.js\` – GET endpoint to fetch contestants + totals
- \`api/vote.js\` – POST endpoint to submit votes, enforce 5 total / 3 per contestant and 1 IP
- \`api/admin-contestants.js\` – POST/DELETE to add/remove contestants
- \`package.json\` – Node/ESM project config

## Environment variables

In your Vercel project, configure:

- \`BLOB_READ_WRITE_TOKEN\` – created from Vercel Blob storage
- \`IP_HASH_SALT\` – any random string you choose (used to hash IP addresses)

## Deploy

1. Upload this folder to a Git repo.
2. Create a Vercel project from that repo.
3. Set the environment variables.
4. Open:

- \`/\` -> voting page
- \`/admin.html\` -> admin page
