// src/services/sms.service.js
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";

/**
 * Very small SMS parser to extract numeric tokens, amounts and date-like strings.
 * Not perfect — tailor to your provider's SMS format for production.
 */
export const parseSMS = (text = "") => {
  const raw = (text || "").toString();

  // KPLC format
  // Sample:
  // Mtr:22214069456
  // Token:5140-8662-1430-0580-3155
  // Date:20251221 22:01
  // Units:5.1
  // Amt:100.00
  // TknAmt:61.13
  // OtherCharges:38.87

  const result = { raw };

  const meterMatch = raw.match(/Mtr\s*[:\-]?\s*(\d{6,})/i);
  result.meter = meterMatch ? meterMatch[1] : null;

  const tokenMatch = raw.match(/Token\s*[:\-]?\s*([0-9\-]+)/i);
  result.token = tokenMatch ? tokenMatch[1].replace(/\s+/g, "") : null;

  const dateMatch = raw.match(
    /Date\s*[:\-]?\s*(\d{4})(\d{2})(\d{2})(?:\s*(\d{1,2}):(\d{2}))?/i
  );
  if (dateMatch) {
    const [, y, m, d, hh = "00", mm = "00"] = dateMatch;
    try {
      const iso = new Date(
        `${y}-${m}-${d}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`
      ).toISOString();
      result.date = iso;
    } catch (e) {
      result.date = `${y}-${m}-${d} ${hh}:${mm}`;
    }
  } else {
    // fallback: look for other date forms
    const isoMatch = raw.match(/(\d{4}-\d{2}-\d{2})/);
    result.date = isoMatch ? isoMatch[1] : null;
  }

  const unitsMatch = raw.match(/Units\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)/i);
  result.units = unitsMatch ? parseFloat(unitsMatch[1]) : null;

  const amtMatch = raw.match(/Amt\s*[:\-]?\s*([0-9,]+(?:\.[0-9]+)?)/i);
  result.amt = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, "")) : null;

  const tknAmtMatch = raw.match(/TknAmt\s*[:\-]?\s*([0-9,]+(?:\.[0-9]+)?)/i);
  result.tknAmount = tknAmtMatch
    ? parseFloat(tknAmtMatch[1].replace(/,/g, ""))
    : null;

  const otherMatch = raw.match(
    /OtherCharges\s*[:\-]?\s*([0-9,]+(?:\.[0-9]+)?)/i
  );
  result.otherCharges = otherMatch
    ? parseFloat(otherMatch[1].replace(/,/g, ""))
    : null;

  // Also keep token groups as array for convenience
  if (result.token) {
    result.tokenGroups = result.token.split(/[-\s]+/).filter(Boolean);
  } else {
    result.tokenGroups = [];
  }

  return result;
};

/**
 * Save parsed token purchase to Firestore
 */
export const saveTokenPurchase = async (uid, parsed) => {
  try {
    const col = collection(db, "token_purchases");
    const docRef = await addDoc(col, {
      uid,
      parsed,
      createdAt: new Date().toISOString(),
      raw: parsed.raw,
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.warn("saveTokenPurchase failed", err);
    // Fallback: if permission denied, save locally so the user doesn't lose data
    const msg = err?.message || String(err);
    if (
      msg.toLowerCase().includes("missing or insufficient permissions") ||
      msg.toLowerCase().includes("permission-denied")
    ) {
      try {
        const key = "token_purchases_offline";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const offline = {
          uid,
          parsed,
          raw: parsed.raw,
          createdAt: new Date().toISOString(),
        };
        existing.push(offline);
        localStorage.setItem(key, JSON.stringify(existing));
        return { success: true, offline: true };
      } catch (e) {
        console.warn("Failed to save offline purchase", e);
        return { success: false, error: msg };
      }
    }
    return { success: false, error: msg };
  }
};

export default { parseSMS, saveTokenPurchase };
