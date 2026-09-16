# Validation record

## Personal attraction, senses and disclosure (0.4.13)

108 Node tests and two Python filtering tests pass. New tests cover explicit body and scent preferences, self-described frameworks, family-pattern reflection, independent attraction factors with zero distinct from unanswered, unchanged legacy answers and backup round trips. Disclosure tests check private defaults, separate public and permission audiences, own-word notes, exclusion of unrelated data, reverting to private, and rejection of malformed imported settings.

At 320 x 568, all 25 attraction and 14 personality cards fit without card or document overflow. Browser checks covered multi-select across two scent pages, independent importance sliders, selected choices plus own words, an exact one-answer outer Aura preview, saving and reload persistence. The shared editor was also checked across the other 64 Dating and 47 Friendship cards. Two clipped Friendship cards were corrected and rechecked. Shared question definitions are cloned so Dating group labels do not alter Friendship navigation. Test data was fictional and local. No public profile was edited. Real phone keyboards and touch gestures remain untested.

Audience choices are saved intentions. Previews and selective JSON exports work locally; this release does not publish profiles or enforce access permissions on a server.

## Guided visual connection preferences (0.4.12)

103 Node tests pass. New cases cover reversible suggestion selections, preserved legacy and typed notes, explicit source-labelled suggestions, custom notes alongside multiple choice, independent importance and urgency, unique reordered priorities, optional scales and culture/faith choices in both profiles, malformed imports and full backup round trips. The chronological adult-age checks from 0.4.11 remain in place.

Browser QA at 320 x 568 visited all 79 Dating and 50 Friendship question cards with no vertical or horizontal content overflow. Checked a complete 12-area priority ranking, independent Essential/Later choices, saving and reloading a combined selected/typed answer, deselection without loss of typed words, and suggestions drawn from an explicitly selected shared interest. Tests used fictional localhost data only. Physical phone keyboards and gestures remain untested.

0.4.12 was published at b0e61d60c9dcbd678ee2cf91e0889ff106d26256 after approval. GitHub Actions run 35104003793 succeeded and 258 public files matched that commit. No new generated image was included.

## Longevity-focused Dating (0.4.11)

Removed the pronoun question and replaced it with optional chronological age. Reframed relationship intentions, appearance, emotional support and shared futures around possible age reversal and radical longevity as a planning assumption. Removed the 120-year ceiling; ages must still be whole chronological years of at least 18, with minimum/maximum consistency. A blank maximum means no upper preference. The app does not verify age or jurisdiction-specific legal eligibility.

97 Node tests pass, including older hypothetical ages, under-18 and fractional rejection, no fixed upper ceiling, and retained backup data. At 320 x 568, all 31 question cards in the four main changed chapters fit without internal overflow. Tested using fictional localhost data; no live profile answers were altered.


## Visual Dating and Friendships profiles (0.4.10)

96 Node tests pass. Added coverage for legacy profile and connection preservation, separate giving/receiving preferences, explicit zero versus unanswered sliders, invalid scores/choices/age ranges/time windows, separate friendship/dating profiles and backup round trips. All 12 Dating and nine Friendship areas retain optional answers.

Browser QA used fictional entries on localhost. All 69 Dating question cards fit at 360 x 640; all 45 Friendship cards fit at 320 x 568 without internal clipping or document overflow. Checked giving/receiving slider saves, multi-choice selections, free-text drafts, weekly availability selection and reload persistence. Existing people editors and calendar planning remain separate from profile questions. Mobile dimensions were emulated; physical-phone gestures and on-screen keyboard behaviour were not tested.


## Life collections, preferences, palaces and social tools (0.4.9)

92 Node tests and two Python filtering tests pass. New tests cover unlimited family generations and multiple reciprocal/custom links; legacy bucket rows in the combined wish collection; achievements with optional dates; anchored solar zoom; table-preserving settings edits; algorithm dataset/device references; palace dimensions, pin positions, asset/address validation, cascading room removal and backup round trips; idempotent sample creation; social CSV completeness, invalid dates and distinct Dating/Friendships records; valid new favourite icons; and local Affinity draft updates.

Browser checks used an isolated local origin with fictional examples. At 390 x 664 and 320 x 568, the family forms, eight-option algorithm menu, editors and visual pages fit the original portrait frame. Checked saving and reloading a friendship, saving a device and an algorithm specification linked to that device and a table, moving a palace pin by drag, adding a new pin, and creating the optional sample. A catch-up saved from Friendships appeared in Schedules alongside the general starting ideas. A two-row social CSV was previewed, saved and reported as two rows, four columns and seven populated cells out of eight. Family & belonging visibly contains Friendships and Dating.

