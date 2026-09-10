# Aura market map

The five original marketplace sections now open category maps. Search by Map, Name and Service use the same filtered records. Gold pins come from the original Alliance planning list; blue pins come from Affinity discoveries. Neither is evidence of current membership or a verified service.

The snapshot comes from the `aura-alliance` and `aura-affinity` layers in [Aura Horn Torus](https://auraofintelligence.github.io/aura-horn-torus/). The automated discovery source is [Aura Affinity](https://auraofintelligence.github.io/aura-affinity/). Other Horn Torus layers, such as universities and diplomatic offices, are outside these marketplace categories.

## Filtering

The 322 Alliance source records become 316 distinct locations after six exact duplicates are combined. The curated source categories for hotels, resorts, hospitals and event spaces are retained.

Of 19,636 Affinity source records, 10,528 match a whole word in their actual name: Aura, Chakra, Aurora, Gajra, Yoga or Tai Chi. Accents and case are normalised. The remaining 9,108 are held out of this map. This conservative rule can omit relevant businesses with joined words or names in other scripts; they remain in the unchanged source for later review.

Affinity's old categories were produced with substring searches, so fragments such as `art` in `restaurant` could cause false matches. This map uses whole name words to suggest categories. Names without clear category evidence stay in Other / to review. These are suggestions, not verified classifications.

Only the two source business layers are read. Names, coordinates, source category and source attribution are retained; reviews and contact details are not copied. Source file hashes and import dates are included in `assets/market-data.json`.

## Refreshing

Run `python tools/build_market_data.py` from this repository with the neighbouring Horn Torus repository available. This is an offline conversion and does not call Google APIs. Publish the resulting snapshot with the app. The upstream Affinity automation and its source CSV are unchanged by this release.

The map uses locally bundled [Leaflet 1.9.4](https://leafletjs.com/download.html) and interactive OpenStreetMap tiles with visible attribution. It follows the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/); there is no bulk download or offline tile prefetch feature.
