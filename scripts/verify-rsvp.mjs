import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

const baseIndex = process.argv.indexOf("--base");
const base = new URL(baseIndex >= 0 ? process.argv[baseIndex + 1] : "http://127.0.0.1:5173");
if (base.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname)) throw new Error("This verification only runs against a local HTTP preview.");
const origin = base.origin;
const variables = await readFile(new URL("../.dev.vars", import.meta.url), "utf8");
const rawKey = variables.match(/^\s*ADMIN_KEY\s*=\s*(.+)\s*$/m)?.[1]?.trim();
if (!rawKey) throw new Error("The ignored local .dev.vars must configure ADMIN_KEY.");
const password = rawKey.startsWith('"') ? JSON.parse(rawKey) : rawKey.startsWith("'") ? rawKey.slice(1, -1) : rawKey;
let cookie = "";
let checks = 0;
const token = randomBytes(32).toString("hex");
const testName = `=RSVP_TEST_${randomBytes(8).toString("hex")}`;
const actualSettings = { eventDate: "2026-10-31", ceremonyTime: "", receptionTime: "", venueName: "Casa de los Padrinos", address: "", mapsUrl: "https://www.google.com/maps?q=19.291965,-98.853241", giftRegistryName: "", giftRegistryUrl: "" };

async function call(path, { method = "GET", data, authenticated = true, headers = {}, body } = {}) {
  const requestHeaders = { ...(authenticated && cookie ? { Cookie: cookie } : {}), ...headers };
  if (method !== "GET") requestHeaders.Origin ??= origin;
  if (data !== undefined) { requestHeaders["Content-Type"] = "application/json"; body = JSON.stringify(data); }
  return fetch(new URL(path, base), { method, headers: requestHeaders, body });
}
async function expectStatus(response, expected, description) {
  assert.equal(response.status, expected, description);
  checks++;
  return response;
}
async function guestRows() {
  const response = await expectStatus(await call("/api/admin/guests"), 200, "Authorized guest list");
  return (await response.json()).guests;
}
async function expectTestGuest(attendance, people) {
  const rows = (await guestRows()).filter(row => row.name === testName);
  assert.equal(rows.length, 1, "One RSVP survives token upserts");
  assert.equal(rows[0].attendance, attendance);
  assert.equal(rows[0].guests, people);
  checks += 3;
}
try {
  await expectStatus(await call("/api/admin/guests", { authenticated: false }), 401, "Guest list requires login");
  await expectStatus(await call("/api/admin/export", { authenticated: false }), 401, "CSV export requires login");
  await expectStatus(await call("/api/admin/settings", { authenticated: false }), 401, "Private settings require login");
  const login = await expectStatus(await call("/api/admin/login", { method: "POST", data: { password }, authenticated: false }), 200, "Admin login");
  const setCookie = login.headers.get("set-cookie") || "";
  assert.ok(setCookie.includes("HttpOnly") && setCookie.includes("SameSite=Strict"), "Cookie includes private session protections");
  cookie = setCookie.split(";")[0];
  assert.ok(cookie, "Admin session cookie exists"); checks += 2;

  const initial = await (await expectStatus(await call("/api/settings", { authenticated: false }), 200, "Public settings")).json();
  assert.equal(initial.audioUrl, "", "Audio smoke test requires no existing local audio"); checks++;
  const saved = await (await expectStatus(await call("/api/admin/settings", { method: "PUT", data: actualSettings }), 200, "Save actual wedding settings")).json();
  for (const [key, value] of Object.entries(actualSettings)) { assert.equal(saved[key], value, `Saved ${key}`); checks++; }
  await expectStatus(await call("/api/admin/settings", { method: "PUT", data: { ...actualSettings, eventDate: "2026-02-29" } }), 400, "Invalid calendar date is rejected");
  await expectStatus(await call("/api/admin/settings", { method: "PUT", data: actualSettings, headers: { Origin: "https://other.example" } }), 403, "Cross-origin mutations are rejected");
  await expectStatus(await call("/api/rsvp", { method: "POST", authenticated: false, data: { name: testName, attendance: "yes", guests: 9, notes: "", token } }), 400, "Invalid party size is rejected");
  await expectStatus(await call("/api/rsvp", { method: "POST", authenticated: false, data: { name: testName, attendance: "yes", guests: 3, notes: "=2+2", token } }), 200, "Create RSVP");
  await expectTestGuest("yes", 3);
  await expectStatus(await call("/api/rsvp", { method: "POST", authenticated: false, data: { name: testName, attendance: "yes", guests: 2, notes: "=2+2", token } }), 200, "Update RSVP using same token");
  await expectTestGuest("yes", 2);
  await expectStatus(await call("/api/rsvp", { method: "POST", authenticated: false, data: { name: testName, attendance: "no", guests: 8, notes: "=2+2", token } }), 200, "Declined RSVP coerces party to zero");
  await expectTestGuest("no", 0);

  const csv = await (await expectStatus(await call("/api/admin/export"), 200, "Download protected CSV")).text();
  assert.ok(csv.includes(`"'${testName}"`), "CSV escapes a formula in the name");
  assert.ok(csv.includes('"\'=2+2"'), "CSV escapes a formula in the notes");
  assert.ok(csv.includes('"No asistirá","0"'), "CSV contains final attendance and guest count"); checks += 3;

  await expectStatus(await call("/api/admin/audio", { method: "POST", body: new FormData() }), 503, "Custom audio upload remains disabled without R2");
  await expectStatus(await call("/api/audio", { authenticated: false }), 404, "No uploaded audio is exposed without R2");
} finally {
  if (cookie) {
    const rows = (await guestRows()).filter(row => row.name === testName);
    for (const row of rows) await expectStatus(await call("/api/admin/guests", { method: "DELETE", data: { id: row.id } }), 200, "Clean up owned test RSVP");
    const remaining = (await guestRows()).filter(row => row.name === testName);
    assert.equal(remaining.length, 0, "No test RSVPs remain"); checks++;
  }
}
console.log(`PASS: ${checks} local API integration checks. Test RSVPs removed; actual wedding settings preserved.`);
