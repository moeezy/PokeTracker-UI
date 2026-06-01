"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import HgssMap from "@/public/map/hgss_map_waifu2x_art_noise1_scale_waifu2x_art_noise1_scale.png"


export default function MapViewer() {
  const svgContainerRef = useRef<HTMLDivElement>(null);

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

      //
      // Make SVG fill container
      //
      svg.style.width = "100%";
      svg.style.height = "100%";

      //
      // Find route layer
      //
      const routeLayer = svg.querySelector("#layer3");

      if (routeLayer instanceof SVGGElement) {
        routeLayer.style.display = "block";
        routeLayer.style.opacity = "0.25";
      }

      //
      // Find every route path
      //
      const paths = svg.querySelectorAll("path");

      paths.forEach((path) => {
        path.style.cursor = "pointer";

        path.addEventListener("mouseenter", () => {
          path.style.fill = "#00ff00";
          path.style.opacity = "0.8";
        });

        path.addEventListener("mouseleave", () => {
          path.style.fill = "#aa0000";
          path.style.opacity = "1";
        });

        path.addEventListener("click", () => {
          const routeName =
            path.getAttribute("inkscape:label") ??
            path.id ??
            "unknown route";

          console.log("Clicked:", routeName);
        });
      });
    }

    loadSvg();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "1000px",
        height: "700px",
      }}
    >
      {/* Base map */}
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

      {/* SVG overlay */}
      <div
        ref={svgContainerRef}
        style={{
          position: "absolute",
          inset: 0,
        }}
      />
    </div>
  );
}