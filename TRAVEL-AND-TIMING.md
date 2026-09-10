# Travel, timing and Crown

Travel Plans keeps the original phone layout and replaces its blank list with 201 seed destinations from Australian World Travel and the Visa & Activity Atlas. You can add any additional island, territory, disputed region or other destination. The initial goal is 256 places over 10 years; both numbers and the start date can be changed. The number is a personal planning target, not a claim about how many countries exist.

Record places as Visited, Want to go or Planned. Repeated visits to the same named destination count once towards the visited total. Use the seed names consistently; alternative names for the same place are not automatically merged. Dates, seasonal region, preferred conditions, purpose and personal astrology notes are editable. Trip tables and goals are saved in the normal Aura project backup and can be allocated to facets or stacks.

QuickStart's ninth card collects travel history, travel wishes and the travel goal. The same card retains access to all the other dataset tables. Travel Plans links to the original World Travel route planner and logistics tracker, the Visa & Activity Atlas, and the Travel Oracle builders. Their distinct planning tools remain separate.

## Crown owns celestial tools

The Crown star icon opens the working celestial clock. The old landscape star-map URL redirects to this tool. Its back button returns to Crown. Timing and Signals provides a cross-link and the source dates; it is not the celestial tool's parent.

The clock reads dates from trips, birthdays, life events, schedules, counters and ceremonies. It calculates the eight major planets and Earth's Moon, Sun longitude, Moon phase and Greenwich apparent sidereal time using locally bundled [Astronomy Engine 2.1.19](https://github.com/cosinekitty/astronomy). Its MIT licence is retained in the library.

The solar-system map uses calculated heliocentric coordinates, projected onto the fixed J2000 ecliptic plane as viewed from the north. The compact view compresses radial distances logarithmically; the whole-system and inner-planet scale views retain projected distance ratios. Planet markers and the Moon's separation from Earth are enlarged for visibility. Choose Earth, Moon and rotation for the close view. These are interactive diagrams, not photographs or a live satellite feed. Orbit paths sample a mean orbital period around the displayed year; current planet positions are recalculated for every selected time. Planet sizes are not to scale.

Tropical zodiac signs are derived from the Sun's ecliptic longitude. Seasonal labels use astronomical quarters and the chosen hemisphere; local wet/dry seasons and weather still require local context.

Use Play and the speed selector to animate time, choose a date directly, or jump to the next new or full Moon. Source dates are initially shown at noon UTC; source time-of-day and local time zones are not inferred. Applying a date to a selected trip updates its departure date, which appears in its timeline. It does not create a notification or book anything.

## Preparing context for an AI

Timing and Signals can assemble selected tables into a context pack with their original fields, instructions, notes and facet references. Dated trips include calculated celestial positions at noon UTC. Undated intentions remain available. Birthdays and schedules retain historical starting dates so recurrence information is not discarded.

The user reviews the pack, then copies or downloads it for their chosen AI. No LLM service is connected and nothing is sent automatically. Astrology notes remain personal interpretations alongside calculated positions. The pack asks the receiving AI to distinguish observations, interpretations and its own suggestions.

## Source boundaries

The travel seed contains names, city names and the source's approximate country coordinates only. Visa, advisory and activity claims are not copied or silently redated. Use the linked planning tools for their dated source material. Personal travel entries, plans and context packs remain in the user's browser or their own downloaded files.


## Timing rules and Earth places, version 0.3.7

The ten Timing and Signals pages now edit shared table rows from QuickStart. Milestones includes goals; Learning includes skills. Recurrences, reminder lead minutes, stop dates, numeric table conditions, agent instructions and matrix sequence references stay in those same rows. The Preview tab calculates the next three local reminder times and tests the condition against the current saved value. Save and export writes an aura-timing-rule/1 manifest with its real table and row reference. Nothing runs in the background.

Crown Earth includes all eight layers in the published Horn Torus manifest. The snapshot contains 91,552 source records, with source metadata and hashes in assets/earth/manifest.json. tools/build_earth_data.py refreshes it from the published source without executing its JavaScript. Affinity matching is an optional display filter; all source records remain in the snapshot. Map markers are grouped by screen position for performance, without sampling away records.

Named pins and GeoJSON/CSV point imports use the My Earth places table. Online OpenStreetMap tiles form the base map. Local datasets, layer switches, source notes, search and point lists are independent of Google APIs. Lines, polygons, offline tiles and satellite feeds are future work.


## General ideas and personal entries, version 0.3.9

The ten Timing and Signals sections share one menu for general options and saved entries. Its 126 editable starting points include the original birth context, milestones, counter types, reminder choices, ceremony themes, just-in-time learning, weather ideas and community ambitions. Broader options cover everyday routines, meaningful experiences, learning connections, collaboration and shared places. They are suggestions, not generated personal records.

Choosing an idea opens Details, When, If, Action and Preview with an editable draft. Cancel leaves your tables untouched. Save uses the existing shared-table editor, retaining QuickStart records and the original row identity when editing. A saved entry with the same title occupies that option in the menu; custom entries join the same menu. The Original ideas reader retains all source text, including historical examples.
