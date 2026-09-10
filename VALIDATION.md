# Validation record

## Direct destinations and camera variants (0.3.3)

37 automated tests cover the existing model plus direct everyday destinations, 142 browsable pages without duplicate CK modes, calendar/family search aliases, legacy camera URL resolution and logical parents. Camera lifecycle tests use a simulated stream: no access at mount, explicit activation, stopping on toggle/navigation/tab hiding, late permission resolution and denied permission. No physical camera feed was accessed during QA.

Browser checks at 360 by 640 verified the icon finder, separate birthday preview, direct Birthdays navigation and an old Aura Menu CK URL resolving to the main menu with its camera toggle off. Physical-camera appearance and performance remain to be checked on the user's device.

Favourites tests cover blank slots, icon validation, camera-address normalisation, occupied-slot swaps, clearing, multiple-menu validation, backup preservation and legacy defaults. Phone browser checks covered adding Birthdays, its original icon replacing the square, persistence after reload, choosing a different app icon, moving to slot 2 and opening the correct page. New-menu creation is implemented but has not yet had a separate browser interaction check.

## Everyday QuickStart and site map (0.3.2)

35 automated tests pass, including valid calendar dates, birthday row updates without duplicate entries, preserved unrelated tables, the requested everyday-life step order, and reachability of all 145 site-map pages. Browser checks at 360 by 640 covered the one-field birthday form, saving a leap-day birthday, the original avatar questions and progression, book navigation, searchable page names, a loaded Birthday page preview and its Open destination. A further 320 by 568 check found and corrected excess spacing in the family form. The name, relationship, optional birthday and save controls then fit without scrolling; the family birthday appeared alongside the first birthday in the shared table. QuickStart sheets now stay within 360 pixels on wider screens. Turning sheets use directional 3D transforms; reduced motion bypasses them. The browser inspection surface does not expose the animation timeline for frame-by-frame measurement.

The screenshot checks do not establish all phone keyboards or browser combinations. Scheduled notification delivery and calendar synchronisation remain unimplemented.

## Aura navigation and QuickStart (0.3.1)

33 Node tests pass. New checks cover recommendations for all 145 original pages, 37 datasets and ten reader cards, table and chakra-tag backup round trips, legacy defaults, 600-row facet allocation, stack append and repeat-allocation behaviour, rejected invalid allocations, logical back navigation and swipe thresholds. Existing geometry, camera, stack, ray and group-selection checks remain green.

Local browser checks at 360 by 640 covered the book layout, click and swipe paging, table creation and editing, a two-row allocation to Green inside stack layers 1 and 2, the Open this torus link, the correct embedded editor address, and retained source data in the saved record. The Maps return arrow reaches the original programmer page. The allocation form fits the phone viewport without scrolling; landscape source screens remain uniformly scaled and letterboxed. The embedded editor owner mismatch found during review was corrected and retested.

CSV parsing and allocation are covered by automated tests; the browser file picker, backup downloads, virtual keyboard and all 145 pages have not each received end-to-end visual checks in this release. Earlier validation sections below describe their own releases and limits.

## Original layout restoration (0.3.0)

26 Node tests pass. New checks cover all 145 extracted pages, all assigned original destinations, all 153 referenced assets, the original Enter the Matrix route and exact positions of the three Matrix Programmer buttons, source hit areas, portrait/landscape fit and inside/outside editor routes. All extracted artworks were also compared directly with the original archive and match byte for byte.

Browser review covered the ten supplied source screens plus the finite outside page at their native 640 by 360 size. The original home was also checked at 1280 by 720 and 360 by 640. At portrait size the landscape home is uniformly scaled and letterboxed, with no document overflow and no broken images. Browser clicks verified Enter the Matrix, Finite Map, inside/outside navigation, source facet 159 opening Red I159 in the editor, and return to the original inside screen. A discovered editor grid sizing conflict was corrected; at 640 by 360 its model and camera controls now fit inside the workspace.

The remaining archive pages have source structure and link checks, not individual visual acceptance. Native widgets elsewhere in the archive can still be placeholders or approximations. Virtual keyboard handling, browser recording, external agent execution and device performance are not newly validated. Earlier sections below record checks and limitations at the time of those earlier releases.

10 September 2026, Windows laptop, first prototype.

## Passed

