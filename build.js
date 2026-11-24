// Builds calendar.ics (the calendar feed) from schedule.json.
// Usage: node build.js
const fs = require("fs");
const path = require("path");
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "schedule.json"), "utf8"));
const WEEKS = 8; // how many weeks ahead the calendar feed covers
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const p2 = (n) => String(n).padStart(2, "0");

const ymd = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
function mondayOf(offset) {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7) + offset * 7);
}
let s = null; // the week currently being written
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

// Alerts per category: [minutes before start, message]. Edit freely, then run: node build.js
// Assumes ~45 min journeys; change the numbers if yours differ.
const ALERTS = {
  work: [[135, "Start getting ready for work"], [105, "Be ready: shoes, keys, phone, wallet, charger, food"],
         [75, "LEAVE NOW for work (about 45 min journey)"], [10, "Work in 10 min"]],
  // Tuesday: wake 07:30, leave 08:20 for a 09:20 start (45 min journey + 15 min spare)
  intern: [[110, "Wake up (7:30). Get out of bed now"], [95, "Shower now"], [75, "Get dressed, eat breakfast"],
           [65, "Final check: keys, phone, wallet, charger, lunch, Oyster/card"], [60, "LEAVE NOW for the internship (45 min journey)"],
           [10, "Internship in 10 min"]],
  gym: [[60, "Gym at 12: eat something and fill your water bottle"], [30, "Pack gym bag: headphones, towel, phone, charger"],
        [10, "Leave for the gym now. Open your gym app"]],
  guitar: [[10, "Guitar in 10 min: 45 min, even 30 is fine"]],
  eat: [[10, "{t} in 10 min"]],
  tent: [[30, "{t}: optional gym bonus, only if you have energy"]],
};

for (let w = 0; w < WEEKS; w++) {
  const monday = ymd(mondayOf(w)), wk = (raw.weeks || {})[monday] || {};
  s = { monday, days: Object.fromEntries(DAYS.map((d) => [d, (wk.days && wk.days[d]) || (raw.days || {})[d] || []])) };
DAYS.forEach((d, i) => {
  (s.days[d] || []).forEach((b) => {
    if (b[4] === "free" || b[4] === "sleep") return;
    let sh = b[0], eh = b[1];
    if (b[5]) { const [a, z] = b[5].split("|"); sh = hm(a); eh = hm(z); }
    const title = b[2] + (b[4] === "tent" ? " (optional)" : "");
    L.push("BEGIN:VEVENT", `UID:myweek-${s.monday}-${d}-${b[0]}-${b[4]}@weekly-timetable`,
      `DTSTAMP:${now}`, `DTSTART:${stamp(i, sh)}`, `DTEND:${stamp(i, eh)}`, `SUMMARY:${title}`);
    if (b[3]) L.push(`DESCRIPTION:${b[3]}`);
    (ALERTS[b[4]] || [[10, "{t} in 10 min"]]).forEach(([min, msg]) =>
      L.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${msg.replace("{t}", title)}`, `TRIGGER:-PT${min}M`, "END:VALARM"));
    L.push("END:VEVENT");
  });
});
}
L.push("END:VCALENDAR");
fs.writeFileSync(path.join(__dirname, "calendar.ics"), L.join("\r\n") + "\r\n");
console.log("calendar.ics written:", L.filter((x) => x === "BEGIN:VEVENT").length, "events");
