# Toba Geometry Lab

Interactive base-geometry study using the uploaded `Rumah+Batak+Toba.dae` as the actual mesh baseline. All 50 mesh definitions, 132 instances and 50,810 source triangles are retained. No procedural replacement roof or invented enclosure is added. Source provenance and physical dimensions remain unverified.

Requires Node.js 24.

```sh
npm ci
npm run dev
```

Use a WebGL-enabled browser. Drag to orbit, scroll to zoom, and right-drag to pan. View buttons align the perspective camera; these are not orthographic measurement drawings. Layer checkboxes use provisional classifications of generically named source objects.

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

## Component inspection and group review

Click a visible mesh without dragging, or choose any of the 132 source instances from the component list. The selected instance is highlighted with a bounding box. The inspector reports its source geometry ID, triangle count, and current X/Y/Z bounding extents. These are axis-aligned extents of the entire mesh, not inferred timber section dimensions or surveyed measurements. Geometry controls update the selected dimensions immediately.

Change the display group and optionally mark that classification as checked by you. Changing a group clears its checked state. Reviews are stored locally in this browser under `toba-component-review-v1` and exported in parameter JSON (schema version 3). They are not shared with other browsers, nor treated as expert or historical validation. Reset group reviews restores original provisional classifications; reset reference parameters changes only geometric parameters. Layer visibility can hide the selected instance and clears its highlight. Selecting a hidden instance via the list still allows its metadata to be inspected; its mesh remains hidden until its group is enabled.

This release supplies selection and review as groundwork for architectural parameter rules. Existing controls remain coordinate deformations; connection-aware column spacing and member regeneration have not been implemented.

## GitHub Pages

The `Deploy GitHub Pages` workflow builds and tests `main`, uploads `dist`, and deploys using GitHub Pages. In the repository's **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. The Vite configuration uses relative asset URLs for the repository subdirectory. The expected address after a successful deployment is `https://ahmadmansurialkindii.github.io/Bolon-House-Project/`.

If the workflow does not start after enabling Pages, run **Actions → Deploy GitHub Pages → Run workflow** against `main`. This URL is not live until GitHub finishes deployment successfully.