- Eight Node tests: fixed 12 x 24 dimensions, 4,032 face addresses, analytic horn geometry, seam identities, wrapped neighbours, finite continuous animation, reversible seeking, a 600-row CSV without resizing the lattice, quoted CSV, invalid import rejection, backup round trips, directed connection validation, local routes/assets and unique HTML IDs.
- JavaScript syntax checks for the core, renderer and application.
- Local HTTP preview returned 200. A preview was opened in Codex.
- Browser and Blender implementations agree at 105 sampled shell positions, maximum numerical discrepancy below 1e-14.
- Blender 5.2.1 loaded the importer and wrote an editable 865-frame scene. Seven meshes each retained exactly 288 faces and an `aura_cell` attribute numbered 1 through 288.
- The saved Blender scene was reopened, animation evaluated at four timeline positions, and a body-arrangement frame rendered and visually inspected. Camera framing was corrected and the scene rebuilt.

## Review gaps

The browser UI has not been exercised through automated clicks or visually checked at phone sizes. The website-building skill in this session restricts browser interaction testing unless explicitly requested. Browser WebM recording, cancellation, download behaviour and performance on this laptop remain unverified end to end. The capture path checks browser support and cancels if the tab becomes hidden.

The Blender file-selector interaction has not been clicked through; the underlying import was tested through Blender's background mode. Blender renders use a wire surface and baked pose interpolation, so their appearance is not identical to the browser's translucent shaded surfaces.

No performance, intelligence, encryption or clinical capability is inferred from these checks.

## Generated local outputs

`test-results/Aura explainer.blend` is the editable example. `test-results/blender-body.png` is the reviewed render. The example uses geometry and scripted captions only; it contains no personal records. Generated outputs are ignored by Git and excluded from Pages deployment.

## Spatial programming regression checks

The expanded Node suite passes selection isolation and persistence; distinct edge/vertex addresses; exact inside-camera containment in every selected closed shell; full vector storage separate from 3D display coordinates; RGB integer progression and wrap; bounded rendering samples for large stacks; lazy million-layer program traversal; attached instructions/data/assets in recall and agent exports; legacy-backup migration; and invalid-link or dangling-anchor rejection. JavaScript syntax and source asset checks were also run. Browser UI interaction and visual testing remain unperformed in this session.


## Compact stack and horn ray correction (0.2.2)

20 Node tests pass. Regression checks cover all 100 layers of the reported Red facet 159 stack, uniform bounded height in each transform, exact RGB codes, bounded evenly spaced sampling through 16,777,215 layers, and outside camera framing in landscape and portrait. A scene-level check using the bundled Three.js verifies actual layer meshes, updated marker and record-connection positions, large-stack badges, and omission of zero-length horn rays. This scene check uses a canvas text stub, without WebGL or browser interaction. All 288 vertex registers remain available; the horn view draws 264 nonzero vertex rays per shell. Syntax checks and whitespace checks pass. Browser visual and interaction review remains outstanding.


## Facet groups and compact workspace (0.2.3)

22 Node tests pass, including independent group toggling, selection order, empty groups, full 288-facet groups, backup round trips and legacy import. Batch stack checks retain unrelated shells/sides and reject shrinking stacks with attached records. The existing geometry, scene, camera and ray regressions remain green. All application modules pass syntax checks and deployment includes workspace.js. Original Mockplus screenshots were inspected as layout references. Browser interaction, phone appearance, viewport overflow and virtual-keyboard behaviour have not been visually tested; the Sites skill prohibits browser QA without an explicit request. Long user content retains internal overflow as a fallback; the programmer document uses a fixed viewport.

## Version 0.3.4: favourites, markets, travel and Crown

On 10 September 2026, 46 Node tests and two Python market-filter tests passed. All top-level JavaScript files passed syntax checks. Tests include the eight calculated planetary positions, Earth-Moon distance, map projection ratios, editable travel goals, preserved trip identity, source filters, icon coverage and Crown's ownership of celestial tools.

Browser checks covered the favourites picker and an angled page-turn animation, accommodation maps with composed category/source/text filters, Travel Plans and a saved local test itinerary, travel QuickStart, the context preview, Crown navigation and the celestial views. The celestial controls and travel QuickStart were visually checked at 320 x 568; other flows were also reviewed at 360 x 640. Solar playback advanced the date and planet positions, and pause stopped it. The solar tab recorded no console errors.

These are browser viewport checks, not tests on physical phones. Physical touch gestures, an actual camera feed, external calendar notifications and external agent execution were not exercised. Public deployment verification is reported separately after publishing. The original 145-page source archive remains unchanged.


