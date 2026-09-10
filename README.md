# Aura Matrix Studio

Luke Nathan Hayes' original Aura phone app layouts and navigation, connected to a working fixed 12 by 24 matrix editor and animated explanations.

## Open it on this laptop

Double-click **Start Aura.cmd** in this folder. It opens the app at <http://127.0.0.1:4318/>. Node.js is installed on this laptop. The launcher starts a small local server in the background and reuses it when already running.

The app opens at the original **Aura Menu**. Its **Enter the Matrix** image opens the original Matrix Programmer. Choose **Finite Map** or **Infinite Map** to use the live matrix in its original screen. **Tools** opens the full editor; **Done** returns to the torus. **QuickStart** opens the ten-page click, touch and swipe book. The editor remains directly available at `matrix.html`; its Inventory, Explainer and Help links open the working tools.

Original pages retain their source orientation and scale uniformly to fit the screen. Most matrix screens were designed at 640 by 360 in landscape; portrait pages retain their 360 by 640 layout. They do not rearrange buttons on smaller screens. `?inspect=1` exposes an optional page selector for reviewing the whole archive.

## Fixed address contract

- Every shell is exactly 12 rows by 24 columns: 288 cells.
- Seven shells: Red, Orange, Yellow, Green, Blue, Indigo and Violet.
- Each cell has an inside I address and an outside O address: 4,032 face addresses in total.
- Example canonical address: `Red I97`. This matches `aura-spatial-perception/lib/aura-geometry.ts` and the horn-torus project.
- A cell can hold multiple records. Importing more than 288 records does not increase the matrix dimensions.
- Cell identities are independent of display triangles, transformations and camera positions.

The source workbook's changing matrix dimensions are deliberately excluded, following Luke's explicit decision on 10 September 2026.

## What works

Select through the 3D surface or keyboard-accessible numbered map. Change shell and face. Create, edit and remove records. Add labelled directed connections. Import a CSV with chosen columns and placement, retaining all source fields. Search the inventory. Download and restore validated JSON backups. Undo changes made during this session.

The explainer supports six fixed-grid poses, camera transitions, editable captions and durations, duplicate/remove/reorder, playback, scrubbing, PNG export, real-time 720p WebM capture and a geometry-only JSON sequence. It does not generate sound. The Blender importer creates an additional scene with animated wire lattices, a camera, and captions retained as timeline markers.

Browser state is localStorage under `aura-matrix-studio:v3:project`. Existing v2 or v1 data is read on first use and saved in v3 when changed; older tabs cannot overwrite the new tables. Reload older tabs before continuing. The original layout manifest and artwork load from the same site. No account, tracking, model API or cloud storage is used. Inside/outside are address spaces, not encryption. Browser data can be cleared or evicted. Keep a downloaded backup. A GitHub Pages version shares an origin with other projects on the same account and must not be described as a secure personal vault.

## Architecture

`core.js` is independent of browser rendering: fixed lattice, continuous roll-path equations, record and link validation, CSV import and timeline interpolation. `renderer.js` draws those identities with a pinned, locally included Three.js r128. `app.js` connects the working pages and local storage. `tools/blender_import.py` translates the same geometry and timeline to Blender. No build service or package installation is required to serve the application.

The application uses relative paths and plain static assets, suitable for a GitHub Pages project URL. There is no backend to deploy. Do not put private backups, supplied source archives or personal records in the repository. `.gitignore` excludes generated test outputs and videos.

## Validation

Run `node --test tests/*.test.js`.

The suite checks the fixed dimensions, 4,032 distinct addresses, analytic closed horn geometry, wrapped neighbours, continuous/reversible seeking, 600-row CSV placement, backup round trips, malformed imports, source links and duplicate HTML IDs. It writes a cross-runtime fixture under ignored `test-results/`.

For Blender: run the importer from the Scripting workspace and choose the exported JSON. Automation can use `blender --background --python tools/blender_import.py -- explainer.json output.blend`. The importer adds a new scene and preserves existing scenes. The renderer samples the mathematical trajectory six times per second and Blender interpolates those baked poses; captions are timeline markers, not rendered text. The browser uses continuous evaluation.

See `VALIDATION.md` for the checks actually performed and remaining review gaps.

## Source and design provenance

The supplied `Aura MockPlus Prototype - Alpha.mp` contains 145 page records, 621 link definitions and 153 referenced artwork files. Version 0.3.0 extracts the original coordinates, text, fonts, nested controls, link areas and artwork using `tools/import_mockplus.py`. All artwork matches the archive byte for byte. See `ORIGINAL-LAYOUTS.md` for the screenshot mapping and current limits. The source archive remains untouched and outside this repository. The rejected `aura-of-intelligence-web-app` was not used.

