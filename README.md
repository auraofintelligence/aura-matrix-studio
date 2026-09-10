# Aura of Intelligence

Aura brings the scattered parts of everyday life into one personal interface: family birthdays, reminders, calendars, skills, goals, hopes, favourites, learning and travel. The aim is to make useful connections between those things and have the right information ready when a person or their AI assistant needs it.

**[Open the public Aura app](https://auraofintelligence.github.io/aura-matrix-studio/)**

Aura Matrix Studio is the current working web implementation of Luke Nathan Hayes' Aura of Intelligence. It combines the original phone app's layouts and icons with a programmable, fixed 12 x 24 matrix. The matrix is one part of the wider Aura interface. This is a developing public-source application; some original screens still contain design placeholders.

## Start with your everyday life

The app opens at **Starting Point Aura / QuickStart**. The main Aura menu always uses landscape: on a portrait phone its layout turns sideways to fill the available screen, and returns upright when you turn the phone. This rotates the app content, not the browser or device orientation. Other pages keep their original layouts. The book accepts clicks, touch and horizontal swipes, with animated page turns. Its short questions collect:

1. Your birthday.
2. The original avatar questions.
3. Family and important people, including birthdays.
4. Key dates and life events.
5. Timing, signals and reminders.
6. Favourites.
7. Skills and learning.
8. Goals and hopes.
9. Places you have travelled, places you want to visit and your travel goal.
10. Tables and allocation into the matrix.

You can skip questions and return later. Information becomes editable tables rather than a discarded onboarding questionnaire. The catalogue contains 37 recommended datasets covering the 145 original source pages. Suggested chakra associations are philosophical, editable and may include more than one chakra.

## Find things and build your own shortcuts

The page finder offers everyday icons, search, category filters and page previews. It currently has 141 distinct destinations. Camera-background variants and the old star-map duplicate resolve to their working destinations rather than becoming extra navigation steps.

**Favourites** retains the original 25-slot layout. Tap an empty square to select a page and its icon. Edit mode replaces, moves or clears a shortcut; moving onto an occupied slot swaps them. The turning book below cycles through page icons and titles. Tap the page to open it, or the star to add it to your favourites. Named shortcut menus can be created and renamed. Old blank or arrow icons are replaced with the destination's artwork.

The main menu and matrix programmer can place their controls over a camera feed. Camera use starts only after you request it and grant browser permission; tracks stop when you switch it off, leave the page or hide the tab. Nothing is recorded or uploaded.

## Enter the matrix

Every shell stays **12 rows x 24 columns**, or 288 facets. The seven shells are Red, Orange, Yellow, Green, Blue, Indigo and Violet. Each has inside and outside addresses, giving 4,032 face addresses. The underlying address does not change when the display transforms between a flat matrix, cylinder, torus, nested shells or body arrangement.

Selections are remembered separately for each shell and side. Select one or several facets, use the numbered map, move inside the chosen torus, or work with edges, vertices and cubic volume points. Rays terminate at actual vertices; the coincident horn registers do not create a ray sticking out of the torus.

Attach records, data, instructions and asset links to an address. Stack additional facets outward to represent ordered steps. Each layer advances its 24-bit colour code by one, while its full address also retains shell, side, facet and layer. The corner badge shows the added layer count. Explode the stack to inspect its steps; collapse it to keep the model compact.

Display height is independent of program length. Up to 256 layers are all drawn; larger stacks show evenly spaced samples and the selected layer, with an explicit sampled indicator. The complete addressed sequence is retained. The model supports up to 16,777,215 added layers without allocating a separate object for each one.

## Tables, instructions and agent programs

Create tables or import CSV, keep your own columns, then preview allocation to consecutive facets or ordered stack steps. Repeated allocation adds only new rows. Editing a table does not silently overwrite records already copied into the matrix; those copies remain editable through the matrix tools.

Programs support ordered Visit, Recall and Pause steps, repetitions and compact stack spans. The browser can run those local operations. Recall exposes the attached instructions, required data and asset references. Export a program as `aura-agent-program/1` JSON or as a generated `SKILL.md` containing the same manifest.

These exports prepare work for an external agent. They do not install a skill, schedule an automation, call an LLM or authorise external actions automatically. Numerical vectors can be attached separately from their three-dimensional display position; no embedding or learning model is connected yet.

## Travel Plans

Travel Plans starts with 201 seed destinations from the existing Australian World Travel and Visa & Activity Atlas projects. Mark destinations **Visited**, **Want to go** or **Planned**, or add any country, island, territory, disputed region or other place yourself.

The starting goal of 256 destinations over 10 years is editable. It is a personal target, not a fixed country count or a limit on the list. Repeat visits to the same named destination count once towards progress.

Trips can hold departure and return dates, seasonal region, preferred season, purpose and personal astrology notes. Dated trips appear in the travel timeline and can open Crown's celestial tools at that date. Travel Plans also links to the World Travel route and logistics tools, the Visa & Activity Atlas and the Strange But True Travel Oracle.

## Crown, celestial movements and Timing and Signals

**Crown's star icon owns the celestial section.** Timing and Signals supplies dates and context to it. The celestial back arrow returns to Crown.

The celestial section includes the Sun, all eight major planets and Earth's Moon, using locally calculated positions for the selected date. Choose the compact solar system, a view with projected distances to scale, the inner planets, or an Earth-Moon and rotation diagram. Compact distances are logarithmically compressed; planet markers and Moon separation are enlarged and labelled. This is a calculated map, not a photograph or a satellite feed.

Change the UTC date, animate time, inspect a planet, or jump to the next new or full Moon. Dates can come from travel plans, birthdays, life events, schedules, counters and ceremonies. A selected date can be saved back as a trip's departure. The clock shows astronomical seasons by hemisphere, tropical Sun signs, lunar phase and Earth rotation. Personal astrology interpretations remain separate from calculated positions.

Timing and Signals also provides **Prepare AI context**. Choose relevant tables and a date window, inspect the resulting information, then copy or download it for your chosen AI. The pack retains data, notes, instructions and facet references, with calculated celestial context for dated trips. Nothing is sent automatically.

## Market maps

Market pages open a map filtered to their category, including accommodation, creative industries, events, health and wellbeing, and cities. Search by name, place or service, switch between sources, or view the matching results.

The map carries **316 original Aura Alliance places** and **10,528 filtered Affinity candidates** from the Horn Torus project's snapshots. Gold and blue distinguish the sources. Whole-name-word matching removes many unrelated substring matches from the Affinity automation's results. These are candidates, not confirmed alliance memberships. The upstream Affinity automation has not been changed by this release.

The map uses locally bundled Leaflet and OpenStreetMap tiles with attribution. It works without a Google Maps key. Other Horn Torus layers, map-data imports, dropped pins and an optional Google Maps provider remain future additions. See [map sources and filtering](MARKET-DATA.md).

## Explain and animate Aura

The explainer includes six fixed-grid poses, editable camera transitions, captions and durations, playback and scrubbing. Export a PNG, real-time 720p WebM recording or geometric JSON sequence. The Blender importer builds an additional scene from that geometric sequence while preserving existing scenes.

The Blender bridge currently handles the geometric explainer, not the newer record tables, stack programs or celestial tools. Browser recordings have no generated audio; smoothness depends on the device.

## Related Aura projects

| Project | Connection to this app |
| --- | --- |
| [Aura of Intelligence](https://auraofintelligence.github.io/) | The wider public project collection. |
| [Aura Horn Torus](https://auraofintelligence.github.io/aura-horn-torus/) | Geometry, map layers and the wider torus research interface. |
| [Luke Nathan Hayes: Man and Mind](https://auraofintelligence.github.io/luke-nathan-hayes-man-and-mind/index.html#top) | Personal narrative and examples of connecting assets to individual facets. |
| [Aura Direct Hardware](https://auraofintelligence.github.io/aura-direct-hardware/) | The longer-term compute and hardware direction. |
| [Aura Spatial Perception](https://auraofintelligence.github.io/aura-spatial-perception/) | Canonical addressing and exploratory spatial perception work. |
| [Aura Affinity](https://auraofintelligence.github.io/aura-affinity/) | Source of automated place candidates; the market map adds its own filtering. |
| [Australian World Travel](https://auraofintelligence.github.io/Australian-world-travel/) | Existing route, strategy and logistics planning tools. |
| [Australian Visa & Activity Atlas](https://auraofintelligence.github.io/Australian-visa-activity-atlas/) | Destination, visa and activity research tools. |
| [Strange But True Travel Oracle](https://auraofintelligence.github.io/strange-but-true-travel-oracle/) | Additional travel planning and builder tools. |
| [Virtual Solar Swarm](https://auraofintelligence.github.io/virtual-solar-swarm/) | Related solar-system and satellite design studies for future connections. |

These projects inform and complement Aura; linking them does not mean every feature or dataset has already been integrated. Travel entry requirements and advisories remain with their dated source tools rather than being copied as current facts.

## Run locally and keep your data

On this Windows laptop, double-click **Start Aura.cmd**. It uses Node.js to serve the app at [127.0.0.1:4318](http://127.0.0.1:4318/) and reuses an existing server. Alternatively, serve this repository with any static web server. No build service, account or backend is required.

Personal tables, favourites, records and programs stay in browser storage under `aura-matrix-studio:v4:project`. Older v3, v2 or v1 projects are read when v4 is absent. Reload older app tabs before continuing. Download a project JSON backup regularly; browser storage can be cleared, and different browsers or origins have separate copies.

The public repository does not contain your personal project data. GitHub Pages projects under the same account share an origin, so this browser edition is not a secure personal vault. Inside/outside matrix addresses do not provide encryption. External map tiles and links use the network; personal project records are not automatically sent to them.

## What remains to build

Calendar synchronisation, dependable scheduled notifications, an external agent runner, learned associations, richer avatar features, desktop packaging and a dedicated local data store remain future work. Existing forms collect their relevant data but do not yet provide all those services.

Earth, space-weather and satellite pattern research is a longer-term direction. No satellite feed, forecasting system, predictive astrology service, hardware controller or external automation is enabled. The fixed 12 x 24 address model remains the foundation across implementations.

## Development and reference notes

Run `node --test tests/*.test.js` and `python tools/test_market_filter.py`. The checks cover fixed geometry, per-shell selections, inside cameras, stack spacing and colours, backups, table allocation, navigation, icons, market filtering, travel records and celestial calculations. GitHub Actions validates and publishes the static site.

The original Mockplus archive contains 145 page records, 621 link definitions and 153 referenced artwork files. The archive stays outside this repository and is not modified. Original artwork and coordinates are preserved as source material; working overlays replace specific placeholders and navigation problems. Portrait and landscape source layouts scale to fit their respective screens.

See [original layouts](ORIGINAL-LAYOUTS.md), [dataset catalogue](DATASET-CATALOGUE.md), [market data](MARKET-DATA.md), [travel and timing](TRAVEL-AND-TIMING.md), [future directions](FUTURE-DIRECTIONS.md) and [validation notes](VALIDATION.md) for details and limitations. Earlier validation notes describe their named releases; current checks run through the repository workflow.

Geometry follows the [Horn Torus roll path](https://auraofintelligence.github.io/aura-horn-torus/geometry.html). The [personal Aura](https://auraofintelligence.github.io/luke-nathan-hayes-man-and-mind/personal-aura.html), [under the Aura](https://auraofintelligence.github.io/luke-nathan-hayes-man-and-mind/under-the-aura.html), [hardware harness](https://auraofintelligence.github.io/aura-direct-hardware/harness.html) and [learning](https://auraofintelligence.github.io/aura-direct-hardware/learning.html) pages inform the separation of addresses, relationships and learning.

## Licence

Original code, design and content are by **Luke Nathan Hayes / Strange But True / Aura of Intelligence**, under the [Strange But True Public Source Licence](LICENCE.md). This is a public-source licence, not a standard open-source licence. Read its terms before reuse.

Bundled Three.js, Leaflet and Astronomy Engine retain their MIT notices in `vendor/`. OpenStreetMap data and tiles retain their source attribution. Astronomy calculations use [Astronomy Engine 2.1.19](https://github.com/cosinekitty/astronomy).
