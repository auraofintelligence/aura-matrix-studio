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
