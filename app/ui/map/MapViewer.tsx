"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import HgssMap from "@/public/map/hgss_map_waifu2x_art_noise1_scale_waifu2x_art_noise1_scale.png";
import { RouteWithArea } from "@/app/lib/definitions"; // adjust if needed

export default function MapViewer() {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const [routes, setRoutes] = useState<RouteWithArea[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithArea | null>(null);

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

    async function loadRoutes() {
      try {
        const response = await fetch(
          `http://localhost:8080/v1/RouteEncounter/${session!.user.id}`,
          { headers: { Authorization: `Bearer ${session!.backendToken}` } },
        );
        const data: RouteWithArea[] = await response.json();

        setRoutes(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadRoutes();
  }, [session]);

  //
  // Fast lookup by route name
  //
  const routeLookup = useMemo(() => {
    return Object.fromEntries(
      routes.map((route) => [route.routeName, route])
    );
  }, [routes]);

  //
  // Load SVG
  //
  useEffect(() => {
    async function loadSvg() {
      const response = await fetch(
        "/route-overlays/hgss_map_routes_test.svg"
      );

      const svgText = await response.text();

      if (!svgContainerRef.current) {
        return;
      }

      svgContainerRef.current.innerHTML = svgText;

      const svg = svgContainerRef.current.querySelector("svg");

      if (!svg) {
        return;
      }

      svg.style.width = "100%";
      svg.style.height = "100%";

      const routeLayer = svg.querySelector("#layer3");

      if (routeLayer instanceof SVGGElement) {
        routeLayer.style.display = "block";
        routeLayer.style.opacity = "0.25";
      }

      const paths = svg.querySelectorAll("path");

      paths.forEach((path) => {
        path.style.cursor = "pointer";

        path.addEventListener("mouseenter", () => {
          path.style.fill = "#00ff00";
          path.style.opacity = "0.8";

          const routeName =
            path.getAttribute("inkscape:label") ??
            path.id;

          const route = routeLookup[routeName];

          if (route) {
            setSelectedRoute(route);
          }
        });

        path.addEventListener("mouseleave", () => {
          path.style.fill = "#aa0000";
          path.style.opacity = "1";
        });

        path.addEventListener("click", () => {
          const routeName =
            path.getAttribute("inkscape:label") ??
            path.id;

          const route = routeLookup[routeName];

          if (route) {
            setSelectedRoute(route);
          }

          console.log(route);
        });
      });
    }

    loadSvg();
  }, [routeLookup]);

  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
      }}
    >
      {/* Map */}
      <div
        style={{
          position: "relative",
          width: "1000px",
          height: "700px",
        }}
      >
        <Image
          src={HgssMap}
          alt="HGSS Map"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        <div
          ref={svgContainerRef}
          style={{
            position: "absolute",
            inset: 0,
          }}
        />
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: "350px",
          overflowY: "auto",
        }}
      >
        {selectedRoute ? (
          <>
            <h2>{selectedRoute.routeName}</h2>

            {selectedRoute.areas.map((area) => (
              <div
                key={area.areaId}
                style={{
                  marginBottom: "1.5rem",
                }}
              >
                <h3>{area.areaName}</h3>

                {area.encounters.map((encounter) => (
                  <div
                    key={`${encounter.pokedexNumber}-${encounter.encounterMethod}-${encounter.timeOfDay}`}
                  >
                    <strong>{encounter.name}</strong>
                    <br />
                    Method: {encounter.encounterMethod}
                    <br />
                    Time: {encounter.timeOfDay}
                    <br />
                    Caught: {encounter.caught ? "✅" : "❌"}
                    <hr />
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          <p>Hover over a route.</p>
        )}
      </div>
    </div>
  );
}