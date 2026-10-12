"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import HgssMap from "@/public/map/hgss_map_waifu2x_art_noise1_scale_waifu2x_art_noise1_scale.png";
import { RouteWithArea } from "@/app/lib/definitions";
import { getMapPokemonById } from "@/app/lib/api";
import RouteSidebar from "@/app/ui/map/route-sidebar";

// Generated from the Inkscape source by `pnpm map:overlay` - see
// scripts/build-map-overlay.mjs.
const OVERLAY_URL = "/route-overlays/hgss_map_routes.svg";

// Route name for a path: data-route (set by the overlay build script),
// falling back to the path id.
function routeNameOf(path: SVGPathElement) {
  return path.dataset.route ?? path.id;
}

export default function MapViewer() {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const [routes, setRoutes] = useState<RouteWithArea[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithArea | null>(null);
  const [pinnedRoute, setPinnedRoute] = useState<RouteWithArea | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [svgReady, setSvgReady] = useState(false);

  // /map has no [userId] route segment - unlike /pokedex/[userId], the
  // userId here comes from whoever is logged in, not the URL.
  const { data: session } = useSession();

  //
  // Load API
  //
  useEffect(() => {
    // Session hasn't loaded yet (or user somehow isn't authenticated - proxy.ts
    // should already prevent that, but the types don't guarantee it here).
    if (!session?.user?.id || !session.backendToken) return;

    getMapPokemonById(session.user.id, session.backendToken)
      .then(setRoutes)
      .catch((error) => {
        console.error(error);
        setLoadError(true);
      });
  }, [session]);

  //
  // Fast lookup by route name
  //
  const routeLookup = useMemo(() => {
    return Object.fromEntries(
      routes.map((route) => [route.routeName, route])
    );
  }, [routes]);

  // The SVG listeners below are attached once, so they read the latest
  // lookup through a ref instead of re-running (and re-fetching the SVG)
  // every time routes change - which used to load the overlay twice.
  const routeLookupRef = useRef(routeLookup);
  useEffect(() => {
    routeLookupRef.current = routeLookup;
  }, [routeLookup]);

  //
  // Load SVG once + one delegated listener per event type
  //
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    const controller = new AbortController();

    fetch(OVERLAY_URL, { signal: controller.signal })
      .then((response) => response.text())
      .then((svgText) => {
        container.innerHTML = svgText;
        setSvgReady(true);
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error(error);
      });

    // Event delegation: instead of one listener per <path> (re-attached on
    // every reload), one listener on the container finds the path that was
    // hovered/clicked. Hover *styling* is plain CSS (.route-overlay in
    // globals.css); these only update React state.
    function routeFromEvent(event: Event) {
      const path = (event.target as Element).closest("path");
      return path ? routeLookupRef.current[routeNameOf(path)] ?? null : null;
    }

    function onMouseOver(event: Event) {
      const route = routeFromEvent(event);
      if (route) setSelectedRoute(route);
    }

    function onClick(event: Event) {
      const route = routeFromEvent(event);
      if (!route) return;
      // Clicking the already-pinned route unpins it; clicking any other
      // route (re-)pins the sidebar to it and makes sure it's visible.
      setPinnedRoute((prev) => (prev?.routeId === route.routeId ? null : route));
      setSidebarOpen(true);
    }

    // mouseover (not mouseenter) because it bubbles up to the container.
    container.addEventListener("mouseover", onMouseOver);
    container.addEventListener("click", onClick);

    return () => {
      controller.abort();
      container.removeEventListener("mouseover", onMouseOver);
      container.removeEventListener("click", onClick);
    };
  }, []);

  //
  // Keep the pinned route highlighted on the map
  //
  useEffect(() => {
    if (!svgReady || !svgContainerRef.current) return;
    svgContainerRef.current.querySelectorAll("path").forEach((path) => {
      path.toggleAttribute(
        "data-pinned",
        pinnedRoute !== null && routeNameOf(path) === pinnedRoute.routeName,
      );
    });
  }, [pinnedRoute, svgReady]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-logo text-5xl">Map</h1>

      <div className="relative">
        {/* Map: sized to the artwork's own 1504x636 ratio, so there are no
            empty bands and the overlay lines up exactly with the image. */}
        <div className="relative aspect-[1504/636] w-full overflow-hidden rounded-2xl border-2 border-panel-border bg-sky-top/40">
          <Image
            src={HgssMap}
            alt="Map of Johto and Kanto"
            fill
            sizes="(max-width: 1152px) 100vw, 1104px"
            // The map is the page's main content (its LCP element), so load
            // it right away; the static import also gives a free blurred
            // placeholder while it downloads.
            loading="eager"
            fetchPriority="high"
            placeholder="blur"
            className="object-contain"
          />
          <div ref={svgContainerRef} className="route-overlay absolute inset-0" />
        </div>

        {/* Sidebar: floats over the map's right edge on wide screens,
            sits below the map on narrow ones. */}
        {sidebarOpen ? (
          <aside className="mt-4 max-h-[70vh] overflow-y-auto rounded-2xl border border-panel-border bg-panel/95 p-4 shadow-lg lg:absolute lg:inset-y-3 lg:right-3 lg:mt-0 lg:max-h-none lg:w-80">
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Hide route panel"
                className="rounded-full px-2 py-0.5 text-xs font-semibold text-ink-muted hover:bg-ink/5 hover:text-ink"
              >
                Hide ▸
              </button>
            </div>
            {loadError ? (
              <p className="text-sm text-accent-strong">Couldn&apos;t load route data. Is the backend running?</p>
            ) : (
              <RouteSidebar
                route={pinnedRoute ?? selectedRoute}
                pinned={pinnedRoute !== null}
                onUnpin={() => setPinnedRoute(null)}
              />
            )}
          </aside>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mt-4 rounded-full border border-panel-border bg-panel px-3 py-1.5 text-xs font-semibold text-ink shadow-lg hover:bg-white lg:absolute lg:right-3 lg:top-3 lg:mt-0"
          >
            ◂ Route info
          </button>
        )}
      </div>
    </div>
  );
}
