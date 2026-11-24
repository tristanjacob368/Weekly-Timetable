# Weekly Timetable

A personal weekly timetable that installs on a phone home screen.

- `index.html`: the app (opens as "My Week")
- `schedule.json`: your standing week (`days`, `notes`) plus optional one-off weeks under `weeks`
- `calendar.ics`: calendar feed with alerts, built from `schedule.json` for the next 8 weeks
- `build.js`: run `node build.js` after editing `schedule.json` to rebuild `calendar.ics`

## Each week

The app works out the current week by itself, so a normal week needs no edits.
For a week that is different (work shifts, a trip), add an entry under `weeks` keyed by that Monday:

`"weeks": {"2026-11-30": {"days": {"Wed": [[17, 23, "Work", "", "work"]]}, "notes": ["Late shift Wednesday."]}}`

Days listed there replace that day of the standing week; other days stay as normal. Notes are added to the standing notes. Run `node build.js`, commit and push.

A block is `[start hour, end hour, title, detail, category, optional "HH:MM|HH:MM" label]`.
Hours run past midnight (24 is 00:00, 26 is 02:00). Categories: work, travel, gym, eat, guitar, intern, sleep, free, tent.

## Gym app

`gym/` is a separate phone app (opens as "Gym"): five-session split, weights per lift, rest timer, food and steps, progress log. It works offline and keeps its data on the phone.

- `gym/index.html`: the whole app
- `gym/sw.js`: offline copy. Change the `C` version name in it whenever the app changes, so phones pick up the update.
- `gym/gym.ics`: reminder calendar (gym, weigh-in, protein check, photo). Edit the times in it, then add it to your calendar.

Back up: Me tab, then Back up. Restore with the Restore button.