Affinity's original five branches and accommodation search controls were checked. The map opened filtered to accommodation, and scrolling its list grew the rendered results from 40 to 80 without previous/next buttons. Celestial wheel/keyboard zoom and drag panning were checked, and the added gesture hint and lower controls fit without overlap. Browser emulation does not establish physical multi-touch behaviour on every phone.

New tools are local organisers and specifications. No social login, matching service, message delivery, public membership submission, blockchain transaction, device pairing, algorithm execution, building scan or VR capability was claimed or exercised. All data is part of the existing Aura project backup; the matrix remains 12 x 24.


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


## Version 0.4.0: mobile avatar setup

Updated the Body to Aura Ratios entry page and its five linked input sections. Avatar preferences and personal-space settings use short question pages; eye, height, reach and shoulder forms use labelled numeric units. Original page URLs, source orientation and artwork remain. The original source archive is unchanged.

All 64 Node tests and two Python tests passed, along with JavaScript syntax and whitespace checks. New tests cover the five original destinations, QuickStart row sharing, preserved legacy values and custom fields, optional blanks, atomic rejection of invalid measurements, unit labels and calculated ratios.

Browser review checked all six pages at 320 x 568 with no panel overflow or form/status overlap. At 390 x 664, the avatar menu, height form and three personal-space note fields were visually reviewed. Fictional local measurements survived save and reload; the summary showed the saved count and reach-to-height ratio. A partial questionnaire answer saved while the other field remained blank and survived question navigation. At 568 x 320 the portrait questionnaire retained its designed orientation. No browser errors were recorded. No physical-phone keyboard behaviour, pose detection or live-matrix resizing is claimed.


## Version 0.4.1: seven visual personal-space shells

Personal space now opens a 2D person with seven nested coloured shells, selectable colour controls, a distance slider, exact distance entry and a person-height slider. Radius and diameter are explicit; each layer can have its own meaning. Earlier four-zone artwork is treated as a visual reference, not the definition of the seven-layer model. Adjacent radii move when needed to preserve nesting. The fitted-axis drawing is a schematic, not a uniformly scaled map.

The additional shells save in a separate project table alongside shared height and boundary inputs. Existing notes and extra table fields are preserved, and the fixed matrix remains unchanged. Tests cover seven-layer defaults, radius/diameter arithmetic, every layer moving inward and outward, backup round trips and separation from matrix data. All 67 Node tests and two Python tests passed; script syntax and whitespace checks passed.

Browser checks verified an arrow-key slider change altered the rendered radius and diameter, exact Blue distance 450 cm produced a 900 cm diameter and moved the adjoining Indigo layer, and height changes altered the person reference. A custom layer meaning and dimensions survived save/reload. At 320 x 568 the page showed seven shells with no panel overflow. At 568 x 320 a direct drag on the rotated distance slider changed Blue from 450 to 334 cm. No browser errors were recorded. Physical-phone touch hardware was not tested.


## Version 0.4.2: measured personal-space proportions

Replaced the independently fitted axes with one centimetre-to-screen scale shared by the person and all seven circular shells. The drawing fits the largest radius or person height without stretching. Radius from centre is labelled at the input; the dimension line shows radius and the caption also states full diameter. Saved dimensions and meanings are unchanged.

All 68 Node tests and both Python tests passed. The new geometry regression checks person-to-radius and person-to-diameter ratios over multiple heights and outer radii, including a 200 cm radius against a 170 cm person. In the browser at 320 x 568, the rendered radius was 32.5 units on both axes and person height was 27.625 units, giving the exact 200/170 ratio. No document overflow occurred. Physical device testing was not performed.


## Version 0.4.3: top and side human views

Top view now places an overhead human reference inside the seven ground-distance rings. Side view places the matching standing figure on the ground with seven horizontal dimension guides. Each view uses a uniform physical scale and fits independently. Focus layer enlarges the selected area and Fit all layers restores every radius. The Male/Female selection uses four generated pose images: one arm forward and the other sideways at shoulder height. Figure choice is saved in the existing shell table without changing dimensions or meanings. Side head-to-foot height follows the entered height; other body proportions remain illustrative.