## Version 0.3.5: opening page and landscape menu

The default route now opens Starting Point Aura / QuickStart; explicit page links retain their destination. The main Aura menu rotates its whole layout on a portrait viewport, including its links and camera layer. It returns upright on a landscape viewport. This is a layout rotation, not a browser or operating-system orientation lock. Other screens retain their original layout.

All 48 Node tests passed. Added coverage checks default routes, camera aliases, transformed bounds and button coordinates. Browser review checked the opening page, the menu at 390 x 664 and 664 x 390, and the return link to QuickStart. No physical phone orientation lock is claimed.
## Version 0.3.6: designed orientation and related favourites

Each frame retains its source orientation in phone-sized viewports (a shortest side of 600 CSS pixels or less). Portrait frames rotate as a whole in a landscape viewport and landscape frames rotate as a whole in a portrait viewport. Wide desktop views retain upright source layouts. No automatic fullscreen request, entry prompt or device orientation lock was added.

Matrix sizing and pointer coordinates, plus QuickStart, favourites and preview swipes, account for the rotated frame. Browser checks verified a sideways favourites-book swipe advances to the next page and a tap on the rotated torus selects a facet. No console errors were recorded in that test tab.

Favourite options and the flipbook use nine relational groups. The picker adapts its row count to the available height; 15 icon choices were visually checked at 390 x 664. Search spans all groups. Tests confirm all 141 destinations occur exactly once, related tasks stay together, and all 145 original frame bounds fit after rotation. All 50 Node tests passed.


## Version 0.3.7: timing editors and Crown Earth

Automated coverage checks shared QuickStart row identity, goal/work date columns, repeat intervals, leap birthdays, month-end dates, long date gaps, lead times, paused signals, numeric conditions, missing references, and backup preservation. Earth checks cover every source layer and all 91,552 coordinate records, composed filters, grouping counts, point imports and atomic rejection of invalid data.

Browser review checked birthday previews and the complete schedule-to-reminder flow. A local test counter satisfied a linked threshold. Forms fit 320 x 568 and retained their designed orientation at 568 x 320. Earth review checked all eight layer switches, full Affinity display, Brisbane search, fitting results, and saving a named pin. Browser viewport tests do not establish physical-device performance or background notification delivery.

All 57 Node tests and two Python market-filter tests passed. Every top-level JavaScript file passed syntax checks. The final Earth build retained search and map position between tall and wide frames; a centred pin in the rotated frame returned the saved point coordinates within map projection rounding. No console errors were recorded in the checked Earth and timing tabs.


## Version 0.3.8: map selection and tap-to-zoom

Pointer capture previously redirected clicks away from Leaflet's canvas markers. Selection now uses the same frame-coordinate conversion as dragging, with bounded touch targets and explicit group membership. A tap on a group zooms to its bounds; a single place zooms in and opens a compact information card. Coincident points and groups at maximum zoom can be read with previous/next cards. The permanent place list was removed, and search fits matching places.

Direct coordinate clicks at 390 x 664 separated the Brisbane group twice, then opened the Consulate of Colombia - Brisbane card with its detail, category and coordinates. Automated tests cover marker target bounds, empty-map clicks and complete group membership.

The same single-marker selection was verified with a direct coordinate click at 568 x 320 while the portrait frame was rotated. The selected marker remained visible beside its card. Dragging did not open a detail card. All 58 Node tests and two Python tests passed.


## Version 0.3.9: general timing options and working editors

All ten Timing and Signals sections now have general options before personal data exists. One paged menu combines 126 suggestions and saved entries, with matched saved titles occupying their original option. Selecting an idea opens the existing editor with a draft and its explanation. Cancel does not create a row. Original source notes remain available in a paged reader.

All 60 Node tests and two Python tests passed. New coverage checks every suggested draft can be saved and edited while preserving existing records and the catalogue, and that all original text remains available. All top-level JavaScript syntax checks and the whitespace check passed.

Browser checks found eight populated first-page options and no panel overflow in all ten sections at a 390 x 664 viewport. The birthday idea opened the editor with its seven-day reminder offset. Search found an idea beyond the first page; previous/next options and original-note pages worked. Community retained its portrait design while rotated within a 568 x 320 viewport, without panel overflow. These are browser viewport checks, not physical-phone tests.
