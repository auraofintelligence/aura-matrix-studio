# Aura Matrix Studio

A working browser prototype for arranging information on Luke Nathan Hayes' Aura matrix and making animated explanations of its transforms.

## Open it on this laptop

Double-click **Start Aura.cmd** in this folder. It opens the app at <http://127.0.0.1:4318/>. Node.js is installed on this laptop. The launcher starts a small local server in the background and reuses it when already running.

Open **Matrix Programmer** to select a cell, write a record and connect it to another record. **Tool Inventory** imports CSV datasets. **Explainer** edits and plays the animation, downloads a captioned WebM, exports PNG frames and saves the sequence for Blender. **Guide** explains the complete loop and current limits.

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

Browser state is localStorage under `aura-matrix-studio:v2:project`. No runtime network requests, account, tracking, model API or cloud storage are used. Inside/outside are address spaces, not encryption. Browser data can be cleared or evicted. Keep a downloaded backup. A GitHub Pages version shares an origin with other projects on the same account and must not be described as a secure personal vault.

## Architecture

`core.js` is independent of browser rendering: fixed lattice, continuous roll-path equations, record and link validation, CSV import and timeline interpolation. `renderer.js` draws those identities with a pinned, locally included Three.js r128. `app.js` connects the working pages and local storage. `tools/blender_import.py` translates the same geometry and timeline to Blender. No build service or package installation is required to serve the application.

The application uses relative paths and plain static assets, suitable for a GitHub Pages project URL. There is no backend to deploy. Do not put private backups, supplied source archives or personal records in the repository. `.gitignore` excludes generated test outputs and videos.

## Validation

Run `node --test tests/*.test.js`.

The suite checks the fixed dimensions, 4,032 distinct addresses, analytic closed horn geometry, wrapped neighbours, continuous/reversible seeking, 600-row CSV placement, backup round trips, malformed imports, source links and duplicate HTML IDs. It writes a cross-runtime fixture under ignored `test-results/`.

For Blender: run the importer from the Scripting workspace and choose the exported JSON. Automation can use `blender --background --python tools/blender_import.py -- explainer.json output.blend`. The importer adds a new scene and preserves existing scenes. The renderer samples the mathematical trajectory six times per second and Blender interpolates those baked poses; captions are timeline markers, not rendered text. The browser uses continuous evaluation.

See `VALIDATION.md` for the checks actually performed and remaining review gaps.

## Source and design provenance

The original screenshots govern the Matrix Programmer, Finite Map, central stage, coloured shell rail and inside/outside distinction. The present app is a focused functional slice, not a reconstruction of the complete 437-page Mockplus archive. The rejected `aura-of-intelligence-web-app` was not used.

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
