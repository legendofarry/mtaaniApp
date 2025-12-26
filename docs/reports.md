# Reports (Water & Electricity)

This document explains the V1 reports model and usage.

Collections

- `waterReports` and `electricityReports` — each report doc contains:
  - `userId` — reporter uid
  - `reporterName` — optional
  - `location` — full location object (latitude, longitude, county, placeName, etc.)
  - `status` — e.g. OFF, LOW, OK, OTHER
  - `meta` — optional
  - `createdAt` — ISO timestamp
  - `expiresAt` — ISO timestamp (createdAt + 24hrs)
  - `resource` — `water` or `electricity`

Behavior

- Users cannot report the same resource + same `status` more than once within 20 minutes (per-user). Attempt will return a duplicate error.
- Reports expire after 24 hours (set via `expiresAt`). Configure Firestore TTL policy on `expiresAt` to auto-delete if desired.
- When a report is submitted a `notifications` doc is also written with basic fields so existing UI can surface it.

APIs (client-side service)

- `createReport({resource, status, userId, reporterName, location, meta})` — validates & writes a report.
- `fetchNearbyReports({resource, center, radiusKm})` — returns recent reports within radius (default 5km).
- `aggregateStatus({resource, center, radiusKm})` — returns counts per status and `finalized` status (most reports; tie -> most recent)

Implementation notes

- V1 uses client-side filtering for proximity (bounding + haversine) to avoid external libs.
- `createdAt` and `expiresAt` are ISO strings for simplicity; times are compared using Date parsing.

How to test manually (without UI):

- Use `scripts/insertResourceReport.mjs` with a Firebase service account.
  FIREBASE_SERVICE_ACCOUNT=./serviceAccount.json node scripts/insertResourceReport.mjs --resource=water --status=OFF --uid=testA --lat=-1.23 --lng=36.89 --county=Nairobi --name="Test A"
- Then run code that calls `aggregateStatus` or visit UI area that will call `fetchNearbyReports`.
