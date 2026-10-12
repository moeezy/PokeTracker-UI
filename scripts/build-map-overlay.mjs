// Builds the lean route overlay the map page loads, from the Inkscape file.
//
//   pnpm map:overlay
//
// Re-run this after editing the routes in Inkscape. The source file embeds
// the whole map PNG as base64 (~1MB) - the page already shows that PNG via
// next/image, so shipping it again inside the SVG doubled the download.
//
// Output keeps only the route paths:
//   - drops the embedded map <image> layer and Inkscape/Sodipodi metadata
//   - turns each path's inkscape:label into data-route (MapViewer matches
//     routes on that, falling back to the path id)
//   - strips inline styles (incl. the layer's display:none) so route colors
//     come from the theme CSS, not hardcoded fills
//
// Plain string processing rather than an XML library: the input is always
// Inkscape output, so its structure is predictable - check the printed
// path count after running.

import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'public/route-overlays/hgss_map_routes_test.svg';
const OUTPUT = 'public/route-overlays/hgss_map_routes.svg';

let svg = readFileSync(SOURCE, 'utf8');
const before = svg.length;

svg = svg
  // XML prolog and Inkscape comment
  .replace(/<\?xml[^>]*\?>\s*/, '')
  .replace(/<!--[\s\S]*?-->\s*/g, '')
  // Any layer group that contains an embedded <image> (the map artwork)
  .replace(/<g\b[^>]*>\s*<image\b[\s\S]*?<\/g>\s*/g, '')
  // Editor-only elements
  .replace(/<sodipodi:namedview\b[\s\S]*?\/>\s*/g, '')
  .replace(/<defs\b[^>]*\/>\s*/g, '')
  // Route names -> data-route (must run before inkscape:* attrs are dropped)
  .replace(/inkscape:label="([^"]*)"/g, (match, label, offset, full) => {
    // Only paths carry route names; layer labels are dropped below.
    const tagStart = full.lastIndexOf('<', offset);
    return full.startsWith('<path', tagStart) ? `data-route="${label}"` : match;
  })
  // Remaining editor attributes and namespace declarations
  .replace(/\s+(inkscape|sodipodi):[\w-]+="[^"]*"/g, '')
  .replace(/\s+xmlns:(inkscape|sodipodi|xlink|svg)="[^"]*"/g, '')
  // Inline styles (the layer's display:none/opacity, each path's red fill)
  // would override the theme - MapViewer's CSS styles routes instead.
  .replace(/\s+style="[^"]*"/g, '')
  // Collapse whitespace between tags
  .replace(/>\s+</g, '><')
  .trim();

writeFileSync(OUTPUT, svg + '\n');

const pathCount = (svg.match(/<path\b/g) ?? []).length;
const routeCount = (svg.match(/data-route="/g) ?? []).length;
console.log(`${SOURCE} (${(before / 1024).toFixed(0)} KB) -> ${OUTPUT} (${(svg.length / 1024).toFixed(1)} KB)`);
console.log(`${pathCount} paths, ${routeCount} with a route name`);
if (svg.includes('<image')) console.warn('WARNING: output still contains an <image> - check the source layers.');
