# Toba Geometry Lab

Interactive base-geometry study using the uploaded `Rumah+Batak+Toba.dae` as the actual mesh baseline. All 50 mesh definitions, 132 instances and 50,810 source triangles are retained. No procedural replacement roof or invented enclosure is added. Source provenance and physical dimensions remain unverified.

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

Reset restores all 132 baseline instances exactly (apart from centring and rendering precision). Export includes the repetition parameters. Bundled roof lattice/purlin geometry retains its original member counts. These are geometric exploration controls; altered column/frame arrangements are not structurally validated, and roof-frame interpolation does not guarantee contact with every curved roof member. Further architectural constraints and mesh separation are required before independently controlling every component family.

## Viewport layout

Axonometric is the initial and reset view. The canvas fills remaining screen height. Assembly layers and references open on demand beneath it, one at a time, with bounded panel scrolling. Fit model reframes the current view; Expand viewport enters browser fullscreen for the workspace where supported. The desktop sidebar scrolls separately and mobile retains a compact parameter area. Orthographic framing leaves an 8% margin around the projected model bounds.
