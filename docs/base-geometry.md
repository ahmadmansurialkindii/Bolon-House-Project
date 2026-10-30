# Toba Batak house: base geometry specification

Scope: an explanatory parametric geometric model of one provisional Toba Batak house. Excludes motifs, ornament, structural analysis, detailed joints, internal spatial divisions and claims of construction accuracy. Derivation order is a proposed computational grammar, not a documented construction sequence.

## Coordinates

Use metres. X is transverse width, Y runs from front (0) to rear (L), and Z is vertical. Origin is the ground beneath the front floor centre. Width W and length L describe the floor rectangle; do not equate these automatically with ground-level column extents.

## Preferred silhouette reference: Hanan and Wonorahardjo, Figure 7

The additional uploaded article, *The Architecture of Batak Toba: An Expression of Living Harmoniously*, by Himasari Hanan and Surjamanto Wonorahardjo, contains a dimensioned transverse and longitudinal section on printed p. 16 (PDF p. 6), captioned “Section of the house”. This is the preferred starting reference for the base silhouette. The uploaded copy identifies Nakhara and printed pp. 11–22; year, volume and DOI remain unverified.

Dimensions read from Figure 7:

| Quantity | Drawing value | Interpretation and limitation |
|---|---|---|
| Foot height | 1.56 m | Ground datum to depicted floor/body base; not automatically clear column length |
| Body height | 1.67 m | Floor/body base to depicted body/roof transition |
| Head dimension | 2.75 m | Between the marked roof base and upper reference line in the transverse drawing; not the maximum longitudinal roof-end rise |
| Transverse dimension chain | 1.33 + 1.20 + 1.33 = 3.86 m | Between the indicated lower support/grid lines; does not establish outer wall or roof width |
| Longitudinal dimension chain | 1.80 + 2.00 + 1.80 = 5.60 m | Between indicated lower support/grid lines; does not establish overall roof or floor length |

If the vertical markers are adopted as common datums, floor Z=1.56 m, body-top Z=3.23 m, and the marked upper roof reference Z=5.98 m. These are arithmetic derivations, not independently surveyed elevations. The transverse section's longitudinal station is unspecified; do not assign its roof height to either an end or the midpoint without checking.

Keep this preset separate from the Tarigan Siallagan case below. Do not mix its 1.56 m floor datum with Tarigan's 1.75 m or assign Tarigan's 0.40 m column diameter to this house as a documented measurement.

The drawing supports outward-inclined side walls, a near-triangular transverse roof with eave flare, and a rising-ended longitudinal roof profile. Wall angles, roof curve coefficients, end elevations, overhangs and member sections require image calibration or further evidence. The drawn grid is a section representation: it does not establish a complete plan or total column count. Use independent transverse profile control points to represent the eave flare; the initial exponent-based roof equation below is only a coarse approximation.

## Evidence and parameters — separate Tarigan case

Page numbers below are printed article pages.

| Element | Parameter | Initial reference | Evidence | Status |
|---|---|---|---|---|
| Footprint | W, L | 5 m, 7 m | Tarigan et al. (2020), p. 2 reports ground-floor dimensions | Provisional mapping to floor rectangle; verify extents |
| Raised floor | hFloor | 1.75 m | Tarigan et al., pp. 2–3 | Case-specific reference |
| Columns | diameter | 0.40 m | Tarigan et al., p. 3 | Case-specific reference |
| Column layout | support coordinates | Unresolved | Tarigan et al., p. 2, Figure 2: 38 columns, eight taller and 30 to floor | Digitise plan before claiming reconstruction; do not infer a uniform grid |
| Floor beams | transverse positions | -2.5, -0.7, 0.7, 2.5 m for W=5 | Tarigan et al., pp. 4–5, Figures 8–9 | Provisional: 1.8/1.4/1.8 m spans conflict with initial 1.2 m text on p. 4 |
| Body | hBody, wall lean | Unresolved | Qualitative inclined-wall description in Tarigan et al. | Exploratory controls, no verified defaults |
| Roof | centre ridge height, front rise, rear rise | Unresolved | Napitupulu et al. (2020), p. 8: curved roof, rear end higher than front | Qualitative evidence; no calibrated values |
| Roof | eave width, overhang, transverse profile | Unresolved | Reference figures show form but do not define a measured surface | Modelling assumptions pending calibration |
| Stone supports | size and shape | Unresolved | Napitupulu et al., p. 4: batu ojahan | Schematic geometry only |

Do not combine dimensions from different houses without identifying the resulting model as a synthesis. Numerical interface bounds are software exploration limits, not established traditional limits.

## Proposed geometric derivation

1. Create a labelled floor rectangle W by L.
2. Place a support graph from explicit coordinates; attach schematic stones and cylindrical columns. Until the reference plan is digitised, any regular grid must be labelled schematic.
3. Place longitudinal beams and floor slab. Keep beam sections and slab thickness labelled assumed.
4. Generate a body envelope from lower and upper rectangular profiles. For outward wall angle theta measured from vertical, each side offset is hBody*tan(theta). Front/rear lean requires separate parameters; do not apply side-wall evidence to all facades automatically.
5. Generate a roof from a longitudinal ridge and independently controlled eave curves; connect them with transverse profiles.
6. Cap front and rear gables consistently with the roof boundaries. Keep surfaces selectable and independently hideable.