Browser checks at 320 x 568 and 390 x 664 covered both views, the focus toggle, both female images, and saved figure selection after reload. View changes retained unsaved radius edits. There was no document overflow. Geometry tests cover both view scales and focused layouts; saved-data tests cover female selection and preserving it during subsequent edits. No physical device or personalised arm-reach calibration is claimed.


## Version 0.4.4: stretched torus bubbles, mist and closer framing

The side diagram now projects a horn torus for every radius: major and horizontal minor radius both equal half the entered outer radius, with the vertical minor radius set to half the person's height. This gives a central horn and a vertically stretched surface. Seven translucent envelopes and meridian curves surround the realistic human; the existing distance guides remain. Holding the background toggles mist. The camera starts framed around the person, with pinch zoom, drag panning and double-tap reset. Tapping the person turns between views; holding the person switches the male/female reference. The diagram uses its available height without SVG letterboxing. The final layout has no view toolbar, menu or zoom buttons. Mouse-wheel and keyboard controls are also available. No scrolling is introduced.

Unsaved example radii are now 45, 60, 75, 90, 110, 130 and 150 cm (outer diameter 3 m). Saved distances are not rewritten. All 69 Node tests and both Python tests passed; geometry regression checks entered dimensions and the coincident horn. Browser review at 390 x 664 confirmed seven torus envelopes and 28 meridian curves, with a 174-unit human in Fit all (previously 53 units with the older defaults). At 320 x 568, top view, female selection, mist off and zoom were checked without document overflow. Physical device testing was not performed.

Final gesture-layout browser checks confirmed tap-to-turn, dragging, zoom and double-click reset, keyboard figure selection, and no console errors. The 320 x 568 screen fits without scrolling and the diagram uses the space previously occupied by controls. Two-finger pinch and long-press still require physical touch-device verification.


## Version 0.4.5: selected-colour fog with a firm boundary

Only the selected torus carries coloured fog, with stronger interior opacity and no fade at the outline. The selected field renders after the other shell outlines and before the human. The source images' near-white backdrop is removed during SVG compositing so the person keeps their original colours instead of being tinted by multiply blending. No image files or measurements are changed.

Browser review at 390 x 664 checked the blue side field and red overhead field with the female reference. Exactly one layer was shaded and matched the selection. The field stopped at the outline and the figure stayed visibly in front in both views. Existing gesture controls remain.

## 0.4.6: Matching human measurement references

- Eyes, height/reach and shoulders/span have one-measurement views with matching male/female references and endpoint guides. The original nine eye-photo positions and 30 cm forehead-ruler instructions are restored.
- Phone review at 390 x 664: standing, overhead and seated height, arm span and eye width inspected. All nine gaze positions traversed; female reference selection checked. No page scrolling required.
- Local image attachment, saved photo reload, numerical eye input reload and clearing the test input checked through the browser. Photos remain in the project tables; backup round-trip and separate pose identity covered by tests.
- 72 Node tests and 2 Python tests passed before release. Real phone pinch/hold gestures were not exercised; keyboard browsing/reference changes and browser pointer UI were checked.

## 0.4.7: Visual avatar menu and measurement corrections

- Avatar creation uses five illustrated cards with the original destinations, Back and QuickStart preserved. Verified at 390 x 664 without page scrolling or grid overflow.
- The forehead ruler has 300 one-millimetre intervals, longer five-millimetre ticks, centimetre labels 0-30, and all ticks aligned to its bottom edge. Browser inspection confirmed 301 boundaries including 0 and 300 mm.
- Shoulder width uses matching male/female references with arms relaxed by the sides, separate from the arm-span T pose. Measurement endpoints and instructions updated together.

## Visual everyday-life collections (0.4.8)

All five marked Social Web destinations now mount working mobile collections rather than legacy scroll-view placeholders. The original category text is checked against the Mockplus archive. Eight new tests cover source-list coverage, QuickStart row identity, birthday updates without duplicates, distinct goal collections, family references, CSV atomicity, custom columns and backup preservation.

Phone browser QA at 390 by 664 checked original favourite and bucket-list categories, populated starter cards, saved family dates, a goal with 3 of 12 sessions showing 25 percent progress, and a reviewed two-row CSV import into separate wish categories. Test records were created only on an isolated localhost origin. Published user data was not changed. Touch swipe paging is implemented; physical-device keyboard and gesture behaviour still needs user-device review.

Release checks: 80 Node tests and 2 Python checks passed; all top-level JavaScript syntax checks passed. The five-field goal editor also fits at 320 by 568 with every input above the save controls. Family graph navigation and relationship direction were checked in the browser.
