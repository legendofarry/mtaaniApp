#!/usr/bin/env node
// scripts/insertResourceReport.mjs
// Usage:
// FIREBASE_SERVICE_ACCOUNT=./serviceAccount.json node scripts/insertResourceReport.mjs --resource=water --status=OFF --uid=user123 --lat=... --lng=... --county=Name --name="Test User"

import fs from "fs";
import admin from "firebase-admin";

const args = process.argv.slice(2);
const opts = {};
args.forEach((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  if (m) opts[m[1]] = m[2];
});

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error(
    "Set FIREBASE_SERVICE_ACCOUNT to service account JSON path or JSON string"
  );
  process.exit(1);
}

let serviceAccount;
try {
  const p = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (fs.existsSync(p)) serviceAccount = JSON.parse(fs.readFileSync(p, "utf8"));
  else serviceAccount = JSON.parse(p);
} catch (e) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e.message || e);
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const resource = (opts.resource || "water").toLowerCase();
if (!["water", "electricity"].includes(resource)) {
  console.error("resource must be water or electricity");
  process.exit(1);
}
if (!opts.status || !opts.uid || !opts.lat || !opts.lng) {
  console.error(
    'Usage: --resource=water --status=OFF --uid=user123 --lat=... --lng=... --county=Name --name="Test"'
  );
  process.exit(1);
}

(async () => {
  try {
    const col = resource === "water" ? "waterReports" : "electricityReports";
    const now = new Date();
    const doc = {
      userId: opts.uid,
      reporterName: opts.name || null,
      location: {
        latitude: opts.lat,
        longitude: opts.lng,
        county: opts.county || null,
      },
      status: opts.status,
      meta: {},
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      resource,
    };
    const ref = await db.collection(col).add(doc);
    console.log("Inserted report:", ref.id);
    // add notifications doc
    await db.collection("notifications").add({
      title: `${resource} report: ${opts.status}`,
      message: opts.name
        ? `${opts.name} reported ${opts.status}`
        : `Report: ${opts.status}`,
      reporterUid: opts.uid,
      targetCounty: opts.county || null,
      resource,
      createdAt: doc.createdAt,
    });
    console.log("Also created notifications doc");
    process.exit(0);
  } catch (e) {
    console.error("Insert failed", e.message || e);
    process.exit(1);
  }
})();