Geometry derives from the roll path in [Aura Horn Torus](https://auraofintelligence.github.io/aura-horn-torus/geometry.html) and the canonical addressing in Aura Spatial Perception. The deeper [personal Aura](https://auraofintelligence.github.io/luke-nathan-hayes-man-and-mind/personal-aura.html), [machinery](https://auraofintelligence.github.io/luke-nathan-hayes-man-and-mind/under-the-aura.html), [modelling harness](https://auraofintelligence.github.io/aura-direct-hardware/harness.html) and [learning](https://auraofintelligence.github.io/aura-direct-hardware/learning.html) pages informed the separation of addresses, relationships and learning. The original supplied documents remain outside this repository.

Browser capture uses [canvas captureStream](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) and [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder). Capture is real time; output smoothness depends on the laptop and browser.

## Next implementation steps

Review the selection, camera, stacking and sequence interactions on phone and laptop. Then add explicit record movement and dataset group operations. Add a desktop Tauri wrapper with a dedicated data store and backup/migration tests. Learned associations and executable rules should consume the stable records and links, with repeatable comparisons that demonstrate any improvement. A new matrix size is not required for any of these steps.

No AI learning, authentication, encryption, synchronisation, hardware control, avatar or VR system is claimed by this prototype.

## Licence

Original code, design and content: Luke Nathan Hayes / Strange But True / Aura of Intelligence, under `LICENCE.md`. This is the Strange But True Public Source Licence, not a standard open-source licence. The included Three.js library remains MIT licensed; see `vendor/THREE-LICENSE.txt`.

## Spatial programming update

Selections are persisted independently for each shell and side. A new shell has no active selection. Inside moves the camera into the selected closed torus; Outside restores the exterior orbit. Open geometry uses a reverse-side view.

`spatial.js` defines typed facet, edge-U, edge-V, vertex, volume and stack targets. Vertex labels retain the canonical R/L registers. Edge labels are this application's explicit E-U/E-V extension. Stack addresses combine shell, face, base facet and layer, with a computed 24-bit RGB colour code. 24-bit colour is an additional code, not a replacement for the full address.

The cubic volume stores explicit 3D display positions separately from arbitrary-length numeric vectors. Its normalised display cube maps [-1,1] to [-4.4,4.4] in the scene. Vector entries may bind to geometry and accompany directly attached records in an agent export. No embedding model is called.

Outward stack counts exclude the base facet. A corner +N badge reports added layers. Display height grows to a compact maximum of 1.2 scene units, with uniform spacing for every layer. Explode expands that height by up to four times; the outside camera fits the stack bounds at the reset zoom, including portrait viewports. User zoom remains available. Stacks through 256 layers draw every layer. Larger stacks draw 256 evenly spaced samples plus the selected layer, with an explicit sampled badge; the complete stack is addressed lazily up to 16,777,215 added layers. Explode changes only display spacing. Layer cards page through all steps.

Records may additionally hold `anchor`, `instructions`, `data` (JSON) and `asset.url`. Old records and backups remain accepted. HTTP/HTTPS asset URLs are references, not uploaded files. The original public facet-to-asset pattern was reviewed in the personal story site's `index.html` and linked horn-torus interface.

Programs support ordered Visit, Recall and Pause steps, optional repetition and compact stack spans. The browser executes these operations locally. Recall emits the entire attached record, including instructions, data, fields and asset reference. Programs and all spatial data are included in backups. `aura-agent-program/1` exports the chosen program and directly attached inputs. The generated SKILL.md embeds that same manifest; no skill is installed and no scheduled automation is created automatically. External agent tool execution requires a runner and the current user's authorisation.

The Blender bridge still exports the original geometric explainer sequence only. The newer records, volume entries, stack programs and explosion controls remain in the browser and JSON/skill exports.

The v2 browser storage key reads the earlier v1 project on first use and writes future changes separately. This preserves existing records while preventing an older open tab from overwriting the new spatial data. The old key is not deleted.

Vertex rays terminate at the actual geometry position. Zero-length rays at the horn seam are omitted from the display; the 24 seam register identities remain intact. No artificial positive-Y ray is drawn.


## Compact workspace and facet groups (0.2.3)

The programmer uses a fixed viewport, an icon-and-label tool rail and a collapsible editor. Shape and inside/outside controls remain beside the model. Record fields and sequence controls use short pages; stack cards show four steps per page. The phone map pages through 6-row by 8-column windows without changing any of the 12 by 24 addresses. Larger displays retain the complete map. Long user data can still scroll inside its editor. `workspace.js` reparents existing editors, preserving their handlers and field contents.

Multi-selection works in the model and numbered map, with a visible mode switch, modifier clicks and Select all. `facetSelections` stores ordered groups independently for each shell/side, separately from the active record address. Groups survive backups and reloads. Stack counts can be applied to a group atomically and undone; orphaned stack records are rejected. Sequence append follows selection order.

The phone-first reference is Luke's original Mockplus screens: Quick Navigation and Matrix Programmer, plus Finite Map / Interior / Exterior screenshots dated 6 July 2026 (135648, 135710, 135730, 135734 and 135749). These guide the central working area, edge shell controls and short tool pages. This update does not claim pixel-identical reconstruction.

## QuickStart tables (0.3.1)

The ten-card reader follows the original book layout. It offers 37 recommended datasets across ten categories, with an explicit review of all 145 original pages in `DATASET-CATALOGUE.md`. Chakra associations are editable philosophical suggestions and can include multiple shells. They do not determine placement automatically.

Create a table or import CSV, edit rows and columns, choose a shell, side and starting facet, then preview allocation. Allocate across consecutive facets or append ordered steps to one outward stack. All columns survive as attached data. Instructions and asset links are retained where present. Repeating allocation adds only new rows; editing a table does not silently rewrite previously allocated records. Edit those copies through the matrix record tools. JSON backups include tables, associations, records and stacks together.

Back arrows now return to a labelled logical parent. The original finite and coloured torus sections contain interactive fixed 12 by 24 geometry, actual inside/outside cameras and compact tools. Historical varying-size page IDs are retained, but their active geometry stays fixed.

Earth, satellite and space-weather integrations remain future scope, as requested. See `FUTURE-DIRECTIONS.md`.

## Everyday QuickStart and site map (0.3.2)

The reader now starts with one concrete field: date of birth. Its sequence continues through the original eight avatar questions, family, key dates, timing and signals, favourites, skills and goals. Other datasets and allocation remain available later. A family member's optional birthday also creates a dated entry in Birthdays and life events. Existing records and tables remain intact. Save-and-continue and Skip are separate choices.

Forward and backward book navigation animates a turning page. Reduced-motion preferences use immediate changes. QuickStart sheets are limited to phone width even on a desktop. Advanced table editing remains available separately; internal scrolling is a fallback for small heights, large content and the on-screen keyboard.

The site map replaces the blurred image with searchable page names and parent/child sections, five names per page, adjustable text size and a real preview. Previews cycle by arrow or swipe and open the selected original page. Every one of the 145 source pages is reachable. Previewing the site map itself does not recursively create preview frames.

These forms collect reusable everyday-life data. They do not yet deliver scheduled notifications or synchronise with an external calendar. Original archive pages outside the implemented flows can still contain design placeholders.

## Direct destinations and camera variants (0.3.3)

The old site-map tree exposed Mockplus authoring groups as navigation. Find your way now starts with 12 everyday icon shortcuts. Tapping an icon opens its destination directly; the separate magnifier previews it. Search works across all destinations, with Everyday, People, Aura, Places, Tools and All filters.

Aura Menu CK and Matrix Programmer CK are camera-background variants of the main menu and programmer, not intermediate pages. Their old URLs resolve to the corresponding normal page. Camera controls toggle a live video background on that same screen, after an explicit click and browser permission. The same menu destinations remain available. Camera tracks stop when switched off, when leaving the screen or when hiding the tab. No recording, audio request or upload is added.

The 145-page source archive remains unchanged. The public finder lists 142 destinations, omitting the two duplicate CK variants and the unnamed blank source page. The original inspector remains available for source review.

### Custom favourite pages

The original Quick Navigation page now has 25 editable favourite slots in the source positions. Empty slots stay empty until chosen. Select a destination, keep its original app icon or choose another icon from the supplied artwork, and save. Normal mode opens the page; Edit mode replaces, moves or clears the slot. Moving into an occupied position swaps the two favourites. The book below selects named shortcut menus and provides name editing and new-menu creation.

Favourites are included in the project JSON backup. Storage now uses `aura-matrix-studio:v4:project`, reading v3, v2 or v1 when v4 is absent. This keeps older app tabs from discarding new favourite-menu data; reload older tabs before continuing. This version does not change the 12 by 24 address model.
