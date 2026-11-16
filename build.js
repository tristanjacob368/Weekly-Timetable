// Builds calendar.ics (the calendar feed) from schedule.json.
// Usage: node build.js
const fs = require("fs");
const path = require("path");
const s = JSON.parse(fs.readFileSync(path.join(__dirname, "schedule.json"), "utf8"));
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const p2 = (n) => String(n).padStart(2, "0");

function stamp(dayIndex, h) {
  const [y, m, d] = s.monday.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + dayIndex));
  const hr = Math.floor(h);
  const mi = Math.round((h - hr) * 60);
  return `${dt.getUTCFullYear()}${p2(dt.getUTCMonth() + 1)}${p2(dt.getUTCDate())}T${p2(hr)}${p2(mi)}00`;
}
const hm = (t) => { const [a, b] = t.split(":").map(Number); return a + b / 60; };
const now = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");

const L = [
  "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//My Week//EN", "CALSCALE:GREGORIAN",
  "X-WR-CALNAME:My week", "X-WR-TIMEZONE:Europe/London",
  "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H",
];

DAYS.forEach((d, i) => {
  (s.days[d] || []).forEach((b) => {
    if (b[4] === "free" || b[4] === "sleep") return;
    let sh = b[0], eh = b[1];
    if (b[5]) { const [a, z] = b[5].split("|"); sh = hm(a); eh = hm(z); }
    const title = b[2] + (b[4] === "tent" ? " (optional)" : "");
    L.push("BEGIN:VEVENT", `UID:myweek-${s.monday}-${d}-${b[0]}-${b[4]}@weekly-timetable`,
      `DTSTAMP:${now}`, `DTSTART:${stamp(i, sh)}`, `DTEND:${stamp(i, eh)}`, `SUMMARY:${title}`);
    if (b[3]) L.push(`DESCRIPTION:${b[3]}`);
    L.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${title} in 10 min`, "TRIGGER:-PT10M", "END:VALARM");
    if (b[4] === "intern") L.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Internship in 1 hour", "TRIGGER:-PT60M", "END:VALARM");
    L.push("END:VEVENT");
  });
});
L.push("END:VCALENDAR");
fs.writeFileSync(path.join(__dirname, "calendar.ics"), L.join("\r\n") + "\r\n");
console.log("calendar.ics written:", L.filter((x) => x === "BEGIN:VEVENT").length, "events");
