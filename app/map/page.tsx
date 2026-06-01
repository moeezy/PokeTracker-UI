import Image from "next/image";
import { Route } from "@/app/lib/definitions";
import { getRoutes } from "@/app/lib/api";
import HgssMap from "@/public/map/hgss_map_waifu2x_art_noise1_scale_waifu2x_art_noise1_scale.png"
import HgssOverlay from "@/public/route-overlays/hgss_map_routes_test.svg"
import MapViewer from "../ui/map/MapViewer";

export default async function Page() {
  const routes: Route[] = await getRoutes();
   return (
    <main className="p-4">
      <MapViewer />
    </main>
  );
}