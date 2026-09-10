# Validation record

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
