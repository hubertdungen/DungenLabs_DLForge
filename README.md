# DL Forge

React portfolio for the DungenLabs software, games and mods division. DL X covers physical research, hardware, printed parts and its shop.

## Development

Use Node.js 22 or later. Run `npm ci`, then `npm run dev`. `npm run build` produces the static site in `dist/`; `npm run preview` serves the production build.

## Publication

The intended primary URL is https://dlforge.dungenlabs.com/. Netlify settings are tracked in `netlify.toml`; the site has no backend or external runtime assets.

While the new Netlify project and domain require renewed account access, the complete site is published through the existing DungenLabs Git deployment at https://dungenlabs.com/forge/. Build that version with `npm run build -- --base=/forge/`, then publish `dist/` into the main website's `forge/` directory. `forge/build.json` records the exact source commit and output hashes. Root and subdirectory deployments use the same source.

## Content and validation

The catalogue contains 12 project case files, English and Portuguese copy, screenshots, category filters and the SpaceBourne 2 mod roster. Source and download links identify each project's own licence. The partners are Z89 Develop and Hexrig; Hexrig's wordmark image is a capture of its storefront header.

The site maker was Claude Opus 5.5 at high effort. Codex handled integration, deployment and browser verification. Mobile and desktop checks cover the filters, galleries, keyboard close, language switching, menu, partner dimensions, loaded images, browser errors and horizontal overflow.

See [the brand migration report](docs/brand-migration.md) for the 36 software repository PRs and existing website changes. Existing project logos, third-party marks and screenshots remain attributable to their respective owners.
