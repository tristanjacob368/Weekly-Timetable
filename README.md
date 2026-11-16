# Weekly Timetable

A personal weekly timetable that installs on a phone home screen.

- `index.html`: the app (opens as "My Week")
- `schedule.json`: this week's blocks, hints and notes. This is the only file that changes each week.
- `calendar.ics`: calendar feed with alerts, built from `schedule.json`
- `build.js`: run `node build.js` after editing `schedule.json` to rebuild `calendar.ics`

## Each week

1. Edit `schedule.json`: set `monday` and `label`, then change the blocks.
2. Run `node build.js`.
3. Commit and push. The app and the calendar feed update on their own.

A block is `[start hour, end hour, title, detail, category, optional "HH:MM|HH:MM" label]`.
Hours run past midnight (24 is 00:00, 26 is 02:00). Categories: work, travel, gym, eat, guitar, intern, sleep, free, tent.

## Gym app

`gym/` is a separate phone app (opens as "Gym"): five-session split, weights per lift, rest timer, food and steps, progress log. It works offline and keeps its data on the phone.

- `gym/index.html`: the whole app
- `gym/sw.js`: offline copy. Change the `C` version name in it whenever the app changes, so phones pick up the update.
- `gym/gym.ics`: reminder calendar (gym, weigh-in, protein check, photo). Edit the times in it, then add it to your calendar.

Back up: Me tab, then Back up. Restore with the Restore button.
