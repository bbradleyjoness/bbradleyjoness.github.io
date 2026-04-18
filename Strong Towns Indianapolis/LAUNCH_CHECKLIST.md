# Strong Towns Indianapolis Launch Checklist

Last updated: 2026-04-12

This checklist is based on the current state of the project in this workspace. It is organized to get the site from "close to ready" to publishable with the fewest surprises.

## 1. Hard Blockers

- [ ] Replace the missing favicon asset.
  `index.html` references `./assets/images/logo.png`, but that file does not exist.
  Reference: `index.html:54`

- [ ] Finalize the actual logo assets.
  The header logo is currently using `about-photo.jpeg`, and the light/dark swap points to the same image in both modes.
  References: `index.html:1397-1400`, `index.html:1739-1740`

- [ ] Replace the placeholder about image with the real photo.
  The about section still uses `./assets/images/about-photo-placeholder.svg` even though `assets/images/about-photo.jpeg` exists.
  Reference: `index.html:1422`

- [ ] Replace demo project data in the live map feed with real project records.
  The Google Apps Script endpoint is live, but the current payload includes placeholder content such as `example.org` links and `placehold.co` images.
  References: `index.html:2343-2398`, `index.html:2646-2658`

- [ ] Verify the public Google Form experience in an incognito browser.
  The current form URL returned a Google sign-in / cookie-access interstitial during audit. If visitors see that, the main CTA flow is blocked.
  Reference: `index.html:1704-1732`

- [ ] Initialize a real git repository if this folder is the publish source.
  This workspace is not currently inside a git repo, so there is nowhere to push from yet.

## 2. Pre-Launch Setup

- [ ] Pick the deployment target.
  Choose one of:
  GitHub Pages
  Netlify
  Vercel

- [ ] Add host-specific deployment files only after the host is chosen.
  Current audit found none of the usual setup files:
  `CNAME`
  `netlify.toml`
  `vercel.json`
  `.nojekyll`
  `_redirects`

- [ ] Attach the real production domain once hosting is chosen.
  Suggested target based on code comments and bot strings: `strongtownsindy.org`

- [ ] Restrict the MapTiler key to the production domain.
  The key is hardcoded client-side, so it should be domain-restricted before launch.
  Reference: `index.html:1742`

- [ ] Confirm the Google Apps Script endpoint allows public read access from the deployed site origin.
  The map depends on this JSON feed to render projects.
  Reference: `index.html:2343-2398`

- [ ] Confirm the Google Form allows anonymous public submissions.
  The contact flow depends on it opening for any visitor.
  Reference: `index.html:1704-1732`

- [ ] Decide whether to keep the footer credit on production as-is.
  Reference: `index.html:1694-1696`

## 3. Content Readiness

- [ ] Finalize the project count message if you want a polished first paint.
  It currently starts as `Projects mapped: XX and growing` before JS replaces it.
  Reference: `index.html:1416-1418`

- [ ] Replace any remaining placeholder project media in the sheet-backed data source.
  Project cards currently support real photos, but placeholder remote images are still acceptable if left in the feed.
  Reference: `index.html:2654-2658`

- [ ] Review organizer and news URLs inside the project feed.
  Every project detail panel can surface those links directly to users.
  Reference: `index.html:2645-2651`

- [ ] Decide whether the local news section is launch content or "nice to have".
  Good news: the news feed itself is populated and the refresh workflow already exists.
  References: `assets/data/news.json`, `.github/workflows/update-news.yml`

## 4. SEO And Share Preview

- [ ] Add a meta description.
  Right now the page only has a `<title>`.
  Reference: `index.html:48`

- [ ] Add Open Graph metadata.
  Recommended:
  `og:title`
  `og:description`
  `og:image`
  `og:url`
  `og:type`

- [ ] Add Twitter card metadata.
  Recommended:
  `twitter:card`
  `twitter:title`
  `twitter:description`
  `twitter:image`

- [ ] Add a canonical URL.

- [ ] Add `robots.txt`.

- [ ] Add `sitemap.xml`.

- [ ] Add a social/share image asset once the logo and visual direction are finalized.

## 5. Browser QA Before Publish

- [ ] Desktop home page loads with no missing images.

- [ ] Mobile layout looks good at narrow widths.
  Pay special attention to:
  hero/about section
  map panel layout
  CTA rows
  contact form spacing

- [ ] Dark mode and auto mode both work correctly.
  Check:
  page colors
  map base layer swap
  logo swap

- [ ] Map loads successfully on first visit.

- [ ] Map filters work for every visible status.

- [ ] Marker click opens the side panel and updates the URL hash.

- [ ] Direct hash links work.
  Example format:
  `/#STI-001`

- [ ] "View on map" links in the Project Pipeline section jump to the correct marker.

- [ ] "Locate me" works when browser permission is granted.

- [ ] Search returns usable results and centers the map correctly.

- [ ] Contact buttons prefill the expected reason and project reference.

- [ ] The "Open full form" button launches the real public form for an anonymous visitor.

- [ ] Local news cards load and paginate.

- [ ] Broken or slow third-party services fail gracefully.
  Check:
  project feed unavailable
  news feed unavailable
  geocoding unavailable

## 6. Launch-Day Technical Checks

- [ ] Open the production URL in an incognito window and do a full smoke test.

- [ ] Test on at least:
  Safari
  Chrome
  iPhone Safari

- [ ] Validate there are no mixed-content or obvious console errors.

- [ ] Confirm the domain resolves correctly with and without `www` if applicable.

- [ ] Confirm the final favicon appears in the browser tab.

- [ ] Share the live URL in iMessage, Slack, and a social card debugger to verify the preview image and description.

## 7. Nice-To-Have After Publish

- [ ] Add custom dark-mode map styling beyond default MapTiler styles.

- [ ] Add supporter or sponsor section if the chapter wants visible asks on-site.

- [ ] Replace generic map dots with project-type-specific icons.

- [ ] Add background revalidation or smarter cache strategy for project data.

- [ ] Add richer project fields like start date, last updated date, or organizer details.

- [ ] Add optional interaction features such as community voting, "near me," or seasonal map modes.

## Suggested Publish Order

1. Finalize logo, favicon, and about image.
2. Replace demo map data with real records in the sheet-backed feed.
3. Verify the public Google Form and Apps Script access in an incognito browser.
4. Add SEO/share metadata and the social preview image.
5. Choose hosting, initialize git, and connect the domain.
6. Run the browser QA checklist.
7. Publish and run the launch-day checks.