### Initial roof surface hypothesis

This is an editable mathematical approximation, not an equation derived from the papers.

For normalized longitudinal coordinate t in [0,1], define ridge elevation:

r(t) = zCentre + aFront*max(1-2*t,0)^2 + aRear*max(2*t-1,0)^2.

Here zCentre is absolute ridge elevation at mid-length. aFront and aRear independently control end rise. This curve has a continuous first derivative at the centre; its curvature may change there.

For each half-roof, let s in [0,1] run from ridge to eave. Choose half-width b(t), eave elevation e(t), and transverse exponent p >= 1:

x(s,t) = +/-s*b(t)
y(s,t) = -overhangFront + t*(L+overhangFront+overhangRear)
z(s,t) = e(t) + (r(t)-e(t))*(1-s^p).

p=1 produces straight transverse slopes. p>1 produces a rounded transverse profile. Select and calibrate against sections rather than assuming either is correct. Independent eave curves are needed; ridge end rise alone does not establish the full roof silhouette. Join the two halves along the ridge. Keep roof thickness schematic or use a display surface initially.

## Required geometric checks

- Positive dimensions and member sizes; finite surface coordinates.
- Roof ridge remains above the eaves for every sampled section.
- Front and rear gables match roof boundaries without gaps.
- Supports and beams meet their intended nodes; floor does not float above supports.
- No roof/body intersections beyond deliberate connections.
- Changes preserve component identifiers and source metadata.
- Front, side and plan views agree with the same geometry.
- Defaults reproduce the selected reference drawing within a stated tolerance after calibration; this has not yet been demonstrated.

## Prototype controls

Width, length, floor elevation, column diameter, body height, side-wall lean, centre ridge elevation, front/rear rise, eave width and front/rear overhang. Separate layers for stones, columns, floor/beams, body and roof. Include reset, front/side/plan/perspective views, wireframe and parameter export. Detailed rafters are deferred until framing evidence is sufficient.

## Sources

- Hanan, H. and Wonorahardjo, S. *The Architecture of Batak Toba: An Expression of Living Harmoniously*. Nakhara, printed pp. 11–22, especially Figure 7, p. 16. Year, volume and DOI not verified from uploaded copy.

- Tarigan, J., Hutabalian, B. and Nursyamsi, N. (2020). Study of bolon house structure as a traditional Batak Toba house on earthquake force. IOP Conference Series: Materials Science and Engineering 725, 012030. https://doi.org/10.1088/1757-899X/725/1/012030
- Napitupulu, N., Aritonang, E. and Silitonga, S. (2020). The Study About The Comparation Between Batak Toba Traditional House in Huta Raja Samosir and Lumban Binanga Toba Samosir. IOP Conference Series: Earth and Environmental Science 452, 012052. https://doi.org/10.1088/1755-1315/452/1/012052

Source claims are based on the uploaded copies. This specification does not establish structural safety or universal Toba Batak proportions.

## Uploaded COLLADA inspection

`Rumah+Batak+Toba.dae` was parsed successfully. It declares metre units and Y-up, contains 50 geometry definitions and 132 geometry instances, and has generic node names. Export metadata identifies Assimp and THREE.GLTFExporter r186, indicating conversion rather than an untouched native SketchUp export.

The matrices contain affine translations in the last column of their written rows. The inspection explicitly reads these as row-major matrices; this is nonstandard relative to COLLADA's column-major serialization. The resulting projections resemble the SKP preview. Cross-checking one known measurement remains necessary before accepting physical dimensions or trusting a standard importer.

Under that interpretation, all-geometry bounds span approximately 8.20 m (X), 11.693 m vertically (Y), and 15.186 m (Z). These are complete scene bounds, including projections/overhangs and any auxiliary geometry, not established floor dimensions. Do not equate the 8.20 m scene extent with the 8.20 m plan length from a separate reference.

Saved inspection artifacts in `research/`: `dae-inspection.json` records per-instance bounds; `dae-projections.png` shows vertex projections. These are model observations, not survey measurements. Roof silhouette and support positions can now be inspected directly; component classification, physical scale and provenance remain unverified.

## Implementation revision: DAE is now the actual baseline

The application now uses the uploaded DAE geometry directly via `public/models/toba-baseline.json`; this supersedes the earlier implementation note saying the DAE was only a visual reference. The converter retains all 50 geometry definitions, 132 instance transforms, and 50,810 triangles. At reset, source vertices are preserved except for horizontal centring and Float32 rendering precision. Materials are neutral display colours; layer classification is provisional.

The original procedural roof and support generators are no longer used by the interface. Controls scale source coordinates horizontally and deform vertical coordinates continuously around the model-derived 2.23 m floor-top and 4.30 m upper-beam-top datums. This retains mesh topology but is an exploratory deformation system, not a validated architectural grammar. It does not introduce new walls or missing components. The source's approximately 0.25 m column diameter is retained independently of the earlier 0.20 m plan-symbol estimate.
