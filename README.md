# Toba Geometry Lab

Interactive base-geometry study using the uploaded `Rumah+Batak+Toba.dae` as the actual mesh baseline. The 50 source mesh definitions and 132 placements are retained geometrically, with disconnected pieces separated for individual editing. The baseline renders 252 editable pieces. The source has 50,810 triangles across its unique mesh definitions; instance reuse adds further placed triangles. No procedural replacement roof or invented enclosure is added. Source provenance and physical dimensions remain unverified.

Requires Node.js 24.

```sh
npm ci
npm run dev
```

Use a WebGL-enabled browser. Drag to orbit, scroll to zoom, and right-drag to pan. 3D uses perspective. Axon uses an orthographic isometric starting orientation with orbit controls. Front, Side and Plan use orthographic projection with pan and zoom (rotation locked). These views show model-space geometry, not independently verified survey drawings. Layer checkboxes use provisional classifications of generically named source objects.

Width/length controls scale the source mesh horizontally. Vertical controls continuously rescale the source around model-derived floor-top (2.23 m) and upper-beam-top (4.30 m) datums. They preserve the source topology and do not constitute a validated shape grammar or structural analysis. Reset restores the source geometry with only horizontal centring and rendering precision differences. Source columns are approximately 0.25 m in diameter; the 0.20 m estimate from a different plan is not imposed on them.

```sh
npm test
npm run build
```

The bundled mesh asset is self-contained at `public/models/toba-baseline.json`. Reproduce conversion with:

```sh
python3 scripts/convert_dae.py /path/to/Rumah+Batak+Toba.dae public/models/toba-baseline.json
```

The supplied converted DAE writes transforms row-major, so the converter retains them and the app explicitly interprets their ordering. Source materials are replaced by neutral assembly colours. Coordinates, triangle connectivity and instance transforms are preserved. Overall bounds include the source ground slab and roof projections, not just the floor. Downloaded parameter JSON records its source and unverified scale. The application needs no remote assets or credentials.

Earlier procedural geometry utilities remain as research experiments; the application entry point exclusively uses the DAE baseline.

## GitHub Pages

The `Deploy GitHub Pages` workflow builds and tests `main`, uploads `dist`, and deploys using GitHub Pages. In the repository's **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. The Vite configuration uses relative asset URLs for the repository subdirectory. The expected address after a successful deployment is `https://ahmadmansurialkindii.github.io/Bolon-House-Project/`.

If the workflow does not start after enabling Pages, run **Actions → Deploy GitHub Pages → Run workflow** against `main`. This URL is not live until GitHub finishes deployment successfully.

## Component repetition

The preset dropdown and source-component metadata panel have been removed. Click-to-highlight remains available in the viewport. Browser-saved grouping reviews from older releases are no longer applied.

- Columns per side row: 3–17. The two side rows are regenerated from the nearest original column templates; matching stone supports follow the same station coordinates. End-face and interior posts remain unchanged. The live total includes those retained posts. Longitudinal connecting members retain their source geometry.
- Roof frame count: 3–15 complete transverse frames, each with four source-derived members. New frame sections interpolate corresponding vertices between the five original source frames. This preserves the existing span, not a fixed spacing.
- Target roof-frame spacing: chooses the nearest permitted integer frame count; actual equal spacing is displayed and changes with longitudinal scale. It may differ from the requested target because the source endpoints remain fixed.

Reset restores the original 132 placements geometrically as 252 separated pieces (apart from centring and rendering precision). Export includes the repetition parameters. Bundled roof lattice/purlin geometry retains its original member counts. These are geometric exploration controls; altered column/frame arrangements are not structurally validated, and roof-frame interpolation does not guarantee contact with every curved roof member. Further architectural constraints and mesh separation are required before independently controlling every component family.

## Viewport layout

Axonometric is the initial and reset view. The canvas fills remaining screen height. Assembly layers and references open on demand beneath it, one at a time, with bounded panel scrolling. Fit model reframes the current view; Expand viewport enters browser fullscreen for the workspace where supported. The desktop sidebar scrolls separately and mobile retains a compact parameter area. Orthographic framing leaves an 8% margin around the projected model bounds.

## Individual element parameters

Open **Individual elements**, choose an assembly and element, or click a visible piece in the viewport. All 252 connected pieces in the baseline have controls for:

- Transverse, vertical and longitudinal bounding size (metres, before individual rotation).
- X/Y/Z translation and rotation about the piece centre.
- Copy count (0–12), copy direction and centre-to-centre spacing. Zero removes the piece; the chooser still allows it to be restored.
- Reset this element; the global reset clears all element edits and returns to the DAE baseline.

Connected triangle islands are found by welding coordinate matches at a 0.00001-model-unit tolerance for connectivity analysis only. Source vertices and triangles are retained without simplification. A connected island can contain touching or joined architectural members; these remain one editable piece. This is geometry editing across all assemblies, not a semantic joint-preserving grammar or structural solver. Local edits can detach members or create collisions. Repetition controls remain source-based; changing the global row/frame counts changes which generated-piece IDs exist. Edits are associated with stable piece IDs, not abstract construction roles.

**Export parameters** downloads schema-version-4 JSON containing global parameters and local overrides. **Import parameters** restores supported values for the current model, with validation before changing the scene. The importer applies local edits whose IDs exist under the imported row/frame counts. Browser reload does not automatically retain local edits; export before leaving. No source mesh metadata table is shown in the interface.
