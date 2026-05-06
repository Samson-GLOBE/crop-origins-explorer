# Crop Origins Explorer

Interactive web atlas of the [Crop Origins & Phylo Food](https://github.com/rubenmilla/Crop_Origins_Phylo) database (Milla 2020) — 867 food crops, their wild progenitors, biogeographic origins, climate envelopes, and (for 211 species) domestication antiquity.

## Deploy on Vercel via GitHub

1. Create a new GitHub repository (e.g. `crop-origins-explorer-v2`).
2. Drop `index.html` into the repository root and commit.
3. Go to [vercel.com/new](https://vercel.com/new), import the repository.
4. **Framework preset:** *Other*. **Build command:** *(leave empty)*. **Output directory:** *(leave empty)*. Click **Deploy**.

That's it — the file is fully self-contained: it pulls Leaflet, MarkerCluster, PapaParse, D3, fonts and the live CSV from CDNs at runtime.

## Run locally

```
python -m http.server 8000
# open http://localhost:8000
```

Or just double-click `index.html` — most modern browsers run it fine from `file://` because all assets are remote.

## Editing

- **Data source URL** lives at the top of the `<script>` block as `const CSV = …`. Point it elsewhere if you fork the dataset.
- **Realm colours / labels** are in `REALM_CLR` and `REALM_LBL`.
- **Antiquity age classes** (used to colour the Antiquity Atlas map) are in `AGE_CLASSES`.
- The whole app is one HTML file — no build step.

## Data citation

Milla, R. (2020) *Crop Origins and Phylo Food: a database and a phylogenetic tree to stimulate comparative analyses on the origins of food crops.* Global Ecology and Biogeography 29: 606–614. [doi:10.1111/geb.13057](https://doi.org/10.1111/geb.13057)
