# Toba Geometry Lab

Interactive base-geometry study using the uploaded `Rumah+Batak+Toba.dae` as the actual mesh baseline. The 50 source mesh definitions and 132 placements are retained geometrically, with disconnected pieces separated for family-based regeneration. The baseline renders 252 geometric pieces. The source has 50,810 triangles across its unique mesh definitions; instance reuse adds further placed triangles. No procedural replacement roof or invented enclosure is added. Source provenance and physical dimensions remain unverified.

Requires Node.js 24.

```sh
npm ci
npm run dev
```

Use a WebGL-enabled browser. Drag to orbit, scroll to zoom, and right-drag to pan. 3D uses perspective. Axon uses an orthographic axonometric starting orientation at approximately 16° elevation and 55° azimuth, guided by the supplied reference image with orbit controls. Front, Side and Plan use orthographic projection with pan and zoom (rotation locked). These views show model-space geometry, not independently verified survey drawings. Layer checkboxes use provisional classifications of generically named source objects.

Width/length controls scale the source mesh horizontally. Vertical controls continuously rescale the source around model-derived floor-top (2.23 m) and upper-beam-top (4.30 m) datums. They preserve the source topology and do not constitute a validated shape grammar or structural analysis. Reset restores the source geometry with only horizontal centring and rendering precision differences. Source columns are approximately 0.25 m in diameter; the 0.20 m estimate from a different plan is not imposed on them.

```sh
npm test
npm run build
```

The bundled mesh asset is self-contained at `public/models/toba-baseline.json`. Reproduce conversion with:

```sh
python3 scripts/convert_dae.py /path/to/Rumah+Batak+Toba.dae public/models/toba-baseline.json
```

The supplied converted DAE writes transforms row-major, so the converter retains them and the app explicitly interprets their ordering. Source materials are replaced by neutral assembly colours. Coordinates, triangle connectivity and instance transforms are preserved. Overall bounds include the source ground slab and roof projections, not just the floor. The application needs no remote assets or credentials.

Earlier procedural geometry utilities remain as research experiments; the application entry point exclusively uses the DAE baseline.

## GitHub Pages

The `Deploy GitHub Pages` workflow builds and tests `main`, uploads `dist`, and deploys using GitHub Pages. In the repository's **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. The Vite configuration uses relative asset URLs for the repository subdirectory. The expected address after a successful deployment is `https://ahmadmansurialkindii.github.io/Bolon-House-Project/`.

If the workflow does not start after enabling Pages, run **Actions → Deploy GitHub Pages → Run workflow** against `main`. This URL is not live until GitHub finishes deployment successfully.

## Component repetition

The preset dropdown and source-component metadata panel have been removed. Click-to-highlight remains available in the viewport. Browser-saved grouping reviews from older releases are no longer applied.

- Columns per side row: 3–17. The two side rows are regenerated from the nearest original column templates; matching stone supports follow the same station coordinates. End-face and interior posts remain unchanged. The live total includes those retained posts. Longitudinal connecting members retain their source geometry.
- Roof frame count: 3–15 complete transverse frames, each with four source-derived members. New frame sections interpolate corresponding vertices between the five original source frames. This preserves the existing span, not a fixed spacing.
- Target roof-frame spacing: chooses the nearest permitted integer frame count; actual equal spacing is displayed and changes with longitudinal scale. It may differ from the requested target because the source endpoints remain fixed.

Reset restores the original 132 placements geometrically as 252 separated pieces (apart from centring and rendering precision). Identified roof rib and longitudinal-member families have separate count sliders. Connected roof pieces outside those families retain their source counts. These are geometric exploration controls; altered column/frame arrangements are not structurally validated, and roof-frame interpolation does not guarantee contact with every curved roof member. Further architectural constraints are needed to ensure joints remain connected after changes.

## Viewport layout

Axonometric is the startup view. Slider changes, geometry regeneration, parameter reset/import, and viewport resizing preserve the current camera orbit, pan and zoom. Geometry updates explicitly snapshot and restore camera pose and orbit target. Orbit inertia is disabled so movement stops when the pointer is released. Explicit view buttons and Fit model reframe the camera. The canvas fills remaining screen height. Assembly layers open on demand beneath it, with bounded panel scrolling. The References panel and Export parameters button have been removed. Fit model reframes the current view; Expand viewport enters browser fullscreen for the workspace where supported. The desktop sidebar scrolls separately and mobile retains a compact parameter area. Orthographic framing leaves an 8% margin around the projected model bounds.


## Component-family sliders

The interface now uses family sliders instead of the individual transform/copy editor. The source geometry remains the baseline. Controls include:

| Family | Sliders |
| --- | --- |
| Columns and stones | Columns per side row, column diameter, stone width/height scales |
| Lower connecting members | Tie-level count, tie section scale |
| Floor and upper beams | Independent lower-round and upper-longitudinal member counts and section scales; floor thickness; beam-cap size |
| Roof | Frame count, transverse ribs per side, longitudinal members per side |
| Stairs | Tread count, stair width, tread thickness |
| Overall proportions | Width, length, floor elevation, body span and roof height scales |

Roof frame spacing is also a slider. Counts resample the original station spans; changing house dimensions changes resulting spacing. Baseline roof rib and longitudinal-member counts are 27 and 33 per side. Lower ties form five series with four levels each; longitudinal beams have independent lower-round (source IDs 5/11) and upper-beam (10/27) controls, each defaulting to two members. Outer edge members (13/14) remain at their original pair count and section. Stair treads begin at seven. Source end-face/internal columns and connected roof pieces outside identified repeat families retain their counts.

Resampling places source templates at interpolated centre positions and bounding sizes, preserving topology. Roof frame interpolation separately uses corresponding source vertices. Modified ribs/battens are exploratory approximations and are not guaranteed to contact every adjacent curved member. Section scales are axis-based approximations, not engineered timber-section calculations; local joints and collisions are not solved. Default sliders restore all source geometry, with only horizontal centring and rendering precision differences.

Import supports family parameter files; exporting is no longer exposed in the interface. Legacy `beamRowCount` values map to the lower-round and upper-beam counts when explicit new values are absent. Removed roof-section, outer-edge and ground-base settings are ignored; those families retain their baseline geometry under family-specific edits. Earlier files without individual overrides can load with default values for new sliders. Files containing the former individual transform overrides are rejected with an explanation instead of silently discarding those edits. Click-to-highlight remains; the manual element editor and source-metadata panel are absent.
